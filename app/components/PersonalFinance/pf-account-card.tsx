"use client";

import type { PfAccount } from "@/lib/personal-finance-types";

export function PfAccountCard({ account }: { account: PfAccount }) {
  const balance = Number(account.initial_balance);
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-medium text-zinc-900 dark:text-zinc-50">{account.name}</p>
      <p className="text-xs uppercase text-zinc-500">{account.type}</p>
      <p className="mt-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        {balance.toLocaleString("pt-BR", { style: "currency", currency: account.currency || "BRL" })}
      </p>
    </div>
  );
}
