"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";

export function DashboardUserMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        aria-label="Menu do usuário"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        title={loading ? "Sessão…" : email ?? "Menu do usuário"}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full"
      >
        <Icon name="person" filled />
      </IconButton>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Menu do usuário"
          className="absolute right-0 top-[calc(100%+10px)] w-56 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-1)] shadow-[var(--shadow-2)]"
        >
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">Conta</p>
            <p className="mt-1 truncate text-sm text-[var(--color-text-1)]" title={email ?? ""}>
              {loading ? "Sessão…" : (email ?? "—")}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-1)]"
            >
              <Icon name="home" />
              Início público
            </Link>
            <Button
              type="button"
              variant="ghost"
              className="mt-1 h-auto w-full justify-start gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm"
              onClick={() => void signOut()}
            >
              <Icon name="logout" />
              Sair
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
