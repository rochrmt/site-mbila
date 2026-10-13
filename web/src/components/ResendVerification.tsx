"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { resendVerification } from "@/app/actions";

export default function ResendVerification() {
  const [state, action, pending] = useActionState(resendVerification, undefined);
  return (
    <form action={action} className="mt-6">
      {state?.error && <p className="mb-3 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{state.error}</p>}
      {state?.ok && <p className="mb-3 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">{state.ok}</p>}
      <button
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-6 py-2.5 text-sm font-semibold text-fuchsia-200 transition hover:bg-fuchsia-500/20 disabled:opacity-50"
      >
        <Mail size={15} /> {pending ? "Envoi…" : "Renvoyer l'email de vérification"}
      </button>
    </form>
  );
}
