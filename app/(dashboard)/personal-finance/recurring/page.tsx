import { Suspense } from "react";
import { PfRecurringScreen } from "@/app/components/PersonalFinance/pf-recurring-screen";

export const metadata = { title: "Recorrências | Finweb" };

export default function PfRecurringPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense fallback={<p className="text-sm text-[var(--color-text-2)]">Carregando…</p>}>
        <PfRecurringScreen />
      </Suspense>
    </div>
  );
}
