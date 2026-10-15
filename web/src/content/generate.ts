import stock from "@/lib/stock-manifest.json";
import { FONT_PAIRS, PALETTES, paletteById } from "@/templates/palettes";
import { FX_IDS, HERO_TEXT_IDS, type Fx, type HeroTextMode } from "@/templates/fx";
import { allTemplates } from "@/templates/all";
import type { AnimLevel, ColorPref, CtaType, Mood, SiteData, Template } from "@/templates/types";
import { getStockImages } from "@/lib/db";
import { FOLIO_STOCK, GALLERY_TITLES, GENERIC_FAQ, GENERIC_TESTIMONIALS, PORTFOLIO_FAQ, PORTFOLIO_SPECS, STEPS_TITLES, STOCK_ALIAS, WORKS_TITLES, categoryById, guessSpec, specById } from "./categories";

export type Currency = "FCFA" | "CAD" | "EUR" | "USD";

export type Answers = {
  category: string;
  profile?: string; // etudiant / particulier / entreprise — détermine le tarif
  name: string;
  city: string;
  description?: string;
  specialty?: string;
  specialtyText?: string;
  works?: string[];
  workImages?: Record<string, string>; // photo optionnelle par réalisation (portfolio)
  education?: { title: string; school: string; year: string }[]; // formation (portfolio, optionnel)
  // Activité non répertoriée (category "other")
  activity?: string;        // métier saisi (ex : Technicien de surface)
  otherServices?: string[]; // prestations proposées
  otherAbout?: string;      // présentation libre
  otherAuto?: boolean;      // « générer automatiquement » : contenus neutres, modifiables ensuite
  moods: Mood[];
  color: ColorPref;
  anim: AnimLevel;
  images: "stock" | "own";
  uploads?: string[];
  cta: CtaType;
  phone?: string;
  whatsapp?: string;
  email?: string;
  currency: Currency;
  fonts?: string; // "auto" ou id de paire de polices
  fx?: Fx[];
  heroText?: HeroTextMode | "none";
};

export type Proposal = { templateId: string; paletteId: string };

// ── Aléatoire déterministe : même nom → même "génération" ─────────
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function rng(seed: string) {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(arr: T[], r: () => number) => arr[Math.floor(r() * arr.length)];
function shuffle<T>(arr: T[], r: () => number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Choix de palette selon la préférence couleur ─────────────────
export function palettesFor(t: Template) {
  return [t.palette, ...t.altPalettes].map(paletteById);
}
function bestPalette(t: Template, pref: ColorPref) {
  const list = palettesFor(t);
  const fit =
    pref === "dark" ? list.find((p) => p.dark)
    : pref === "light" ? list.find((p) => !p.dark && !p.colorful)
    : pref === "colorful" ? list.find((p) => p.colorful)
    : list[0];
  return { palette: fit ?? list[0], fits: !!fit };
}

// ── Matching : les 3 meilleurs templates pour ces réponses ───────
export function matchTemplates(a: Answers, count = 3): Proposal[] {
  const r = rng(`${a.name}|${a.category}|${a.moods.join()}`);
  const scored = allTemplates().map((t) => {
    let s = 0;
    if (t.categories.includes(a.category)) s += 10 - t.categories.indexOf(a.category);
    else if (t.categories.includes("*")) s += 3;
    for (const m of a.moods) if (t.moods.includes(m)) s += 4;
    if (t.anim === a.anim) s += 3;
    else if (a.anim !== "none" && t.anim !== "none") s += 1;
    const { palette, fits } = bestPalette(t, a.color);
    if (fits) s += 2;
    if (a.images === "own" && t.sections.some(([k, v]) => k === "gallery" || v === "collage")) s += 1;
    // Beaucoup d'effets demandés → designs spectaculaires ; aucun → designs sobres
    const nfx = a.fx?.length ?? 0;
    if (nfx >= 4 && t.anim === "rich") s += 2;
    if (nfx === 0 && t.anim !== "rich") s += 1;
    s += r() * 2.5;
    return { t, s, palette };
  }).sort((x, y) => y.s - x.s);

  // Diversité : on évite 3 propositions au même hero
  const out: typeof scored = [];
  for (const c of scored) {
    if (out.length >= count) break;
    const hero = c.t.sections[0][1];
    if (out.some((o) => o.t.sections[0][1] === hero) && scored.indexOf(c) < scored.length - count) continue;
    out.push(c);
  }
  return out.map((o) => ({ templateId: o.t.id, paletteId: o.palette.id }));
}

// ── Prix ─────────────────────────────────────────────────────────
const RATES: Record<Currency, { k: number; round: number; fmt: (n: string) => string }> = {
  FCFA: { k: 655, round: 500, fmt: (n) => `${n} FCFA` },
  CAD: { k: 1.5, round: 1, fmt: (n) => `${n} $` },
  EUR: { k: 1, round: 1, fmt: (n) => `${n} €` },
  USD: { k: 1.1, round: 1, fmt: (n) => `${n} $` },
};
export function formatPrice(p: number | undefined, c: Currency) {
  if (p === undefined) return undefined;
  if (p === 0) return "Offert";
  const { k, round, fmt } = RATES[c];
  const v = Math.max(round, Math.round((p * k) / round) * round);
  return fmt(v.toLocaleString("fr-FR").replace(/\u202f/g, "\u00a0"));
}

// ── Images stock ─────────────────────────────────────────────────
type StockImg = { src: string; alt: string | null; w: number; h: number; q: string };
export function stockImages(category: string): StockImg[] {
  const key = STOCK_ALIAS[category] ?? category;
  const base = ((stock as Record<string, StockImg[]>)[key] ?? (stock as Record<string, StockImg[]>).consulting) as StockImg[];
  // Images ajoutées par l'admin en base de données (elles passent en premier)
  const extra = getStockImages(key).map((i) => ({ src: i.src, alt: i.alt || null, w: i.w, h: i.h, q: "admin" }));
  return [...extra, ...base];
}

export const CTA_LABELS: Record<CtaType, string> = {
  whatsapp: "Commander sur WhatsApp",
  call: "Appeler maintenant",
  email: "Nous écrire",
  booking: "Réserver un créneau",
  quote: "Demander un devis",
};

const SELLERS = new Set(["shop", "sales", "bakery", "fashion", "jewelry", "agriculture", "restaurant", "cafe"]);
export const ctaLabel = (t: CtaType, cat: string) =>
  t === "whatsapp" && !SELLERS.has(cat) ? "Écrire sur WhatsApp" : CTA_LABELS[t];

const fill = (s: string, a: Answers) =>
  s.replaceAll("{name}", a.name.trim()).replaceAll("{city}", a.city.trim() || "votre ville");

// Réalisations génériques pour les photographes (pas d'étape "réalisations" au wizard)
const PHOTO_WORKS = [
  { name: "Mariage · reportage complet", tag: "Reportage" },
  { name: "Portraits studio", tag: "Studio" },
  { name: "Packshot produits", tag: "Produit" },
  { name: "Couverture d'événement", tag: "Événement" },
  { name: "Shooting mode", tag: "Éditorial" },
  { name: "Séance famille", tag: "Lifestyle" },
];

// Descriptions neutres pour les prestations saisies (activité « autre »)
const OTHER_SVC_DESC = [
  "Une prestation réalisée avec soin, dans les délais convenus.",
  "Un travail sérieux, adapté à votre besoin.",
  "Qualité, rapidité et prix juste.",
  "Un service fiable, sur lequel vous pouvez compter.",
  "Réalisé par une équipe expérimentée et à l'écoute.",
  "Sur demande, selon vos contraintes.",
];
const clip = (s: unknown, n: number) => String(s ?? "").trim().slice(0, n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ── Génération du contenu complet du site ────────────────────────
export function generateSiteData(a: Answers): SiteData {
  const c = categoryById(a.category);
  // Activité non répertoriée : le métier et les services saisis remplacent les contenus neutres
  const isOther = c.id === "other";
  const activity = isOther ? cap(clip(a.activity, 60)) : "";
  const otherSvcs = isOther && !a.otherAuto
    ? (Array.isArray(a.otherServices) ? a.otherServices : []).map((s) => clip(s, 60)).filter(Boolean).slice(0, 6)
    : [];
  const otherAbout = isOther && !a.otherAuto ? clip(a.otherAbout, 600) : "";
  // Le seed mélange nom + réponses : deux projets du même métier avec des
  // ambitions différentes n'obtiennent pas les mêmes textes ni les mêmes images.
  const r = rng(`${a.name}|${a.category}|${a.moods.join()}|${a.color}|${a.anim}`);
  const f = (s: string) => fill(s, a);

  // Portfolio : les images suivent le DOMAINE d'expertise (informaticien → outils
  // informatiques, comptable → calculatrices/documents…) et non la catégorie générique
  const folioSpecId =
    a.category === "portfolio"
      ? a.specialty === "custom"
        ? guessSpec(a.specialtyText ?? "")
        : specById(a.specialty ?? "")?.id ?? pick(PORTFOLIO_SPECS, r).id
      : undefined;
  const folioStock = folioSpecId ? stockImages(FOLIO_STOCK(folioSpecId)) : [];
  const stockList = folioStock.length ? folioStock : stockImages(a.category);
  // Image d'accueil : n'importe quelle photo paysage du métier, tirée selon le seed
  // (avant : seulement le premier groupe → une image admin en tête était toujours choisie)
  const wide = stockList.filter((i) => i.w >= i.h * 1.2);
  const heroStock = pick(wide.length ? wide : stockList, r);
  const rest = shuffle(stockList.filter((i) => i !== heroStock), r).map((i) => i.src);
  const own = a.uploads ?? [];
  const pool = own.length ? [...own, ...rest] : rest;

  // ── Portfolio : contenu piloté par la spécialité choisie ──────
  const isPortfolio = a.category === "portfolio";
  const hero = own[0] ?? heroStock.src;
  // Portfolio : la photo du client est la pièce maîtresse (hero + à propos)
  const portrait = isPortfolio ? (own[0] ?? hero) : undefined;
  // Domaine saisi librement : on reprend les services/réalisations du domaine
  // détecté (le métier affiché reste le texte saisi par la personne)
  const resolvedSpec = isPortfolio ? specById(folioSpecId ?? "") : undefined;
  const role = isPortfolio
    ? (a.specialty === "custom" ? a.specialtyText?.trim() : resolvedSpec?.role) || "Créatif freelance"
    : undefined;
  const svcSrc = resolvedSpec?.services ?? c.services;
  const kwSrc = resolvedSpec?.keywords ?? c.keywords;

  const svcList = otherSvcs.length
    ? otherSvcs.map((name, i) => ({ name, description: OTHER_SVC_DESC[i % OTHER_SVC_DESC.length] }))
    : shuffle(svcSrc, r);
  const services = svcList.map((s: { name: string; description: string; p?: number }, i) => ({
    name: s.name,
    description: s.description,
    // Un portfolio présente un savoir-faire, pas des produits : pas de prix affiché
    price: isPortfolio ? "" : formatPrice(s.p, a.currency),
    image: pool[(i + 1) % pool.length],
  }));

  // Réalisations : saisies par l'utilisateur, sinon générées pour son domaine
  const genericWorks = (tag: string) =>
    ["Projet signature", "Collaboration long terme", "Commande sur mesure", "Étude de cas client", "Création récente", "Projet expérimental"].map((name) => ({ name, tag }));
  const workBank =
    a.works?.length
      ? a.works.slice(0, 6).map((name) => ({ name, tag: resolvedSpec?.label ?? role ?? "Projet" }))
      : resolvedSpec?.works
      ?? (isPortfolio ? genericWorks(role ?? "Projet") : a.category === "photography" ? PHOTO_WORKS : []);
  const baseYear = 2023 + Math.floor(r() * 2);
  const works = workBank.length
    ? { title: pick(WORKS_TITLES, r), items: workBank.slice(0, 6).map((w, i) => ({ ...w, year: String(baseYear + (i % 3)), image: a.workImages?.[w.name] ?? pool[(i + 2) % pool.length] })) }
    : undefined;

  const where = a.city.trim() ? ` à ${a.city.trim()}` : "";
  return {
    name: a.name.trim(),
    tagline: a.description?.trim() || activity || f(pick(c.subtitles, r)).split(".")[0],
    category: c.id,
    city: a.city.trim(),
    hero: {
      title: role ?? (activity ? `${activity}${where}` : f(pick(c.heroTitles, r))),
      subtitle: a.description?.trim() || (activity
        ? pick([`${a.name.trim()} : un service sérieux, rapide et soigné.`, "Un travail de qualité, des prix justes et une vraie écoute.", "Contactez-nous sur WhatsApp, réponse rapide."], r)
        : f(pick(c.subtitles, r))),
      image: hero,
      images: [hero, ...pool.filter((x) => x !== hero).slice(0, 3)],
    },
    about: {
      title: pick(c.aboutTitles, r),
      text: otherAbout || f(pick(c.aboutTexts, r)),
      image: portrait ?? (pool[0] === hero ? pool[1] : pool[0]),
      stats: shuffle(c.stats, r),
    },
    services: { title: c.servicesTitle, subtitle: c.servicesSubtitle, items: services },
    works,
    steps: { title: pick(STEPS_TITLES, r), items: c.steps },
    gallery: { title: pick(GALLERY_TITLES, r), images: pool.slice(0, 8) },
    // Portfolio : pas de faux témoignages — la formation réelle les remplace
    testimonials: isPortfolio ? [] : shuffle([...c.testimonials, ...GENERIC_TESTIMONIALS], r).slice(0, 3),
    education: isPortfolio
      ? (Array.isArray(a.education) ? a.education : [])
          .map((e) => ({ title: String(e?.title ?? "").trim().slice(0, 120), school: String(e?.school ?? "").trim().slice(0, 120), year: String(e?.year ?? "").trim().slice(0, 20) }))
          .filter((e) => e.title)
          .slice(0, 8)
      : undefined,
    faq: shuffle(isPortfolio ? PORTFOLIO_FAQ : [...c.faq, ...GENERIC_FAQ], r).slice(0, 4),
    keywords: activity || otherSvcs.length ? [...(activity ? [activity] : []), ...otherSvcs, ...kwSrc].slice(0, 6) : shuffle(kwSrc, r),
    cta: { type: a.cta, label: ctaLabel(a.cta, c.id) },
    contact: {
      phone: a.phone?.trim() ?? "",
      whatsapp: (a.whatsapp || a.phone || "").trim(),
      email: a.email?.trim() ?? "",
      address: a.city.trim(),
      hours: c.hours,
    },
    socials: { facebook: "", instagram: "", tiktok: "", linkedin: "" },
    style: {
      fonts: a.fonts && a.fonts !== "auto" && FONT_PAIRS.some((f) => f.id === a.fonts) ? a.fonts : undefined,
      fx: (a.fx ?? []).filter((x) => FX_IDS.has(x)),
      heroText: a.heroText && HERO_TEXT_IDS.has(a.heroText)
        ? { mode: a.heroText as HeroTextMode, words: (otherSvcs.length ? otherSvcs : shuffle(kwSrc, r)).slice(0, 5) }
        : undefined,
    },
  };
}

export const allPaletteIds = PALETTES.map((p) => p.id);
