import { jsonError, jsonOk, parsePagination, requirePfUser } from "@/app/api/personal-finance/_shared";
import type { PfBudgetPeriod } from "@/lib/personal-finance-types";

export async function GET(request: Request) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const { searchParams } = new URL(request.url);
  const { from, to } = parsePagination(searchParams);
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  let q = supabase
    .from("pf_budgets")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false })
    .range(from, to);

  if (year) q = q.eq("period_year", Number(year));
  if (month) q = q.eq("period_month", Number(month));

  const { data, error, count } = await q;
  if (error) return jsonError(error.message, 500);
  return jsonOk({ items: data ?? [], total: count ?? 0 });
}

export async function POST(request: Request) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.category_id) return jsonError("category_id é obrigatório");
  const periodType = (body.period_type as PfBudgetPeriod) ?? "monthly";
  if (periodType !== "monthly" && periodType !== "yearly") {
    return jsonError("period_type deve ser monthly ou yearly");
  }

  const periodYear = Number(body.period_year);
  const periodMonth =
    periodType === "monthly" ? Number(body.period_month) : null;

  if (!Number.isFinite(periodYear)) return jsonError("period_year inválido");
  if (periodType === "monthly" && (!Number.isFinite(periodMonth!) || periodMonth! < 1 || periodMonth! > 12)) {
    return jsonError("period_month inválido (1–12)");
  }

  const row = {
    user_id: user.id,
    category_id: String(body.category_id),
    amount_limit: Number(body.amount_limit ?? 0),
    period_type: periodType,
    period_year: periodYear,
    period_month: periodMonth,
  };

  const { data, error } = await supabase.from("pf_budgets").insert(row).select().single();
  if (error) return jsonError(error.message, 400);
  return jsonOk(data, 201);
}
