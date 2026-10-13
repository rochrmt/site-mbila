import Link from "next/link";
import { redirect } from "next/navigation";
import { Bot, Container, Gauge, Globe, LifeBuoy, Lock, Mail, MessageCircle, Palette, Rocket } from "lucide-react";
import Logo from "@/components/Logo";
import HostingForm from "@/components/landing/HostingForm";
import Reveal from "@/components/landing/Reveal";
import { getUser } from "@/lib/auth";

export const metadata = {
  title: "Hébergement de projets · Mbila",
  description: "Vous avez déjà un site, créé avec Claude, Cursor ou votre IDE ? Envoyez-le : nous le mettons en ligne, sur votre domaine, avec HTTPS.",
};

const PERKS = [
  { Icon: Rocket, t: "Mis en ligne pour vous", d: "Build, conteneur Docker, reverse-proxy : on s'occupe de toute la chaîne de déploiement." },
  { Icon: Globe, t: "Votre nom de domaine", d: "Sur votre domaine ou une adresse .mbila.ca offerte, avec certificat HTTPS automatique." },
  { Icon: Palette, t: "Personnalisation", d: "Retouches de design, textes, formulaires, WhatsApp, SEO : on peaufine avant la mise en ligne." },
  { Icon: Gauge, t: "Rapide et optimisé", d: "Compression, cache, images optimisées : votre site charge vite, même en 3G." },
  { Icon: Lock, t: "Sécurisé", d: "Secrets isolés, mises à jour, sauvegardes. Votre code n'est jamais exposé publiquement." },
  { Icon: LifeBuoy, t: "Un humain à l'écoute", d: "Un bug, une évolution ? Écrivez-nous sur WhatsApp, on s'en occupe." },
];

const STEPS = [
  { n: "01", t: "Envoyez votre projet", d: "Le .zip du dossier ou le lien de votre dépôt GitHub / GitLab." },
  { n: "02", t: "On l'analyse", d: "Stack, dépendances, base de données : on vous recontacte sous 24 h avec un devis clair." },
  { n: "03", t: "On le met en ligne", d: "Déploiement, domaine, HTTPS, tests. Vous recevez un vrai lien, à montrer partout : portfolio, CV, clients." },
];

const STACKS = ["HTML/CSS", "React", "Next.js", "Vite", "Vue", "Nuxt", "Svelte", "Astro", "Node.js", "Express", "PHP", "Laravel", "WordPress", "Django", "Flask", "Tailwind"];

const FAQ = [
  { q: "Mon site a été généré par une IA (Claude, ChatGPT, Cursor, Bolt, Lovable…). Ça marche ?", a: "Oui, c'est justement notre spécialité. Ces projets fonctionnent souvent en local mais sont difficiles à déployer : on fait le build, on corrige ce qui bloque et on le met en ligne." },
  { q: "Que dois-je mettre dans le .zip ?", a: "Le dossier du projet, sans node_modules, .next, dist ni vendor (on les régénère). N'incluez jamais votre fichier .env : on vous demandera les variables nécessaires de façon sécurisée." },
  { q: "Mon projet a une base de données ou un backend.", a: "Pas de problème : Node, PHP, Python, avec PostgreSQL, MySQL ou SQLite. Précisez-le dans le message, on adapte l'hébergement." },
  { q: "Je n'ai pas encore de nom de domaine.", a: "Votre site peut être en ligne immédiatement sur une adresse .mbila.ca, puis passer sur votre propre domaine quand vous le souhaitez." },
];

export default async function Heberger() {
  const user = await getUser();
  // Compte créé mais email non confirmé → l'envoi serait refusé : on explique d'abord
  if (user?.email && !user.email_verified) redirect("/verifier-attente");
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07070c] text-white">
      <Reveal />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#07070c]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden text-sm text-white/60 hover:text-white sm:block">Créer un site</Link>
            <a href="#envoyer" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90">Envoyer mon projet</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pb-20 pt-40 md:pt-48">
        <div className="grid-bg absolute inset-0" />
        <div className="aurora absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/30 via-violet-600/35 to-fuchsia-500/30 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="pop-in inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70">
            <Bot size={14} className="text-cyan-300" /> Projet d’études, portfolio, idée d’appli ?
          </div>
          <h1 className="pop-in mt-8 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl" style={{ animationDelay: "100ms" }}>
            Votre idée mérite mieux que localhost.<br />
            <span className="brand-text">On la met en ligne.</span>
          </h1>
          <p className="pop-in mx-auto mt-7 max-w-2xl text-lg text-white/60 md:text-xl" style={{ animationDelay: "200ms" }}>
            Vous avez passé des heures à construire votre idée, avec Claude, Cursor ou votre IDE. Envoyez-nous le .zip ou le dépôt : nous la transformons en vraie appli sur le web, sur votre domaine, à montrer à vos clients et sur votre CV.
          </p>
          <div className="pop-in mt-10 flex flex-wrap justify-center gap-3" style={{ animationDelay: "300ms" }}>
            <a href="#envoyer" className="brand-grad shimmer rounded-full px-8 py-4 font-semibold shadow-lg shadow-fuchsia-500/30 transition hover:scale-105">Envoyer mon projet →</a>
            <a href="#fonctionnement" className="rounded-full border border-white/15 px-8 py-4 font-semibold text-white/80 transition hover:bg-white/5">Comment ça marche</a>
          </div>
        </div>

        {/* Terminal décoratif */}
        <div className="pop-in relative mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b14] font-mono text-[13px] shadow-2xl shadow-violet-900/30" style={{ animationDelay: "450ms" }}>
          <div className="flex gap-1.5 border-b border-white/5 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400/70" /><span className="h-3 w-3 rounded-full bg-amber-300/70" /><span className="h-3 w-3 rounded-full bg-emerald-400/70" />
          </div>
          <div className="space-y-1.5 px-5 py-5 text-white/70">
            <p><span className="text-fuchsia-300">$</span> npm run dev</p>
            <p className="text-white/40">  ▲ Ready on http://localhost:3000</p>
            <p><span className="text-fuchsia-300">$</span> <span className="text-white/40"># et maintenant ? serveur, Docker, DNS, HTTPS…</span></p>
            <p className="text-cyan-300">→ mbila : projet reçu · build ✓ · conteneur ✓ · HTTPS ✓</p>
            <p className="text-emerald-300">✓ En ligne sur https://votre-domaine.com</p>
          </div>
        </div>
      </section>

      {/* Stacks */}
      <section className="border-y border-white/5 py-8">
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="marquee-x flex w-max gap-4">
            {[...STACKS, ...STACKS].map((s, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 font-mono text-sm text-white/60">
                <Container size={13} className="text-cyan-300/70" /> {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Étapes */}
      <section id="fonctionnement" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="lv mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Comment ça marche</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Du dossier local au site en ligne</h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="lv group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-8" style={{ transitionDelay: `${i * 120}ms` }}>
                <span className="brand-text font-display text-6xl font-bold opacity-80">{s.n}</span>
                <h3 className="mt-6 text-xl font-semibold">{s.t}</h3>
                <p className="mt-3 text-white/55">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="px-6 pb-28">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {PERKS.map(({ Icon, t, d }, i) => (
            <div key={t} className="lv bg-[#0a0a12] p-8 transition hover:bg-[#0f0f1a]" style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-cyan-300"><Icon size={22} /></div>
              <h3 className="mt-6 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-white/55">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formulaire */}
      <section id="envoyer" className="scroll-mt-24 px-6 pb-28">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div className="lv lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-400">Envoyer mon projet</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Confiez-nous votre code.</h2>
            <p className="mt-5 text-lg text-white/55">Réponse sous 24 h avec un devis de mise en ligne. Aucun engagement tant que vous n&apos;avez pas validé.</p>
            <ul className="mt-8 space-y-3 text-white/70">
              {["Analyse gratuite de votre projet", "Déploiement Docker + HTTPS", "Nom de domaine perso ou .mbila.ca", "Personnalisations sur demande"].map((x) => (
                <li key={x} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/15 text-xs text-emerald-300">✓</span>{x}</li>
              ))}
            </ul>
          </div>
          <div className="lv">
            {user ? (
              <HostingForm defaults={{ name: user.name, email: user.email ?? "" }} />
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300"><Lock size={28} /></span>
                <h3 className="mt-6 font-display text-2xl font-bold">Un compte gratuit suffit</h3>
                <p className="mx-auto mt-3 max-w-sm text-white/55">
                  Créez votre compte Mbila pour nous envoyer votre projet : on le suit, on vous répond, et vous pouvez gérer vos sites au même endroit.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/inscription?next=/heberger" className="brand-grad shimmer rounded-full px-7 py-3.5 font-semibold shadow-lg shadow-fuchsia-500/30 transition hover:scale-105">
                    Créer mon compte →
                  </Link>
                  <Link href="/connexion?next=/heberger" className="rounded-full border border-white/15 px-7 py-3.5 font-semibold text-white/80 transition hover:bg-white/5">
                    J&apos;ai déjà un compte
                  </Link>
                </div>
                <p className="mt-5 text-xs text-white/35">30 secondes · aucune carte bancaire</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-28">
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
            <p className="text-white/70"><span className="font-semibold text-white">Un doute sur votre projet ?</span><br />Parlez-nous en : on vous guide.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="mailto:mbilaservice@gmail.com" className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5">
                <Mail size={15} /> mbilaservice@gmail.com
              </a>
              <a href="https://wa.me/23672679175?text=Bonjour%20Mbila%2C%20je%20veux%20h%C3%A9berger%20mon%20projet" target="_blank" rel="noopener" className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                <MessageCircle size={15} /> +236 72 67 91 75
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-white/40">
          <Logo className="text-white" />
          <div className="flex items-center gap-5">
            <a href="mailto:mbilaservice@gmail.com" className="flex items-center gap-1.5 transition hover:text-white"><Mail size={14} /> mbilaservice@gmail.com</a>
            <a href="https://wa.me/23672679175" target="_blank" rel="noopener" className="flex items-center gap-1.5 transition hover:text-white"><MessageCircle size={14} /> +236 72 67 91 75</a>
          </div>
          <span>© {new Date().getFullYear()} Mbila · Création et hébergement de sites</span>
        </div>
      </footer>
    </div>
  );
}
