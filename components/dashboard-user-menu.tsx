"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export function DashboardUserMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mt-auto border-t border-zinc-200 p-3 dark:border-zinc-800">
      {loading ? (
        <p className="px-2 text-xs text-zinc-500">Sessão…</p>
      ) : (
        <>
          <p className="truncate px-2 text-xs text-zinc-600 dark:text-zinc-400" title={email ?? ""}>
            {email ?? "—"}
          </p>
          <div className="mt-2 flex flex-col gap-1">
            <Link
              href="/"
              className="rounded-md px-2 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              Início público
            </Link>
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start px-2 py-1.5 text-xs"
              onClick={() => void signOut()}
            >
              Sair
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
