import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { requireVerifiedUser } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { DATA_DIR } from "@/lib/config";
import { processLogo } from "@/lib/logo";

const MAX = 8 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

// Logo : import d'un fichier (multipart "file") ou nettoyage d'un logo déjà
// envoyé (JSON { src: "/u/<id>/<fichier>" }). Fond uni retiré automatiquement.
export async function POST(req: Request) {
  const user = await requireVerifiedUser();
  if (!user) return Response.json({ error: "Non connecté (email vérifié requis)" }, { status: 401 });
  if (!rateLimit(`logo:${clientIp(req)}`, 15, 60_000)) return Response.json({ error: "Trop d'envois. Réessayez dans une minute." }, { status: 429 });

  let input: Buffer;
  if (req.headers.get("content-type")?.includes("application/json")) {
    const { src } = (await req.json().catch(() => ({}))) as { src?: string };
    const m = src?.match(/^\/u\/(\d+)\/([a-f0-9]{16}\.webp)$/);
    if (!m || Number(m[1]) !== user.id) return Response.json({ error: "Image introuvable" }, { status: 400 });
    input = await fs.readFile(path.join(DATA_DIR, "uploads", m[1], m[2])).catch(() => Buffer.alloc(0));
    if (!input.length) return Response.json({ error: "Image introuvable" }, { status: 404 });
  } else {
    const f = (await req.formData()).get("file");
    if (!(f instanceof File) || !TYPES.has(f.type) || f.size > MAX)
      return Response.json({ error: "Formats acceptés : JPG, PNG, WebP (8 Mo max)" }, { status: 400 });
    input = Buffer.from(await f.arrayBuffer());
  }

  const { buffer, removed } = await processLogo(input);
  const dir = path.join(DATA_DIR, "uploads", String(user.id));
  await fs.mkdir(dir, { recursive: true });
  const name = `${crypto.randomBytes(8).toString("hex")}.webp`;
  await fs.writeFile(path.join(dir, name), buffer);
  return Response.json({ url: `/u/${user.id}/${name}`, removed });
}
