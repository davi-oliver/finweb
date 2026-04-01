import { jsonError, jsonOk, requirePfUser } from "@/app/api/personal-finance/_shared";

export async function GET() {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("pf_onboarding_status")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);

  if (!data) {
    return jsonOk({
      user_id: user.id,
      step_accounts_done: false,
      step_categories_done: false,
      step_first_transaction_done: false,
      dismissed_at: null,
      updated_at: new Date().toISOString(),
    });
  }

  return jsonOk(data);
}

export async function PUT(request: Request) {
  const auth = await requirePfUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return jsonError("JSON inválido");

  const row = {
    user_id: user.id,
    step_accounts_done: Boolean(body.step_accounts_done),
    step_categories_done: Boolean(body.step_categories_done),
    step_first_transaction_done: Boolean(body.step_first_transaction_done),
    dismissed_at: body.dismissed_at === null ? null : body.dismissed_at != null ? String(body.dismissed_at) : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("pf_onboarding_status")
    .upsert(row, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return jsonError(error.message, 400);
  return jsonOk(data);
}
