"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ModalBackdrop, ModalPanel } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PfAccount, PfAccountType } from "@/lib/personal-finance-types";
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
  account?: PfAccount | null;
};

type ModalContentProps = Omit<Props, "open"> & {
  account: PfAccount | null;
};

export function PfCreateAccountModal({ open, ...props }: Props) {
  if (!open) return null;

  return <PfAccountModalContent key={props.account?.id ?? "new-account"} {...props} account={props.account ?? null} />;
}

function PfAccountModalContent({ onClose, onSuccess, account }: ModalContentProps) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<PfAccountType>(account?.type ?? "checking");
  const [currency] = useState(account?.currency ?? "BRL");
  const [initialBalance, setInitialBalance] = useState(String(account?.initial_balance ?? 0));
  const [institution, setInstitution] = useState(account?.institution ?? "");
  const [notes, setNotes] = useState(account?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isEditing = Boolean(account);

  useEffect(() => {
    queueMicrotask(() => firstFieldRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submitting, onClose]);

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
    const payload = {
      name: trimmed,
      type,
      currency,
      initial_balance: bal,
      institution: institution.trim() || null,
      notes: notes.trim() || null,
    };
    const url = account ? `/api/personal-finance/accounts/${account.id}` : "/api/personal-finance/accounts";
    const method = account ? "PATCH" : "POST";

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      setSubmitting(false);
      setFormError(account ? "Não foi possível atualizar a conta." : "Não foi possível criar a conta.");
      return;
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setSubmitting(false);
    if (!res.ok) {
      setFormError(body.error ?? (account ? "Não foi possível atualizar a conta." : "Não foi possível criar a conta."));
      return;
    }
    onSuccess?.();
    onClose();
  }

  return (
    <>
      <ModalBackdrop onClick={() => !submitting && onClose()} aria-hidden />
      <ModalPanel aria-labelledby={titleId} className="max-h-[90vh] overflow-y-auto">
        <h2 id={titleId} className="text-lg font-semibold text-[var(--color-text-1)]">
          {isEditing ? "Editar conta" : "Nova conta"}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-3)]">
          {isEditing
            ? "Atualize os dados usados nos lançamentos e nos resumos."
            : "Os dados são salvos na sua conta e usados nos lançamentos."}
        </p>

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
              {submitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar conta"}
            </Button>
          </div>
        </form>
      </ModalPanel>
    </>
  );
}
