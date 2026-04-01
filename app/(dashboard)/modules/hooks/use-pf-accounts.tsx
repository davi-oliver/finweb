"use client";

import { useCallback, useEffect, useState } from "react";
import type { PfAccount } from "@/lib/personal-finance-types";

type ListResponse = { items: PfAccount[]; total: number };

export function usePfAccounts() {
  const [items, setItems] = useState<PfAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/personal-finance/accounts", { credentials: "include" });
    const body = (await res.json().catch(() => ({}))) as ListResponse & { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(body.error ?? res.statusText);
      return;
    }
    setItems(body.items ?? []);
    setTotal(body.total ?? 0);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  return { items, total, loading, error, reload: load };
}
