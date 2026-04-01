import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Tone = "neutral" | "warning" | "danger" | "info" | "success";

export function Alert({
  className,
  tone = "neutral",
  title,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
}) {
  const tones: Record<Tone, string> = {
    neutral:
      "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)]",
    warning:
      "border-[color-mix(in_srgb,var(--color-warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-text-1)]",
    danger:
      "border-[color-mix(in_srgb,var(--color-negative)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-negative)_12%,transparent)] text-[var(--color-text-1)]",
    info: "border-[color-mix(in_srgb,var(--color-info)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-text-1)]",
    success:
      "border-[color-mix(in_srgb,var(--color-positive)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-positive)_12%,transparent)] text-[var(--color-text-1)]",
  };

  return (
    <div
      role="status"
      className={cx(
        "rounded-[var(--radius-lg)] border px-4 py-3 text-sm shadow-[var(--shadow-1)]/40",
        tones[tone],
        className,
      )}
      {...props}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      {children ? <div className={cx(title && "mt-1")}>{children}</div> : null}
    </div>
  );
}

