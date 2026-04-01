import { Suspense } from "react";
import { PfAccountsScreen } from "@/app/components/PersonalFinance/pf-accounts-screen";

export const metadata = { title: "Contas | Finweb" };

export default function PfAccountsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense fallback={<p className="text-sm text-[var(--color-text-2)]">Carregando…</p>}>
        <PfAccountsScreen />
      </Suspense>
    </div>
  );
}
