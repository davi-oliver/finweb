"use client";

import { useMemo, useState, useCallback } from "react";
import { usePfBudgets } from "@/app/(dashboard)/modules/hooks/use-pf-budgets";
import { usePfSummary } from "@/app/(dashboard)/modules/hooks/use-pf-summary";
import { usePfCategories } from "@/app/(dashboard)/modules/hooks/use-pf-categories";
import { PfCreateBudgetModal } from "@/app/components/PersonalFinance/pf-create-budget-modal";
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

const CATEGORY_ICONS = [
  "restaurant",
  "directions_car",
  "home",
  "school",
  "subscriptions",
  "movie",
  "medical_services",
  "shopping_bag",
  "category",
] as const;

function iconForCategory(name: string): string {
  const n = name.trim().toLowerCase();
  if (n.includes("aliment") || n.includes("mercado")) return "restaurant";
  if (n.includes("transport") || n.includes("uber")) return "directions_car";
  if (n.includes("morad") || n.includes("alug")) return "home";
  if (n.includes("saúde") || n.includes("saude") || n.includes("medic")) return "medical_services";
  return CATEGORY_ICONS[name.length % CATEGORY_ICONS.length] ?? "category";
}

function budgetStatus(spent: number, limit: number): { label: string; tone: "positive" | "warning" | "negative" | "neutral" } {
  if (limit <= 0) return { label: "Sem limite", tone: "neutral" };
  const ratio = spent / limit;
  if (ratio > 1) return { label: "Excedido", tone: "negative" };
  if (ratio >= 0.9) return { label: "Atenção", tone: "warning" };
  return { label: "No controle", tone: "positive" };
}

export function PfBudgetsScreen() {
  const { year, month, from, to } = useMemo(() => monthRange(), []);
  const budgets = usePfBudgets(year, month);
  const summary = usePfSummary(from, to);
  const expenseCats = usePfCategories("expense");
  const [monthPreset] = useState(true);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  const onBudgetSuccess = useCallback(() => {
    void budgets.reload();
    void summary.reload();
    void expenseCats.reload();
  }, [budgets.reload, summary.reload, expenseCats.reload]);

  const catById = useMemo(() => new Map(expenseCats.items.map((c) => [c.id, c])), [expenseCats.items]);

  const expenseByCat = summary.data?.expense_by_category_id ?? {};

  const budgetRows = useMemo(() => {
    return budgets.items.map((b) => {
      const cat = catById.get(b.category_id);
      const name = cat?.name ?? "Categoria";
      const spent = Number(expenseByCat[b.category_id] ?? 0);
      const limit = Number(b.amount_limit ?? 0);
      const status = budgetStatus(spent, limit);
      const pct = limit > 0 ? Math.min(150, (spent / limit) * 100) : 0;
      return {
        id: b.id,
        icon: iconForCategory(name),
        status,
        title: name,
        subtitle: b.period_type === "monthly" ? "Orçamento mensal" : "Orçamento anual",
        spent,
        limit,
        pct,
      };
    });
  }, [budgets.items, catById, expenseByCat]);

  const totals = useMemo(() => {
    const limitSum = budgets.items.reduce((s, b) => s + Number(b.amount_limit ?? 0), 0);
    const spentMapped = budgets.items.reduce((s, b) => s + Number(expenseByCat[b.category_id] ?? 0), 0);
    const expenseMonth = summary.data?.totals.expense ?? 0;
    return { limitSum, spentMapped, expenseMonth };
  }, [budgets.items, expenseByCat, summary.data]);

  const globalPct = totals.limitSum > 0 ? Math.min(100, (totals.spentMapped / totals.limitSum) * 100) : 0;
  const remainingGlobal = totals.limitSum - totals.spentMapped;

  return (
    <div className="space-y-6">
      <PfCreateBudgetModal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onSuccess={onBudgetSuccess}
        periodYear={year}
        periodMonth={month}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Planejamento financeiro</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-text-1)]">Orçamentos</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="rounded-full px-3" disabled={!monthPreset}>
            <Icon name="calendar_today" />
            Mês atual
          </Button>
          <Button variant="primary" size="sm" className="rounded-full px-3" type="button" onClick={() => setBudgetModalOpen(true)}>
            <Icon name="add" />
            Novo orçamento
          </Button>
        </div>
      </div>

      {budgets.loading || summary.loading || expenseCats.loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[140px]" />
          <Skeleton className="h-[140px]" />
          <Skeleton className="h-[140px]" />
        </div>
      ) : budgets.error || summary.error || expenseCats.error ? (
        <p className="text-sm text-[var(--color-negative)]">{budgets.error ?? summary.error ?? expenseCats.error}</p>
      ) : !budgetRows.length ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Icon name="savings" className="text-[var(--color-text-3)]" size={36} />
            <p className="text-sm font-semibold text-[var(--color-text-1)]">Nenhum orçamento neste mês</p>
            <p className="max-w-md text-sm text-[var(--color-text-2)]">
              Crie limites por categoria para acompanhar o quanto já gastou em relação ao planejado — os valores vêm das suas despesas reais.
            </p>
            <Button variant="primary" size="sm" className="rounded-full px-5" type="button" onClick={() => setBudgetModalOpen(true)}>
              <Icon name="add" />
              Criar orçamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgetRows.map((b) => {
              const remaining = b.limit - b.spent;
              const remainingLabel =
                b.limit <= 0
                  ? "Defina um limite para acompanhar o progresso."
                  : remaining >= 0
                    ? `Restante: ${fmtBRL(remaining)}`
                    : `Diferença: −${fmtBRL(Math.abs(remaining))}`;
              return (
                <Card key={b.id} className="shadow-none">
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

                    <Progress value={b.limit > 0 ? Math.min(100, b.pct) : 0} className={b.status.tone === "negative" ? "opacity-80" : ""} />

                    <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-text-3)]">
                      <span className="tabular-nums">{b.limit > 0 ? `Gasto: ${Math.round(b.pct)}%` : "—"}</span>
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
                  <p className="text-sm font-semibold text-[var(--color-text-1)]">Resumo do mês</p>
                  <p className="mt-1 text-sm text-[var(--color-text-3)]">
                    Totais com base nas despesas do período e nos limites dos orçamentos cadastrados para este mês.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Despesas no mês</p>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-text-1)]">{fmtBRL(totals.expenseMonth)}</p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Soma dos limites</p>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-text-1)]">{fmtBRL(totals.limitSum)}</p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Uso agregado</p>
                    <Progress value={globalPct} className="mt-3" />
                    <p className="mt-2 text-xs text-[var(--color-text-3)]">
                      {totals.limitSum > 0 ? (
                        <>
                          Gasto nas categorias com orçamento:{" "}
                          <span className="tabular-nums font-medium text-[var(--color-text-1)]">{fmtBRL(totals.spentMapped)}</span>
                          {remainingGlobal >= 0 ? (
                            <>
                              . Abaixo do teto combinado por{" "}
                              <span className="tabular-nums text-[var(--color-text-1)]">{fmtBRL(remainingGlobal)}</span>.
                            </>
                          ) : (
                            <>
                              . Acima do teto combinado em{" "}
                              <span className="tabular-nums text-[var(--color-negative)]">{fmtBRL(Math.abs(remainingGlobal))}</span>.
                            </>
                          )}
                        </>
                      ) : (
                        "Defina limites nos orçamentos para ver o uso agregado."
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-1))]">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="info" />
                  <p className="text-sm font-semibold text-[var(--color-text-1)]">Como interpretar</p>
                </div>
                <p className="text-sm text-[var(--color-text-2)]">
                  O “gasto” de cada cartão usa apenas as despesas do mês naquela categoria. Transferências e receitas não entram nesses limites.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
