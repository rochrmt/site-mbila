import { addLead, getSiteBySlug } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { EMAIL_OK } from "@/lib/validation";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function POST(req: Request) {
  // Anti-spam : 5 messages/min/IP + 8/min/site, sinon la boîte leads des clients est noyée
  if (!rateLimit(`lead:${clientIp(req)}`, 5, 60_000)) return Response.json({ error: "Trop de messages. Réessayez dans une minute." }, { status: 429 });
  const body = await req.json().catch(() => null);
  const slug = clip(body?.slug, 40);
  if (!rateLimit(`lead-site:${slug}`, 8, 60_000)) return Response.json({ error: "Trop de messages. Réessayez dans une minute." }, { status: 429 });
  const site = getSiteBySlug(slug);
  if (!site?.published || site.suspended) return Response.json({ error: "Site introuvable" }, { status: 404 });
  const lead = {
    name: clip(body.name, 120),
    email: clip(body.email, 200),
    phone: clip(body.phone, 40),
    message: clip(body.message, 3000),
  };
  if (!lead.name || !lead.message) return Response.json({ error: "Champs manquants" }, { status: 400 });
  if (lead.email && !EMAIL_OK(lead.email)) return Response.json({ error: "Adresse email invalide." }, { status: 400 });
  if (lead.phone && lead.phone.replace(/\D/g, "").length > 15) return Response.json({ error: "Numéro de téléphone invalide." }, { status: 400 });
  addLead(site.id, lead);
  return Response.json({ ok: true });
}
