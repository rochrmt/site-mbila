import crypto from "node:crypto";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { getDb } from "./db";

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

const keyHash = (key: string) => crypto.createHash("sha256").update(key).digest("hex");
let lastSweep = 0;

// Compteur fixe en SQLite : survit aux redémarrages et reste commun aux workers.
// Les clés sont hachées pour ne pas stocker les identifiants ou IP en clair.
export function authAttempt(key: string, limit: number, windowMs: number): boolean {
  const db = getDb();
  const now = Date.now();
  if (now - lastSweep > 600_000) {
    db.prepare("DELETE FROM auth_limits WHERE reset_at <= ?").run(now);
    lastSweep = now;
  }
  const row = db.prepare(`
    INSERT INTO auth_limits (key, hits, reset_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      hits = CASE WHEN reset_at <= ? THEN 1 ELSE hits + 1 END,
      reset_at = CASE WHEN reset_at <= ? THEN excluded.reset_at ELSE reset_at END
    RETURNING hits
  `).get(keyHash(key), now + windowMs, now, now) as { hits: number };
  return row.hits <= limit;
}

export function authLimited(key: string, limit: number): boolean {
  const row = getDb().prepare("SELECT hits FROM auth_limits WHERE key = ? AND reset_at > ?")
    .get(keyHash(key), Date.now()) as { hits: number } | undefined;
  return !!row && row.hits >= limit;
}

export function clearAuthAttempts(...keys: string[]) {
  const stmt = getDb().prepare("DELETE FROM auth_limits WHERE key = ?");
  for (const key of keys) stmt.run(keyHash(key));
}

// IP du client (Traefik passe X-Forwarded-For)
const forwardedIp = (value: string | null) => {
  const ip = value?.split(",", 1)[0].trim() ?? "";
  return isIP(ip) ? ip : "inconnu";
};
export function clientIp(req: Request): string {
  return forwardedIp(req.headers.get("x-forwarded-for"));
}

// IP dans une Server Action (headers() fonctionne aussi ici)
export async function actionIp(): Promise<string> {
  const h = await headers();
  return forwardedIp(h.get("x-forwarded-for"));
}
