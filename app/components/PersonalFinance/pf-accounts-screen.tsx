"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePfAccounts } from "@/app/(dashboard)/modules/hooks/use-pf-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { useMemo, useState } from "react";
import type { PfAccount } from "@/lib/personal-finance-types";

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "A";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

export function PfAccountsScreen() {
  const { items, loading, error } = usePfAccounts();
  const [view, setView] = useState<"grid" | "list">("grid");

  type AccountCard = Pick<PfAccount, "id" | "name" | "type" | "initial_balance" | "currency"> & {
    displayType?: string;
    badge?: string;
    tone?: string;
  };

  const demoAccounts = useMemo(
    (): AccountCard[] => [
      { id: "demo-nu", name: "Nubank", type: "checking", displayType: "Corrente", initial_balance: 12450, currency: "BRL", badge: "Nu", tone: "bg-violet-500/20 text-violet-200" },
      { id: "demo-xp", name: "XP Investimentos", type: "investment", displayType: "Investimento", initial_balance: 845200.5, currency: "BRL", badge: "XP", tone: "bg-yellow-500/20 text-yellow-200" },
      { id: "demo-cash", name: "Dinheiro", type: "cash", displayType: "Espécie", initial_balance: 1200, currency: "BRL", badge: "payments", tone: "bg-emerald-500/15 text-emerald-200" },
      { id: "demo-itau", name: "Itaú Personnalité", type: "checking", displayType: "Corrente", initial_balance: 381650.38, currency: "BRL", badge: "I", tone: "bg-orange-500/20 text-orange-200" },
    ],
    [],
  );

  const list: AccountCard[] = items.length
    ? (items as PfAccount[]).map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        initial_balance: a.initial_balance,
        currency: a.currency,
        displayType:
          a.type === "checking"
            ? "Corrente"
            : a.type === "investment"
              ? "Investimento"
              : a.type === "cash"
                ? "Espécie"
                : a.type,
      }))
    : demoAccounts;
  const totalWealth = items.length
    ? items.reduce((acc, a) => acc + Number(a.initial_balance || 0), 0)
    : demoAccounts.reduce((acc, a) => acc + a.initial_balance, 0);
  const available = items.length ? Math.max(0, totalWealth * 0.0345) : 42890.12;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-[var(--color-text-1)]">Contas</h2>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" className="rounded-full px-3">
            <Icon name="account_balance" />
            Nova Conta
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full px-3">
            Relatórios
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[132px] lg:col-span-2" />
          <Skeleton className="h-[132px]" />
          <div className="lg:col-span-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[118px]" />
            ))}
          </div>
        </div>
      ) : error ? (
        <p className="text-sm text-[var(--color-negative)]">{error}</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="shadow-none lg:col-span-2">
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Patrimônio Total</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--color-text-1)]">{fmtBRL(totalWealth)}</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--color-positive)]">
                    <Icon name="trending_up" />
                    + 4.2% este mês
                  </p>
                </div>
                <div className="hidden sm:block text-[var(--color-text-3)]">
                  <Icon name="account_balance" size={42} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Saldo Disponível</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--color-text-1)]">{fmtBRL(available)}</p>
                </div>
                <div className="grid h-12 w-20 grid-cols-5 items-end gap-1 opacity-70">
                  {[7, 10, 14, 9, 16].map((h, i) => (
                    <div key={i} className="rounded-sm bg-[var(--color-accent)]" style={{ height: `${h * 3}px` }} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-1)]">Suas Contas</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[var(--color-text-2)]",
                  view === "grid" ? "text-[var(--color-text-1)]" : "",
                ].join(" ")}
                aria-label="Grid"
              >
                <Icon name="grid_view" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[var(--color-text-2)]",
                  view === "list" ? "text-[var(--color-text-1)]" : "",
                ].join(" ")}
                aria-label="Lista"
              >
                <Icon name="list" />
              </button>
            </div>
          </div>

          <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
            {list.map((a) => {
              const amount = Number(a.initial_balance ?? 0);
              const displayType = a.displayType ?? a.type ?? "Conta";
              const badgeText = a.badge ?? initials(a.name);
              const badgeTone = a.tone ?? "bg-[color-mix(in_srgb,var(--color-surface-3)_55%,transparent)] text-[var(--color-text-1)]";
              return (
                <Card key={a.id} className="shadow-none">
                  <CardContent className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${badgeTone}`}>
                        {badgeText}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--color-text-1)]">{a.name}</p>
                        <p className="mt-0.5 text-xs text-[var(--color-text-3)]">{displayType}</p>
                        <p className="mt-2 text-lg font-semibold tabular-nums text-[var(--color-text-1)]">
                          {amount.toLocaleString("pt-BR", { style: "currency", currency: a.currency ?? "BRL" })}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)]"
                      aria-label="Mais opções"
                    >
                      <Icon name="more_vert" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}

            <Card className="shadow-none">
              <CardContent className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-1)]">Conectar Nova Instituição</p>
                  <p className="mt-1 text-sm text-[var(--color-text-3)]">Adicionar conta de banco/corretora</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]">
                  <Icon name="add" />
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] p-3 text-xs text-[var(--color-text-2)]">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { k: "Ibovespa", v: "128.450 pts", d: "+0.45%" },
                { k: "Dólar", v: "R$ 4,92", d: "-0.12%" },
                { k: "Bitcoin", v: "R$ 324.150", d: "+1.2%" },
                { k: "CDI", v: "11.15% aa", d: "" },
                { k: "IPCA", v: "4.51%", d: "" },
              ].map((i) => (
                <div key={i.k} className="flex items-center justify-between gap-2 rounded-full bg-[var(--color-surface-1)] px-3 py-2">
                  <span className="font-medium text-[var(--color-text-1)]">{i.k}</span>
                  <span className="tabular-nums">{i.v}</span>
                  {i.d ? <span className="tabular-nums text-[var(--color-text-3)]">{i.d}</span> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

