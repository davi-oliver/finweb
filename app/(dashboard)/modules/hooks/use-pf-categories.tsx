"use client";

import { useCallback, useEffect, useState } from "react";
import type { PfCategory, PfCategoryKind } from "@/lib/personal-finance-types";

type ListResponse = { items: PfCategory[]; total: number };

export function usePfCategories(kind?: PfCategoryKind) {
  const [items, setItems] = useState<PfCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const q = kind ? `?kind=${kind}` : "";
    const res = await fetch(`/api/personal-finance/categories${q}`, { credentials: "include" });
    const body = (await res.json().catch(() => ({}))) as ListResponse & { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(body.error ?? res.statusText);
      return;
    }
    setItems(body.items ?? []);
    setTotal(body.total ?? 0);
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, total, loading, error, reload: load };
}
