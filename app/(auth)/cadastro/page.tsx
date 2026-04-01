import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = {
  title: "Criar conta | Finweb",
  description: "Cadastro com e-mail e senha (Supabase Auth)",
};

export default function CadastroPage() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Criar conta</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Enviamos confirmação por e-mail se estiver habilitado no painel do Supabase.
      </p>

      <div className="mt-6">
        <SignUpForm />
      </div>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
          Entrar
        </Link>
      </p>
    </div>
  );
}
