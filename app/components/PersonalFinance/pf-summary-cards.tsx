"use client";

import { useMemo } from "react";
import { usePfSummary } from "@/app/(dashboard)/modules/hooks/use-pf-summary";

function monthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export function PfSummaryCards() {
  const { from, to } = useMemo(() => monthRange(), []);
  const { data, loading, error } = usePfSummary(from, to);

  if (loading) {
    return <p className="text-sm text-zinc-500">Carregando resumo…</p>;
  }
  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="font-medium">Resumo indisponível</p>
        <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">{error}</p>
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
          Faça login (Supabase Auth) e aplique o SQL em <code>docs/personal-finance/database-schema.sql</code>.
        </p>
      </div>
    );
  }
  if (!data) return null;

  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Receitas</p>
        <p className="mt-2 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{fmt(data.totals.income)}</p>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Despesas</p>
        <p className="mt-2 text-xl font-semibold text-red-600 dark:text-red-400">{fmt(data.totals.expense)}</p>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Resultado</p>
        <p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{fmt(data.totals.result)}</p>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Saldos iniciais (contas)</p>
        <p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {fmt(data.totals.initial_balance_sum)}
        </p>
      </div>
    </div>
  );
}
