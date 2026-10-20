"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Lock, Trash2 } from "lucide-react";
import { removeStockImage, uploadStockImages } from "@/app/admin/actions";
import { compressImages } from "@/lib/compress";

type Group = { key: string; label: string; builtin: string[]; custom: { id: number; src: string; alt: string }[] };

export default function ImageManager({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [cat, setCat] = useState(groups[0]?.key ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);
  const cur = groups.find((g) => g.key === cat);

  async function up(files: FileList | null) {
    if (!files?.length || !cat) return;
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.set("category", cat);
    (await compressImages(files)).forEach((f) => fd.append("files", f));
    const r = await uploadStockImages(fd);
    if ("error" in r && r.error) setErr(r.error);
    else {
      if ("rejected" in r && r.rejected) setErr(`${r.rejected} fichier(s) ignoré(s) — JPG, PNG ou WebP requis.`);
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      {/* Catégories */}
      <aside className="flex flex-wrap gap-2 self-start lg:sticky lg:top-24 lg:flex-col">
        {groups.map((g) => (
          <button key={g.key} onClick={() => setCat(g.key)} className={`flex items-center justify-between gap-2 rounded-xl px-4 py-2 text-left text-sm transition ${cat === g.key ? "bg-white text-black" : "bg-white/[0.04] text-white/60 hover:bg-white/10"}`}>
            <span className="truncate">{g.label}</span>
            <span className={`text-xs ${cat === g.key ? "text-black/50" : "text-white/30"}`}>{g.custom.length + g.builtin.length}</span>
          </button>
        ))}
      </aside>

      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold">{cur?.label}</h2>
          <button onClick={() => ref.current?.click()} disabled={busy} className="brand-grad flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} Ajouter des images
          </button>
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => { up(e.target.files); e.target.value = ""; }} />
        </div>
        {err && <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{err}</p>}

        <h3 className="mt-6 text-xs font-semibold uppercase tracking-widest text-white/40">Vos images ({cur?.custom.length ?? 0})</h3>
        {cur && cur.custom.length === 0 ? (
          <button onClick={() => ref.current?.click()} className="mt-3 grid w-full place-items-center rounded-2xl border border-dashed border-white/15 py-12 text-sm text-white/40 hover:text-white">
            <ImagePlus className="mb-2" size={22} /> Déposez ou sélectionnez des images pour cette catégorie
          </button>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cur?.custom.map((i) => (
              <div key={i.id} className="group relative overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.src} alt={i.alt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                <button
                  disabled={pending}
                  onClick={() => { if (window.confirm("Retirer cette image ?")) start(async () => { await removeStockImage(i.id); router.refresh(); }); }}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-white/70 opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-red-500/80 hover:text-white"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <h3 className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40">
          <Lock size={12} /> Bibliothèque intégrée ({cur?.builtin.length ?? 0})
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {cur?.builtin.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="aspect-[4/3] w-full rounded-lg object-cover opacity-60" loading="lazy" />
          ))}
        </div>
      </div>
    </div>
  );
}
