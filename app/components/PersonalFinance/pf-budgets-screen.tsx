"use client";

import { useMemo, useState } from "react";
import { usePfBudgets } from "@/app/(dashboard)/modules/hooks/use-pf-budgets";
import { usePfSummary } from "@/app/(dashboard)/modules/hooks/use-pf-summary";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/ui/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

function monthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    from: fmt(from),
    to: fmt(to),
  };
}

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PfBudgetsScreen() {
  const { year, month, from, to } = useMemo(() => monthRange(), []);
  const budgets = usePfBudgets(year, month);
  const summary = usePfSummary(from, to);
  const [monthPreset] = useState(true);

  const demoTop = [
    {
      icon: "restaurant",
      status: { label: "No Controle", tone: "positive" as const },
      title: "Alimentação",
      subtitle: "Supermercados e Delivery",
      spent: 1200,
      limit: 2000,
    },
    {
      icon: "directions_car",
      status: { label: "Atenção", tone: "warning" as const },
      title: "Transporte",
      subtitle: "Combustível e Apps",
      spent: 680,
      limit: 800,
    },
    {
      icon: "medical_services",
      status: { label: "Excedido", tone: "negative" as const },
      title: "Saúde",
      subtitle: "Exames e Medicamentos",
      spent: 540,
      limit: 500,
    },
  ];

  const demoOther = [
    { icon: "school", label: "Educação", spent: 0, limit: 400 },
    { icon: "movie", label: "Lazer", spent: 120, limit: 300 },
    { icon: "subscriptions", label: "Assinaturas", spent: 89.9, limit: 150 },
    { icon: "home", label: "Moradia", spent: 2100, limit: 2200 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Planejamento financeiro</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-text-1)]">Orçamentos</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="rounded-full px-3" disabled={!monthPreset}>
            <Icon name="calendar_today" />
            Mês Atual
          </Button>
          <Button variant="primary" size="sm" className="rounded-full px-3">
            <Icon name="add" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {budgets.loading || summary.loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[140px]" />
          <Skeleton className="h-[140px]" />
          <Skeleton className="h-[140px]" />
        </div>
      ) : budgets.error || summary.error ? (
        <p className="text-sm text-[var(--color-negative)]">{budgets.error ?? summary.error}</p>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            {demoTop.map((b) => {
              const pct = (b.spent / b.limit) * 100;
              const remaining = b.limit - b.spent;
              const remainingLabel = remaining >= 0 ? `Restante: ${fmtBRL(remaining)}` : `Diferença: -${fmtBRL(Math.abs(remaining))}`;
              return (
                <Card key={b.title} className="shadow-none">
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]">
                        <Icon name={b.icon} filled />
                      </span>
                      <div className="text-right">
                        <p className="text-xs text-[var(--color-text-3)]">Status</p>
                        <StatusPill label={b.status.label} tone={b.status.tone} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">{b.status.label}</p>
                      <p className="mt-1 text-lg font-semibold text-[var(--color-text-1)]">{b.title}</p>
                      <p className="text-sm text-[var(--color-text-3)]">{b.subtitle}</p>
                    </div>

                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-lg font-semibold tabular-nums text-[var(--color-text-1)]">{fmtBRL(b.spent)}</p>
                      <p className="text-sm text-[var(--color-text-3)]">
                        Limite <span className="tabular-nums">{fmtBRL(b.limit)}</span>
                      </p>
                    </div>

                    <Progress value={pct} className={b.status.tone === "negative" ? "opacity-80" : ""} />

                    <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-text-3)]">
                      <span className="tabular-nums">Gasto: {Math.round(pct)}%</span>
                      <span className="tabular-nums">{remainingLabel}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="shadow-none lg:col-span-2">
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-1)]">Resumo Mensal</p>
                  <p className="mt-1 text-sm text-[var(--color-text-3)]">
                    Sua economia este mês é de <span className="font-semibold text-[var(--color-text-1)]">12%</span> em relação ao mês passado.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Total Gasto</p>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-text-1)]">{fmtBRL(4820)}</p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Total Limite</p>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-text-1)]">{fmtBRL(6500)}</p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">74% Global</p>
                    <Progress value={74} className="mt-3" />
                    <p className="mt-2 text-xs text-[var(--color-text-3)]">
                      Você ainda tem <span className="tabular-nums text-[var(--color-text-1)]">{fmtBRL(1680)}</span> disponíveis antes de atingir sua meta de economia.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-text-3)]">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="group" />
                    <span className="font-semibold text-[var(--color-text-1)]">+2</span> membros monitorando estes orçamentos.
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-1))]">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="trending_up" />
                  <p className="text-sm font-semibold text-[var(--color-text-1)]">Investimentos Direcionados</p>
                </div>
                <ul className="space-y-2 text-sm">
                  {[
                    { k: "Reserva Emergência", v: "+R$ 450,00" },
                    { k: "Fundo de Viagem", v: "+R$ 200,00" },
                    { k: "Aposentadoria", v: "+R$ 1.200,00" },
                  ].map((i) => (
                    <li key={i.k} className="flex items-center justify-between gap-3">
                      <span className="text-[var(--color-text-1)]">{i.k}</span>
                      <span className="tabular-nums font-semibold text-[var(--color-positive)]">{i.v}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" size="sm" className="mt-2 w-full rounded-full">
                  Ver Detalhes do Plano
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--color-text-1)]">Outras Categorias</p>
              <button type="button" className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-strong)] hover:underline">
                Gerenciar Todas
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {demoOther.map((c) => (
                <Card key={c.label} className="shadow-none">
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-surface-3)_45%,transparent)] text-[var(--color-text-2)]">
                        <Icon name={c.icon} />
                      </span>
                      <p className="text-sm font-semibold text-[var(--color-text-1)]">{c.label}</p>
                    </div>
                    <p className="text-xs tabular-nums text-[var(--color-text-3)]">
                      {fmtBRL(c.spent)} / {fmtBRL(c.limit)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

