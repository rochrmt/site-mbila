import { notFound } from "next/navigation";
import TemplateBuilder from "@/components/admin/TemplateBuilder";
import { CATEGORIES } from "@/content/categories";
import { getCustomTemplate } from "@/lib/db";
import { FONT_PAIRS, PALETTES } from "@/templates/palettes";

export const metadata = { title: "Modifier le modèle · Admin" };

export default async function EditTemplate({ params }: PageProps<"/admin/templates/[id]">) {
  const { id } = await params;
  const t = getCustomTemplate(id);
  if (!t) notFound();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Modifier « {t.name} »</h1>
      <p className="mt-2 text-white/50">Ajustez les formes et le style. Les sites qui l&apos;utilisent adoptent le nouveau rendu.</p>
      <div className="mt-8">
        <TemplateBuilder
          categories={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
          palettes={PALETTES.map((p) => ({ id: p.id, name: p.name, colors: [p.bg, p.primary, p.accent] }))}
          fonts={FONT_PAIRS.map((f) => ({ id: f.id, label: f.id }))}
          initial={{
            id: t.id, name: t.name, description: t.description, categories: t.categories, moods: t.moods,
            anim: t.anim, palette: t.palette, altPalettes: t.altPalettes, fonts: t.fonts,
            radius: t.radius, nav: t.nav, footer: t.footer,
            sections: t.sections.map(([k, v]) => `${k}:${v}`),
          }}
        />
      </div>
    </div>
  );
}
