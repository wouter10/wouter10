"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens bevatten.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(errorMessage(error.message));
      setLoading(false);
    } else {
      // Supabase can auto-confirm in dev or require email confirmation
      const { data } = await supabase.auth.getUser();
      if (data.user?.confirmed_at) {
        router.push("/");
        router.refresh();
      } else {
        setSuccess(true);
        setLoading(false);
      }
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">📬</div>
        <h2 className="text-xl font-semibold">Check je mail</h2>
        <p className="text-[var(--muted)] text-sm">
          We hebben een bevestigingslink gestuurd naar{" "}
          <span className="text-[var(--foreground)] font-medium">{email}</span>.
          Klik op de link om je account te activeren.
        </p>
        <Link
          href="/login"
          className="inline-block text-brand-500 text-sm font-medium hover:text-brand-400 transition-colors mt-2"
        >
          Terug naar inloggen
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              E-mailadres
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@voorbeeld.nl"
              className="w-full h-11 px-4 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              Wachtwoord
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimaal 8 tekens"
              className="w-full h-11 px-4 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Account aanmaken
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--muted)]">
        Al een account?{" "}
        <Link
          href="/login"
          className="text-brand-500 font-medium hover:text-brand-400 transition-colors"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

function errorMessage(msg: string): string {
  if (msg.includes("already registered") || msg.includes("User already")) return "Dit e-mailadres is al in gebruik.";
  if (msg.includes("Password should be")) return "Wachtwoord moet minimaal 6 tekens bevatten.";
  if (msg.includes("invalid email")) return "Vul een geldig e-mailadres in.";
  return "Er is iets misgegaan. Probeer het opnieuw.";
}
