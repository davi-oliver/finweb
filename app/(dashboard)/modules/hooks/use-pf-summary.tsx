"use client";

import { useCallback, useEffect, useState } from "react";

export type PfSummaryResponse = {
  range: { from: string; to: string };
  totals: {
    income: number;
    expense: number;
    result: number;
    initial_balance_sum: number;
  };
  expense_by_category_id: Record<string, number>;
  cumulative_result_by_day: Array<{ occurred_on: string; cumulative: number }>;
};

async function fetchJson<T>(url: string): Promise<{ data: T | null; error: string | null; status: number }> {
  const res = await fetch(url, { credentials: "include" });
  const status = res.status;
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { data: null, error: body.error ?? res.statusText, status };
  }
  return { data: (await res.json()) as T, error: null, status };
}

export function usePfSummary(from: string, to: string) {
  const [data, setData] = useState<PfSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    const q = new URLSearchParams({ from, to });
    const { data: json, error: err } = await fetchJson<PfSummaryResponse>(
      `/api/personal-finance/summary?${q.toString()}`
    );
    setLoading(false);
    if (err) {
      setError(err);
      setData(null);
      return;
    }
    setData(json);
  }, [from, to]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  return { data, loading, error, reload: load };
}
