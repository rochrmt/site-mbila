"use server";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, getUser, hashPassword, requireUser, revokeOtherSessions, UNVERIFIED_AGE, verifyPassword } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { appUrl, RESERVED_SLUGS, ROOT_DOMAIN, siteUrl, SLUG_RE, slugify } from "@/lib/config";
import {
  addCustomDomain, addHostingRequest, addPasswordReset, addPayment, commitDraft, createEmailToken, createSite, deleteSite, discardDraft,
  getDb, getPayment, getSiteById, hasPendingReset, manualPaymentEnabled, markNotificationsRead, notifyAdmins, saveDraft as saveDraftDb,
  setPaymentExternal, setPaymentStatus, siteIsPaid, slugTaken, undoSite as undoSiteDb, updateSite, updateUserEmail, updateUserPassword,
} from "@/lib/db";
import { chariowProductFor, fetchProductPrice, initiateCheckout } from "@/lib/chariow";
import { notifyAdmin, sendUserMail } from "@/lib/mail";
import { actionIp, rateLimit } from "@/lib/rateLimit";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { EMAIL_OK, PHONE_OK } from "@/lib/validation";
import { monthlyPrice } from "@/lib/pricing";
import { generateSiteData, matchTemplates, type Answers } from "@/content/generate";
import { allTemplates } from "@/templates/all";
import { PALETTES } from "@/templates/palettes";
import type { AnimLevel, SiteData } from "@/templates/types";

export type FormState = { error?: string; ok?: string } | undefined;

// ── Authentification ─────────────────────────────────────────────
export async function signup(_: FormState, form: FormData): Promise<FormState> {
  if (!(await rateLimit(`signup:${await actionIp()}`, 5, 60_000))) return { error: "Trop de tentatives. Réessayez dans une minute." };
  const name = String(form.get("name") || "").trim();
  const identifier = String(form.get("identifier") || "").trim();
  const password = String(form.get("password") || "");
  if (name.length < 2) return { error: "Indiquez votre nom." };
  // Inscription par email uniquement — l'adresse sera vérifiée avant d'activer le compte
  const email = EMAIL_OK(identifier) ? identifier.toLowerCase() : null;
  if (!email) return { error: "Entrez une adresse email valide (ex : nom@exemple.com)." };
  if (password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  if (String(form.get("password2") || "") !== password) return { error: "Les deux mots de passe ne correspondent pas." };
  if (form.get("cgu") !== "on") return { error: "Vous devez accepter les Conditions d'utilisation pour créer un compte." };
  const db = getDb();
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email))
    return { error: "Un compte existe déjà avec cet email." };
  const r = db.prepare("INSERT INTO users (name, email, password, email_verified) VALUES (?, ?, ?, 0)").run(name, email, hashPassword(password));
  const userId = Number(r.lastInsertRowid);
  await sendVerificationEmail(userId, email, name);
  await createSession(userId, UNVERIFIED_AGE); // session courte tant que l'email n'est pas confirmé
  redirect("/verifier-attente");
}

// Jeton de vérification d'email (24 h, usage unique, sha256 stocké) + envoi.
// Le lien pointe TOUJOURS sur ROOT_DOMAIN (mbila.ca en prod) — jamais l'en-tête Host
// de la requête : ça évite le spam (lien « localhost ») et l'injection d'en-tête hostile.
async function sendVerificationEmail(userId: number, email: string, name?: string) {
  const token = crypto.randomBytes(24).toString("hex");
  createEmailToken(userId, crypto.createHash("sha256").update(token).digest("hex"), 24 * 3600_000);
  const domain = ROOT_DOMAIN; // mbila.ca en prod, localhost:3000 en dev
  const link = appUrl(`/verifier?token=${token}`);
  const nameSafe = (name ?? "").replace(/[<>&]/g, "");
  const sent = await sendUserMail(
    email,
    "Activez votre compte Mbila",
    `<p style="font-size:18px;font-weight:700;color:#111">Mbila, votre site web</p>
     <p>Bonjour ${nameSafe || "et bienvenue"},</p>
     <p>Votre compte Mbila est créé ! Un dernier clic pour l'activer :</p>
     <p style="text-align:center;margin:28px 0"><a href="${link}" style="background:#d946ef;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700">Activer mon compte</a></p>
     <p style="color:#666;font-size:13px">Ce lien est valable 24 h et à usage unique. Si vous n'avez pas créé de compte Mbila, ignorez simplement cet email.</p>
     <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
     <p style="color:#999;font-size:12px">Mbila · créez votre site web en 2 minutes · ${domain}</p>`,
    `Bonjour ${nameSafe || ""},\n\nVotre compte Mbila est créé ! Activez-le avec ce lien (valable 24 h) :\n\n${link}\n\nSi vous n'avez pas créé de compte Mbila, ignorez cet email.\n\n— Mbila · ${domain}`,
  );
  if (!sent) console.log(`[verifier] pas de SMTP — lien de vérification pour ${email} : ${link}`);
  return sent;
}

// Renvoi du lien — 3/heure par compte
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function resendVerification(_: FormState, _form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Connectez-vous." };
  if (!user.email || user.email_verified) return { error: "Votre email est déjà confirmé." };
  if (!(await rateLimit(`verif:${user.id}`, 3, 3_600_000))) return { error: "Trop de renvois. Réessayez dans une heure." };
  await sendVerificationEmail(user.id, user.email, user.name);
  return { ok: "Email de vérification renvoyé. Pensez à vérifier vos spams." };
}

// Redirection post-connexion : uniquement des chemins internes (jamais //…)
const safeNext = (v: FormDataEntryValue | null, fallback: string) => {
  const s = String(v ?? "");
  return /^\/(?!\/)[\w\-/?#=&.]*$/.test(s) ? s : fallback;
};

// Résolution d'un identifiant (email ou téléphone) :
// 1) correspondance EXACTE — jamais de ligne au hasard (un suffixe vide matcherait tous les téléphones !)
// 2) tolérance à l'indicatif pays : suffixe de ≥7 chiffres uniquement
type IdentRow = { id: number; password: string; email: string | null; email_verified: number };
function findUserByIdentifier(identifier: string): IdentRow[] {
  const db = getDb();
  const exact = db
    .prepare("SELECT id, password, email, email_verified FROM users WHERE (email IS NOT NULL AND email = ?) OR (phone IS NOT NULL AND phone = ?)")
    .all(identifier.toLowerCase(), identifier.replace(/\D/g, "")) as { id: number; password: string; email: string | null; email_verified: number }[];
  if (exact.length) return exact;
  const digits = identifier.replace(/\D/g, "");
  if (digits.length < 7) return [];
  return db
    .prepare("SELECT id, password, email, email_verified FROM users WHERE phone IS NOT NULL AND (phone LIKE ? OR ? LIKE '%' || phone) LIMIT 5")
    .all(`%${digits}`, digits) as { id: number; password: string; email: string | null; email_verified: number }[];
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  // Anti brute-force : 5 essais/min par IP + par identifiant ciblé
  const ip = await actionIp();
  const identifier = String(form.get("identifier") || "").trim();
  if (!(await rateLimit(`login:${ip}`, 5, 60_000)) || !(await rateLimit(`login:${identifier.toLowerCase()}`, 10, 60_000)))
    return { error: "Trop de tentatives. Réessayez dans une minute." };
  const password = String(form.get("password") || "");
  const u = findUserByIdentifier(identifier).find((r) => verifyPassword(password, r.password));
  if (!u) return { error: "Identifiant ou mot de passe incorrect." };
  // Compte dont l'email n'est pas encore vérifié → session courte (24 h), pas 30 jours
  await createSession(u.id, u.email && !u.email_verified ? UNVERIFIED_AGE : undefined);
  redirect(safeNext(form.get("next"), "/dashboard"));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

// ── Mon compte : identifiant & mot de passe ──────────────────────
// Le mot de passe actuel est exigé : une session volée ne suffit pas pour détourner le compte.
export async function changeIdentifier(_: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Connectez-vous." };
  if (!(await rateLimit(`acct:id:${user.id}`, 5, 60_000))) return { error: "Trop de tentatives. Réessayez dans une minute." };
  const identifier = String(form.get("identifier") || "").trim();
  const password = String(form.get("password") || "");
  const email = EMAIL_OK(identifier) ? identifier.toLowerCase() : null;
  if (!email) return { error: "Entrez une adresse email valide (ex : nom@exemple.com)." };
  const db = getDb();
  const row = db.prepare("SELECT password FROM users WHERE id = ?").get(user.id) as { password: string };
  if (!verifyPassword(password, row.password)) return { error: "Mot de passe actuel incorrect." };
  const taken = db.prepare("SELECT 1 FROM users WHERE email = ? AND id != ?").get(email, user.id);
  if (taken) return { error: "Cet email est déjà utilisé par un autre compte." };
  updateUserEmail(user.id, email); // repasse en non-vérifié : la nouvelle adresse doit être confirmée
  await sendVerificationEmail(user.id, email, user.name);
  return { ok: "Email mis à jour. Un lien de vérification vous a été envoyé. Confirmez-le pour réactiver votre compte." };;
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Connectez-vous." };
  if (!(await rateLimit(`acct:pw:${user.id}`, 5, 60_000))) return { error: "Trop de tentatives. Réessayez dans une minute." };
  const current = String(form.get("current") || "");
  const password = String(form.get("password") || "");
  if (password.length < 8) return { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
  if (String(form.get("password2") || "") !== password) return { error: "Les deux mots de passe ne correspondent pas." };
  const row = getDb().prepare("SELECT password FROM users WHERE id = ?").get(user.id) as { password: string };
  if (!verifyPassword(current, row.password)) return { error: "Mot de passe actuel incorrect." };
  updateUserPassword(user.id, hashPassword(password));
  await revokeOtherSessions(user.id); // toute autre session (appareil oublié, volée…) est fermée
  return { error: "", ok: "Mot de passe modifié." };
}

// ── Mot de passe oublié : alerte à l'admin ───────────────────────
// Anti-usurpation : la réinitialisation n'est JAMAIS automatique — l'admin vérifie
// l'identité de la personne par WhatsApp avant de remettre un mot de passe.
export async function requestAccountRecovery(_: FormState, form: FormData): Promise<FormState> {
  const OK = { error: "", ok: "Si un compte correspond, votre demande a été envoyée à notre équipe. Contactez-nous sur WhatsApp pour accélérer la vérification." };
  // Pot de miel : champ invisible rempli uniquement par les robots
  if (String(form.get("website") || "")) return OK;
  const ip = await actionIp();
  // Anti-spam : 3 demandes/heure/IP max, peu importe le compte visé
  if (!(await rateLimit(`recup:${ip}`, 3, 3_600_000))) return OK;
  const identifier = String(form.get("identifier") || "").trim().slice(0, 120);
  const contact = String(form.get("contact") || "").trim().slice(0, 60);
  const message = String(form.get("message") || "").trim().slice(0, 500);
  if (identifier.length < 3 || !PHONE_OK(contact)) return { error: "Indiquez votre identifiant et un numéro WhatsApp valide pour être rappelé." };
  // Résolution de l'identifiant sans jamais révéler s'il existe (anti-énumération) ;
  // seul un compte résolu sans ambiguïté est rattaché — sinon l'admin tranche à la main.
  const cands = findUserByIdentifier(identifier);
  const u = cands.length === 1 ? cands[0] : undefined;
  if (u || !cands.length) {
    // Une seule demande en attente par compte — impossible de spammer l'admin
    if (u && hasPendingReset(u.id)) return OK;
    // Anti-rafale sur le même compte : 2 demandes/jour
    if (u && !(await rateLimit(`recup:u:${u.id}`, 2, 86_400_000))) return OK;
    addPasswordReset(u?.id ?? null, identifier, contact, message, ip);
    notifyAdmins(`Récupération de compte demandée — vérifiez l'identité avant de réinitialiser.`, "/admin/recuperation");
    void notifyAdmin(
      "Mbila · Demande de récupération de compte",
      `<p>Un client demande la réinitialisation de son mot de passe.</p>
       <p>Identifiant saisi : <b>${identifier.replace(/[<>&]/g, "")}</b><br>Contact WhatsApp indiqué : ${contact.replace(/[<>&]/g, "")}</p>
       <p><b>Vérifiez son identité par WhatsApp avant de réinitialiser</b> dans Administration → Récupérations.</p>`,
    );
  }
  return OK;
}

// ── Adresse du site ──────────────────────────────────────────────
export async function checkSlug(raw: string) {
  const slug = slugify(raw);
  if (!SLUG_RE.test(slug)) return { slug, ok: false, reason: "3 à 30 caractères : lettres, chiffres et tirets." };
  if (RESERVED_SLUGS.has(slug)) return { slug, ok: false, reason: "Cette adresse est réservée." };
  if (slugTaken(slug)) return { slug, ok: false, reason: "Déjà prise, essayez une variante." };
  return { slug, ok: true };
}

// ── Création depuis l'assistant ──────────────────────────────────
export async function createFromAnswers(answers: Answers, rawSlug: string) {
  const user = await requireUser();
  const s = await checkSlug(rawSlug);
  if (!s.ok) return { error: s.reason };
  const proposals = matchTemplates(answers);
  const data = generateSiteData(answers);
  if (!data.contact.email) data.contact.email = user.email ?? "";
  const id = createSite({
    userId: user.id,
    slug: s.slug,
    templateId: proposals[0].templateId,
    paletteId: proposals[0].paletteId,
    anim: answers.anim,
    proposals: proposals.map((p) => `${p.templateId}:${p.paletteId}`),
    data,
    category: answers.category,
  });
  return { id };
}

async function ownSite(id: number) {
  const user = await requireUser();
  const site = getSiteById(id);
  // Le propriétaire ou un administrateur (support client)
  if (!site || (site.user_id !== user.id && !isAdmin(user))) redirect("/dashboard");
  return site;
}

export async function chooseProposal(id: number, templateId: string, paletteId: string) {
  await ownSite(id);
  // Le site reste en brouillon : on dirige vers la page de paiement
  updateSite(id, { template_id: templateId, palette_id: paletteId });
  redirect(`/payer/${id}`);
}

// ── Édition (brouillon → enregistrement manuel) ──────────────────
// L'éditeur auto-sauvegarde dans un brouillon (visible dans l'aperçu) ;
// rien n'est publié tant que le client n'appuie pas sur « Enregistrer ».
export async function saveDraft(id: number, s: { data: SiteData; templateId: string; paletteId: string; anim: AnimLevel }) {
  const site = await ownSite(id);
  if (!allTemplates().some((t) => t.id === s.templateId) || !PALETTES.some((p) => p.id === s.paletteId)) return { ok: false };
  if (!["none", "subtle", "rich"].includes(s.anim)) return { ok: false };
  saveDraftDb(id, {
    data: { ...s.data, category: site.data.category },
    templateId: s.templateId,
    paletteId: s.paletteId,
    anim: s.anim,
  });
  return { ok: true };
}

// « Enregistrer » : le brouillon devient la version en ligne, l'ancienne part dans l'historique
export async function commitSite(id: number) {
  await ownSite(id);
  commitDraft(id);
  revalidatePath(`/dashboard/sites/${id}`);
  return { ok: true };
}

// « Annuler » : le brouillon est jeté, retour à la version en ligne
export async function discardSiteDraft(id: number) {
  await ownSite(id);
  discardDraft(id);
  revalidatePath(`/dashboard/sites/${id}`);
  return { ok: true };
}

// « Version précédente » : restaure la dernière version enregistrée
export async function undoSite(id: number) {
  await ownSite(id);
  const s = undoSiteDb(id);
  revalidatePath(`/dashboard/sites/${id}`);
  return s ? { ok: true, snapshot: s } : { ok: false };
}

export async function setPublished(id: number, published: boolean) {
  const site = await ownSite(id);
  // Publier exige un abonnement actif (dépublier reste libre)
  if (published && !siteIsPaid(site)) return { needPayment: true };
  // Site suspendu par l'admin : le client ne peut pas le remettre en ligne seul
  if (published && site.suspended) return { needPayment: false, suspended: true };
  updateSite(id, { published });
  revalidatePath(`/dashboard/sites/${id}`);
  revalidatePath("/dashboard");
  return { needPayment: false };
}

export async function removeSite(id: number) {
  await ownSite(id);
  deleteSite(id);
  redirect("/dashboard");
}

// ── Domaine personnalisé ────────────────────────────────────────
// Le client demande un domaine → demande enregistrée + lien WhatsApp admin.
// Aucune gestion DNS dans le SaaS : l'admin règle avec le client.
export async function requestDomain(siteId: number, domain: string) {
  const user = await requireUser();
  const site = await ownSite(siteId);
  const d = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/[/\s].*$/, "");
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(d) || d.length > 100) return { error: "Nom de domaine invalide (ex : monsite.com)." };
  if (!addCustomDomain(site.id, d)) return { error: "Ce domaine est déjà demandé ou actif." };
  addHostingRequest({
    user_id: user.id,
    site_id: site.id,
    name: site.data.name || user.name,
    email: user.email ?? "",
    phone: site.data.contact.whatsapp || site.data.contact.phone,
    stack: "Domaine perso",
    repo_url: "",
    file: null,
    file_name: null,
    file_size: null,
    domain: d,
    message: `Demande de domaine personnalisé\nSite : ${site.slug} (${siteUrl(site.slug)})\nDomaine souhaité : ${d}`,
  });
  notifyAdmins(`🌐 Domaine demandé : ${d} pour « ${site.data.name} »`, "/admin/hebergement");
  await notifyAdmin(
    `🌐 Domaine demandé : ${d}`,
    `<h2>Demande de domaine personnalisé</h2>
     <p><b>${d}</b> pour le site ${site.data.name} (${site.slug})</p>
     <p>Client : ${user.name} · ${user.email ?? user.phone ?? ""}</p>
     <p><a href="https://mbila.ca/admin/hebergement">→ Voir dans l'admin</a></p>`,
  );
  return { ok: true };
}

// Notifications : tout marquer comme lu quand le client ouvre la cloche
export async function markNotificationsReadAction() {
  const user = await requireUser();
  markNotificationsRead(user.id);
}

// ── Paiement en ligne (Chariow) ──────────────────────────────────
// Le client est redirigé vers la page de paiement Chariow ; le Pulse
// (/api/pulse) confirme puis active l'abonnement automatiquement.
// Crée le paiement « en ligne » en attente + la session Chariow, puis renvoie vers leur page.
async function startChariowCheckout(site: NonNullable<ReturnType<typeof getSiteById>>, user: { id: number; name: string; email: string | null; phone: string | null }, plan: string, months: number, payerPhone?: string): Promise<FormState> {
  // Prix mensuel de ce site (Essentiel varie selon la catégorie) → bon produit Chariow
  const product = chariowProductFor(plan, months, monthlyPrice(plan, site.category), site.category);
  if (!product) return { error: "Paiement en ligne indisponible pour cette offre : payez par Orange Money ci-dessous." };

  // Numéro Mobile Money à débiter : celui saisi au checkout en priorité — le
  // client peut payer avec le compte d'un tiers (conjoint, employé…), pas
  // forcément le WhatsApp du site ni le téléphone du compte.
  // Préfixe international (+XX) → pays détecté ; sinon interprété comme centrafricain.
  const rawPhone = (payerPhone ?? "").trim() || user.phone || site.data.contact?.whatsapp || site.data.contact?.phone || "";
  const parsed = parsePhoneNumberFromString(rawPhone, "CF");
  if (rawPhone && (!parsed || !parsed.isPossible()))
    return { error: "Le numéro à débiter semble invalide (ex : 72 00 00 00). Vérifiez-le ou payez par transfert ci-dessous." };

  // Montant réel : le prix courant chez Chariow (il peut changer sans toucher au .env)
  const amount = (await fetchProductPrice(product.id)) ?? product.price;

  const paymentId = addPayment({
    site_id: site.id, user_id: user.id, plan, months,
    amount, method: "chariow",
    payer: user.email ?? user.phone ?? user.name,
    payer_phone: parsed?.nationalNumber ?? rawPhone.replace(/\D/g, ""),
  });

  let checkoutUrl: string;
  try {
    const [first, ...rest] = user.name.trim().split(/\s+/);
    const r = await initiateCheckout({
      productId: product.id,
      email: user.email ?? `client${user.id}@mbila.ca`,
      firstName: first || "Client",
      lastName: rest.join(" ") || "Mbila",
      phone: parsed?.nationalNumber ?? "72679175", // repli : numéro boutique
      countryCode: parsed?.country ?? "CF",
      redirectUrl: appUrl(`/payer/${site.id}?online=merci`),
      metadata: { payment_id: String(paymentId), site_id: String(site.id), plan, months: String(months) },
      // Pas d'IP client : en démo LAN on enverrait une IP privée que leurs
      // systèmes (géoloc paiement mobile) ne savent pas traiter → échec OM
    });
    checkoutUrl = r.checkoutUrl;
    if (r.saleId) setPaymentExternal(paymentId, r.saleId);
  } catch (e) {
    setPaymentStatus(paymentId, "refuse", `Chariow : ${(e as Error).message}`);
    return { error: "Paiement en ligne indisponible pour le moment : payez par Orange Money ci-dessous." };
  }
  redirect(checkoutUrl);
}

export async function payOnline(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!(await rateLimit(`payonline:${user.id}`, 6, 60_000))) return { error: "Trop de tentatives. Réessayez dans une minute." };
  const site = await ownSite(Number(form.get("site_id") ?? 0));
  const plan = String(form.get("plan") ?? "");
  const months = Math.max(1, Math.min(24, Number(form.get("months") ?? 1)));
  // Numéro à débiter : saisi par le client dans le formulaire en ligne
  const payerPhone = String(form.get("payer_phone") || "").trim();
  if (!PHONE_OK(payerPhone))
    return { error: "Entrez le numéro Mobile Money à débiter (ex : 72 00 00 00)." };
  // Un paiement déjà en attente (manuel ou en ligne) bloque un nouvel essai
  if (getDb().prepare("SELECT 1 FROM payments WHERE site_id = ? AND status = 'en_attente'").get(site.id))
    return { error: "Un paiement est déjà en cours de vérification." };
  return startChariowCheckout(site, user, plan, months, payerPhone);
}

// Réessayer après un paiement en ligne resté en attente : l'ancienne tentative
// est abandonnée (elle reste en historique) et une nouvelle session s'ouvre.
export async function retryOnlinePayment(form: FormData) {
  const user = await requireUser();
  if (!(await rateLimit(`payonline:${user.id}`, 6, 60_000))) return;
  const pay = getPayment(Number(form.get("payment_id") ?? 0));
  const site = pay ? getSiteById(pay.site_id) : null;
  if (!pay || !site || (site.user_id !== user.id && !isAdmin(user))) redirect("/dashboard");
  // Le client peut corriger le numéro à débiter à la relance ; sinon on reprend
  // celui de la tentative précédente (enregistré sur le paiement).
  const submitted = String(form.get("payer_phone") || "").trim();
  const payerPhone = PHONE_OK(submitted) ? submitted : pay.payer_phone || undefined;
  if (pay.status === "en_attente" && pay.method === "chariow")
    setPaymentStatus(pay.id, "refuse", "Tentative relancée par le client");
  const res = await startChariowCheckout(site, user, pay.plan, pay.months, payerPhone);
  // Sans redirection vers Chariow (produit absent, numéro invalide…) : retour
  // à la page de paiement pour afficher l'état réel plutôt qu'un écran figé.
  if (res) redirect(`/payer/${site.id}`);
}

// Basculer vers le transfert manuel : le paiement en ligne en attente est
// abandonné, le formulaire Orange Money redevient disponible.
// Bloqué si l'admin a désactivé le paiement manuel (réglage global).
export async function switchToManualPayment(form: FormData) {
  const user = await requireUser();
  const pay = getPayment(Number(form.get("payment_id") ?? 0));
  const site = pay ? getSiteById(pay.site_id) : null;
  if (!pay || !site || (site.user_id !== user.id && !isAdmin(user))) redirect("/dashboard");
  if (!manualPaymentEnabled()) redirect(`/payer/${site.id}`);
  if (pay.status === "en_attente")
    setPaymentStatus(pay.id, "refuse", "Le client opte pour le transfert Orange Money");
  redirect(`/payer/${site.id}`);
}
