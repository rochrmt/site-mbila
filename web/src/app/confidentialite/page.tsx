import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = { title: "Politique de confidentialité · Mbila" };

const S = ({ n, t, children }: { n: string; t: string; children: React.ReactNode }) => (
  <section className="mt-10">
    <h2 className="font-display text-xl font-semibold"><span className="brand-text">{n}.</span> {t}</h2>
    <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/60">{children}</div>
  </section>
);

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#07070c] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Logo />
        <h1 className="mt-12 font-display text-4xl font-bold">Politique de confidentialité</h1>
        <p className="mt-4 text-sm text-white/45">Dernière mise à jour : octobre 2025 · Contact : mbilaservice@gmail.com</p>

        <S n="1" t="Ce que nous collectons">
          <p><b>Compte :</b> nom, email, mot de passe (chiffré, jamais stocké en clair).</p>
          <p><b>Contenus :</b> textes, images, logos et fichiers que vous publiez sur votre site, plus les réponses aux questionnaires de création et d&apos;envoi de projet.</p>
          <p><b>Paiements :</b> le numéro Orange Money utilisé pour payer et les montants. Jamais vos codes PIN ni secrets.</p>
          <p><b>Technique :</b> sessions (jeton de connexion), journaux serveur standards (IP, navigateur) à des fins de sécurité et de débogage.</p>
        </S>

        <S n="2" t="Pourquoi">
          <p>Fournir le service (création et affichage de votre site), vous contacter (validation de paiement, suivi de projet, y compris sur WhatsApp), assurer la sécurité de la plateforme et remplir nos obligations légales.</p>
        </S>

        <S n="3" t="Partage">
          <p>Vos données ne sont <b>jamais vendues</b>. Elles peuvent transiter par nos fournisseurs (hébergement VPS, Gmail pour les emails, Orange Money pour les virements) uniquement pour le fonctionnement du service.</p>
        </S>

        <S n="4" t="Cookies">
          <p>Seul un cookie de session strictement nécessaire (<code className="rounded bg-white/10 px-1">mbila_session</code>) est utilisé pour vous garder connecté. Aucun cookie publicitaire ni de suivi tiers.</p>
        </S>

        <S n="5" t="Conservation et vos droits">
          <p>Vos données sont conservées tant que votre compte existe, puis supprimées ou anonymisées dans un délai raisonnable après suppression. Vous pouvez demander l&apos;accès, la correction ou l&apos;effacement de vos données en écrivant à <b>mbilaservice@gmail.com</b> ou sur WhatsApp au +236 72 67 91 75.</p>
        </S>

        <div className="mt-14 flex flex-wrap gap-6 border-t border-white/10 pt-8 text-sm">
          <Link href="/" className="text-white/50 transition hover:text-white">← Retour à l&apos;accueil</Link>
          <Link href="/conditions" className="font-semibold text-fuchsia-300 underline-offset-4 hover:underline">Conditions d&apos;utilisation →</Link>
        </div>
      </div>
    </div>
  );
}
