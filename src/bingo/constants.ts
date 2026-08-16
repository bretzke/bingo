export const COLUMN_RANGES: ReadonlyArray<readonly [number, number]> = [
  [1, 9],
  [10, 19],
  [20, 29],
  [30, 39],
  [40, 49],
  [50, 59],
  [60, 69],
  [70, 79],
  [80, 90],
];

export const COLUMN_SIZES = COLUMN_RANGES.map(([start, end]) => end - start + 1);
export const CARDS_PER_SHEET = 6;
export const ROWS = 3;
export const COLS = 9;
export const NUMBERS_PER_ROW = 5;
export const NUMBERS_PER_CARD = 15;
export const MAX_PER_COLUMN = 2;
export const MAX_CONSECUTIVE_IN_ROW = 2;
