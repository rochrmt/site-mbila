export const ROOT_DOMAIN = process.env.ROOT_DOMAIN || "mbila.ca";
export const DATA_DIR = process.env.DATA_DIR || "./data";

// http en dev : localhost, IP brute, ou <ip>.nip.io (DNS qui résout une IP locale,
// pratique pour les démos tunnel/paiement depuis un autre appareil)
const isLocal = ROOT_DOMAIN.startsWith("localhost") || /\.nip\.io(:.*)?$/.test(ROOT_DOMAIN) || /^\d{1,3}(\.\d{1,3}){3}(:.*)?$/.test(ROOT_DOMAIN);
export const PROTOCOL = isLocal ? "http" : "https";

// Domaine MONTRÉ aux utilisateurs : toujours mbila.ca — en démo/dev (nip.io,
// localhost, IP) l'affichage ne doit jamais révéler l'hôte de test.
export const DISPLAY_DOMAIN = isLocal ? "mbila.ca" : ROOT_DOMAIN;

export const RESERVED_SLUGS = new Set([
  "www", "app", "api", "admin", "mail", "smtp", "imap", "pop", "ftp", "webmail",
  "support", "help", "blog", "docs", "status", "dashboard", "static", "cdn",
  "assets", "mbila", "test", "dev", "staging", "ns1", "ns2", "autodiscover", "cpanel",
  "s", "u", "demo", "preview",
]);

export const siteUrl = (slug: string) => `${PROTOCOL}://${slug}.${ROOT_DOMAIN}`;
export const appUrl = (path = "") => `${PROTOCOL}://${ROOT_DOMAIN}${path}`;

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}
