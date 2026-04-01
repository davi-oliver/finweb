export const metadata = { title: "Contas | Finweb" };

export default function PfAccountsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Contas</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        CRUD via <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">GET/POST /api/personal-finance/accounts</code> e{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">/accounts/[id]</code>. Conecte o hook{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">usePfAccounts</code> para listar e criar.
      </p>
    </div>
  );
}
