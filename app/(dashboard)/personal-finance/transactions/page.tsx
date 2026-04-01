export const metadata = { title: "Transações | Finweb" };

export default function PfTransactionsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Transações</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        API: <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">/api/personal-finance/transactions</code>. Use{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">from</code> e{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">to</code> para filtrar por data.
      </p>
    </div>
  );
}
