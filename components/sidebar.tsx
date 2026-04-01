import Link from "next/link";
import { DashboardUserMenu } from "@/components/dashboard-user-menu";

export type SidebarItem = {
  href: string;
  label: string;
  featureFlag?: string;
};

const ALL_ITEMS: SidebarItem[] = [
  { href: "/personal-finance", label: "Painel", featureFlag: "personal_finance" },
  { href: "/personal-finance/accounts", label: "Contas", featureFlag: "personal_finance" },
  { href: "/personal-finance/categories", label: "Categorias", featureFlag: "personal_finance" },
  { href: "/personal-finance/budgets", label: "Orçamentos", featureFlag: "personal_finance" },
  { href: "/personal-finance/recurring", label: "Recorrências", featureFlag: "personal_finance" },
  { href: "/personal-finance/transactions", label: "Transações", featureFlag: "personal_finance" },
];

type SidebarProps = {
  enabledFlags?: Set<string>;
};

export function Sidebar({ enabledFlags }: SidebarProps) {
  const flags = enabledFlags ?? new Set(["personal_finance"]);
  const items = ALL_ITEMS.filter((i) => !i.featureFlag || flags.has(i.featureFlag));

  return (
    <aside className="flex min-h-screen w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Finweb
        </Link>
        <p className="mt-1 text-xs text-zinc-500">Finanças pessoais</p>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-white hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <DashboardUserMenu />
    </aside>
  );
}
