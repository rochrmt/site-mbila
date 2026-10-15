import Link from "next/link";
import { CheckCircle2, ImageIcon, Mail, MessageCircle, XCircle } from "lucide-react";
import { getPaymentsDetailed, getSiteById } from "@/lib/db";
import { planLabel } from "@/lib/pricing";
import { confirmPaymentAction, refusePaymentAction } from "../actions";

const fmt = (iso: string) =>
  new Date(iso + "Z").toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const price = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

const BADGE: Record<string, string> = {
  en_attente: "bg-amber-400/15 text-amber-300",
  confirme: "bg-emerald-500/15 text-emerald-300",
  refuse: "bg-red-500/10 text-red-300",
};
const LABEL: Record<string, string> = { en_attente: "En attente", confirme: "Confirmé", refuse: "Refusé" };

export default async function AdminPayments() {
  const list = getPaymentsDetailed();
  const pending = list.filter((p) => p.status === "en_attente").length;
  const monthTotal = list
    .filter((p) => p.status === "confirme" && p.created_at.slice(0, 7) === new Date().toISOString().slice(0, 7))
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Paiements</h1>
      <p className="mt-2 text-white/50">
        Preuves Orange Money à vérifier · {pending} en attente
        {monthTotal > 0 && <span className="ml-2 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">{price(monthTotal)} ce mois</span>}
      </p>

      {list.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center text-white/40">
          Aucun paiement pour l&apos;instant. Les captures envoyées au clic « Publier » apparaîtront ici.
        </div>
      )}

      <div className="mt-8 space-y-4">
        {list.map((p) => {
          const site = p.site_id ? getSiteById(p.site_id) : null;
          const wa = site?.data.contact.whatsapp || site?.data.contact.phone || "";
          return (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="brand-grad grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white">
                  {(p.user_name ?? "?").slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">
                    {p.user_name ?? "Client"} <span className="text-xs font-normal text-white/35">#{p.id}</span>
                  </p>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/45">
                    {p.user_email && <a href={`mailto:${p.user_email}`} className="flex items-center gap-1 hover:text-white"><Mail size={12} /> {p.user_email}</a>}
                    {wa && <a href={`https://wa.me/${wa.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-emerald-300"><MessageCircle size={12} /> {wa}</a>}
                    {p.site_slug && <Link href={`/dashboard/sites/${p.site_id}`} className="hover:text-white">site : {p.site_slug}</Link>}
                  </p>
                </div>
                <span className={`ml-auto rounded-full px-3 py-1 text-[11px] font-semibold ${BADGE[p.status]}`}>{LABEL[p.status]}</span>
                <span className="text-xs text-white/35">{fmt(p.created_at)}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-fuchsia-200">{planLabel(p.plan, p.months)}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/80">{price(p.amount)}</span>
                {p.method === "chariow" ? (
                  <>
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      ⚡ en ligne{p.external_ref ? ` · ${p.external_ref}` : ""}
                    </span>
                    {p.payer_phone && (
                      <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">
                        n° débité : {p.payer_phone}
                      </span>
                    )}
                  </>
                ) : p.payer ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">
                    <MessageCircle size={12} /> payé depuis : {p.payer}
                  </span>
                ) : null}
                {p.proof && (
                  <a href={`/admin/paiements/${p.id}/capture`} target="_blank" className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">
                    <ImageIcon size={14} /> Voir la capture
                  </a>
                )}
                {p.status === "en_attente" && (
                  <span className="ml-auto flex gap-2">
                    <form action={confirmPaymentAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25">
                        <CheckCircle2 size={14} /> Virement reçu — publier le site
                      </button>
                    </form>
                    <form action={refusePaymentAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs text-red-300/70 transition hover:bg-red-500/10 hover:text-red-300">
                        <XCircle size={14} /> Refuser
                      </button>
                    </form>
                  </span>
                )}
              </div>
              {p.note && <p className="mt-3 text-xs leading-relaxed text-white/40">{p.note}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
