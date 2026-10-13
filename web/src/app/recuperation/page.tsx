import Link from "next/link";
import { MessageCircle, ShieldCheck, UserCheck } from "lucide-react";
import Logo from "@/components/Logo";
import RecoveryForm from "@/components/RecoveryForm";

export const metadata = { title: "Compte inaccessible · Mbila" };

// Mot de passe oublié : pas de lien magique par email — la réinitialisation est faite
// par un humain (l'admin), après vérification d'identité par WhatsApp.
// C'est ce qui empêche un robot d'usurper un compte en automatisant des demandes.
export default function Recuperation() {
  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo />
          <Link href="/connexion" className="rounded-full px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">← Connexion</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="pop-in">
          <h1 className="font-display text-4xl font-bold">Compte inaccessible ?</h1>
          <p className="mt-3 max-w-xl text-white/55">
            Pour votre sécurité, la réinitialisation est faite par notre équipe <b className="text-white/75">après vérification
            de votre identité</b>. Jamais automatiquement. Deux façons de la demander :
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {/* Procédure 1 : WhatsApp direct */}
          <div className="pop-in rounded-2xl border border-[#25D366]/25 bg-[#25D366]/[0.06] p-6" style={{ animationDelay: "80ms" }}>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#25D366]/15 text-[#25D366]"><MessageCircle size={20} /></span>
            <h2 className="mt-4 font-display text-xl font-bold">La plus rapide : WhatsApp</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/55">
              Écrivez-nous directement depuis votre numéro. On vérifie votre identité en quelques questions et on vous remet un accès.
            </p>
            <a
              href="https://wa.me/23672679175?text=Bonjour%20Mbila%2C%20je%20n%27arrive%20plus%20%C3%A0%20acc%C3%A9der%20%C3%A0%20mon%20compte.%20Mon%20identifiant%20est%20%3A%20"
              target="_blank"
              rel="noopener"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-black transition hover:brightness-110"
            >
              <MessageCircle size={16} /> Ouvrir WhatsApp
            </a>
          </div>

          {/* Procédure 2 : alerte automatique à l'admin */}
          <div className="pop-in rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/[0.05] p-6" style={{ animationDelay: "160ms" }}>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300"><UserCheck size={20} /></span>
            <h2 className="mt-4 font-display text-xl font-bold">Demande à l&apos;équipe</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/55">
              Remplissez ce formulaire : l&apos;admin est alerté immédiatement et vous rappelle sur WhatsApp pour vérifier votre identité.
            </p>
            <p className="mt-3 text-xs text-white/40">Pas de numéro WhatsApp ? Utilisez la procédure ci-contre.</p>
          </div>
        </div>

        <div className="pop-in mt-6" style={{ animationDelay: "240ms" }}>
          <RecoveryForm />
        </div>

        <div className="pop-in mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4" style={{ animationDelay: "320ms" }}>
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-300" />
          <p className="text-sm leading-relaxed text-white/55">
            Pour prouver que le compte est bien le vôtre, préparez : <b className="text-white/75">votre nom complet</b>,
            l&apos;<b className="text-white/75">adresse de votre site</b> (ex. monsite.mbila.ca) et, si possible,
            une <b className="text-white/75">capture de votre espace</b> ou un détail de votre contenu.
            Nous ne demanderons jamais votre mot de passe.
          </p>
        </div>
      </main>
    </div>
  );
}
