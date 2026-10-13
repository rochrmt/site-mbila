import type { SiteData } from "../types";
import HeroSlider from "./HeroSlider";
import { Rotator } from "./HeroRotator";
import { Img } from "./parts";

// Ligne de mots changeants sous le titre (si le client l'a activée)
export function HeroText({ d, center }: { d: SiteData; center?: boolean }) {
  const t = d.style?.heroText;
  const words = (t?.words ?? []).filter((w) => w.trim());
  if (!t || !words.length) return null;
  return (
    <p className={`rv mt-4 font-s-head text-3xl leading-tight text-s-accent md:text-5xl ${center ? "text-center" : ""}`}>
      <Rotator mode={t.mode} words={words} />
    </p>
  );
}

const has = (d: SiteData, fx: string) => d.style?.fx?.includes(fx as never) ?? false;

// Positions déterministes des particules (pas d'aléatoire → rendu serveur stable)
const DOTS = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 100,
  size: 2 + (i % 4) * 1.5,
  delay: -((i * 1.7) % 12),
  dur: 9 + (i % 5) * 3,
}));

// Couches décoratives placées derrière le contenu du hero.
export function FxLayer({ d }: { d: SiteData }) {
  const fx = d.style?.fx ?? [];
  if (!fx.some((x) => ["aurora", "grid", "particles", "spotlight"].includes(x))) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {has(d, "aurora") && (
        <>
          <div className="fx-aurora absolute -left-[10%] -top-[20%] h-[70%] w-[60%] rounded-full bg-s-primary" />
          <div className="fx-aurora absolute -right-[10%] top-[10%] h-[65%] w-[55%] rounded-full bg-s-accent" style={{ animationDelay: "-7s" }} />
          <div className="fx-aurora absolute bottom-[-25%] left-[25%] h-[60%] w-[50%] rounded-full bg-s-primary" style={{ animationDelay: "-13s" }} />
        </>
      )}
      {has(d, "grid") && <div className="fx-grid absolute inset-0" />}
      {has(d, "particles") &&
        DOTS.map((p, i) => (
          <span
            key={i}
            className="fx-dot absolute rounded-full bg-s-accent"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
          />
        ))}
      {has(d, "spotlight") && <div className="fx-spot absolute inset-0" />}
    </div>
  );
}

// Image principale du hero : devient un carrousel si l'effet est activé.
export function HeroImg({ d, kb, className }: { d: SiteData; kb?: boolean; className?: string }) {
  const imgs = [d.hero.image, ...d.hero.images.filter((x) => x && x !== d.hero.image)];
  if (has(d, "carousel") && imgs.length > 1) return <HeroSlider images={imgs.slice(0, 5)} alt={d.name} />;
  return <Img src={d.hero.image} alt={d.name} kb={kb} className={className} />;
}
