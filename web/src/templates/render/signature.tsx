// Composants « signature » : héros et sections propres aux designs de grande
// marque (hôtellerie de luxe, produit tech, boutique naturelle, beauté,
// institution). Branchés dans SiteRenderer via SIG[section][variante].
import type { ReactNode } from "react";
import { Award, Clock, Heart, ShieldCheck, Sparkles, Star, Target, Zap } from "lucide-react";
import Lightbox from "./Lightbox";
import { FxLayer, HeroImg, HeroText } from "./fx";
import { H2, Img, Section, Stars, Words, ctaHref, type SectionProps } from "./parts";

const ICONS = [Sparkles, ShieldCheck, Heart, Award, Target, Star, Zap, Clock];
const KICKER = "text-[11px] uppercase tracking-[0.32em]";
// Rangée défilante horizontale alignée sur la grille max-w-7xl
// (scroll-padding = padding : sinon l'aimantation colle la 1re carte au bord)
const RAIL =
  "flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 scroll-px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:px-[max(1.5rem,calc((100%_-_80rem)/2_+_1.5rem))] lg:scroll-px-[max(1.5rem,calc((100%_-_80rem)/2_+_1.5rem))]";

const out = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {});
const heroText = (d: SectionProps["d"]) => ({
  title: d.category === "portfolio" ? d.name : d.hero.title,
  label: d.city ? `${d.name} · ${d.city}` : d.name,
});
// Navs « en flux » (sticky) : le hero n'a pas à réserver la place d'une barre fixe
const inFlow = (tpl: SectionProps["tpl"]) => ["glass", "shop", "academic"].includes(tpl.nav);

// ══ HÉROS ═════════════════════════════════════════════════════════

// Hôtellerie de luxe : plein écran cinéma, titre fin centré, barre de réservation
function Cinema({ d }: SectionProps) {
  const { title, label } = heroText(d);
  const c = d.contact;
  const cells = ([["Destination", d.city || d.name], ["Accueil", c.hours], ["Contact", c.whatsapp || c.phone || c.email]] as const).filter(([, v]) => v);
  const href = ctaHref(d);
  return (
    <section className="relative flex h-[100svh] min-h-[640px] items-center justify-center overflow-hidden text-center text-white">
      <div className="absolute inset-0" data-parallax><HeroImg d={d} kb /></div>
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/55 to-transparent" />
      <FxLayer d={d} />
      <div className="relative mx-auto max-w-4xl px-6 pb-28">
        <p className={`rv ${KICKER} text-white/80`}>{label}</p>
        <h1 className="hero-title mt-6 font-s-head text-5xl font-light leading-[1.05] md:text-7xl lg:text-[5.5rem]"><Words text={title} /></h1>
        <HeroText d={d} center />
        <p className="rv mx-auto mt-6 max-w-xl text-base font-light text-white/85 md:text-lg">{d.hero.subtitle}</p>
        <a href="#about" className={`rv mt-10 inline-block border-b border-white/60 pb-1.5 ${KICKER} transition hover:border-white`}>Découvrir</a>
      </div>
      <div className="absolute inset-x-0 bottom-0 px-6 pb-6 md:pb-10">
        <div className="rv mx-auto flex max-w-5xl bg-s-bg text-left text-s-fg shadow-2xl">
          {cells.map(([k, v]) => (
            <div key={k} className="hidden min-w-0 flex-1 border-r border-s-border px-7 py-5 md:block">
              <p className="text-[10px] uppercase tracking-[0.3em] text-s-muted">{k}</p>
              <p className="mt-1.5 truncate font-s-head text-xl">{v}</p>
            </div>
          ))}
          <a href={href} {...out(href)} className={`grid flex-1 place-items-center bg-s-primary px-10 py-5 text-s-onprimary transition hover:brightness-125 md:flex-none ${KICKER}`}>
            {d.cta.label}
          </a>
        </div>
      </div>
    </section>
  );
}

// Deux boutons pilule : « En savoir plus » plein + action client en contour
function Pills({ d, item, more = "#contact", dark, className = "" }: { d: SectionProps["d"]; item?: string; more?: string; dark?: boolean; className?: string }) {
  const href = ctaHref(d, item);
  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      <a href={more} data-service={item} className="rounded-full bg-s-primary px-6 py-2.5 text-[15px] text-s-onprimary transition hover:brightness-110">En savoir plus</a>
      <a
        href={href}
        {...out(href)}
        className={`rounded-full border px-6 py-2.5 text-[15px] transition ${dark ? "border-s-accent text-s-accent hover:bg-s-accent hover:text-black" : "border-s-primary text-s-primary hover:bg-s-primary hover:text-s-onprimary"}`}
      >
        {d.cta.label}
      </a>
    </div>
  );
}

// Produit tech : titre géant centré très serré, deux pilules, visuel en dessous
function Product({ d, tpl }: SectionProps) {
  const { title, label } = heroText(d);
  return (
    <section className={`relative overflow-hidden bg-s-card px-6 text-center ${inFlow(tpl) ? "pt-14 md:pt-20" : "pt-32 md:pt-36"}`}>
      <FxLayer d={d} />
      <div className="relative">
        <p className="rv text-sm font-medium text-s-muted md:text-base">{label}</p>
        <h1 className="hero-title mx-auto mt-2 max-w-5xl font-s-head text-5xl font-semibold leading-[1.05] tracking-[-0.035em] md:text-7xl lg:text-[5.5rem]"><Words text={title} /></h1>
        <HeroText d={d} center />
        <p className="rv mx-auto mt-4 max-w-2xl text-xl leading-snug text-s-fg/75 md:text-[1.75rem]">{d.hero.subtitle}</p>
        <Pills d={d} more="#services" className="rv mt-7" />
        <div className="rv relative mx-auto mt-12 aspect-[16/9] max-w-5xl overflow-hidden rounded-t-[2rem] md:mt-16"><HeroImg d={d} /></div>
      </div>
    </section>
  );
}

// Boutique naturelle : grande photo lifestyle, texte et deux boutons blancs en bas à gauche
function Lifestyle({ d }: SectionProps) {
  const { title, label } = heroText(d);
  const href = ctaHref(d);
  const btn = "min-w-[150px] rounded-btn bg-white px-7 py-3.5 text-center text-xs font-bold uppercase tracking-[0.16em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white";
  return (
    <section className="relative h-[82svh] min-h-[540px] overflow-hidden text-white">
      <div className="absolute inset-0"><HeroImg d={d} kb /></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
      <FxLayer d={d} />
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-7xl px-6 pb-12 md:pb-16">
          <p className="rv text-xs font-semibold uppercase tracking-[0.2em] text-white/85">{label}</p>
          <h1 className="hero-title mt-3 max-w-3xl font-s-head text-4xl font-medium leading-[1.05] md:text-6xl"><Words text={title} /></h1>
          <HeroText d={d} />
          <p className="rv mt-4 max-w-lg text-white/85 md:text-lg">{d.hero.subtitle}</p>
          <div className="rv mt-7 flex flex-wrap gap-3">
            <a href={href} {...out(href)} className={btn}>{d.cta.label}</a>
            <a href="#services" className={btn}>{d.services.title}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// Beauté : moitié aplat pastel avec texte centré, moitié photo
function Beauty({ d, tpl }: SectionProps) {
  const { title, label } = heroText(d);
  const href = ctaHref(d);
  return (
    <section className="grid md:min-h-[86svh] md:grid-cols-2">
      <div className={`relative order-2 flex flex-col items-center justify-center bg-s-card px-8 py-16 text-center md:order-1 ${inFlow(tpl) ? "" : "md:pt-32"}`}>
        <FxLayer d={d} />
        <p className="rv relative text-[11px] font-semibold uppercase tracking-[0.25em]">{label}</p>
        <h1 className="hero-title relative mt-5 font-s-head text-5xl font-semibold leading-[1] tracking-tight md:text-7xl"><Words text={title} /></h1>
        <HeroText d={d} center />
        <p className="rv relative mx-auto mt-5 max-w-sm">{d.hero.subtitle}</p>
        <a href={href} {...out(href)} className="rv relative mt-8 rounded-btn bg-s-fg px-9 py-3.5 text-sm font-semibold text-s-bg transition hover:opacity-85">{d.cta.label}</a>
      </div>
      <div className="relative order-1 aspect-[4/5] overflow-hidden md:order-2 md:aspect-auto"><HeroImg d={d} kb /></div>
    </section>
  );
}

// Institution : grande image, encart blanc liseré couleur qui chevauche
function Panel({ d, tpl }: SectionProps) {
  const { title, label } = heroText(d);
  const href = ctaHref(d);
  return (
    <section className={`relative pb-6 ${inFlow(tpl) ? "" : "pt-20"}`}>
      <div className="relative h-[68svh] min-h-[440px] overflow-hidden">
        <div className="absolute inset-0" data-parallax><HeroImg d={d} kb /></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        <FxLayer d={d} />
      </div>
      <div className="relative mx-auto -mt-36 max-w-7xl px-6 md:-mt-48">
        <div className="rv max-w-2xl border-t-4 border-s-primary bg-s-bg p-8 shadow-2xl md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-s-muted">{label}</p>
          <h1 className="hero-title mt-4 font-s-head text-4xl leading-[1.1] text-s-ink md:text-6xl"><Words text={title} /></h1>
          <HeroText d={d} />
          <p className="mt-5 text-lg text-s-muted">{d.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <a href={href} {...out(href)} className="bg-s-primary px-7 py-3.5 text-sm font-semibold text-s-onprimary transition hover:brightness-125">{d.cta.label} →</a>
            <a href="#services" className="text-sm font-semibold text-s-ink underline decoration-2 underline-offset-[6px]">{d.services.title}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══ À PROPOS ══════════════════════════════════════════════════════

// Introduction centrée, filet vertical et rangée d'icônes fines vers les services
function Intro({ d }: SectionProps) {
  const a = d.about;
  return (
    <Section id="about" className="text-center">
      <div className="mx-auto max-w-3xl">
        <span className="rv mx-auto block h-14 w-px bg-s-accent" />
        <H2 className="mt-8 font-light">{a.title}</H2>
        <p className="rv mt-6 text-lg font-light leading-relaxed text-s-muted">{a.text}</p>
      </div>
      <div className="rv mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-y-10 border-y border-s-border py-10 sm:grid-cols-4">
        {d.services.items.slice(0, 4).map((s, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <a key={s.name} href="#services" className="group flex flex-col items-center gap-4 px-3">
              <Icon size={24} strokeWidth={1.1} className="text-s-accent transition group-hover:-translate-y-1" />
              <span className="text-[11px] uppercase tracking-[0.28em]">{s.name}</span>
            </a>
          );
        })}
      </div>
    </Section>
  );
}

// Grande annonce sur fond noir, dégradé lumineux et chiffres géants
function Keynote({ d }: SectionProps) {
  const a = d.about;
  return (
    <section id="about" className="bg-black px-6 py-28 text-center text-white md:py-40">
      <div className="mx-auto max-w-5xl">
        <p className="rv text-lg font-semibold text-white/55 md:text-xl">{d.name}</p>
        <h2 className="rv mt-4 font-s-head text-5xl font-semibold leading-[1.04] tracking-[-0.03em] md:text-7xl"><span className="sig-grad">{a.title}</span></h2>
        <p className="rv mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/65 md:text-2xl">{a.text}</p>
        <div className="mt-20 grid gap-12 sm:grid-cols-3">
          {a.stats.slice(0, 3).map((s) => (
            <div key={s.label} className="rv">
              <p className="sig-grad font-s-head text-6xl font-semibold tracking-tight md:text-7xl" data-count={s.value}>{s.value}</p>
              <p className="mt-3 text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Manifeste : grande phrase centrée en clôture, signature en dessous
function Manifesto({ d }: SectionProps) {
  const a = d.about;
  return (
    <Section id="about" className="text-center">
      <p className="rv text-[11px] font-semibold uppercase tracking-[0.25em] text-s-muted">{a.title}</p>
      <p className="rv mx-auto mt-7 max-w-4xl font-s-head text-2xl leading-snug md:text-4xl md:leading-snug">{a.text}</p>
      <p className="rv mt-10 font-s-head text-4xl font-semibold tracking-tight md:text-6xl">{d.tagline}</p>
    </Section>
  );
}

// ══ SERVICES / PRODUITS ═══════════════════════════════════════════

// Carrousel de destinations : grandes cartes portrait, titre sous l'image
function Rail({ d }: SectionProps) {
  const s = d.services;
  const href = ctaHref(d);
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="mx-auto mb-12 flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6">
        <div className="max-w-xl">
          <H2 className="font-light">{s.title}</H2>
          <p className="rv mt-4 text-s-muted">{s.subtitle}</p>
        </div>
        <a href={href} {...out(href)} className={`rv border-b border-s-fg pb-1 ${KICKER}`}>{d.cta.label}</a>
      </div>
      <div className={`rv ${RAIL} gap-6`}>
        {s.items.map((it) => (
          <a key={it.name} href="#contact" data-service={it.name} className="group w-[78vw] shrink-0 snap-start sm:w-[340px]">
            <div className="aspect-[3/4] overflow-hidden rounded-s"><Img src={it.image} alt={it.name} className="transition duration-700 group-hover:scale-105" /></div>
            {it.price && <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-s-accent">{it.price}</p>}
            <h3 className={`font-s-head text-2xl ${it.price ? "mt-2" : "mt-5"}`}>{it.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-s-muted">{it.description}</p>
            <span className={`mt-4 inline-block border-b border-s-fg/40 pb-0.5 transition group-hover:border-s-fg ${KICKER}`}>Découvrir</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// Tuiles produit : 2 grands bandeaux pleine largeur puis grille 2 colonnes
function Tiles({ d }: SectionProps) {
  const items = d.services.items;
  const big = items.slice(0, 2);
  const rest = items.slice(2);
  return (
    <section id="services" className="space-y-3 py-3">
      {big.map((it, i) => (
        <article key={it.name} className={`rv overflow-hidden text-center ${i % 2 ? "bg-black text-white" : "bg-s-card"}`}>
          <div className="px-6 pt-12 md:pt-16">
            <h2 className="font-s-head text-4xl font-semibold leading-tight tracking-[-0.025em] md:text-[3.5rem]">{it.name}</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg opacity-80 md:text-2xl">{it.description}</p>
            {it.price && <p className="mt-2 text-sm opacity-60">À partir de {it.price}</p>}
            <Pills d={d} item={it.name} dark={i % 2 === 1} className="mt-6" />
          </div>
          <div className="mx-auto mt-10 aspect-[16/7] max-w-6xl overflow-hidden"><Img src={it.image} alt={it.name} /></div>
        </article>
      ))}
      {rest.length > 0 && (
        <div className="grid gap-3 px-3 md:grid-cols-2">
          {rest.map((it) => (
            <article key={it.name} className="rv flex min-h-[520px] flex-col overflow-hidden bg-s-card text-center md:min-h-[600px]">
              <div className="px-6 pt-12">
                <h3 className="font-s-head text-3xl font-semibold tracking-[-0.02em] md:text-[2.5rem]">{it.name}</h3>
                <p className="mx-auto mt-2 max-w-md text-lg text-s-fg/75">{it.description}</p>
                {it.price && <p className="mt-1 text-sm text-s-muted">À partir de {it.price}</p>}
                <Pills d={d} item={it.name} className="mt-5" />
              </div>
              <div className="relative mt-8 min-h-[240px] flex-1"><div className="absolute inset-0"><Img src={it.image} alt={it.name} /></div></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// Rayon produits défilant : vignettes carrées sur aplat, badge « Nouveau », bouton commander
function Shelf({ d }: SectionProps) {
  const s = d.services;
  const href = ctaHref(d);
  return (
    <section id="services" className="py-20 md:py-28">
      <div className="mx-auto mb-10 flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6">
        <div>
          <H2 className="text-3xl font-medium md:text-4xl">{s.title}</H2>
          <p className="rv mt-2 max-w-xl text-s-muted">{s.subtitle}</p>
        </div>
        <a href={href} {...out(href)} className="rv rounded-btn border border-s-fg px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] transition hover:bg-s-fg hover:text-s-bg">{d.cta.label}</a>
      </div>
      <div className={`rv ${RAIL}`}>
        {s.items.map((it, i) => {
          const buy = ctaHref(d, it.name);
          return (
            <div key={it.name} className="group w-[68vw] shrink-0 snap-start sm:w-[290px]">
              <div className="relative aspect-square overflow-hidden rounded-s bg-s-card">
                <Img src={it.image} alt={it.name} className="transition duration-700 group-hover:scale-105" />
                {i < 2 && <span className="absolute left-3 top-3 rounded-btn bg-s-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Nouveau</span>}
              </div>
              <h3 className="mt-4 font-semibold">{it.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-s-muted">{it.description}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{it.price}</span>
                <a href={buy} {...out(buy)} className="rounded-btn bg-s-fg px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-s-bg transition hover:opacity-85">Choisir</a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Actualités institutionnelles : une grande « à la une » + cartes, rubrique en capitales
function News({ d }: SectionProps) {
  const s = d.services;
  const href = ctaHref(d);
  const kw = d.keywords.length ? d.keywords : [d.name];
  return (
    <Section id="services">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-s-border pb-6">
        <div className="max-w-2xl">
          <H2>{s.title}</H2>
          <p className="rv mt-3 text-s-muted">{s.subtitle}</p>
        </div>
        <a href={href} {...out(href)} className="rv text-sm font-semibold text-s-ink underline decoration-2 underline-offset-[6px]">{d.cta.label} →</a>
      </div>
      {/* « À la une » (2×2) + 4 cartes = grille pleine, sans orpheline */}
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {s.items.slice(0, 5).map((it, i) => (
          <a key={it.name} href="#contact" data-service={it.name} className={`rv group block ${i === 0 ? "sm:col-span-2 lg:row-span-2" : ""}`} style={{ transitionDelay: `${(i % 4) * 80}ms` }}>
            <div className={`overflow-hidden ${i === 0 ? "aspect-[16/11]" : "aspect-[4/3]"}`}><Img src={it.image} alt={it.name} className="transition duration-700 group-hover:scale-105" /></div>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-s-ink">{kw[i % kw.length]}</p>
            <h3 className={`mt-2 font-s-head leading-snug decoration-1 underline-offset-4 group-hover:underline ${i === 0 ? "text-3xl md:text-4xl" : "text-xl"}`}>{it.name}</h3>
            <p className={`mt-2 text-sm text-s-muted ${i === 0 ? "md:text-base" : "line-clamp-3"}`}>{it.description}</p>
          </a>
        ))}
      </div>
    </Section>
  );
}

// ══ GALERIE ═══════════════════════════════════════════════════════

// Grandes cartes arrondies qui défilent, légende pastille
function GalleryRail({ d }: SectionProps) {
  const imgs = d.gallery.images.filter(Boolean);
  if (!imgs.length) return null;
  return (
    <section id="gallery" className="overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6"><H2 className="font-semibold tracking-[-0.02em]">{d.gallery.title}</H2></div>
      <Lightbox images={imgs}>
        <div className={`rv mt-10 ${RAIL}`}>
          {imgs.map((src, i) => (
            <button key={src + i} type="button" data-lb={i} aria-label="Agrandir l'image" className="group relative aspect-[16/10] w-[82vw] shrink-0 cursor-zoom-in snap-center overflow-hidden rounded-[1.25rem] sm:w-[620px]">
              <Img src={src} className="transition duration-700 group-hover:scale-105" />
              {d.keywords[i] && <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-neutral-900 backdrop-blur">{d.keywords[i]}</span>}
            </button>
          ))}
        </div>
      </Lightbox>
    </section>
  );
}

// Trois tuiles hautes légendées, chacune avec son bouton
function GalleryTiles({ d }: SectionProps) {
  const imgs = d.gallery.images.filter(Boolean).slice(0, 3);
  if (!imgs.length) return null;
  return (
    <section id="gallery" className="px-6 py-10 md:py-16">
      <div className={`mx-auto grid max-w-7xl gap-4 ${imgs.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {imgs.map((src, i) => (
          <a key={src + i} href="#services" className="rv group relative block aspect-[4/5] overflow-hidden rounded-s text-white" style={{ transitionDelay: `${i * 100}ms` }}>
            <Img src={src} className="transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="font-s-head text-2xl font-medium">{d.keywords[i] ?? d.gallery.title}</p>
              <span className="mt-4 inline-block rounded-btn bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-900 transition group-hover:bg-neutral-900 group-hover:text-white">Découvrir</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ══ ÉTAPES ════════════════════════════════════════════════════════

// Valeurs illustrées : 3 colonnes image + titre en capitales + texte
function Values({ d }: SectionProps) {
  const imgs = d.gallery.images.filter(Boolean);
  return (
    <Section className="bg-s-card">
      <div className="grid gap-12 md:grid-cols-3">
        {d.steps.items.slice(0, 3).map((it, i) => (
          <div key={it.title} className="rv text-center" style={{ transitionDelay: `${i * 120}ms` }}>
            <div className="mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-s"><Img src={imgs[(i + 3) % Math.max(1, imgs.length)] ?? d.hero.image} /></div>
            <h3 className="mt-7 text-xs font-bold uppercase tracking-[0.22em]">{it.title}</h3>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-s-muted">{it.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// Bandeau couleur 3 colonnes séparées par des filets, liens « En savoir plus »
function Band({ d }: SectionProps) {
  const st = d.steps;
  const href = ctaHref(d);
  return (
    <section className="bg-s-primary px-6 py-20 text-s-onprimary md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="rv font-s-head text-4xl md:text-5xl">{st.title}</h2>
        <div className="mt-12 grid gap-px bg-white/15 md:grid-cols-3">
          {st.items.map((it, i) => (
            <a key={it.title} href={href} {...out(href)} className="rv group bg-s-primary p-8 transition hover:bg-white/[0.06] md:p-10" style={{ transitionDelay: `${i * 120}ms` }}>
              <span className="font-s-head text-5xl opacity-30">0{i + 1}</span>
              <h3 className="mt-4 font-s-head text-2xl">{it.title}</h3>
              <p className="mt-3 text-sm leading-relaxed opacity-75">{it.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">En savoir plus <span className="transition group-hover:translate-x-1">→</span></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══ BANDEAU / CTA ═════════════════════════════════════════════════

// Pastilles de catégories (défilent au doigt sur mobile)
function Chips({ d }: SectionProps) {
  return (
    <div className="border-b border-s-border py-6">
      <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-6 [scrollbar-width:none] md:flex-wrap md:justify-center">
        {d.keywords.slice(0, 7).map((k) => (
          <a key={k} href="#services" className="shrink-0 rounded-full border border-s-fg/70 px-5 py-2 text-sm font-medium transition hover:bg-s-fg hover:text-s-bg">{k}</a>
        ))}
      </div>
    </div>
  );
}

// Grande image + bloc éditorial fin (programme, art de vivre)
function Editorial({ d }: SectionProps) {
  const href = ctaHref(d);
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-12 md:gap-14">
        <div className="rv aspect-[4/3] overflow-hidden rounded-s md:col-span-7" data-parallax-img><Img src={d.gallery.images[0] ?? d.hero.image} /></div>
        <div className="md:col-span-5">
          <p className={`rv text-s-accent ${KICKER}`}>{d.name}</p>
          <H2 className="mt-5 text-3xl font-light md:text-4xl">{d.tagline}</H2>
          <p className="rv mt-5 leading-relaxed text-s-muted">Chaque détail est pensé pour que votre expérience soit exceptionnelle, de votre premier contact jusqu&apos;au dernier instant.</p>
          {d.testimonials[0] && (
            <div className="rv mt-8 border-l border-s-accent pl-5">
              <Stars />
              <p className="mt-2 text-sm italic text-s-muted">« {d.testimonials[0].text} »</p>
            </div>
          )}
          <a href={href} {...out(href)} className={`rv mt-9 inline-block bg-s-primary px-8 py-4 text-s-onprimary transition hover:brightness-125 ${KICKER}`}>{d.cta.label}</a>
        </div>
      </div>
    </section>
  );
}

export const SIG: Record<string, Record<string, (p: SectionProps) => ReactNode>> = {
  hero: { cinema: Cinema, product: Product, lifestyle: Lifestyle, beauty: Beauty, panel: Panel },
  about: { intro: Intro, keynote: Keynote, manifesto: Manifesto },
  services: { rail: Rail, tiles: Tiles, shelf: Shelf, news: News },
  gallery: { rail: GalleryRail, tiles: GalleryTiles },
  steps: { values: Values, band: Band },
  marquee: { chips: Chips },
  cta: { editorial: Editorial },
};
