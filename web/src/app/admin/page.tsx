import Link from "next/link";
import { ImageIcon, LayoutTemplate, Plus, Upload } from "lucide-react";
import { adminStats } from "@/lib/db";
import { TEMPLATES } from "@/templates/library";

export default async function AdminHome() {
  const s = adminStats();
  const cards = [
    { label: "Modèles intégrés", value: TEMPLATES.length, sub: "Bibliothèque système" },
    { label: "Modèles créés", value: s.customTemplates, sub: "Par l'administration" },
    { label: "Images ajoutées", value: s.stockImages, sub: "Banque personnalisée" },
    { label: "Utilisateurs", value: s.users, sub: `${s.sites} sites dont ${s.published} en ligne` },
    { label: "Messages reçus", value: s.leads, sub: "Leads des sites clients" },
    { label: "Hébergement", value: s.hosting, sub: "Nouvelles demandes de mise en ligne" },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Vue d&apos;ensemble</h1>
      <p className="mt-2 text-white/50">Gérez la bibliothèque interne : modèles, formes et images utilisés par le moteur de génération.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-sm text-white/50">{c.label}</p>
            <p className="mt-2 font-display text-4xl font-bold">{c.value}</p>
            <p className="mt-1 text-xs text-white/35">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/templates/nouveau" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-fuchsia-400/40">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300"><LayoutTemplate size={22} /></span>
            <div>
              <p className="font-semibold">Créer un modèle</p>
              <p className="text-sm text-white/45">Assemblez des formes : en-têtes, sections, pieds de page…</p>
            </div>
          </div>
          <Plus size={20} className="text-white/30 transition group-hover:text-fuchsia-300" />
        </Link>
        <Link href="/admin/images" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-fuchsia-400/40">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300"><ImageIcon size={22} /></span>
            <div>
              <p className="font-semibold">Ajouter des images</p>
              <p className="text-sm text-white/45">Enrichissez la banque d&apos;images par catégorie.</p>
            </div>
          </div>
          <Upload size={20} className="text-white/30 transition group-hover:text-emerald-300" />
        </Link>
      </div>
    </div>
  );
}
