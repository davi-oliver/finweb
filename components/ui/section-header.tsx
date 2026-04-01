import Link from "next/link";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function SectionHeader({
  title,
  subtitle,
  actionHref,
  actionLabel = "Ver tudo",
  className,
}: {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-1)]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[var(--color-text-2)]">{subtitle}</p> : null}
      </div>
      {actionHref ? (
        <Link
          href={actionHref}
          className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-strong)] hover:underline"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

