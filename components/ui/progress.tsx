import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Progress({
  value,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { value: number }) {
  const clamped = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx(
        "h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-3)]",
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-[var(--dur-3)] ease-[var(--ease-standard)]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

