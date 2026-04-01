import Link from "next/link";
import { PfSummaryCards } from "@/app/components/PersonalFinance/pf-summary-cards";
import { PfOnboardingHint } from "@/app/components/PersonalFinance/pf-onboarding-hint";

export const metadata = {
  title: "Finanças pessoais | Finweb",
  description: "Painel de resumo, orçamentos e transações",
};

export default function PersonalFinancePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Finanças pessoais</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Resumo e atalhos. Os dados vêm das rotas{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">/api/personal-finance/*</code> com
          sessão Supabase.
        </p>
      </header>

      <PfOnboardingHint />

      <PfSummaryCards />

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/personal-finance/accounts"
          className="rounded-xl border border-zinc-200 p-4 text-sm font-medium text-zinc-800 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
        >
          Contas →
        </Link>
        <Link
          href="/personal-finance/transactions"
          className="rounded-xl border border-zinc-200 p-4 text-sm font-medium text-zinc-800 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
        >
          Transações →
        </Link>
        <Link
          href="/personal-finance/budgets"
          className="rounded-xl border border-zinc-200 p-4 text-sm font-medium text-zinc-800 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
        >
          Orçamentos →
        </Link>
        <Link
          href="/personal-finance/recurring"
          className="rounded-xl border border-zinc-200 p-4 text-sm font-medium text-zinc-800 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
        >
          Recorrências →
        </Link>
      </section>
    </div>
  );
}
