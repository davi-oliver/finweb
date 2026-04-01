"use client";

import type { PfAccount } from "@/lib/personal-finance-types";
import { Card, CardContent } from "@/components/ui/card";

export function PfAccountCard({ account }: { account: PfAccount }) {
  const balance = Number(account.initial_balance);
  return (
    <Card className="shadow-none">
      <CardContent>
        <p className="font-medium text-[var(--color-text-1)]">{account.name}</p>
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-3)]">{account.type}</p>
        <p className="mt-2 text-lg font-semibold tabular-nums text-[var(--color-text-2)]">
          {balance.toLocaleString("pt-BR", { style: "currency", currency: account.currency || "BRL" })}
        </p>
      </CardContent>
    </Card>
  );
}
