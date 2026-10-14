"use client";
import { useActionState } from "react";
import { KeyRound, Mail, Phone } from "lucide-react";
import { changeIdentifier, changePassword, type FormState } from "@/app/actions";
import PasswordInput from "./PasswordInput";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-400/60 focus:ring-4 focus:ring-fuchsia-500/10";
const label = "mb-1.5 block text-sm font-medium text-white/70";

function Feedback({ state }: { state: FormState }) {
  if (state?.error) return <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>;
  if (state?.ok) return <p className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{state.ok}</p>;
  return null;
}

export default function AccountForm({ email }: { email: string | null }) {
  const [idState, idAction, idPending] = useActionState(changeIdentifier, undefined);
  const [pwState, pwAction, pwPending] = useActionState(changePassword, undefined);
  return (
    <>
      {/* Identifiant de connexion */}
      <form action={idAction} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="flex items-center gap-2 font-semibold">{email ? <Mail size={16} className="text-cyan-300" /> : <Phone size={16} className="text-cyan-300" />} Adresse email</p>
        <p className="mt-1 text-sm text-white/50">Votre identifiant de connexion. Toute nouvelle adresse devra être confirmée par email.</p>
        <div className="mt-5 space-y-4">
          <div>
            <label className={label} htmlFor="identifier">Nouvelle adresse email</label>
            <input id="identifier" name="identifier" type="email" required defaultValue={email ?? ""} placeholder="nom@exemple.com" autoComplete="email" className={input} />
          </div>
          <div>
            <label className={label} htmlFor="id-password">Confirmez avec votre mot de passe</label>
            <PasswordInput id="id-password" name="password" placeholder="Mot de passe actuel" autoComplete="current-password" className={input} />
          </div>
          <Feedback state={idState} />
          <button disabled={idPending} className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60">
            {idPending ? "Un instant…" : "Modifier l'identifiant"}
          </button>
        </div>
      </form>

      {/* Mot de passe */}
      <form action={pwAction} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="flex items-center gap-2 font-semibold"><KeyRound size={16} className="text-fuchsia-300" /> Mot de passe</p>
        <p className="mt-1 text-sm text-white/50">Après modification, vos autres appareils seront déconnectés.</p>
        <div className="mt-5 space-y-4">
          <div>
            <label className={label} htmlFor="current">Mot de passe actuel</label>
            <PasswordInput id="current" name="current" placeholder="Mot de passe actuel" autoComplete="current-password" className={input} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="password">Nouveau mot de passe</label>
              <PasswordInput id="password" name="password" minLength={8} placeholder="8 caractères min." autoComplete="new-password" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="password2">Confirmation</label>
              <PasswordInput id="password2" name="password2" placeholder="Retapez-le" autoComplete="new-password" className={input} />
            </div>
          </div>
          <Feedback state={pwState} />
          <button disabled={pwPending} className="brand-grad rounded-xl px-6 py-3 text-sm font-semibold shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110 disabled:opacity-60">
            {pwPending ? "Un instant…" : "Modifier le mot de passe"}
          </button>
        </div>
      </form>
    </>
  );
}
