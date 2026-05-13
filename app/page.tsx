import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 dark:bg-zinc-950">
      <main className="max-w-lg text-center">
        <h1 className="sr-only">Fin Web</h1>
        <BrandLogo variant="stacked" className="mx-auto h-24" href={null} priority />
        <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Aplicação de finanças pessoais com Next.js, API Routes e Supabase (Postgres + Auth + RLS). Configure as
          variáveis em <code className="rounded bg-zinc-200/80 px-1 text-xs dark:bg-zinc-800">.env.local</code> e
          aplique o script SQL em <code className="rounded bg-zinc-200/80 px-1 text-xs dark:bg-zinc-800">docs/personal-finance/database-schema.sql</code>.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Entrar
          </Link>
          <Link
            href="/personal-finance"
            className="inline-flex rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Abrir painel
          </Link>
        </div>
        <p className="mt-3 text-center text-xs text-zinc-500">
          O painel redireciona para login se você não estiver autenticado.
        </p>
      </main>
    </div>
  );
}
