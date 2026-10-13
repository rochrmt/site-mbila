"use client";
import { useEffect, useState } from "react";
import type { SiteData } from "../types";

const field =
  "w-full rounded-s border border-s-border bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-s-primary focus:ring-2 focus:ring-s-primary/20 placeholder:text-s-muted";

// Formulaire : enregistre le lead en base ET ouvre WhatsApp avec le message
// pré-rempli (le numéro WhatsApp du client reçoit tout — nom, tél, email,
// service choisi, message). Cliquer un service/réalisation ailleurs sur la
// page (attribut data-service) le pré-sélectionne ici et défile au formulaire.
export default function ContactForm({ slug, d }: { slug: string; d: SiteData }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [service, setService] = useState("");
  const [waUrl, setWaUrl] = useState("");

  const known = [...d.services.items.map((i) => i.name), ...(d.works?.items ?? []).map((i) => i.name)];
  const options = [...new Set(service ? [service, ...known] : known)];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.("[data-service]") as HTMLElement | null;
      if (!el?.dataset.service) return;
      setService(el.dataset.service);
      const a = el.closest("a");
      // Les liens natifs gèrent leur propre défilement/ouverture
      if (!a) document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const wa = (d.contact.whatsapp || d.contact.phone || "").replace(/\D/g, "");
    if (wa) {
      const msg = [
        `Bonjour ${d.name},`,
        body.service ? `Je suis intéressé(e) par : ${body.service}` : "",
        `Nom : ${body.name}`,
        body.phone ? `Téléphone : ${body.phone}` : "",
        body.email ? `Email : ${body.email}` : "",
        "",
        body.message,
      ]
        .filter((l) => l !== "")
        .join("\n");
      const url = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
      setWaUrl(url);
      window.open(url, "_blank", "noopener");
    }
    setState("sending");
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, slug }),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }

  if (state === "done")
    return (
      <div className="grid h-full place-items-center rounded-s p-10 text-center">
        <div>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-s-primary text-2xl text-s-onprimary">✓</div>
          <p className="mt-6 font-s-head text-2xl">Message envoyé !</p>
          <p className="mt-2 text-s-muted">Nous revenons vers vous très rapidement.</p>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-2 rounded-btn bg-[#25D366] px-5 py-3 text-sm font-semibold text-white">
              Continuer sur WhatsApp ↗
            </a>
          )}
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} className="rv space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Votre nom" className={field} />
        <input name="phone" placeholder="Téléphone" className={field} />
      </div>
      <input name="email" type="email" placeholder="Email" className={field} />
      <select name="service" value={service} onChange={(e) => setService(e.target.value)} className={`${field} ${service ? "" : "text-s-muted"}`}>
        <option value="">Quel service vous intéresse ?</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <textarea name="message" required rows={5} placeholder="Votre message" className={field} />
      <button
        disabled={state === "sending"}
        className="w-full rounded-btn bg-s-primary px-6 py-4 text-sm font-semibold text-s-onprimary transition hover:brightness-110 disabled:opacity-60"
      >
        {state === "sending" ? "Envoi…" : "Envoyer le message"}
      </button>
      {state === "error" && <p className="text-sm text-red-500">Une erreur est survenue, réessayez.</p>}
    </form>
  );
}
