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
    .select("kind, amount, category_id, occurred_on")
    .eq("user_id", user.id)
    .gte("occurred_on", from)
    .lte("occurred_on", to);

  if (error) return jsonError(error.message, 500);

  let income = 0;
  let expense = 0;
  const byCategory: Record<string, number> = {};
  const netByDay: Record<string, number> = {};

  for (const t of txs ?? []) {
    const day = t.occurred_on as string;
    const amt = Number(t.amount);
    if (t.kind === "income") {
      income += amt;
      netByDay[day] = (netByDay[day] ?? 0) + amt;
    } else if (t.kind === "expense") {
      expense += amt;
      const cid = t.category_id ?? "uncategorized";
      byCategory[cid] = (byCategory[cid] ?? 0) + amt;
      netByDay[day] = (netByDay[day] ?? 0) - amt;
    }
  }

  /** Resultado acumulado (receitas − despesas) dia a dia no intervalo; transferências não entram. */
  function eachDayISO(fromStr: string, toStr: string): string[] {
    const out: string[] = [];
    const d = new Date(`${fromStr}T12:00:00`);
    const end = new Date(`${toStr}T12:00:00`);
    for (; d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }

  const days = eachDayISO(from, to);
  let run = 0;
  const cumulative_result_by_day = days.map((occurred_on) => {
    run += netByDay[occurred_on] ?? 0;
    return { occurred_on, cumulative: run };
  });

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
    cumulative_result_by_day,
  });
}
