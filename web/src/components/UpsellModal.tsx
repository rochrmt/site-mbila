"use client";
import { Database, X } from "lucide-react";
import { useEffect, useState } from "react";
const WA = `https://wa.me/23672679175?text=${encodeURIComponent(
  "Bonjour, je souhaite rendre mon site plus dynamique (base de données, application sur mesure…) — pouvez-vous m'accompagner ?"
)}`;

// Popup « allez plus loin » — affichée une fois par site (localStorage),
// peu après l'arrivée dans l'éditeur suite à la création.
export default function UpsellModal({ siteId, title, text }: { siteId: number; title: string; text: string }) {
  const key = `upsell:${siteId}`;
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(key)) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [key]);

  const close = () => {
    setLeaving(true);
    setTimeout(() => { setOpen(false); localStorage.setItem(key, "1"); }, 180);
  };
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] grid place-items-center p-4 transition-opacity duration-200 ${leaving ? "opacity-0" : "opacity-100"}`}
      role="dialog" aria-modal="true" aria-label={title}
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0e0d16] shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="brand-grad h-1.5 w-full" />
        <button onClick={close} aria-label="Fermer"
          className="absolute right-4 top-4 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white">
          <X size={16} />
        </button>
        <div className="p-7">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
            <Database size={22} />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold leading-snug">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{text}</p>
          <div className="mt-6 flex flex-col gap-2.5">
            <a href={WA} target="_blank" rel="noopener"
              className="brand-grad rounded-xl py-3 text-center text-sm font-semibold shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110">
              En parler à l&apos;équipe Mbila →
            </a>
            <button onClick={close} className="rounded-xl py-2.5 text-sm text-white/40 transition hover:text-white/70">
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
