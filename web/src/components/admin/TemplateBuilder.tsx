"use client";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Loader2, Plus, Save, X } from "lucide-react";
import { saveTemplateAction, type TplInput } from "@/app/admin/actions";
import { ANIM_LABELS, FOOTER_LABELS, MOOD_LABELS, NAV_LABELS, RADIUS_LABELS, SECTION_KINDS } from "@/templates/kinds";
import { FONT_LABELS } from "@/templates/fx";

type Cat = { id: string; label: string };
type Pal = { id: string; name: string; colors: string[] };
type Font = { id: string; label: string };



const inp =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-400/60 focus:outline-none";
const sel =
  "rounded-xl border border-white/10 bg-[#12121c] px-3 py-2.5 text-sm text-white focus:border-fuchsia-400/60 focus:outline-none";
const chip = (on: boolean) =>
  `rounded-full border px-4 py-2 text-sm transition ${on ? "border-fuchsia-400/70 bg-fuchsia-500/15 text-white" : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/30"}`;

export default function TemplateBuilder({
  initial, categories, palettes, fonts,
}: {
  initial?: TplInput; categories: Cat[]; palettes: Pal[]; fonts: Font[];
}) {
  const [t, setT] = useState<TplInput>(
    initial ?? {
      name: "", description: "", categories: [], moods: [], anim: "subtle", palette: "snow",
      altPalettes: [], fonts: "modern", radius: "md", nav: "solid", footer: "simple",
      sections: ["hero:split", "services:cards", "about:split", "contact:card"],
    },
  );
  const set = (p: Partial<TplInput>) => setT((x) => ({ ...x, ...p }));
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  const toggle = (key: "categories" | "moods" | "altPalettes", v: string) =>
    setT((x) => ({ ...x, [key]: x[key].includes(v) ? x[key].filter((k) => k !== v) : [...x[key], v] }));

  const setSec = (i: number, kind: string, variant: string) =>
    setT((x) => ({ ...x, sections: x.sections.map((s, j) => (j === i ? `${kind}:${variant}` : s)) }));
  const moveSec = (i: number, dir: -1 | 1) =>
    setT((x) => {
      const s = [...x.sections];
      const j = i + dir;
      if (j < 0 || j >= s.length) return x;
      [s[i], s[j]] = [s[j], s[i]];
      return { ...x, sections: s };
    });

  const preview = () => {
    const cat = t.categories.find((c) => c !== "*") ?? "consulting";
    window.open(`/admin/apercu?c=${encodeURIComponent(JSON.stringify(t))}&cat=${cat}`, "_blank");
  };

  const save = () =>
    start(async () => {
      const r = await saveTemplateAction(t);
      if (r?.error) setErr(r.error);
    });

  const kindOf = (s: string) => s.split(":")[0];
  const variantOf = (s: string) => s.split(":")[1] ?? "";
  const variantsFor = (k: string) => SECTION_KINDS.find((x) => x.id === k)?.variants ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      {err && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{err}</p>}

      {/* Identité */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">Identité</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input value={t.name} onChange={(e) => set({ name: e.target.value })} placeholder="Nom du modèle (ex : Horizon)" className={inp} />
          <input value={t.description} onChange={(e) => set({ description: e.target.value })} placeholder="Description courte" className={inp} />
        </div>
      </section>

      {/* Ciblage */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">Catégories ciblées</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => toggle("categories", "*")} className={chip(t.categories.includes("*"))}>✦ Universel</button>
          {categories.map((c) => (
            <button key={c.id} type="button" onClick={() => toggle("categories", c.id)} className={chip(t.categories.includes(c.id))}>{c.label}</button>
          ))}
        </div>
        <h2 className="mb-4 mt-7 text-sm font-semibold uppercase tracking-widest text-white/40">Ambiances</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(MOOD_LABELS).map(([id, l]) => (
            <button key={id} type="button" onClick={() => toggle("moods", id)} className={chip(t.moods.includes(id))}>{l}</button>
          ))}
        </div>
      </section>

      {/* Style */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">Style</h2>
        <p className="mb-2 text-xs text-white/50">Palette principale</p>
        <div className="flex flex-wrap gap-2">
          {palettes.map((p) => (
            <button key={p.id} type="button" onClick={() => set({ palette: p.id })} title={p.name}
              className={`h-9 w-14 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-[#0b0b12] transition ${t.palette === p.id ? "ring-fuchsia-400" : "ring-transparent hover:ring-white/40"}`}>
              <span className="flex h-full">{p.colors.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}</span>
            </button>
          ))}
        </div>
        <p className="mb-2 mt-6 text-xs text-white/50">Palettes alternatives (proposées à l&apos;utilisateur)</p>
        <div className="flex flex-wrap gap-2">
          {palettes.filter((p) => p.id !== t.palette).map((p) => (
            <button key={p.id} type="button" onClick={() => toggle("altPalettes", p.id)} title={p.name}
              className={`h-9 w-14 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-[#0b0b12] transition ${t.altPalettes.includes(p.id) ? "ring-fuchsia-400" : "ring-transparent hover:ring-white/40"}`}>
              <span className="flex h-full">{p.colors.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-xs text-white/50">Typographies</p>
            <select value={t.fonts} onChange={(e) => set({ fonts: e.target.value })} className={sel}>
              {fonts.map((f) => <option key={f.id} value={f.id}>{FONT_LABELS[f.id] ?? f.id}</option>)}
            </select>
          </div>
          <div>
            <p className="mb-2 text-xs text-white/50">Coins</p>
            <select value={t.radius} onChange={(e) => set({ radius: e.target.value })} className={sel}>
              {Object.entries(RADIUS_LABELS).map(([id, l]) => <option key={id} value={id}>{l}</option>)}
            </select>
          </div>
          <div>
            <p className="mb-2 text-xs text-white/50">Animations</p>
            <select value={t.anim} onChange={(e) => set({ anim: e.target.value })} className={sel}>
              {Object.entries(ANIM_LABELS).map(([id, l]) => <option key={id} value={id}>{l}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Formes */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">Formes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-white/50">Header (navigation)</p>
            <select value={t.nav} onChange={(e) => set({ nav: e.target.value })} className={`${sel} w-full`}>
              {Object.entries(NAV_LABELS).map(([id, l]) => <option key={id} value={id}>{l}</option>)}
            </select>
          </div>
          <div>
            <p className="mb-2 text-xs text-white/50">Footer</p>
            <select value={t.footer} onChange={(e) => set({ footer: e.target.value })} className={`${sel} w-full`}>
              {Object.entries(FOOTER_LABELS).map(([id, l]) => <option key={id} value={id}>{l}</option>)}
            </select>
          </div>
        </div>

        <p className="mb-3 mt-7 text-xs text-white/50">Sections (dans l&apos;ordre) : commencez par un hero, finissez par le contact</p>
        <div className="space-y-2">
          {t.sections.map((s, i) => {
            const k = kindOf(s);
            return (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                <span className="w-6 shrink-0 text-center text-xs font-semibold text-white/30">{i + 1}</span>
                <select value={k} onChange={(e) => { const nk = e.target.value; setSec(i, nk, variantsFor(nk)[0]?.id ?? ""); }} className={sel}>
                  {SECTION_KINDS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                </select>
                <select value={variantOf(s)} onChange={(e) => setSec(i, k, e.target.value)} className={sel}>
                  {variantsFor(k).map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
                <div className="ml-auto flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => moveSec(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 disabled:opacity-20"><ArrowUp size={14} /></button>
                  <button type="button" onClick={() => moveSec(i, 1)} disabled={i === t.sections.length - 1} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 disabled:opacity-20"><ArrowDown size={14} /></button>
                  <button type="button" onClick={() => set({ sections: t.sections.filter((_, j) => j !== i) })} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-red-500/20 hover:text-red-300"><X size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => set({ sections: [...t.sections, "services:cards"] })}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-3 text-sm text-white/60 hover:text-white"
        >
          <Plus size={15} /> Ajouter une section
        </button>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={preview} className="flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/5">
          <ExternalLink size={16} /> Prévisualiser
        </button>
        <button onClick={save} disabled={pending} className="brand-grad flex items-center gap-2 rounded-xl px-6 py-3 font-semibold disabled:opacity-50">
          {pending ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} Enregistrer le modèle
        </button>
      </div>
    </div>
  );
}
