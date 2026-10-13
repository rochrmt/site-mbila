import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import AccountForm from "@/components/AccountForm";
import { getUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export const metadata = { title: "Mon compte · Mbila" };
export const dynamic = "force-dynamic";

// Réglages du compte : identifiant de connexion + mot de passe.
// Si l'admin a réinitialisé le mot de passe, cette page est le seul écran accessible
// tant qu'un nouveau n'est pas posé.
export default async function Compte() {
  const user = await getUser();
  if (!user) redirect("/connexion?next=/compte");
  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      <header className="border-b border-white/5 bg-[#07070c]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo />
          <Link href={isAdmin(user) ? "/admin" : "/dashboard"} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
            <ArrowLeft size={15} /> {isAdmin(user) ? "Administration" : "Mon espace"}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        {!!user.must_change && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-amber-300" />
            <div>
              <p className="font-semibold text-amber-200">Nouveau mot de passe requis</p>
              <p className="mt-1 text-sm text-amber-200/70">
                Votre mot de passe a été réinitialisé par notre équipe. Choisissez-en un nouveau ci-dessous pour continuer :
                le mot de passe temporaire reçu devient votre « mot de passe actuel ».
              </p>
            </div>
          </div>
        )}
        <h1 className="font-display text-4xl font-bold">Mon compte</h1>
        <p className="mt-2 text-white/50">Vos identifiants de connexion et votre mot de passe.</p>
        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-white/40">Connecté en tant que</p>
            <p className="mt-1 font-semibold">{user.name}</p>
            <p className="mt-0.5 text-sm text-white/55">{user.email ?? `📱 ${user.phone}`}</p>
          </div>
          <AccountForm email={user.email} />
        </div>
      </main>
    </div>
  );
}
