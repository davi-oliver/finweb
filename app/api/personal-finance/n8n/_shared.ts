import { NextResponse } from "next/server";

export function requireN8nApiKey(request: Request): NextResponse | null {
  const expected = process.env.N8N_API_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: "N8N_API_KEY não configurada no servidor" },
      { status: 503 }
    );
  }
  const key = request.headers.get("x-api-key");
  if (!key || key !== expected) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return null;
}
