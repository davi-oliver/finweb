"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePfTransactions } from "@/app/(dashboard)/modules/hooks/use-pf-transactions";
import { usePfAccounts } from "@/app/(dashboard)/modules/hooks/use-pf-accounts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { usePfCategories } from "@/app/(dashboard)/modules/hooks/use-pf-categories";
import { PfCreateTransactionModal } from "@/app/components/PersonalFinance/pf-create-transaction-modal";

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDayHeadingPT(dateISO: string) {
  const d = new Date(`${dateISO}T00:00:00`);
  const now = new Date();
  const todayISO = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
  const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString().slice(0, 10);
  const day = d.getDate();
  const mon = d.toLocaleDateString("pt-BR", { month: "long" });
  if (dateISO === todayISO) return `Hoje, ${day} de ${mon}`;
  if (dateISO === yest) return `Ontem, ${day} de ${mon}`;
  return `${day} de ${mon}`;
}

function fmtTimeHM(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function txIcon(description?: string | null, categoryName?: string | null, kind?: string) {
  const d = (description ?? "").toLowerCase();
  const c = (categoryName ?? "").toLowerCase();
  if (kind === "income") return "payments";
  if (kind === "transfer") return "swap_horiz";
  if (d.includes("uber") || c.includes("transporte") || d.includes("99")) return "directions_car";
  if (c.includes("lazer") || d.includes("madero") || d.includes("restaurant")) return "restaurant";
  if (c.includes("aliment") || d.includes("super") || d.includes("pão de açúcar")) return "shopping_bag";
  if (c.includes("invest") || d.includes("dividend")) return "trending_up";
  return "shopping_bag";
}

function signedDisplayAmount(kind: "income" | "expense" | "transfer", raw: number): number {
  const n = Math.abs(Number(raw) || 0);
  if (kind === "expense") return -n;
  return n;
}

export function PfTransactionsScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [monthPreset, setMonthPreset] = useState(true);
  const [txOpen, setTxOpen] = useState(false);

  const { from, to } = useMemo(() => {
    if (!monthPreset) return { from: undefined as string | undefined, to: undefined as string | undefined };
    const now = new Date();
    const f = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const t = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    return { from: f, to: t };
  }, [monthPreset]);

  const { items, loading, error, reload } = usePfTransactions(from, to, 100);
  const { items: accounts, reload: reloadAccounts } = usePfAccounts();
  const expenseCats = usePfCategories("expense");
  const incomeCats = usePfCategories("income");

  const catsById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of expenseCats.items) m.set(c.id, c.name);
    for (const c of incomeCats.items) m.set(c.id, c.name);
    return m;
  }, [expenseCats.items, incomeCats.items]);

  const accountsById = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a.name]));
  }, [accounts]);

  const list = useMemo(() => {
    return items.map((t) => {
      const category = t.category_id
        ? (catsById.get(t.category_id) ?? "Categoria")
        : t.kind === "income"
          ? "Receita"
          : t.kind === "transfer"
            ? "Transferência"
            : "—";
      const amount = signedDisplayAmount(t.kind, t.amount);
      const accountName =
        t.kind === "transfer" && t.counterparty_account_id
          ? `${accountsById.get(t.account_id) ?? "Conta"} → ${accountsById.get(t.counterparty_account_id) ?? "Conta"}`
          : (accountsById.get(t.account_id) ?? "Conta");
      return {
        id: t.id,
        kind: t.kind,
        description: t.description ?? t.kind,
        category,
        account: accountName,
        amount,
        occurred_on: t.occurred_on,
        time: fmtTimeHM(t.created_at),
        icon: txIcon(t.description, category, t.kind),
      };
    });
  }, [items, catsById, accountsById]);

  const grouped = useMemo(() => {
    const m = new Map<string, typeof list>();
    for (const t of list) {
      const k = t.occurred_on.slice(0, 10);
      const arr = m.get(k) ?? [];
      arr.push(t);
      m.set(k, arr);
    }
    return Array.from(m.entries()).sort(([a], [b]) => (a > b ? -1 : 1));
  }, [list]);

  useEffect(() => {
    if (searchParams.get("new") === "1") setTxOpen(true);
  }, [searchParams]);

  const closeTxModal = useCallback(() => {
    setTxOpen(false);
    if (searchParams.get("new") === "1") {
      router.replace("/personal-finance/transactions", { scroll: false });
    }
  }, [router, searchParams]);

  const onTxSuccess = useCallback(() => {
    void reload();
    void reloadAccounts();
  }, [reload, reloadAccounts]);

  return (
    <div className="space-y-6">
      <PfCreateTransactionModal open={txOpen} onClose={closeTxModal} onSuccess={onTxSuccess} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Finanças pessoais</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-text-1)]">Transações</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full px-3"
            onClick={() => setMonthPreset(true)}
          >
            <Icon name="calendar_today" />
            Mês atual
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full px-3">
            <Icon name="credit_card" />
            Todos Cartões
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full px-3">
            <Icon name="category" />
            Categorias
          </Button>
          <Button variant="primary" size="sm" className="rounded-full px-3" type="button" onClick={() => setTxOpen(true)}>
            <Icon name="add" />
            Nova Transação
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="shadow-none">
          <CardContent className="p-4 text-sm text-[var(--color-text-2)]">Carregando…</CardContent>
        </Card>
      ) : error ? (
        <Card className="shadow-none">
          <CardContent className="p-4 text-sm text-[var(--color-negative)]">{error}</CardContent>
        </Card>
      ) : !items.length ? (
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-1)] p-6 text-center shadow-[var(--shadow-1)]/25">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-surface-3)_55%,transparent)] text-[var(--color-text-2)]">
            <Icon name="history_toggle_off" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--color-text-1)]">Nenhuma transação neste período</p>
          <p className="mt-1 text-sm text-[var(--color-text-3)]">
            Quando você registrar receitas, despesas ou transferências, elas aparecem aqui — sem lançamentos de exemplo.
          </p>
          <div className="mt-4 flex justify-center">
            <Button variant="primary" className="rounded-full px-4" type="button" onClick={() => setTxOpen(true)}>
              <Icon name="add" />
              Nova transação
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, txs]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--color-text-1)]">{fmtDayHeadingPT(date)}</h3>
              <div className="space-y-2">
                {txs.map((t) => {
                  const positive = t.amount >= 0;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-1)] px-4 py-3 shadow-[var(--shadow-1)]/30"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]">
                          <Icon name={t.icon} filled />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--color-text-1)]">{t.description}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-text-3)]">
                            <span className="inline-flex items-center gap-1">
                              <Icon name="category" />
                              {t.category}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Icon name="credit_card" />
                              <span className="truncate">{t.account}</span>
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`tabular-nums text-sm font-semibold ${t.kind === "transfer" ? "text-[var(--color-text-2)]" : positive ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
                          {t.kind === "transfer" ? "" : positive ? "+ " : "− "}{fmtBRL(Math.abs(t.amount))}
                        </p>
                        <p className="mt-0.5 tabular-nums text-xs text-[var(--color-text-3)]">{t.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <Button variant="secondary" className="rounded-full px-4">
              Ver mais transações
              <Icon name="expand_more" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
