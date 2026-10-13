import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = { title: "Conditions d'utilisation · Mbila" };

const S = ({ n, t, children }: { n: string; t: string; children: React.ReactNode }) => (
  <section className="mt-10">
    <h2 className="font-display text-xl font-semibold"><span className="brand-text">{n}.</span> {t}</h2>
    <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/60">{children}</div>
  </section>
);

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-[#07070c] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Logo />
        <h1 className="mt-12 font-display text-4xl font-bold">Conditions Générales d&apos;Utilisation</h1>
        <p className="mt-4 text-sm text-white/45">Dernière mise à jour : octobre 2025 · Service : mbila.ca · Contact : mbilaservice@gmail.com</p>

        <S n="1" t="Le service">
          <p>Mbila est une plateforme qui permet de créer un site vitrine professionnel (pages, contenus, images, formulaire de contact), de le personnaliser via un éditeur en ligne et de le publier sur une adresse de la forme <b>votre-nom.mbila.ca</b>, ou sur votre propre nom de domaine (offre Premium). Mbila propose également la mise en ligne de projets existants (code source fourni par le client).</p>
        </S>

        <S n="2" t="Compte">
          <p>La création d&apos;un site et l&apos;envoi d&apos;un projet exigent un compte. Vous êtes responsable de la confidentialité de votre mot de passe et de l&apos;exactitude des informations fournies. Un seul compte par personne.</p>
        </S>

        <S n="3" t="Abonnement et paiement">
          <p>La création du site est gratuite. La <b>mise en ligne</b> est payante : l&apos;abonnement est facturé selon le tarif affiché au moment du paiement (variable selon votre profil et la durée choisie), payable par Orange Money au numéro indiqué.</p>
          <p>Les paiements sont <b>vérifiés manuellement</b> par l&apos;équipe Mbila, généralement sous 24 h. Le site passe en ligne dès la confirmation de la réception du virement ; vous êtes notifié dans l&apos;application.</p>
          <p>À l&apos;expiration de l&apos;abonnement, le site peut être suspendu jusqu&apos;au renouvellement. Les contenus ne sont pas supprimés pendant une période de grâce raisonnable.</p>
          <p><b>Remboursements :</b> aucun remboursement après la mise en ligne du site, sauf cas exceptionnel apprécié par Mbila. En cas de paiement non confirmé par nos soins (virement non reçu ou litige), vous pouvez nous contacter sur WhatsApp.</p>
        </S>

        <S n="4" t="Votre contenu">
          <p>Vous êtes propriétaire des textes, images, logos et fichiers que vous envoyez. Vous garantissez en disposer les droits nécessaires et accordez à Mbila une licence limitée pour les héberger et les afficher sur votre site.</p>
          <p>Sont interdits les contenus illégaux, diffamatoires, haineux, contrefaits, pornographiques, ou utilisant la plateforme pour du spam, du phishing ou des logiciels malveillants. Mbila peut suspendre sans préavis tout site qui enfreint ces règles.</p>
        </S>

        <S n="5" t="Hébergement de projets existants">
          <p>Pour les projets envoyés (fichiers .zip ou dépôts Git), l&apos;analyse et la mise en ligne sont réalisées par l&apos;équipe technique. Le devis et le délai sont convenus directement avec le client (WhatsApp). Mbila peut refuser tout projet non conforme, incomplet ou contraire à l&apos;article 4.</p>
        </S>

        <S n="6" t="Responsabilité">
          <p>Mbila s&apos;engage à fournir le service avec soin, sans garantie de disponibilité ininterrompue (maintenances, pannes de nos fournisseurs, cas de force majeure). Mbila n&apos;est pas responsable du contenu publié par les clients ni des dommages indirects (perte de chiffre d&apos;affaires, de données, etc.).</p>
        </S>

        <S n="7" t="Résiliation">
          <p>Vous pouvez supprimer votre site et votre compte à tout moment depuis votre espace. La suppression efface vos contenus après une période de conservation raisonnable.</p>
        </S>

        <S n="8" t="Droit applicable">
          <p>Ces conditions sont régies par le droit de la République Centrafricaine. En cas de litige, contactez d&apos;abord mbilaservice@gmail.com : nous privilégions le règlement amiable.</p>
        </S>

        <div className="mt-14 flex flex-wrap gap-6 border-t border-white/10 pt-8 text-sm">
          <Link href="/" className="text-white/50 transition hover:text-white">← Retour à l&apos;accueil</Link>
          <Link href="/confidentialite" className="font-semibold text-fuchsia-300 underline-offset-4 hover:underline">Politique de confidentialité →</Link>
        </div>
      </div>
    </div>
  );
}
