"use client";

import { useMemo } from "react";
import { usePfSummary } from "@/app/(dashboard)/modules/hooks/use-pf-summary";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--color-warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] p-4 text-sm text-[var(--color-text-1)]">
        <p className="font-medium">Resumo indisponível</p>
        <p className="mt-1 text-[var(--color-text-2)]">{error}</p>
        <p className="mt-2 text-xs text-[var(--color-text-2)]">
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
      <Card>
        <CardContent>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Receitas</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-positive)]">{fmt(data.totals.income)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Despesas</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-negative)]">{fmt(data.totals.expense)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Resultado</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-text-1)]">{fmt(data.totals.result)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Saldos iniciais (contas)</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-text-1)]">
            {fmt(data.totals.initial_balance_sum)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
