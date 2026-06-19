"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { SettingsButton } from "@/components/ui/SettingsButton";
import { AnimatedDice } from "@/components/dice/AnimatedDice";
import { useRoll } from "@/lib/hooks/useRoll";
import type { Category, HistoryEntry } from "@/types";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);
  const [recentHistory, setRecentHistory] = useState<HistoryEntry[]>([]);
  const [emptyError, setEmptyError] = useState(false);
  const hasConfettied = useRef(false);

  const { rolling, diceValues, result, roll } = useRoll(selected);

  // Load categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (data.length > 0) setSelected(data[0]);
      });
  }, []);

  // Load recent history
  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data: HistoryEntry[]) => setRecentHistory(data.slice(0, 3)));
  }, [result]);

  // Confetti on result
  useEffect(() => {
    if (result && !hasConfettied.current) {
      hasConfettied.current = true;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.55 },
        colors: ["#d946ef", "#f0abfc", "#fbbf24", "#ffffff"],
        disableForReducedMotion: true,
      });
    }
    if (!result) {
      hasConfettied.current = false;
    }
  }, [result]);

  async function handleRoll() {
    if (!selected) return;
    if (selected.item_count === 0) {
      setEmptyError(true);
      setTimeout(() => setEmptyError(false), 2500);
      return;
    }
    setEmptyError(false);
    await roll();
  }

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col items-center px-6 pt-10 pb-6 min-h-full">

          {/* Header */}
          <div className="w-full mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Lucky Roll</h1>
              <p className="text-[var(--muted)] text-sm mt-0.5">Gooi de dobbelstenen</p>
            </div>
            <SettingsButton />
          </div>

          {/* Category Picker */}
          <div className="w-full mb-8">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelected(cat); setEmptyError(false); }}
                  className={[
                    "shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium transition-all duration-150",
                    selected?.id === cat.id
                      ? "bg-brand-500 text-white shadow-glow"
                      : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-brand-500/40",
                  ].join(" ")}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  {cat.item_count !== undefined && (
                    <span className={selected?.id === cat.id ? "text-white/60" : "text-[var(--muted)]"}>
                      {cat.item_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dice Area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
            <div className="flex gap-6 items-center justify-center">
              <AnimatedDice value={diceValues[0]} rolling={rolling} size={130} />
              <AnimatedDice value={diceValues[1]} rolling={rolling} size={130} />
            </div>

            {/* Empty category error */}
            <AnimatePresence>
              {emptyError && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-[var(--muted)] text-center"
                >
                  Deze categorie heeft nog geen items. Voeg er eerst wat toe!
                </motion.p>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence mode="wait">
              {result && !rolling && (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="w-full"
                >
                  <div className="bg-[var(--card)] border border-brand-500/30 rounded-3xl p-6 text-center shadow-glow">
                    <p className="text-xs font-medium text-brand-500 uppercase tracking-widest mb-2">
                      {selected?.icon} {selected?.name}
                    </p>
                    <h2 className="text-2xl font-bold leading-tight">{result.title}</h2>
                    {result.favorite && (
                      <p className="text-gold-500 text-sm mt-1.5">⭐ Favoriet</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Roll button */}
            <Button
              size="lg"
              fullWidth
              onClick={handleRoll}
              loading={rolling}
              disabled={!selected || categories.length === 0}
              className="text-lg font-bold h-14 mt-2"
            >
              {rolling ? "Gooien..." : "🎲 Rol!"}
            </Button>
          </div>

          {/* Recent history */}
          {recentHistory.length > 0 && (
            <div className="w-full mt-8">
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-widest mb-3">
                Recente rolls
              </p>
              <div className="space-y-2">
                {recentHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 py-2.5 px-4 rounded-2xl bg-[var(--card)] border border-[var(--card-border)]"
                  >
                    <span className="text-lg">{entry.category?.icon ?? "🎲"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.item?.title ?? "—"}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {entry.category?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
