export const metadata = { title: "Categorias | Finweb" };

export default function PfCategoriesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Categorias</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Inclui categorias globais (seed SQL) e categorias do titular. API:{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">/api/personal-finance/categories</code>.
      </p>
    </div>
  );
}
