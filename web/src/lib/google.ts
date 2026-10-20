import "server-only";
import crypto from "node:crypto";
import { appUrl } from "./config";

// Connexion « Continuer avec Google » — flux OAuth 2.0 / OIDC classique,
// sans dépendance : authorize → callback → échange du code → id_token.
// L'id_token vient de l'endpoint token de Google en HTTPS serveur-à-serveur :
// vérifier aud/iss/exp suffit (la signature est garantie par le canal).
//
// Configuration : GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
// Redirect URI à déclarer dans la console Google :
//   https://mbila.ca/api/auth/google/callback  (+ http://localhost:3000/… en dev)

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export function googleConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri() {
  return appUrl("/api/auth/google/callback");
}

// URL d'autorisation : `next` (chemin interne de retour) est transporté dans le state.
export function googleAuthUrl(state: string) {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `${AUTH_URL}?${p}`;
}

export type GoogleIdentity = { sub: string; email: string; name: string };

// Échange du code contre les jetons puis décodage + validation de l'id_token.
// Renvoie null si quoi que ce soit cloche (le callback gère l'erreur générique).
export async function googleIdentity(code: string): Promise<GoogleIdentity | null> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) return null;
  const tokens = (await res.json()) as { id_token?: string };
  const payload = tokens.id_token?.split(".")[1];
  if (!payload) return null;

  let claims: { iss?: string; aud?: string; exp?: number; sub?: string; email?: string; email_verified?: boolean; name?: string };
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const issOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  if (!issOk || claims.aud !== process.env.GOOGLE_CLIENT_ID) return null;
  if (!claims.exp || claims.exp * 1000 < Date.now()) return null;
  if (!claims.sub || !claims.email || claims.email_verified !== true) return null;
  return { sub: claims.sub, email: claims.email, name: (claims.name ?? "").trim() || claims.email.split("@")[0] };
}

// Anti-CSRF : jeton à usage unique stocké en cookie httpOnly, comparé au state.
export function newGoogleState(next: string) {
  return `${crypto.randomBytes(16).toString("hex")}:${next}`;
}
