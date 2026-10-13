"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, KeyRound, MessageCircle, X } from "lucide-react";
import { resolvePasswordResetAction } from "@/app/admin/actions";

type Result = { temp: string; phone: string } | null;

// Après vérification de l'identité par WhatsApp, l'admin remet un mot de passe temporaire
// (affiché une seule fois, à transmettre au client) ou rejette la demande.
export default function RecoveryActions({ resetId, contact, userName, canReset, pending: isPending }: { resetId: number; contact: string; userName: string; canReset: boolean; pending: boolean }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Result>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const pill = "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition disabled:opacity-40";
  const waPhone = contact.replace(/\D/g, "");

  if (result) {
    const msg = encodeURIComponent(`Bonjour ${userName}, votre accès Mbila est réinitialisé. Connectez-vous avec ce mot de passe temporaire : ${result.temp}. Il vous sera demandé d'en choisir un nouveau.`);
    return (
      <div className="w-full rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Mot de passe temporaire · à transmettre au client</p>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-black/30 px-3 py-2 font-mono text-lg tracking-widest text-emerald-200">{result.temp}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(result.temp); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 hover:bg-white/10" aria-label="Copier"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <a
          href={`https://wa.me/${result.phone || waPhone}?text=${msg}`}
          target="_blank"
          rel="noopener"
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-sm font-bold text-black transition hover:brightness-110"
        >
          <MessageCircle size={15} /> Envoyer sur WhatsApp
        </a>
        <p className="mt-2 text-[11px] text-white/40">Ses sessions ont été fermées ; il devra choisir un nouveau mot de passe à la connexion.</p>
      </div>
    );
  }

  if (!isPending) return null;
  return (
    <div className="flex flex-col items-end gap-2">
      <a
        href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Bonjour, suite à votre demande de récupération de compte Mbila, quelques questions pour vérifier votre identité :`)}`}
        target="_blank"
        rel="noopener"
        className={`${pill} bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25`}
      >
        <MessageCircle size={12} /> Vérifier l&apos;identité
      </a>
      <div className="flex gap-2">
        {canReset && (
        <button
          disabled={pending}
          onClick={() =>
            window.confirm(`Identité vérifiée ?\n\nCeci va réinitialiser le mot de passe de ${userName}, fermer toutes ses sessions et générer un mot de passe temporaire.`) &&
            start(async () => {
              const r = await resolvePasswordResetAction(resetId, "reset");
              if ("temp" in r && r.temp) setResult({ temp: r.temp, phone: r.phone || waPhone });
              else if (r.error) alert(r.error);
              // Pas de refresh ici : la ligne passant en « traité » démonterait le panneau
              // et l'admin perdrait le mot de passe temporaire avant de le copier.
            })
          }
          className={`${pill} bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25`}
        >
          <KeyRound size={12} /> Réinitialiser
        </button>
        )}
        <button
          disabled={pending}
          onClick={() => start(async () => { await resolvePasswordResetAction(resetId, "reject"); router.refresh(); })}
          className={`${pill} bg-red-500/10 text-red-300 hover:bg-red-500/25`}
        >
          <X size={12} /> Rejeter
        </button>
      </div>
    </div>
  );
}
