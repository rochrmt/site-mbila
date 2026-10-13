"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowLeft, Check, Copy, ExternalLink, Eye, Globe, Image as ImageIcon, Inbox, Loader2, Monitor, Palette, PartyPopper, Plus,
  Eraser, RefreshCcw, Save, Settings, ShieldCheck, Smartphone, Trash2, Type, Undo2, Upload, X,
} from "lucide-react";
import { commitSite, discardSiteDraft, removeSite, requestDomain, saveDraft, setPublished, undoSite } from "@/app/actions";
import type { PlanPrice } from "./PayForm";

import type { CustomDomain, Lead, Notification } from "@/lib/db";
import NotifBell from "../NotifBell";
import type { AnimLevel, CtaType, SiteData } from "@/templates/types";
import { FONT_PAIRS } from "@/templates/palettes";
import { FONT_LABELS, FX_LIST, FX_PRESETS, HERO_TEXT_MODES, type HeroTextMode } from "@/templates/fx";
import ScaledFrame from "../ScaledFrame";
import ImagePicker from "./ImagePicker";

type TplInfo = { id: string; name: string; description: string; palettes: string[]; fits: boolean; custom?: boolean };
type PalInfo = { id: string; name: string; colors: string[] };
type SiteInfo = {
  id: number; slug: string; templateId: string; paletteId: string; anim: string; published: boolean;
  paidUntil: string | null;
  data: SiteData;
  draft?: { data: SiteData; templateId: string; paletteId: string | null; anim: string | null } | null;
};

const TABS = [
  { id: "content", label: "Contenu", Icon: Type },
  { id: "design", label: "Design", Icon: Palette },
  { id: "images", label: "Images", Icon: ImageIcon },
  { id: "leads", label: "Messages", Icon: Inbox },
  { id: "settings", label: "Réglages", Icon: Settings },
] as const;

const CTA_OPTIONS: { id: CtaType; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" }, { id: "call", label: "Appel" }, { id: "email", label: "Email" },
  { id: "booking", label: "Réservation" }, { id: "quote", label: "Devis" },
];

const inp = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/60";

function Field({ label, value, onChange, area, placeholder }: { label: string; value: string; onChange: (v: string) => void; area?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/50">{label}</span>
      {area ? (
        <textarea rows={4} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inp} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inp} />
      )}
    </label>
  );
}

function Group({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group rounded-xl border border-white/10 bg-white/[0.02]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-sm font-semibold">
        {title}
        <span className="text-white/40 transition group-open:rotate-45">+</span>
      </summary>
      <div className="space-y-4 border-t border-white/5 p-4">{children}</div>
    </details>
  );
}

function Thumb({ src, onClick, onRemove }: { src?: string; onClick: () => void; onRemove?: () => void }) {
  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-white/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt="" className="h-full w-full object-cover" />}
      <button onClick={onClick} className="absolute inset-0 grid place-items-center bg-black/50 text-xs font-semibold opacity-0 transition group-hover:opacity-100">Changer</button>
      {onRemove && (
        <button onClick={onRemove} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 opacity-0 transition group-hover:opacity-100" aria-label="Retirer"><X size={12} /></button>
      )}
    </div>
  );
}

export default function Editor({
  site, url, host, leads, templates, palettes, stock, welcome, history, support, initialTab, domains, pendingPayment, notifications, unreadNotifs, price,
}: {
  site: SiteInfo; url: string; host: string; leads: Lead[]; templates: TplInfo[]; palettes: PalInfo[]; stock: Record<string, string[]>; welcome: boolean; history: number; support?: boolean; initialTab?: string; domains: CustomDomain[]; pendingPayment: boolean; notifications: Notification[]; unreadNotifs: number; price: PlanPrice;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(
    TABS.some((t) => t.id === initialTab) ? (initialTab as (typeof TABS)[number]["id"]) : "content",
  );
  // L'éditeur travaille sur un brouillon : l'aperçu reflète les modifs mais rien
  // n'est en ligne tant que le client n'appuie pas sur « Enregistrer ».
  const [d, setD] = useState<SiteData>(() => structuredClone(site.draft?.data ?? site.data));
  const [design, setDesign] = useState({
    templateId: site.draft?.templateId ?? site.templateId,
    paletteId: site.draft?.paletteId ?? site.paletteId,
    anim: (site.draft?.anim ?? site.anim) as AnimLevel,
  });
  const [dirty, setDirty] = useState(!!site.draft);
  const [versions, setVersions] = useState(history);
  const [status, setStatus] = useState<"saved" | "saving" | "dirty">("saved");
  const [rev, setRev] = useState(0);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [picker, setPicker] = useState<((src: string) => void) | null>(null);
  const [uploads, setUploads] = useState<string[]>(() => [...new Set(JSON.stringify(site.data).match(/\/u\/\d+\/[a-f0-9]{16}\.webp/g) ?? [])]);
  const [showWelcome, setShowWelcome] = useState(welcome && site.published);
  const [copied, setCopied] = useState(false);
  const [domInput, setDomInput] = useState("");
  const [domSent, setDomSent] = useState(false);
  const [domErr, setDomErr] = useState("");
  const isPaid = !!site.paidUntil && site.paidUntil > new Date().toISOString();
  const [pending, start] = useTransition();
  // Référence de comparaison : la version en ligne au chargement (ou le dernier
  // état enregistré). Tant que le contenu est identique, aucun brouillon n'est écrit.
  const baseline = useRef("");

  // Écriture immédiate du brouillon (utilisée par le debounce ET par le
  // bouton « Aperçu » mobile pour garantir que l'aperçu montre le dernier état)
  async function flushDraft() {
    setStatus("saving");
    await saveDraft(site.id, { data: d, ...design });
    setStatus("dirty");
    setRev((r) => r + 1);
  }

  // Chaque modification écrit le brouillon (jamais en ligne) puis recharge l'aperçu
  useEffect(() => {
    const snap = JSON.stringify({ data: d, ...design });
    if (!baseline.current) baseline.current = snap; // montage : état initial
    if (snap === baseline.current) return;
    setDirty(true);
    setStatus("saving");
    const id = setTimeout(async () => {
      await saveDraft(site.id, { data: d, ...design });
      setStatus("dirty");
      setRev((r) => r + 1);
    }, 900);
    return () => clearTimeout(id);
  }, [d, design, site.id]);

  function applyDesign(p: Partial<typeof design>) {
    const next = { ...design, ...p };
    if (p.templateId && !p.paletteId) {
      const t = templates.find((x) => x.id === p.templateId)!;
      if (!t.palettes.includes(next.paletteId)) next.paletteId = t.palettes[0];
    }
    setDesign(next);
  }

  // « Enregistrer » : le brouillon devient la version en ligne
  async function onSave() {
    setStatus("saving");
    await saveDraft(site.id, { data: d, ...design });
    await commitSite(site.id);
    baseline.current = JSON.stringify({ data: d, ...design });
    setDirty(false);
    setVersions((v) => v + 1);
    setStatus("saved");
    setRev((r) => r + 1);
  }

  // « Annuler » : jeter le brouillon, revenir à la version en ligne
  async function onDiscard() {
    await discardSiteDraft(site.id);
    baseline.current = JSON.stringify({
      data: site.data, templateId: site.templateId, paletteId: site.paletteId, anim: site.anim,
    });
    setD(structuredClone(site.data));
    setDesign({ templateId: site.templateId, paletteId: site.paletteId, anim: site.anim as AnimLevel });
    setDirty(false);
    setStatus("saved");
    setRev((r) => r + 1);
  }

  // « Version précédente » : restaurer le dernier état enregistré
  async function onUndo() {
    const r = await undoSite(site.id);
    if (!r.ok || !r.snapshot) return;
    const s = r.snapshot;
    baseline.current = JSON.stringify({
      data: s.data, templateId: s.templateId, paletteId: s.paletteId, anim: s.anim,
    });
    setD(structuredClone(s.data));
    setDesign({ templateId: s.templateId, paletteId: s.paletteId ?? "", anim: (s.anim ?? "subtle") as AnimLevel });
    setVersions((v) => Math.max(0, v - 1));
    setDirty(false);
    setStatus("saved");
    setRev((r2) => r2 + 1);
  }

  const up = (fn: (x: SiteData) => void) => setD((prev) => { const c = structuredClone(prev); fn(c); return c; });

  // Logo : import (fichier) ou nettoyage du logo actuel → fond uni rendu transparent
  const logoRef = useRef<HTMLInputElement>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoMsg, setLogoMsg] = useState("");
  async function cleanLogo(file?: File) {
    setLogoBusy(true);
    setLogoMsg("");
    const res = file
      ? await fetch("/api/logo", { method: "POST", body: (() => { const fd = new FormData(); fd.append("file", file); return fd; })() })
      : await fetch("/api/logo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ src: d.logo }) });
    const j = await res.json().catch(() => ({}));
    setLogoBusy(false);
    if (!res.ok) return setLogoMsg(j.error ?? "Échec de l'envoi");
    up((x) => { x.logo = j.url; });
    setUploads((u) => [j.url, ...u]);
    setLogoMsg(j.removed ? "Fond retiré automatiquement ✓" : file ? "Logo importé (fond déjà transparent)" : "Aucun fond uni détecté : logo inchangé");
  }
  const pick = (cb: (src: string) => void) => setPicker(() => cb);
  const previewSrc = `/preview/${site.id}?r=${rev}`;
  const tplPalettes = templates.find((t) => t.id === design.templateId)?.palettes ?? [];

  return (
    <div className="flex h-screen flex-col bg-[#07070c] text-white">
      {/* Barre du haut */}
      <header className="flex items-center gap-4 border-b border-white/5 px-4 py-3">
        <Link href={support ? "/admin/clients" : "/dashboard"} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/5" aria-label="Retour"><ArrowLeft size={18} /></Link>
        {support && (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-bold text-amber-300 md:inline-flex">
            <ShieldCheck size={12} /> Mode admin
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-display font-semibold">{d.name}</p>
          <a href={url} target="_blank" className="flex items-center gap-1 truncate text-xs text-white/45 hover:text-white">{host} <ExternalLink size={11} /></a>
        </div>
        <span className="ml-2 hidden items-center gap-1.5 text-xs sm:flex">
          {status === "saving" ? (
            <><Loader2 size={13} className="animate-spin text-white/40" /> <span className="text-white/40">Aperçu…</span></>
          ) : dirty ? (
            <><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> <span className="text-amber-300/80">Non enregistré</span></>
          ) : (
            <><Check size={13} className="text-emerald-400" /> <span className="text-white/40">Enregistré</span></>
          )}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {/* Aperçu mobile — dans la barre du haut pour rester accessible
              même quand le clavier virtuel est ouvert */}
          <button
            onClick={async () => { await flushDraft(); setPreviewOpen(true); }}
            className="flex items-center gap-1.5 rounded-full bg-fuchsia-500/15 px-3.5 py-2 text-xs font-semibold text-fuchsia-200 transition hover:bg-fuchsia-500/25 md:hidden"
            aria-label="Aperçu"
          >
            <Eye size={15} /> Aperçu
          </button>
          {versions > 0 && (
            <button onClick={onUndo} title="Revenir à la version précédente" className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white">
              <Undo2 size={13} /> <span className="hidden lg:inline">Version précédente</span>
            </button>
          )}
          {dirty && (
            <>
              <button onClick={onDiscard} className="rounded-full px-3 py-2 text-xs font-semibold text-white/50 transition hover:bg-white/5 hover:text-white">
                Annuler
              </button>
              <button onClick={onSave} className="brand-grad rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                <span className="flex items-center gap-1.5"><Save size={14} /> Enregistrer</span>
              </button>
            </>
          )}
          <button
            onClick={() => setTab("settings")}
            title="Utiliser mon propre nom de domaine"
            className="flex items-center gap-1.5 rounded-full bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/25"
          >
            <Globe size={13} /> <span className="hidden lg:inline">Domaine</span>
          </button>
          <div className="hidden rounded-full bg-white/5 p-1 md:flex">
            {(["desktop", "mobile"] as const).map((x) => (
              <button key={x} onClick={() => setDevice(x)} className={`grid h-8 w-9 place-items-center rounded-full ${device === x ? "bg-white text-black" : "text-white/50"}`} aria-label={x}>
                {x === "desktop" ? <Monitor size={15} /> : <Smartphone size={15} />}
              </button>
            ))}
          </div>
          {site.published || isPaid ? (
            <button
              onClick={() => start(async () => { await setPublished(site.id, !site.published); })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${site.published ? "bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20" : "brand-grad"}`}
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : site.published ? "● En ligne" : "Publier"}
            </button>
          ) : (
            <Link
              href={`/payer/${site.id}`}
              className="brand-grad rounded-full px-4 py-2 text-sm font-semibold transition hover:brightness-110"
            >
              {pendingPayment ? "⏳ Paiement en attente" : `Publier · ${price.monthly.toLocaleString("fr-FR")} FCFA/mois`}
            </Link>
          )}
          {isPaid && (
            <Link href={`/payer/${site.id}`} title="Gérer ou renouveler mon abonnement" aria-label="Gérer mon abonnement" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/55 transition hover:bg-white/10 hover:text-white">
              <RefreshCcw size={14} />
            </Link>
          )}
          <NotifBell notifications={notifications} unread={unreadNotifs} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Panneau latéral */}
        <aside className="flex w-full max-w-md shrink-0 flex-col border-r border-white/5">
          <nav className="flex gap-1 border-b border-white/5 p-2">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)} className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] transition ${tab === id ? "bg-white/10 text-white" : "text-white/45 hover:text-white"}`}>
                <Icon size={17} />
                {label}
                {id === "leads" && leads.length > 0 && <span className="absolute -mt-1 ml-6 rounded-full bg-fuchsia-500 px-1.5 text-[10px]">{leads.length}</span>}
              </button>
            ))}
          </nav>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {tab === "content" && (
              <>
                <Group title="Informations générales" open>
                  <Field label="Nom de l'activité" value={d.name} onChange={(v) => up((x) => { x.name = v; })} />
                  <Field label="Slogan" value={d.tagline} onChange={(v) => up((x) => { x.tagline = v; })} />
                  <Field label="Ville" value={d.city} onChange={(v) => up((x) => { x.city = v; })} />
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-white/50">Logo (optionnel)</span>
                    <div className="flex items-center gap-3">
                      <div className="checker grid h-16 w-28 shrink-0 place-items-center overflow-hidden rounded-lg p-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {d.logo ? <img src={d.logo} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-white/40">Aucun</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => logoRef.current?.click()} disabled={logoBusy} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15">
                          {logoBusy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Importer
                        </button>
                        <button onClick={() => pick((s) => up((x) => { x.logo = s; }))} className="rounded-lg bg-white/5 px-3 py-2 text-xs hover:bg-white/10">Choisir</button>
                        {d.logo?.startsWith("/u/") && (
                          <button onClick={() => cleanLogo()} disabled={logoBusy} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs hover:bg-white/10">
                            <Eraser size={12} /> Retirer le fond
                          </button>
                        )}
                        {d.logo && <button onClick={() => up((x) => { delete x.logo; })} className="px-1 text-xs text-white/40 hover:text-red-300">Supprimer</button>}
                      </div>
                      <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) cleanLogo(f); }} />
                    </div>
                    {logoMsg && <p className="mt-2 text-[11px] text-white/45">{logoMsg}</p>}
                    {d.logo && (
                      <label className="mt-3 block">
                        <span className="mb-1.5 flex justify-between text-xs font-medium text-white/50">
                          Taille du logo <span className="text-white/70">{d.logoSize ?? 40} px</span>
                        </span>
                        <input
                          type="range"
                          min={24}
                          max={120}
                          step={2}
                          value={d.logoSize ?? 40}
                          onChange={(e) => up((x) => { x.logoSize = Number(e.target.value); })}
                          className="w-full accent-fuchsia-500"
                        />
                      </label>
                    )}
                  </div>
                </Group>
                <Group title="Accueil">
                  <Field label="Titre principal" value={d.hero.title} onChange={(v) => up((x) => { x.hero.title = v; })} />
                  <Field area label="Sous-titre" value={d.hero.subtitle} onChange={(v) => up((x) => { x.hero.subtitle = v; })} />
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-white/50">Image principale</span>
                    <div className="w-40"><Thumb src={d.hero.image} onClick={() => pick((s) => up((x) => { x.hero.image = s; x.hero.images[0] = s; }))} /></div>
                  </div>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2.5">
                    <span>
                      <span className="block text-sm">Carrousel d&apos;images</span>
                      <span className="block text-[11px] text-white/40">Images réglables dans l&apos;onglet Images</span>
                    </span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-fuchsia-500"
                      checked={d.style?.fx?.includes("carousel") ?? false}
                      onChange={(e) => up((x) => {
                        const cur = (x.style?.fx ?? []).filter((y) => y !== "carousel");
                        x.style = { ...x.style, fx: e.target.checked ? [...cur, "carousel"] : cur };
                      })}
                    />
                  </label>
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-white/50">Texte changeant sous le titre</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[{ id: "", label: "Aucun" }, ...HERO_TEXT_MODES].map((m) => {
                        const on = (d.style?.heroText?.mode ?? "") === m.id;
                        return (
                          <button
                            key={m.id || "none"}
                            onClick={() => up((x) => {
                              x.style = {
                                ...x.style,
                                heroText: m.id ? { mode: m.id as HeroTextMode, words: x.style?.heroText?.words?.length ? x.style.heroText.words : x.keywords.slice(0, 5) } : undefined,
                              };
                            })}
                            className={`rounded-lg py-2 text-xs ${on ? "bg-white text-black" : "bg-white/5 text-white/60"}`}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {d.style?.heroText && (
                    <Field
                      label="Mots qui défilent (séparés par des virgules)"
                      value={d.style.heroText.words.join(", ")}
                      onChange={(v) => up((x) => { if (x.style?.heroText) x.style.heroText.words = v.split(",").map((w) => w.trimStart()).slice(0, 8); })}
                    />
                  )}
                </Group>
                <Group title="À propos">
                  <Field label="Titre" value={d.about.title} onChange={(v) => up((x) => { x.about.title = v; })} />
                  <Field area label="Texte" value={d.about.text} onChange={(v) => up((x) => { x.about.text = v; })} />
                  <div className="w-40"><Thumb src={d.about.image} onClick={() => pick((s) => up((x) => { x.about.image = s; }))} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    {d.about.stats.map((s, i) => (
                      <div key={i} className="contents">
                        <input className={inp} value={s.value} onChange={(e) => up((x) => { x.about.stats[i].value = e.target.value; })} placeholder="Chiffre" />
                        <input className={inp} value={s.label} onChange={(e) => up((x) => { x.about.stats[i].label = e.target.value; })} placeholder="Libellé" />
                      </div>
                    ))}
                  </div>
                </Group>
                <Group title={`Services / produits (${d.services.items.length})`}>
                  <Field label="Titre de section" value={d.services.title} onChange={(v) => up((x) => { x.services.title = v; })} />
                  <Field label="Sous-titre" value={d.services.subtitle} onChange={(v) => up((x) => { x.services.subtitle = v; })} />
                  {d.services.items.map((it, i) => (
                    <div key={i} className="space-y-2 rounded-lg border border-white/10 p-3">
                      <div className="flex gap-3">
                        <div className="w-20 shrink-0"><Thumb src={it.image} onClick={() => pick((s) => up((x) => { x.services.items[i].image = s; }))} /></div>
                        <div className="flex-1 space-y-2">
                          <input className={inp} value={it.name} onChange={(e) => up((x) => { x.services.items[i].name = e.target.value; })} placeholder="Nom" />
                          <input className={inp} value={it.price ?? ""} onChange={(e) => up((x) => { x.services.items[i].price = e.target.value || undefined; })} placeholder="Prix (optionnel)" />
                        </div>
                      </div>
                      <textarea rows={2} className={inp} value={it.description} onChange={(e) => up((x) => { x.services.items[i].description = e.target.value; })} placeholder="Description" />
                      <button onClick={() => up((x) => { x.services.items.splice(i, 1); })} className="flex items-center gap-1 text-xs text-white/40 hover:text-red-300"><Trash2 size={12} /> Supprimer</button>
                    </div>
                  ))}
                  <button onClick={() => up((x) => { x.services.items.push({ name: "Nouveau service", description: "Décrivez ce service.", image: x.gallery.images[0] }); })} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-2.5 text-sm text-white/60 hover:text-white">
                    <Plus size={15} /> Ajouter
                  </button>
                </Group>
                {d.works && (
                  <Group title={`Réalisations (${d.works.items.length})`}>
                    <Field label="Titre de section" value={d.works.title} onChange={(v) => up((x) => { x.works!.title = v; })} />
                    {d.works.items.map((w, i) => (
                      <div key={i} className="space-y-2 rounded-lg border border-white/10 p-3">
                        <div className="flex gap-3">
                          <div className="w-20 shrink-0"><Thumb src={w.image} onClick={() => pick((s) => up((x) => { x.works!.items[i].image = s; }))} /></div>
                          <div className="flex-1 space-y-2">
                            <input className={inp} value={w.name} onChange={(e) => up((x) => { x.works!.items[i].name = e.target.value; })} placeholder="Nom du projet" />
                            <input className={inp} value={w.tag} onChange={(e) => up((x) => { x.works!.items[i].tag = e.target.value; })} placeholder="Type (ex : Branding)" />
                          </div>
                        </div>
                        <button onClick={() => up((x) => { x.works!.items.splice(i, 1); })} className="flex items-center gap-1 text-xs text-white/40 hover:text-red-300"><Trash2 size={12} /> Supprimer</button>
                      </div>
                    ))}
                    <button onClick={() => up((x) => { x.works!.items.push({ name: "Nouveau projet", tag: "Projet", image: x.gallery.images[0] }); })} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-2.5 text-sm text-white/60 hover:text-white">
                      <Plus size={15} /> Ajouter
                    </button>
                  </Group>
                )}
                {d.category === "portfolio" ? (
                  <Group title={`Formation (${d.education?.length ?? 0})`}>
                    {(d.education ?? []).map((e, i) => (
                      <div key={i} className="space-y-2 rounded-lg bg-white/[0.03] p-3">
                        <input className={inp} value={e.title} onChange={(ev) => up((x) => { x.education![i].title = ev.target.value; })} placeholder="Diplôme / formation" />
                        <div className="grid grid-cols-[1fr_90px] gap-2">
                          <input className={inp} value={e.school} onChange={(ev) => up((x) => { x.education![i].school = ev.target.value; })} placeholder="Établissement" />
                          <input className={inp} value={e.year} onChange={(ev) => up((x) => { x.education![i].year = ev.target.value; })} placeholder="Année" />
                        </div>
                        <button onClick={() => up((x) => { x.education!.splice(i, 1); })} className="flex items-center gap-1 text-xs text-white/40 hover:text-red-300"><Trash2 size={12} /> Supprimer</button>
                      </div>
                    ))}
                    <button onClick={() => up((x) => { x.education = [...(x.education ?? []), { title: "Nouvelle formation", school: "", year: "" }]; })} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-2.5 text-sm text-white/60 hover:text-white"><Plus size={15} /> Ajouter</button>
                    <p className="text-xs text-white/35">Section masquée sur le site tant qu&apos;elle est vide.</p>
                  </Group>
                ) : (
                <Group title={`Témoignages (${d.testimonials.length})`}>
                  {d.testimonials.map((t, i) => (
                    <div key={i} className="space-y-2 rounded-lg border border-white/10 p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input className={inp} value={t.name} onChange={(e) => up((x) => { x.testimonials[i].name = e.target.value; })} placeholder="Nom" />
                        <input className={inp} value={t.role} onChange={(e) => up((x) => { x.testimonials[i].role = e.target.value; })} placeholder="Rôle" />
                      </div>
                      <textarea rows={2} className={inp} value={t.text} onChange={(e) => up((x) => { x.testimonials[i].text = e.target.value; })} />
                      <button onClick={() => up((x) => { x.testimonials.splice(i, 1); })} className="flex items-center gap-1 text-xs text-white/40 hover:text-red-300"><Trash2 size={12} /> Supprimer</button>
                    </div>
                  ))}
                  <button onClick={() => up((x) => { x.testimonials.push({ name: "Client", role: "Client", text: "Un avis sur votre activité." }); })} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-2.5 text-sm text-white/60 hover:text-white"><Plus size={15} /> Ajouter</button>
                </Group>
                )}
                <Group title={`FAQ (${d.faq.length})`}>
                  {d.faq.map((f, i) => (
                    <div key={i} className="space-y-2 rounded-lg border border-white/10 p-3">
                      <input className={inp} value={f.q} onChange={(e) => up((x) => { x.faq[i].q = e.target.value; })} placeholder="Question" />
                      <textarea rows={2} className={inp} value={f.a} onChange={(e) => up((x) => { x.faq[i].a = e.target.value; })} placeholder="Réponse" />
                      <button onClick={() => up((x) => { x.faq.splice(i, 1); })} className="flex items-center gap-1 text-xs text-white/40 hover:text-red-300"><Trash2 size={12} /> Supprimer</button>
                    </div>
                  ))}
                  <button onClick={() => up((x) => { x.faq.push({ q: "Nouvelle question ?", a: "Votre réponse." }); })} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-2.5 text-sm text-white/60 hover:text-white"><Plus size={15} /> Ajouter</button>
                </Group>
                <Group title="Contact & bouton d'action">
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-white/50">Action principale</span>
                    <div className="grid grid-cols-5 gap-1">
                      {CTA_OPTIONS.map((c) => (
                        <button key={c.id} onClick={() => up((x) => { x.cta.type = c.id; })} className={`rounded-lg py-2 text-[11px] ${d.cta.type === c.id ? "bg-white text-black" : "bg-white/5 text-white/60"}`}>{c.label}</button>
                      ))}
                    </div>
                  </div>
                  <Field label="Texte du bouton" value={d.cta.label} onChange={(v) => up((x) => { x.cta.label = v; })} />
                  <Field label="Téléphone" value={d.contact.phone} onChange={(v) => up((x) => { x.contact.phone = v; })} />
                  <Field label="WhatsApp" value={d.contact.whatsapp} onChange={(v) => up((x) => { x.contact.whatsapp = v; })} />
                  <Field label="Email" value={d.contact.email} onChange={(v) => up((x) => { x.contact.email = v; })} />
                  <Field label="Adresse" value={d.contact.address} onChange={(v) => up((x) => { x.contact.address = v; })} />
                  <Field label="Horaires" value={d.contact.hours} onChange={(v) => up((x) => { x.contact.hours = v; })} />
                  {(["facebook", "instagram", "tiktok", "linkedin"] as const).map((k) => (
                    <Field key={k} label={k[0].toUpperCase() + k.slice(1)} placeholder="https://…" value={d.socials[k]} onChange={(v) => up((x) => { x.socials[k] = v; })} />
                  ))}
                  <Field
                    label="Boutique en ligne (Chariow, Maketou…)"
                    placeholder="https://ma-boutique.chariow.com/…"
                    value={d.store?.url ?? ""}
                    onChange={(v) => up((x) => { x.store = { ...(x.store ?? { url: "" }), url: v }; })}
                  />
                  {!!d.store?.url?.trim() && (
                    <Field
                      label="Texte du bouton boutique"
                      placeholder="Commander en ligne"
                      value={d.store.label ?? ""}
                      onChange={(v) => up((x) => { x.store!.label = v; })}
                    />
                  )}
                </Group>
              </>
            )}

            {tab === "design" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Animations</p>
                <div className="grid grid-cols-3 gap-2">
                  {([["none", "Sobre"], ["subtle", "Fluide"], ["rich", "Spectaculaire"]] as const).map(([id, l]) => (
                    <button key={id} onClick={() => applyDesign({ anim: id })} className={`rounded-lg py-2.5 text-sm ${design.anim === id ? "bg-white text-black" : "bg-white/5 text-white/60"}`}>{l}</button>
                  ))}
                </div>
                <p className="pt-4 text-xs font-semibold uppercase tracking-widest text-white/40">Effets</p>
                <div className="grid grid-cols-3 gap-2">
                  {FX_PRESETS.map((p) => {
                    const cur = d.style?.fx ?? [];
                    const on = p.fx.length === cur.length && p.fx.every((x) => cur.includes(x));
                    return (
                      <button key={p.id} onClick={() => up((x) => {
                        x.style = { ...x.style, fx: [...p.fx], heroText: p.text ? { mode: p.text, words: x.style?.heroText?.words?.length ? x.style.heroText.words : x.keywords.slice(0, 5) } : undefined };
                      })} className={`rounded-lg py-2.5 text-sm ${on ? "bg-white text-black" : "bg-white/5 text-white/60"}`}>{p.label}</button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FX_LIST.map((f) => {
                    const on = d.style?.fx?.includes(f.id) ?? false;
                    return (
                      <button
                        key={f.id}
                        title={f.hint}
                        onClick={() => up((x) => {
                          const cur = x.style?.fx ?? [];
                          x.style = { ...x.style, fx: on ? cur.filter((y) => y !== f.id) : [...cur, f.id] };
                        })}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${on ? "border-fuchsia-400/70 bg-fuchsia-500/15 text-white" : "border-white/10 text-white/55 hover:border-white/30"}`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
                <p className="pt-4 text-xs font-semibold uppercase tracking-widest text-white/40">Typographie</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: "", head: "inherit", body: "inherit", headUpper: false }, ...FONT_PAIRS].map((f) => {
                    const on = (d.style?.fonts ?? "") === f.id;
                    return (
                      <button key={f.id || "auto"} onClick={() => up((x) => { x.style = { ...x.style, fonts: f.id || undefined }; })} className={`rounded-lg border p-2.5 text-left ${on ? "border-fuchsia-400" : "border-white/10 hover:border-white/25"}`}>
                        <p className={`truncate text-base ${f.headUpper ? "uppercase" : ""}`} style={{ fontFamily: f.head }}>{f.id ? d.name.split(" ")[0] || "Aa" : "Automatique"}</p>
                        <p className="text-[11px] text-white/40">{f.id ? FONT_LABELS[f.id] ?? f.id : "Celle du design"}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="pt-4 text-xs font-semibold uppercase tracking-widest text-white/40">Couleurs</p>
                <div className="grid grid-cols-2 gap-2">
                  {[...tplPalettes, ...palettes.map((p) => p.id).filter((id) => !tplPalettes.includes(id))].map((id) => {
                    const p = palettes.find((x) => x.id === id)!;
                    return (
                      <button key={id} onClick={() => applyDesign({ paletteId: id })} className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs ${design.paletteId === id ? "border-fuchsia-400" : "border-white/10 hover:border-white/25"}`}>
                        <span className="flex h-6 overflow-hidden rounded-md">{p.colors.map((c) => <span key={c} className="w-3" style={{ background: c }} />)}</span>
                        <span className="truncate">{p.name}</span>
                        {tplPalettes.includes(id) && <span className="ml-auto text-[10px] text-fuchsia-300">★</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="pt-4 text-xs font-semibold uppercase tracking-widest text-white/40">Design</p>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((t) => (
                    <button key={t.id} onClick={() => applyDesign({ templateId: t.id })} className={`overflow-hidden rounded-xl border text-left transition ${design.templateId === t.id ? "border-fuchsia-400 ring-2 ring-fuchsia-400/30" : "border-white/10 hover:border-white/30"}`}>
                      {t.custom ? (
                        <div className="brand-grad grid aspect-[4/3] w-full place-items-center font-display text-xl font-bold text-white">{t.name.slice(0, 1)}</div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/thumbs/${t.id}.jpg`} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover object-top" />
                      )}
                      <div className="p-2.5">
                        <p className="flex items-center gap-1.5 text-sm font-semibold">{t.name}</p>
                        <p className="line-clamp-1 text-[11px] text-white/40">{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === "images" && (
              <>
                <p className="text-sm text-white/50">Images de la galerie. Survolez pour changer ou retirer.</p>
                <div className="grid grid-cols-3 gap-2">
                  {d.gallery.images.map((src, i) => (
                    <Thumb key={i + src} src={src} onClick={() => pick((s) => up((x) => { x.gallery.images[i] = s; }))} onRemove={() => up((x) => { x.gallery.images.splice(i, 1); })} />
                  ))}
                  <button onClick={() => pick((s) => up((x) => { x.gallery.images.push(s); }))} className="grid aspect-[4/3] place-items-center rounded-lg border border-dashed border-white/15 text-white/40 hover:text-white"><Plus /></button>
                </div>
                <p className="pt-4 text-sm text-white/50">Images du diaporama d&apos;accueil</p>
                <div className="grid grid-cols-3 gap-2">
                  {d.hero.images.map((src, i) => (
                    <Thumb key={i + src} src={src} onClick={() => pick((s) => up((x) => { x.hero.images[i] = s; if (i === 0) x.hero.image = s; }))} onRemove={d.hero.images.length > 1 ? () => up((x) => { x.hero.images.splice(i, 1); x.hero.image = x.hero.images[0]; }) : undefined} />
                  ))}
                  {d.hero.images.length < 5 && <button onClick={() => pick((s) => up((x) => { x.hero.images.push(s); }))} className="grid aspect-[4/3] place-items-center rounded-lg border border-dashed border-white/15 text-white/40 hover:text-white"><Plus /></button>}
                </div>
              </>
            )}

            {tab === "leads" && (
              leads.length === 0 ? (
                <div className="py-16 text-center text-white/40"><Inbox className="mx-auto mb-3" size={32} />Aucun message pour l&apos;instant.<br />Partagez votre lien pour recevoir vos premiers clients !</div>
              ) : (
                leads.map((l) => (
                  <div key={l.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{l.name}</p>
                      <p className="text-xs text-white/40">{new Date(l.created_at + "Z").toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</p>
                    </div>
                    <p className="mt-1 text-xs text-white/50">{[l.email, l.phone].filter(Boolean).join(" · ")}</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-white/80">{l.message}</p>
                  </div>
                ))
              )
            )}

            {tab === "settings" && (
              <>
                <div className="rounded-xl border border-white/10 p-4">
                  <p className="font-semibold">Adresse du site</p>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="flex-1 truncate rounded-lg bg-white/5 px-3 py-2.5 text-sm">{url}</code>
                    <button onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 hover:bg-white/10" aria-label="Copier">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
                  </div>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Découvrez ${d.name} : ${url}`)}`} target="_blank" className="mt-3 block rounded-lg bg-[#25D366] py-2.5 text-center text-sm font-semibold text-black">Partager sur WhatsApp</a>
                  <p className="mt-3 text-xs leading-relaxed">
                    {isPaid
                      ? <span className="text-emerald-300/80">Abonnement actif jusqu&apos;au {new Date(site.paidUntil!).toLocaleDateString("fr-FR")} · <Link href={`/payer/${site.id}`} className="font-semibold text-cyan-300 underline-offset-2 hover:underline">Renouveler / changer d&apos;offre →</Link></span>
                      : pendingPayment
                        ? <span className="text-amber-300/80">Paiement en cours de vérification, le site passe en ligne à la confirmation.</span>
                        : <span className="text-white/40">Publication : {price.original && <span className="line-through">{price.original.toLocaleString("fr-FR")}</span>} <Link href={`/payer/${site.id}`} className="font-semibold text-cyan-300 underline-offset-2 hover:underline">{price.monthly.toLocaleString("fr-FR")} FCFA/mois →</Link>{price.label && <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">🏷️ {price.label}</span>}</span>}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 p-4">
                  <p className="flex items-center gap-2 font-semibold"><Globe size={15} className="text-cyan-300" /> Domaine personnalisé</p>
                  <p className="mt-1 text-xs text-white/50">Utilisez votre propre domaine (ex. monentreprise.com) au lieu de l&apos;adresse .mbila.ca.</p>
                  {domains.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {domains.map((dom) => (
                        <div key={dom.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                          <span className="min-w-0 flex-1 truncate font-mono text-xs text-white/80">{dom.domain}</span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            dom.status === "actif" ? "bg-emerald-500/15 text-emerald-300"
                            : dom.status === "en_attente" ? "bg-amber-400/15 text-amber-300"
                            : dom.status === "desactive" ? "bg-white/10 text-white/45" : "bg-red-500/10 text-red-300"
                          }`}>
                            {dom.status === "actif" ? "en ligne" : dom.status === "en_attente" ? "en attente" : dom.status === "desactive" ? "désactivé" : "refusé"}
                          </span>
                        </div>
                      ))}
                      {domains.some((x) => x.status === "actif") && (
                        <p className="text-[11px] leading-relaxed text-white/35">Votre site répond déjà sur ce domaine, l&apos;adresse .mbila.ca reste active aussi.</p>
                      )}
                    </div>
                  ) : domSent ? (
                    <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300">
                      Demande envoyée ✓. On vous répond sur WhatsApp sous 24 h pour la suite (achat et configuration du domaine).
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <input
                        value={domInput}
                        onChange={(e) => setDomInput(e.target.value)}
                        placeholder="monentreprise.com"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/25 focus:border-cyan-400/60"
                      />
                      <button
                        onClick={() => {
                          const domain = domInput.trim();
                          if (!domain) return;
                          start(async () => {
                            const r = await requestDomain(site.id, domain);
                            if (!r?.ok) { setDomErr(r?.error ?? "Erreur"); return; }
                            setDomErr(""); setDomSent(true);
                            const msg = `Bonjour Mbila, je veux un domaine personnalisé pour mon site « ${d.name} » (${url}) : ${domain}`;
                            window.open(`https://wa.me/23672679175?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
                          });
                        }}
                        disabled={pending || !domInput.trim()}
                        className="w-full rounded-lg bg-cyan-500/15 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/25 disabled:opacity-40"
                      >
                        {pending ? "Envoi…" : "Demander ce domaine →"}
                      </button>
                      {domErr && <p className="text-xs text-red-300">{domErr}</p>}
                      <p className="text-[11px] leading-relaxed text-white/35">
                        La demande part chez Mbila : on vous contacte sur WhatsApp pour l&apos;achat du domaine et sa configuration. Rien à installer.
                      </p>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-red-500/20 p-4">
                  <p className="font-semibold text-red-300">Zone dangereuse</p>
                  <p className="mt-1 text-sm text-white/50">Supprimer définitivement ce site et ses messages.</p>
                  <button onClick={() => confirm("Supprimer définitivement ce site ?") && start(() => removeSite(site.id))} className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20"><Trash2 size={14} /> Supprimer le site</button>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Aperçu */}
        <section className="hidden flex-1 items-start justify-center overflow-y-auto bg-[#0b0b12] p-6 md:flex">
          <div className={`w-full transition-all duration-500 ${device === "mobile" ? "max-w-[390px]" : "max-w-6xl"}`}>
            <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-white/5 bg-[#12121c] px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="mx-auto truncate text-xs text-white/40">{host}</span>
              </div>
              {device === "desktop" ? (
                <ScaledFrame key="d" src={previewSrc} width={1440} ratio={0.7} interactive />
              ) : (
                <iframe key="m" src={previewSrc} title="Aperçu mobile" className="h-[760px] w-full border-0 bg-white" />
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Bouton aperçu fixe — mobile uniquement, toujours en bas à droite.
          L'aperçu se ferme par le ✕ en haut de l'overlay. */}
      {!previewOpen && (
        <button
          onClick={async () => { await flushDraft(); setPreviewOpen(true); }}
          className="brand-grad fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-fuchsia-500/30 md:hidden"
        >
          <Eye size={17} /> Aperçu
        </button>
      )}

      {/* Aperçu plein écran — mobile */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0b12] md:hidden">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <button onClick={() => setPreviewOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/5" aria-label="Fermer">
              <X size={18} />
            </button>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">{d.name}</p>
            <div className="flex rounded-full bg-white/5 p-1">
              {(["desktop", "mobile"] as const).map((x) => (
                <button key={x} onClick={() => setDevice(x)} className={`grid h-8 w-9 place-items-center rounded-full ${device === x ? "bg-white text-black" : "text-white/50"}`} aria-label={x}>
                  {x === "desktop" ? <Monitor size={15} /> : <Smartphone size={15} />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex min-h-0 flex-1 justify-center overflow-hidden">
            <div className={device === "mobile" ? "w-full max-w-[390px]" : "w-full"}>
              <iframe src={previewSrc} title="Aperçu" className="h-full w-full border-0 bg-white" />
            </div>
          </div>
        </div>
      )}

      {picker && (
        <ImagePicker
          stock={stock}
          category={d.category}
          uploads={uploads}
          onUploaded={(u) => setUploads((x) => [...u, ...x])}
          onPick={(s) => { picker(s); setPicker(null); }}
          onClose={() => setPicker(null)}
        />
      )}

      {showWelcome && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur" onClick={() => setShowWelcome(false)}>
          <div className="pop-in relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d15] p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="aurora brand-grad absolute -inset-20 opacity-20 blur-3xl" />
            <div className="relative">
              <PartyPopper className="mx-auto text-amber-300" size={44} />
              <h2 className="mt-5 font-display text-3xl font-bold">Votre site est en ligne !</h2>
              <p className="mt-3 text-white/60">Partagez votre lien avec vos clients :</p>
              <a href={url} target="_blank" className="mt-4 block truncate rounded-xl bg-white/5 px-4 py-3 font-semibold text-fuchsia-200 hover:bg-white/10">{host}</a>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <a href={`https://wa.me/?text=${encodeURIComponent(`Découvrez ${d.name} : ${url}`)}`} target="_blank" className="rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-black">WhatsApp</a>
                <button onClick={() => setShowWelcome(false)} className="rounded-xl bg-white py-3 text-sm font-semibold text-black">Personnaliser</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
