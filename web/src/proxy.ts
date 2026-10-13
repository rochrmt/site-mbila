import { NextResponse, type NextRequest } from "next/server";

const ROOT = (process.env.ROOT_DOMAIN || "localhost:3000").split(":")[0];
const RESERVED = new Set(["www", "app"]);

// Les sites des utilisateurs (slug.mbila.ca / slug.localhost) sont réécrits
// vers /site/<slug>. Le domaine principal sert la plateforme.
// Un domaine perso client (ex. monentreprise.com pointé sur le VPS) est réécrit
// vers /d/<hôte> qui résout le site en base.
export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  const suffix = `.${ROOT}`;
  if (!host.endsWith(suffix)) {
    // Plateforme (apex, localhost, accès direct par IP) : pas de réécriture
    if (host === ROOT || host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = `/d/${host}${req.nextUrl.pathname === "/" ? "" : req.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  const sub = host.slice(0, -suffix.length);
  if (!sub || sub.includes(".")) return NextResponse.next();
  if (RESERVED.has(sub)) return NextResponse.redirect(new URL(req.nextUrl.pathname, `${req.nextUrl.protocol}//${req.headers.get("host")!.replace(`${sub}.`, "")}`));

  const url = req.nextUrl.clone();
  url.pathname = `/site/${sub}${req.nextUrl.pathname === "/" ? "" : req.nextUrl.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|stock/|thumbs/|u/|s/|favicon.ico|robots.txt).*)"],
};
