import { NextResponse } from "next/server";
import { jsonError, jsonOk, requirePfUser } from "@/app/api/personal-finance/_shared";
import type { PfRecurringFrequency } from "@/lib/personal-finance-types";

const FREQUENCIES: PfRecurringFrequency[] = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
];

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;
  const { id } = await params;

  const { data, error } = await supabase
    .from("pf_recurring")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Recorrência não encontrada", 404);
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
  if (body.account_id != null) patch.account_id = String(body.account_id);
  if (body.category_id !== undefined) {
    patch.category_id = body.category_id === null ? null : String(body.category_id);
  }
  if (body.amount != null) patch.amount = Number(body.amount);
  if (body.description !== undefined) patch.description = body.description;
  if (body.frequency != null) {
    const f = body.frequency as PfRecurringFrequency;
    if (!FREQUENCIES.includes(f)) return jsonError("frequency inválida");
    patch.frequency = f;
  }
  if (body.next_due_date != null) patch.next_due_date = String(body.next_due_date);
  if (body.is_active != null) patch.is_active = Boolean(body.is_active);

  if (Object.keys(patch).length === 0) return jsonError("Nenhum campo para atualizar");

  const { data, error } = await supabase
    .from("pf_recurring")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 400);
  if (!data) return jsonError("Recorrência não encontrada", 404);
  return jsonOk(data);
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;
  const { id } = await params;

  const { error, count } = await supabase
    .from("pf_recurring")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return jsonError(error.message, 400);
  if (!count) return jsonError("Recorrência não encontrada", 404);
  return new NextResponse(null, { status: 204 });
}
