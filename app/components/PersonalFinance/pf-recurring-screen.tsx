"use client";

import { useMemo, useState, useCallback } from "react";
import { usePfRecurring } from "@/app/(dashboard)/modules/hooks/use-pf-recurring";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { recurringIcon } from "@/app/components/PersonalFinance/pf-recurring-list";
import { PfCreateRecurringModal } from "@/app/components/PersonalFinance/pf-create-recurring-modal";

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function daysUntil(dateIso: string) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const due = new Date(`${dateIso}T00:00:00`).getTime();
  return Math.round((due - start) / (1000 * 60 * 60 * 24));
}

export function PfRecurringScreen() {
  const { items, loading, error, reload } = usePfRecurring();
  const [filter, setFilter] = useState<"Todos" | "Pendentes" | "Pagos">("Todos");
  const [recModalOpen, setRecModalOpen] = useState(false);

  const stats = useMemo(() => {
    const pending = items.filter((i) => i.is_active).length;
    const overdue = items.filter((i) => i.is_active && daysUntil(i.next_due_date) < 0).length;
    const weeklyTotal = items
      .filter((i) => {
        const d = daysUntil(i.next_due_date);
        return i.is_active && d >= 0 && d <= 7;
      })
      .reduce((acc, i) => acc + Number(i.amount ?? 0), 0);
    const monthlyActive = items.filter((i) => i.is_active).reduce((acc, i) => acc + Number(i.amount ?? 0), 0);
    return { pending, overdue, weeklyTotal, monthlyActive };
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (filter === "Todos") return true;
      if (filter === "Pendentes") {
        if (!i.is_active) return false;
        const d = daysUntil(i.next_due_date);
        return d >= -7 && d <= 30;
      }
      return !i.is_active;
    });
  }, [items, filter]);

  const onRecSuccess = useCallback(() => {
    void reload();
  }, [reload]);

  return (
    <div className="space-y-6">
      <PfCreateRecurringModal open={recModalOpen} onClose={() => setRecModalOpen(false)} onSuccess={onRecSuccess} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-text-1)]">Recorrências</h2>
          <p className="mt-1 text-sm text-[var(--color-text-3)]">Compromissos fixos e vencimentos.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" className="rounded-full px-3" type="button" onClick={() => setRecModalOpen(true)}>
            <Icon name="add" />
            Nova recorrência
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[120px] lg:col-span-2" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[200px] lg:col-span-3" />
        </div>
      ) : error ? (
        <p className="text-sm text-[var(--color-negative)]">{error}</p>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="shadow-none lg:col-span-2">
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-1)]">Próximos vencimentos (7 dias)</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-[var(--color-text-1)]">
                    {fmtBRL(stats.weeklyTotal)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusPill label={`${stats.pending} ativas`} tone="info" />
                    <StatusPill label={`${stats.overdue} em atraso`} tone={stats.overdue > 0 ? "negative" : "neutral"} />
                  </div>
                </div>
                <Icon name="calendar_month" size={40} className="text-[var(--color-text-3)]" />
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="space-y-2">
                <p className="text-sm font-semibold text-[var(--color-text-1)]">Soma mensal (ativas)</p>
                <p className="text-2xl font-semibold tabular-nums tracking-[-0.02em] text-[var(--color-text-1)]">
                  {fmtBRL(stats.monthlyActive)}
                </p>
                <p className="text-sm text-[var(--color-text-3)]">Valores cadastrados nas recorrências ativas.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-none">
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--color-text-1)]">Suas recorrências</p>
                <div className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--color-surface-3)_55%,transparent)] p-1 text-xs">
                  {(["Todos", "Pendentes", "Pagos"] as const).map((t) => {
                    const active = filter === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFilter(t)}
                        className={[
                          "rounded-full px-3 py-1 font-medium transition-[background-color,color] duration-[var(--dur-2)] ease-[var(--ease-standard)]",
                          active ? "bg-[var(--color-surface-1)] text-[var(--color-text-1)] shadow-[var(--shadow-1)]/35" : "text-[var(--color-text-2)] hover:text-[var(--color-text-1)]",
                        ].join(" ")}
                      >
                        {t === "Pagos" ? "Pausadas" : t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!items.length ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-2)]">
                  Nenhuma recorrência cadastrada. Use &quot;Nova recorrência&quot; para adicionar.
                </p>
              ) : !filtered.length ? (
                <p className="py-6 text-center text-sm text-[var(--color-text-3)]">Nenhum item neste filtro.</p>
              ) : (
                <ul className="divide-y divide-[var(--color-border)]">
                  {filtered.map((r) => {
                    const d = daysUntil(r.next_due_date);
                    const dueLabel = d <= 0 ? (d === 0 ? "Vence hoje" : `Atrasado ${Math.abs(d)} dia(s)`) : `Vence em ${d} dia(s)`;
                    const pending = r.is_active && d > 0 && d <= 2;
                    const status = !r.is_active
                      ? { label: "Pausada", tone: "neutral" as const }
                      : d < 0
                        ? { label: "Atrasado", tone: "negative" as const }
                        : pending
                          ? { label: "Pendente", tone: "warning" as const }
                          : { label: "Agendado", tone: "info" as const };
                    return (
                      <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-surface-3)_40%,transparent)] text-[var(--color-text-2)]">
                            <Icon name={recurringIcon(r.description)} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[var(--color-text-1)]">{r.description ?? "Recorrência"}</p>
                            <p className="text-xs text-[var(--color-text-3)]">{dueLabel}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="tabular-nums font-semibold text-[var(--color-text-1)]">{fmtBRL(Number(r.amount) || 0)}</span>
                          <StatusPill label={status.label} tone={status.tone} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
