import type { ButtonHTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  const base =
    "inline-flex select-none items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-[transform,background-color,color,border-color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";

  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-[15px]",
  };

  const variants: Record<Variant, string> = {
    primary:
      "bg-[var(--color-accent)] text-[var(--color-text-invert)] shadow-[var(--shadow-1)] hover:bg-[var(--color-accent-strong)]",
    secondary:
      "border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[var(--color-text-1)] hover:bg-[var(--color-surface-2)]",
    ghost:
      "text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)]",
    destructive:
      "bg-[var(--color-negative)] text-[var(--color-text-invert)] shadow-[var(--shadow-1)] hover:brightness-95",
  };

  return (
    <button
      type="button"
      className={cx(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}
