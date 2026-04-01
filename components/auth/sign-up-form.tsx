"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setLoading(false);
      router.refresh();
    } catch {
      setMessage("Erro ao conectar. Confira URL e chave do Supabase.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-emerald-50 px-3 py-4 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        <p className="font-medium">Conta criada</p>
        <p className="mt-2">
          Se o projeto exigir confirmação por e-mail, abra o link recebido. Depois{" "}
          <a href="/login" className="font-medium underline">
            faça login
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="signup-email" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          E-mail
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/40 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Senha (mín. 6 caracteres, conforme política do Supabase)
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/40 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>
      {message && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {message}
        </p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Criando…" : "Criar conta"}
      </Button>
    </form>
  );
}
