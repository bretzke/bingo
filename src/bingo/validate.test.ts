import { describe, expect, it } from "vitest";
import { generateSheet } from "./generator";
import type { Card, Sheet } from "./types";
import { cardNumbers, validateSheet } from "./validate";

function cloneSheet(sheet: Sheet): Sheet {
  return sheet.map((card) => card.map((row) => [...row]));
}

describe("sheet validation", () => {
  it("accepts a generated sheet", () => {
    expect(() => validateSheet(generateSheet())).not.toThrow();
  });

  it("extracts only filled numbers from a card", () => {
    const card: Card = [
      [1, null, 20, null, 40, null, 60, null, 80],
      [2, null, 21, null, 41, null, 61, null, 81],
      [null, 10, null, 30, null, 50, null, 70, null],
    ];
    expect(cardNumbers(card)).toEqual([1, 20, 40, 60, 80, 2, 21, 41, 61, 81, 10, 30, 50, 70]);
  });

  it("rejects a sheet that does not have six cards", () => {
    const sheet = generateSheet().slice(0, 5);
    expect(() => validateSheet(sheet)).toThrow("Sheet must have 6 cards");
  });

  it("rejects a card that is not 3x9", () => {
    const sheet = cloneSheet(generateSheet());
    sheet[0] = [[1, 2, 3]];
    expect(() => validateSheet(sheet)).toThrow("Card must be 3x9");
  });

  it("rejects a duplicated number on the same sheet", () => {
    const sheet = cloneSheet(generateSheet());
    const firstCard = sheet[0];
    const secondCard = sheet[1];
    if (!firstCard || !secondCard) {
      throw new Error("Missing cards");
    }

    const donor = firstCard[0]?.find((value) => value !== null);
    const targetRow = secondCard[0];
    const targetIndex = targetRow?.findIndex((value) => value !== null) ?? -1;
    if (donor === undefined || !targetRow || targetIndex < 0) {
      throw new Error("Could not plant a duplicate");
    }

    targetRow[targetIndex] = donor;
    expect(() => validateSheet(sheet)).toThrow();
  });

  it("rejects a row that does not have five numbers", () => {
    const sheet = cloneSheet(generateSheet());
    const firstRow = sheet[0]?.[0];
    const secondRow = sheet[0]?.[1];
    const from = firstRow?.findIndex((value) => value !== null) ?? -1;
    const to = secondRow?.findIndex((value) => value === null) ?? -1;
    if (!firstRow || !secondRow || from < 0 || to < 0) {
      throw new Error("Could not move a number between rows");
    }
    secondRow[to] = firstRow[from] ?? null;
    firstRow[from] = null;
    expect(() => validateSheet(sheet)).toThrow("Each row must have exactly 5 numbers");
  });

  it("rejects a column that fills all three rows", () => {
    const sheet = cloneSheet(generateSheet());
    const card = sheet[0];
    if (!card) {
      throw new Error("Missing card");
    }

    let targetCol = -1;
    let emptyRow = -1;
    for (let col = 0; col < 9; col += 1) {
      const rows = [0, 1, 2];
      const filled = rows.filter((row) => card[row]?.[col] !== null);
      const empty = rows.find((row) => card[row]?.[col] === null);
      if (filled.length === 2 && empty !== undefined) {
        targetCol = col;
        emptyRow = empty;
        break;
      }
    }

    const sourceCol = card[emptyRow]?.findIndex((value, col) => col !== targetCol && value !== null) ?? -1;
    if (targetCol < 0 || emptyRow < 0 || sourceCol < 0) {
      throw new Error("Could not fill a third cell in the same column");
    }

    const row = card[emptyRow];
    if (!row) {
      throw new Error("Missing row");
    }
    row[targetCol] = row[sourceCol] ?? null;
    row[sourceCol] = null;
    expect(() => validateSheet(sheet)).toThrow(`Column ${targetCol} cannot fill all 3 rows`);
  });

  it("rejects a number placed in the wrong decade column", () => {
    const sheet = cloneSheet(generateSheet());
    const row = sheet[0]?.[0];
    const firstFilled = row?.findIndex((value) => value !== null) ?? -1;
    if (!row || firstFilled < 0) {
      throw new Error("Could not plant an out-of-range number");
    }
    row[firstFilled] = firstFilled === 0 ? 52 : 1;
    expect(() => validateSheet(sheet)).toThrow(/outside its range|exactly 5 numbers|duplicated|1 to 90/);
  });

  it("rejects a column that is not sorted top to bottom", () => {
    const sheet = cloneSheet(generateSheet());
    const card = sheet[0];
    if (!card) {
      throw new Error("Missing card");
    }

    let targetCol = -1;
    for (let col = 0; col < 9; col += 1) {
      const values = card.map((row) => row[col]).filter((value): value is number => value !== null);
      if (values.length === 2) {
        targetCol = col;
        break;
      }
    }
    if (targetCol < 0) {
      throw new Error("Could not find a double column");
    }

    const rows = [0, 1, 2].filter((row) => card[row]?.[targetCol] !== null);
    const first = card[rows[0] ?? 0]![targetCol];
    const second = card[rows[1] ?? 0]![targetCol];
    card[rows[0] ?? 0]![targetCol] = second ?? null;
    card[rows[1] ?? 0]![targetCol] = first ?? null;
    expect(() => validateSheet(sheet)).toThrow(`Column ${targetCol} is not sorted top to bottom`);
  });
});
