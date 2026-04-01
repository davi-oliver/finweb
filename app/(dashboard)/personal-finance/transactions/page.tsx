import { Suspense } from "react";
import { PfTransactionsScreen } from "@/app/components/PersonalFinance/pf-transactions-screen";

export const metadata = { title: "Transações | Finweb" };

export default function PfTransactionsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense fallback={<p className="text-sm text-[var(--color-text-2)]">Carregando…</p>}>
        <PfTransactionsScreen />
      </Suspense>
    </div>
  );
}
