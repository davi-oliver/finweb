"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePfAccounts } from "@/app/(dashboard)/modules/hooks/use-pf-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { useMemo, useState } from "react";
import type { PfAccount } from "@/lib/personal-finance-types";
import { PfCreateAccountModal } from "@/app/components/PersonalFinance/pf-create-account-modal";

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "A";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

function displayTypeForAccount(a: PfAccount): string {
  if (a.type === "checking") return "Corrente";
  if (a.type === "investment") return "Investimento";
  if (a.type === "cash") return "Espécie";
  return a.type ?? "Conta";
}

export function PfAccountsScreen() {
  const { items, loading, error, reload } = usePfAccounts();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [createOpen, setCreateOpen] = useState(false);

  const list = useMemo(
    () =>
      (items as PfAccount[]).map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        initial_balance: a.initial_balance,
        currency: a.currency,
        displayType: displayTypeForAccount(a),
      })),
    [items],
  );

  const totalWealth = useMemo(
    () => items.reduce((acc, a) => acc + Number(a.initial_balance || 0), 0),
    [items],
  );

  const hasAccounts = items.length > 0;

  return (
    <div className="space-y-6">
      <PfCreateAccountModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={() => void reload()} />

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-[var(--color-text-1)]">Contas</h2>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" className="rounded-full px-3" type="button" onClick={() => setCreateOpen(true)}>
            <Icon name="account_balance" />
            Nova Conta
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full px-3"
            disabled
            title="Relatórios ainda não estão disponíveis nesta versão."
          >
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
      ) : !hasAccounts ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center sm:py-14">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]">
              <Icon name="account_balance_wallet" size={28} />
            </span>
            <div className="max-w-md space-y-2">
              <p className="text-base font-semibold text-[var(--color-text-1)]">Nenhuma conta cadastrada</p>
              <p className="text-sm text-[var(--color-text-2)]">
                Cadastre onde seu dinheiro está para ver patrimônio e lançamentos alinhados à sua realidade — sem dados de exemplo.
              </p>
            </div>
            <Button variant="primary" size="sm" className="rounded-full px-5" type="button" onClick={() => setCreateOpen(true)}>
              <Icon name="add" />
              Criar primeira conta
            </Button>
            <p className="text-xs text-[var(--color-text-3)]">
              Dica: você pode ter corrente, investimentos, dinheiro em espécie e outros tipos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="shadow-none lg:col-span-2">
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Patrimônio total</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--color-text-1)]">{fmtBRL(totalWealth)}</p>
                  <p className="mt-2 text-sm text-[var(--color-text-3)]">Soma dos saldos iniciais das contas ativas.</p>
                </div>
                <div className="hidden text-[var(--color-text-3)] sm:block">
                  <Icon name="account_balance" size={42} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Contas ativas</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--color-text-1)]">{items.length}</p>
                </div>
                <div className="text-[var(--color-text-3)]">
                  <Icon name="layers" size={36} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-1)]">Suas contas</h3>
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
              const badgeText = initials(a.name);
              const badgeTone = "bg-[color-mix(in_srgb,var(--color-surface-3)_55%,transparent)] text-[var(--color-text-1)]";
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

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="text-left shadow-none ring-0 transition-[filter] duration-[var(--dur-2)] hover:brightness-[1.02]"
            >
              <Card className="shadow-none">
                <CardContent className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-1)]">Adicionar conta</p>
                    <p className="mt-1 text-sm text-[var(--color-text-3)]">Registre outro lugar onde guarda recursos.</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]">
                    <Icon name="add" />
                  </span>
                </CardContent>
              </Card>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
