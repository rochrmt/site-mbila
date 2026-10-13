import TemplateBuilder from "@/components/admin/TemplateBuilder";
import { CATEGORIES } from "@/content/categories";
import { FONT_PAIRS, PALETTES } from "@/templates/palettes";

export const metadata = { title: "Nouveau modèle · Admin" };

export default function NewTemplate() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Nouveau modèle</h1>
      <p className="mt-2 text-white/50">Assemblez les formes : en-tête, sections, pied de page. Le modèle rejoindra les propositions de génération.</p>
      <div className="mt-8">
        <TemplateBuilder
          categories={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
          palettes={PALETTES.map((p) => ({ id: p.id, name: p.name, colors: [p.bg, p.primary, p.accent] }))}
          fonts={FONT_PAIRS.map((f) => ({ id: f.id, label: f.id }))}
        />
      </div>
    </div>
  );
}
