import { Fragment, type CSSProperties } from "react";
import { fontPairById, paletteById } from "../palettes";
import { mixSections } from "../mix";
import type { AnimLevel, SiteData, Template } from "../types";
import AnimRuntime from "./AnimRuntime";
import { FloatingCta, Footer, Nav, StoreBand } from "./chrome";
import Hero from "./hero";
import type { SectionProps } from "./parts";
import { About, Contact, CtaBlock, Education, Faq, Gallery, Marquee, Services, Steps, Testimonials, Works } from "./sections";

const MAP: Record<string, (p: SectionProps) => React.ReactNode> = {
  hero: Hero,
  marquee: Marquee,
  about: About,
  services: Services,
  works: Works,
  steps: Steps,
  gallery: Gallery,
  testimonials: Testimonials,
  faq: Faq,
  cta: CtaBlock,
  contact: Contact,
  education: Education,
};

// Portfolio : pas de témoignages — la section Formation prend leur place
// (ou s'insère avant le contact si le design n'avait pas de témoignages)
function portfolioSections(sections: [string, string][]): [string, string][] {
  const out = sections.map(([k, v]): [string, string] => (k === "testimonials" ? ["education", v] : [k, v]));
  if (out.some(([k]) => k === "education")) return out;
  const at = out.findIndex(([k]) => k === "contact");
  out.splice(at < 0 ? out.length : at, 0, ["education", ""]);
  return out;
}

const RADIUS = { none: ["0px", "0px"], sm: ["6px", "6px"], md: ["14px", "10px"], lg: ["22px", "999px"], full: ["28px", "999px"] };

export default function SiteRenderer({
  data,
  tpl,
  paletteId,
  anim,
  slug = "",
}: {
  data: SiteData;
  tpl: Template;
  paletteId?: string | null;
  anim?: AnimLevel | string | null;
  slug?: string;
}) {
  const p = paletteById(paletteId || tpl.palette);
  const f = fontPairById(data.style?.fonts || tpl.fonts);
  const level = (anim || tpl.anim) as AnimLevel;
  const fx = data.style?.fx ?? [];
  const [r, br] = RADIUS[tpl.radius];
  // Sections remélangées de façon déterministe : même template + site différent
  // (slug) = combinaison différente de variantes (services, galerie…).
  const mixed = mixSections(tpl.sections, `${tpl.id}|${slug || data.name}`);
  const sections = data.category === "portfolio" ? portfolioSections(mixed) : mixed;
  const style = {
    "--c-bg": p.bg,
    "--c-fg": p.fg,
    "--c-muted": p.muted,
    "--c-card": p.card,
    "--c-primary": p.primary,
    "--c-onprimary": p.primaryFg,
    "--c-accent": p.accent,
    "--c-ink": p.ink ?? p.primary,
    "--c-border": p.border,
    "--c-head": f.head,
    "--c-body": f.body,
    "--c-r": r,
    "--c-btnr": br,
  } as CSSProperties;

  return (
    <div
      data-site
      data-anim={level}
      data-dark={p.dark || undefined}
      data-upper={f.headUpper || undefined}
      data-fx={fx.join(" ") || undefined}
      style={style}
      className="site min-h-screen bg-s-bg font-s-body text-s-fg antialiased"
    >
      {fx.includes("grain") && <div aria-hidden className="fx-grain pointer-events-none fixed inset-0 z-[70]" />}
      <Nav d={data} tpl={tpl} />
      <main>
        {sections.map(([key, v], i) => {
          const C = MAP[key];
          return (
            <Fragment key={key + i}>
              {C ? <C d={data} v={v} tpl={tpl} slug={slug} /> : null}
              {/* Bandeau boutique externe : juste après le hero */}
              {key === "hero" && <StoreBand d={data} />}
            </Fragment>
          );
        })}
      </main>
      <Footer d={data} tpl={tpl} />
      <FloatingCta d={data} />
      <AnimRuntime level={level} fx={fx.join(" ")} />
    </div>
  );
}
