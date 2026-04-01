"use client";

import { useEffect, useMemo, useState } from "react";
import { MetricCard } from "@/components/ui/metric-card";
import { usePfSummary } from "@/app/(dashboard)/modules/hooks/use-pf-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

function monthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to), label: now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) };
}

export function PfDashboardHeader() {
  const { from, to, label } = useMemo(() => monthRange(), []);
  const { data, loading } = usePfSummary(from, to);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      const metaName =
        (user?.user_metadata?.full_name as string | undefined) ??
        (user?.user_metadata?.name as string | undefined) ??
        undefined;
      const raw = metaName ?? user?.email ?? null;
      if (!raw) return;
      const cleaned = raw.includes("@") ? raw.split("@")[0] : raw;
      const first = cleaned.trim().split(/\s+/)[0] ?? "";
      setFirstName(first ? first.charAt(0).toUpperCase() + first.slice(1) : null);
    });
  }, []);

  const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const saldo = (data?.totals.initial_balance_sum ?? 0) + (data?.totals.result ?? 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm text-[var(--color-text-2)]">
            <Icon name="calendar_today" />
            {label}
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-text-1)]">
            Olá{firstName ? `, ${firstName}` : ""}
          </h1>
        </div>
        <p className="text-sm text-[var(--color-text-3)]">Visão Geral</p>
      </div>

      {loading || !data ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[118px]" />
          <Skeleton className="h-[118px]" />
          <Skeleton className="h-[118px]" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <MetricCard
            label="Saldo total"
            value={fmtBRL(saldo)}
            deltaPercent={2.4}
            tone="neutral"
            icon="account_balance_wallet"
          />
          <MetricCard
            label="Receitas no mês"
            value={fmtBRL(data.totals.income)}
            sublabel="Meta mensal: R$ 10.000,00"
            tone="positive"
            icon="arrow_downward"
          />
          <MetricCard
            label="Despesas no mês"
            value={fmtBRL(data.totals.expense)}
            sublabel={`Disponível: ${fmtBRL(Math.max(0, data.totals.income - data.totals.expense))}`}
            tone="negative"
            icon="arrow_upward"
          />
        </div>
      )}
    </div>
  );
}

