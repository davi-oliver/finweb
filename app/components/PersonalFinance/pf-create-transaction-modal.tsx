"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ModalBackdrop, ModalPanel } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PfTransactionKind } from "@/lib/personal-finance-types";
import { usePfAccounts } from "@/app/(dashboard)/modules/hooks/use-pf-accounts";
import { usePfCategories } from "@/app/(dashboard)/modules/hooks/use-pf-categories";
import { pfInputLikeClass, pfLabelClass } from "@/app/components/PersonalFinance/pf-form-classes";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseAmount(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "");
  if (!t) return null;
  const normalized = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function PfCreateTransactionModal({ open, onClose, onSuccess }: Props) {
  const titleId = useId();
  const firstRef = useRef<HTMLSelectElement>(null);
  const { items: accounts, loading: accLoading, reload: reloadAccounts } = usePfAccounts();
  const incomeCats = usePfCategories("income");
  const expenseCats = usePfCategories("expense");

  const [kind, setKind] = useState<PfTransactionKind>("expense");
  const [accountId, setAccountId] = useState("");
  const [counterpartyId, setCounterpartyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [occurredOn, setOccurredOn] = useState(todayISO);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setKind("expense");
    setAccountId("");
    setCounterpartyId("");
    setCategoryId("");
    setAmount("");
    setOccurredOn(todayISO());
    setDescription("");
    setFormError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    void reloadAccounts();
    void incomeCats.reload();
    void expenseCats.reload();
  }, [open, reloadAccounts, incomeCats.reload, expenseCats.reload]);

  useEffect(() => {
    if (!open) return;
    reset();
    queueMicrotask(() => firstRef.current?.focus());
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  useEffect(() => {
    if (accounts.length && !accountId) {
      setAccountId(accounts[0]!.id);
    }
  }, [accounts, accountId]);

  const categories = kind === "income" ? incomeCats.items : kind === "expense" ? expenseCats.items : [];

  useEffect(() => {
    if (kind === "transfer") return;
    if (categories.length && !categoryId) {
      setCategoryId(categories[0]!.id);
    }
  }, [kind, categories, categoryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!accounts.length) {
      setFormError("Cadastre pelo menos uma conta antes de lançar.");
      return;
    }
    if (!accountId) {
      setFormError("Selecione a conta.");
      return;
    }

    const amt = parseAmount(amount);
    if (amt == null) {
      setFormError("Informe um valor maior que zero.");
      return;
    }

    if (kind !== "transfer" && !categories.length) {
      setFormError(kind === "income" ? "Cadastre uma categoria de receita antes." : "Cadastre uma categoria de despesa antes.");
      return;
    }

    if (kind !== "transfer" && !categoryId) {
      setFormError("Selecione uma categoria.");
      return;
    }

    if (kind === "transfer") {
      if (!counterpartyId) {
        setFormError("Selecione a conta de destino.");
        return;
      }
      if (counterpartyId === accountId) {
        setFormError("A conta de destino deve ser diferente da origem.");
        return;
      }
    }

    const body: Record<string, unknown> = {
      kind,
      account_id: accountId,
      amount: amt,
      occurred_on: occurredOn,
      description: description.trim() || undefined,
    };
    if (kind !== "transfer") body.category_id = categoryId;
    if (kind === "transfer") body.counterparty_account_id = counterpartyId;

    setSubmitting(true);
    const res = await fetch("/api/personal-finance/transactions", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setSubmitting(false);
    if (!res.ok) {
      setFormError(json.error ?? "Não foi possível salvar o lançamento.");
      return;
    }
    onSuccess?.();
    onClose();
  }

  if (!open) return null;

  const counterpartyOptions = accounts.filter((a) => a.id !== accountId);

  return (
    <>
      <ModalBackdrop onClick={() => !submitting && onClose()} aria-hidden />
      <ModalPanel aria-labelledby={titleId} className="max-h-[90vh] overflow-y-auto">
        <h2 id={titleId} className="text-lg font-semibold text-[var(--color-text-1)]">
          Novo lançamento
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-3)]">Receitas, despesas ou transferência entre suas contas.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <span className={pfLabelClass}>Tipo</span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["expense", "Despesa"],
                  ["income", "Receita"],
                  ["transfer", "Transferência"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setKind(k);
                    setCategoryId("");
                    if (k === "transfer") setCounterpartyId("");
                  }}
                  className={[
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    kind === k
                      ? "bg-[var(--color-accent-strong)] text-[var(--color-text-invert)]"
                      : "bg-[color-mix(in_srgb,var(--color-surface-3)_55%,transparent)] text-[var(--color-text-2)] hover:text-[var(--color-text-1)]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="pf-tx-account" className={pfLabelClass}>
              Conta {kind === "transfer" ? "(origem)" : ""}
            </label>
            <select
              ref={firstRef}
              id="pf-tx-account"
              className={pfInputLikeClass}
              disabled={accLoading || !accounts.length}
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {kind === "transfer" ? (
            <div>
              <label htmlFor="pf-tx-to" className={pfLabelClass}>
                Conta destino
              </label>
              <select
                id="pf-tx-to"
                className={pfInputLikeClass}
                value={counterpartyId}
                onChange={(e) => setCounterpartyId(e.target.value)}
              >
                <option value="">Selecione…</option>
                {counterpartyOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="pf-tx-cat" className={pfLabelClass}>
                Categoria
              </label>
              <select
                id="pf-tx-cat"
                className={pfInputLikeClass}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={kind === "income" ? incomeCats.loading : expenseCats.loading}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="pf-tx-amount" className={pfLabelClass}>
              Valor
            </label>
            <Input id="pf-tx-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
          </div>

          <div>
            <label htmlFor="pf-tx-date" className={pfLabelClass}>
              Data
            </label>
            <Input id="pf-tx-date" type="date" value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)} />
          </div>

          <div>
            <label htmlFor="pf-tx-desc" className={pfLabelClass}>
              Descrição (opcional)
            </label>
            <Input id="pf-tx-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Supermercado" />
          </div>

          {formError ? <p className="text-sm text-[var(--color-negative)]">{formError}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" className="rounded-full" disabled={submitting} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="rounded-full" disabled={submitting}>
              {submitting ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </ModalPanel>
    </>
  );
}
