import { Suspense } from "react";
import { PfBudgetsScreen } from "@/app/components/PersonalFinance/pf-budgets-screen";

export const metadata = { title: "Orçamentos | Finweb" };

export default function PfBudgetsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense fallback={<p className="text-sm text-[var(--color-text-2)]">Carregando…</p>}>
        <PfBudgetsScreen />
      </Suspense>
    </div>
  );
}
