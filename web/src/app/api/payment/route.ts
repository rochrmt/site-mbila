import { requireVerifiedUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { addPayment, getPaymentsBySite, getSiteById, notifyAdmins, sitePlanPrice } from "@/lib/db";
import { notifyAdmin } from "@/lib/mail";
import { MONTHS_OK, planLabel, totalFor } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { PHONE_OK } from "@/lib/validation";

// Signalement « j'ai payé » : le client a envoyé le montant par Orange Money,
// l'admin vérifie sur son compte marchand (heure + numéro du payeur) puis confirme.
export async function POST(req: Request) {
  const user = await requireVerifiedUser();
  if (!user) return Response.json({ error: "Connexion requise (email vérifié)." }, { status: 401 });
  if (!rateLimit(`payment:${clientIp(req)}`, 6, 60_000)) return Response.json({ error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });

  const form = await req.formData().catch(() => null);
  if (!form) return Response.json({ error: "Requête invalide" }, { status: 400 });

  const siteId = Number(form.get("site_id"));
  const plan = String(form.get("plan") ?? "");
  const months = Number(form.get("months"));
  const payer = String(form.get("payer") ?? "").trim().slice(0, 40);

  const site = getSiteById(siteId);
  if (!site || (site.user_id !== user.id && !isAdmin(user))) return Response.json({ error: "Site introuvable." }, { status: 404 });
  if (payer && !PHONE_OK(payer)) return Response.json({ error: "Numéro Orange Money invalide (7 à 15 chiffres)." }, { status: 400 });
  // Prix selon la catégorie du site + surcharge admin — jamais côté client
  const monthly = sitePlanPrice(plan, site.category).monthly;
  const monthsOk = (MONTHS_OK as readonly number[]).includes(months);
  const amount = monthly && monthsOk ? totalFor(monthly, months) : null;
  if (amount === null || !monthsOk) return Response.json({ error: "Offre invalide." }, { status: 400 });
  // Un seul paiement « en attente » par site : un double-clic ne crée pas de doublon
  const existing = getPaymentsBySite(site.id).find((p) => p.status === "en_attente");
  if (existing) return Response.json({ ok: true, id: existing.id });

  const id = addPayment({ site_id: site.id, user_id: user.id, plan, months, amount, payer });
  notifyAdmins(`💰 ${amount.toLocaleString("fr-FR")} FCFA signalé : « ${site.data.name} » par ${user.name}`, "/admin/paiements");
  await notifyAdmin(
    `💰 Paiement signalé : ${amount.toLocaleString("fr-FR")} FCFA (${site.data.name})`,
    `<h2>Nouveau paiement à vérifier</h2>
     <p><b>${planLabel(plan, months)}</b> · <b>${amount.toLocaleString("fr-FR")} FCFA</b></p>
     <p>Site : ${site.data.name} (${site.slug})<br>
     Client : ${user.name} — ${user.email ?? user.phone ?? ""}<br>
     ${payer ? `Numéro OM du payeur : <b>${payer}</b><br>` : ""}
     Site : ${site.slug}</p>
     <p>Vérifiez le virement sur votre compte Orange Money, puis :
     <a href="https://mbila.ca/admin/paiements">→ Confirmer dans l'admin</a></p>`,
  );
  return Response.json({ ok: true, id });
}
