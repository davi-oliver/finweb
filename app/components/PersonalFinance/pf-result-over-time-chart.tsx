"use client";

import { useMemo } from "react";
import { usePfSummary } from "@/app/(dashboard)/modules/hooks/use-pf-summary";
import { Skeleton } from "@/components/ui/skeleton";

function monthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

function pointsToPath(points: Array<[number, number]>) {
  return points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
}

function areaPath(points: Array<[number, number]>, baselineY: number) {
  const line = pointsToPath(points);
  const last = points.at(-1);
  const first = points[0];
  if (!last || !first) return "";
  return `${line} L ${last[0]} ${baselineY} L ${first[0]} ${baselineY} Z`;
}

/** Resultado acumulado (receitas − despesas) no mês, a partir de `/api/personal-finance/summary`. */
export function PfResultOverTimeChart() {
  const { from, to } = useMemo(() => monthRange(), []);
  const { data, loading, error } = usePfSummary(from, to);

  const { pts, baseY, empty } = useMemo(() => {
    const baseY = 120;
    const series = data?.cumulative_result_by_day ?? [];
    if (!series.length) {
      return { pts: [] as Array<[number, number]>, baseY, empty: true };
    }
    const values = series.map((s) => s.cumulative);
    let minV = Math.min(...values, 0);
    let maxV = Math.max(...values, 0);
    if (minV === maxV) {
      minV -= 1;
      maxV += 1;
    }
    const padTop = 16;
    const padBottom = 12;
    const h = baseY - padTop - padBottom;
    const n = series.length;
    const xFor = (i: number) => (n <= 1 ? 170 : 8 + (i / (n - 1)) * 320);
    const yFor = (v: number) => padTop + h - ((v - minV) / (maxV - minV)) * h;
    let pts = series.map((s, i) => [xFor(i), yFor(s.cumulative)] as [number, number]);
    if (pts.length === 1) {
      const p = pts[0]!;
      pts = [
        [Math.max(8, p[0] - 40), p[1]],
        [Math.min(328, p[0] + 40), p[1]],
      ];
    }
    return { pts, baseY, empty: false };
  }, [data]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] p-4">
        <Skeleton className="h-[140px] w-full rounded-[var(--radius-md)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] p-4 text-sm text-[var(--color-negative)]">
        {error}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] px-4 py-6 text-center text-sm text-[var(--color-text-2)]">
        <p className="font-medium text-[var(--color-text-1)]">Sem série no período</p>
        <p className="text-xs text-[var(--color-text-3)]">Registre receitas e despesas no mês para ver o resultado acumulado ao longo dos dias.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] p-4">
      <svg viewBox="0 0 340 140" width="100%" height="140" aria-hidden="true">
        <defs>
          <linearGradient id="resLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.35" />
            <stop offset="0.55" stopColor="var(--color-accent)" stopOpacity="0.85" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="resFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.18" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
          <filter id="softGlowPfResult" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feColorMatrix
              in="b"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .35 0"
              result="g"
            />
            <feMerge>
              <feMergeNode in="g" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            x2="340"
            y1={20 + i * 24}
            y2={20 + i * 24}
            stroke="var(--color-border)"
            strokeOpacity="0.35"
          />
        ))}

        <path d={areaPath(pts, baseY)} fill="url(#resFill)" />
        <path
          d={pointsToPath(pts)}
          fill="none"
          stroke="url(#resLine)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#softGlowPfResult)"
        />

        <circle cx={pts.at(-1)?.[0] ?? 0} cy={pts.at(-1)?.[1] ?? 0} r="4.5" fill="var(--color-accent)" />
        <circle cx={pts.at(-1)?.[0] ?? 0} cy={pts.at(-1)?.[1] ?? 0} r="9" fill="var(--color-accent)" opacity="0.12" />
      </svg>
    </div>
  );
}
