import { headers } from "next/headers";

// Limiteur en mémoire (fenêtre glissante) — suffisant pour un seul conteneur.
// Suffisant contre le spam basique ; ne remplace pas un WAF derrière Traefik.
const buckets = new Map<string, number[]>();

// true = autorisé, false = limite atteinte
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => t > now - windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

// IP du client (Traefik passe X-Forwarded-For)
export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "inconnu";
}

// IP dans une Server Action (headers() fonctionne aussi ici)
export async function actionIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "inconnu";
}
