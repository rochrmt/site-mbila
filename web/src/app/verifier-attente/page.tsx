import { redirect } from "next/navigation";
import Link from "next/link";
import { MailCheck, MessageCircle } from "lucide-react";
import Logo from "@/components/Logo";
import ResendVerification from "@/components/ResendVerification";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Vérifiez votre email · Mbila" };
export const dynamic = "force-dynamic";

// Écran obligatoire tant que l'email du compte n'est pas confirmé.
// Le compte est créé mais inactif : aucune page protégée n'est accessible avant ça.
export default async function VerifierAttente() {
  const user = await getUser();
  if (!user) redirect("/connexion?next=/verifier-attente");
  if (user.email && user.email_verified) redirect("/dashboard");
  return (
    <div className="grid min-h-screen place-items-center bg-[#07070c] px-6 text-white">
      <div className="pop-in w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <div className="flex justify-center"><Logo /></div>
        <MailCheck size={48} className="mx-auto mt-8 text-fuchsia-300" />
        <h1 className="mt-4 font-display text-2xl font-bold">Confirmez votre email</h1>
        {user.email ? (
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Un lien d&apos;activation vient d&apos;être envoyé à <b className="text-white/85">{user.email}</b>.
            Cliquez dessus pour activer votre compte. Il est valable <b className="text-white/85">24 h</b>.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Votre compte n&apos;a pas d&apos;adresse email vérifiée. Ajoutez-en une depuis{" "}
            <Link href="/compte" className="font-semibold text-fuchsia-300 underline-offset-2 hover:underline">Mon compte</Link>{" "}
            pour sécuriser votre accès.
          </p>
        )}
        {user.email && <ResendVerification />}
        <p className="mt-6 text-xs leading-relaxed text-white/35">
          Rien reçu ? Regardez vos <b>spams / courriers indésirables</b>. Toujours bloqué ?{" "}
          <a href="https://wa.me/23672679175" target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-semibold text-[#25D366] hover:underline">
            <MessageCircle size={11} /> Écrivez-nous sur WhatsApp
          </a>
        </p>
        <Link href="/" className="mt-6 inline-block text-xs text-white/35 underline-offset-4 hover:text-white/60 hover:underline">
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
