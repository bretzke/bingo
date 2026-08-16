export function randomInt(max: number): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
}

export function choice<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot choose from an empty list");
  }
  return items[randomInt(items.length)] as T;
}

export function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const current = items[i] as T;
    items[i] = items[j] as T;
    items[j] = current;
  }
  return items;
}

export function range(start: number, end: number): number[] {
  const values: number[] = [];
  for (let value = start; value <= end; value += 1) {
    values.push(value);
  }
  return values;
}
