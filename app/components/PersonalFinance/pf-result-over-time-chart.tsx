"use client";

import { useMemo } from "react";

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

/** Visual 1:1-ish do Stitch (sem depender de série temporal real). */
export function PfResultOverTimeChart() {
  const { pts, baseY } = useMemo(() => {
    const baseY = 120;
    const pts: Array<[number, number]> = [
      [8, 92],
      [48, 98],
      [88, 78],
      [128, 84],
      [168, 66],
      [208, 72],
      [248, 56],
      [288, 60],
      [328, 44],
    ];
    return { pts, baseY };
  }, []);

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
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
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
        <path d={pointsToPath(pts)} fill="none" stroke="url(#resLine)" strokeWidth="3" strokeLinecap="round" filter="url(#softGlow)" />

        <circle cx={pts.at(-1)?.[0] ?? 0} cy={pts.at(-1)?.[1] ?? 0} r="4.5" fill="var(--color-accent)" />
        <circle cx={pts.at(-1)?.[0] ?? 0} cy={pts.at(-1)?.[1] ?? 0} r="9" fill="var(--color-accent)" opacity="0.12" />
      </svg>
    </div>
  );
}
