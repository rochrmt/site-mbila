import { Menu, MessageCircle, Phone } from "lucide-react";
import type { SiteData, Template } from "../types";
import { ctaHref } from "./parts";

const LINKS: [string, string, string][] = [
  ["about", "about", "À propos"],
  ["services", "services", "Services"],
  ["gallery", "gallery", "Galerie"],
  ["contact", "contact", "Contact"],
];

export function Nav({ d, tpl }: { d: SiteData; tpl: Template }) {
  const has = new Set(tpl.sections.map(([k]) => k));
  const links = LINKS.filter(([k]) => has.has(k as never));
  const servicesLabel = d.services.title;
  const overlay = tpl.nav === "overlay" && ["fullscreen", "slider"].includes(tpl.sections[0][1]);
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
      {links.map(([k, id, label]) => (
        <a key={k} href={`#${id}`} className="text-sm font-medium opacity-80 transition hover:opacity-100">
          {k === "services" ? servicesLabel : label}
        </a>
      ))}
      {d.store?.url && /^https?:\/\//i.test(d.store.url) && (
        <a href={d.store.url} target="_blank" rel="noopener" className="text-sm font-semibold text-s-primary transition hover:brightness-110">
          {d.store.label?.trim() || "Boutique en ligne"} ↗
        </a>
      )}
    </>
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
          <details className="relative md:hidden">
            <summary className="list-none rounded-full p-2" aria-label="Menu"><Menu size={22} /></summary>
            <nav className="absolute right-0 mt-3 flex w-56 flex-col gap-4 rounded-s bg-s-card p-6 text-s-fg shadow-2xl ring-1 ring-s-border">
              {Links}
              <a href={ctaHref(d)} className="rounded-btn bg-s-primary px-4 py-3 text-center text-sm font-semibold text-s-onprimary">{d.cta.label}</a>
            </nav>
          </details>
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
