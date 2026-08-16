import { describe, expect, it } from "vitest";
import { generateSheet, generateSheets } from "./generator";
import { validateSheet } from "./validate";

describe("bingo sheet generator", () => {
  it("generates a valid sheet", () => {
    const sheet = generateSheet();
    expect(() => validateSheet(sheet)).not.toThrow();
  });

  it("never fills all three rows in the same column", () => {
    const sheets = generateSheets(80);
    for (const sheet of sheets) {
      for (const card of sheet) {
        for (let col = 0; col < 9; col += 1) {
          const filled = card.filter((row) => row[col] !== null).length;
          expect(filled).toBeLessThan(3);
        }
      }
    }
  });

  it("generates many valid random sheets", () => {
    const sheets = generateSheets(200);
    expect(sheets).toHaveLength(200);
    for (const sheet of sheets) {
      expect(() => validateSheet(sheet)).not.toThrow();
    }
  });

  it("distributes the same number across different cards", () => {
    const hitsForOne = [0, 0, 0, 0, 0, 0];
    const hitsForNinety = [0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 120; i += 1) {
      const sheet = generateSheet();
      sheet.forEach((card, cardIndex) => {
        const numbers = card.flat();
        if (numbers.includes(1)) hitsForOne[cardIndex] += 1;
        if (numbers.includes(90)) hitsForNinety[cardIndex] += 1;
      });
    }

    expect(Math.min(...hitsForOne)).toBeGreaterThan(0);
    expect(Math.min(...hitsForNinety)).toBeGreaterThan(0);
  });
});
