/** Rotas que exigem sessão Supabase (middleware redireciona para /login). */
export const PROTECTED_PATH_PREFIXES = ["/personal-finance"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isAuthModulePath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/cadastro";
}

export function isAuthCallbackPath(pathname: string): boolean {
  return pathname.startsWith("/auth/callback");
}
