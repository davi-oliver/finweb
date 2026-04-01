import { jsonError, jsonOk, parsePagination, requirePfUser } from "@/app/api/personal-finance/_shared";
import type { PfCategoryKind } from "@/lib/personal-finance-types";

export async function GET(request: Request) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const { searchParams } = new URL(request.url);
  const { from, to } = parsePagination(searchParams);
  const kind = searchParams.get("kind") as PfCategoryKind | null;

  let q = supabase
    .from("pf_categories")
    .select("*", { count: "exact" })
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("is_system", { ascending: false })
    .order("name")
    .range(from, to);

  if (kind === "income" || kind === "expense") {
    q = q.eq("kind", kind);
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
  const kind = body.kind as PfCategoryKind;
  if (kind !== "income" && kind !== "expense") {
    return jsonError("kind deve ser income ou expense");
  }

  const row = {
    user_id: user.id,
    is_system: false,
    name: String(body.name).trim(),
    slug: body.slug != null ? String(body.slug) : null,
    kind,
    color: body.color != null ? String(body.color) : null,
  };

  const { data, error } = await supabase.from("pf_categories").insert(row).select().single();
  if (error) return jsonError(error.message, 400);
  return jsonOk(data, 201);
}
