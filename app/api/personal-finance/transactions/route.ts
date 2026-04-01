import { jsonError, jsonOk, parseDateRange, parsePagination, requirePfUser } from "@/app/api/personal-finance/_shared";
import type { PfTransactionKind } from "@/lib/personal-finance-types";

export async function GET(request: Request) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const { searchParams } = new URL(request.url);
  const { from, to } = parsePagination(searchParams);
  const { from: dFrom, to: dTo } = parseDateRange(searchParams);

  let q = supabase
    .from("pf_transactions")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("occurred_on", { ascending: false })
    .range(from, to);

  if (dFrom) q = q.gte("occurred_on", dFrom);
  if (dTo) q = q.lte("occurred_on", dTo);

  const { data, error, count } = await q;
  if (error) return jsonError(error.message, 500);
  return jsonOk({ items: data ?? [], total: count ?? 0 });
}

export async function POST(request: Request) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.account_id) return jsonError("account_id é obrigatório");

  const kind = body.kind as PfTransactionKind;
  if (kind !== "income" && kind !== "expense" && kind !== "transfer") {
    return jsonError("kind deve ser income, expense ou transfer");
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) return jsonError("amount deve ser um número positivo");

  const row: Record<string, unknown> = {
    user_id: user.id,
    account_id: String(body.account_id),
    category_id:
      kind === "transfer"
        ? null
        : body.category_id != null
          ? String(body.category_id)
          : null,
    recurring_id: body.recurring_id != null ? String(body.recurring_id) : null,
    kind,
    amount,
    description: body.description != null ? String(body.description) : null,
    notes: body.notes != null ? String(body.notes) : null,
    counterparty_account_id:
      kind === "transfer" && body.counterparty_account_id != null
        ? String(body.counterparty_account_id)
        : null,
  };
  if (body.occurred_on != null) row.occurred_on = String(body.occurred_on);

  if (kind !== "transfer" && !row.category_id) {
    return jsonError("category_id é obrigatório para income/expense");
  }
  if (kind === "transfer" && !row.counterparty_account_id) {
    return jsonError("counterparty_account_id é obrigatório para transfer");
  }

  const { data, error } = await supabase.from("pf_transactions").insert(row).select().single();
  if (error) return jsonError(error.message, 400);
  return jsonOk(data, 201);
}
