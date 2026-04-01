import { NextResponse } from "next/server";
import { jsonError, jsonOk, requirePfUser } from "@/app/api/personal-finance/_shared";
import type { PfTransactionKind } from "@/lib/personal-finance-types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;
  const { id } = await params;

  const { data, error } = await supabase
    .from("pf_transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Transação não encontrada", 404);
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
  if (body.recurring_id !== undefined) {
    patch.recurring_id = body.recurring_id === null ? null : String(body.recurring_id);
  }
  if (body.kind === "income" || body.kind === "expense" || body.kind === "transfer") {
    patch.kind = body.kind as PfTransactionKind;
  }
  if (body.amount != null) patch.amount = Number(body.amount);
  if (body.occurred_on != null) patch.occurred_on = String(body.occurred_on);
  if (body.description !== undefined) patch.description = body.description;
  if (body.notes !== undefined) patch.notes = body.notes;
  if (body.counterparty_account_id !== undefined) {
    patch.counterparty_account_id =
      body.counterparty_account_id === null ? null : String(body.counterparty_account_id);
  }

  if (Object.keys(patch).length === 0) return jsonError("Nenhum campo para atualizar");

  const { data, error } = await supabase
    .from("pf_transactions")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 400);
  if (!data) return jsonError("Transação não encontrada", 404);
  return jsonOk(data);
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;
  const { id } = await params;

  const { error, count } = await supabase
    .from("pf_transactions")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return jsonError(error.message, 400);
  if (!count) return jsonError("Transação não encontrada", 404);
  return new NextResponse(null, { status: 204 });
}
