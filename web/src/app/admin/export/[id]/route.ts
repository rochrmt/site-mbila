import { requireAdmin } from "@/lib/admin";
import { getSiteById } from "@/lib/db";
import { exportSite } from "@/lib/exportSite";

// GET /admin/export/<siteId> → ZIP du site complet (HTML/CSS/JS/images/données)
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const site = getSiteById(Number(id));
  if (!site) return new Response("Site introuvable", { status: 404 });
  const zip = await exportSite(site, req.headers.get("cookie"));
  return new Response(zip as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${site.slug}-site.zip"`,
    },
  });
}
