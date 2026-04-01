"use client";

import { usePfTransactions } from "@/app/(dashboard)/modules/hooks/use-pf-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PfTransactionList() {
  const { items, loading, error } = usePfTransactions();

  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  if (error) return <p className="text-sm text-[var(--color-negative)]">{error}</p>;
  if (!items.length) {
    return <p className="text-sm text-[var(--color-text-3)]">Nenhuma transação nesta página.</p>;
  }

  return (
    <Card className="shadow-none">
      <ul className="divide-y divide-[var(--color-border)]">
        {items.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <span className="text-[var(--color-text-1)]">{t.description ?? t.kind}</span>
            <span className="font-medium tabular-nums text-[var(--color-text-2)]">
              {Number(t.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · {t.occurred_on}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
