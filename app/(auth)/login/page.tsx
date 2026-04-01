import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Entrar | Finweb",
  description: "Acesso à área autenticada",
};

type Props = { searchParams: Promise<{ next?: string; error?: string; reason?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error, reason } = await searchParams;
  let reasonText: string | null = null;
  if (reason) {
    try {
      reasonText = decodeURIComponent(reason);
    } catch {
      reasonText = reason;
    }
  }

  const lowerReason = reasonText?.toLowerCase() ?? "";
  const isPkceVerifierError =
    lowerReason.includes("pkce") || lowerReason.includes("code verifier");

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Entrar</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Use a conta configurada no Supabase Auth (e-mail e senha).
      </p>

      {error === "missing_code" && (
        <div className="mt-4 space-y-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
          <p className="font-medium">O link não trouxe código de confirmação.</p>
          <p className="text-xs opacity-95">
            No painel do Supabase, em <strong>Authentication → Email Templates → Confirm signup</strong>, o{" "}
            <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/40">href</code> não pode ser só{" "}
            <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/40">http://localhost:3000/auth/callback</code>.
            Use a variável oficial que já inclui o token:
          </p>
          <pre className="overflow-x-auto rounded-md bg-amber-100/60 p-2 text-xs dark:bg-amber-900/30">
            {`<a href="{{ .ConfirmationURL }}">Confirmar e-mail</a>`}
          </pre>
          <p className="text-xs opacity-95">
            Alternativa (evita erro de PKCE ao abrir o e-mail noutro app/navegador): use{" "}
            <code className="break-all rounded bg-amber-100/80 px-1 dark:bg-amber-900/40">
              {"{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup"}
            </code>{" "}
            com <strong>Site URL</strong> igual à origem do app (ex.{" "}
            <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/40">http://localhost:3000</code>).
          </p>
          <p className="text-xs opacity-95">
            Ajuste também <strong>Site URL</strong> e <strong>Redirect URLs</strong> para essa mesma origem (localhost
            + porta). Depois peça um novo e-mail ou entre com e-mail e senha.
          </p>
        </div>
      )}
      {error === "exchange" && (
        <div className="mt-4 space-y-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900 dark:bg-red-950/50 dark:text-red-100">
          <p>Não foi possível trocar o código por sessão (confirmação / magic link).</p>
          {reasonText && (
            <p className="font-mono text-xs opacity-90">
              {reasonText}
            </p>
          )}
          {isPkceVerifierError ? (
            <div className="space-y-2 text-xs opacity-95">
              <p>
                <strong>Por que acontece:</strong> o fluxo com <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/40">?code=</code>{" "}
                (PKCE) guarda um segredo em <strong>cookie neste navegador e nesta origem</strong> (inclui{" "}
                <strong>porta</strong>).{" "}
                <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/40">localhost:3000</code> e{" "}
                <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/40">localhost:3001</code> são origens
                diferentes: cookies não se misturam. Se você cadastrou numa porta e o link do e-mail abriu noutra, ou
                abriu o link no app de e-mail (outro “navegador”), o verificador some.
              </p>
              <p>
                <strong>O que fazer:</strong> (1) Use sempre a <strong>mesma porta</strong> no Supabase (
                <strong>Site URL</strong> + <strong>Redirect URLs</strong>) e no endereço onde faz cadastro. (2) Ou troque
                o template do e-mail para link com <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/40">token_hash</code>{" "}
                (não depende desse cookie):
              </p>
              <pre className="overflow-x-auto rounded-md bg-red-100/50 p-2 text-[11px] dark:bg-red-900/30">
                {`<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup">Confirmar</a>`}
              </pre>
              <p>Depois solicite um <strong>novo</strong> e-mail de confirmação.</p>
            </div>
          ) : (
            <p className="text-xs opacity-90">
              Confira se a Redirect URL no Supabase inclui a mesma origem do app (ex.:{" "}
              <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/40">http://localhost:3000/auth/callback</code>
              ) e solicite um novo e-mail se o link já tiver sido usado.
            </p>
          )}
        </div>
      )}
      {error === "config" && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900 dark:bg-red-950/50 dark:text-red-100">
          Variáveis <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_*</code> ausentes ou inválidas.
        </p>
      )}

      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-zinc-500">Carregando formulário…</p>}>
          <LoginForm nextPath={next} />
        </Suspense>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
          Criar conta
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300">
          ← Voltar ao início
        </Link>
      </p>
    </div>
  );
}
