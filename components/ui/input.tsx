import { forwardRef, type InputHTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cx(
        "h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] px-3 text-sm text-[var(--color-text-1)] shadow-[var(--shadow-1)]/30 outline-none transition-[border-color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-standard)] placeholder:text-[var(--color-text-3)] focus:border-[var(--color-border-strong)] focus:ring-2 focus:ring-[var(--color-focus)]/30 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});
