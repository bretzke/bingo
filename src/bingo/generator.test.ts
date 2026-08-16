import { describe, expect, it } from "vitest";
import {
  CARDS_PER_SHEET,
  COLS,
  COLUMN_RANGES,
  COLUMN_SIZES,
  MAX_PER_COLUMN,
  NUMBERS_PER_CARD,
  NUMBERS_PER_ROW,
  ROWS,
} from "./constants";
import { generateSheet, generateSheets } from "./generator";
import { cardNumbers, validateSheet } from "./validate";
import type { Card, Sheet } from "./types";

function filledInColumn(card: Card, col: number): number[] {
  return card.map((row) => row[col]).filter((value): value is number => value !== null);
}

function occupancySignature(card: Card): string {
  return Array.from({ length: COLS }, (_, col) => filledInColumn(card, col).length).join("");
}

function sheetSignature(sheet: Sheet): string {
  return sheet
    .map((card) => cardNumbers(card).join(","))
    .join("|");
}

function columnCountPattern(card: Card): string {
  const counts = [0, 0, 0];
  for (let col = 0; col < COLS; col += 1) {
    const filled = filledInColumn(card, col).length;
    counts[filled] = (counts[filled] ?? 0) + 1;
  }
  return `${counts[2]}-double/${counts[1]}-single/${counts[0]}-empty`;
}

describe("bingo sheet generator", () => {
  it("generates a valid sheet", () => {
    const sheet = generateSheet();
    expect(() => validateSheet(sheet)).not.toThrow();
  });

  it("always returns six 3x9 cards", () => {
    const sheet = generateSheet();
    expect(sheet).toHaveLength(CARDS_PER_SHEET);
    for (const card of sheet) {
      expect(card).toHaveLength(ROWS);
      expect(card.every((row) => row.length === COLS)).toBe(true);
    }
  });

  it("uses each number from 1 to 90 exactly once on a sheet", () => {
    const sheet = generateSheet();
    const numbers = sheet.flatMap(cardNumbers).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 90 }, (_, index) => index + 1));
  });

  it("gives every card 15 unique numbers and 5 numbers per row", () => {
    const sheet = generateSheet();
    for (const card of sheet) {
      const numbers = cardNumbers(card);
      expect(numbers).toHaveLength(NUMBERS_PER_CARD);
      expect(new Set(numbers).size).toBe(NUMBERS_PER_CARD);
      for (const row of card) {
        expect(row.filter((value) => value !== null)).toHaveLength(NUMBERS_PER_ROW);
        expect(row.filter((value) => value === null)).toHaveLength(COLS - NUMBERS_PER_ROW);
      }
    }
  });

  it("keeps numbers inside their decade columns and sorted top to bottom", () => {
    const sheet = generateSheet();
    for (const card of sheet) {
      for (let col = 0; col < COLS; col += 1) {
        const [start, end] = COLUMN_RANGES[col] ?? [0, 0];
        const values = filledInColumn(card, col);
        expect(values.every((value) => value >= start && value <= end)).toBe(true);
        expect(values).toEqual([...values].sort((a, b) => a - b));
      }
    }
  });

  it("never fills all three rows in the same column", () => {
    const sheets = generateSheets(80);
    for (const sheet of sheets) {
      for (const card of sheet) {
        for (let col = 0; col < COLS; col += 1) {
          expect(filledInColumn(card, col).length).toBeLessThanOrEqual(MAX_PER_COLUMN);
        }
      }
    }
  });

  it("uses every number of each decade across the six cards", () => {
    const sheet = generateSheet();
    for (let col = 0; col < COLS; col += 1) {
      const [start, end] = COLUMN_RANGES[col] ?? [0, 0];
      const values = sheet
        .flatMap((card) => filledInColumn(card, col))
        .sort((a, b) => a - b);
      const expected = Array.from({ length: end - start + 1 }, (_, index) => start + index);
      expect(values).toEqual(expected);
      expect(values).toHaveLength(COLUMN_SIZES[col] ?? 0);
    }
  });

  it("never repeats a number between cards of the same sheet", () => {
    const sheet = generateSheet();
    const seen = new Set<number>();
    for (const card of sheet) {
      for (const value of cardNumbers(card)) {
        expect(seen.has(value)).toBe(false);
        seen.add(value);
      }
    }
  });

  it("only uses valid occupancy patterns with at most two numbers per column", () => {
    const sheets = generateSheets(60);
    const patterns = new Set<string>();

    for (const sheet of sheets) {
      for (const card of sheet) {
        const pattern = columnCountPattern(card);
        patterns.add(pattern);
        expect(["6-double/3-single/0-empty", "7-double/1-single/1-empty"]).toContain(pattern);
      }
    }

    expect(patterns.size).toBeGreaterThan(1);
  });

  it("generates many valid random sheets", () => {
    const sheets = generateSheets(200);
    expect(sheets).toHaveLength(200);
    for (const sheet of sheets) {
      expect(() => validateSheet(sheet)).not.toThrow();
    }
  });

  it("throws when the sheet count is invalid", () => {
    expect(() => generateSheets(0)).toThrow("Sheet count must be at least 1");
    expect(() => generateSheets(-3)).toThrow("Sheet count must be at least 1");
  });

  it("does not repeat the same sheet in a consecutive batch", () => {
    const sheets = generateSheets(20);
    const signatures = sheets.map(sheetSignature);
    expect(new Set(signatures).size).toBe(sheets.length);
  });

  it("varies the occupancy layout instead of using a single template", () => {
    const signatures = new Set<string>();
    for (let i = 0; i < 40; i += 1) {
      const sheet = generateSheet();
      signatures.add(sheet.map(occupancySignature).join("|"));
    }
    expect(signatures.size).toBeGreaterThan(10);
  });

  it("distributes the same number across different cards", () => {
    const sample = 180;
    const tracked = [1, 45, 52, 90];
    const hits = Object.fromEntries(tracked.map((value) => [value, [0, 0, 0, 0, 0, 0]])) as Record<
      number,
      number[]
    >;

    for (let i = 0; i < sample; i += 1) {
      const sheet = generateSheet();
      sheet.forEach((card, cardIndex) => {
        const numbers = cardNumbers(card);
        for (const value of tracked) {
          if (numbers.includes(value)) {
            hits[value]![cardIndex] += 1;
          }
        }
      });
    }

    for (const value of tracked) {
      const distribution = hits[value] ?? [];
      expect(distribution.reduce((sum, count) => sum + count, 0)).toBe(sample);
      expect(Math.min(...distribution)).toBeGreaterThan(sample * 0.06);
      expect(Math.max(...distribution)).toBeLessThan(sample * 0.32);
    }
  });

  it("places the same number on different rows across sheets", () => {
    const rowsForOne = new Set<number>();
    const rowsForNinety = new Set<number>();

    for (let i = 0; i < 120; i += 1) {
      const sheet = generateSheet();
      for (const card of sheet) {
        card.forEach((row, rowIndex) => {
          if (row.includes(1)) rowsForOne.add(rowIndex);
          if (row.includes(90)) rowsForNinety.add(rowIndex);
        });
      }
    }

    expect(rowsForOne.size).toBeGreaterThanOrEqual(2);
    expect(rowsForNinety.size).toBeGreaterThanOrEqual(2);
  });

  it("does not concentrate high numbers on the first cards", () => {
    const totals = [0, 0, 0, 0, 0, 0];
    const sample = 80;

    for (let i = 0; i < sample; i += 1) {
      const sheet = generateSheet();
      sheet.forEach((card, cardIndex) => {
        totals[cardIndex] += cardNumbers(card).reduce((sum, value) => sum + value, 0);
      });
    }

    const averages = totals.map((total) => total / sample);
    const expected = (90 * 91) / 2 / CARDS_PER_SHEET;
    for (const average of averages) {
      expect(average).toBeGreaterThan(expected * 0.85);
      expect(average).toBeLessThan(expected * 1.15);
    }
  });
});
