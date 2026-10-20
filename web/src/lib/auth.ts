import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb, type User } from "./db";

const COOKIE = "mbila_session";
const MAX_AGE = 60 * 60 * 24 * 30;

export function hashPassword(pw: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(pw, salt, 64).toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(pw, salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, "hex"));
}

const sha = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

// Session « en attente de vérification email » : courte — au-delà, l'utilisateur
// doit se reconnecter (il retombera sur l'écran d'attente avec le bouton Renvoyer).
export const UNVERIFIED_AGE = 60 * 60 * 24;

export async function createSession(userId: number, maxAge = MAX_AGE) {
  const token = crypto.randomBytes(32).toString("base64url");
  getDb()
    .prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .run(sha(token), userId, Date.now() + maxAge * 1000);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE token = ?").run(sha(token));
  store.delete(COOKIE);
}

export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      "SELECT u.id, u.name, u.email, u.phone, u.profile, u.must_change, u.email_verified, u.blocked FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?",
    )
    .get(sha(token), Date.now()) as User | undefined;
  // Compte bloqué par l'admin : la session est traitée comme absente
  if (row?.blocked) return null;
  return row ?? null;
});

// Révoque les autres sessions du compte (après changement de mot de passe)
export async function revokeOtherSessions(userId: number) {
  const token = (await cookies()).get(COOKIE)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE user_id = ? AND token != ?").run(userId, sha(token));
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/connexion");
  // Mot de passe réinitialisé par l'admin → nouveau mot de passe exigé avant tout le reste
  if (user.must_change) redirect("/compte");
  // Email jamais vérifié → le compte doit d'abord être activé par le lien reçu
  if (user.email && !user.email_verified) redirect("/verifier-attente");
  return user;
}

// Compte dont l'email n'est pas encore confirmé : traité comme anonyme pour les
// actions qui produisent des effets (envoi de projet, paiement, upload, génération).
export async function requireVerifiedUser() {
  const user = await getUser();
  if (!user || (user.email && !user.email_verified)) return null;
  return user;
}
