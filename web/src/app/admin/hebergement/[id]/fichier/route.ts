import fs from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/admin";
import { DATA_DIR } from "@/lib/config";
import { getHostingRequest } from "@/lib/db";

// Téléchargement du zip envoyé par un client (admin uniquement)
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const r = getHostingRequest(Number(id));
  if (!r?.file) return new Response("Fichier introuvable", { status: 404 });
  const buf = await fs.readFile(path.join(DATA_DIR, "uploads", "hosting", path.basename(r.file))).catch(() => null);
  if (!buf) return new Response("Fichier introuvable", { status: 404 });
  const name = (r.file_name || `projet-${r.id}.zip`).replace(/[^\w.-]+/g, "_");
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
