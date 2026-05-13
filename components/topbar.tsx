import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { DashboardUserMenu } from "@/components/dashboard-user-menu";

const NAV = [
  { href: "/personal-finance", label: "Dashboard" },
  { href: "/personal-finance/accounts", label: "Contas" },
  { href: "/personal-finance/transactions", label: "Transações" },
  { href: "/personal-finance/budgets", label: "Orçamentos" },
  { href: "/personal-finance/recurring", label: "Recorrências" },
  { href: "/personal-finance/categories", label: "Categorias" },
];

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_70%,transparent)] backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-4">
          <BrandLogo variant="horizontal" href="/personal-finance" className="h-7" />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="rounded-full px-3 py-1 text-sm text-[var(--color-text-2)] hover:bg-[color-mix(in_srgb,var(--color-surface-3)_35%,transparent)] hover:text-[var(--color-text-1)]"
              >
                {i.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <DashboardUserMenu />
          </div>
          <Link
            href="/personal-finance/transactions"
            className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--color-accent-strong)] px-4 text-sm font-semibold text-[var(--color-text-invert)] shadow-[var(--shadow-1)] hover:brightness-110"
          >
            Novo Lançamento
          </Link>
        </div>
      </div>
    </header>
  );
}

