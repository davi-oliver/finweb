import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "animate-pulse rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-surface-3)_75%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}

