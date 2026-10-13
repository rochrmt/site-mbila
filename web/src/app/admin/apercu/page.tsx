import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { demoData } from "@/content/demo";
import { categoryById } from "@/content/categories";
import SiteRenderer from "@/templates/render/SiteRenderer";
import type { Section, Template } from "@/templates/types";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

// Aperçu en direct d'un modèle en cours de construction dans l'admin.
export default async function AdminPreview({ searchParams }: PageProps<"/admin/apercu">) {
  await requireAdmin();
  const sp = await searchParams;
  let t: Template;
  try {
    const c = JSON.parse(String(sp.c)) as Record<string, unknown>;
    t = {
      id: "preview",
      name: String(c.name || "Aperçu"),
      description: "",
      categories: (c.categories as string[]) ?? [],
      moods: (c.moods as Template["moods"]) ?? [],
      anim: (c.anim as Template["anim"]) ?? "subtle",
      palette: String(c.palette || "snow"),
      altPalettes: [],
      fonts: String(c.fonts || "modern"),
      radius: (c.radius as Template["radius"]) ?? "md",
      nav: (c.nav as Template["nav"]) ?? "solid",
      footer: (c.footer as Template["footer"]) ?? "simple",
      sections: ((c.sections as string[]) ?? []).map((s) => s.split(":") as Section),
    };
  } catch {
    notFound();
  }
  const cat = typeof sp.cat === "string" ? sp.cat : "consulting";
  return <SiteRenderer data={demoData(categoryById(cat).id === "other" ? "consulting" : cat)} tpl={t} />;
}
