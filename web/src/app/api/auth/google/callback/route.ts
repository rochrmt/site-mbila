import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { createGoogleUser, getUserByEmail, getUserByGoogleId, linkGoogleId } from "@/lib/db";
import { googleConfigured, googleIdentity } from "@/lib/google";

export const dynamic = "force-dynamic";

const back = (req: Request, err: string, next?: string) =>
  NextResponse.redirect(new URL(`/connexion?err=${err}${next ? `&next=${encodeURIComponent(next)}` : ""}`, req.url));

// Retour Google : state vérifié → échange du code → identité → compte local.
// 1) google_id connu → connexion directe
// 2) même email déjà vérifié → rattache le compte existant (fusion naturelle)
// 3) inconnu → création (email réputé vérifié par Google)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  const store = await cookies();
  const saved = store.get("mbila_gstate")?.value ?? "";
  store.delete("mbila_gstate");

  const sep = saved.indexOf(":");
  const next = sep >= 0 ? saved.slice(sep + 1) : "/dashboard";
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (!googleConfigured() || !code || !state || state !== saved) return back(req, "google_state", dest);

  const g = await googleIdentity(code);
  if (!g) return back(req, "google", dest);

  let user = getUserByGoogleId(g.sub) ?? null;
  if (!user) {
    const byEmail = getUserByEmail(g.email);
    if (byEmail) {
      linkGoogleId(byEmail.id, g.sub);
      user = byEmail;
    }
  }
  if (!user) {
    const id = createGoogleUser(g.name, g.email, g.sub, hashPassword(crypto.randomBytes(24).toString("hex")));
    user = getUserByGoogleId(g.sub) ?? { id, name: g.name, email: g.email, phone: null, profile: "particulier" };
  }

  if (user.blocked) return back(req, "google_blocked", dest);
  await createSession(user.id);
  return NextResponse.redirect(new URL(dest, url));
}
