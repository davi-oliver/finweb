import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const EMAIL_OTP_TYPES = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function createCallbackSupabase(
  request: NextRequest,
  supabaseUrl: string,
  anonKey: string,
  response: NextResponse
) {
  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}

/**
 * Confirmação de e-mail / OAuth / magic link.
 * - Fluxo PKCE: `?code=...` (use `{{ .ConfirmationURL }}` no template do Supabase).
 * - Link customizado: `?token_hash=...&type=signup` (ver docs de e-mail do Supabase).
 * Os cookies da sessão vão no mesmo `NextResponse` do redirect.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const typeRaw = url.searchParams.get("type");
  const type =
    typeRaw && EMAIL_OTP_TYPES.has(typeRaw.toLowerCase()) ? typeRaw.toLowerCase() : null;

  const nextRaw = url.searchParams.get("next") ?? "/personal-finance";
  const nextPath = nextRaw.startsWith("/") ? nextRaw : "/personal-finance";
  const redirectTarget = new URL(nextPath, url.origin).toString();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.redirect(`${url.origin}/login?error=config`);
  }

  if (!code && !(token_hash && type)) {
    return NextResponse.redirect(`${url.origin}/login?error=missing_code`);
  }

  let response = NextResponse.redirect(redirectTarget);
  const supabase = createCallbackSupabase(request, supabaseUrl, anonKey, response);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const reason = encodeURIComponent(error.message.slice(0, 200));
      return NextResponse.redirect(`${url.origin}/login?error=exchange&reason=${reason}`);
    }
    return response;
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: token_hash!,
    type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
  });
  if (error) {
    const reason = encodeURIComponent(error.message.slice(0, 200));
    return NextResponse.redirect(`${url.origin}/login?error=exchange&reason=${reason}`);
  }

  return response;
}
