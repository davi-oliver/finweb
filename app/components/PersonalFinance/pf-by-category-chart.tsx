"use client";

import { useMemo, useState } from "react";
import { usePfSummary } from "@/app/(dashboard)/modules/hooks/use-pf-summary";
import { usePfCategories } from "@/app/(dashboard)/modules/hooks/use-pf-categories";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const RANGE = ["Semanal", "Mensal"] as const;

function monthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtBRLNoCents(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function donutSegments(values: number[]) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return values.map((v) => {
    const start = acc / total;
    acc += v;
    const end = acc / total;
    return { start, end };
  });
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const a0 = start * Math.PI * 2 - Math.PI / 2;
  const a1 = end * Math.PI * 2 - Math.PI / 2;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const largeArc = end - start > 0.5 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`;
}

/** Stitch-like: donut + lista. Usa `expense_by_category_id` + categorias para nomes. */
export function PfByCategoryChart() {
  const { from, to } = useMemo(() => monthRange(), []);
  const summary = usePfSummary(from, to);
  const categories = usePfCategories("expense");
  const [range, setRange] = useState<(typeof RANGE)[number]>(RANGE[1]);

  const items = useMemo(() => {
    const map = summary.data?.expense_by_category_id ?? {};
    const cats = categories.items ?? [];
    const byId = new Map(cats.map((c) => [c.id, c]));
    return Object.entries(map)
      .map(([id, amount]) => ({
        id,
        amount: Number(amount) || 0,
        name: byId.get(id)?.name ?? "Categoria",
        color: byId.get(id)?.color ?? null,
      }))
      .filter((x) => x.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [summary.data, categories.items]);

  if (summary.loading || categories.loading) {
    return (
      <Card className="shadow-none">
        <div className="grid gap-4 p-4 sm:grid-cols-[160px_1fr]">
          <Skeleton className="h-[160px] w-[160px] rounded-full" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }
  if (summary.error || categories.error) {
    return <p className="text-sm text-[var(--color-negative)]">{summary.error ?? categories.error}</p>;
  }
  const demoItems = [
    { id: "demo-home", name: "Moradia", amount: 2048.16, color: "color-mix(in_srgb,var(--color-accent)_70%,white)" },
    { id: "demo-food", name: "Alimentação", amount: 1280.1, color: "var(--color-accent)" },
    { id: "demo-car", name: "Transporte", amount: 768, color: "color-mix(in_srgb,var(--color-accent)_45%,white)" },
    { id: "demo-fun", name: "Lazer", amount: 512.04, color: "color-mix(in_srgb,var(--color-negative)_55%,white)" },
  ];
  const list = items.length ? items : demoItems;

  const total = list.reduce((a, b) => a + b.amount, 0);
  const segments = donutSegments(list.map((i) => i.amount));
  const colors = [
    "var(--color-accent)",
    "color-mix(in_srgb,var(--color-accent)_55%,white)",
    "color-mix(in_srgb,var(--color-accent)_35%,white)",
    "color-mix(in_srgb,var(--color-negative)_55%,white)",
    "color-mix(in_srgb,var(--color-negative)_35%,white)",
    "color-mix(in_srgb,var(--color-warning)_55%,white)",
  ];

  return (
    <Card className="shadow-none">
      <div className="flex items-center justify-between gap-3 p-4 pb-0">
        <h2 className="text-sm font-semibold text-[var(--color-text-1)]">Gastos por Categoria</h2>
        <div className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--color-surface-3)_55%,transparent)] p-1 text-xs">
          {RANGE.map((r) => {
            const active = r === range;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={[
                  "rounded-full px-3 py-1 font-medium transition-[background-color,color] duration-[var(--dur-2)] ease-[var(--ease-standard)]",
                  active
                    ? "bg-[var(--color-surface-1)] text-[var(--color-text-1)] shadow-[var(--shadow-1)]/35"
                    : "text-[var(--color-text-2)] hover:text-[var(--color-text-1)]",
                ].join(" ")}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 p-4 sm:grid-cols-[240px_1fr] sm:items-center">
        <div className="relative grid place-items-center justify-self-start">
          <svg width="210" height="210" viewBox="0 0 200 200" className="drop-shadow-[0_12px_34px_rgba(0,0,0,0.32)]">
            <circle
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke="color-mix(in_srgb,var(--color-surface-3)_70%,transparent)"
              strokeWidth="18"
            />
            {segments.map((s, idx) => (
              <path
                key={list[idx].id}
                d={arcPath(100, 100, 78, s.start, s.end)}
                fill="none"
                stroke={list[idx].color ?? colors[idx] ?? "var(--color-accent)"}
                strokeWidth="18"
                strokeLinecap="round"
              />
            ))}
            <circle cx="100" cy="100" r="56" fill="var(--color-surface-1)" />
          </svg>
          <div className="absolute text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Total Gasto</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--color-text-1)]">{fmtBRLNoCents(total)}</p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-start gap-x-10 gap-y-2 text-sm">
          {list.map((i, idx) => (
            <div key={i.id} className="contents">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: i.color ?? colors[idx] }} />
                <span className="truncate text-[var(--color-text-1)]">{i.name}</span>
              </div>
              <div className="text-right tabular-nums font-semibold text-[var(--color-text-2)]">{fmtBRL(i.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
