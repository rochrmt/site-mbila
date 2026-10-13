"use server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin";
import { hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/config";
import { DATA_DIR } from "@/lib/config";
import {
  addStockImage, confirmPayment, deleteCustomTemplate, deleteHostingRequest, deleteSite, deleteStockImage, getCustomDomain,
  getDb, getHostingRequest, getPayment, getSiteById, getUserById, HOSTING_STATUS, notify, saveCustomTemplate,
  adminResetPassword, getPasswordResets, setCustomDomainStatus, setEmailVerified, setPasswordResetStatus, setPaymentStatus, setPlanPrice,
  setSiteFeatured, updateHostingRequest, updateSite,
  type FeatureSlot, type HostingStatus,
} from "@/lib/db";
import { provisionDns, writeDomainRouter } from "@/lib/domains";
import { SECTION_KINDS } from "@/templates/kinds";
import { TEMPLATES } from "@/templates/library";
import { FONT_PAIRS, PALETTES } from "@/templates/palettes";
import type { Template } from "@/templates/types";

const KIND_IDS = new Set(SECTION_KINDS.map((k) => k.id));
const variantOk = (kind: string, v: string) => SECTION_KINDS.some((k) => k.id === kind && k.variants.some((x) => x.id === v));

// ── Templates ───────────────────────────────────────────────────
export type TplInput = {
  id?: string;
  name: string;
  description: string;
  categories: string[];
  moods: string[];
  anim: string;
  palette: string;
  altPalettes: string[];
  fonts: string;
  radius: string;
  nav: string;
  footer: string;
  sections: string[]; // "kind:variant"
};

export async function saveTemplateAction(input: TplInput) {
  await requireAdmin();
  const name = input.name.trim();
  if (name.length < 2) return { error: "Indiquez un nom." };
  if (!input.categories.length) return { error: "Choisissez au moins une catégorie." };
  if (!input.sections.length) return { error: "Ajoutez au moins une section." };
  if (!input.sections[0].startsWith("hero:")) return { error: "La première section doit être un hero." };
  if (!PALETTES.some((p) => p.id === input.palette)) return { error: "Palette invalide." };
  if (!FONT_PAIRS.some((f) => f.id === input.fonts)) return { error: "Police invalide." };
  for (const s of input.sections) {
    const [k, v] = s.split(":");
    if (!KIND_IDS.has(k) || !variantOk(k, v)) return { error: `Section invalide : ${s}` };
  }

  const id = input.id ?? `c-${slugify(name)}-${crypto.randomBytes(3).toString("hex")}`;
  if (input.id && !input.id.startsWith("c-")) return { error: "Modèle système : non modifiable." };
  if (TEMPLATES.some((t) => t.id === id)) return { error: "Ce nom existe déjà dans la bibliothèque." };

  const tpl: Template = {
    id,
    name,
    description: input.description.trim(),
    categories: input.categories,
    moods: input.moods as Template["moods"],
    anim: input.anim as Template["anim"],
    palette: input.palette,
    altPalettes: input.altPalettes.filter((p) => p !== input.palette && PALETTES.some((x) => x.id === p)),
    fonts: input.fonts,
    radius: input.radius as Template["radius"],
    nav: input.nav as Template["nav"],
    footer: input.footer as Template["footer"],
    sections: input.sections.map((s) => s.split(":") as [never, string]),
  };
  saveCustomTemplate(tpl);
  redirect("/admin/templates?saved=1");
}

export async function deleteTemplateAction(id: string) {
  await requireAdmin();
  if (!id.startsWith("c-")) return { error: "Les modèles intégrés ne peuvent pas être supprimés." };
  deleteCustomTemplate(id);
  revalidatePath("/admin/templates");
  return { ok: true };
}

// ── Images de la banque ─────────────────────────────────────────
const IMG_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const IMG_MAX = 10 * 1024 * 1024;

export async function uploadStockImages(form: FormData) {
  await requireAdmin();
  const category = String(form.get("category") || "");
  if (!category) return { error: "Choisissez une catégorie." };
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return { error: "Aucun fichier." };

  const dir = path.join(DATA_DIR, "uploads", "stock");
  await fs.mkdir(dir, { recursive: true });
  let count = 0;
  for (const f of files.slice(0, 20)) {
    if (!IMG_TYPES.has(f.type) || f.size > IMG_MAX) continue;
    const name = `${crypto.randomBytes(8).toString("hex")}.webp`;
    const img = sharp(Buffer.from(await f.arrayBuffer())).rotate();
    const meta = await img.metadata();
    await img
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(dir, name));
    addStockImage({ category, src: `/s/${name}`, alt: f.name.replace(/\.[^.]+$/, ""), w: meta.width ?? 1600, h: meta.height ?? 1200 });
    count++;
  }
  revalidatePath("/admin/images");
  return count ? { ok: true, count } : { error: "Formats acceptés : JPG, PNG, WebP (10 Mo max)." };
}

export async function removeStockImage(id: number) {
  await requireAdmin();
  deleteStockImage(id);
  revalidatePath("/admin/images");
  return { ok: true };
}

// ── Hébergement de projets ──────────────────────────────────────
export async function updateHostingAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const status = String(form.get("status") ?? "");
  const before = getHostingRequest(id);
  updateHostingRequest(id, {
    status: status in HOSTING_STATUS ? (status as HostingStatus) : undefined,
    note: String(form.get("note") ?? "").slice(0, 3000),
  });
  // Notifie le client quand son dossier bouge (la suite se gère hors plateforme, via WhatsApp)
  const label = status === "en_cours" ? "en cours d'analyse" : status === "en_ligne" ? "en ligne 🎉" : status === "refuse" ? "refusée" : "";
  if (before && label && before.status !== status) {
    const what = before.stack === "Domaine perso" ? `domaine « ${before.domain} »` : `projet « ${before.name} »`;
    notify(before.user_id, `Votre demande (${what}) est ${label}. La suite se fait avec nous sur WhatsApp.`, "/dashboard");
  }
  revalidatePath("/admin/hebergement");
}

export async function deleteHostingAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const r = getHostingRequest(id);
  if (r?.file) await fs.unlink(path.join(DATA_DIR, "uploads", "hosting", path.basename(r.file))).catch(() => {});
  deleteHostingRequest(id);
  revalidatePath("/admin/hebergement");
}

// ── Domaines personnalisés ──────────────────────────────────────
// Activation = fichier routeur Traefik (rechargé à chaud) + DNS API si configuré.
export async function activateDomainAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const r = getHostingRequest(id);
  const row = r?.domain ? getCustomDomain(r.domain) : null;
  if (!r || !r.domain || !row) return;
  writeDomainRouter(r.domain, true);
  const dns = await provisionDns(r.domain);
  setCustomDomainStatus(row.id, "actif");
  updateHostingRequest(id, { status: "en_ligne", note: `${r.note ? r.note + "\n" : ""}${dns}` });
  notify(r.user_id, `Votre domaine ${r.domain} est en ligne !`, `https://${r.domain}`);
  revalidatePath("/admin/hebergement");
}

export async function deactivateDomainAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const r = getHostingRequest(id);
  const row = r?.domain ? getCustomDomain(r.domain) : null;
  if (!r || !r.domain || !row) return;
  writeDomainRouter(r.domain, false);
  setCustomDomainStatus(row.id, "desactive");
  updateHostingRequest(id, { status: "en_cours" });
  revalidatePath("/admin/hebergement");
}

export async function refuseDomainAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const r = getHostingRequest(id);
  const row = r?.domain ? getCustomDomain(r.domain) : null;
  if (row) setCustomDomainStatus(row.id, "refuse");
  if (r) updateHostingRequest(id, { status: "refuse" });
  revalidatePath("/admin/hebergement");
}

// ── Paiements (validation manuelle) ─────────────────────────────
export async function confirmPaymentAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const p = getPayment(id);
  confirmPayment(id);
  if (p) {
    const site = getSiteById(p.site_id);
    notify(p.user_id, `Paiement confirmé : votre site « ${site?.data.name ?? ""} » est en ligne !`, `/payer/${p.site_id}`);
  }
  revalidatePath("/admin/paiements");
}

export async function refusePaymentAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const p = getPayment(id);
  setPaymentStatus(id, "refuse", String(form.get("note") ?? "").slice(0, 500));
  if (p) notify(p.user_id, "Votre paiement n'a pas pu être vérifié : répondez-nous sur WhatsApp pour régulariser.", `/payer/${p.site_id}`);
  revalidatePath("/admin/paiements");
}

// ── Tarifs ────────────────────────────────────────────────────
// Chaque ligne : id tarifaire (essentiel / essentiel:<categorie> / premium)
export async function savePricingAction(form: FormData) {
  await requireAdmin();
  const ids = form.getAll("ids").map(String).filter((s) => /^[a-z:_-]+$/i.test(s) && s.length < 60);
  for (const id of ids) {
    const monthly = Math.round(Number(form.get(`m:${id}`)));
    const promoRaw = Math.round(Number(form.get(`p:${id}`)));
    const label = String(form.get(`l:${id}`) ?? "").trim().slice(0, 60) || null;
    if (!Number.isFinite(monthly) || monthly < 0) continue;
    const promo = Number.isFinite(promoRaw) && promoRaw > 0 ? promoRaw : null;
    // La promo doit être inférieure au prix normal — sinon ignorée
    setPlanPrice(id, monthly, promo && promo < monthly ? promo : null, label);
  }
  revalidatePath("/admin/tarifs");
}

// ── Sites clients : suspension (impayé, abus) & suppression ──────
// Suspendre = le site n'est plus servi mais reste en base (réversible).
export async function setSiteSuspendedAction(siteId: number, suspend: boolean) {
  await requireAdmin();
  const site = getSiteById(siteId);
  if (!site) return { error: "Site introuvable." };
  updateSite(siteId, { suspended: suspend });
  notify(
    site.user_id,
    suspend
      ? `Votre site « ${site.data.name} » a été suspendu : contactez-nous sur WhatsApp pour le réactiver.`
      : `Bonne nouvelle : votre site « ${site.data.name} » est de nouveau en ligne.`,
    "/dashboard",
  );
  revalidatePath("/admin/clients");
  return { ok: true };
}

// Récupération de compte : l'identité a été vérifiée par l'admin (WhatsApp) — on remet un mot de passe
// temporaire, on coupe toutes les sessions, et le client devra poser le sien à la prochaine connexion.
export async function resolvePasswordResetAction(resetId: number, decision: "reset" | "reject") {
  await requireAdmin();
  const req = getPasswordResets().find((r) => r.id === resetId && r.status === "en_attente");
  if (!req || !req.user_id) return { error: "Demande introuvable ou déjà traitée." };
  if (decision === "reject") {
    setPasswordResetStatus(resetId, "rejetee");
    revalidatePath("/admin/recuperation");
    return { ok: true as const };
  }
  const temp = crypto.randomBytes(4).toString("hex"); // ex. « a3f9c2e1 » — à transmettre via WhatsApp
  adminResetPassword(req.user_id, hashPassword(temp));
  setPasswordResetStatus(resetId, "traite");
  notify(req.user_id, "Votre mot de passe a été réinitialisé par notre équipe. Connectez-vous avec le mot de passe temporaire reçu, puis choisissez le vôtre.", "/compte");
  revalidatePath("/admin/recuperation");
  return { ok: true as const, temp, phone: req.contact.replace(/\D/g, "") };
}

// Vitrine : affiche le vrai site d'un client dans le carrousel ou les exemples de l'accueil
export async function setSiteFeaturedAction(siteId: number, slot: FeatureSlot, on: boolean) {
  await requireAdmin();
  if (slot !== "carousel" && slot !== "example") return { error: "Emplacement invalide." };
  const site = getSiteById(siteId);
  if (!site) return { error: "Site introuvable." };
  if (on && (!site.published || site.suspended)) return { error: "Seul un site en ligne peut être mis en avant." };
  setSiteFeatured(siteId, slot, on);
  revalidatePath("/");
  revalidatePath("/admin/clients");
  return { ok: true };
}

// Supprimer = efface le site et tout ce qui s'y rattache (leads, paiements, domaines — cascade SQL).
export async function deleteSiteAdminAction(siteId: number) {
  await requireAdmin();
  const site = getSiteById(siteId);
  if (!site) return { error: "Site introuvable." };
  notify(site.user_id, `Votre site « ${site.data.name} » a été supprimé par l'équipe Mbila.`, "/dashboard");
  deleteSite(siteId);
  revalidatePath("/admin/clients");
  return { ok: true };
}

// Confirmer l'email d'un client à la main — le client a prouvé son identité
// (ex. il a écrit sur WhatsApp depuis son numéro connu). Les jetons en attente
// deviennent inutiles puisque le compte est déjà actif.
export async function verifyUserEmailAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("user_id") ?? 0);
  const u = getUserById(id);
  if (!u || !u.email || u.email_verified) return;
  setEmailVerified(u.id);
  getDb().prepare("DELETE FROM email_tokens WHERE user_id = ?").run(u.id);
  notify(u.id, "✅ Votre adresse email a été confirmée par notre équipe, votre compte est actif !", "/dashboard");
  revalidatePath("/admin/clients");
}
