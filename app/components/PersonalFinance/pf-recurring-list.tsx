"use client";

import { usePfRecurring } from "@/app/(dashboard)/modules/hooks/use-pf-recurring";

export function PfRecurringList() {
  const { items, loading, error } = usePfRecurring();

  if (loading) return <p className="text-sm text-zinc-500">Carregando recorrências…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!items.length) {
    return <p className="text-sm text-zinc-500">Nenhuma recorrência. API: GET /api/personal-finance/recurring</p>;
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {items.map((r) => (
        <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{r.description ?? "Recorrência"}</span>
          <span className="text-zinc-600 dark:text-zinc-400">
            {r.frequency} · {r.next_due_date}
          </span>
        </li>
      ))}
    </ul>
  );
}
