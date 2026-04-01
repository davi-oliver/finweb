"use client";

import { useCallback, useEffect, useState } from "react";
import type { PfBudget } from "@/lib/personal-finance-types";

type ListResponse = { items: PfBudget[]; total: number };

export function usePfBudgets(year?: number, month?: number) {
  const [items, setItems] = useState<PfBudget[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const p = new URLSearchParams();
    if (year != null) p.set("year", String(year));
    if (month != null) p.set("month", String(month));
    const qs = p.toString();
    const res = await fetch(`/api/personal-finance/budgets${qs ? `?${qs}` : ""}`, {
      credentials: "include",
    });
    const body = (await res.json().catch(() => ({}))) as ListResponse & { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(body.error ?? res.statusText);
      return;
    }
    setItems(body.items ?? []);
    setTotal(body.total ?? 0);
  }, [year, month]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, total, loading, error, reload: load };
}
