"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ModalBackdrop, ModalPanel } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePfCategories } from "@/app/(dashboard)/modules/hooks/use-pf-categories";
import { pfInputLikeClass, pfLabelClass } from "@/app/components/PersonalFinance/pf-form-classes";

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
  periodYear: number;
  periodMonth: number;
};

export function PfCreateBudgetModal({ open, onClose, onSuccess, periodYear, periodMonth }: Props) {
  const titleId = useId();
  const firstRef = useRef<HTMLSelectElement>(null);
  const expenseCats = usePfCategories("expense");
  const [categoryId, setCategoryId] = useState("");
  const [amountLimit, setAmountLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setCategoryId("");
    setAmountLimit("");
    setFormError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    void expenseCats.reload();
  }, [open, expenseCats.reload]);

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
    if (open && expenseCats.items.length && !categoryId) {
      setCategoryId(expenseCats.items[0]!.id);
    }
  }, [open, expenseCats.items, categoryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!categoryId) {
      setFormError("Selecione uma categoria de despesa.");
      return;
    }
    const limit = parseAmount(amountLimit);
    if (limit == null) {
      setFormError("Informe um limite maior que zero.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/personal-finance/budgets", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: categoryId,
        amount_limit: limit,
        period_type: "monthly",
        period_year: periodYear,
        period_month: periodMonth,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setSubmitting(false);
    if (!res.ok) {
      setFormError(json.error ?? "Não foi possível criar o orçamento.");
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
          Novo orçamento
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-3)]">
          Limite mensal para {periodMonth}/{periodYear}. O progresso usa suas despesas reais na categoria.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="pf-bud-cat" className={pfLabelClass}>
              Categoria (despesa)
            </label>
            <select
              ref={firstRef}
              id="pf-bud-cat"
              className={pfInputLikeClass}
              disabled={expenseCats.loading || !expenseCats.items.length}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {expenseCats.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.is_system ? " (sistema)" : ""}
                </option>
              ))}
            </select>
            {!expenseCats.items.length && !expenseCats.loading ? (
              <p className="mt-1 text-xs text-[var(--color-text-3)]">Nenhuma categoria de despesa disponível.</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="pf-bud-limit" className={pfLabelClass}>
              Limite (BRL)
            </label>
            <Input id="pf-bud-limit" inputMode="decimal" value={amountLimit} onChange={(e) => setAmountLimit(e.target.value)} placeholder="0,00" />
          </div>
          {formError ? <p className="text-sm text-[var(--color-negative)]">{formError}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" className="rounded-full" disabled={submitting} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="rounded-full" disabled={submitting}>
              {submitting ? "Salvando…" : "Criar orçamento"}
            </Button>
          </div>
        </form>
      </ModalPanel>
    </>
  );
}
