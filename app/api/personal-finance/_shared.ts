import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export const PF_PREFIX = "/api/personal-finance";

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSizeRaw = Number(searchParams.get("pageSize") ?? "20") || 20;
  const pageSize = Math.min(100, Math.max(1, pageSizeRaw));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

export function parseDateRange(searchParams: URLSearchParams) {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  return { from: from ?? undefined, to: to ?? undefined };
}

export function jsonError(message: string, status = 400, extras?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extras }, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Contexto do titular PF: usuário autenticado via Supabase (sem empresa/organização).
 */
export async function getPfContext(): Promise<{
  supabase: SupabaseClient;
  user: User;
} | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { supabase, user };
}

export type PfAuthResult =
  | { ok: true; supabase: SupabaseClient; user: User }
  | { ok: false; response: NextResponse };

export async function requirePfUser(): Promise<PfAuthResult> {
  const ctx = await getPfContext();
  if (!ctx) {
    return { ok: false, response: jsonError("Não autenticado", 401) };
  }
  return { ok: true, supabase: ctx.supabase, user: ctx.user };
}
