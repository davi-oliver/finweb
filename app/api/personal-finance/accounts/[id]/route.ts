import { NextResponse } from "next/server";
import { jsonError, jsonOk, requirePfUser } from "@/app/api/personal-finance/_shared";
import type { PfAccountType } from "@/lib/personal-finance-types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;
  const { id } = await params;

  const { data, error } = await supabase
    .from("pf_accounts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Conta não encontrada", 404);
  return jsonOk(data);
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;
  const { id } = await params;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return jsonError("JSON inválido");

  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (body.type != null) patch.type = body.type as PfAccountType;
  if (typeof body.currency === "string") patch.currency = body.currency;
  if (body.initial_balance != null) patch.initial_balance = Number(body.initial_balance);
  if (body.institution !== undefined) patch.institution = body.institution;
  if (body.notes !== undefined) patch.notes = body.notes;
  if (body.archived_at !== undefined) {
    patch.archived_at = body.archived_at === null ? null : String(body.archived_at);
  }

  if (Object.keys(patch).length === 0) return jsonError("Nenhum campo para atualizar");

  const { data, error } = await supabase
    .from("pf_accounts")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 400);
  if (!data) return jsonError("Conta não encontrada", 404);
  return jsonOk(data);
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;
  const { id } = await params;

  const { error, count } = await supabase
    .from("pf_accounts")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return jsonError(error.message, 400);
  if (!count) return jsonError("Conta não encontrada", 404);
  return new NextResponse(null, { status: 204 });
}
