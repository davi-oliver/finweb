"use client";

import { usePfRecurring } from "@/app/(dashboard)/modules/hooks/use-pf-recurring";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { StatusPill } from "@/components/ui/status-pill";

function recurringIcon(description?: string | null) {
  const d = (description ?? "").toLowerCase();
  if (d.includes("net") || d.includes("wifi") || d.includes("internet")) return "wifi";
  if (d.includes("tv") || d.includes("stream") || d.includes("netflix") || d.includes("prime") || d.includes("hbo"))
    return "tv";
  if (d.includes("alug") || d.includes("condom") || d.includes("casa") || d.includes("morad")) return "home";
  if (d.includes("energia") || d.includes("luz") || d.includes("eletric")) return "bolt";
  if (d.includes("água") || d.includes("agua")) return "water_drop";
  if (d.includes("cel") || d.includes("telefone") || d.includes("phone")) return "phone_iphone";
  if (d.includes("academ") || d.includes("gym")) return "fitness_center";
  if (d.includes("cart") || d.includes("fatura") || d.includes("crédito") || d.includes("credito")) return "credit_card";
  return "calendar_month";
}

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function daysUntil(iso: string) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const due = new Date(`${iso}T00:00:00`).getTime();
  return Math.round((due - start) / (1000 * 60 * 60 * 24));
}

export function PfRecurringList() {
  const { items, loading, error } = usePfRecurring();

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    );
  }
  if (error) return <p className="text-sm text-[var(--color-negative)]">{error}</p>;
  if (!items.length) {
    const demo = [
      {
        id: "demo-netflix",
        description: "Netflix Premium",
        amount: 55.9,
        next_due_date: "2024-08-15",
        is_active: true,
      },
      {
        id: "demo-rent",
        description: "Aluguel Apartamento",
        amount: 3200,
        next_due_date: "2024-08-06",
        is_active: true,
      },
      {
        id: "demo-fiber",
        description: "Internet Fibra",
        amount: 149.9,
        next_due_date: "2024-08-12",
        is_active: true,
      },
    ];
    return (
      <ul className="divide-y divide-[var(--color-border)]">
        {demo.map((r) => {
          const d = daysUntil(r.next_due_date);
          const dueLabel = `Vence em ${d} dias`;
          const pending = d <= 2;
          const status = pending ? { label: "Pendente", tone: "warning" as const } : { label: "Agendado", tone: "info" as const };
          return (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-surface-3)_40%,transparent)] text-[var(--color-text-2)]">
                  <Icon name={recurringIcon(r.description)} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--color-text-1)]">{r.description}</p>
                  <p className="text-xs text-[var(--color-text-3)]">{dueLabel}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <p className="tabular-nums font-semibold text-[var(--color-text-1)]">{fmtBRL(r.amount)}</p>
                <StatusPill label={status.label} tone={status.tone} />
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="divide-y divide-[var(--color-border)]">
        {items.map((r) => {
          const d = daysUntil(r.next_due_date);
          const dueLabel = d <= 0 ? "Vence hoje" : `Vence em ${d} dias`;
          const pending = r.is_active && d > 0 && d <= 2;
          const status = !r.is_active ? { label: "Pausado", tone: "neutral" as const } : pending ? { label: "Pendente", tone: "warning" as const } : { label: "Agendado", tone: "info" as const };
          return (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-surface-3)_40%,transparent)] text-[var(--color-text-2)]">
                  <Icon name={recurringIcon(r.description)} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--color-text-1)]">{r.description ?? "Recorrência"}</p>
                  <p className="text-xs text-[var(--color-text-3)]">{dueLabel}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <p className="tabular-nums font-semibold text-[var(--color-text-1)]">{fmtBRL(Number(r.amount) || 0)}</p>
                <StatusPill label={status.label} tone={status.tone} />
              </div>
            </li>
          );
        })}
    </ul>
  );
}
