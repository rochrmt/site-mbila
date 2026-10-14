import { Menu, MessageCircle, Phone } from "lucide-react";
import type { SiteData, Template } from "../types";
import { ctaHref } from "./parts";

const LINKS: [string, string, string][] = [
  ["about", "about", "À propos"],
  ["services", "services", "Services"],
  ["gallery", "gallery", "Galerie"],
  ["contact", "contact", "Contact"],
];

// Menu burger mobile (panneau déroulant, ancre à gauche ou à droite)
function MobileMenu({ links, href, label, left }: { links: React.ReactNode; href: string; label: string; left?: boolean }) {
  const ext = href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {};
  return (
    <details className="relative md:hidden">
      <summary className="list-none rounded-full p-2" aria-label="Menu"><Menu size={22} /></summary>
      <nav className={`absolute ${left ? "left-0" : "right-0"} mt-3 flex w-56 flex-col gap-4 rounded-s bg-s-card p-6 text-left text-s-fg shadow-2xl ring-1 ring-s-border`}>
        {links}
        <a href={href} {...ext} className="rounded-btn bg-s-primary px-4 py-3 text-center text-sm font-semibold text-s-onprimary">{label}</a>
      </nav>
    </details>
  );
}

// Ancres de navigation présentes dans le design ([section, ancre, libellé])
function navLinks(d: SiteData, tpl: Template) {
  const has = new Set(tpl.sections.map(([k]) => k));
  return LINKS.filter(([k]) => has.has(k as never)).map(([k, id, label]): [string, string] => [id, k === "services" ? d.services.title : label]);
}

export function Nav({ d, tpl }: { d: SiteData; tpl: Template }) {
  const links = navLinks(d, tpl);
  const hero = tpl.sections[0][1];
  const overlay = tpl.nav === "overlay" && ["fullscreen", "slider", "cinema", "lifestyle"].includes(hero);
  const centered = tpl.nav === "centered";
  const Logo = (
    <a href="#" className="font-s-head text-xl font-semibold tracking-tight md:text-2xl">
      {d.logo ? (
        <span className="flex min-w-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={d.logo}
            alt={d.name}
            className="w-auto max-w-[60vw] shrink-0 object-contain"
            // Sur mobile, le logo est plafonné pour ne pas envahir la barre
            style={{ height: `min(${Math.min(160, Math.max(20, d.logoSize ?? 40))}px, 64px + 4vw)` }}
          />
          <span className="truncate">{d.name}</span>
        </span>
      ) : (
        d.name
      )}
    </a>
  );
  const Links = (
    <>
      {links.map(([id, label]) => (
        <a key={id} href={`#${id}`} className="text-sm font-medium opacity-80 transition hover:opacity-100">
          {label}
        </a>
      ))}
      {d.store?.url && /^https?:\/\//i.test(d.store.url) && (
        <a href={d.store.url} target="_blank" rel="noopener" className="text-sm font-semibold text-s-primary transition hover:brightness-110">
          {d.store.label?.trim() || "Boutique en ligne"} ↗
        </a>
      )}
    </>
  );
  const href = ctaHref(d);
  const ext = href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {};
  const menu = (left?: boolean) => <MobileMenu links={Links} href={href} label={d.cta.label} left={left} />;

  // Luxe : ville à gauche, logo centré espacé, « Réserver » à droite, liens en 2e ligne
  if (tpl.nav === "luxe") {
    const over = ["cinema", "fullscreen", "slider", "lifestyle"].includes(hero);
    return (
      <header data-nav data-overlay={over || undefined} className={`site-nav fixed inset-x-0 top-0 z-50 transition-all duration-500 ${over ? "text-white" : "bg-s-bg"}`}>
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div>
              <span className="hidden truncate text-[11px] uppercase tracking-[0.3em] opacity-80 md:block">{d.city || d.tagline}</span>
              {menu(true)}
            </div>
            <div className="min-w-0 text-center [&_a]:text-sm [&_a]:font-normal [&_a]:uppercase [&_a]:leading-snug [&_a]:tracking-[0.2em] md:[&_a]:text-2xl md:[&_a]:tracking-[0.28em]">{Logo}</div>
            <div className="flex justify-end">
              {/* Sur mobile le bouton est dans le menu burger (sinon il s'écrase) */}
              <a href={href} {...ext} className="hidden whitespace-nowrap border border-current px-6 py-2.5 text-[11px] uppercase tracking-[0.28em] transition hover:bg-s-fg hover:text-s-bg md:inline-flex">{d.cta.label}</a>
            </div>
          </div>
          <nav className="mt-4 hidden justify-center gap-12 border-t border-current/15 pt-3 md:flex [&_a]:!text-current [&_a]:text-[11px] [&_a]:uppercase [&_a]:tracking-[0.3em]">{Links}</nav>
        </div>
      </header>
    );
  }

  // Fine barre translucide (sticky, 48 px), petits liens centrés
  if (tpl.nav === "glass")
    return (
      <header className="sticky top-0 z-50 border-b border-s-border/60 bg-s-bg/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-6 px-6">
          <div className="min-w-0 [&_a]:text-[17px]">{Logo}</div>
          <nav className="hidden items-center gap-8 md:flex [&_a]:text-xs [&_a]:font-normal">{Links}</nav>
          <div className="flex items-center gap-2">
            <a href={href} {...ext} className="hidden rounded-full bg-s-primary px-3.5 py-1 text-xs text-s-onprimary transition hover:brightness-110 md:inline-flex">{d.cta.label}</a>
            {menu()}
          </div>
        </div>
      </header>
    );

  // Boutique : bandeau d'annonce, liens à gauche, logo centré, bouton à droite (sticky)
  if (tpl.nav === "shop")
    return (
      <header className="sticky top-0 z-50 bg-s-bg">
        <div className="bg-s-card px-4 py-2 text-center text-[11px] font-medium md:text-xs">
          {d.tagline}
          <a href={href} {...ext} className="ml-2 font-semibold underline underline-offset-2">{d.cta.label}</a>
        </div>
        <div className="border-b border-s-border">
          <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4">
            <div>
              <nav className="hidden items-center gap-7 md:flex">{Links}</nav>
              {menu(true)}
            </div>
            <div className="text-center [&_a]:text-2xl [&_a]:font-bold">{Logo}</div>
            <div className="flex justify-end">
              <a href={href} {...ext} className="hidden whitespace-nowrap rounded-btn bg-s-fg px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-s-bg transition hover:opacity-85 md:inline-flex">{d.cta.label}</a>
            </div>
          </div>
        </div>
      </header>
    );

  // Institutionnel : barre couleur pleine, écusson + nom en capitales, liens espacés (sticky)
  if (tpl.nav === "academic")
    return (
      <header className="sticky top-0 z-50 bg-s-primary text-s-onprimary">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
          {d.logo ? (
            Logo
          ) : (
            <a href="#" className="flex min-w-0 items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center border border-current/40 font-s-head text-2xl">{d.name.charAt(0)}</span>
              <span className="line-clamp-2 min-w-0 font-s-head text-base uppercase leading-tight tracking-[0.12em] md:text-lg">{d.name}</span>
            </a>
          )}
          <nav className="hidden items-center gap-8 md:flex [&_a]:!text-current [&_a]:text-[13px] [&_a]:uppercase [&_a]:tracking-[0.12em]">{Links}</nav>
          <div className="flex shrink-0 items-center gap-3">
            <a href={href} {...ext} className="hidden border border-current/50 px-5 py-2.5 text-[13px] font-semibold transition hover:bg-s-onprimary hover:text-s-primary md:inline-flex">{d.cta.label}</a>
            {menu()}
          </div>
        </div>
      </header>
    );

  return (
    <header
      data-nav
      data-overlay={overlay || undefined}
      className={`site-nav fixed inset-x-0 top-0 z-50 transition-all duration-500 ${overlay ? "text-white" : ""}`}
    >
      <div className={`mx-auto flex max-w-7xl items-center gap-8 px-6 py-5 ${centered ? "md:flex-col md:gap-3" : "justify-between"}`}>
        <div className={`flex items-center justify-between ${centered ? "w-full md:justify-center" : "flex-1 md:flex-none"}`}>
          {Logo}
          {menu()}
        </div>
        <nav className={`hidden items-center gap-8 md:flex ${centered ? "" : ""}`}>{Links}</nav>
        {tpl.nav !== "minimal" && !centered && (
          <a href={ctaHref(d)} className="hidden rounded-btn bg-s-primary px-5 py-2.5 text-sm font-semibold text-s-onprimary transition hover:brightness-110 md:inline-flex">
            {d.cta.label}
          </a>
        )}
      </div>
    </header>
  );
}

// Icônes de réseaux sociaux (inline SVG style outline — lucide n'embarque plus les marques)
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </>
  ),
  tiktok: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />,
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v2" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
};

function SocialLinks({ d, big }: { d: SiteData; big?: boolean }) {
  const socials = Object.entries(d.socials).filter(([, v]) => v && /^https?:\/\//i.test(v));
  if (!socials.length) return null;
  return (
    <div className={`flex ${big ? "gap-3" : "gap-2.5"}`}>
      {socials.map(([k, v]) => (
        <a
          key={k}
          href={v}
          target="_blank"
          rel="noopener"
          aria-label={k}
          title={k}
          className={`grid place-items-center rounded-full border border-s-border text-s-muted transition hover:border-s-primary hover:text-s-fg ${big ? "h-10 w-10" : "h-9 w-9"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            {SOCIAL_ICONS[k] ?? <circle cx="12" cy="12" r="9" />}
          </svg>
        </a>
      ))}
    </div>
  );
}

export function Footer({ d, tpl }: { d: SiteData; tpl: Template }) {
  const year = new Date().getFullYear();
  const credit = (
    <a href="https://mbila.ca" target="_blank" rel="noopener" className="opacity-60 transition hover:opacity-100">
      Créé avec Mbila
    </a>
  );
  const c = d.contact;
  const links = navLinks(d, tpl).map(([id, label]) => (
    <a key={id} href={`#${id}`} className="transition hover:text-s-fg">{label}</a>
  ));
  const digits = (s: string) => s.replace(/\D/g, "");
  const contact = [c.phone, digits(c.whatsapp) !== digits(c.phone) && c.whatsapp, c.email, c.address].filter(Boolean) as string[];

  // Centré élégant : nom espacé, liens en capitales fines
  if (tpl.footer === "center")
    return (
      <footer className="border-t border-s-border px-6 pb-10 pt-20 text-center">
        <p className="font-s-head text-3xl uppercase tracking-[0.3em] md:text-4xl">{d.name}</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-s-muted">{d.tagline}</p>
        <nav className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-3 text-[11px] uppercase tracking-[0.3em] text-s-muted">{links}</nav>
        <div className="mt-8 flex justify-center"><SocialLinks d={d} big /></div>
        <div className="mx-auto mt-14 flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-2 border-t border-s-border pt-8 text-xs text-s-muted">
          <span>© {year} {d.name}</span>
          {contact.map((x) => <span key={x}>{x}</span>)}
          {credit}
        </div>
      </footer>
    );

  // Fin et discret : petites colonnes grises sur aplat clair
  if (tpl.footer === "fine")
    return (
      <footer className="bg-s-card px-6 pb-8 pt-10 text-xs text-s-muted">
        <div className="mx-auto max-w-5xl">
          <p className="border-b border-s-border pb-4 leading-relaxed">{d.tagline}{c.address ? ` · ${c.address}` : ""}</p>
          <div className="grid grid-cols-2 gap-8 py-8 md:grid-cols-4">
            <div><p className="mb-3 font-semibold text-s-fg">Découvrir</p><div className="flex flex-col gap-2">{links}</div></div>
            <div><p className="mb-3 font-semibold text-s-fg">Contact</p><div className="flex flex-col gap-2">{contact.slice(0, 3).map((x) => <span key={x}>{x}</span>)}</div></div>
            <div><p className="mb-3 font-semibold text-s-fg">Horaires</p><p>{c.hours}</p></div>
            <div><p className="mb-3 font-semibold text-s-fg">Suivez-nous</p><SocialLinks d={d} /></div>
          </div>
          <div className="flex flex-wrap justify-between gap-3 border-t border-s-border pt-4">
            <span>Copyright © {year} {d.name}. Tous droits réservés.</span>
            {credit}
          </div>
        </div>
      </footer>
    );

  // Sombre en couleur : aplat de la couleur principale, colonnes et bouton inversé
  if (tpl.footer === "dark") {
    const href = ctaHref(d);
    return (
      <footer className="bg-s-primary px-6 pb-10 pt-20 text-s-onprimary">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="font-s-head text-3xl">{d.name}</p>
            <p className="mt-4 max-w-sm opacity-70">{d.tagline}</p>
            <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})} className="mt-8 inline-flex rounded-btn bg-s-onprimary px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-s-primary transition hover:opacity-90">{d.cta.label}</a>
          </div>
          <div><p className="text-xs font-semibold uppercase tracking-widest opacity-60">Explorer</p><div className="mt-4 flex flex-col gap-2.5 text-sm [&_a:hover]:!text-current [&_a:hover]:underline">{links}</div></div>
          <div><p className="text-xs font-semibold uppercase tracking-widest opacity-60">Contact</p><ul className="mt-4 space-y-2.5 text-sm">{contact.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Horaires</p>
            <p className="mt-4 text-sm">{c.hours}</p>
            <div className="mt-6"><SocialLinks d={d} /></div>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-7xl flex-wrap justify-between gap-4 border-t border-current/15 pt-8 text-xs opacity-70">
          <span>© {year} {d.name}. Tous droits réservés.</span>
          {credit}
        </div>
      </footer>
    );
  }
  if (tpl.footer === "big")
    return (
      <footer className="border-t border-s-border px-6 pb-10 pt-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-s-head text-3xl">{d.name}</p>
            <p className="mt-4 max-w-sm text-s-muted">{d.tagline}</p>
            <div className="mt-6"><SocialLinks d={d} big /></div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-s-muted">Contact</p>
            <ul className="mt-4 space-y-2 text-sm">
              {d.contact.phone && <li>{d.contact.phone}</li>}
              {d.contact.email && <li>{d.contact.email}</li>}
              {d.contact.address && <li>{d.contact.address}</li>}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-s-muted">Horaires</p>
            <p className="mt-4 text-sm">{d.contact.hours}</p>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-6xl flex-wrap justify-between gap-4 border-t border-s-border pt-8 text-xs text-s-muted">
          <span>© {year} {d.name}. Tous droits réservés.</span>
          {credit}
        </div>
      </footer>
    );
  return (
    <footer className="border-t border-s-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-s-muted">
        <span className="font-s-head text-lg text-s-fg">{d.name}</span>
        <SocialLinks d={d} />
        <span>© {year} · {credit}</span>
      </div>
    </footer>
  );
}

// Bandeau boutique externe (Chariow, Maketou…) — affiché juste sous le hero
export function StoreBand({ d }: { d: SiteData }) {
  const s = d.store;
  if (!s?.url || !/^https?:\/\//i.test(s.url)) return null;
  return (
    <section className="border-y border-s-border bg-s-card/50 px-6 py-10">
      <div className="rv mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-5 text-center">
        <p className="font-s-head text-xl md:text-2xl">Retrouvez nos produits sur notre boutique en ligne</p>
        <a
          href={s.url}
          target="_blank"
          rel="noopener"
          className="rounded-btn bg-s-primary px-7 py-3 font-semibold text-s-onprimary shadow-lg transition hover:scale-[1.03] hover:brightness-110"
        >
          {s.label?.trim() || "Commander en ligne"} ↗
        </a>
      </div>
    </section>
  );
}

export function FloatingCta({ d }: { d: SiteData }) {
  const wa = d.cta.type === "whatsapp";
  const Icon = wa ? MessageCircle : Phone;
  if (!["whatsapp", "call"].includes(d.cta.type)) return null;
  return (
    <a
      href={ctaHref(d)}
      target="_blank"
      rel="noopener"
      aria-label={d.cta.label}
      className={`fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full text-white shadow-2xl transition hover:scale-110 ${wa ? "bg-[#25D366]" : "bg-s-primary"}`}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-inherit opacity-30" />
      <Icon size={26} />
    </a>
  );
}
