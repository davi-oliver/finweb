import { jsonOk } from "@/app/api/personal-finance/_shared";
import { requireN8nApiKey } from "@/app/api/personal-finance/n8n/_shared";

/** Contrato mínimo para verificar integração (ajuste no trabalho conforme necessidade). */
export async function GET(request: Request) {
  const denied = requireN8nApiKey(request);
  if (denied) return denied;
  return jsonOk({ ok: true, module: "personal-finance/n8n" });
}
