"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ModalBackdrop, ModalPanel } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PfAccountType } from "@/lib/personal-finance-types";
import { pfInputLikeClass, pfLabelClass } from "@/app/components/PersonalFinance/pf-form-classes";

const ACCOUNT_TYPES: { value: PfAccountType; label: string }[] = [
  { value: "checking", label: "Corrente" },
  { value: "savings", label: "Poupança" },
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "cash", label: "Dinheiro / espécie" },
  { value: "investment", label: "Investimento" },
  { value: "other", label: "Outro" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function PfCreateAccountModal({ open, onClose, onSuccess }: Props) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<PfAccountType>("checking");
  const [currency] = useState("BRL");
  const [initialBalance, setInitialBalance] = useState("0");
  const [institution, setInstitution] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setName("");
    setType("checking");
    setInitialBalance("0");
    setInstitution("");
    setNotes("");
    setFormError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
    queueMicrotask(() => firstFieldRef.current?.focus());
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Informe o nome da conta.");
      return;
    }
    const bal = Number(String(initialBalance).replace(",", "."));
    if (!Number.isFinite(bal)) {
      setFormError("Saldo inicial inválido.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/personal-finance/accounts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmed,
        type,
        currency,
        initial_balance: bal,
        institution: institution.trim() || undefined,
        notes: notes.trim() || undefined,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setSubmitting(false);
    if (!res.ok) {
      setFormError(body.error ?? "Não foi possível criar a conta.");
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
          Nova conta
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-3)]">Os dados são salvos na sua conta e usados nos lançamentos.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="pf-acc-name" className={pfLabelClass}>
              Nome
            </label>
            <Input id="pf-acc-name" ref={firstFieldRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Nubank corrente" autoComplete="off" />
          </div>
          <div>
            <label htmlFor="pf-acc-type" className={pfLabelClass}>
              Tipo
            </label>
            <select id="pf-acc-type" className={pfInputLikeClass} value={type} onChange={(e) => setType(e.target.value as PfAccountType)}>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pf-acc-balance" className={pfLabelClass}>
              Saldo inicial (BRL)
            </label>
            <Input
              id="pf-acc-balance"
              inputMode="decimal"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label htmlFor="pf-acc-inst" className={pfLabelClass}>
              Instituição (opcional)
            </label>
            <Input id="pf-acc-inst" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Banco ou corretora" />
          </div>
          <div>
            <label htmlFor="pf-acc-notes" className={pfLabelClass}>
              Observações (opcional)
            </label>
            <Input id="pf-acc-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {formError ? <p className="text-sm text-[var(--color-negative)]">{formError}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" className="rounded-full" disabled={submitting} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="rounded-full" disabled={submitting}>
              {submitting ? "Salvando…" : "Criar conta"}
            </Button>
          </div>
        </form>
      </ModalPanel>
    </>
  );
}
