import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { requireVerifiedUser } from "@/lib/auth";
import { DATA_DIR } from "@/lib/config";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const MAX = 8 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const PER_REQUEST = 24; // fichiers par envoi (compressés côté client → ~300 Ko chacun)
const PARALLEL = 4; // conversions sharp simultanées (RAM raisonnable)

// Upload d'images utilisateur : redimensionnées + converties en WebP,
// stockées dans DATA_DIR/uploads/<userId>/, servies via /u/<userId>/<fichier>.
export async function POST(req: Request) {
  const user = await requireVerifiedUser();
  if (!user) return Response.json({ error: "Non connecté (email vérifié requis)" }, { status: 401 });
  if (!rateLimit(`upload:${clientIp(req)}`, 20, 60_000)) return Response.json({ error: "Trop d'envois. Réessayez dans une minute." }, { status: 429 });

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return Response.json({ error: "Aucun fichier" }, { status: 400 });

  const dir = path.join(DATA_DIR, "uploads", String(user.id));
  await fs.mkdir(dir, { recursive: true });

  const urls: string[] = [];
  const rejected: string[] = [];
  const batch = files.slice(0, PER_REQUEST);
  // Traitement par lots parallèles : ~4× plus rapide qu'en séquentiel
  // sharp valide le VRAI contenu (pas le type déclaré) : tout fichier qui
  // n'est pas une image décodable est rejeté nommément, sans casser le lot.
  for (let i = 0; i < batch.length; i += PARALLEL) {
    await Promise.all(
      batch.slice(i, i + PARALLEL).map(async (f) => {
        if (!TYPES.has(f.type) || f.size > MAX) return rejected.push(f.name || "fichier");
        const name = `${crypto.randomBytes(8).toString("hex")}.webp`;
        try {
          await sharp(Buffer.from(await f.arrayBuffer()))
            .rotate()
            .resize({ width: 1800, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(path.join(dir, name));
          urls.push(`/u/${user.id}/${name}`);
        } catch {
          rejected.push(f.name || "fichier");
        }
      }),
    );
  }
  if (!urls.length) return Response.json({ error: "Formats acceptés : JPG, PNG, WebP (8 Mo max)", rejected }, { status: 400 });
  return Response.json({ urls, rejected });
}
