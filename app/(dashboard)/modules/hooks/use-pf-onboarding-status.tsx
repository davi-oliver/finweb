"use client";

import { useCallback, useEffect, useState } from "react";
import type { PfOnboardingStatus } from "@/lib/personal-finance-types";

export function usePfOnboardingStatus() {
  const [data, setData] = useState<PfOnboardingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/personal-finance/onboarding-status", { credentials: "include" });
    const body = (await res.json().catch(() => ({}))) as PfOnboardingStatus & { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(body.error ?? res.statusText);
      return;
    }
    setData(body);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
