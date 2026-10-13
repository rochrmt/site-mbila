import type { ReactNode } from "react";
import type { SiteData, Template } from "../types";

export type SectionProps = { d: SiteData; v: string; tpl: Template; slug: string };

export function ctaHref(d: SiteData, item?: string) {
  const wa = d.contact.whatsapp.replace(/\D/g, "");
  const msg = item
    ? `Bonjour ${d.name}, je suis intéressé(e) par : ${item}`
    : `Bonjour ${d.name}, je vous contacte depuis votre site.`;
  switch (d.cta.type) {
    case "whatsapp":
      return wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : "#contact";
    case "call":
      return d.contact.phone ? `tel:${d.contact.phone.replace(/[^\d+]/g, "")}` : "#contact";
    case "email":
      return d.contact.email ? `mailto:${d.contact.email}?subject=${encodeURIComponent(item ?? "Demande")}` : "#contact";
    default:
      return "#contact";
  }
}

const ext = (href: string) => href.startsWith("http");

export function Btn({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "light" | "outline";
  className?: string;
}) {
  const styles = {
    primary: "bg-s-primary text-s-onprimary hover:brightness-110 shadow-lg shadow-s-primary/25",
    ghost: "bg-white/10 text-white backdrop-blur border border-white/30 hover:bg-white/20",
    light: "bg-white text-neutral-900 hover:bg-white/90",
    outline: "border border-s-fg/20 text-s-fg hover:bg-s-fg/5",
  }[variant];
  return (
    <a
      href={href}
      {...(ext(href) ? { target: "_blank", rel: "noopener" } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-btn px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 ${styles} ${className}`}
    >
      {children}
    </a>
  );
}

export function Cta({ d, variant, className, item }: { d: SiteData; variant?: "primary" | "ghost" | "light" | "outline"; className?: string; item?: string }) {
  return (
    <Btn href={ctaHref(d, item)} variant={variant} className={className}>
      {d.cta.label}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    </Btn>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`rv mb-4 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-s-ink ${className}`}>
      <span className="h-px w-8 bg-current" />
      {children}
    </p>
  );
}

export function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`rv font-s-head text-4xl leading-[1.08] md:text-5xl ${className}`}>{children}</h2>;
}

export function Head({ eyebrow, title, sub, center }: { eyebrow?: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={`mb-14 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <H2>{title}</H2>
      {sub && <p className="rv mt-5 text-lg text-s-muted">{sub}</p>}
    </div>
  );
}

export function Img({ src, alt = "", className = "", kb }: { src?: string; alt?: string; className?: string; kb?: boolean }) {
  if (!src) return <div className={`bg-s-card ${className}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${kb ? "kb" : ""} ${className}`} />;
}

export function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative px-6 py-24 md:py-32 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export const Stars = () => (
  <div className="flex gap-0.5 text-s-accent" aria-label="5 étoiles">
    {Array.from({ length: 5 }, (_, i) => (
      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
      </svg>
    ))}
  </div>
);

// Découpe un titre en mots pour l'animation "rich"
export function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="word inline-block overflow-hidden align-bottom">
          <span className="inline-block" style={{ transitionDelay: `${i * 70}ms`, animationDelay: `${i * 70}ms` }}>
            {w}&nbsp;
          </span>
        </span>
      ))}
    </>
  );
}
