import {
  CARDS_PER_SHEET,
  COLS,
  COLUMN_RANGES,
  NUMBERS_PER_CARD,
  NUMBERS_PER_ROW,
  ROWS,
} from "./constants";
import { range } from "./random";
import type { Card, Sheet } from "./types";

export function cardNumbers(cells: Card): number[] {
  return cells.flat().filter((value): value is number => value !== null);
}

export function validateSheet(cards: Sheet): void {
  const allNumbers: number[] = [];

  if (cards.length !== CARDS_PER_SHEET) {
    throw new Error("Sheet must have 6 cards");
  }

  for (const cells of cards) {
    if (cells.length !== ROWS || cells.some((row) => row.length !== COLS)) {
      throw new Error("Card must be 3x9");
    }

    const numbers = cardNumbers(cells);
    if (numbers.length !== NUMBERS_PER_CARD) {
      throw new Error("Card must have 15 numbers");
    }
    if (new Set(numbers).size !== NUMBERS_PER_CARD) {
      throw new Error("Card has duplicated numbers");
    }

    for (const row of cells) {
      if (row.filter((value) => value !== null).length !== NUMBERS_PER_ROW) {
        throw new Error("Each row must have exactly 5 numbers");
      }
    }

    for (let col = 0; col < COLS; col += 1) {
      const rangeForColumn = COLUMN_RANGES[col];
      if (!rangeForColumn) {
        throw new Error(`Missing range for column ${col}`);
      }
      const [start, end] = rangeForColumn;
      const values = cells
        .map((row) => row[col])
        .filter((value): value is number => value !== null);

      if (values.some((value) => value < start || value > end)) {
        throw new Error(`Column ${col} has a number outside its range`);
      }

      const sorted = [...values].sort((a, b) => a - b);
      if (values.some((value, index) => value !== sorted[index])) {
        throw new Error(`Column ${col} is not sorted top to bottom`);
      }
    }

    allNumbers.push(...numbers);
  }

  const expected = range(1, 90).join(",");
  const actual = [...allNumbers].sort((a, b) => a - b).join(",");
  if (actual !== expected) {
    throw new Error("Sheet must contain each number from 1 to 90 exactly once");
  }
}
