import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Tone = "neutral" | "positive" | "negative" | "warning" | "info";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    neutral:
      "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)]",
    positive:
      "border-[color-mix(in_srgb,var(--color-positive)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-positive)_12%,transparent)] text-[var(--color-positive)]",
    negative:
      "border-[color-mix(in_srgb,var(--color-negative)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-negative)_12%,transparent)] text-[var(--color-negative)]",
    warning:
      "border-[color-mix(in_srgb,var(--color-warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]",
    info: "border-[color-mix(in_srgb,var(--color-info)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

