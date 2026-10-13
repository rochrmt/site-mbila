import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DATA_DIR } from "./config";

// Répertoire des routeurs Traefik par domaine.
// En prod : volume monté sur /opt/traefik/dynamic/domains (file provider + watch).
// En dev : écrit dans DATA_DIR/traefik-domains (inoffensif).
const DYN_DIR = process.env.TRAEFIK_DOMAINS_DIR || path.join(DATA_DIR, "traefik-domains");

const routerName = (domain: string) => `client-${domain.replace(/[^a-z0-9]+/g, "-")}`;

// (Dés)active le routage Traefik pour un domaine client.
export function writeDomainRouter(domain: string, enable: boolean): string {
  const file = path.join(DYN_DIR, `${domain}.yml`);
  if (!enable) {
    rmSync(file, { force: true });
    return file;
  }
  mkdirSync(DYN_DIR, { recursive: true });
  // www.<domaine> n'a de sens que sur un domaine racine (client.com).
  // Pour un sous-domaine (site.mbila.pro), le SAN www ferait échouer le cert
  // HTTP-01 s'il ne résout pas — on ne le demande donc pas.
  const isApex = domain.split(".").length === 2;
  const rule = isApex ? `Host(\`${domain}\`) || Host(\`www.${domain}\`)` : `Host(\`${domain}\`)`;
  writeFileSync(
    file,
    `# Domaine client : ${domain} — généré par Mbila, ne pas modifier à la main.
http:
  routers:
    ${routerName(domain)}:
      rule: "${rule}"
      entrypoints: ["websecure"]
      service: mbila@docker
      tls:
        certResolver: letsencrypt
`,
    "utf-8",
  );
  return file;
}

// Crée l'enregistrement A via l'API Hostinger si le token est configuré.
// Sans token : renvoie un message indiquant que le DNS reste manuel.
export async function provisionDns(domain: string): Promise<string> {
  const token = process.env.HOSTINGER_API_TOKEN;
  const ip = process.env.VPS_PUBLIC_IP;
  if (!token || !ip) return "DNS à configurer manuellement (A → IP du VPS).";
  const res = await fetch(`https://developers.hostinger.com/api/dns/v1/zones/${domain}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      overwrite: false,
      zone: [
        { name: "@", type: "A", ttl: 14400, records: [{ content: ip }] },
        { name: "www", type: "CNAME", ttl: 14400, records: [{ content: domain }] },
      ],
    }),
  });
  if (!res.ok) return `API Hostinger : ${res.status} — vérifier le DNS manuellement.`;
  return "DNS créé automatiquement (A + www).";
}
