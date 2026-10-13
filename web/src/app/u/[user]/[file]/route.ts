import fs from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "@/lib/config";

export async function GET(_req: Request, ctx: RouteContext<"/u/[user]/[file]">) {
  const { user, file } = await ctx.params;
  if (!/^\d+$/.test(user) || !/^[a-f0-9]{16}\.webp$/.test(file)) return new Response(null, { status: 404 });
  const buf = await fs.readFile(path.join(DATA_DIR, "uploads", user, file)).catch(() => null);
  if (!buf) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
