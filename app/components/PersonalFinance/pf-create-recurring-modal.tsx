"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ModalBackdrop, ModalPanel } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PfRecurringFrequency } from "@/lib/personal-finance-types";
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

const FREQUENCIES: { value: PfRecurringFrequency; label: string }[] = [
  { value: "monthly", label: "Mensal" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "daily", label: "Diário" },
  { value: "quarterly", label: "Trimestral" },
  { value: "yearly", label: "Anual" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function PfCreateRecurringModal({ open, onClose, onSuccess }: Props) {
  const titleId = useId();
  const firstRef = useRef<HTMLSelectElement>(null);
  const { items: accounts, loading: accLoading, reload: reloadAccounts } = usePfAccounts();
  const expenseCats = usePfCategories("expense");

  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<PfRecurringFrequency>("monthly");
  const [nextDue, setNextDue] = useState(todayISO);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setAccountId("");
    setCategoryId("");
    setAmount("");
    setFrequency("monthly");
    setNextDue(todayISO());
    setDescription("");
    setFormError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    void reloadAccounts();
    void expenseCats.reload();
  }, [open, reloadAccounts, expenseCats.reload]);

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
    if (accounts.length && !accountId) setAccountId(accounts[0]!.id);
  }, [accounts, accountId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!accounts.length) {
      setFormError("Cadastre uma conta antes.");
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
    if (!nextDue) {
      setFormError("Informe a próxima data de vencimento.");
      return;
    }

    const body: Record<string, unknown> = {
      account_id: accountId,
      amount: amt,
      frequency,
      next_due_date: nextDue,
      description: description.trim() || undefined,
      is_active: true,
    };
    if (categoryId) body.category_id = categoryId;

    setSubmitting(true);
    const res = await fetch("/api/personal-finance/recurring", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setSubmitting(false);
    if (!res.ok) {
      setFormError(json.error ?? "Não foi possível criar a recorrência.");
      return;
    }
    onSuccess?.();
    onClose();
  }

  if (!open) return null;

  return (
    <>
      <ModalBackdrop onClick={() => !submitting && onClose()} aria-hidden />
      <ModalPanel aria-labelledby={titleId} className="max-h-[90vh] overflow-y-auto">
        <h2 id={titleId} className="text-lg font-semibold text-[var(--color-text-1)]">
          Nova recorrência
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-3)]">Contas fixas como aluguel, assinaturas ou contas recorrentes.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="pf-rec-acc" className={pfLabelClass}>
              Conta
            </label>
            <select
              ref={firstRef}
              id="pf-rec-acc"
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
          <div>
            <label htmlFor="pf-rec-cat" className={pfLabelClass}>
              Categoria (opcional)
            </label>
            <select id="pf-rec-cat" className={pfInputLikeClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">—</option>
              {expenseCats.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pf-rec-amt" className={pfLabelClass}>
              Valor
            </label>
            <Input id="pf-rec-amt" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label htmlFor="pf-rec-freq" className={pfLabelClass}>
              Frequência
            </label>
            <select id="pf-rec-freq" className={pfInputLikeClass} value={frequency} onChange={(e) => setFrequency(e.target.value as PfRecurringFrequency)}>
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pf-rec-due" className={pfLabelClass}>
              Próximo vencimento
            </label>
            <Input id="pf-rec-due" type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
          </div>
          <div>
            <label htmlFor="pf-rec-desc" className={pfLabelClass}>
              Descrição (opcional)
            </label>
            <Input id="pf-rec-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Aluguel" />
          </div>
          {formError ? <p className="text-sm text-[var(--color-negative)]">{formError}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" className="rounded-full" disabled={submitting} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="rounded-full" disabled={submitting}>
              {submitting ? "Salvando…" : "Criar"}
            </Button>
          </div>
        </form>
      </ModalPanel>
    </>
  );
}
