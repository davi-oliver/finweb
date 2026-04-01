"use client";

import { usePfTransactions } from "@/app/(dashboard)/modules/hooks/use-pf-transactions";
import { usePfCategories } from "@/app/(dashboard)/modules/hooks/use-pf-categories";
import { Button } from "@/components/ui/button";
import { LedgerTable, LedgerRow, LedgerTableTable, LedgerTd, LedgerTh, LedgerThead } from "@/components/ui/ledger-table";
import { Icon } from "@/components/ui/icon";

function fmtDatePT(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  const year = d.getFullYear();
  const monCap = mon.charAt(0).toUpperCase() + mon.slice(1);
  return `${day} ${monCap}, ${year}`;
}

function iconForTx(description?: string | null, categoryName?: string | null, kind?: string) {
  const d = (description ?? "").toLowerCase();
  const c = (categoryName ?? "").toLowerCase();
  if (kind === "income") return "work";
  if (d.includes("uber") || c.includes("transporte") || d.includes("99")) return "directions_car";
  if (d.includes("cine") || d.includes("cinemark") || c.includes("lazer") || d.includes("movie")) return "movie";
  if (d.includes("super") || d.includes("merc") || d.includes("pão de açúcar") || c.includes("aliment")) return "shopping_cart";
  return kind === "transfer" ? "swap_horiz" : "shopping_cart";
}

export function RecentTransactionsTable() {
  const { items, loading, error } = usePfTransactions();
  const expenseCats = usePfCategories("expense");
  const incomeCats = usePfCategories("income");
  const catsById = new Map<string, { name: string }>();
  for (const c of expenseCats.items) catsById.set(c.id, { name: c.name });
  for (const c of incomeCats.items) catsById.set(c.id, { name: c.name });

  return (
    <LedgerTable
      header={
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-[var(--color-text-1)]">Transações</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="rounded-full px-3">
              <Icon name="download" />
              Exportar Relatório
            </Button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="p-4 text-sm text-[var(--color-text-2)]">Carregando…</div>
      ) : error ? (
        <div className="p-4 text-sm text-[var(--color-negative)]">{error}</div>
      ) : !items.length ? (
        <div className="p-4 text-sm text-[var(--color-text-2)]">Nenhuma transação.</div>
      ) : (
        <LedgerTableTable>
          <LedgerThead>
            <tr>
              <LedgerTh>Descrição</LedgerTh>
              <LedgerTh>Categoria</LedgerTh>
              <LedgerTh>Data</LedgerTh>
              <LedgerTh className="text-right">Valor</LedgerTh>
            </tr>
          </LedgerThead>
          <tbody>
            {items.slice(0, 6).map((t) => {
              const amount = Number(t.amount);
              const sign = amount >= 0 ? "+" : "−";
              const abs = Math.abs(amount);
              const categoryName = t.category_id ? catsById.get(t.category_id)?.name ?? null : null;
              const leadingIcon = iconForTx(t.description, categoryName, t.kind);
              const tone =
                t.kind === "income"
                  ? "text-[var(--color-positive)]"
                  : t.kind === "expense"
                    ? "text-[var(--color-negative)]"
                    : "text-[var(--color-text-1)]";
              return (
                <LedgerRow key={t.id}>
                  <LedgerTd>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-surface-3)_40%,transparent)] text-[var(--color-text-2)]">
                        <Icon name={leadingIcon} />
                      </span>
                      <div>
                        <div className="font-medium text-[var(--color-text-1)]">{t.description ?? t.kind}</div>
                        <div className="text-xs text-[var(--color-text-3)]">{t.kind}</div>
                      </div>
                    </div>
                  </LedgerTd>
                  <LedgerTd className="text-[var(--color-text-2)]">{categoryName ?? (t.kind === "income" ? "Receita" : "—")}</LedgerTd>
                  <LedgerTd className="tabular-nums text-[var(--color-text-2)]">{fmtDatePT(t.occurred_on)}</LedgerTd>
                  <LedgerTd className="text-right">
                    <span className={`tabular-nums font-semibold ${tone}`}>
                      {sign}{" "}
                      {abs.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </LedgerTd>
                </LedgerRow>
              );
            })}
          </tbody>
        </LedgerTableTable>
      )}
    </LedgerTable>
  );
}

