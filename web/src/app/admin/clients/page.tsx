import Link from "next/link";
import { Download, ExternalLink, Globe, Mail, MessageSquareText, PencilLine } from "lucide-react";
import { getClients } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { siteUrl } from "@/lib/config";
import { verifyUserEmailAction } from "@/app/admin/actions";
import SiteActions from "@/components/admin/SiteActions";
import UserActions from "@/components/admin/UserActions";

const fmt = (iso: string) =>
  new Date(iso + "Z").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminClients() {
  const clients = getClients();
  const totalSites = clients.reduce((n, c) => n + c.sites.length, 0);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Clients</h1>
      <p className="mt-2 text-white/50">
        {clients.length} compte{clients.length > 1 ? "s" : ""} · {totalSites} site{totalSites > 1 ? "s" : ""}
      </p>

      <div className="mt-8 space-y-4">
        {clients.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-6 py-4">
              <span className="brand-grad grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white">
                {c.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{c.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-white/45">
                  <Mail size={11} /> {c.email ?? `📱 ${c.phone}`}
                  {c.blocked && <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-300">bloqué</span>}
                  {c.email && !c.emailVerified && <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">non vérifié</span>}
                  {c.email && !c.emailVerified && (
                    <form action={verifyUserEmailAction}>
                      <input type="hidden" name="user_id" value={c.id} />
                      <button className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-500/25" title="Identité prouvée (WhatsApp) · active le compte sans le lien email">
                        ✓ Confirmer l&apos;email
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <div className="ml-auto flex flex-col items-end gap-2">
                <p className="text-xs text-white/35">Inscrit le {fmt(c.since)}</p>
                {!isAdmin({ email: c.email }) && <UserActions userId={c.id} name={c.name} sitesCount={c.sites.length} blocked={c.blocked} />}
              </div>
            </div>

            {c.sites.length === 0 ? (
              <p className="px-6 py-4 text-sm text-white/35">Aucun site créé pour l&apos;instant.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {c.sites.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-6 py-3.5">
                    <Globe size={15} className="shrink-0 text-white/35" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-white/40">
                        {s.slug} · design {s.templateId} · créé le {fmt(s.created)}
                        {s.paidUntil && (
                          <span className={s.paidUntil < new Date().toISOString() ? "font-semibold text-red-300/80" : ""}>
                            {" "}· {s.paidUntil < new Date().toISOString() ? "abonnement expiré le" : "payé jusqu'au"} {fmt(s.paidUntil.slice(0, 10))}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-white/45">
                      <MessageSquareText size={12} /> {s.leads} lead{s.leads > 1 ? "s" : ""}
                    </span>
                    <Link href={`/dashboard/sites/${s.id}`} className="ml-auto flex items-center gap-1.5 rounded-full bg-fuchsia-500/15 px-3 py-1.5 text-[11px] font-semibold text-fuchsia-300 transition hover:bg-fuchsia-500/25" title="Ouvrir l'éditeur de ce site (support)">
                      <PencilLine size={12} /> Modifier
                    </Link>
                    <a href={`/admin/export/${s.id}`} className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/25" title="Télécharger le site complet (ZIP)">
                      <Download size={12} /> Exporter
                    </a>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.suspended ? "bg-amber-500/15 text-amber-300" : s.published ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-white/40"}`}>
                      {s.suspended ? "Suspendu" : s.published ? "En ligne" : "Brouillon"}
                    </span>
                    <SiteActions siteId={s.id} siteName={s.name} suspended={s.suspended} published={s.published} inCarousel={s.inCarousel} inExamples={s.inExamples} />
                    {s.published && (
                      <a href={siteUrl(s.slug)} target="_blank" rel="noreferrer" className="grid h-7 w-7 place-items-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white" aria-label={`Voir ${s.slug}`}>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {clients.length === 0 && <p className="text-white/40">Aucun client inscrit.</p>}
      </div>
    </div>
  );
}
