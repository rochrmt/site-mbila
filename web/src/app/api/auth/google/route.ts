import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/config";
import { googleAuthUrl, googleConfigured, newGoogleState } from "@/lib/google";
import { authAttempt, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Point d'entrée « Continuer avec Google » : pose le state anti-CSRF en cookie
// (10 min) puis redirige vers l'écran de consentement Google.
// `next` = chemin interne de retour (ex. /payer/12) véhiculé dans le state.
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!googleConfigured()) return NextResponse.redirect(appUrl("/connexion?err=google_off"));
  if (!authAttempt(`google:start:${clientIp(req)}`, 10, 60_000))
    return new Response("Trop de tentatives. Réessayez plus tard.", { status: 429 });

  const raw = url.searchParams.get("next") ?? "/dashboard";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
  const state = newGoogleState(next);
  (await cookies()).set("mbila_gstate", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return NextResponse.redirect(googleAuthUrl(state));
}
