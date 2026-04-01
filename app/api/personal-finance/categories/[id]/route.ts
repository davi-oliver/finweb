import { NextResponse } from "next/server";
import { jsonError, jsonOk, requirePfUser } from "@/app/api/personal-finance/_shared";
import type { PfCategoryKind } from "@/lib/personal-finance-types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;
  const { id } = await params;

  const { data, error } = await supabase
    .from("pf_categories")
    .select("*")
    .eq("id", id)
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Categoria não encontrada", 404);
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
  if (body.slug !== undefined) patch.slug = body.slug;
  if (body.kind === "income" || body.kind === "expense") patch.kind = body.kind as PfCategoryKind;
  if (body.color !== undefined) patch.color = body.color;

  if (Object.keys(patch).length === 0) return jsonError("Nenhum campo para atualizar");

  const { data, error } = await supabase
    .from("pf_categories")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 400);
  if (!data) return jsonError("Categoria não encontrada ou é do sistema", 404);
  return jsonOk(data);
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;
  const { id } = await params;

  const { error, count } = await supabase
    .from("pf_categories")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return jsonError(error.message, 400);
  if (!count) return jsonError("Categoria não encontrada", 404);
  return new NextResponse(null, { status: 204 });
}
