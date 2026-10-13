import crypto from "node:crypto";
import Link from "next/link";
import { headers } from "next/headers";
import { CheckCircle2, XCircle } from "lucide-react";
import Logo from "@/components/Logo";
import { consumeEmailToken, setEmailVerified } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export const metadata = { title: "Vérification · Mbila" };
export const dynamic = "force-dynamic";

// Clic sur le lien reçu par email → active le compte (jeton sha256, usage unique, 24 h)
export default async function Verifier({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "inconnu";
  if (!rateLimit(`verify:${ip}`, 30, 3_600_000)) {
    return <Result ok={false} reason="rate" />;
  }
  const ok = token ? (() => {
    const userId = consumeEmailToken(crypto.createHash("sha256").update(token).digest("hex"));
    if (userId) setEmailVerified(userId);
    return !!userId;
  })() : false;
  return <Result ok={ok} reason="token" />;
}

function Result({ ok, reason }: { ok: boolean; reason: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#07070c] px-6 text-white">
      <div className="pop-in w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <div className="flex justify-center"><Logo /></div>
        {ok ? (
          <>
            <CheckCircle2 size={48} className="mx-auto mt-8 text-emerald-400" />
            <h1 className="mt-4 font-display text-2xl font-bold">Compte activé !</h1>
            <p className="mt-2 text-sm text-white/55">Votre adresse email est confirmée. Vous pouvez maintenant utiliser Mbila.</p>
            <Link href="/dashboard" className="brand-grad mt-8 inline-block rounded-full px-8 py-3.5 text-sm font-semibold shadow-lg shadow-fuchsia-500/20">
              Accéder à mon espace →
            </Link>
          </>
        ) : (
          <>
            <XCircle size={48} className="mx-auto mt-8 text-red-400" />
            <h1 className="mt-4 font-display text-2xl font-bold">Lien invalide</h1>
            <p className="mt-2 text-sm text-white/55">
              {reason === "rate"
                ? "Trop de tentatives. Réessayez dans une heure."
                : "Ce lien a expiré ou a déjà été utilisé. Connectez-vous pour recevoir un nouveau lien de vérification."}
            </p>
            <Link href="/connexion" className="mt-8 inline-block rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold hover:bg-white/5">
              Aller à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
