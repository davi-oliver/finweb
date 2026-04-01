import type { ButtonHTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function IconButton({
  className,
  "aria-label": ariaLabel,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cx(
        "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[var(--color-text-2)] shadow-[var(--shadow-1)]/30 transition-[background-color,border-color,transform] duration-[var(--dur-2)] ease-[var(--ease-standard)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-1)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

