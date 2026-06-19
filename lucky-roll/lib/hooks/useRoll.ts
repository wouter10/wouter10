"use client";

import { useState, useCallback } from "react";
import { pickRandom, rollDice } from "@/lib/utils/random";
import type { Category, Item, HistoryEntry } from "@/types";

interface RollState {
  rolling: boolean;
  diceValues: [number, number];
  result: Item | null;
  history: HistoryEntry[];
}

export function useRoll(selectedCategory: Category | null) {
  const [state, setState] = useState<RollState>({
    rolling: false,
    diceValues: [1, 1],
    result: null,
    history: [],
  });

  const roll = useCallback(async () => {
    if (!selectedCategory || state.rolling) return;

    // Haptic feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([30, 20, 50]);
    }

    setState((s) => ({ ...s, rolling: true, result: null }));

    // Fetch items
    const res = await fetch(`/api/items?category_id=${selectedCategory.id}`);
    const items: Item[] = await res.json();

    if (!items.length) {
      setState((s) => ({ ...s, rolling: false }));
      return;
    }

    // Wait for dice animation (800ms)
    await new Promise((r) => setTimeout(r, 800));

    const picked = pickRandom(items);
    const diceValues = rollDice();

    setState((s) => ({ ...s, rolling: false, diceValues, result: picked }));

    if (!picked) return;

    // Record in history (fire-and-forget)
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: selectedCategory.id,
        item_id: picked.id,
      }),
    });
  }, [selectedCategory, state.rolling]);

  const setHistory = useCallback((history: HistoryEntry[]) => {
    setState((s) => ({ ...s, history }));
  }, []);

  return { ...state, roll, setHistory };
}
