"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/types";

const SUGGESTIONS = [
  "Voeg Oppenheimer en Dune toe aan Films",
  "Maak een categorie Wijnen 🍷 aan",
  "Wat staat er in mijn Games lijst?",
  "Verwijder het laatste restaurant",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.ok ? data.reply : `⚠️ ${data.error ?? "Er ging iets mis."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "⚠️ Geen verbinding. Probeer het opnieuw.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-6 pt-10 pb-4 shrink-0">
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <p className="text-[var(--muted)] text-sm mt-0.5">
          Beheer je lijsten met natuurlijke taal
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pb-8">
            <div className="text-5xl mb-4">🤖</div>
            <p className="font-medium mb-1">Hoi! Wat kan ik voor je doen?</p>
            <p className="text-[var(--muted)] text-sm mb-6 max-w-xs">
              Vraag me om items toe te voegen, categorieën te maken of je lijsten te bekijken.
            </p>
            <div className="space-y-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left text-sm px-4 py-3 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] hover:border-brand-500/40 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={[
                      "max-w-[80%] px-4 py-2.5 rounded-3xl text-sm whitespace-pre-wrap break-words",
                      msg.role === "user"
                        ? "bg-brand-500 text-white rounded-br-lg"
                        : "bg-[var(--card)] border border-[var(--card-border)] rounded-bl-lg",
                    ].join(" ")}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl rounded-bl-lg px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-2 h-2 rounded-full bg-[var(--muted)]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 px-4 py-3 border-t border-[var(--card-border)] bg-[var(--background)]"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Typ een bericht…"
            enterKeyHint="send"
            className="flex-1 h-11 px-4 rounded-full bg-[var(--card)] border border-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-brand-500 text-white disabled:opacity-40 transition-opacity active:scale-95"
            aria-label="Versturen"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
