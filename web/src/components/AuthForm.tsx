"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions";
import Logo from "./Logo";
import PasswordInput from "./PasswordInput";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-400/60 focus:ring-4 focus:ring-fuchsia-500/10";

export default function AuthForm({ mode, next }: { mode: "signup" | "login"; next?: string }) {
  const [state, action, pending] = useActionState(mode === "signup" ? signup : login, undefined);
  const isUp = mode === "signup";
  return (
    <div className="grid min-h-screen bg-[#07070c] text-white lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="pop-in font-display text-4xl font-bold">{isUp ? "Créez votre compte" : "Bon retour !"}</h1>
          <p className="pop-in mt-3 text-white/55">
            {isUp ? "Encore 2 minutes et votre site est en ligne." : "Connectez-vous pour gérer vos sites."}
          </p>
          <form action={action} className="pop-in mt-10 space-y-4" style={{ animationDelay: "100ms" }}>
            {next && <input type="hidden" name="next" value={next} />}
            {isUp && <input name="name" required placeholder="Votre nom" autoComplete="name" className={input} />}
            {isUp ? (
              <input name="identifier" type="email" required placeholder="Votre adresse email (ex : nom@exemple.com)" autoComplete="email" className={input} />
            ) : (
              <input name="identifier" required placeholder="Email ou téléphone" autoComplete="username" className={input} />
            )}
            <PasswordInput
              name="password"
              minLength={isUp ? 8 : undefined}
              placeholder={isUp ? "Mot de passe (8 caractères min.)" : "Mot de passe"}
              autoComplete={isUp ? "new-password" : "current-password"}
            />
            {!isUp && (
              <div className="flex justify-end">
                <Link href="/recuperation" className="text-sm text-white/45 underline-offset-4 transition hover:text-white hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            )}
            {isUp && (
              <PasswordInput
                name="password2"
                placeholder="Confirmez le mot de passe"
                autoComplete="new-password"
              />
            )}
            {isUp && (
              <p className="flex items-start gap-2 rounded-lg bg-fuchsia-500/[0.08] px-4 py-3 text-xs leading-relaxed text-white/55">
                <span className="mt-px">✉️</span> Vous recevrez un <b className="text-white/75">lien de vérification par email</b> — votre compte sera actif après ce clic.
              </p>
            )}
            {isUp && (
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-white/55">
                <input type="checkbox" name="cgu" required className="mt-0.5 h-4 w-4 shrink-0 accent-fuchsia-500" />
                <span>
                  J&apos;accepte les <Link href="/conditions" target="_blank" className="font-semibold text-fuchsia-300 underline-offset-2 hover:underline">Conditions d&apos;utilisation</Link> et
                  la <Link href="/confidentialite" target="_blank" className="font-semibold text-fuchsia-300 underline-offset-2 hover:underline">Politique de confidentialité</Link>
                </span>
              </label>
            )}
            {state?.error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>}
            <button
              disabled={pending}
              className="brand-grad w-full rounded-xl py-4 font-semibold shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110 disabled:opacity-60"
            >
              {pending ? "Un instant…" : isUp ? "Continuer →" : "Se connecter"}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-white/50">
            {isUp ? "Déjà un compte ? " : "Pas encore de compte ? "}
            <Link href={`${isUp ? "/connexion" : "/inscription"}${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-white underline-offset-4 hover:underline">
              {isUp ? "Se connecter" : "Créer un compte"}
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-white/5 lg:block">
        <div className="aurora absolute -inset-20 bg-gradient-to-br from-violet-700/40 via-fuchsia-600/20 to-amber-500/20 blur-3xl" />
        <div className="absolute inset-0 grid rotate-[-8deg] scale-125 grid-cols-3 gap-4 p-8 opacity-90">
          {["saveur", "arena", "eclat", "nexus", "residence", "campus", "bazar", "objectif", "academie"].map((id, i) => (
            <div key={id} className="float-y overflow-hidden rounded-xl border border-white/10 shadow-2xl" style={{ animationDelay: `${i * -1.3}s` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/thumbs/${id}.jpg`} alt="" className="aspect-[3/4] w-full object-cover object-top" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070c] via-transparent to-[#07070c]/40" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="font-display text-3xl font-bold leading-tight">« J&apos;ai partagé mon lien dans 3 groupes WhatsApp. Le soir même, 5 clients m&apos;avaient écrit. »</p>
          <p className="mt-4 text-white/60">Fatou B. · Pâtissière</p>
        </div>
      </div>
    </div>
  );
}
