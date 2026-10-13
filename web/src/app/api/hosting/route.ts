import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { requireVerifiedUser } from "@/lib/auth";
import { DATA_DIR } from "@/lib/config";
import { addHostingRequest, notifyAdmins } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { PHONE_OK } from "@/lib/validation";
import { notifyAdmin } from "@/lib/mail";

const MAX = 100 * 1024 * 1024;
const REPO_RE = /^https:\/\/(github\.com|gitlab\.com|bitbucket\.org|codeberg\.org)\/[\w.-]+\/[\w.-]+(?:\.git)?\/?$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (f: FormData, k: string, max = 300) => String(f.get(k) ?? "").trim().slice(0, max);

// Demande d'hébergement d'un projet existant : zip (≤ 100 Mo) et/ou dépôt Git.
// Le zip est stocké dans DATA_DIR/uploads/hosting/, jamais servi publiquement.
export async function POST(req: Request) {
  const user = await requireVerifiedUser();
  // Compte requis ET email confirmé : le formulaire public renvoie vers
  // l'inscription, l'écran d'attente gère les comptes non vérifiés.
  if (!user) return Response.json({ error: "Créez votre compte Mbila ou confirmez votre email pour continuer." }, { status: 401 });
  if (!rateLimit(`hosting:${clientIp(req)}`, 5, 60_000)) return Response.json({ error: "Trop d'envois. Réessayez dans une minute." }, { status: 429 });

  const form = await req.formData().catch(() => null);
  if (!form) return Response.json({ error: "Requête invalide" }, { status: 400 });
  // Pot de miel anti-robots
  if (str(form, "website")) return Response.json({ ok: true });

  const name = str(form, "name", 80);
  const email = str(form, "email", 120).toLowerCase();
  const repo = str(form, "repo", 300);
  const file = form.get("file");
  const zip = file instanceof File && file.size > 0 ? file : null;

  const profile = str(form, "profile", 60);
  const idea = str(form, "idea", 1000);
  const delay = str(form, "delay", 80);

  if (name.length < 2) return Response.json({ error: "Indiquez votre nom." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return Response.json({ error: "Email invalide." }, { status: 400 });
  if (!zip && !repo && !idea) return Response.json({ error: "Envoyez un fichier .zip, le lien de votre dépôt, ou décrivez votre idée." }, { status: 400 });
  if (repo && !REPO_RE.test(repo))
    return Response.json({ error: "Lien de dépôt invalide (GitHub, GitLab, Bitbucket ou Codeberg)." }, { status: 400 });
  if (zip && zip.size > MAX) return Response.json({ error: "Le fichier dépasse 100 Mo." }, { status: 400 });

  let stored: string | null = null;
  if (zip) {
    const buf = Buffer.from(await zip.arrayBuffer());
    // Vraie archive : signature ZIP ("PK\x03\x04" ou "PK\x05\x06" pour les archives
    // vides) en tête + marqueur fin de catalogue présent dans les derniers octets.
    const sig = buf.readUInt32LE(0);
    const hasEOCD = buf.subarray(Math.max(0, buf.length - 65557)).includes(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (buf.length < 22 || (sig !== 0x04034b50 && sig !== 0x06054b50) || !hasEOCD)
      return Response.json({ error: "Le fichier doit être une archive .zip valide." }, { status: 400 });
    const dir = path.join(DATA_DIR, "uploads", "hosting");
    await fs.mkdir(dir, { recursive: true });
    stored = `${crypto.randomBytes(12).toString("hex")}.zip`;
    await fs.writeFile(path.join(dir, stored), buf);
  }

  const phone = str(form, "phone", 40);
  if (phone && !PHONE_OK(phone)) return Response.json({ error: "Numéro de téléphone invalide (7 à 15 chiffres)." }, { status: 400 });
  const id = addHostingRequest({
    user_id: user.id,
    site_id: null,
    name,
    email,
    phone,
    stack: str(form, "stack", 60),
    repo_url: repo,
    file: stored,
    file_name: zip ? zip.name.slice(0, 120) : null,
    file_size: zip ? zip.size : null,
    domain: str(form, "domain", 120).toLowerCase(),
    message: [
      profile && `Profil : ${profile}`,
      idea && `Idée : ${idea}`,
      delay && `Délai souhaité : ${delay}`,
      str(form, "message", 2000) && `Précisions : ${str(form, "message", 2000)}`,
    ].filter(Boolean).join("\n"),
  });
  notifyAdmins(`📦 Demande d'hébergement : ${name}${repo ? " (dépôt Git)" : zip ? " (fichier zip)" : " (idée)"}`, "/admin/hebergement");
  await notifyAdmin(
    `📦 Demande d'hébergement : ${name}`,
    `<h2>Nouvelle demande « Votre projet »</h2>
     <p><b>${name}</b> · ${email}${phone ? ` · ${phone}` : ""}</p>
     ${profile ? `<p>Profil : ${profile}</p>` : ""}
     ${idea ? `<p>Idée : ${idea}</p>` : ""}
     ${delay ? `<p>Délai : ${delay}</p>` : ""}
     <p>${zip ? `Zip : ${zip.name} (${Math.ceil(zip.size / 1024)} Ko)` : ""}${repo ? `Dépôt : ${repo}` : ""}${!zip && !repo ? "Pas encore de code, juste l'idée" : ""}</p>
     <p><a href="https://mbila.ca/admin/hebergement">→ Voir dans l'admin</a></p>`,
  );
  return Response.json({ ok: true, id });
}
