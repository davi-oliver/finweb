import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com service role — ignora RLS. Use só em Route Handlers/server actions
 * confiáveis e sempre filtre por user_id do titular quando representar um usuário.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
