import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function LedgerTable({
  header,
  children,
  className,
}: {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cx("shadow-none", className)}>
      {header ? (
        <div className="border-b border-[var(--color-border)] p-4">
          {header}
        </div>
      ) : null}
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}

export function LedgerTableTable({ children }: { children: ReactNode }) {
  return <table className="min-w-full text-sm">{children}</table>;
}

export function LedgerThead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-[color-mix(in_srgb,var(--color-surface-3)_45%,transparent)] text-[var(--color-text-3)]">
      {children}
    </thead>
  );
}

export function LedgerTh({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cx("px-4 py-3 text-left text-xs font-medium uppercase tracking-wide", className)}>{children}</th>;
}

export function LedgerTd({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cx("px-4 py-3 align-middle", className)}>{children}</td>;
}

export function LedgerRow({ children }: { children: ReactNode }) {
  return <tr className="hover:bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)]">{children}</tr>;
}

