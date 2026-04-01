import { jsonError, jsonOk, parseDateRange, requirePfUser } from "@/app/api/personal-finance/_shared";

/**
 * Agregações simples no intervalo: totais de receita/despesa e por categoria (despesa).
 */
export async function GET(request: Request) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const { searchParams } = new URL(request.url);
  const { from, to } = parseDateRange(searchParams);
  if (!from || !to) {
    return jsonError("Parâmetros from e to (YYYY-MM-DD) são obrigatórios");
  }

  const { data: txs, error } = await supabase
    .from("pf_transactions")
    .select("kind, amount, category_id")
    .eq("user_id", user.id)
    .gte("occurred_on", from)
    .lte("occurred_on", to);

  if (error) return jsonError(error.message, 500);

  let income = 0;
  let expense = 0;
  const byCategory: Record<string, number> = {};

  for (const t of txs ?? []) {
    if (t.kind === "income") income += Number(t.amount);
    else if (t.kind === "expense") {
      expense += Number(t.amount);
      const cid = t.category_id ?? "uncategorized";
      byCategory[cid] = (byCategory[cid] ?? 0) + Number(t.amount);
    }
  }

  const { data: accounts } = await supabase
    .from("pf_accounts")
    .select("id, initial_balance")
    .eq("user_id", user.id)
    .is("archived_at", null);

  const initialTotal = (accounts ?? []).reduce((s, a) => s + Number(a.initial_balance), 0);

  return jsonOk({
    range: { from, to },
    totals: {
      income,
      expense,
      result: income - expense,
      initial_balance_sum: initialTotal,
    },
    expense_by_category_id: byCategory,
  });
}
