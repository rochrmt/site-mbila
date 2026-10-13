import { Btn, Cta, Img, Stars, Words, type SectionProps } from "./parts";
import HeroSlider from "./HeroSlider";
import { FxLayer, HeroImg, HeroText } from "./fx";

const Badge = ({ children, light }: { children: React.ReactNode; light?: boolean }) => (
  <span
    className={`rv inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${light ? "bg-white/15 text-white backdrop-blur" : "bg-s-primary/10 text-s-ink"}`}
  >
    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
    {children}
  </span>
);

const secondary = (tpl: SectionProps["tpl"]) =>
  tpl.sections.some(([k]) => k === "services") ? "#services" : "#about";

export default function Hero({ d, v, tpl }: SectionProps) {
  const h = d.hero;
  // Portfolio : le hero présente la PERSONNE — nom en titre, métier dessous
  const folio = d.category === "portfolio";
  const title = folio ? d.name : h.title;
  const label = folio ? (d.city ? `Portfolio · ${d.city}` : "Portfolio") : d.city ? `${d.name} · ${d.city}` : d.name;
  const role =
    folio && v !== "portrait" && v !== "showcase" && h.title ? (
      <p className="rv mt-5 inline-flex items-center gap-3 font-s-head text-2xl md:text-4xl">
        <span className="h-px w-10 bg-s-primary" />
        {h.title}
      </p>
    ) : null;

  switch (v) {
    case "fullscreen":
      return (
        <section className="relative flex min-h-[100svh] items-end overflow-hidden text-white">
          <div className="absolute inset-0" data-parallax>
            <HeroImg d={d} kb className="scale-105" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          <FxLayer d={d} />
          <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-40 md:pb-32">
            <Badge light>{label}</Badge>
            <h1 className="hero-title mt-6 max-w-4xl font-s-head text-5xl leading-[1.02] md:text-7xl lg:text-8xl">
              <Words text={title} />
            </h1>
            <HeroText d={d} />{role}
            <p className="rv mt-6 max-w-xl text-lg text-white/80 md:text-xl">{h.subtitle}</p>
            <div className="rv mt-10 flex flex-wrap gap-4">
              <Cta d={d} />
              <Btn href={secondary(tpl)} variant="ghost">Découvrir</Btn>
            </div>
          </div>
          <div className="scroll-hint absolute bottom-8 right-8 hidden h-14 w-8 justify-center rounded-full border border-white/40 pt-2 md:flex">
            <span className="h-2 w-1 rounded-full bg-white" />
          </div>
        </section>
      );

    case "slider":
      return (
        <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden text-center text-white">
          <HeroSlider images={h.images.length ? h.images : [h.image]} alt={d.name} />
          <div className="absolute inset-0 bg-black/55" />
          <FxLayer d={d} />
          <div className="relative mx-auto max-w-4xl px-6 py-40">
            <p className="rv mb-6 text-xs font-semibold uppercase tracking-[0.5em] text-s-accent">{label}</p>
            <h1 className="hero-title font-s-head text-5xl leading-[1.05] md:text-7xl">
              <Words text={title} />
            </h1>
            <HeroText d={d} />{role}
            <div className="rv mx-auto my-8 h-px w-24 bg-s-accent" />
            <p className="rv mx-auto max-w-2xl text-lg text-white/80">{h.subtitle}</p>
            <div className="rv mt-10 flex flex-wrap justify-center gap-4">
              <Cta d={d} />
              <Btn href={secondary(tpl)} variant="ghost">En savoir plus</Btn>
            </div>
          </div>
        </section>
      );

    case "editorial":
      return (
        <section className="relative overflow-hidden px-6 pb-16 pt-32 md:pt-40">
          <FxLayer d={d} />
          <div className="relative mx-auto max-w-7xl">
            <div className="rv flex items-center justify-between border-b border-s-border pb-4 text-xs uppercase tracking-[0.3em] text-s-muted">
              <span>{d.city || "Collection"}</span>
              <span>{new Date().getFullYear()}</span>
            </div>
            <h1 className="hero-title mt-8 font-s-head text-[13vw] leading-[0.9] tracking-tight md:text-[9vw]">
              <Words text={d.name} />
            </h1>
            <HeroText d={d} />{role}
            <div className="mt-10 grid gap-10 md:grid-cols-12">
              <div className="md:col-span-4">
                <p className="rv font-s-head text-2xl leading-snug">{h.title}</p>
                <p className="rv mt-5 text-s-muted">{h.subtitle}</p>
                <div className="rv mt-8"><Cta d={d} /></div>
              </div>
              <div className="rv relative aspect-[16/10] overflow-hidden rounded-s md:col-span-8" data-tilt>
                <HeroImg d={d} kb />
              </div>
            </div>
          </div>
        </section>
      );

    case "bold":
      return (
        <section className="relative overflow-hidden bg-s-bg px-6 pb-20 pt-32 md:pt-40">
          <FxLayer d={d} />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div className="relative z-10">
              <Badge>{label}</Badge>
              <h1 className="hero-title mt-6 font-s-head text-5xl font-extrabold leading-[0.95] sm:text-6xl xl:text-7xl">
                <Words text={title} />
              </h1>
              <HeroText d={d} />{role}
              <p className="rv mt-8 max-w-lg text-lg text-s-muted">{h.subtitle}</p>
              <div className="rv mt-10 flex flex-wrap gap-4">
                <Cta d={d} />
                <Btn href={secondary(tpl)} variant="outline">Voir plus</Btn>
              </div>
            </div>
            <div className="rv relative">
              <div className="absolute -inset-4 -rotate-3 rounded-s bg-s-primary" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-s" data-tilt>
                <HeroImg d={d} kb />
              </div>
              <div className="spin-slow absolute -bottom-10 -left-10 hidden h-36 w-36 md:block">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <defs><path id="c" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs>
                  <circle cx="50" cy="50" r="50" className="fill-s-accent" />
                  <text className="fill-s-bg text-[9px] font-bold uppercase tracking-[0.2em]">
                    <textPath href="#c">{`${d.name} • ${d.cta.label} • `}</textPath>
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </section>
      );

    case "collage": {
      const imgs = [h.image, ...h.images.filter((x) => x !== h.image)].slice(0, 4);
      return (
        <section className="relative overflow-hidden px-6 pb-20 pt-32 md:pt-40">
          <div className="blob absolute -left-32 top-20 h-96 w-96 rounded-full bg-s-primary/20 blur-3xl" />
          <div className="blob absolute -right-32 top-60 h-96 w-96 rounded-full bg-s-accent/25 blur-3xl" style={{ animationDelay: "-6s" }} />
          <FxLayer d={d} />
          <div className="relative mx-auto max-w-4xl text-center">
            <Badge>{label}</Badge>
            <h1 className="hero-title mt-6 font-s-head text-5xl leading-[1.05] md:text-7xl">
              <Words text={title} />
            </h1>
            <HeroText d={d} />{role}
            <p className="rv mx-auto mt-6 max-w-2xl text-lg text-s-muted">{h.subtitle}</p>
            <div className="rv mt-10 flex flex-wrap justify-center gap-4">
              <Cta d={d} />
              <Btn href={secondary(tpl)} variant="outline">Découvrir</Btn>
            </div>
          </div>
          <div className="relative mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
            {imgs.map((src, i) => (
              <div
                key={src + i}
                className={`rv float overflow-hidden rounded-s shadow-2xl ${["aspect-[3/4] md:mt-12", "aspect-[3/4]", "aspect-[3/4] md:mt-16", "aspect-[3/4] md:mt-4"][i]}`}
                style={{ transitionDelay: `${i * 120}ms`, animationDelay: `${i * -1.5}s` }}
              >
                <Img src={src} alt="" />
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "gradient":
      return (
        <section className="relative overflow-hidden px-6 pb-24 pt-36 md:pt-44">
          <div className="mesh absolute inset-0 -z-0 opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent,var(--c-bg)_70%)]" />
          <FxLayer d={d} />
          <div className="relative mx-auto max-w-5xl text-center">
            <Badge>{label}</Badge>
            <h1 className="hero-title mt-6 font-s-head text-5xl font-bold leading-[1.02] md:text-7xl">
              <span className="grad-text"><Words text={title} /></span>
            </h1>
            <HeroText d={d} />{role}
            <p className="rv mx-auto mt-6 max-w-2xl text-lg text-s-muted">{h.subtitle}</p>
            <div className="rv mt-10 flex flex-wrap justify-center gap-4">
              <Cta d={d} />
              <Btn href={secondary(tpl)} variant="outline">Explorer</Btn>
            </div>
          </div>
          <div className="rv relative mx-auto mt-16 max-w-5xl">
            <div className="rounded-[calc(var(--c-r)+8px)] border border-s-border bg-s-card/60 p-2 shadow-2xl backdrop-blur">
              <div className="flex gap-1.5 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-s-fg/20" /><span className="h-2.5 w-2.5 rounded-full bg-s-fg/20" /><span className="h-2.5 w-2.5 rounded-full bg-s-fg/20" />
              </div>
              <div className="relative aspect-[16/8] overflow-hidden rounded-s">
                <HeroImg d={d} kb />
              </div>
            </div>
          </div>
        </section>
      );

    case "card":
      return (
        <section className="px-4 pb-10 pt-24 md:px-6 md:pt-28">
          <div className="relative mx-auto flex min-h-[78svh] max-w-7xl items-end overflow-hidden rounded-[calc(var(--c-r)*1.5)] text-white">
            <div className="absolute inset-0" data-parallax><HeroImg d={d} kb /></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />
            <FxLayer d={d} />
            <div className="relative grid w-full gap-8 p-8 md:grid-cols-3 md:p-14">
              <div className="md:col-span-2">
                <Badge light>{label}</Badge>
                <h1 className="hero-title mt-5 font-s-head text-4xl leading-[1.05] md:text-6xl">
                  <Words text={title} />
                </h1>
                <HeroText d={d} />{role}
                <p className="rv mt-5 max-w-xl text-white/80">{h.subtitle}</p>
                <div className="rv mt-8"><Cta d={d} /></div>
              </div>
              {d.testimonials[0] && (
                <div className="rv self-end rounded-s bg-white/10 p-6 backdrop-blur-md">
                  <Stars />
                  <p className="mt-3 text-sm text-white/90">« {d.testimonials[0].text} »</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/60">{d.testimonials[0].name}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      );

    case "minimal":
      return (
        <section className="relative overflow-hidden px-6 pb-10 pt-36 md:pt-44">
          <FxLayer d={d} />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="rv text-xs uppercase tracking-[0.4em] text-s-muted">{label}</p>
            <h1 className="hero-title mt-8 font-s-head text-5xl leading-[1.1] md:text-6xl">
              <Words text={title} />
            </h1>
            <HeroText d={d} />{role}
            <p className="rv mx-auto mt-6 max-w-xl text-lg text-s-muted">{h.subtitle}</p>
            <div className="rv mt-10"><Cta d={d} /></div>
          </div>
          <div className="rv relative mx-auto mt-20 aspect-[21/9] max-w-7xl overflow-hidden rounded-s">
            <HeroImg d={d} kb />
          </div>
        </section>
      );

    case "portrait":
      return (
        <section className="relative overflow-hidden px-6 pb-24 pt-32 md:pt-40">
          <div className="blob absolute -left-32 top-24 h-96 w-96 rounded-full bg-s-primary/15 blur-3xl" />
          <div className="blob absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-s-accent/15 blur-3xl" style={{ animationDelay: "-8s" }} />
          <FxLayer d={d} />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="rv inline-flex items-center gap-2.5 rounded-full border border-s-border bg-s-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-s-muted">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Disponible pour de nouveaux projets
              </p>
              <h1 className="hero-title mt-7 font-s-head text-6xl leading-[0.98] tracking-tight md:text-8xl">
                <Words text={d.name} />
              </h1>
              <HeroText d={d} />{role}
              <p className="rv mt-5 font-s-head text-2xl text-s-ink md:text-4xl">{h.title}</p>
              <p className="rv mt-5 max-w-xl text-lg text-s-muted">{h.subtitle}</p>
              <div className="rv mt-10 flex flex-wrap gap-4">
                <Btn href="#works">Voir mes travaux</Btn>
                <Cta d={d} variant="outline" />
              </div>
            </div>
            <div className="rv relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-s" data-parallax-img data-tilt>
                <HeroImg d={d} />
              </div>
              {d.about.stats[0] && (
                <div className="absolute -bottom-6 -left-6 rounded-s bg-s-primary px-6 py-4 text-s-onprimary shadow-xl">
                  <p className="font-s-head text-2xl">{d.about.stats[0].value}</p>
                  <p className="text-[11px] uppercase tracking-wider opacity-80">{d.about.stats[0].label}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      );

    case "showcase":
      // Portfolio éditorial : énorme titre de rôle + portrait + ruban de services
      // numérotés (style Folioblox / Developer X / Ali Hassan)
      return (
        <section className="relative overflow-hidden px-6 pb-20 pt-36 md:pt-44">
          {/* mot décoratif géant en fond, style « PORTFOLIO » outline */}
          <span aria-hidden className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 select-none whitespace-nowrap font-s-head text-[16vw] font-black uppercase leading-none tracking-tight text-s-fg/[0.05]">
            Portfolio
          </span>
          <FxLayer d={d} />
          <div className="relative mx-auto max-w-7xl">
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.5fr_1fr]">
              <div className="relative z-10">
                <p className="rv text-lg text-s-muted">Bonjour, je suis</p>
                <h1 className="hero-title mt-4 font-s-head text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl xl:text-8xl">
                  <Words text={title} />
                </h1>
                {folio && h.title && (
                  <p className="rv mt-5 font-s-head text-2xl font-semibold text-s-primary md:text-4xl">{h.title}</p>
                )}
                <p className="rv mt-6 max-w-md text-lg text-s-muted">{h.subtitle}</p>
                <div className="rv mt-9 flex flex-wrap items-center gap-4">
                  <Btn href="#works">Voir mes travaux ↗</Btn>
                  <Cta d={d} variant="outline" />
                </div>
              </div>
              <div className="rv relative">
                <div className="absolute -inset-6 rounded-[calc(var(--c-r)*2)] bg-gradient-to-tl from-s-primary/30 to-s-accent/20 blur-2xl" />
                <div className="relative aspect-[3/4] overflow-hidden rounded-s" data-parallax-img data-tilt>
                  <HeroImg d={d} kb />
                  <div className="absolute inset-0 bg-gradient-to-t from-s-bg/60 via-transparent to-transparent" />
                </div>
                <span className="rv absolute -right-3 bottom-10 rotate-[-3deg] rounded-full bg-s-primary px-5 py-2.5 text-sm font-semibold text-s-onprimary shadow-xl">
                  ● Disponible pour des projets
                </span>
              </div>
            </div>
            {/* ruban numéroté des expertises — sous la composition */}
            {d.services.items.length > 0 && (
              <div className="rv relative mt-20 grid grid-cols-2 gap-x-10 gap-y-8 border-t border-s-border pt-10 md:grid-cols-4">
                {d.services.items.slice(0, 4).map((s, i) => (
                  <div key={s.name} className="group">
                    <span className="font-s-head text-sm font-bold text-s-primary">/0{i + 1}</span>
                    <p className="mt-2 font-s-head text-lg font-semibold leading-snug md:text-xl">{s.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-s-muted">{s.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );

    default: // split
      return (
        <section className="relative overflow-hidden px-6 pb-20 pt-32 md:pt-40">
          <FxLayer d={d} />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
            <div>
              <Badge>{label}</Badge>
              <h1 className="hero-title mt-6 font-s-head text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
                <Words text={title} />
              </h1>
              <HeroText d={d} />{role}
              <p className="rv mt-6 max-w-lg text-lg text-s-muted">{h.subtitle}</p>
              <div className="rv mt-10 flex flex-wrap gap-4">
                <Cta d={d} />
                <Btn href={secondary(tpl)} variant="outline">Nos services</Btn>
              </div>
              <div className="rv mt-12 flex gap-10 border-t border-s-border pt-8">
                {d.about.stats.slice(0, 3).map((s) => (
                  <div key={s.label} className="min-w-0">
                    <p className="whitespace-nowrap font-s-head text-3xl text-s-fg">{s.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-s-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rv relative">
              <div className="absolute -right-6 -top-6 h-full w-full rounded-s border-2 border-s-primary/40" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-s shadow-2xl" data-tilt>
                <HeroImg d={d} kb />
              </div>
              <div className="float absolute -bottom-6 -left-6 rounded-s bg-s-card p-5 shadow-xl ring-1 ring-s-border">
                <Stars />
                <p className="mt-2 text-sm font-semibold">Clients satisfaits</p>
                <p className="text-xs text-s-muted">{d.about.stats[2]?.value} · {d.about.stats[2]?.label}</p>
              </div>
            </div>
          </div>
        </section>
      );
  }
}
