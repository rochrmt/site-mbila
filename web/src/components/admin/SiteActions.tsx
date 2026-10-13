"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, CircleCheck, GalleryHorizontal, LayoutGrid, Trash2 } from "lucide-react";
import { deleteSiteAdminAction, setSiteFeaturedAction, setSiteSuspendedAction } from "@/app/admin/actions";

type Props = { siteId: number; siteName: string; suspended: boolean; published: boolean; inCarousel: boolean; inExamples: boolean };

// Actions admin sur un site client : vitrine d'accueil, suspendre/réactiver (réversible) ou supprimer (définitif).
export default function SiteActions({ siteId, siteName, suspended, published, inCarousel, inExamples }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const pill = "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition disabled:opacity-40";
  const live = published && !suspended;
  const feature = (slot: "carousel" | "example", on: boolean) =>
    start(async () => {
      const r = await setSiteFeaturedAction(siteId, slot, on);
      if (r?.error) alert(r.error);
      router.refresh();
    });

  return (
    <span className="flex flex-wrap items-center gap-2">
      {(live || inCarousel) && (
        <button
          disabled={pending}
          title={inCarousel ? "Retirer du carrousel de la page d'accueil" : "Afficher ce site dans le carrousel en haut de la page d'accueil"}
          onClick={() => feature("carousel", !inCarousel)}
          className={`${pill} ${inCarousel ? "bg-violet-500/30 text-violet-100 ring-1 ring-violet-400/50" : "bg-violet-500/10 text-violet-300 hover:bg-violet-500/25"}`}
        >
          <GalleryHorizontal size={12} /> {inCarousel ? "Dans le carrousel ✓" : "Carrousel d'accueil"}
        </button>
      )}
      {(live || inExamples) && (
        <button
          disabled={pending}
          title={inExamples ? "Retirer de la section « Des sites uniques »" : "Afficher ce site dans la section « Des sites uniques, pour chaque métier »"}
          onClick={() => feature("example", !inExamples)}
          className={`${pill} ${inExamples ? "bg-cyan-500/30 text-cyan-100 ring-1 ring-cyan-400/50" : "bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/25"}`}
        >
          <LayoutGrid size={12} /> {inExamples ? "Dans les exemples ✓" : "Exemples d'accueil"}
        </button>
      )}
      <button
        disabled={pending}
        title={suspended ? "Remettre le site en ligne" : "Mettre le site hors ligne sans le supprimer (impayé, abus…)"}
        onClick={() => start(async () => { await setSiteSuspendedAction(siteId, !suspended); router.refresh(); })}
        className={`${pill} ${suspended ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"}`}
      >
        {suspended ? <CircleCheck size={12} /> : <Ban size={12} />}
        {suspended ? "Réactiver" : "Suspendre"}
      </button>
      <button
        disabled={pending}
        title="Supprimer définitivement le site"
        onClick={() => {
          if (window.confirm(`Supprimer définitivement « ${siteName} » ?\nLe site, ses messages et son historique seront effacés — action irréversible.`))
            start(async () => { await deleteSiteAdminAction(siteId); router.refresh(); });
        }}
        className={`${pill} bg-red-500/10 text-red-300 hover:bg-red-500/25`}
      >
        <Trash2 size={12} /> Supprimer
      </button>
    </span>
  );
}
