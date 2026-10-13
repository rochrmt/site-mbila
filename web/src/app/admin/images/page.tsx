import ImageManager from "@/components/admin/ImageManager";
import { CATEGORIES, STOCK_ALIAS } from "@/content/categories";
import { CAT_LABELS } from "@/components/editor/ImagePicker";
import { getStockImages } from "@/lib/db";
import stock from "@/lib/stock-manifest.json";

export const metadata = { title: "Images · Admin" };

export default function AdminImages() {
  // Regroupement par clé de recherche réelle (alias appliqué : portfolio → creative…)
  const keyOf = (cat: string) => STOCK_ALIAS[cat] ?? cat;
  const labelOf = (key: string) =>
    CAT_LABELS[key] ?? CATEGORIES.find((c) => keyOf(c.id) === key)?.label ?? key;

  const keys = new Set<string>();
  for (const c of CATEGORIES) keys.add(keyOf(c.id));
  for (const k of Object.keys(stock)) keys.add(k);
  for (const i of getStockImages()) keys.add(keyOf(i.category));

  const groups = [...keys].map((key) => ({
    key,
    label: labelOf(key),
    builtin: ((stock as Record<string, { src: string }[]>)[key] ?? []).map((x) => x.src),
    custom: getStockImages()
      .filter((i) => keyOf(i.category) === key)
      .map((i) => ({ id: i.id, src: i.src, alt: i.alt })),
  }));

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Banque d&apos;images</h1>
      <p className="mt-2 text-white/50">
        Ajoutez des photos par catégorie : elles seront utilisées automatiquement lors des générations et proposées dans l&apos;éditeur.
      </p>
      <div className="mt-8">
        <ImageManager groups={groups} />
      </div>
    </div>
  );
}
