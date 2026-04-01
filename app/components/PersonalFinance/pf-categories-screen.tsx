"use client";

import { useMemo, useState } from "react";
import { usePfCategories } from "@/app/(dashboard)/modules/hooks/use-pf-categories";
import { Card, CardContent } from "@/components/ui/card";
import type { PfCategoryKind } from "@/lib/personal-finance-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function PfCategoriesScreen() {
  const [kind, setKind] = useState<PfCategoryKind | undefined>(undefined);
  const { items, loading, error } = usePfCategories(kind);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => (a.kind ?? "").localeCompare(b.kind ?? "") || (a.name ?? "").localeCompare(b.name ?? ""));
  }, [items]);

  const demo = [
    { id: "food", icon: "restaurant", name: "Food & Dining", amount: 840, tx: 12, pct: 85, kind: "expense" as const },
    { id: "transport", icon: "commute", name: "Transport", amount: 320.5, tx: 6, pct: 45, kind: "expense" as const },
    { id: "shopping", icon: "shopping_bag", name: "Shopping", amount: 1100, tx: 18, pct: 110, kind: "expense" as const },
    { id: "health", icon: "health_and_safety", name: "Health & Wellness", amount: 215, tx: 3, pct: 28, kind: "expense" as const },
    { id: "subs", icon: "smart_display", name: "Subscriptions", amount: 45.99, tx: 5, pct: 92, kind: "expense" as const },
  ];

  const demoInsights = useMemo(
    () => [
      { name: "Food & Dining", delta: "+12.7%" },
      { name: "Housing", delta: "+2.4%" },
      { name: "Stable", delta: "+4.2%" },
      { name: "Budget health", delta: "+1.1%" },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Portfolio organization</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-text-1)]">Manage Your Ledger</h2>
        </div>
        <div className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--color-surface-3)_55%,transparent)] p-1 text-xs">
          {[
            { k: "expense" as const, label: "Expenses" },
            { k: "income" as const, label: "Income" },
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
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="shadow-none">
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-[var(--color-text-1)]">Quick insights</p>
              <div className="space-y-2 text-sm">
                {demo.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3">
                    <span className="text-[var(--color-text-2)]">{c.name}</span>
                    <span className="tabular-nums text-[var(--color-positive)]">+{c.pct}%</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--color-text-3)]">Stable</p>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-3">
            {demo.map((c) => (
              <Card key={c.id} className="shadow-none">
                <CardContent className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]">
                      <Icon name={c.icon} filled />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-1)]">{c.name}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-3)]">
                        <span className="tabular-nums">{c.tx}</span> Transactions · <span className="tabular-nums">{c.pct}%</span> of budget
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-3)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-accent)]"
                          style={{ width: `${Math.min(100, c.pct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums text-sm font-semibold text-[var(--color-text-1)]">
                      {c.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-1 text-[var(--color-text-3)]">
                      <button type="button" className="rounded-full px-2 py-1 text-xs hover:bg-[var(--color-surface-3)]">
                        edit
                      </button>
                      <button type="button" className="rounded-full px-2 py-1 text-xs hover:bg-[var(--color-surface-3)]">
                        delete
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-text-3)]">
              <Icon name="cloud_done" />
              <span>All categories are synchronized across your Vault devices. Last backup: 2 minutes ago.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="shadow-none">
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-[var(--color-text-1)]">Quick insights</p>
              <div className="space-y-2 text-sm">
                {demoInsights.map((c) => (
                  <div key={c.name} className="flex items-center justify-between gap-3">
                    <span className="text-[var(--color-text-2)]">{c.name}</span>
                    <span className="tabular-nums text-[var(--color-positive)]">{c.delta}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--color-text-3)]">Stable</p>
              <Button variant="secondary" size="sm" className="w-full rounded-full">
                Create
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-3">
            {sorted.slice(0, 5).map((c, idx) => (
              <Card key={c.id} className="shadow-none">
                <CardContent className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]">
                      <Icon name={["restaurant", "commute", "shopping_bag", "health_and_safety", "smart_display"][idx % 5] ?? "category"} filled />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-1)]">{c.name}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-3)]">
                        <span className="tabular-nums">{(idx + 3) * 3}</span> Transactions · <span className="tabular-nums">{(idx + 2) * 18}%</span> of budget
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-3)]">
                        <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${Math.min(100, (idx + 2) * 18)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums text-sm font-semibold text-[var(--color-text-1)]">
                      {(idx * 240 + 320.5).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-1 text-[var(--color-text-3)]">
                      <button type="button" className="rounded-full px-2 py-1 text-xs hover:bg-[var(--color-surface-3)]">
                        edit
                      </button>
                      <button type="button" className="rounded-full px-2 py-1 text-xs hover:bg-[var(--color-surface-3)]">
                        delete
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-text-3)]">
              <Icon name="cloud_done" />
              <span>All categories are synchronized across your Vault devices. Last backup: 2 minutes ago.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

