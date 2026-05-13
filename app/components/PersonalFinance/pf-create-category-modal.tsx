"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ModalBackdrop, ModalPanel } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PfCategoryKind } from "@/lib/personal-finance-types";
import { pfInputLikeClass, pfLabelClass } from "@/app/components/PersonalFinance/pf-form-classes";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultKind?: PfCategoryKind;
};

export function PfCreateCategoryModal({ open, onClose, onSuccess, defaultKind = "expense" }: Props) {
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<PfCategoryKind>(defaultKind);
  const [color, setColor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setName("");
    setKind(defaultKind);
    setColor("");
    setFormError(null);
  }, [defaultKind]);

  useEffect(() => {
    if (!open) return;
    reset();
    queueMicrotask(() => nameRef.current?.focus());
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
      setFormError("Informe o nome da categoria.");
      return;
    }
    setSubmitting(true);
    const body: Record<string, unknown> = { name: trimmed, kind };
    const c = color.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(c)) body.color = c;

    const res = await fetch("/api/personal-finance/categories", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setSubmitting(false);
    if (!res.ok) {
      setFormError(json.error ?? "Não foi possível criar a categoria.");
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
          Nova categoria
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-3)]">Categorias próprias aparecem junto às sugestões do sistema.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="pf-cat-name" className={pfLabelClass}>
              Nome
            </label>
            <Input id="pf-cat-name" ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Mercado" />
          </div>
          <div>
            <label htmlFor="pf-cat-kind" className={pfLabelClass}>
              Tipo
            </label>
            <select id="pf-cat-kind" className={pfInputLikeClass} value={kind} onChange={(e) => setKind(e.target.value as PfCategoryKind)}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
          <div>
            <label htmlFor="pf-cat-color" className={pfLabelClass}>
              Cor (hex opcional)
            </label>
            <Input id="pf-cat-color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="#3B82F6" />
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
