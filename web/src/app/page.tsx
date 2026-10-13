import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Code2, Globe, ImageIcon, LayoutTemplate, Mail, MessageCircle, Palette, PenLine, Smartphone, Sparkles, UploadCloud, Wand2, Zap } from "lucide-react";
import Logo from "@/components/Logo";
import ClaimForm from "@/components/landing/ClaimForm";
import HeroRotate from "@/components/landing/HeroRotate";
import Reveal from "@/components/landing/Reveal";
import Showcase from "@/components/landing/Showcase";
import ScaledFrame from "@/components/ScaledFrame";
import { CATEGORIES, categoryById } from "@/content/categories";
import { DEMO_NAMES } from "@/content/demo";
import { getUser } from "@/lib/auth";
import { DISPLAY_DOMAIN, siteUrl, slugify } from "@/lib/config";
import { getFeaturedSites } from "@/lib/db";
import { TEMPLATES } from "@/templates/library";

const SHOWCASE = ["saveur", "eclat", "arena", "nexus", "residence", "bazar", "academie", "objectif"];
// Capture mobile du modèle (scripts/thumbs.mjs --mobile) pour la maquette téléphone
const hasMobileThumb = (id: string) => existsSync(path.join(process.cwd(), "public", "thumbs", "m", `${id}.jpg`));
const EXAMPLES = ["saveur", "academie", "bazar", "arena", "nexus", "eclat", "folio", "clinique", "traiteur"];

const FEATURES = [
  { Icon: LayoutTemplate, title: "Design sur-mesure", text: "Un design unique, composé pour vous selon votre métier, votre style et vos réponses. Jamais deux sites identiques." },
  { Icon: PenLine, title: "Textes rédigés pour vous", text: "Titres, présentation, services, FAQ : tout est écrit automatiquement, prêt à publier." },
  { Icon: ImageIcon, title: "Images professionnelles", text: "Une banque de photos pro choisies pour votre activité, ou vos propres photos." },
  { Icon: MessageCircle, title: "Clients en un clic", text: "WhatsApp, appel, email, réservation ou devis : vos clients vous contactent sans friction." },
  { Icon: Smartphone, title: "Parfait sur mobile", text: "Chaque site est optimisé pour le téléphone, là où sont vos clients." },
  { Icon: Globe, title: "En ligne instantanément", text: "Votre adresse votre-nom.mbila.ca avec HTTPS, sans aucune configuration." },
];

const FAQ = [
  { q: "Dois-je savoir coder ?", a: "Non. Vous répondez à quelques questions, nous générons le site. Vous pouvez ensuite tout modifier depuis votre tableau de bord." },
  { q: "Combien de temps pour avoir mon site ?", a: "Environ 2 minutes. Votre site est en ligne dès que vous choisissez votre design préféré." },
  { q: "Puis-je changer de design plus tard ?", a: "Oui, à tout moment, en un clic. Vos textes et images sont conservés." },
  { q: "Puis-je utiliser mes propres photos ?", a: "Bien sûr. Ajoutez vos photos à la création ou plus tard. Sinon nous utilisons des photos professionnelles adaptées à votre métier." },
  { q: "J'ai déjà un site (codé moi-même ou avec une IA). Pouvez-vous l'héberger ?", a: "Oui. Envoyez-nous le .zip du projet ou le lien de votre dépôt GitHub depuis la page Hébergement : nous le déployons sur votre nom de domaine avec HTTPS, et le personnalisons si besoin." },
  { q: "Comment mes clients me contactent-ils ?", a: "Via le bouton de votre choix : WhatsApp avec message pré-rempli, appel, email, formulaire de réservation ou de devis. Les messages arrivent aussi dans votre tableau de bord." },
];

export default async function Home() {
  const user = await getUser();
  const domain = DISPLAY_DOMAIN;
  // Vrais sites clients choisis par l'admin en premier, complétés par les modèles de démo
  const realCarousel = getFeaturedSites("carousel").map((s) => ({ id: `site-${s.id}`, name: s.name, label: s.slug, slug: s.slug }));
  const showcase = [
    ...realCarousel,
    ...SHOWCASE.map((id) => {
      const t = TEMPLATES.find((x) => x.id === id)!;
      const cat = t.categories[0];
      const biz = DEMO_NAMES[cat]?.[0] ?? t.name;
      return { id, name: biz, label: slugify(biz), mobile: hasMobileThumb(id) };
    }),
  ].slice(0, Math.max(8, realCarousel.length));
  const realExamples = getFeaturedSites("example").map((s) => ({
    id: `site-${s.id}`, title: s.name, sub: categoryById(s.category).label, slug: s.slug as string | undefined,
  }));
  const examples = [
    ...realExamples,
    ...EXAMPLES.map((id) => {
      const t = TEMPLATES.find((x) => x.id === id)!;
      const cat = t.categories.find((c) => c !== "*") ?? "consulting";
      const label = categoryById(cat).label;
      return { id, title: `Site pour ${label.charAt(0).toLowerCase() + label.slice(1)}`, sub: `Modèle ${t.name}`, slug: undefined };
    }),
  ].slice(0, Math.max(9, realExamples.length));
  const cta = user ? "/dashboard" : "/inscription";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07070c] text-white">
      <Reveal />
      {/* Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#07070c]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a href="#exemples" className="hover:text-white">Exemples</a>
            <a href="#fonctionnement" className="hover:text-white">Comment ça marche</a>
            <Link href="/heberger" className="hover:text-white">Votre projet</Link>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            {!user && <Link href="/connexion" className="text-sm text-white/70 hover:text-white">Connexion</Link>}
            <Link href={cta} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90">
              {user ? "Mon espace" : "Commencer"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pb-28 pt-40 md:pt-48">
        <div className="grid-bg absolute inset-0" />
        <div className="aurora absolute left-1/2 top-0 -z-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/40 via-fuchsia-500/30 to-amber-400/20 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="pop-in inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70">
            <Sparkles size={14} className="text-fuchsia-400" /> Créez votre site ou mettez votre projet en ligne
          </div>
          <h1 className="pop-in mt-8 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl" style={{ animationDelay: "100ms" }}>
            De votre idée<br />
            <span className="brand-text">au web, en 5 minutes.</span>
          </h1>
          <p className="pop-in mx-auto mt-7 max-w-2xl text-lg text-white/60 md:text-xl" style={{ animationDelay: "200ms" }}>
            Deux chemins, un objectif : votre présence en ligne.
          </p>
          <p className="pop-in mx-auto mt-4 max-w-2xl text-base text-white/70 md:text-lg" style={{ animationDelay: "260ms" }}>
            <HeroRotate
              phrases={[
                "Un site vitrine pro, généré pour votre activité.",
                "Le projet que vous avez codé pendant des heures ? On le met en ligne.",
                "Votre idée devient une vraie appli sur le web, même pour votre CV.",
              ]}
            />
          </p>

          {/* Deux chemins */}
          <div className="pop-in mx-auto mt-12 grid max-w-3xl gap-4 text-left md:grid-cols-2" style={{ animationDelay: "300ms" }}>
            <div className="group relative overflow-hidden rounded-3xl border border-fuchsia-400/25 bg-gradient-to-b from-fuchsia-500/[0.08] to-transparent p-6 transition hover:border-fuchsia-400/50">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300"><Wand2 size={20} /></span>
              <h2 className="mt-4 font-display text-xl font-bold">Je crée mon site</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">Quelques questions et votre site vitrine pro est généré : textes, images, mise en ligne incluse.</p>
              <div className="mt-5 [&_form]:w-full">
                <ClaimForm domain={domain} compact />
              </div>
              <p className="mt-3 text-xs text-white/35">Gratuit pour commencer, aucune carte</p>
            </div>
            <Link href="/heberger" className="group relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-gradient-to-b from-cyan-400/[0.08] to-transparent p-6 transition hover:border-cyan-400/50">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300"><Code2 size={20} /></span>
              <h2 className="mt-4 font-display text-xl font-bold">J&apos;ai déjà mon projet</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">Codé sur votre PC, avec Claude, Cursor ou votre IDE : envoyez le .zip ou le dépôt, <b className="text-white/80">votre idée devient une vraie appli en ligne.</b></p>
              <span className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 text-sm font-bold text-black transition group-hover:brightness-110">
                <UploadCloud size={17} /> Mettre mon projet en ligne
              </span>
              <p className="mt-3 text-xs text-white/35">Portfolio, projet d&apos;études, app : parfait pour un CV</p>
            </Link>
          </div>
        </div>
        <div className="pop-in relative mt-20" style={{ animationDelay: "450ms" }}>
          <Showcase items={showcase} />
        </div>
      </section>

      {/* Métiers */}
      <section className="border-y border-white/5 py-8">
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="marquee-x flex w-max gap-4">
            {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
              <span key={i} className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-white/60">
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnement */}
      <section id="fonctionnement" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="lv mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-400">Comment ça marche</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Trois étapes. Zéro prise de tête.</h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Décrivez votre activité", d: "Votre métier, votre nom, le style qui vous plaît. Quelques clics suffisent." },
              { n: "02", t: "Mbila génère votre site", d: "Design, textes, images et mise en page sont créés sur-mesure. Choisissez parmi 3 propositions." },
              { n: "03", t: "Publiez et partagez", d: "Votre site est en ligne sur votre-nom.mbila.ca. Partagez le lien sur WhatsApp et les réseaux." },
            ].map((s, i) => (
              <div key={s.n} className="lv group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-8" style={{ transitionDelay: `${i * 120}ms` }}>
                <span className="brand-text font-display text-6xl font-bold opacity-80">{s.n}</span>
                <h3 className="mt-6 text-xl font-semibold">{s.t}</h3>
                <p className="mt-3 text-white/55">{s.d}</p>
                <div className="brand-grad absolute -bottom-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exemples de sites générés */}
      <section id="exemples" className="px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="lv mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-400">Créés par Mbila</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Des sites uniques, pour chaque métier</h2>
            <p className="mt-5 text-lg text-white/55">Chaque site est composé sur-mesure selon l&apos;activité, le style et les réponses de son propriétaire. Voici ce que vos clients pourraient découvrir.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((e, i) => {
              const body = (
                <>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {e.slug ? (
                      <ScaledFrame src={`/site/${e.slug}`} ratio={0.75} className="transition duration-700 group-hover:scale-105" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/thumbs/${e.id}.jpg`} alt={e.title} loading="lazy" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
                    )}
                    <span className="brand-grad absolute bottom-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold">{e.slug ? "Créé avec Mbila" : "Généré en 2 min"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{e.title}</p>
                      <p className="truncate text-xs text-white/45">{e.sub}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> En ligne
                    </span>
                  </div>
                </>
              );
              const cls = "lv group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/25";
              const delay = { transitionDelay: `${(i % 3) * 100}ms` };
              return e.slug ? (
                <a key={e.id} href={siteUrl(e.slug)} target="_blank" rel="noopener" className={cls} style={delay} title={`Visiter ${e.title}`}>{body}</a>
              ) : (
                <div key={e.id} className={cls} style={delay}>{body}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="lv mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-400">Tout inclus</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Tout ce qu&apos;il faut pour être visible</h2>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, text }, i) => (
              <div key={title} className="lv bg-[#0a0a12] p-8 transition hover:bg-[#0f0f1a]" style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-fuchsia-300"><Icon size={22} /></div>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hébergement de projets existants */}
      <section id="hebergement" className="px-6 py-28">
        <div className="lv relative mx-auto grid max-w-6xl items-center gap-12 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/[0.08] via-violet-600/[0.08] to-fuchsia-500/[0.08] p-8 md:p-14 lg:grid-cols-2">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              <Code2 size={13} /> Pour les développeurs &amp; créateurs
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight md:text-5xl">
              Des heures à coder votre idée ?<br /><span className="brand-text">On la met en ligne.</span>
            </h2>
            <p className="mt-5 text-lg text-white/60">
              Projet d’études, app faite avec Claude, Cursor ou votre IDE, portfolio… Votre code mérite mieux que localhost. Envoyez le .zip ou le lien GitHub : on le déploie, on le peaufine, on le publie sur votre domaine, prêt pour vos clients et votre CV.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/heberger#envoyer" className="rounded-full bg-white px-7 py-3.5 font-semibold text-black transition hover:scale-105">Envoyer mon projet →</Link>
              <Link href="/heberger" className="rounded-full border border-white/15 px-7 py-3.5 font-semibold text-white/80 transition hover:bg-white/5">En savoir plus</Link>
            </div>
          </div>
          <div className="relative grid gap-3 sm:grid-cols-2">
            {[
              { Icon: UploadCloud, t: "Zip ou dépôt Git", d: "GitHub, GitLab, Bitbucket" },
              { Icon: Sparkles, t: "Portfolio & CV", d: "Un lien qui impressionne" },
              { Icon: Globe, t: "Votre domaine", d: "Ou une adresse .mbila.ca" },
              { Icon: Palette, t: "Personnalisation", d: "Retouches avant mise en ligne" },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-[#0a0a12]/80 p-5">
                <Icon size={20} className="text-cyan-300" />
                <p className="mt-3 font-semibold">{t}</p>
                <p className="text-sm text-white/45">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="lv text-center font-display text-4xl font-bold md:text-5xl">Questions fréquentes</h2>
          <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium">
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-white/55">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="lv mx-auto mt-14 flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-white/70"><span className="font-semibold text-white">Une question, besoin de détails ?</span><br />Notre équipe répond rapidement.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="mailto:mbilaservice@gmail.com" className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5">
                <Mail size={15} /> mbilaservice@gmail.com
              </a>
              <a href="https://wa.me/23672679175?text=Bonjour%20Mbila%2C%20j%27ai%20une%20question" target="_blank" rel="noopener" className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                <MessageCircle size={15} /> +236 72 67 91 75
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-28">
        <div className="lv relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 px-8 py-20 text-center">
          <div className="aurora brand-grad absolute -inset-20 opacity-30 blur-3xl" />
          <div className="relative">
            <Zap className="mx-auto text-amber-300" size={36} />
            <h2 className="mt-6 font-display text-4xl font-bold md:text-6xl">Vos concurrents ont déjà un site.<br />Ayez le meilleur.</h2>
            <Link href={cta} className="mt-10 inline-block rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105">
              Créer mon site maintenant →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-white/40">
          <Logo className="text-white" />
          <div className="flex items-center gap-5">
            <a href="mailto:mbilaservice@gmail.com" className="flex items-center gap-1.5 transition hover:text-white"><Mail size={14} /> mbilaservice@gmail.com</a>
            <a href="https://wa.me/23672679175" target="_blank" rel="noopener" className="flex items-center gap-1.5 transition hover:text-white"><MessageCircle size={14} /> +236 72 67 91 75</a>
            <Link href="/heberger" className="transition hover:text-white">Votre projet</Link>
            <Link href="/conditions" className="transition hover:text-white">CGU</Link>
            <Link href="/confidentialite" className="transition hover:text-white">Confidentialité</Link>
          </div>
          <span>© {new Date().getFullYear()} Mbila · Sites vitrines pour entrepreneurs</span>
        </div>
      </footer>
    </div>
  );
}
