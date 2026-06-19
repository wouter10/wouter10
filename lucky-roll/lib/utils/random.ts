import type { Item } from "@/types";

export function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

export function pickRandomItem(items: Item[]): Item | null {
  return pickRandom(items);
}

export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollDice(): [number, number] {
  return [rollDie(), rollDie()];
}
