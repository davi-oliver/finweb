"use client";

import { usePfOnboardingStatus } from "@/app/(dashboard)/modules/hooks/use-pf-onboarding-status";
import { Alert } from "@/components/ui/alert";

export function PfOnboardingHint() {
  const { data, loading, error } = usePfOnboardingStatus();

  if (loading || error || !data) return null;
  if (data.dismissed_at) return null;

  const done =
    data.step_accounts_done && data.step_categories_done && data.step_first_transaction_done;
  if (done) return null;

  return (
    <Alert tone="success" title="Onboarding sugerido">
      <ul className="mt-2 list-inside list-disc space-y-1 text-emerald-900/90 dark:text-emerald-100/90">
        {!data.step_accounts_done && <li>Criar ao menos uma conta</li>}
        {!data.step_categories_done && <li>Revisar ou criar categorias</li>}
        {!data.step_first_transaction_done && <li>Registrar a primeira transação</li>}
      </ul>
      <p className="mt-2 text-xs text-[var(--color-text-2)]">
        Persistência: <code className="rounded bg-white/60 px-1 dark:bg-black/30">pf_onboarding_status</code> via{" "}
        <code className="rounded bg-white/60 px-1 dark:bg-black/30">PUT /api/personal-finance/onboarding-status</code>.
      </p>
    </Alert>
  );
}
