"use client";

import { usePfTransactions } from "@/app/(dashboard)/modules/hooks/use-pf-transactions";

export function PfTransactionList() {
  const { items, loading, error } = usePfTransactions();

  if (loading) return <p className="text-sm text-zinc-500">Carregando transações…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!items.length) {
    return <p className="text-sm text-zinc-500">Nenhuma transação nesta página.</p>;
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {items.map((t) => (
        <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
          <span className="text-zinc-900 dark:text-zinc-50">{t.description ?? t.kind}</span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {Number(t.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · {t.occurred_on}
          </span>
        </li>
      ))}
    </ul>
  );
}
