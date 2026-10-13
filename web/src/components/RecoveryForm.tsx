"use client";
import { useActionState } from "react";
import { Send } from "lucide-react";
import { requestAccountRecovery } from "@/app/actions";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-400/60 focus:ring-4 focus:ring-fuchsia-500/10";

export default function RecoveryForm() {
  const [state, action, pending] = useActionState(requestAccountRecovery, undefined);
  return (
    <form action={action} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/70" htmlFor="identifier">Votre identifiant de connexion</label>
          <input id="identifier" name="identifier" required minLength={3} placeholder="L'email ou le numéro de votre compte" autoComplete="username" className={input} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/70" htmlFor="contact">Numéro WhatsApp où vous joindre</label>
          <input id="contact" name="contact" required placeholder="Ex : +236 72 67 91 75" inputMode="tel" autoComplete="tel" className={input} />
          <p className="mt-1.5 text-xs text-white/40">C&apos;est là que notre équipe vérifiera que c&apos;est bien vous.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/70" htmlFor="message">Précisions (facultatif)</label>
          <textarea id="message" name="message" rows={3} maxLength={500} placeholder="Le nom de votre site, depuis quand vous êtes client… tout ce qui aide à prouver que c'est vous." className={`${input} resize-none`} />
        </div>
        {/* Pot de miel : invisible pour les humains, rempli par les robots */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        {state?.error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>}
        {state?.ok && <p className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm leading-relaxed text-emerald-300">{state.ok}</p>}
        <button disabled={pending} className="brand-grad flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110 disabled:opacity-60">
          <Send size={15} /> {pending ? "Envoi…" : "Envoyer la demande"}
        </button>
      </div>
    </form>
  );
}
