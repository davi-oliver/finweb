"use client";

import { useCallback, useEffect, useState } from "react";
import type { PfTransaction } from "@/lib/personal-finance-types";

type ListResponse = { items: PfTransaction[]; total: number };

export function usePfTransactions(from?: string, to?: string, pageSize?: number) {
  const [items, setItems] = useState<PfTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    if (pageSize) p.set("pageSize", String(pageSize));
    const qs = p.toString();
    const res = await fetch(`/api/personal-finance/transactions${qs ? `?${qs}` : ""}`, {
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
  }, [from, to, pageSize]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  return { items, total, loading, error, reload: load };
}
