"use client";
import { useState, useTransition } from "react";
import { Check, Expand, Loader2, X } from "lucide-react";
import { chooseProposal } from "@/app/actions";
import Logo from "../Logo";
import ScaledFrame from "../ScaledFrame";

type P = { templateId: string; name: string; description: string; paletteId: string; palettes: { id: string; name: string; colors: string[] }[] };

export default function Chooser({ siteId, name, proposals }: { siteId: number; name: string; proposals: P[] }) {
  const [pal, setPal] = useState(proposals.map((p) => p.paletteId));
  const [full, setFull] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const url = (i: number) => `/preview/${siteId}?t=${proposals[i].templateId}&p=${pal[i]}`;
  const choose = (i: number) => {
    setPicked(i);
    start(() => chooseProposal(siteId, proposals[i].templateId, pal[i]));
  };

  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      <div className="aurora pointer-events-none fixed -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/25 via-fuchsia-500/20 to-amber-400/10 blur-[120px]" />
      <header className="relative flex items-center justify-between px-6 py-5"><Logo /></header>
      <main className="relative mx-auto max-w-7xl px-6 pb-20 pt-6">
        <div className="pop-in text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-1.5 text-sm text-emerald-300"><Check size={14} /> Génération terminée</p>
          <h1 className="mt-5 font-display text-4xl font-bold md:text-5xl">3 designs pour <span className="brand-text">{name}</span></h1>
          <p className="mt-4 text-white/55">Choisissez votre préféré. Vous pourrez tout modifier ensuite : textes, images, couleurs.</p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {proposals.map((p, i) => (
            <div key={p.templateId} className="pop-in flex flex-col" style={{ animationDelay: `${150 + i * 150}ms` }}>
              <div className={`group relative overflow-hidden rounded-2xl border transition ${i === 0 ? "border-fuchsia-400/50 shadow-2xl shadow-fuchsia-500/10" : "border-white/10"}`}>
                {i === 0 && <span className="brand-grad absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold">Recommandé</span>}
                <ScaledFrame src={url(i)} ratio={0.85} />
                <button onClick={() => setFull(i)} className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                  <span className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"><Expand size={16} /> Voir en grand</span>
                </button>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-semibold">{p.name}</p>
                  <p className="mt-1 text-sm text-white/50">{p.description}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.palettes.map((x) => (
                  <button key={x.id} title={x.name} onClick={() => setPal((s) => s.map((v, k) => (k === i ? x.id : v)))} className={`flex h-8 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-[#07070c] transition ${pal[i] === x.id ? "ring-fuchsia-400" : "ring-transparent hover:ring-white/30"}`}>
                    {x.colors.map((c) => <span key={c} className="w-4" style={{ background: c }} />)}
                  </button>
                ))}
              </div>
              <button onClick={() => choose(i)} disabled={pending} className={`mt-6 flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition disabled:opacity-60 ${i === 0 ? "brand-grad" : "bg-white text-black hover:bg-white/90"}`}>
                {pending && picked === i ? <><Loader2 size={18} className="animate-spin" /> Publication…</> : "Choisir et publier"}
              </button>
            </div>
          ))}
        </div>
      </main>

      {full !== null && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4 backdrop-blur" onClick={() => setFull(null)}>
          <div className="mb-3 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-lg font-semibold">{proposals[full].name}</p>
            <div className="flex gap-3">
              <button onClick={() => choose(full)} className="brand-grad rounded-full px-5 py-2 text-sm font-semibold">Choisir ce design</button>
              <button onClick={() => setFull(null)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10" aria-label="Fermer"><X size={18} /></button>
            </div>
          </div>
          <iframe src={url(full)} className="flex-1 rounded-xl border-0 bg-white" title="Aperçu plein écran" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
