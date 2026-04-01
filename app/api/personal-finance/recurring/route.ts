import { jsonError, jsonOk, parsePagination, requirePfUser } from "@/app/api/personal-finance/_shared";
import type { PfRecurringFrequency } from "@/lib/personal-finance-types";

const FREQUENCIES: PfRecurringFrequency[] = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
];

export async function GET(request: Request) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const { searchParams } = new URL(request.url);
  const { from, to } = parsePagination(searchParams);

  const { data, error, count } = await supabase
    .from("pf_recurring")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("next_due_date")
    .range(from, to);

  if (error) return jsonError(error.message, 500);
  return jsonOk({ items: data ?? [], total: count ?? 0 });
}

export async function POST(request: Request) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.account_id) return jsonError("account_id é obrigatório");
  if (!body?.next_due_date) return jsonError("next_due_date é obrigatório");

  const frequency = (body.frequency as PfRecurringFrequency) ?? "monthly";
  if (!FREQUENCIES.includes(frequency)) return jsonError("frequency inválida");

  const row = {
    user_id: user.id,
    account_id: String(body.account_id),
    category_id: body.category_id != null ? String(body.category_id) : null,
    amount: Number(body.amount ?? 0),
    description: body.description != null ? String(body.description) : null,
    frequency,
    next_due_date: String(body.next_due_date),
    is_active: body.is_active !== false,
  };

  if (row.amount <= 0) return jsonError("amount deve ser positivo");

  const { data, error } = await supabase.from("pf_recurring").insert(row).select().single();
  if (error) return jsonError(error.message, 400);
  return jsonOk(data, 201);
}
