import { Award, Clock, Heart, Mail, MapPin, Phone, ShieldCheck, Sparkles, Star, Target, Zap, MessageCircle } from "lucide-react";
import ContactForm from "./ContactForm";
import Lightbox from "./Lightbox";
import { Btn, Cta, Eyebrow, H2, Head, Img, Section, Stars, ctaHref, type SectionProps } from "./parts";

const ICONS = [Sparkles, ShieldCheck, Zap, Heart, Award, Target, Star, Clock];

// ── Bandeau défilant ─────────────────────────────────────────────
export function Marquee({ d }: SectionProps) {
  const items = [...d.keywords, ...d.keywords];
  return (
    <div className="overflow-hidden border-y border-s-border bg-s-primary py-5 text-s-onprimary">
      <div className="marquee flex w-max gap-10 whitespace-nowrap">
        {[...items, ...items].map((k, i) => (
          <span key={i} className="flex items-center gap-10 font-s-head text-2xl md:text-3xl">
            {k}
            <span className="text-base opacity-60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── À propos ─────────────────────────────────────────────────────
export function About({ d, v }: SectionProps) {
  const a = d.about;
  if (v === "stats")
    return (
      <Section id="about">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>À propos</Eyebrow>
            <H2>{a.title}</H2>
            <p className="rv mt-6 text-lg leading-relaxed text-s-muted">{a.text}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {a.stats.map((s, i) => (
              <div key={s.label} className={`rv rounded-s bg-s-card p-8 ring-1 ring-s-border ${i === 0 ? "col-span-2 bg-s-primary text-s-onprimary ring-0" : ""}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <p className="font-s-head text-5xl" data-count={s.value}>{s.value}</p>
                <p className={`mt-2 text-sm uppercase tracking-wider ${i === 0 ? "opacity-80" : "text-s-muted"}`}>{s.label}</p>
              </div>
            ))}
            {a.image && (
              <div className="rv aspect-square overflow-hidden rounded-s">
                <Img src={a.image} />
              </div>
            )}
          </div>
        </div>
      </Section>
    );
  if (v === "quote")
    return (
      <Section id="about" className="text-center">
        <Eyebrow>{a.title}</Eyebrow>
        <p className="rv mx-auto max-w-4xl font-s-head text-3xl leading-snug md:text-4xl">« {a.text} »</p>
        <div className="rv mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-12">
          {a.stats.map((s) => (
            <div key={s.label}>
              <p className="font-s-head text-4xl text-s-ink" data-count={s.value}>{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-s-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>
    );
  return (
    <Section id="about">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div className="rv relative">
          <div className="aspect-[4/5] overflow-hidden rounded-s" data-parallax-img>
            <Img src={a.image} />
          </div>
          <div className="absolute -bottom-8 -right-4 rounded-s bg-s-primary p-6 text-s-onprimary shadow-xl md:-right-8">
            <p className="font-s-head text-4xl" data-count={a.stats[0]?.value}>{a.stats[0]?.value}</p>
            <p className="text-xs uppercase tracking-wider opacity-80">{a.stats[0]?.label}</p>
          </div>
        </div>
        <div>
          <Eyebrow>À propos</Eyebrow>
          <H2>{a.title}</H2>
          <p className="rv mt-6 text-lg leading-relaxed text-s-muted">{a.text}</p>
          <ul className="rv mt-8 grid grid-cols-2 gap-3">
            {d.keywords.slice(0, 4).map((k) => (
              <li key={k} className="flex items-center gap-2 text-sm font-medium">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-s-primary/15 text-s-ink">✓</span>
                {k}
              </li>
            ))}
          </ul>
          <div className="rv mt-10"><Cta d={d} /></div>
        </div>
      </div>
    </Section>
  );
}

// ── Services / produits ──────────────────────────────────────────
export function Services({ d, v }: SectionProps) {
  const s = d.services;
  const items = s.items;

  if (v === "menu")
    return (
      <Section id="services" className="bg-s-card">
        <Head eyebrow="Découvrez" title={s.title} sub={s.subtitle} center />
        <div className="grid gap-x-16 gap-y-10 md:grid-cols-2">
          {items.map((it, i) => (
            <div key={it.name} data-service={it.name} className="rv group flex cursor-pointer gap-5" style={{ transitionDelay: `${(i % 2) * 100}ms` }}>
              {it.image && (
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-s-primary/30">
                  <Img src={it.image} className="transition-transform duration-500 group-hover:scale-110" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <h3 className="font-s-head text-xl">{it.name}</h3>
                  <span className="flex-1 border-b border-dotted border-s-fg/30" />
                  {it.price && <span className="font-s-head text-lg text-s-ink">{it.price}</span>}
                </div>
                <p className="mt-2 text-sm text-s-muted">{it.description}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-s-ink opacity-0 transition group-hover:opacity-100">
                  Choisir <span aria-hidden>→</span>
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="rv mt-16 text-center"><Cta d={d} /></div>
      </Section>
    );

  if (v === "icons")
    return (
      <Section id="services">
        <Head eyebrow="Découvrez" title={s.title} sub={s.subtitle} center />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div key={it.name} data-service={it.name} className="rv group cursor-pointer rounded-s border border-s-border bg-s-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-s-primary/50 hover:shadow-xl" style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
                <div className="grid h-14 w-14 place-items-center rounded-s bg-s-primary/10 text-s-ink transition-colors group-hover:bg-s-primary group-hover:text-s-onprimary">
                  <Icon size={26} strokeWidth={1.8} />
                </div>
                <h3 className="mt-6 font-s-head text-xl">{it.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-s-muted">{it.description}</p>
                {it.price && <p className="mt-4 text-sm font-semibold text-s-ink">À partir de {it.price}</p>}
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-s-ink transition group-hover:gap-2.5">
                  Choisir <span aria-hidden>→</span>
                </span>
              </div>
            );
          })}
        </div>
      </Section>
    );

  if (v === "alternating")
    return (
      <Section id="services">
        <Head eyebrow="Découvrez" title={s.title} sub={s.subtitle} />
        <div className="space-y-20">
          {items.slice(0, 4).map((it, i) => (
            <div key={it.name} className="grid items-center gap-10 md:grid-cols-2">
              <div className={`rv aspect-[4/3] overflow-hidden rounded-s ${i % 2 ? "md:order-2" : ""}`}>
                <Img src={it.image} className="transition-transform duration-700 hover:scale-105" />
              </div>
              <div className="rv">
                <p className="font-s-head text-6xl text-s-ink/30">0{i + 1}</p>
                <h3 className="mt-2 font-s-head text-3xl">{it.name}</h3>
                <p className="mt-4 text-lg text-s-muted">{it.description}</p>
                {it.price && <p className="mt-4 font-semibold text-s-ink">{it.price}</p>}
                <a href="#contact" data-service={it.name} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline decoration-s-primary decoration-2 underline-offset-8">
                  {d.cta.label} →
                </a>
              </div>
            </div>
          ))}
        </div>
      </Section>
    );

  if (v === "products")
    return (
      <Section id="services">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow>À découvrir</Eyebrow>
            <H2>{s.title}</H2>
            <p className="rv mt-4 text-s-muted">{s.subtitle}</p>
          </div>
          <div className="rv"><Btn href={ctaHref(d)} variant="outline">Nous contacter</Btn></div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
          {items.map((it, i) => (
            <div key={it.name} className="rv group overflow-hidden rounded-s bg-s-card ring-1 ring-s-border" style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
              <div className="relative aspect-square overflow-hidden">
                <Img src={it.image} className="transition-transform duration-700 group-hover:scale-110" />
                {i === 0 && <span className="absolute left-3 top-3 rounded-full bg-s-accent px-3 py-1 text-xs font-bold text-neutral-900">Populaire</span>}
              </div>
              <div className="p-4 md:p-6">
                <h3 className="font-s-head text-lg leading-tight">{it.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-s-muted">{it.description}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  {it.price && <span className="text-lg font-bold text-s-ink">{it.price}</span>}
                  <a href="#contact" data-service={it.name} className="rounded-btn bg-s-fg px-4 py-2 text-xs font-semibold text-s-bg transition hover:bg-s-primary hover:text-s-onprimary">
                    {d.cta.type === "whatsapp" ? "Commander" : "Choisir"}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    );

  if (v === "numbered")
    return (
      <Section id="services">
        <Head eyebrow="Découvrez" title={s.title} sub={s.subtitle} />
        <div className="border-t border-s-border">
          {items.map((it, i) => (
            <a key={it.name} href="#contact" data-service={it.name} className="rv group grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-s-border py-8 transition-colors hover:bg-s-card md:gap-12 md:px-4">
              <span className="font-s-head text-2xl text-s-muted transition-colors group-hover:text-s-ink md:text-4xl">0{i + 1}</span>
              <div>
                <h3 className="font-s-head text-2xl md:text-4xl">{it.name}</h3>
                <p className="mt-2 max-w-xl text-sm text-s-muted md:text-base">{it.description}</p>
              </div>
              <span className="flex items-center gap-4">
                {it.price && <span className="hidden font-semibold md:inline">{it.price}</span>}
                <span className="grid h-12 w-12 place-items-center rounded-full border border-s-border transition-all group-hover:rotate-[-45deg] group-hover:border-s-primary group-hover:bg-s-primary group-hover:text-s-onprimary">→</span>
              </span>
            </a>
          ))}
        </div>
      </Section>
    );

  // cards
  return (
    <Section id="services">
      <Head eyebrow="Découvrez" title={s.title} sub={s.subtitle} center />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div key={it.name} data-service={it.name} className="rv group cursor-pointer overflow-hidden rounded-s bg-s-card shadow-sm ring-1 ring-s-border transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl" style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
            <div className="aspect-[4/3] overflow-hidden">
              <Img src={it.image} className="transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="p-7">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-s-head text-xl">{it.name}</h3>
                {it.price && <span className="whitespace-nowrap rounded-full bg-s-primary/10 px-3 py-1 text-sm font-semibold text-s-ink">{it.price}</span>}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-s-muted">{it.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-s-ink transition group-hover:gap-2.5">
                Choisir <span aria-hidden>→</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Étapes ───────────────────────────────────────────────────────
export function Steps({ d, v }: SectionProps) {
  const st = d.steps;
  if (v === "timeline")
    return (
      <Section className="bg-s-card">
        <Head eyebrow="Simple & rapide" title={st.title} center />
        <div className="relative grid gap-12 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-s-primary/50 to-transparent md:block" />
          {st.items.map((it, i) => (
            <div key={it.title} className="rv relative text-center" style={{ transitionDelay: `${i * 150}ms` }}>
              <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-s-primary font-s-head text-xl text-s-onprimary ring-8 ring-s-card">
                {i + 1}
              </div>
              <h3 className="mt-6 font-s-head text-2xl">{it.title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-s-muted">{it.text}</p>
            </div>
          ))}
        </div>
      </Section>
    );
  return (
    <Section>
      <Head eyebrow="Simple & rapide" title={st.title} />
      <div className="grid gap-6 md:grid-cols-3">
        {st.items.map((it, i) => (
          <div key={it.title} className="rv relative overflow-hidden rounded-s border border-s-border p-8" style={{ transitionDelay: `${i * 120}ms` }}>
            <span className="absolute -right-2 -top-6 font-s-head text-[9rem] leading-none text-s-ink/10">{i + 1}</span>
            <p className="text-sm font-semibold uppercase tracking-widest text-s-ink">Étape {i + 1}</p>
            <h3 className="mt-4 font-s-head text-2xl">{it.title}</h3>
            <p className="mt-3 text-s-muted">{it.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Galerie ──────────────────────────────────────────────────────
export function Gallery({ d, v }: SectionProps) {
  const imgs = d.gallery.images.filter(Boolean);
  if (!imgs.length) return null;
  if (v === "strip")
    return (
      <section id="gallery" className="overflow-hidden py-24">
        <div className="mx-auto mb-12 max-w-6xl px-6"><Eyebrow>{d.gallery.title}</Eyebrow><H2>{d.name} en images</H2></div>
        <Lightbox images={imgs}>
          <div className="marquee marquee-slow flex w-max gap-5">
            {[...imgs, ...imgs].map((src, i) => (
              <button key={i} type="button" data-lb={i % imgs.length} aria-label="Agrandir l'image" className={`shrink-0 cursor-zoom-in overflow-hidden rounded-s ${i % 2 ? "h-72 w-56" : "h-72 w-96"}`}>
                <Img src={src} />
              </button>
            ))}
          </div>
        </Lightbox>
      </section>
    );
  if (v === "masonry")
    return (
      <Section id="gallery">
        <Head eyebrow={d.gallery.title} title={`L'univers ${d.name}`} center />
        <Lightbox images={imgs}>
          <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
            {imgs.map((src, i) => (
              <button key={i} type="button" data-lb={i} aria-label="Agrandir l'image" className={`rv group block w-full cursor-zoom-in overflow-hidden rounded-s ${["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[4/3]"][i % 4]}`}>
                <Img src={src} className="transition-transform duration-700 group-hover:scale-110" />
              </button>
            ))}
          </div>
        </Lightbox>
      </Section>
    );
  return (
    <Section id="gallery">
      <Head eyebrow={d.gallery.title} title={`Découvrez ${d.name}`} />
      <Lightbox images={imgs.slice(0, 8)}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {imgs.slice(0, 8).map((src, i) => (
            <button key={i} type="button" data-lb={i} aria-label="Agrandir l'image" className={`rv group block w-full cursor-zoom-in overflow-hidden rounded-s ${i === 0 ? "col-span-2 row-span-2 h-full" : "aspect-square"}`}>
              <Img src={src} className="transition-transform duration-700 group-hover:scale-110" />
            </button>
          ))}
        </div>
      </Lightbox>
    </Section>
  );
}

// ── Réalisations / portfolio ─────────────────────────────────────
export function Works({ d, v }: SectionProps) {
  const w = d.works;
  if (!w?.items.length) return null;

  if (v === "list")
    return (
      <Section id="works">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Portfolio</Eyebrow>
            <H2>{w.title}</H2>
          </div>
          <p className="rv max-w-sm text-sm text-s-muted">Une sélection de projets récents. Chaque collaboration commence par une écoute attentive.</p>
        </div>
        <div className="border-t border-s-border">
          {w.items.map((it, i) => (
            <a key={it.name + i} href="#contact" data-service={it.name} className="rv group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-s-border py-7 transition-colors hover:bg-s-card md:gap-10 md:px-4">
              <span className="font-s-head text-xl text-s-muted transition-colors group-hover:text-s-ink md:text-3xl">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="min-w-0 truncate font-s-head text-xl md:text-3xl">{it.name}</h3>
              <span className="flex items-center gap-4">
                <span className="hidden rounded-full border border-s-border px-3 py-1 text-xs font-semibold text-s-muted sm:inline">{it.tag}</span>
                <span className="hidden text-xs text-s-muted md:inline">{it.year}</span>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-s-border transition-all group-hover:rotate-[-45deg] group-hover:border-s-primary group-hover:bg-s-primary group-hover:text-s-onprimary">→</span>
              </span>
            </a>
          ))}
        </div>
      </Section>
    );

  return (
    <Section id="works">
      <Head eyebrow="Portfolio" title={w.title} sub="Une sélection de projets récents, chacun pensé pour un objectif précis." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {w.items.map((it, i) => (
          <a key={it.name + i} href="#contact" data-service={it.name} className={`rv group relative overflow-hidden rounded-s ${i % 5 === 0 ? "sm:col-span-2" : ""}`} style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
            <div className={`overflow-hidden ${i % 5 === 0 ? "aspect-[16/8]" : "aspect-[4/3]"}`}>
              <Img src={it.image} alt={it.name} className="transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">{it.tag}{it.year ? ` · ${it.year}` : ""}</p>
                <h3 className="mt-1 truncate font-s-head text-lg md:text-xl">{it.name}</h3>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition-all group-hover:bg-s-primary group-hover:text-s-onprimary">↗</span>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}

// ── Témoignages ──────────────────────────────────────────────────
export function Testimonials({ d, v }: SectionProps) {
  const t = d.testimonials;
  if (!t.length) return null;
  if (v === "quote")
    return (
      <Section className="bg-s-card">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rv flex justify-center"><Stars /></div>
          <p className="rv mt-8 font-s-head text-3xl leading-snug md:text-5xl">« {t[0].text} »</p>
          <p className="rv mt-8 font-semibold">{t[0].name}</p>
          <p className="rv text-sm text-s-muted">{t[0].role}</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {t.slice(1).map((x) => (
            <figure key={x.name} className="rv rounded-s border border-s-border p-6">
              <blockquote className="text-s-muted">« {x.text} »</blockquote>
              <figcaption className="mt-4 text-sm font-semibold">{x.name} <span className="font-normal text-s-muted">· {x.role}</span></figcaption>
            </figure>
          ))}
        </div>
      </Section>
    );
  return (
    <Section>
      <Head eyebrow="Témoignages" title="Ils nous font confiance" center />
      <div className="grid gap-6 md:grid-cols-3">
        {t.map((x, i) => (
          <figure key={x.name} className="rv flex flex-col rounded-s bg-s-card p-8 shadow-sm ring-1 ring-s-border" style={{ transitionDelay: `${i * 120}ms` }}>
            <Stars />
            <blockquote className="mt-5 flex-1 leading-relaxed">« {x.text} »</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-s-primary font-semibold text-s-onprimary">{x.name[0]}</span>
              <span><span className="block text-sm font-semibold">{x.name}</span><span className="text-xs text-s-muted">{x.role}</span></span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

// ── Formation (portfolio) ───────────────────────────────────────
// Parcours sobre, sans image : diplômes / certifications en frise
export function Education({ d }: SectionProps) {
  const items = d.education?.filter((e) => e.title.trim()) ?? [];
  if (!items.length) return null;
  return (
    <Section id="formation">
      <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
        <div>
          <Eyebrow>Parcours</Eyebrow>
          <H2>Formation</H2>
        </div>
        <ol className="relative border-l border-s-border">
          {items.map((e, i) => (
            <li key={e.title + i} className="rv relative pb-10 pl-8 last:pb-0" style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-s-bg bg-s-primary" />
              {e.year && <p className="text-xs font-semibold uppercase tracking-widest text-s-primary">{e.year}</p>}
              <h3 className="mt-1 font-s-head text-xl md:text-2xl">{e.title}</h3>
              {e.school && <p className="mt-1 text-s-muted">{e.school}</p>}
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────
export function Faq({ d }: SectionProps) {
  if (!d.faq.length) return null;
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <H2>Questions fréquentes</H2>
          <p className="rv mt-5 text-s-muted">Vous ne trouvez pas votre réponse ? Contactez-nous directement.</p>
        </div>
        <div className="divide-y divide-s-border border-y border-s-border">
          {d.faq.map((f) => (
            <details key={f.q} className="rv group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-s-head text-xl">
                {f.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-s-border transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 text-s-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ── Appel à l'action ─────────────────────────────────────────────
export function CtaBlock({ d, v }: SectionProps) {
  if (v === "image")
    return (
      <section className="relative overflow-hidden px-6 py-32 text-center text-white">
        <div className="absolute inset-0" data-parallax><Img src={d.gallery.images[1] ?? d.hero.image} /></div>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto max-w-3xl">
          <H2 className="md:text-6xl">Prêt à nous rejoindre ?</H2>
          <p className="rv mt-5 text-lg text-white/80">{d.tagline}</p>
          <div className="rv mt-10"><Cta d={d} /></div>
        </div>
      </section>
    );
  return (
    <section className="px-6 py-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[calc(var(--c-r)*1.5)] bg-s-primary px-8 py-16 text-s-onprimary md:px-16">
        <div className="blob absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="rv font-s-head text-3xl md:text-5xl">Parlons de votre projet</h2>
            <p className="rv mt-3 max-w-lg opacity-80">Réponse rapide, sans engagement.</p>
          </div>
          <div className="rv"><Btn href={ctaHref(d)} variant="light">{d.cta.label} →</Btn></div>
        </div>
      </div>
    </section>
  );
}

// ── Contact ──────────────────────────────────────────────────────
function Infos({ d }: { d: SectionProps["d"] }) {
  const c = d.contact;
  const wa = c.whatsapp.replace(/\D/g, "");
  const rows = [
    c.phone && { Icon: Phone, label: "Téléphone", value: c.phone, href: `tel:${c.phone.replace(/[^\d+]/g, "")}` },
    wa && { Icon: MessageCircle, label: "WhatsApp", value: c.whatsapp, href: `https://wa.me/${wa}` },
    c.email && { Icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.address && { Icon: MapPin, label: "Adresse", value: c.address },
    c.hours && { Icon: Clock, label: "Horaires", value: c.hours },
  ].filter(Boolean) as { Icon: typeof Phone; label: string; value: string; href?: string }[];
  return (
    <ul className="space-y-5">
      {rows.map(({ Icon, label, value, href }) => (
        <li key={label} className="rv flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-s bg-s-primary/10 text-s-ink"><Icon size={20} /></span>
          <span>
            <span className="block text-xs uppercase tracking-widest text-s-muted">{label}</span>
            {href ? <a href={href} className="font-medium hover:text-s-ink">{value}</a> : <span className="font-medium">{value}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Contact({ d, v, slug }: SectionProps) {
  if (v === "card")
    return (
      <Section id="contact">
        <div className="rounded-[calc(var(--c-r)*1.5)] bg-s-card p-8 ring-1 ring-s-border md:p-14">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <Eyebrow>Contact</Eyebrow>
              <H2>Écrivons la suite ensemble</H2>
              <p className="rv mb-10 mt-5 text-s-muted">Une question, une demande ? Nous vous répondons rapidement.</p>
              <Infos d={d} />
            </div>
            <ContactForm slug={slug} d={d} />
          </div>
        </div>
      </Section>
    );
  return (
    <Section id="contact" className="bg-s-card">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <Eyebrow>Contact</Eyebrow>
          <H2>Contactez {d.name}</H2>
          <p className="rv mb-10 mt-5 text-lg text-s-muted">Nous sommes à votre écoute. Écrivez-nous ou passez nous voir.</p>
          <Infos d={d} />
        </div>
        <div className="rounded-s bg-s-bg p-8 shadow-xl ring-1 ring-s-border"><ContactForm slug={slug} d={d} /></div>
      </div>
    </Section>
  );
}
