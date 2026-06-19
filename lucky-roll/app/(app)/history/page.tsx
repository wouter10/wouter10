"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { groupByDate, timeLabel } from "@/lib/utils/date";
import type { HistoryEntry } from "@/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data: HistoryEntry[]) => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const groups = groupByDate(history, (h) => h.rolled_at);

  return (
    <div className="px-6 pt-10 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Geschiedenis</h1>
        <p className="text-[var(--muted)] text-sm mt-0.5">
          {loading ? "…" : `Laatste ${history.length} rolls`}
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-[var(--card)] animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎲</p>
          <p className="font-medium">Nog geen rolls</p>
          <p className="text-[var(--muted)] text-sm mt-1">
            Ga naar het rolscherm en laat het lot beslissen
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-widest mb-2">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--card)] border border-[var(--card-border)]"
                  >
                    <span className="text-2xl shrink-0">
                      {entry.category?.icon ?? "🎲"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {entry.item?.title ?? (
                          <span className="text-[var(--muted)] italic">Verwijderd item</span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {entry.category?.name ?? "Onbekende categorie"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {entry.item?.favorite && <span className="text-gold-500">⭐</span>}
                      <span className="text-xs text-[var(--muted)] tabular-nums">
                        {timeLabel(entry.rolled_at)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
