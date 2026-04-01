import Link from "next/link";
import { PfRecurringList } from "@/app/components/PersonalFinance/pf-recurring-list";
import { PfResultOverTimeChart } from "@/app/components/PersonalFinance/pf-result-over-time-chart";
import { PfByCategoryChart } from "@/app/components/PersonalFinance/pf-by-category-chart";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { PfDashboardHeader } from "@/app/components/PersonalFinance/pf-dashboard-header";
import { RecentTransactionsTable } from "@/app/components/PersonalFinance/pf-recent-transactions-table";
import { Icon } from "@/components/ui/icon";

export const metadata = {
  title: "Finanças pessoais | Finweb",
  description: "Painel de resumo, orçamentos e transações",
};

export default function PersonalFinancePage() {
  // SSR page; keep client widgets isolated in components.
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PfDashboardHeader />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PfByCategoryChart />
        </div>

        <div className="space-y-4">
          <Card className="shadow-none">
            <CardContent className="space-y-3 p-0">
              <div className="flex items-center justify-between gap-3 p-4">
                <h2 className="text-sm font-semibold text-[var(--color-text-1)]">Próximos Vencimentos</h2>
                <Link
                  href="/personal-finance/recurring"
                  className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-strong)] hover:underline"
                >
                  Ver tudo
                </Link>
              </div>
              <PfRecurringList />
              <div className="p-4 pt-0">
                <Link
                  href="/personal-finance/transactions"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent-strong)] px-4 py-2 text-sm font-semibold text-[var(--color-text-invert)] shadow-[var(--shadow-1)] hover:brightness-110"
                >
                  <Icon name="add" />
                  Novo Lançamento
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none bg-[color-mix(in_srgb,var(--color-accent)_16%,var(--color-surface-1))]">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon name="insights" />
                <h2 className="text-sm font-semibold text-[var(--color-text-1)]">Investimentos em Alta</h2>
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  { name: "CDB Posfixado", value: "+12,5% aa" },
                  { name: "IVVB11", value: "+3,2%" },
                  { name: "BTC/BRL", value: "+1,8%" },
                ].map((i) => (
                  <li key={i.name} className="flex items-center justify-between gap-3">
                    <span className="text-[var(--color-text-1)]">{i.name}</span>
                    <span className="tabular-nums font-semibold text-[var(--color-positive)]">{i.value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <SectionHeader title="Transações Recentes" subtitle="Últimas movimentações de todas as contas" />
          <RecentTransactionsTable />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-1)]">Resultado no tempo</h2>
          <PfResultOverTimeChart />
        </div>
      </section>

      <Link
        href="/personal-finance/transactions"
        className="fixed bottom-6 right-6 z-40 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-accent-strong)] px-5 text-sm font-semibold text-[var(--color-text-invert)] shadow-[var(--shadow-2)] transition-[transform,filter] duration-[var(--dur-2)] ease-[var(--ease-standard)] hover:brightness-110 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
      >
        Novo Lançamento
      </Link>
    </div>
  );
}
