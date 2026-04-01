"use client";

import { useMemo, useState } from "react";
import { usePfRecurring } from "@/app/(dashboard)/modules/hooks/use-pf-recurring";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function daysUntil(dateIso: string) {
  const now = new Date();
  const target = new Date(dateIso + "T00:00:00");
  const ms = target.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function PfRecurringScreen() {
  const { items, loading, error } = usePfRecurring();
  const [filter, setFilter] = useState<"Todos" | "Pendentes" | "Pagos">("Todos");

  const stats = useMemo(() => {
    const pending = items.filter((i) => i.is_active).length;
    const overdue = items.filter((i) => i.is_active && daysUntil(i.next_due_date) < 0).length;
    const weeklyTotal = items
      .filter((i) => {
        const d = daysUntil(i.next_due_date);
        return i.is_active && d >= 0 && d <= 7;
      })
      .reduce((acc, i) => acc + Number(i.amount ?? 0), 0);
    return { pending, overdue, weeklyTotal };
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-text-1)]">Recorrências</h2>
          <p className="mt-1 text-sm text-[var(--color-text-3)]">Manage Your Ledger</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" className="rounded-full px-3">
            <Icon name="add" />
            Nova Recorrência
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[120px] lg:col-span-2" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[340px]" />
          <Skeleton className="h-[340px] lg:col-span-2" />
        </div>
      ) : error ? (
        <p className="text-sm text-[var(--color-negative)]">{error}</p>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="shadow-none lg:col-span-2">
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-1)]">Próximos Vencimentos da Semana</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-[var(--color-text-1)]">
                    {fmtBRL(items.length ? stats.weeklyTotal : 1450.2)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusPill label={`${items.length ? stats.pending : 3} Pendentes`} tone="warning" />
                    <StatusPill label={`${items.length ? stats.overdue : 1} Em Atraso`} tone="negative" />
                  </div>
                </div>
                <Icon name="calendar_month" size={40} className="text-[var(--color-text-3)]" />
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="space-y-2">
                <p className="text-sm font-semibold text-[var(--color-text-1)]">Estimado Mensal</p>
                <p className="text-2xl font-semibold tabular-nums tracking-[-0.02em] text-[var(--color-text-1)]">
                  {fmtBRL(items.length ? items.filter((i) => i.is_active).reduce((acc, i) => acc + Number(i.amount ?? 0), 0) : 4280)}
                </p>
                <p className="text-sm text-[var(--color-text-3)]">Pago (65%) · Restante</p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-3)]">
                  <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: "65%" }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="shadow-none">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--color-text-1)]">Agosto 2024</p>
                  <div className="flex items-center gap-1 text-[var(--color-text-2)]">
                    <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-3)]" aria-label="Anterior">
                      <Icon name="chevron_left" />
                    </button>
                    <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-3)]" aria-label="Próximo">
                      <Icon name="chevron_right" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs text-[var(--color-text-3)]">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((d, idx) => (
                    <div key={`${d}-${idx}`} className="font-medium">
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: 21 }).map((_, i) => (
                    <div key={i} className="py-1">{i < 4 ? "" : String(i - 3)}</div>
                  ))}
                </div>

                <div className="rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] p-3">
                  <p className="text-sm font-semibold text-[var(--color-text-1)]">
                    <span className="inline-flex items-center gap-2">
                      <Icon name="credit_card" />
                      Métodos de Pagamento
                    </span>
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[var(--color-text-1)]">Cartão Final 4290</p>
                      <StatusPill label="Padrão" tone="info" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[var(--color-text-1)]">Débito Automático</p>
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-positive)]">
                        <Icon name="verified" />
                        verified
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 lg:col-span-2">
              <Card className="shadow-none">
                <CardContent className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--color-text-1)]">Próximos Pagamentos</p>
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
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardContent className="space-y-2">
                  {[
                    {
                      icon: "home_work",
                      title: "Aluguel Apartamento",
                      amount: 2450,
                      meta: "Venceu em 06 Ago · Bradesco Prime",
                      status: { label: "Atrasado", tone: "negative" as const },
                    },
                    {
                      icon: "language",
                      title: "Internet Fibra Óptica",
                      amount: 149.9,
                      meta: "Vence em 12 Ago · Visa • 4290",
                      status: { label: "Pendente", tone: "warning" as const },
                    },
                    {
                      icon: "movie",
                      title: "Netflix Premium",
                      amount: 55.9,
                      meta: "Vence em 15 Ago · Visa • 4290",
                      status: { label: "Pendente", tone: "warning" as const },
                    },
                  ].filter((x) => {
                    if (filter === "Todos") return true;
                    if (filter === "Pendentes") return x.status.label !== "Pago";
                    return x.status.label === "Pago";
                  }).map((p) => (
                    <div
                      key={p.title}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_25%,transparent)] px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]">
                          <Icon name={p.icon} filled />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--color-text-1)]">{p.title}</p>
                          <p className="mt-1 text-xs text-[var(--color-text-3)]">
                            <span className="inline-flex items-center gap-1">
                              <Icon name="calendar_today" />
                              {p.meta}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <p className="tabular-nums text-sm font-semibold text-[var(--color-text-1)]">{fmtBRL(p.amount)}</p>
                        <StatusPill label={p.status.label} tone={p.status.tone} />
                        <Icon name="chevron_right" className="text-[var(--color-text-3)]" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardContent className="space-y-3">
                  <p className="text-sm font-semibold text-[var(--color-text-1)]">Histórico Recente</p>
                  {[
                    {
                      icon: "bolt",
                      title: "Conta de Energia (CPFL)",
                      amount: 312.4,
                      meta: "Pago em 02 Ago",
                    },
                    {
                      icon: "fitness_center",
                      title: "Academia SmartFit",
                      amount: 119.9,
                      meta: "Pago em 01 Ago",
                    },
                  ].map((p) => (
                    <div
                      key={p.title}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_20%,transparent)] px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-surface-3)_45%,transparent)] text-[var(--color-text-2)]">
                          <Icon name={p.icon} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--color-text-1)]">{p.title}</p>
                          <p className="mt-1 text-xs text-[var(--color-text-3)]">
                            <span className="inline-flex items-center gap-1">
                              <Icon name="calendar_today" />
                              {p.meta}
                            </span>
                            {" · "}
                            <span className="text-[var(--color-positive)]">Pago</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <p className="tabular-nums text-sm font-semibold text-[var(--color-text-1)]">{fmtBRL(p.amount)}</p>
                        <span className="inline-flex items-center gap-1 text-sm text-[var(--color-positive)]">
                          <Icon name="check_circle" />
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

