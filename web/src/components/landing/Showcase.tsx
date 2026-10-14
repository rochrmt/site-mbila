"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScaledFrame from "../ScaledFrame";

// slug présent = vrai site client (aperçu live) ; mobile = capture téléphone du modèle disponible
type Item = { id: string; name: string; label: string; slug?: string; mobile?: boolean };

const AUTO_MS = 3600; // durée d'affichage de chaque site
const PHONE = 16 / 9; // écran de la maquette téléphone (mobile) : 9/16

// Préférence « réduire les animations » (lue sans setState dans un effet)
const RM = "(prefers-reduced-motion: reduce)";
const subscribeRM = (cb: () => void) => {
  const mq = matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const setVars = (el: HTMLElement | null, vars: Record<string, string>) => {
  if (el) for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
};

// États d'une slide : la suivante se révèle en « rideau » par le bas, la précédente recule floutée
type State = "on" | "past" | "next";
const WIPE = "cubic-bezier(.65,0,.35,1)";
const OUT = "cubic-bezier(.16,1,.3,1)";
const SLIDE: Record<State, CSSProperties> = {
  on: { opacity: 1, transform: "translateY(0) scale(1)", clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px) brightness(1)", zIndex: 2 },
  past: { opacity: 0, transform: "translateY(-9%) scale(.9)", clipPath: "inset(0% 0% 0% 0%)", filter: "blur(12px) brightness(.45)", zIndex: 1 },
  next: { opacity: 1, transform: "translateY(7%) scale(1.16)", clipPath: "inset(100% 0% 0% 0%)", filter: "blur(0px) brightness(1.25)", zIndex: 3 },
};
const TRANS: Record<State, string> = {
  on: `clip-path .9s ${WIPE}, transform 1.1s ${OUT}, filter .7s ease, opacity .7s ease`,
  // l'ancien site reste visible un instant sous le rideau, puis recule
  past: `clip-path .9s ${WIPE}, transform 1.1s ${OUT} .15s, filter .8s ease .25s, opacity .8s ease .25s`,
  next: `clip-path .9s ${WIPE}, transform 1.1s ${OUT}, filter .7s ease, opacity .7s ease`,
};

const Lock = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 118 0v4" /></svg>
);

// Ordinateur : navigateur factice incliné qui suit la souris.
// Mobile : téléphone qui affiche la version mobile des sites — glisser pour changer, inclinaison sous le doigt / gyroscope.
export default function Showcase({ items }: { items: Item[] }) {
  const n = items.length;
  const reduced = useSyncExternalStore(subscribeRM, () => matchMedia(RM).matches, () => false);
  const [{ i, prev, dir, t }, setPos] = useState({ i: 0, prev: -1, dir: 1, t: 0 });
  const [paused, setPaused] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number; dx: number; h: boolean | null } | null>(null);

  const show = (k: number) => setPos((p) => (k === p.i ? p : { i: k, prev: p.i, dir: k > p.i ? 1 : -1, t: p.t + 1 }));
  const step = (d: number) =>
    setPos((p) => {
      const k = (p.i + d + n) % n;
      return { i: k, prev: p.i, dir: k > p.i ? 1 : -1, t: p.t + 1 };
    });

  // Défilement de la page → la maquette se redresse en arrivant à l'écran (n'empêche jamais de défiler)
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const update = () => {
      const s = stage.current;
      if (!s) return;
      const top = s.getBoundingClientRect().top;
      setVars(s, { "--sc-enter": Math.min(1, Math.max(0, 1 - (top - innerHeight * 0.15) / (innerHeight * 0.7))).toFixed(3) });
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  // Mobile : le téléphone s'incline avec l'appareil (gyroscope).
  // iOS exige une autorisation explicite : activé seulement là où elle n'est pas requise (Android).
  useEffect(() => {
    if (reduced || !matchMedia("(pointer: coarse)").matches) return;
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    if (!DOE || typeof DOE.requestPermission === "function") return;
    let raf = 0;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (touch.current || e.gamma == null || e.beta == null) return;
      const gx = Math.max(-0.5, Math.min(0.5, e.gamma / 50));
      const gy = Math.max(-0.5, Math.min(0.5, (e.beta - 50) / 50));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVars(stage.current, { "--sc-mx": gx.toFixed(3), "--sc-my": gy.toFixed(3) }));
    };
    addEventListener("deviceorientation", onOrient);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("deviceorientation", onOrient);
    };
  }, [reduced]);

  // Ordinateur : inclinaison + reflet qui suivent la souris (et pause de la rotation au survol)
  const onMove = (e: PointerEvent) => {
    if (reduced || e.pointerType !== "mouse" || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    setVars(stage.current, {
      "--sc-mx": ((e.clientX - r.left) / r.width - 0.5).toFixed(3),
      "--sc-my": ((e.clientY - r.top) / r.height - 0.5).toFixed(3),
      "--sc-glare": "1",
    });
  };
  const reset = () => setVars(stage.current, { "--sc-mx": "0", "--sc-my": "0", "--sc-glare": "0" });

  // Mobile : glisser à gauche / à droite pour changer de site, le téléphone pivote sous le doigt
  const onTouchStart = (e: TouchEvent) => {
    const p = e.touches[0];
    touch.current = { x: p.clientX, y: p.clientY, dx: 0, h: null };
    setPaused(true);
  };
  const onTouchMove = (e: TouchEvent) => {
    const s = touch.current;
    if (!s) return;
    const p = e.touches[0];
    const dx = p.clientX - s.x;
    const dy = p.clientY - s.y;
    if (s.h === null && Math.abs(dx) + Math.abs(dy) > 10) s.h = Math.abs(dx) > Math.abs(dy);
    if (!s.h) return;
    s.dx = dx;
    if (!reduced) setVars(stage.current, { "--sc-mx": Math.max(-0.5, Math.min(0.5, dx / (stage.current?.clientWidth || 320))).toFixed(3), "--sc-glare": "1" });
  };
  const onTouchEnd = () => {
    const s = touch.current;
    touch.current = null;
    setPaused(false);
    reset();
    if (s?.h && Math.abs(s.dx) > 40) step(s.dx < 0 ? 1 : -1);
  };

  const cur = items[i];
  const card: CSSProperties = reduced
    ? { touchAction: "pan-y" }
    : {
        touchAction: "pan-y",
        transform:
          "perspective(1600px) rotateX(calc((1 - var(--sc-enter, 1)) * 14deg + var(--sc-my, 0) * -11deg)) rotateY(calc(var(--sc-mx, 0) * 15deg))",
        transition: "transform .25s ease-out",
      };

  return (
    <div
      ref={stage}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setPaused(true); }}
      onPointerMove={onMove}
      onPointerLeave={() => { setPaused(false); reset(); }}
      className="group relative mx-auto w-full max-w-5xl"
    >
      <div className="relative">
        {/* Lueur d'arrière-plan : sa teinte change à chaque site */}
        <div
          className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-tr from-violet-600/30 via-fuchsia-500/20 to-amber-400/20"
          style={{ filter: `blur(64px) hue-rotate(${i * 47}deg)`, transition: "filter 1.2s ease" }}
        />

        <div
          className="relative mx-auto w-[86%] max-w-[340px] overflow-hidden rounded-[2.6rem] border-[7px] border-[#1a1a26] bg-black shadow-2xl shadow-black/70 ring-1 ring-white/15 will-change-transform md:w-full md:max-w-none md:rounded-2xl md:border md:border-white/10 md:bg-[#0e0e16] md:ring-0"
          style={card}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          {/* Téléphone : barre d'état + barre d'adresse */}
          <div className="relative flex h-7 items-center justify-between px-6 text-[10px] font-semibold text-white md:hidden">
            <span>9:41</span>
            <span className="absolute left-1/2 top-1.5 h-[18px] w-[74px] -translate-x-1/2 rounded-full bg-[#050508] ring-1 ring-white/5" />
            <span className="flex items-center gap-1">
              <span className="flex items-end gap-[2px]">
                {[3, 5, 7, 9].map((h) => <span key={h} className="w-[3px] rounded-[1px] bg-white" style={{ height: h }} />)}
              </span>
              <span className="ml-1 h-[9px] w-[18px] rounded-[3px] border border-white/80 p-[1px]"><span className="block h-full w-3/4 rounded-[1px] bg-white" /></span>
            </span>
          </div>
          <div className="flex justify-center px-4 pb-2 md:hidden">
            <span key={cur.id} className="pop-in flex min-w-0 max-w-full items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/60">
              <Lock size={10} />
              <span className="truncate"><b className="text-white">{cur.label}</b>.mbila.ca</span>
            </span>
          </div>

          {/* Ordinateur : barre du navigateur */}
          <div className="hidden items-center gap-3 border-b border-white/5 px-4 py-3 md:flex">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="mx-auto flex min-w-0 items-center gap-2 rounded-lg bg-white/5 px-4 py-1.5 text-xs text-white/60">
              <Lock />
              <span key={cur.id} className="pop-in truncate"><b className="text-white">{cur.label}</b>.mbila.ca</span>
            </div>
            <span className="font-mono text-[11px] tabular-nums text-white/35">
              {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          </div>

          <div className="relative aspect-[9/16] overflow-hidden md:aspect-[16/10]">
            {items.map((it, k) => {
              const state: State = k === i ? "on" : k < i ? "past" : "next";
              // Seuls le site sortant et le site entrant s'animent ; les autres se placent sans transition
              const style: CSSProperties = reduced
                ? { opacity: k === i ? 1 : 0, transition: "opacity .6s ease", zIndex: k === i ? 2 : 1 }
                : { ...SLIDE[state], transition: k === i || k === prev ? TRANS[state] : "none" };
              return (
                <div key={it.id} aria-hidden={k !== i} className="absolute inset-0" style={style}>
                  {it.slug ? (
                    <>
                      <div className="hidden md:block"><ScaledFrame src={`/site/${it.slug}`} ratio={0.625} /></div>
                      <div className="md:hidden"><ScaledFrame src={`/site/${it.slug}`} width={390} ratio={PHONE} /></div>
                    </>
                  ) : (
                    <picture>
                      {it.mobile && <source media="(max-width: 767px)" srcSet={`/thumbs/m/${it.id}.jpg`} />}
                      <img src={`/thumbs/${it.id}.jpg`} alt={k === i ? `Site de ${it.name}` : ""} className="h-full w-full object-cover object-top" />
                    </picture>
                  )}
                </div>
              );
            })}
            {/* Ligne lumineuse qui accompagne le rideau */}
            {t > 0 && !reduced && (
              <div
                key={t}
                className={`${dir > 0 ? "sc-edge-up" : "sc-edge-down"} pointer-events-none absolute inset-x-0 z-10 h-[2px] bg-white/90 shadow-[0_0_18px_4px_rgba(255,94,168,.65)]`}
              />
            )}
            {/* Reflet qui suit la souris / le doigt */}
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                opacity: "var(--sc-glare, 0)",
                transition: "opacity .4s ease",
                background: "radial-gradient(600px circle at calc(50% + var(--sc-mx, 0) * 100%) calc(50% + var(--sc-my, 0) * 100%), rgba(255,255,255,.22), transparent 50%)",
              }}
            />
          </div>
        </div>

        {/* Flèches : visibles au tactile (le swipe seul n'était pas fiable), au survol sur desktop */}
        <button
          type="button" onClick={() => step(-1)} aria-label="Site précédent"
          className="absolute -left-1 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#12121c]/85 text-white/80 shadow-xl backdrop-blur transition hover:bg-[#1c1c2c] md:-left-6 md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button" onClick={() => step(1)} aria-label="Site suivant"
          className="absolute -right-1 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#12121c]/85 text-white/80 shadow-xl backdrop-blur transition hover:bg-[#1c1c2c] md:-right-6 md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
        >
          <ChevronRight size={20} />
        </button>

        {/* Badges flottants en parallaxe (profondeur) */}
        <div
          className="absolute -bottom-5 -left-1 z-20 rounded-2xl border border-white/10 bg-[#12121c]/90 px-3.5 py-2.5 shadow-xl backdrop-blur md:-bottom-6 md:-left-4 md:p-4"
          style={reduced ? undefined : { transform: "translate3d(calc(var(--sc-mx, 0) * -26px), calc((1 - var(--sc-enter, 1)) * 30px + var(--sc-my, 0) * -14px), 0)", transition: "transform .3s ease-out" }}
        >
          <p className="text-[9px] uppercase tracking-widest text-white/40 md:text-[10px]">{cur.slug ? "Créé avec Mbila" : "Site généré par Mbila"}</p>
          <p key={cur.id} className="pop-in mt-0.5 font-display text-base font-semibold text-white md:mt-1 md:text-lg">{cur.name}</p>
        </div>
        <div
          className="absolute -right-1 top-24 z-20 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#12121c]/90 px-3 py-2 shadow-xl backdrop-blur md:-right-4 md:-top-6 md:gap-3 md:px-4 md:py-3"
          style={reduced ? undefined : { transform: "translate3d(calc(var(--sc-mx, 0) * 30px), calc((1 - var(--sc-enter, 1)) * -24px + var(--sc-my, 0) * 16px), 0)", transition: "transform .3s ease-out" }}
        >
          <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" /></span>
          <span className="text-xs text-white md:text-sm">En ligne · HTTPS</span>
        </div>
      </div>

      {/* Progression : un segment par site, cliquable ; la fin du remplissage fait passer au suivant */}
      <div className="mx-auto mt-10 flex max-w-md items-center gap-1.5 px-2">
        {items.map((it, k) => (
          <button key={it.id} type="button" onClick={() => show(k)} aria-label={`Voir ${it.name}`} title={it.name} className="group h-5 flex-1 py-2">
            <span className="block h-1 overflow-hidden rounded-full bg-white/15 transition group-hover:bg-white/30">
              {k === i ? (
                <span
                  key={`${it.id}-${t}`}
                  className="seg-fill brand-grad block h-full rounded-full"
                  style={{ animationDuration: `${AUTO_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                  onAnimationEnd={() => step(1)}
                />
              ) : (
                <span className="brand-grad block h-full rounded-full" style={{ width: k < i ? "100%" : "0%" }} />
              )}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-white/40 md:hidden">Glissez pour changer de site</p>
    </div>
  );
}
