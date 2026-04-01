import type { ButtonHTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Fab({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cx(
        "fixed bottom-6 right-6 z-40 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-accent-strong)] px-5 text-sm font-semibold text-[var(--color-text-invert)] shadow-[var(--shadow-2)] transition-[transform,filter] duration-[var(--dur-2)] ease-[var(--ease-standard)] hover:brightness-110 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
        className,
      )}
      {...props}
    />
  );
}

