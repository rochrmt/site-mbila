import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { DATA_DIR } from "./config";
import { monthlyPrice } from "./pricing";
import type { SiteData } from "@/templates/types";

let db: DatabaseSync | undefined;

export function getDb() {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(path.join(DATA_DIR, "mbila.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT NOT NULL UNIQUE,
      template_id TEXT NOT NULL,
      palette_id TEXT,
      anim TEXT,
      proposals TEXT NOT NULL DEFAULT '[]',
      data TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      name TEXT, email TEXT, phone TEXT, message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS custom_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      categories TEXT NOT NULL DEFAULT '[]',
      moods TEXT NOT NULL DEFAULT '[]',
      anim TEXT NOT NULL DEFAULT 'subtle',
      palette TEXT NOT NULL DEFAULT 'snow',
      alt_palettes TEXT NOT NULL DEFAULT '[]',
      fonts TEXT NOT NULL DEFAULT 'geo',
      radius TEXT NOT NULL DEFAULT 'md',
      nav TEXT NOT NULL DEFAULT 'solid',
      footer TEXT NOT NULL DEFAULT 'simple',
      sections TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS stock_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      src TEXT NOT NULL,
      alt TEXT NOT NULL DEFAULT '',
      w INTEGER NOT NULL DEFAULT 1600,
      h INTEGER NOT NULL DEFAULT 1200,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS site_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      template_id TEXT NOT NULL,
      palette_id TEXT,
      anim TEXT,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  // Migration : brouillon de travail de l'éditeur (jamais publié)
  try { db.exec("ALTER TABLE sites ADD COLUMN draft TEXT"); } catch { /* déjà présente */ }
  // Demandes d'hébergement de projets existants (zip ou dépôt git)
  db.exec(`
    CREATE TABLE IF NOT EXISTS hosting_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      stack TEXT NOT NULL DEFAULT '',
      repo_url TEXT NOT NULL DEFAULT '',
      file TEXT,
      file_name TEXT,
      file_size INTEGER,
      domain TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'nouveau',
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  try { db.exec("ALTER TABLE hosting_requests ADD COLUMN site_id INTEGER"); } catch { /* déjà présente */ }
  try { db.exec("ALTER TABLE sites ADD COLUMN paid_until TEXT"); } catch { /* déjà présente */ }
  // Catégorie choisie au wizard — détermine le tarif Essentiel du site
  try { db.exec("ALTER TABLE sites ADD COLUMN category TEXT"); } catch { /* déjà présente */ }
  // Suspension admin (impayé, abus…) : le site reste en base mais n'est plus servi
  try { db.exec("ALTER TABLE sites ADD COLUMN suspended INTEGER NOT NULL DEFAULT 0"); } catch { /* déjà présente */ }
  // Mise en avant sur la page d'accueil (choisie par l'admin)
  try { db.exec("ALTER TABLE sites ADD COLUMN featured_carousel INTEGER NOT NULL DEFAULT 0"); } catch { /* déjà présente */ }
  try { db.exec("ALTER TABLE sites ADD COLUMN featured_example INTEGER NOT NULL DEFAULT 0"); } catch { /* déjà présente */ }
  // Coupe l'adresse slug.mbila.ca quand un domaine perso actif existe (admin)
  try { db.exec("ALTER TABLE sites ADD COLUMN subdomain_off INTEGER NOT NULL DEFAULT 0"); } catch { /* déjà présente */ }
  // Inscription par téléphone : colonne phone (+ email devient optionnel).
  // Doit tourner AVANT les ALTER users ci-dessous : la recréation de la table
  // supprimerait sinon must_change / email_verified sur une base fraîche.
  {
    const cols = (db.prepare("PRAGMA table_info(users)").all() as { name: string }[]).map((c) => c.name);
    if (!cols.includes("phone")) {
      db.exec(`
        CREATE TABLE users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          phone TEXT UNIQUE,
          password TEXT NOT NULL,
          profile TEXT NOT NULL DEFAULT 'particulier',
          must_change INTEGER NOT NULL DEFAULT 0,
          email_verified INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        INSERT INTO users_new (id, name, email, phone, password, profile, must_change, email_verified, created_at)
          SELECT id, name, email, NULL, password,
            ${cols.includes("profile") ? "profile" : "'particulier'"},
            ${cols.includes("must_change") ? "must_change" : "0"},
            ${cols.includes("email_verified") ? "email_verified" : "1"},
            created_at FROM users;
        DROP TABLE users;
        ALTER TABLE users_new RENAME TO users;
      `);
    }
  }
  // Réinitialisation par l'admin : impose un nouveau mot de passe à la prochaine connexion
  try { db.exec("ALTER TABLE users ADD COLUMN must_change INTEGER NOT NULL DEFAULT 0"); } catch { /* déjà présente */ }
  // Vérification d'email à l'inscription — les comptes existants sont réputés vérifiés (défaut 1)
  try { db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 1"); } catch { /* déjà présente */ }
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_tokens (
      token TEXT PRIMARY KEY,           -- sha256 du jeton envoyé par email
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
  `);
  // Demandes de récupération de compte (mot de passe oublié → alerte admin)
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      identifier TEXT NOT NULL,
      contact TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      ip TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'en_attente',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  // Réglages globaux admin (clé/valeur) — ex. paiement manuel on/off
  db.exec(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);
  // Tarifs personnalisables (admin) — remplacent la grille par défaut si présents
  db.exec(`CREATE TABLE IF NOT EXISTS pricing (
    id TEXT PRIMARY KEY,          -- 'essentiel' | 'essentiel:<categorie>' | 'premium'
    monthly INTEGER NOT NULL,
    promo INTEGER,                -- prix promo mensuel (remplace monthly s'il existe)
    promo_label TEXT              -- étiquette affichée au client, ex. « Promo lancement »
  )`);
  // Profil tarifaire : etudiant (5 500), particulier (6 500), entreprise (7 000)
  try { db.exec("ALTER TABLE users ADD COLUMN profile TEXT NOT NULL DEFAULT 'particulier'"); } catch { /* déjà présente */ }
  try { db.exec("ALTER TABLE payments ADD COLUMN payer TEXT NOT NULL DEFAULT ''"); } catch { /* déjà présente */ }
  try { db.exec("ALTER TABLE payments ADD COLUMN months INTEGER NOT NULL DEFAULT 1"); } catch { /* déjà présente */ }
  // Paiement en ligne (Chariow) : 'manuel' (capture Orange Money) | 'chariow'
  try { db.exec("ALTER TABLE payments ADD COLUMN method TEXT NOT NULL DEFAULT 'manuel'"); } catch { /* déjà présente */ }
  try { db.exec("ALTER TABLE payments ADD COLUMN external_ref TEXT NOT NULL DEFAULT ''"); } catch { /* déjà présente */ }
  // Déduplication des webhooks Chariow (Pulses) — une livraison = une seule fois
  db.exec(`
    CREATE TABLE IF NOT EXISTS pulse_events (
      delivery_id TEXT PRIMARY KEY,
      event TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  // Paiements manuels (capture Orange Money → confirmation admin)
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      plan TEXT NOT NULL,
      amount INTEGER NOT NULL,
      proof TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'en_attente',
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      href TEXT NOT NULL DEFAULT '',
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  // Domaines personnalisés : domaine propre pointant vers un site Mbila
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      domain TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'en_attente',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

export type Profile = "etudiant" | "particulier" | "entreprise";
export type User = { id: number; name: string; email: string | null; phone: string | null; profile: Profile; must_change?: boolean; email_verified?: number | boolean };

// ── Identifiants & sécurité du compte ────────────────────────────
// L'identifiant de connexion est l'email (le téléphone reste pour les anciens comptes)
export function updateUserEmail(id: number, email: string) {
  getDb().prepare("UPDATE users SET email = ?, email_verified = 0 WHERE id = ?").run(email, id);
}

export function setEmailVerified(id: number) {
  getDb().prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(id);
}

// Jetons de vérification : on stocke le sha256 — une fuite de la base ne donne pas les liens
export function createEmailToken(userId: number, tokenSha: string, ttlMs: number) {
  const db = getDb();
  db.prepare("DELETE FROM email_tokens WHERE user_id = ?").run(userId); // un seul jeton actif
  db.prepare("INSERT INTO email_tokens (token, user_id, expires_at) VALUES (?, ?, ?)").run(tokenSha, userId, Date.now() + ttlMs);
}

export function consumeEmailToken(tokenSha: string): number | null {
  const db = getDb();
  const row = db.prepare("SELECT user_id, expires_at FROM email_tokens WHERE token = ?").get(tokenSha) as { user_id: number; expires_at: number } | undefined;
  if (!row || row.expires_at < Date.now()) return null;
  db.prepare("DELETE FROM email_tokens WHERE user_id = ?").run(row.user_id); // usage unique
  return row.user_id;
}

export function updateUserPassword(id: number, hash: string) {
  getDb().prepare("UPDATE users SET password = ?, must_change = 0 WHERE id = ?").run(hash, id);
}

export function adminResetPassword(id: number, hash: string) {
  // must_change = 1 : l'utilisateur devra poser un nouveau mot de passe à sa prochaine connexion
  getDb().prepare("UPDATE users SET password = ?, must_change = 1 WHERE id = ?").run(hash, id);
  getDb().prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
}

export function getUserById(id: number) {
  return getDb().prepare("SELECT id, name, email, phone, profile, must_change, email_verified FROM users WHERE id = ?").get(id) as User | undefined;
}

export type PasswordReset = {
  id: number; user_id: number | null; identifier: string; contact: string; message: string;
  status: string; created_at: string;
  user_name: string | null; user_email: string | null; user_phone: string | null; site_slugs: string | null;
};

export function addPasswordReset(userId: number | null, identifier: string, contact: string, message: string, ip: string) {
  getDb()
    .prepare("INSERT INTO password_resets (user_id, identifier, contact, message, ip) VALUES (?, ?, ?, ?, ?)")
    .run(userId, identifier.slice(0, 120), contact.slice(0, 60), message.slice(0, 500), ip);
}

export function hasPendingReset(userId: number) {
  return !!getDb().prepare("SELECT 1 FROM password_resets WHERE user_id = ? AND status = 'en_attente'").get(userId);
}

export function getPasswordResets() {
  return getDb()
    .prepare(
      `SELECT r.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
              (SELECT group_concat(slug, ', ') FROM sites WHERE user_id = r.user_id) AS site_slugs
       FROM password_resets r LEFT JOIN users u ON u.id = r.user_id
       ORDER BY r.status = 'en_attente' DESC, r.id DESC LIMIT 100`,
    )
    .all() as PasswordReset[];
}

export function setPasswordResetStatus(id: number, status: "traite" | "rejetee") {
  getDb().prepare("UPDATE password_resets SET status = ? WHERE id = ?").run(status, id);
}

// Brouillon de l'éditeur : ce que l'utilisateur modifie avant d'enregistrer
export type DraftSnapshot = {
  data: SiteData;
  templateId: string;
  paletteId: string | null;
  anim: string | null;
};

export type SiteRow = {
  id: number;
  user_id: number;
  slug: string;
  template_id: string;
  palette_id: string | null;
  anim: string | null;
  proposals: string[];
  data: SiteData;
  draft?: DraftSnapshot | null;
  published: boolean;
  suspended: boolean;
  paid_until: string | null;
  category?: string | null;
  subdomain_off?: number;
  updated_at: string;
};

type RawSite = Omit<SiteRow, "data" | "proposals" | "published" | "draft" | "suspended"> & {
  data: string;
  proposals: string;
  published: number;
  suspended: number;
  draft: string | null;
};

const parseSite = (r: RawSite | undefined): SiteRow | undefined =>
  r && {
    ...r,
    data: JSON.parse(r.data),
    proposals: JSON.parse(r.proposals),
    published: !!r.published,
    suspended: !!r.suspended,
    draft: r.draft ? JSON.parse(r.draft) : null,
  };

export function getSiteBySlug(slug: string) {
  return parseSite(getDb().prepare("SELECT * FROM sites WHERE slug = ?").get(slug) as RawSite | undefined);
}

export function getSiteById(id: number) {
  return parseSite(getDb().prepare("SELECT * FROM sites WHERE id = ?").get(id) as RawSite | undefined);
}

export function getSitesByUser(userId: number) {
  return (getDb().prepare("SELECT * FROM sites WHERE user_id = ? ORDER BY id DESC").all(userId) as RawSite[]).map(
    (r) => parseSite(r)!,
  );
}

export function slugTaken(slug: string) {
  return !!getDb().prepare("SELECT 1 FROM sites WHERE slug = ?").get(slug);
}

export function createSite(s: {
  userId: number;
  slug: string;
  templateId: string;
  paletteId: string | null;
  anim: string;
  proposals: string[];
  data: SiteData;
  category?: string;
}) {
  const r = getDb()
    .prepare(
      "INSERT INTO sites (user_id, slug, template_id, palette_id, anim, proposals, data, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(s.userId, s.slug, s.templateId, s.paletteId, s.anim, JSON.stringify(s.proposals), JSON.stringify(s.data), s.category ?? null);
  return Number(r.lastInsertRowid);
}

export function updateSite(
  id: number,
  patch: Partial<{
    template_id: string; palette_id: string | null; anim: string | null; data: SiteData;
    draft: DraftSnapshot | null; published: boolean; suspended: boolean; slug: string; paid_until: string | null;
  }>,
) {
  const entries = Object.entries(patch).map(([k, v]) => [
    k,
    k === "data" || k === "draft" ? (v === null ? null : JSON.stringify(v)) : k === "published" || k === "suspended" ? (v ? 1 : 0) : v,
  ]);
  if (!entries.length) return;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  getDb()
    .prepare(`UPDATE sites SET ${sets}, updated_at = datetime('now') WHERE id = ?`)
    .run(...entries.map(([, v]) => v as string | number | null), id);
}

export function deleteSite(id: number) {
  getDb().prepare("DELETE FROM sites WHERE id = ?").run(id);
}

// ── Vitrine de la page d'accueil ─────────────────────────────────
export type FeatureSlot = "carousel" | "example";
const FEATURE_COL: Record<FeatureSlot, string> = { carousel: "featured_carousel", example: "featured_example" };

export function setSiteFeatured(id: number, slot: FeatureSlot, on: boolean) {
  getDb().prepare(`UPDATE sites SET ${FEATURE_COL[slot]} = ? WHERE id = ?`).run(on ? 1 : 0, id);
}

// Seuls les sites réellement en ligne apparaissent (un site suspendu/dépublié disparaît de l'accueil)
export function getFeaturedSites(slot: FeatureSlot) {
  return (getDb()
    .prepare(`SELECT id, slug, data, category FROM sites WHERE ${FEATURE_COL[slot]} = 1 AND published = 1 AND suspended = 0 ORDER BY id DESC LIMIT 12`)
    .all() as { id: number; slug: string; data: string; category: string | null }[])
    .map((r) => {
      let d: Partial<SiteData> = {};
      try { d = JSON.parse(r.data); } catch { /* données illisibles */ }
      return { id: r.id, slug: r.slug, name: d.name || r.slug, category: r.category ?? d.category ?? "other" };
    });
}

// ── Brouillon & versions ─────────────────────────────────────────
export function saveDraft(id: number, s: DraftSnapshot) {
  updateSite(id, { draft: s });
}

export function discardDraft(id: number) {
  updateSite(id, { draft: null });
}

export function historyCount(siteId: number) {
  return (getDb().prepare("SELECT COUNT(*) n FROM site_history WHERE site_id = ?").get(siteId) as { n: number }).n;
}

// Enregistrer : l'état en ligne part dans l'historique, le brouillon devient le site
export function commitDraft(id: number) {
  const site = getSiteById(id);
  if (!site?.draft) return false;
  const db = getDb();
  db.prepare("INSERT INTO site_history (site_id, template_id, palette_id, anim, data) VALUES (?, ?, ?, ?, ?)").run(
    id, site.template_id, site.palette_id, site.anim, JSON.stringify(site.data),
  );
  db.prepare("DELETE FROM site_history WHERE site_id = ? AND id NOT IN (SELECT id FROM site_history WHERE site_id = ? ORDER BY id DESC LIMIT 10)").run(id, id);
  const d = site.draft;
  updateSite(id, { template_id: d.templateId, palette_id: d.paletteId, anim: d.anim, data: d.data, draft: null });
  return true;
}

// Revenir en arrière : restaure la dernière version enregistrée
export function undoSite(id: number): DraftSnapshot | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM site_history WHERE site_id = ? ORDER BY id DESC LIMIT 1")
    .get(id) as { id: number; template_id: string; palette_id: string | null; anim: string | null; data: string } | undefined;
  if (!row) return null;
  const snap: DraftSnapshot = { templateId: row.template_id, paletteId: row.palette_id, anim: row.anim, data: JSON.parse(row.data) };
  db.prepare("DELETE FROM site_history WHERE id = ?").run(row.id);
  updateSite(id, { template_id: snap.templateId, palette_id: snap.paletteId, anim: snap.anim, data: snap.data, draft: null });
  return snap;
}

export type Lead = { id: number; site_id: number; name: string; email: string; phone: string; message: string; created_at: string };

export function addLead(siteId: number, l: { name: string; email: string; phone: string; message: string }) {
  getDb()
    .prepare("INSERT INTO leads (site_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)")
    .run(siteId, l.name, l.email, l.phone, l.message);
}

export function getLeads(siteId: number) {
  // node:sqlite renvoie des objets à prototype null → on recrée des objets
  // simples pour pouvoir les passer aux composants client (React interdit le reste)
  return (getDb().prepare("SELECT * FROM leads WHERE site_id = ? ORDER BY id DESC").all(siteId) as Lead[]).map(
    (l) => ({ ...l }),
  );
}

// ── Templates créés par l'admin ────────────────────────────────
import type { Section, Template } from "@/templates/types";

type RawTpl = { id: string; name: string; description: string; categories: string; moods: string; anim: string; palette: string; alt_palettes: string; fonts: string; radius: string; nav: string; footer: string; sections: string };

const parseTpl = (r: RawTpl): Template => ({
  id: r.id,
  name: r.name,
  description: r.description,
  categories: JSON.parse(r.categories),
  moods: JSON.parse(r.moods),
  anim: r.anim as Template["anim"],
  palette: r.palette,
  altPalettes: JSON.parse(r.alt_palettes),
  fonts: r.fonts,
  radius: r.radius as Template["radius"],
  nav: r.nav as Template["nav"],
  footer: r.footer as Template["footer"],
  sections: (JSON.parse(r.sections) as string[]).map((s) => s.split(":") as Section),
});

export function getCustomTemplates(): Template[] {
  return (getDb().prepare("SELECT * FROM custom_templates ORDER BY created_at DESC").all() as RawTpl[]).map(parseTpl);
}

export function getCustomTemplate(id: string) {
  const r = getDb().prepare("SELECT * FROM custom_templates WHERE id = ?").get(id) as RawTpl | undefined;
  return r ? parseTpl(r) : undefined;
}

export function saveCustomTemplate(t: Template) {
  getDb()
    .prepare(
      `INSERT INTO custom_templates (id, name, description, categories, moods, anim, palette, alt_palettes, fonts, radius, nav, footer, sections)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, description=excluded.description, categories=excluded.categories,
         moods=excluded.moods, anim=excluded.anim, palette=excluded.palette, alt_palettes=excluded.alt_palettes,
         fonts=excluded.fonts, radius=excluded.radius, nav=excluded.nav, footer=excluded.footer, sections=excluded.sections`,
    )
    .run(t.id, t.name, t.description, JSON.stringify(t.categories), JSON.stringify(t.moods), t.anim, t.palette, JSON.stringify(t.altPalettes), t.fonts, t.radius, t.nav, t.footer, JSON.stringify(t.sections.map(([k, v]) => `${k}:${v}`)));
}

export function deleteCustomTemplate(id: string) {
  getDb().prepare("DELETE FROM custom_templates WHERE id = ?").run(id);
}

// ── Images ajoutées par l'admin ────────────────────────────────
export type StockRow = { id: number; category: string; src: string; alt: string; w: number; h: number };

export function getStockImages(category?: string): StockRow[] {
  const rows = (
    category
      ? getDb().prepare("SELECT * FROM stock_images WHERE category = ? ORDER BY id DESC").all(category)
      : getDb().prepare("SELECT * FROM stock_images ORDER BY id DESC").all()
  ) as StockRow[];
  return rows.map((r) => ({ ...r }));
}

export function addStockImage(i: { category: string; src: string; alt?: string; w?: number; h?: number }) {
  getDb().prepare("INSERT INTO stock_images (category, src, alt, w, h) VALUES (?, ?, ?, ?, ?)").run(i.category, i.src, i.alt ?? "", i.w ?? 1600, i.h ?? 1200);
}

export function deleteStockImage(id: number) {
  getDb().prepare("DELETE FROM stock_images WHERE id = ?").run(id);
}

// Liste des clients avec leurs sites (vue administrateur)
export function getClients() {
  const rows = getDb()
    .prepare(
      `SELECT u.id AS user_id, u.name, u.email, u.phone, u.email_verified, u.created_at AS user_since,
              s.id AS site_id, s.slug, s.published, s.suspended, s.paid_until, s.featured_carousel, s.featured_example,
              s.template_id, s.data, s.created_at AS site_created,
              (SELECT COUNT(*) FROM leads l WHERE l.site_id = s.id) AS leads
       FROM users u
       LEFT JOIN sites s ON s.user_id = u.id
       ORDER BY u.id DESC, s.id DESC`,
    )
    .all() as {
    user_id: number; name: string; email: string | null; phone: string | null; email_verified: number | null; user_since: string;
    site_id: number | null; slug: string | null; published: number | null; suspended: number | null; paid_until: string | null;
    featured_carousel: number | null; featured_example: number | null;
    template_id: string | null; data: string | null; site_created: string | null; leads: number;
  }[];

  const clients = new Map<number, {
    id: number; name: string; email: string | null; phone: string | null; emailVerified: boolean; since: string;
    sites: {
      id: number; slug: string; name: string; published: boolean; suspended: boolean; paidUntil: string | null;
      inCarousel: boolean; inExamples: boolean; templateId: string; created: string; leads: number;
    }[];
  }>();

  for (const r of rows) {
    let c = clients.get(r.user_id);
    if (!c) {
      c = { id: r.user_id, name: r.name, email: r.email, phone: r.phone, emailVerified: !!r.email_verified, since: r.user_since, sites: [] };
      clients.set(r.user_id, c);
    }
    if (r.site_id) {
      let siteName = r.slug ?? "";
      try { siteName = (JSON.parse(r.data ?? "{}") as SiteData).name || siteName; } catch { /* données illisibles */ }
      c.sites.push({
        id: r.site_id, slug: r.slug!, name: siteName,
        published: !!r.published, suspended: !!r.suspended, paidUntil: r.paid_until,
        inCarousel: !!r.featured_carousel, inExamples: !!r.featured_example,
        templateId: r.template_id!,
        created: r.site_created!, leads: r.leads,
      });
    }
  }
  return [...clients.values()];
}

export function adminStats() {
  const db = getDb();
  const count = (q: string) => (db.prepare(q).get() as { n: number }).n;
  return {
    users: count("SELECT COUNT(*) n FROM users"),
    sites: count("SELECT COUNT(*) n FROM sites"),
    published: count("SELECT COUNT(*) n FROM sites WHERE published = 1"),
    leads: count("SELECT COUNT(*) n FROM leads"),
    customTemplates: count("SELECT COUNT(*) n FROM custom_templates"),
    stockImages: count("SELECT COUNT(*) n FROM stock_images"),
    hosting: count("SELECT COUNT(*) n FROM hosting_requests WHERE status = 'nouveau'"),
  };
}

// ── Hébergement de projets existants ─────────────────────────────
export const HOSTING_STATUS = {
  nouveau: "Nouvelle",
  en_cours: "En cours",
  en_ligne: "En ligne",
  refuse: "Refusée",
} as const;
export type HostingStatus = keyof typeof HOSTING_STATUS;

export type HostingRequest = {
  id: number;
  user_id: number | null;
  site_id: number | null;
  name: string;
  email: string;
  phone: string;
  stack: string;
  repo_url: string;
  file: string | null;
  file_name: string | null;
  file_size: number | null;
  domain: string;
  message: string;
  status: HostingStatus;
  note: string;
  created_at: string;
};

export function addHostingRequest(r: Omit<HostingRequest, "id" | "status" | "note" | "created_at">) {
  const res = getDb()
    .prepare(
      "INSERT INTO hosting_requests (user_id, site_id, name, email, phone, stack, repo_url, file, file_name, file_size, domain, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(r.user_id, r.site_id ?? null, r.name, r.email, r.phone, r.stack, r.repo_url, r.file, r.file_name, r.file_size, r.domain, r.message);
  return Number(res.lastInsertRowid);
}

export function getHostingRequests(): HostingRequest[] {
  return (getDb().prepare("SELECT * FROM hosting_requests ORDER BY id DESC").all() as HostingRequest[]).map((r) => ({ ...r }));
}

// Demandes d'un client (hébergement de projet, domaine perso) — suivi dashboard
export function getHostingRequestsByUser(userId: number): HostingRequest[] {
  return (getDb().prepare("SELECT * FROM hosting_requests WHERE user_id = ? ORDER BY id DESC").all(userId) as HostingRequest[]).map((r) => ({ ...r }));
}

export function getHostingRequest(id: number): HostingRequest | null {
  const r = getDb().prepare("SELECT * FROM hosting_requests WHERE id = ?").get(id) as HostingRequest | undefined;
  return r ? { ...r } : null;
}

export function updateHostingRequest(id: number, patch: { status?: HostingStatus; note?: string }) {
  const db = getDb();
  if (patch.status) db.prepare("UPDATE hosting_requests SET status = ? WHERE id = ?").run(patch.status, id);
  if (patch.note !== undefined) db.prepare("UPDATE hosting_requests SET note = ? WHERE id = ?").run(patch.note, id);
}

export function deleteHostingRequest(id: number) {
  getDb().prepare("DELETE FROM hosting_requests WHERE id = ?").run(id);
}

// ── Domaines personnalisés ──────────────────────────────────────
export type DomainStatus = "en_attente" | "actif" | "desactive" | "refuse";
export type CustomDomain = { id: number; site_id: number; domain: string; status: DomainStatus; created_at: string };

export function addCustomDomain(siteId: number, domain: string): CustomDomain | null {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM custom_domains WHERE domain = ?").get(domain) as CustomDomain | undefined;
  if (existing && existing.status !== "refuse" && existing.status !== "desactive") return null;
  if (existing) db.prepare("DELETE FROM custom_domains WHERE id = ?").run(existing.id);
  const r = db.prepare("INSERT INTO custom_domains (site_id, domain) VALUES (?, ?)").run(siteId, domain);
  return { id: Number(r.lastInsertRowid), site_id: siteId, domain, status: "en_attente", created_at: "" };
}

export function getDomainsBySite(siteId: number): CustomDomain[] {
  return (getDb().prepare("SELECT * FROM custom_domains WHERE site_id = ? ORDER BY id").all(siteId) as CustomDomain[]).map((r) => ({ ...r }));
}

export function getCustomDomain(domain: string): CustomDomain | null {
  const r = getDb().prepare("SELECT * FROM custom_domains WHERE domain = ?").get(domain) as CustomDomain | undefined;
  return r ? { ...r } : null;
}

export function setCustomDomainStatus(id: number, status: DomainStatus) {
  getDb().prepare("UPDATE custom_domains SET status = ? WHERE id = ?").run(status, id);
}

// Domaine perso actif d'un site (pour rediriger slug.mbila.ca → domaine)
export function activeDomainForSite(siteId: number): CustomDomain | null {
  const r = getDb().prepare("SELECT * FROM custom_domains WHERE site_id = ? AND status = 'actif' ORDER BY id DESC LIMIT 1").get(siteId) as CustomDomain | undefined;
  return r ? { ...r } : null;
}

// Coupe/rétablit l'adresse slug.mbila.ca d'un site (admin)
export function setSubdomainOff(siteId: number, off: boolean) {
  getDb().prepare("UPDATE sites SET subdomain_off = ? WHERE id = ?").run(off ? 1 : 0, siteId);
}

// ── Réglages globaux (clé/valeur) ───────────────────────────────
export function getSetting(key: string, fallback: string): string {
  const r = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return r?.value ?? fallback;
}
export function setSetting(key: string, value: string) {
  getDb().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
}

// Le transfert Orange Money manuel est-il visible pour les clients ? (défaut : oui)
export function manualPaymentEnabled() {
  return getSetting("manual_payment", "1") === "1";
}

// Site servi sous un domaine perso actif (accepte www.<domaine>)
export function siteForDomain(host: string): { site: NonNullable<ReturnType<typeof getSiteById>>; canonical: string } | null {
  const apex = host.startsWith("www.") ? host.slice(4) : host;
  const row = getDb().prepare(
    "SELECT site_id, domain FROM custom_domains WHERE domain = ? AND status = 'actif'",
  ).get(apex) as { site_id: number; domain: string } | undefined;
  if (!row) return null;
  const site = getSiteById(row.site_id);
  return site ? { site, canonical: row.domain } : null;
}

// ── Paiements (validation manuelle Orange Money) ────────────────
export type PaymentStatus = "en_attente" | "confirme" | "refuse";
export type Payment = {
  id: number; site_id: number; user_id: number | null; plan: string; months: number; amount: number;
  proof: string; payer: string; status: PaymentStatus; note: string; created_at: string;
  method: string; external_ref: string;
};

export function addPayment(p: { site_id: number; user_id: number | null; plan: string; months?: number; amount: number; proof?: string; payer?: string; method?: string; external_ref?: string }) {
  const r = getDb()
    .prepare("INSERT INTO payments (site_id, user_id, plan, months, amount, proof, payer, method, external_ref) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(p.site_id, p.user_id, p.plan, p.months ?? 1, p.amount, p.proof ?? "", p.payer ?? "", p.method ?? "manuel", p.external_ref ?? "");
  return Number(r.lastInsertRowid);
}

// Référence externe (ex. id de vente Chariow) stockée après l'initiation
export function setPaymentExternal(id: number, ref: string) {
  getDb().prepare("UPDATE payments SET external_ref = ? WHERE id = ?").run(ref, id);
}

// Déduplication webhooks : true si c'est la première fois qu'on voit cette livraison
export function recordPulseDelivery(deliveryId: string, event: string) {
  const r = getDb().prepare("INSERT OR IGNORE INTO pulse_events (delivery_id, event) VALUES (?, ?)").run(deliveryId, event);
  return r.changes > 0;
}

export function getPaymentsBySite(siteId: number): Payment[] {
  return (getDb().prepare("SELECT * FROM payments WHERE site_id = ? ORDER BY id DESC").all(siteId) as Payment[]).map((r) => ({ ...r }));
}

export function getPayments(): Payment[] {
  return (getDb().prepare("SELECT * FROM payments ORDER BY id DESC").all() as Payment[]).map((r) => ({ ...r }));
}

export function getPayment(id: number): Payment | null {
  const r = getDb().prepare("SELECT * FROM payments WHERE id = ?").get(id) as Payment | undefined;
  return r ? { ...r } : null;
}

export function setPaymentStatus(id: number, status: PaymentStatus, note?: string) {
  const db = getDb();
  db.prepare("UPDATE payments SET status = ? WHERE id = ?").run(status, id);
  if (note !== undefined) db.prepare("UPDATE payments SET note = ? WHERE id = ?").run(note, id);
}

// Abonnement actif ? (paid_until dans le futur)
export function siteIsPaid(site: { paid_until: string | null }) {
  return !!site.paid_until && site.paid_until > new Date().toISOString();
}

// Confirme un paiement : prolonge l'abonnement de la durée payée et publie le site
export function confirmPayment(id: number) {
  const p = getPayment(id);
  if (!p || p.status === "confirme") return;
  const site = getSiteById(p.site_id);
  setPaymentStatus(id, "confirme");
  if (!site) return;
  const base = site.paid_until && site.paid_until > new Date().toISOString() ? new Date(site.paid_until) : new Date();
  base.setMonth(base.getMonth() + Math.max(1, p.months));
  // Paiement confirmé : l'abonnement repart et la suspension (ex. impayé) est levée
  updateSite(site.id, { paid_until: base.toISOString(), published: true, suspended: false });
}

// Liste admin : paiements + site + client
export function getPaymentsDetailed() {
  return (getDb().prepare(`
    SELECT p.*, s.slug AS site_slug, u.email AS user_email, u.name AS user_name
    FROM payments p
    LEFT JOIN sites s ON s.id = p.site_id
    LEFT JOIN users u ON u.id = p.user_id
    ORDER BY p.id DESC
  `).all() as (Payment & { site_slug: string | null; user_email: string | null; user_name: string | null })[]).map((r) => ({ ...r }));
}

// ── Notifications client (in-app) ───────────────────────────────
export type Notification = {
  id: number; user_id: number; text: string; href: string; read: number; created_at: string;
};

export function notify(userId: number | null | undefined, text: string, href = "") {
  if (!userId) return;
  getDb().prepare("INSERT INTO notifications (user_id, text, href) VALUES (?, ?, ?)").run(userId, text.slice(0, 300), href.slice(0, 300));
}

export function getNotifications(userId: number): { list: Notification[]; unread: number } {
  const list = (getDb().prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 20").all(userId) as Notification[]).map((r) => ({ ...r }));
  return { list, unread: list.filter((n) => !n.read).length };
}

export function markNotificationsRead(userId: number) {
  getDb().prepare("UPDATE notifications SET read = 1 WHERE user_id = ?").run(userId);
}

// Notifie tous les comptes admin (déclarés via ADMIN_EMAILS)
export function notifyAdmins(text: string, href = "") {
  const emails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!emails.length) return;
  const rows = getDb()
    .prepare(`SELECT id FROM users WHERE lower(email) IN (${emails.map(() => "?").join(",")})`)
    .all(...emails) as { id: number }[];
  for (const r of rows) notify(r.id, text, href);
}

// ── Tarifs administrables ─────────────────────────────────────
// Surcharge des prix par défaut (pricing.ts) stockée en base.
export type PlanPrice = { monthly: number; original?: number; label?: string };
export type PricingRow = { id: string; monthly: number; promo: number | null; promo_label: string | null };

export function getAllPricing(): PricingRow[] {
  return getDb().prepare("SELECT * FROM pricing ORDER BY id").all() as PricingRow[];
}

export function setPlanPrice(id: string, monthly: number, promo: number | null, promoLabel: string | null) {
  getDb()
    .prepare(
      `INSERT INTO pricing (id, monthly, promo, promo_label) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET monthly = excluded.monthly, promo = excluded.promo, promo_label = excluded.promo_label`,
    )
    .run(id, monthly, promo, promoLabel);
}

// Prix effectif d'un plan pour une catégorie de site : override admin si présent
// (essentiel:<cat> puis essentiel en repli), sinon la grille par défaut.
export function sitePlanPrice(plan: string, category?: string | null): PlanPrice {
  const ids = plan === "premium" ? ["premium"] : category ? [`essentiel:${category}`, "essentiel"] : ["essentiel"];
  for (const id of ids) {
    const r = getDb().prepare("SELECT monthly, promo, promo_label FROM pricing WHERE id = ?").get(id) as PricingRow | undefined;
    if (r) {
      const monthly = r.promo && r.promo > 0 ? r.promo : r.monthly;
      return { monthly, original: r.promo && r.promo > 0 ? r.monthly : undefined, label: r.promo_label ?? undefined };
    }
  }
  return { monthly: monthlyPrice(plan, category) };
}
