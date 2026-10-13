import fs from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/admin";
import { DATA_DIR } from "@/lib/config";
import { getPayment } from "@/lib/db";

const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

// Sert la capture de paiement — réservée aux admins, jamais publique.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const p = getPayment(Number((await ctx.params).id));
  if (!p) return new Response("Introuvable", { status: 404 });
  const file = path.join(DATA_DIR, "uploads", "payments", path.basename(p.proof));
  const buf = await fs.readFile(file).catch(() => null);
  if (!buf) return new Response("Fichier absent", { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": MIME[path.extname(file).slice(1)] ?? "image/jpeg", "Cache-Control": "private, no-store" },
  });
}
