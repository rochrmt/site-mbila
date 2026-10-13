import { notFound } from "next/navigation";
import { categoryById } from "@/content/categories";
import { demoData } from "@/content/demo";
import { allTemplates } from "@/templates/all";
import SiteRenderer from "@/templates/render/SiteRenderer";
import type { AnimLevel } from "@/templates/types";

export const metadata = { robots: { index: false, follow: false } };

export default async function Demo({ params, searchParams }: PageProps<"/demo/[tpl]">) {
  const [{ tpl: id }, sp] = await Promise.all([params, searchParams]);
  const tpl = allTemplates().find((t) => t.id === id);
  if (!tpl) notFound();
  const cat = typeof sp.cat === "string" ? sp.cat : tpl.categories.find((c) => c !== "*") ?? "consulting";
  return (
    <SiteRenderer
      data={demoData(categoryById(cat).id === "other" ? "consulting" : cat)}
      tpl={tpl}
      paletteId={typeof sp.p === "string" ? sp.p : null}
      anim={typeof sp.a === "string" ? (sp.a as AnimLevel) : null}
    />
  );
}
