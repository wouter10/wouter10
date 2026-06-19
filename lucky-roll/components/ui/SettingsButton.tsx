"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "./Sheet";
import { Button } from "./Button";
import { useTheme, type Theme } from "@/lib/hooks/useTheme";
import { createClient } from "@/lib/supabase/client";

const THEMES: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Licht", icon: "☀️" },
  { value: "dark", label: "Donker", icon: "🌙" },
  { value: "system", label: "Systeem", icon: "⚙️" },
];

export function SettingsButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme, setTheme } = useTheme();

  async function logout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-2xl bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        aria-label="Instellingen"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Instellingen">
        <div className="pt-2 space-y-6">
          <div>
            <p className="text-sm font-medium mb-2">Thema</p>
            <div className="flex gap-2 p-1 bg-[var(--background)] rounded-2xl border border-[var(--card-border)]">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={[
                    "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-sm font-medium transition-colors",
                    theme === t.value
                      ? "bg-brand-500 text-white"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]",
                  ].join(" ")}
                >
                  <span className="text-lg">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Button variant="secondary" fullWidth loading={loggingOut} onClick={logout}>
            Uitloggen
          </Button>
        </div>
      </Sheet>
    </>
  );
}
