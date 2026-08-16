import {
  CARDS_PER_SHEET,
  COLS,
  COLUMN_RANGES,
  COLUMN_SIZES,
  MAX_CONSECUTIVE_IN_ROW,
  MAX_PER_COLUMN,
  NUMBERS_PER_CARD,
  NUMBERS_PER_ROW,
  ROWS,
} from "./constants";
import { choice, range, shuffle } from "./random";
import type { Card, Cell, Sheet } from "./types";

function boundsForCard(current: number, colsAfter: number): [number, number] {
  const high = Math.min(MAX_PER_COLUMN, NUMBERS_PER_CARD - current);
  const low = Math.max(0, NUMBERS_PER_CARD - current - MAX_PER_COLUMN * colsAfter);
  return [low, high];
}

function enumerateAssignments(total: number, lows: number[], highs: number[]): number[][] {
  const results: number[][] = [];
  const n = lows.length;

  function rec(index: number, remaining: number, acc: number[]): void {
    if (index === n) {
      if (remaining === 0) {
        results.push([...acc]);
      }
      return;
    }

    let restLow = 0;
    let restHigh = 0;
    for (let i = index + 1; i < n; i += 1) {
      restLow += lows[i] ?? 0;
      restHigh += highs[i] ?? 0;
    }

    const start = Math.max(lows[index] ?? 0, remaining - restHigh);
    const end = Math.min(highs[index] ?? 0, remaining - restLow);
    for (let value = start; value <= end; value += 1) {
      acc.push(value);
      rec(index + 1, remaining - value, acc);
      acc.pop();
    }
  }

  rec(0, total, []);
  return results;
}

function buildOccupancy(): number[][] {
  const occupancy = Array.from({ length: CARDS_PER_SHEET }, () => Array<number>(COLS).fill(0));
  const order = shuffle(range(0, COLS - 1));

  for (let step = 0; step < order.length; step += 1) {
    const col = order[step];
    if (col === undefined) {
      throw new Error("Missing column in occupancy order");
    }

    const colsAfter = COLS - step - 1;
    const lows: number[] = [];
    const highs: number[] = [];

    for (let card = 0; card < CARDS_PER_SHEET; card += 1) {
      const current = (occupancy[card] ?? []).reduce((sum, value) => sum + value, 0);
      const [low, high] = boundsForCard(current, colsAfter);
      if (low > high) {
        throw new Error("Occupancy bounds collapsed");
      }
      lows.push(low);
      highs.push(high);
    }

    const columnSize = COLUMN_SIZES[col];
    if (columnSize === undefined) {
      throw new Error(`Missing size for column ${col}`);
    }

    const options = enumerateAssignments(columnSize, lows, highs);
    if (options.length === 0) {
      throw new Error("No valid occupancy for column");
    }

    const assignment = choice(options);
    assignment.forEach((count, card) => {
      const row = occupancy[card];
      if (!row) {
        throw new Error("Missing occupancy row");
      }
      row[col] = count;
    });
  }

  if (occupancy.some((row) => row.reduce((sum, value) => sum + value, 0) !== NUMBERS_PER_CARD)) {
    throw new Error("Card occupancy does not total 15");
  }

  return occupancy;
}

function consecutiveRunIfPlaced(maskRow: boolean[], col: number): number {
  let run = 1;
  for (let index = col - 1; index >= 0 && maskRow[index]; index -= 1) {
    run += 1;
  }
  for (let index = col + 1; index < COLS && maskRow[index]; index += 1) {
    run += 1;
  }
  return run;
}

function canPlaceInRow(mask: boolean[][], row: number, col: number): boolean {
  const maskRow = mask[row];
  if (!maskRow || maskRow[col]) {
    return false;
  }
  return consecutiveRunIfPlaced(maskRow, col) <= MAX_CONSECUTIVE_IN_ROW;
}

function placeRowMask(counts: number[]): boolean[][] {
  const mask = Array.from({ length: ROWS }, () => Array<boolean>(COLS).fill(false));
  const rowFill = [0, 0, 0];
  const threes: number[] = [];
  const twos: number[] = [];
  const ones: number[] = [];

  counts.forEach((count, col) => {
    if (count === 3) threes.push(col);
    if (count === 2) twos.push(col);
    if (count === 1) ones.push(col);
  });

  shuffle(twos);
  shuffle(ones);

  for (const col of threes) {
    for (let row = 0; row < ROWS; row += 1) {
      const maskRow = mask[row];
      if (!maskRow) {
        throw new Error("Missing mask row");
      }
      maskRow[col] = true;
      rowFill[row] = (rowFill[row] ?? 0) + 1;
    }
  }

  const twoPairs: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 2],
  ];

  function solveOnes(index: number): boolean {
    if (index === ones.length) {
      return rowFill.every((value) => value === NUMBERS_PER_ROW);
    }

    const col = ones[index];
    if (col === undefined) {
      return false;
    }

    const rows = shuffle([0, 1, 2]);
    for (const row of rows) {
      if ((rowFill[row] ?? 0) >= NUMBERS_PER_ROW) continue;
      const maskRow = mask[row];
      if (!maskRow || !canPlaceInRow(mask, row, col)) continue;
      maskRow[col] = true;
      rowFill[row] = (rowFill[row] ?? 0) + 1;
      if (solveOnes(index + 1)) return true;
      maskRow[col] = false;
      rowFill[row] = (rowFill[row] ?? 0) - 1;
    }
    return false;
  }

  function solveTwos(index: number): boolean {
    if (index === twos.length) {
      return solveOnes(0);
    }

    const col = twos[index];
    if (col === undefined) {
      return false;
    }

    const pairs = shuffle(twoPairs.map((pair) => [...pair] as [number, number]));
    for (const [a, b] of pairs) {
      if ((rowFill[a] ?? 0) >= NUMBERS_PER_ROW || (rowFill[b] ?? 0) >= NUMBERS_PER_ROW) {
        continue;
      }
      if (!canPlaceInRow(mask, a, col) || !canPlaceInRow(mask, b, col)) {
        continue;
      }
      const firstRow = mask[a];
      const secondRow = mask[b];
      if (!firstRow || !secondRow) continue;
      firstRow[col] = true;
      secondRow[col] = true;
      rowFill[a] = (rowFill[a] ?? 0) + 1;
      rowFill[b] = (rowFill[b] ?? 0) + 1;
      if (solveTwos(index + 1)) return true;
      firstRow[col] = false;
      secondRow[col] = false;
      rowFill[a] = (rowFill[a] ?? 0) - 1;
      rowFill[b] = (rowFill[b] ?? 0) - 1;
    }
    return false;
  }

  if (!solveTwos(0)) {
    throw new Error("Could not place five numbers per row");
  }

  return mask;
}

function fillCard(counts: number[], columnValues: number[][]): Card {
  const mask = placeRowMask(counts);
  const cells: Card = Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));

  for (let col = 0; col < COLS; col += 1) {
    const values = columnValues[col] ?? [];
    if (values.length !== counts[col]) {
      throw new Error("Column value count mismatch");
    }

    const slots: number[] = [];
    for (let row = 0; row < ROWS; row += 1) {
      if (mask[row]?.[col]) slots.push(row);
    }

    slots.forEach((row, index) => {
      const cellRow = cells[row];
      const value = values[index];
      if (!cellRow || value === undefined) {
        throw new Error("Unable to place column value");
      }
      cellRow[col] = value;
    });
  }

  return cells;
}

export function generateSheet(maxAttempts = 400): Sheet {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const occupancy = buildOccupancy();
      const pools = COLUMN_RANGES.map(([start, end]) => shuffle(range(start, end)));
      const distributed: number[][][] = Array.from({ length: CARDS_PER_SHEET }, () => []);

      for (let col = 0; col < COLS; col += 1) {
        let offset = 0;
        for (let card = 0; card < CARDS_PER_SHEET; card += 1) {
          const count = occupancy[card]?.[col] ?? 0;
          const values = (pools[col] ?? []).slice(offset, offset + count).sort((a, b) => a - b);
          offset += count;
          distributed[card]?.push(values);
        }
      }

      return occupancy.map((counts, card) => fillCard(counts, distributed[card] ?? []));
    } catch (error) {
      lastError = error;
    }
  }

  const message = lastError instanceof Error ? lastError.message : "unknown error";
  throw new Error(`Failed to generate a valid sheet: ${message}`);
}

export function generateSheets(count: number): Sheet[] {
  if (count < 1) {
    throw new Error("Sheet count must be at least 1");
  }
  return Array.from({ length: count }, () => generateSheet());
}
