import { Suspense } from "react";
import { PfCategoriesScreen } from "@/app/components/PersonalFinance/pf-categories-screen";

export const metadata = { title: "Categorias | Finweb" };

export default function PfCategoriesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense fallback={<p className="text-sm text-[var(--color-text-2)]">Carregando…</p>}>
        <PfCategoriesScreen />
      </Suspense>
    </div>
  );
}
