import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { categoryById } from "@/content/categories";
import { deleteTemplateAction } from "@/app/admin/actions";
import { getCustomTemplates } from "@/lib/db";
import { paletteById } from "@/templates/palettes";
import { TEMPLATES } from "@/templates/library";
import { DeleteBtn } from "@/components/admin/Buttons";

export const metadata = { title: "Modèles · Admin" };

export default async function AdminTemplates() {
  const custom = getCustomTemplates();
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Modèles</h1>
          <p className="mt-2 text-white/50">Les modèles alimentent les propositions de génération. Vos créations se mélangent aux modèles intégrés.</p>
        </div>
        <Link href="/admin/templates/nouveau" className="brand-grad flex items-center gap-2 rounded-xl px-5 py-3 font-semibold">
          <Plus size={18} /> Nouveau modèle
        </Link>
      </div>

      {/* Créés par l'admin */}
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest text-white/40">Vos créations ({custom.length})</h2>
      {custom.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/40">
          Aucun modèle personnalisé pour l&apos;instant. Cliquez sur « Nouveau modèle » pour assembler vos formes.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {custom.map((t) => {
            const pal = paletteById(t.palette);
            return (
              <div key={t.id} className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold" style={{ background: pal.primary, color: pal.primaryFg }}>
                  {t.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{t.name}</p>
                  <p className="truncate text-sm text-white/45">{t.description}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {t.categories.map((c) => (
                      <span key={c} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/50">{c === "*" ? "Universel" : categoryById(c).label}</span>
                    ))}
                  </div>
                </div>
                <span className="hidden text-xs text-white/30 lg:block">{t.sections.length} sections</span>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/demo/${t.id}`} target="_blank" className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-white/60 hover:text-white" title="Aperçu"><ExternalLink size={15} /></Link>
                  <Link href={`/admin/templates/${t.id}`} className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-white/60 hover:text-white" title="Modifier"><Pencil size={15} /></Link>
                  <DeleteBtn id={t.id} action={deleteTemplateAction} confirm={`Supprimer le modèle « ${t.name} » ?`} icon={<Trash2 size={15} />} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bibliothèque intégrée */}
      <h2 className="mt-12 text-sm font-semibold uppercase tracking-widest text-white/40">Bibliothèque intégrée ({TEMPLATES.length})</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/thumbs/${t.id}.jpg`} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover object-top" />
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{t.name}</p>
                <p className="truncate text-xs text-white/40">{t.description}</p>
              </div>
              <Link href={`/demo/${t.id}`} target="_blank" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-white/60 opacity-0 transition group-hover:opacity-100 hover:text-white" title="Aperçu">
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
