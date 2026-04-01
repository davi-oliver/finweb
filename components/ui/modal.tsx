"use client";

import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ModalBackdrop({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]",
        className,
      )}
      {...props}
    />
  );
}

export function ModalPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cx(
        "fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5 shadow-[var(--shadow-2)]",
        className,
      )}
      {...props}
    />
  );
}

