"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

export const CAT_LABELS: Record<string, string> = {
  restaurant: "Restaurant", bakery: "Boulangerie", cafe: "Café", salon: "Beauté", barber: "Barbier", spa: "Spa",
  fitness: "Fitness", sport: "Sport", education: "Éducation", shop: "Boutique", sales: "Vente", fashion: "Mode",
  jewelry: "Bijoux", agriculture: "Agriculture", legal: "Juridique", consulting: "Entreprise", tech: "Tech",
  medical: "Santé", realestate: "Immobilier", hotel: "Hôtel", construction: "BTP", auto: "Auto", transport: "Transport",
  cleaning: "Nettoyage", photography: "Photo", events: "Événements", music: "Musique", creative: "Créatif",
};

export async function uploadFiles(files: FileList | File[]) {
  const fd = new FormData();
  [...files].forEach((f) => fd.append("files", f));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error ?? "Échec de l'envoi");
  return j.urls as string[];
}

// Modal : choisir une image dans ses envois ou dans la banque d'images
export default function ImagePicker({
  stock, category, uploads, onUploaded, onPick, onClose,
}: {
  stock: Record<string, string[]>;
  category: string;
  uploads: string[];
  onUploaded: (urls: string[]) => void;
  onPick: (src: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(stock[category] ? category : "consulting");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const list = tab === "_mine" ? uploads : stock[tab] ?? [];

  async function up(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    try {
      const urls = await uploadFiles(files);
      onUploaded(urls);
      if (urls.length === 1) onPick(urls[0]);
      else setTab("_mine");
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur" onClick={onClose}>
      <div className="pop-in flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d15]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <p className="font-display text-lg font-semibold">Choisir une image</p>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 px-6 py-3">
          <button onClick={() => ref.current?.click()} className="brand-grad flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Envoyer mes photos
          </button>
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => up(e.target.files)} />
          {uploads.length > 0 && (
            <button onClick={() => setTab("_mine")} className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${tab === "_mine" ? "bg-white text-black" : "bg-white/5 text-white/60"}`}>Mes photos ({uploads.length})</button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-white/40">Banque d&apos;images :</label>
            <select
              value={stock[tab] ? tab : ""}
              onChange={(e) => e.target.value && setTab(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#12121c] px-3 py-1.5 text-sm text-white focus:border-fuchsia-400/60 focus:outline-none"
            >
              <option value="" disabled>Choisir un thème…</option>
              {Object.keys(stock).map((k) => (
                <option key={k} value={k}>{CAT_LABELS[k] ?? k} ({stock[k].length})</option>
              ))}
            </select>
          </div>
        </div>
        {err && <p className="px-6 pt-3 text-sm text-red-300">{err}</p>}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-6 sm:grid-cols-4">
          {list.map((src) => (
            <button key={src} onClick={() => onPick(src)} className="group relative aspect-[4/3] overflow-hidden rounded-xl ring-fuchsia-400 hover:ring-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
