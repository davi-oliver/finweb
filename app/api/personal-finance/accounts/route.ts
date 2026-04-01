import { jsonError, jsonOk, parsePagination, requirePfUser } from "@/app/api/personal-finance/_shared";
import type { PfAccountType } from "@/lib/personal-finance-types";

export async function GET(request: Request) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const { searchParams } = new URL(request.url);
  const { from, to } = parsePagination(searchParams);
  const includeArchived = searchParams.get("archived") === "1";

  let q = supabase
    .from("pf_accounts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!includeArchived) {
    q = q.is("archived_at", null);
  }

  const { data, error, count } = await q;
  if (error) return jsonError(error.message, 500);

  return jsonOk({ items: data ?? [], total: count ?? 0 });
}

export async function POST(request: Request) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.name || typeof body.name !== "string") {
    return jsonError("Campo name é obrigatório");
  }

  const row = {
    user_id: user.id,
    name: String(body.name).trim(),
    type: (body.type as PfAccountType) ?? "other",
    currency: typeof body.currency === "string" ? body.currency : "BRL",
    initial_balance: Number(body.initial_balance ?? 0),
    institution: body.institution != null ? String(body.institution) : null,
    notes: body.notes != null ? String(body.notes) : null,
  };

  const { data, error } = await supabase.from("pf_accounts").insert(row).select().single();
  if (error) return jsonError(error.message, 400);
  return jsonOk(data, 201);
}
