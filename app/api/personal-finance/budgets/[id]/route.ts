import { NextResponse } from "next/server";
import { jsonError, jsonOk, requirePfUser } from "@/app/api/personal-finance/_shared";
import type { PfBudgetPeriod } from "@/lib/personal-finance-types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;
  const { id } = await params;

  const { data, error } = await supabase
    .from("pf_budgets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Orçamento não encontrado", 404);
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
  if (body.category_id != null) patch.category_id = String(body.category_id);
  if (body.amount_limit != null) patch.amount_limit = Number(body.amount_limit);
  if (body.period_type === "monthly" || body.period_type === "yearly") {
    patch.period_type = body.period_type as PfBudgetPeriod;
  }
  if (body.period_year != null) patch.period_year = Number(body.period_year);
  if (body.period_month !== undefined) {
    patch.period_month = body.period_month === null ? null : Number(body.period_month);
  }

  if (Object.keys(patch).length === 0) return jsonError("Nenhum campo para atualizar");

  const { data, error } = await supabase
    .from("pf_budgets")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 400);
  if (!data) return jsonError("Orçamento não encontrado", 404);
  return jsonOk(data);
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;
  const { id } = await params;

  const { error, count } = await supabase
    .from("pf_budgets")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return jsonError(error.message, 400);
  if (!count) return jsonError("Orçamento não encontrado", 404);
  return new NextResponse(null, { status: 204 });
}
