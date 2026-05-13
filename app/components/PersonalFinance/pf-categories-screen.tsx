"use client";

import { useCallback, useMemo, useState } from "react";
import { usePfCategories } from "@/app/(dashboard)/modules/hooks/use-pf-categories";
import { PfCreateCategoryModal } from "@/app/components/PersonalFinance/pf-create-category-modal";
import { usePfSummary } from "@/app/(dashboard)/modules/hooks/use-pf-summary";
import { Card, CardContent } from "@/components/ui/card";
import type { PfCategoryKind } from "@/lib/personal-finance-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

function monthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function kindLabel(k: PfCategoryKind): string {
  return k === "income" ? "Receita" : "Despesa";
}

export function PfCategoriesScreen() {
  const [kind, setKind] = useState<PfCategoryKind | undefined>(undefined);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const { items, loading, error, reload: reloadCategories } = usePfCategories(kind);
  const expenseCats = usePfCategories("expense");
  const { from, to } = useMemo(() => monthRange(), []);
  const summary = usePfSummary(from, to);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => (a.kind ?? "").localeCompare(b.kind ?? "") || (a.name ?? "").localeCompare(b.name ?? ""));
  }, [items]);

  const topExpenseByCategory = useMemo(() => {
    const map = summary.data?.expense_by_category_id ?? {};
    const byId = new Map(expenseCats.items.map((c) => [c.id, c]));
    return Object.entries(map)
      .map(([id, amount]) => ({
        id,
        amount: Number(amount) || 0,
        name:
          id === "uncategorized"
            ? "Sem categoria"
            : (byId.get(id)?.name ?? "Categoria"),
      }))
      .filter((x) => x.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [summary.data, expenseCats.items]);

  const expenseById = useMemo(() => {
    return summary.data?.expense_by_category_id ?? {};
  }, [summary.data]);

  const onCategorySuccess = useCallback(() => {
    void reloadCategories();
    void expenseCats.reload();
    void summary.reload();
  }, [reloadCategories, expenseCats.reload, summary.reload]);

  const defaultKindForModal: "income" | "expense" = kind === "income" ? "income" : "expense";

  return (
    <div className="space-y-6">
      <PfCreateCategoryModal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        onSuccess={onCategorySuccess}
        defaultKind={defaultKindForModal}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Organização</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-text-1)]">Categorias</h2>
        </div>
        <div className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--color-surface-3)_55%,transparent)] p-1 text-xs">
          {[
            { k: "expense" as const, label: "Despesas" },
            { k: "income" as const, label: "Receitas" },
          ].map((t) => {
            const active = kind === t.k;
            return (
              <button
                key={t.k}
                type="button"
                onClick={() => setKind(active ? undefined : t.k)}
                className={[
                  "rounded-full px-3 py-1 font-medium transition-[background-color,color] duration-[var(--dur-2)] ease-[var(--ease-standard)]",
                  active ? "bg-[var(--color-surface-1)] text-[var(--color-text-1)] shadow-[var(--shadow-1)]/35" : "text-[var(--color-text-2)] hover:text-[var(--color-text-1)]",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[240px]" />
          <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[106px]" />
            ))}
          </div>
        </div>
      ) : error ? (
        <p className="text-sm text-[var(--color-negative)]">{error}</p>
      ) : !sorted.length ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center sm:py-14">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]">
              <Icon name="category" size={28} />
            </span>
            <div className="max-w-md space-y-2">
              <p className="text-base font-semibold text-[var(--color-text-1)]">Nenhuma categoria neste filtro</p>
              <p className="text-sm text-[var(--color-text-2)]">
                Quando você ou o produto cadastrarem categorias, elas aparecem aqui — sem listas de exemplo.
              </p>
            </div>
            <Button variant="secondary" size="sm" className="rounded-full px-5" type="button" onClick={() => setCatModalOpen(true)}>
              Nova categoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="shadow-none">
            <CardContent className="space-y-4">
              <p className="text-sm font-semibold text-[var(--color-text-1)]">Resumo do mês</p>
              {summary.loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : summary.error ? (
                <p className="text-xs text-[var(--color-negative)]">{summary.error}</p>
              ) : summary.data ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3 text-[var(--color-text-2)]">
                    <span>Receitas</span>
                    <span className="tabular-nums font-medium text-[var(--color-text-1)]">{fmtBRL(summary.data.totals.income)}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-[var(--color-text-2)]">
                    <span>Despesas</span>
                    <span className="tabular-nums font-medium text-[var(--color-text-1)]">{fmtBRL(summary.data.totals.expense)}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-[var(--color-border)] pt-2 text-[var(--color-text-2)]">
                    <span>Resultado</span>
                    <span
                      className={`tabular-nums font-semibold ${summary.data.totals.result >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}
                    >
                      {fmtBRL(summary.data.totals.result)}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="border-t border-[var(--color-border)] pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Maiores despesas por categoria</p>
                {summary.loading ? (
                  <div className="mt-2 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : topExpenseByCategory.length ? (
                  <ul className="mt-2 space-y-2 text-sm">
                    {topExpenseByCategory.map((row) => (
                      <li key={row.id} className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-[var(--color-text-2)]">{row.name}</span>
                        <span className="shrink-0 tabular-nums font-medium text-[var(--color-text-1)]">{fmtBRL(row.amount)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-[var(--color-text-3)]">Nenhuma despesa com categoria neste mês.</p>
                )}
              </div>

              <Button variant="secondary" size="sm" className="w-full rounded-full" type="button" onClick={() => setCatModalOpen(true)}>
                Nova categoria
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-3">
            {sorted.map((c) => {
              const spent =
                c.kind === "expense" && expenseById[c.id] != null ? Number(expenseById[c.id]) : null;
              const dotStyle = c.color ? { backgroundColor: c.color } : undefined;
              return (
                <Card key={c.id} className="shadow-none">
                  <CardContent className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className="mt-1 inline-flex h-3 w-3 shrink-0 rounded-full bg-[var(--color-accent)]"
                        style={dotStyle}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text-1)]">{c.name}</p>
                        <p className="mt-0.5 text-xs text-[var(--color-text-3)]">
                          {kindLabel(c.kind)}
                          {c.is_system ? " · Sugestão do sistema" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {spent != null && spent > 0 ? (
                        <p className="tabular-nums text-sm font-semibold text-[var(--color-text-1)]">{fmtBRL(spent)}</p>
                      ) : c.kind === "expense" ? (
                        <p className="text-xs text-[var(--color-text-3)]">Sem despesa no mês</p>
                      ) : (
                        <p className="text-xs text-[var(--color-text-3)]">—</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
