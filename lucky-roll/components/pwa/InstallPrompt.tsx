"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm"
        >
          <div className="flex items-center gap-3 rounded-3xl bg-[var(--card)] border border-[var(--card-border)] shadow-card-hover p-4">
            <span className="text-2xl shrink-0">🎲</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Lucky Roll installeren</p>
              <p className="text-xs text-[var(--muted)]">
                Voeg toe aan je beginscherm
              </p>
            </div>
            <button
              onClick={dismiss}
              className="text-[var(--muted)] text-sm px-2 py-1"
            >
              Later
            </button>
            <button
              onClick={install}
              className="shrink-0 bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-full active:scale-95 transition-transform"
            >
              Installeer
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
