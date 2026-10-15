"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Calculator, Calendar, Camera, ChartColumn, Check, Clapperboard, Code, FileText, ImagePlus, Landmark, Loader2, Mail, Megaphone, MessageCircle,
  MonitorSmartphone, Palette, PenLine, PenTool, Phone, Plus, Ruler, Search, ShieldCheck, Smartphone, Sparkles, SquareKanban, Upload, Users, Wand2, Wrench, X,
} from "lucide-react";
import { checkSlug, createFromAnswers } from "@/app/actions";
import type { Answers, Currency } from "@/content/generate";
import type { AnimLevel, ColorPref, CtaType, Mood } from "@/templates/types";
import { EMAIL_OK, PHONE_OK } from "@/lib/validation";
import { FONT_PAIRS } from "@/templates/palettes";
import { FONT_LABELS, FX_LIST, FX_PRESETS, HERO_TEXT_MODES, type Fx, type HeroTextMode } from "@/templates/fx";
import { Rotator } from "@/templates/render/HeroRotator";
import Logo from "../Logo";
import { CAT_ICONS } from "./icons";

type Cat = { id: string; label: string; group: string; icon: string; search: string; cta: CtaType; preview: string[] };
type Spec = { id: string; label: string; role: string; works: { name: string; tag: string }[] };

const SPEC_ICONS: Record<string, typeof Palette> = {
  design: PenTool, uiux: MonitorSmartphone, dev: Code, photo: Camera,
  video: Clapperboard, art: Palette, redac: PenLine, arch: Ruler,
  mobile: Smartphone, data: ChartColumn, cyber: ShieldCheck, it: Wrench,
  compta: Calculator, finance: Landmark, rh: Users, gestion: SquareKanban, marketing: Megaphone,
};

const MOODS: { id: Mood; label: string; hint: string; sw: string[] }[] = [
  { id: "elegant", label: "Élégant", hint: "Raffiné, typographie serif", sw: ["#faf6f0", "#2b211a", "#c2562f"] },
  { id: "modern", label: "Moderne", hint: "Net, actuel, efficace", sw: ["#f6f9fc", "#0f1c2e", "#1d5fd1"] },
  { id: "bold", label: "Audacieux", hint: "Contrasté, qui claque", sw: ["#0b0c0d", "#c6f432", "#ff5a36"] },
  { id: "minimal", label: "Minimaliste", hint: "Épuré, beaucoup d'espace", sw: ["#ffffff", "#0b0b0c", "#9a9aa3"] },
  { id: "warm", label: "Chaleureux", hint: "Accueillant, tons chauds", sw: ["#f5efe6", "#8a5a2b", "#e9c46a"] },
  { id: "luxury", label: "Luxe", hint: "Sombre et doré, premium", sw: ["#0c0b09", "#c8a45c", "#f4efe6"] },
  { id: "playful", label: "Fun & coloré", hint: "Vif, joyeux, jeune", sw: ["#fff7f4", "#ef4a5f", "#2563eb"] },
  { id: "corporate", label: "Corporate", hint: "Sérieux, rassurant", sw: ["#f6f9fc", "#0f1c2e", "#14b8a6"] },
];

const COLORS: { id: ColorPref; label: string; sw: string[] }[] = [
  { id: "light", label: "Clair & lumineux", sw: ["#ffffff", "#f4f6f1", "#1f2a22"] },
  { id: "dark", label: "Sombre & intense", sw: ["#0c0b09", "#16140f", "#c8a45c"] },
  { id: "colorful", label: "Couleurs vives", sw: ["#fff7f4", "#ef4a5f", "#facc15"] },
  { id: "auto", label: "Surprenez-moi", sw: ["#7c5cff", "#ff5ea8", "#ffb347"] },
];

const ANIMS: { id: AnimLevel; label: string; hint: string }[] = [
  { id: "none", label: "Sobre", hint: "Aucune animation, sobre et rapide" },
  { id: "subtle", label: "Fluide", hint: "Apparitions douces au défilement" },
  { id: "rich", label: "Spectaculaire", hint: "Parallax, zoom, textes animés" },
];



const CURRENCIES: Currency[] = ["FCFA", "CAD", "EUR", "USD"];

const GEN_STEPS = [
  "Analyse de votre activité",
  "Rédaction de vos textes",
  "Sélection des images",
  "Composition des mises en page",
  "Harmonisation des couleurs",
  "Optimisation mobile",
  "Préparation de 3 propositions",
];

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);

const liveSlug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+/, "").slice(0, 30);

function Typed({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((x) => (x >= text.length ? (clearInterval(id), x) : x + 1)), 18);
    return () => clearInterval(id);
  }, [text]);
  return (
    <>
      {text.slice(0, n)}
      <span className={`ml-0.5 inline-block h-[1em] w-[3px] translate-y-1 bg-fuchsia-400 ${n >= text.length ? "animate-pulse" : ""}`} />
    </>
  );
}

// Mini-aperçu animé de chaque effet (réutilise les classes CSS réelles des sites)
const DEMO_VARS = { "--c-primary": "#8b5cf6", "--c-accent": "#f472b6", "--c-fg": "#ffffff", "--mx": "65%", "--my": "40%" } as React.CSSProperties;
function FxDemo({ id, imgs }: { id: Fx; imgs: string[] }) {
  const img = imgs[0];
  const box = "relative h-20 overflow-hidden rounded-xl bg-[#14121f]";
  switch (id) {
    case "aurora":
      return (
        <div className={box} style={DEMO_VARS}>
          <div className="fx-aurora absolute -left-4 top-0 h-16 w-20 rounded-full" style={{ background: "#8b5cf6", filter: "blur(16px)", opacity: 0.8, animationDuration: "6s" }} />
          <div className="fx-aurora absolute -right-4 bottom-0 h-16 w-20 rounded-full" style={{ background: "#f472b6", filter: "blur(16px)", opacity: 0.8, animationDuration: "6s", animationDelay: "-3s" }} />
        </div>
      );
    case "grid":
      return <div className={box} style={DEMO_VARS}><div className="fx-grid absolute inset-0" style={{ backgroundSize: "16px 16px" }} /></div>;
    case "particles":
      return (
        <div className={box} style={DEMO_VARS}>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="fx-dot absolute h-1 w-1 rounded-full" style={{ background: "#f472b6", left: `${(i * 37) % 95}%`, top: `${40 + ((i * 23) % 60)}%`, animationDelay: `${-i}s`, animationDuration: "5s" }} />
          ))}
        </div>
      );
    case "spotlight":
      return <div className={box} style={DEMO_VARS}><div className="fx-spot fxd-spot absolute inset-0" /></div>;
    case "grain":
      return <div className={`${box} bg-gradient-to-br from-violet-900 to-fuchsia-900`}><div className="fx-grain absolute inset-[-10%]" style={{ opacity: 0.35 }} /></div>;
    case "carousel":
      return (
        <div className={`${box} fxd-cycle`}>
          {imgs.slice(0, 3).map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s} src={s} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ animationDelay: `${i * 2 - 6}s` }} />
          ))}
        </div>
      );
    case "tilt":
      return (
        <div className={`${box} grid place-items-center [perspective:400px]`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img && <img src={img} alt="" className="fxd-tilt h-14 w-20 rounded-lg object-cover shadow-xl" />}
        </div>
      );
    case "reveal":
      // eslint-disable-next-line @next/next/no-img-element
      return <div className={box}>{img && <img src={img} alt="" className="fxd-reveal h-full w-full object-cover" />}</div>;
    case "bw":
      // eslint-disable-next-line @next/next/no-img-element
      return <div className={box}>{img && <img src={img} alt="" className="fxd-bw h-full w-full object-cover" />}</div>;
    case "shine":
      return (
        <div className={`${box} grid place-items-center`} style={DEMO_VARS}>
          <span className="fxd-shine font-display text-2xl font-bold">Titre</span>
        </div>
      );
    case "glow":
      return (
        <div className={`${box} grid place-items-center`} style={DEMO_VARS}>
          <span className="rounded-full px-4 py-1.5 text-xs font-semibold text-white" style={{ background: "#8b5cf6", animation: "fx-glow 2.6s ease-in-out infinite" }}>Contact</span>
        </div>
      );
  }
}

const card = (on: boolean) =>
  `relative rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-0.5 ${on ? "border-fuchsia-400/70 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"}`;
const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-400/60 focus:ring-4 focus:ring-fuchsia-500/10";

export default function Wizard({ user, categories, groups, domain, specs }: { user: { name: string; email: string }; categories: Cat[]; groups: string[]; domain: string; specs: Spec[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({
    category: "", name: "", city: "", description: "", specialty: "", specialtyText: "", works: [], moods: [], color: "auto", anim: "subtle",
    images: "stock", uploads: [], cta: "whatsapp", phone: "", whatsapp: "", email: user.email, currency: "FCFA",
    fonts: "auto", fx: [], heroText: "none",
  });
  const set = (p: Partial<Answers>) => setA((x) => ({ ...x, ...p }));
  const [q, setQ] = useState("");
  const [slug, setSlug] = useState("");
  const [slugState, setSlugState] = useState<{ ok: boolean; reason?: string; checking?: boolean }>({ ok: false });
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [gen, setGen] = useState(0);
  const [workInput, setWorkInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const workPhotoRef = useRef<HTMLInputElement>(null);
  const workPhotoFor = useRef<string | null>(null);

  const cat = categories.find((c) => c.id === a.category);
  const isPortfolio = a.category === "portfolio";
  const spec = specs.find((s) => s.id === a.specialty);

  const setEdu = (i: number, patch: Partial<{ title: string; school: string; year: string }>) =>
    set({ education: (a.education ?? []).map((e, j) => (j === i ? { ...e, ...patch } : e)) });

  const addWork = (name?: string) => {
    const n = (name ?? workInput).trim();
    if (!n || (a.works ?? []).includes(n)) return;
    set({ works: [...(a.works ?? []), n].slice(0, 6) });
    setWorkInput("");
  };
  const toggleWork = (n: string) =>
    set({ works: (a.works ?? []).includes(n) ? (a.works ?? []).filter((x) => x !== n) : [...(a.works ?? []), n].slice(0, 6) });

  const editSlug = (s: string) => {
    setSlug(s);
    setSlugState((x) => ({ ...x, checking: true }));
  };

  const filtered = useMemo(() => {
    const s = slugify(q).replace(/-/g, " ");
    return s ? categories.filter((c) => slugify(c.label + " " + c.search).replace(/-/g, " ").includes(s)) : categories;
  }, [q, categories]);

  // Champs de contact : tout champ rempli doit être valide
  const contactOk =
    (!a.phone || PHONE_OK(a.phone)) &&
    (!a.whatsapp || PHONE_OK(a.whatsapp)) &&
    (!a.email || EMAIL_OK(a.email));

  const STEPS: { key: string; q: string; ok: boolean }[] = [
    { key: "cat", q: `Bonjour ${user.name} ! Quelle est votre activité ?`, ok: !!a.category },
    {
      key: "name",
      q: isPortfolio
        ? "Parfait, un portfolio ! Quels sont vos noms et prénoms, et où êtes-vous ?"
        : `Super, ${cat?.label.toLowerCase() ?? "votre activité"} ! Comment s'appelle-t-elle, et où êtes-vous ?`,
      ok: a.name.trim().length >= 2,
    },
    ...(isPortfolio
      ? [
          { key: "spec", q: `${a.name.trim().split(" ")[0] || "Parfait"}, quel est votre domaine de spécialité ?`, ok: !!a.specialty },
          { key: "works", q: "Quelles réalisations voulez-vous mettre en avant ?", ok: true },
          { key: "edu", q: "Votre formation ? (facultatif)", ok: true },
        ]
      : []),
    { key: "desc", q: "En une phrase, qu'est-ce qui vous rend unique ?", ok: true },
    { key: "mood", q: "Quelle ambiance voulez-vous dégager ? (1 ou 2 choix)", ok: a.moods.length > 0 },
    { key: "color", q: "Plutôt clair, sombre ou coloré ?", ok: true },
    { key: "fonts", q: "Quelle typographie vous ressemble ?", ok: true },
    { key: "anim", q: "Quel niveau d'animation pour votre site ?", ok: true },
    { key: "fx", q: "Envie d'effets ? Basique, premium ou audacieux : à vous de voir.", ok: true },
    {
      key: "img",
      q: isPortfolio ? "Ajoutez votre photo : elle sera en grand sur votre portfolio." : "Pour les images, on fait comment ?",
      ok: isPortfolio ? (a.uploads?.length ?? 0) >= 1 : a.images === "stock" || (a.uploads?.length ?? 0) > 0,
    },
    { key: "cta", q: "Vos coordonnées de contact", ok: contactOk && PHONE_OK(a.whatsapp || a.phone || "") },
    { key: "slug", q: "Dernière étape : choisissez l'adresse de votre site.", ok: slugState.ok && !slugState.checking },
  ];
  const cur = STEPS[step];
  const generating = step === STEPS.length;
  const onSlugStep = cur?.key === "slug";

  useEffect(() => {
    if (!onSlugStep || !slug) return;
    const id = setTimeout(async () => {
      const r = await checkSlug(slug);
      setSlugState({ ok: r.ok, reason: r.reason });
    }, 350);
    return () => clearTimeout(id);
  }, [slug, onSlugStep]);

  const fxOn = (id: Fx) => (a.fx ?? []).includes(id);
  const toggleFx = (id: Fx) => set({ fx: fxOn(id) ? (a.fx ?? []).filter((x) => x !== id) : [...(a.fx ?? []), id] });
  const presetActive = (p: { fx: Fx[]; text?: HeroTextMode }) =>
    p.fx.length === (a.fx ?? []).length && p.fx.every(fxOn) && (p.text ?? "none") === (a.heroText ?? "none");

  const next = () => {
    if (!cur?.ok) return;
    if (cur.key === "slug") return generate();
    // Adresse : préremplie depuis la landing ou le nom
    if (cur.key === "cta" && !slug) editSlug(localStorage.getItem("mbila:slug") || slugify(a.name));
    setStep((s) => s + 1);
  };

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setErr("");
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) return setErr(j.error ?? "Échec de l'envoi");
    set({ uploads: [...(a.uploads ?? []), ...j.urls].slice(0, 12) });
  }

  async function generate() {
    setStep(STEPS.length);
    setGen(0);
    const t0 = Date.now();
    const timer = setInterval(() => setGen((g) => Math.min(g + 1, GEN_STEPS.length - 1)), 950);
    let r: Awaited<ReturnType<typeof createFromAnswers>> | null = null;
    try {
      r = await createFromAnswers(a, slug);
    } catch {
      // L'action serveur a planté : on sort du spinner et on affiche l'erreur
    }
    const wait = Math.max(0, GEN_STEPS.length * 950 - (Date.now() - t0));
    await new Promise((res) => setTimeout(res, wait));
    clearInterval(timer);
    if (!r) {
      setErr("La génération a échoué. Réessayez dans un instant.");
      setStep(STEPS.length - 1);
      return;
    }
    if ("error" in r && r.error) {
      setErr(r.error);
      setStep(STEPS.length - 1);
      return;
    }
    setGen(GEN_STEPS.length);
    localStorage.removeItem("mbila:slug");
    setTimeout(() => router.push(`/creer/choix/${(r as { id: number }).id}`), 600);
  }

  // Entrée = suivant (hors textarea)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement) && step !== 0) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  if (generating)
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#07070c] px-6 text-white">
        <div className="aurora absolute h-[700px] w-[700px] rounded-full bg-gradient-to-r from-violet-600/40 via-fuchsia-500/30 to-amber-400/20 blur-[120px]" />
        <div className="relative w-full max-w-md text-center">
          <div className="relative mx-auto h-28 w-28">
            <div className="brand-grad absolute inset-0 animate-spin rounded-full [animation-duration:3s] [mask:radial-gradient(farthest-side,transparent_calc(100%-4px),black_calc(100%-3px))]" />
            <div className="absolute inset-3 grid place-items-center rounded-full bg-white/5 backdrop-blur">
              <Wand2 className="text-fuchsia-300" size={34} />
            </div>
          </div>
          <h1 className="mt-10 font-display text-3xl font-bold">Création de <span className="brand-text">{a.name}</span></h1>
          <p className="mt-3 text-white/50">Notre moteur conçoit votre site sur-mesure…</p>
          <ul className="mt-10 space-y-3 text-left">
            {GEN_STEPS.map((s, i) => (
              <li key={s} className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500 ${i <= gen ? "bg-white/5 opacity-100" : "opacity-30"}`}>
                {i < gen ? (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400 text-black"><Check size={14} strokeWidth={3} /></span>
                ) : i === gen ? (
                  <Loader2 className="animate-spin text-fuchsia-300" size={24} />
                ) : (
                  <span className="h-6 w-6 rounded-full border border-white/20" />
                )}
                <span className="text-sm">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070c] text-white">
      <div className="aurora pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/25 via-fuchsia-500/20 to-amber-400/10 blur-[120px]" />
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Logo />
        <span className="text-sm text-white/40">Étape {step + 1} / {STEPS.length}</span>
      </header>
      <div className="relative z-10 mx-auto h-1 max-w-3xl overflow-hidden rounded-full bg-white/5">
        <div className="brand-grad h-full rounded-full transition-all duration-700" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-40 pt-12">
        <div className="flex items-start gap-4">
          <div className="brand-grad grid h-11 w-11 shrink-0 place-items-center rounded-2xl shadow-lg shadow-fuchsia-500/30"><Wand2 size={20} /></div>
          <h1 className="pt-1 font-display text-2xl font-semibold leading-snug md:text-3xl"><Typed key={step} text={cur.q} /></h1>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-white/35">
          <PenLine size={13} className="shrink-0" />
          Pas de stress — tout est modifiable ensuite dans votre éditeur : textes, images, couleurs, tout.
        </p>

        <div key={step} className="pop-in mt-10" style={{ animationDelay: "250ms" }}>
          {cur.key === "cat" && (
            <div>
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher : restaurant, école, boutique, coiffure…" className={`${input} pl-12`} />
              </div>
              {groups.map((g) => {
                const list = filtered.filter((c) => c.group === g);
                if (!list.length) return null;
                return (
                  <div key={g} className="mb-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">{g}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {list.map((c) => {
                        const Icon = CAT_ICONS[c.icon] ?? CAT_ICONS.star;
                        return (
                          <button key={c.id} onClick={() => { set({ category: c.id, cta: "whatsapp" }); setTimeout(() => setStep(1), 250); }} className={`${card(a.category === c.id)} flex items-center gap-3 !p-4`}>
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-fuchsia-300"><Icon size={20} /></span>
                            <span className="text-sm font-medium leading-tight">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {cur.key === "name" && (
            <div className="space-y-4">
              <input
                autoFocus
                value={a.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder={isPortfolio ? "Votre prénom et nom (ex : Awa Koné)" : "Nom de votre activité (ex : Le Baobab Gourmand)"}
                className={`${input} text-lg`}
              />
              {isPortfolio && <p className="text-sm text-zinc-400">Tel qu&apos;il apparaîtra en grand sur votre portfolio.</p>}
              <div className={`grid gap-4 ${isPortfolio ? "" : "sm:grid-cols-[1fr_auto]"}`}>
                <input value={a.city} onChange={(e) => set({ city: e.target.value })} placeholder="Ville (ex : Abidjan, Montréal…)" className={input} />
                {!isPortfolio && (
                  <select value={a.currency} onChange={(e) => set({ currency: e.target.value as Currency })} className={`${input} sm:w-40`} aria-label="Devise">
                    {CURRENCIES.map((c) => <option key={c} value={c} className="bg-[#07070c]">{c}</option>)}
                  </select>
                )}
              </div>
            </div>
          )}

          {cur.key === "spec" && (
            <div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {specs.map((s) => {
                  const Icon = SPEC_ICONS[s.id] ?? Palette;
                  const on = a.specialty === s.id;
                  return (
                    <button key={s.id} onClick={() => set({ specialty: s.id, works: [] })} className={card(on)}>
                      <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-fuchsia-300"><Icon size={20} /></span>
                      <p className="text-sm font-semibold leading-tight">{s.label}</p>
                      {on && <Check className="absolute right-3 top-3 text-fuchsia-300" size={18} />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  value={a.specialtyText ?? ""}
                  onChange={(e) => set({ specialtyText: e.target.value, specialty: e.target.value.trim() ? "custom" : a.specialty === "custom" ? "" : a.specialty })}
                  placeholder="Autre domaine ? Écrivez-le ici (ex : UI/UX pour la santé)…"
                  className={`${input} ${a.specialty === "custom" ? "!border-fuchsia-400/60 !ring-4 !ring-fuchsia-500/10" : ""}`}
                />
                <button onClick={() => set({ specialty: "auto", works: [] })} className={`${card(a.specialty === "auto")} flex items-center justify-center gap-2 !px-6`}>
                  <Sparkles size={16} className="text-fuchsia-300" /> Me surprendre
                </button>
              </div>
            </div>
          )}

          {cur.key === "edu" && (
            <div>
              <p className="mb-4 text-sm text-white/45">Diplômes, certifications, écoles… Ajoutez-en autant que vous voulez, ou passez cette étape.</p>
              <div className="space-y-3">
                {(a.education ?? []).map((e, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-[1.4fr_1.2fr_0.6fr_auto]">
                    <input value={e.title} onChange={(ev) => setEdu(i, { title: ev.target.value })} placeholder="Diplôme / formation (ex : Licence en informatique)" className={input} />
                    <input value={e.school} onChange={(ev) => setEdu(i, { school: ev.target.value })} placeholder="Établissement" className={input} />
                    <input value={e.year} onChange={(ev) => setEdu(i, { year: ev.target.value })} placeholder="Année" className={input} />
                    <button onClick={() => set({ education: (a.education ?? []).filter((_, j) => j !== i) })} aria-label="Retirer" className="grid place-items-center rounded-xl border border-white/10 px-3 text-white/50 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {(a.education?.length ?? 0) < 6 && (
                <button
                  onClick={() => set({ education: [...(a.education ?? []), { title: "", school: "", year: "" }] })}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-3 text-sm text-white/60 transition hover:border-white/30 hover:text-white"
                >
                  <Plus size={16} /> Ajouter une formation
                </button>
              )}
            </div>
          )}

          {cur.key === "works" && (
            <div>
              {spec && (
                <div className="mb-7">
                  <p className="mb-3 text-sm text-white/45">Suggestions pour {spec.role.toLowerCase()} · touchez pour sélectionner :</p>
                  <div className="flex flex-wrap gap-2">
                    {spec.works.map((w) => {
                      const on = (a.works ?? []).includes(w.name);
                      return (
                        <button key={w.name} onClick={() => toggleWork(w.name)} className={`rounded-full border px-4 py-2 text-sm transition ${on ? "border-fuchsia-400/70 bg-fuchsia-500/15 text-white" : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/30"}`}>
                          {on && <Check size={13} className="mr-1.5 inline -translate-y-px text-fuchsia-300" />}{w.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <input
                  value={workInput}
                  onChange={(e) => setWorkInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); addWork(); } }}
                  placeholder="Nom d'un projet (ex : Refonte site Hôtel Royal)"
                  className={input}
                />
                <button onClick={() => addWork()} disabled={!workInput.trim()} className="brand-grad shrink-0 rounded-xl px-5 font-semibold disabled:opacity-30"><Plus size={18} /></button>
              </div>
              {(a.works?.length ?? 0) > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {a.works!.map((w) => (
                    <span key={w} className="flex items-center gap-2 rounded-full bg-fuchsia-500/15 px-4 py-2 text-sm">
                      {a.workImages?.[w] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.workImages[w]} alt="" className="h-6 w-6 rounded-full object-cover" />
                      )}
                      {w}
                      <button
                        onClick={() => { workPhotoFor.current = w; workPhotoRef.current?.click(); }}
                        title={a.workImages?.[w] ? "Changer la photo" : "Ajouter une photo du projet"}
                        aria-label="Photo du projet"
                        className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
                      >
                        {a.workImages?.[w] ? <Check size={12} className="text-emerald-300" /> : <ImagePlus size={13} />}
                      </button>
                      <button onClick={() => toggleWork(w)} aria-label="Retirer"><X size={14} className="text-white/50 hover:text-white" /></button>
                    </span>
                  ))}
                </div>
              )}
              {a.works?.some((w) => a.workImages?.[w]) && <p className="mt-2 text-xs text-white/40">Les photos attachées apparaîtront sur la fiche du projet.</p>}
              <p className="mt-5 text-sm text-white/40">Jusqu&apos;à 6 projets. Laissez vide, nous générerons une sélection adaptée à votre domaine.</p>
              {/* Photo optionnelle par projet */}
              <input ref={workPhotoRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={async (e) => {
                const w = workPhotoFor.current;
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!w || !f) return;
                setUploading(true);
                const fd = new FormData(); fd.append("files", f);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                const j = await res.json().catch(() => ({}));
                setUploading(false);
                if (res.ok && j.urls?.[0]) set({ workImages: { ...(a.workImages ?? {}), [w]: j.urls[0] } });
                else setErr(j.error ?? "Échec de l'envoi de la photo");
              }} />
            </div>
          )}

          {cur.key === "desc" && (
            <div>
              <textarea autoFocus rows={3} maxLength={220} value={a.description} onChange={(e) => set({ description: e.target.value })} placeholder="Ex : Des plats maison généreux, préparés chaque jour avec des produits frais du marché." className={input} />
              <p className="mt-3 text-sm text-white/40">Optionnel : si vous passez, nous rédigeons une accroche pour vous.</p>
            </div>
          )}

          {cur.key === "mood" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {MOODS.map((m) => {
                const on = a.moods.includes(m.id);
                return (
                  <button key={m.id} onClick={() => set({ moods: on ? a.moods.filter((x) => x !== m.id) : [...a.moods, m.id].slice(-2) })} className={card(on)}>
                    <div className="mb-4 flex h-14 overflow-hidden rounded-lg">
                      {m.sw.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}
                    </div>
                    <p className="font-semibold">{m.label}</p>
                    <p className="mt-1 text-xs text-white/45">{m.hint}</p>
                    {on && <Check className="absolute right-3 top-3 text-fuchsia-300" size={18} />}
                  </button>
                );
              })}
            </div>
          )}

          {cur.key === "color" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {COLORS.map((c) => (
                <button key={c.id} onClick={() => set({ color: c.id })} className={`${card(a.color === c.id)} flex items-center gap-5`}>
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl" style={{ background: c.sw[0] }}>
                    <span className="absolute bottom-2 left-2 h-6 w-6 rounded-full" style={{ background: c.sw[1] }} />
                    <span className="absolute right-2 top-2 h-5 w-8 rounded-md" style={{ background: c.sw[2] }} />
                  </div>
                  <span className="text-lg font-semibold">{c.label}</span>
                </button>
              ))}
            </div>
          )}

          {cur.key === "fonts" && (
            <div className="grid gap-3 sm:grid-cols-3">
              <button onClick={() => set({ fonts: "auto" })} className={`${card(a.fonts === "auto")} flex flex-col justify-center`}>
                <Sparkles className="mb-3 text-fuchsia-300" size={26} />
                <p className="font-semibold">Laissez Mbila choisir</p>
                <p className="mt-1 text-xs text-white/45">La typographie idéale pour chaque design</p>
              </button>
              {FONT_PAIRS.map((f) => (
                <button key={f.id} onClick={() => set({ fonts: f.id })} className={card(a.fonts === f.id)}>
                  <p className={`text-3xl leading-none ${f.headUpper ? "uppercase" : ""}`} style={{ fontFamily: f.head }}>
                    {a.name.trim().split(" ")[0] || "Aa"}
                  </p>
                  <p className={`mt-2 text-lg leading-tight text-white/90 ${f.headUpper ? "uppercase" : ""}`} style={{ fontFamily: f.head }}>Un titre qui marque</p>
                  <p className="mt-1.5 text-xs text-white/45" style={{ fontFamily: f.body }}>Un texte lisible et agréable.</p>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-fuchsia-300/80">{FONT_LABELS[f.id] ?? f.id}</p>
                </button>
              ))}
            </div>
          )}

          {cur.key === "fx" && (
            <div>
              <div className="grid gap-3 sm:grid-cols-3">
                {FX_PRESETS.map((p) => (
                  <button key={p.id} onClick={() => set({ fx: p.fx, heroText: p.text ?? "none" })} className={card(presetActive(p))}>
                    <p className="text-lg font-semibold">{p.label}</p>
                    <p className="mt-1 text-xs text-white/45">{p.hint}</p>
                    <p className="mt-3 text-[11px] text-fuchsia-300/80">
                      {p.fx.length ? `${p.fx.length} effets` : "Aucun effet"}{p.text ? " + texte animé" : ""}
                    </p>
                  </button>
                ))}
              </div>
              <div className="mt-7">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Texte changeant dans l&apos;accueil</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <button onClick={() => set({ heroText: "none" })} className={`${card(a.heroText === "none")} !p-3`}>
                    <div className="grid h-20 place-items-center rounded-xl bg-[#14121f] text-sm text-white/35">Titre fixe</div>
                    <p className="mt-2.5 text-sm font-semibold">Aucun</p>
                    <p className="text-[11px] leading-snug text-white/45">Sobre, texte statique</p>
                  </button>
                  {HERO_TEXT_MODES.map((m) => (
                    <button key={m.id} onClick={() => set({ heroText: m.id })} className={`${card(a.heroText === m.id)} !p-3`}>
                      <div className="grid h-20 place-items-center overflow-hidden rounded-xl bg-[#14121f] font-display text-xl font-bold text-fuchsia-300">
                        <Rotator mode={m.id} words={["Unique", "Moderne", "Pro"]} />
                      </div>
                      <p className="mt-2.5 text-sm font-semibold">{m.label}</p>
                      <p className="text-[11px] leading-snug text-white/45">{m.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
              {(["Fonds animés", "Images", "Textes & boutons"] as const).map((g) => (
                <div key={g} className="mt-7">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">{g}</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {FX_LIST.filter((f) => f.group === g).map((f) => (
                      <button key={f.id} onClick={() => toggleFx(f.id)} className={`${card(fxOn(f.id))} !p-3`}>
                        {fxOn(f.id) && <span className="absolute right-1.5 top-1.5 z-10 grid h-5 w-5 place-items-center rounded-full bg-fuchsia-500 shadow-lg"><Check size={12} /></span>}
                        <FxDemo id={f.id} imgs={cat?.preview ?? []} />
                        <p className="mt-2.5 text-sm font-semibold">{f.label}</p>
                        <p className="text-[11px] leading-snug text-white/45">{f.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {cur.key === "anim" && (
            <div className="grid gap-3 sm:grid-cols-3">
              {ANIMS.map((x) => (
                <button key={x.id} onClick={() => set({ anim: x.id })} className={card(a.anim === x.id)}>
                  <div className={`anim-demo anim-${x.id} mb-5 h-28 overflow-hidden rounded-xl bg-white/5 p-3`}>
                    <div className="ad-bar h-3 w-2/3 rounded bg-white/40" />
                    <div className="ad-bar mt-2 h-2 w-1/2 rounded bg-white/20" />
                    <div className="mt-3 flex gap-2">
                      <div className="ad-box h-12 flex-1 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                      <div className="ad-box h-12 flex-1 rounded-lg bg-gradient-to-br from-fuchsia-500 to-amber-400" />
                    </div>
                  </div>
                  <p className="font-semibold">{x.label}</p>
                  <p className="mt-1 text-xs text-white/45">{x.hint}</p>
                </button>
              ))}
            </div>
          )}

          {cur.key === "img" && (
            <div>
              {isPortfolio ? (
                /* Portfolio : la photo du client est obligatoire — elle devient le visage du site */
                <div>
                  <div className={card(true)}>
                    <div className="flex items-center gap-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-200"><ImagePlus size={26} /></span>
                      <div>
                        <p className="font-semibold">Votre photo <span className="text-fuchsia-300">(obligatoire)</span></p>
                        <p className="mt-1 text-sm text-white/45">Portrait ou photo de vous au travail, c&apos;est elle qui accueillera vos visiteurs. Ajoutez aussi des photos de vos réalisations si vous en avez.</p>
                      </div>
                    </div>
                    {!(a.uploads?.length ?? 0) && (
                      <button onClick={() => fileRef.current?.click()} className="brand-grad mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition hover:brightness-110">
                        <Upload size={16} /> Choisir ma photo
                      </button>
                    )}
                  </div>
                </div>
              ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => set({ images: "stock" })} className={card(a.images === "stock")}>
                  <div className="mb-4 grid h-24 grid-cols-3 gap-1.5 overflow-hidden rounded-xl">
                    {cat?.preview.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" className="h-full w-full object-cover" />
                    ))}
                  </div>
                  <p className="flex items-center gap-2 font-semibold"><Wand2 size={16} className="text-fuchsia-300" /> Générez-les pour moi</p>
                  <p className="mt-1 text-sm text-white/45">Photos professionnelles adaptées à votre métier.</p>
                </button>
                <button onClick={() => { set({ images: "own" }); if (!a.uploads?.length) fileRef.current?.click(); }} className={card(a.images === "own")}>
                  <div className="mb-4 grid h-24 place-items-center rounded-xl border border-dashed border-white/20 bg-white/[0.02]">
                    <ImagePlus className="text-white/40" size={30} />
                  </div>
                  <p className="flex items-center gap-2 font-semibold"><Upload size={16} className="text-fuchsia-300" /> J&apos;ai mes propres photos</p>
                  <p className="mt-1 text-sm text-white/45">Vos produits, votre équipe, vos locaux.</p>
                </button>
              </div>
              )}
              <button onClick={() => toggleFx("carousel")} className={`${card(fxOn("carousel"))} mt-3 flex w-full items-center gap-4`}>
                <div className="fxd-cycle relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                  {(a.images === "own" && a.uploads?.length ? a.uploads : cat?.preview ?? []).slice(0, 3).map((s, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={s} src={s} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ animationDelay: `${i * 2 - 6}s` }} />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Carrousel d&apos;images dans l&apos;accueil</p>
                  <p className="text-sm text-white/45">Plusieurs photos défilent en fondu en haut de votre site.</p>
                </div>
                <span className={`grid h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${fxOn("carousel") ? "bg-fuchsia-500" : "bg-white/15"}`}>
                  <span className={`h-5 w-5 rounded-full bg-white transition ${fxOn("carousel") ? "translate-x-5" : ""}`} />
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => upload(e.target.files)} />
              {(a.images === "own" || isPortfolio) && (
                <div className="mt-6">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {a.uploads?.map((u) => (
                      <div key={u} className="group relative aspect-square overflow-hidden rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="" className="h-full w-full object-cover" />
                        <button onClick={() => set({ uploads: a.uploads?.filter((x) => x !== u) })} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 opacity-0 transition group-hover:opacity-100" aria-label="Retirer"><X size={14} /></button>
                      </div>
                    ))}
                    <button onClick={() => fileRef.current?.click()} className="grid aspect-square place-items-center rounded-xl border border-dashed border-white/20 text-white/40 transition hover:border-fuchsia-400/60 hover:text-white">
                      {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-white/40">{isPortfolio ? "La 1re photo sera votre portrait en haut du site ; les suivantes illustrent vos projets. Nous complétons avec des photos pro si besoin." : "La 1re photo sera l'image principale. Nous complétons avec des photos pro si besoin."}</p>
                  {err && <p className="mt-2 text-sm text-red-300">{err}</p>}
                </div>
              )}
            </div>
          )}

          {cur.key === "cta" && (
            <div>
              {/* Le contact client passe toujours par WhatsApp : pas de choix de canal */}
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] px-4 py-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#25D366]/15 text-[#25D366]"><MessageCircle size={19} /></span>
                <div>
                  <p className="text-sm font-semibold">Vos clients vous contacteront sur WhatsApp</p>
                  <p className="text-xs text-white/45">Le bouton de contact de votre site ouvrira une conversation WhatsApp avec votre numéro.</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input value={a.phone} onChange={(e) => set({ phone: e.target.value })} inputMode="tel" placeholder="Téléphone (ex : +237 6 99 00 00 00)" className={`${input} ${a.phone && !PHONE_OK(a.phone) ? "border-red-400/60" : ""}`} />
                <input value={a.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} inputMode="tel" placeholder="WhatsApp (si différent)" className={`${input} ${a.whatsapp && !PHONE_OK(a.whatsapp) ? "border-red-400/60" : ""}`} />
                <input value={a.email} onChange={(e) => set({ email: e.target.value })} type="email" placeholder="Email de contact" className={`${input} sm:col-span-2 ${a.email && !EMAIL_OK(a.email) ? "border-red-400/60" : ""}`} />
              </div>
              {(a.phone && !PHONE_OK(a.phone)) || (a.whatsapp && !PHONE_OK(a.whatsapp)) ? (
                <p className="mt-3 text-sm text-red-300">Numéro invalide : 7 à 15 chiffres (ex : +237 6 99 00 00 00)</p>
              ) : a.email && !EMAIL_OK(a.email) ? (
                <p className="mt-3 text-sm text-red-300">Adresse email invalide</p>
              ) : null}
            </div>
          )}

          {cur.key === "slug" && (
            <div>
              <div className={`flex items-center rounded-2xl border bg-white/5 px-5 py-4 text-lg transition ${slugState.ok ? "border-emerald-400/50" : slug ? "border-red-400/40" : "border-white/10"}`}>
                <span className="text-white/40">https://</span>
                <input autoFocus value={slug} onChange={(e) => editSlug(liveSlug(e.target.value))} className="min-w-0 flex-1 bg-transparent text-right font-semibold outline-none" />
                <span className="text-white/40">.{domain}</span>
              </div>
              <p className={`mt-3 flex items-center gap-2 text-sm ${slugState.checking ? "text-white/40" : slugState.ok ? "text-emerald-300" : "text-red-300"}`}>
                {slugState.checking ? <><Loader2 size={14} className="animate-spin" /> Vérification…</> : slugState.ok ? <><Check size={14} /> Adresse disponible !</> : slugState.reason}
              </p>
              {err && <p className="mt-2 text-sm text-red-300">{err}</p>}
              <p className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-xs leading-relaxed text-emerald-100/80">
                <ShieldCheck size={14} className="mr-1.5 -mt-0.5 inline" />
                Aucune crainte : après la génération, vous pourrez tout retoucher depuis votre éditeur — textes, images, couleurs, coordonnées. Rien n&apos;est définitif.
              </p>
            </div>
          )}
        </div>
      </main>

      {step > 0 && (
        <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-white/5 bg-[#07070c]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">
              <ArrowLeft size={16} /> Retour
            </button>
            <div className="flex items-center gap-3">
              {((cur.key === "desc" && !a.description) || cur.key === "works" || cur.key === "edu") && <button onClick={() => setStep((s) => s + 1)} className="text-sm text-white/50 hover:text-white">Passer</button>}
              <button onClick={next} disabled={!cur.ok} className="brand-grad rounded-full px-8 py-3 text-sm font-semibold shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30">
                {cur.key === "slug" ? "Générer mon site ✦" : "Continuer →"}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
