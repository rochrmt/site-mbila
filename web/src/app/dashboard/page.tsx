import Link from "next/link";
import { ExternalLink, FileArchive, Globe, Mail, MessageCircle, Pencil, Plus, RefreshCcw, Zap } from "lucide-react";
import DashHeader from "@/components/DashHeader";
import ScaledFrame from "@/components/ScaledFrame";
import { isAdmin } from "@/lib/admin";
import { requireUser } from "@/lib/auth";
import { DISPLAY_DOMAIN, siteUrl } from "@/lib/config";
import { getDomainsBySite, getHostingRequestsByUser, getLeads, getNotifications, getSitesByUser, HOSTING_STATUS } from "@/lib/db";
import { templateById } from "@/templates/all";

export const metadata = { title: "Mes sites · Mbila" };

export default async function Dashboard() {
  const user = await requireUser();
  const sites = getSitesByUser(user.id);
  const requests = getHostingRequestsByUser(user.id);
  const WA = "https://wa.me/23672679175";
  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      <DashHeader name={user.name} admin={isAdmin(user)} notifications={getNotifications(user.id).list} unread={getNotifications(user.id).unread} />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold">Mes sites</h1>
            <p className="mt-2 text-white/50">Gérez, modifiez et partagez vos sites.</p>
          </div>
          <Link href="/creer" className="brand-grad flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg shadow-fuchsia-500/20">
            <Plus size={18} /> Nouveau site
          </Link>
        </div>

        {sites.length > 0 && (
          <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300"><Globe size={20} /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Votre propre nom de domaine</p>
                <p className="mt-0.5 text-sm leading-snug text-white/50">monentreprise.com au lieu de {DISPLAY_DOMAIN}. On s&apos;occupe de tout, réponse sur WhatsApp.</p>
              </div>
            </div>
            <Link href={`/dashboard/sites/${sites[0].id}?tab=settings`} className="mt-3 block rounded-full bg-cyan-400/15 px-5 py-2.5 text-center text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/25 sm:mt-4">
              Je veux mon domaine →
            </Link>
          </div>
        )}

        {sites.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-white/15 p-16 text-center">
            <p className="font-display text-2xl font-semibold">Vous n&apos;avez pas encore de site</p>
            <p className="mt-2 text-white/50">Créez-le en 2 minutes, c&apos;est gratuit.</p>
            <Link href="/creer" className="brand-grad mt-8 inline-block rounded-full px-7 py-3.5 text-sm font-semibold">Créer mon premier site</Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((s) => {
              const leads = getLeads(s.id).length;
              const dom = getDomainsBySite(s.id).find((x) => x.status === "actif") ?? getDomainsBySite(s.id)[0];
              const expired = !!s.paid_until && s.paid_until <= new Date().toISOString();
              return (
                <div key={s.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <Link href={`/dashboard/sites/${s.id}`} className="block">
                    <ScaledFrame src={`/preview/${s.id}`} ratio={0.62} />
                  </Link>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-display text-lg font-semibold">{s.data.name}</p>
                        <p className="truncate text-sm text-white/45">
                          {dom ? <span className={dom.status === "actif" ? "text-cyan-300" : "text-amber-300/70"}>{dom.domain}{dom.status === "actif" ? "" : " · en attente"}</span> : `${s.slug}.${DISPLAY_DOMAIN}`}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${s.suspended ? "bg-amber-400/10 text-amber-300" : s.published && expired ? "bg-red-400/10 text-red-300" : s.published ? "bg-emerald-400/10 text-emerald-300" : "bg-white/10 text-white/50"}`}>
                        {s.suspended ? "Suspendu" : s.published && expired ? "Expiré" : s.published ? "En ligne" : s.paid_until && s.paid_until > new Date().toISOString() ? "Prêt à publier" : "Brouillon"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
                      <span>Modèle {templateById(s.template_id).name}</span>
                      <span className="flex items-center gap-1"><Mail size={12} /> {leads} message{leads > 1 ? "s" : ""}</span>
                    </div>
                    {s.paid_until && (
                      <Link
                        href={`/payer/${s.id}`}
                        className={`mt-3 flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-xs transition ${expired ? "border border-red-400/25 bg-red-500/10 text-red-200 hover:bg-red-500/20" : "border border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.07]"}`}
                      >
                        <span>{expired ? "Abonnement expiré le" : "Abonnement jusqu'au"} {new Date(s.paid_until).toLocaleDateString("fr-FR")}</span>
                        <span className={`flex shrink-0 items-center gap-1 font-semibold ${expired ? "text-red-200" : "text-fuchsia-300"}`}><RefreshCcw size={11} /> Renouveler</span>
                      </Link>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Link href={`/dashboard/sites/${s.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-black hover:bg-white/90">
                        <Pencil size={15} /> Modifier
                      </Link>
                      <Link href={`/dashboard/sites/${s.id}?tab=settings`} title="Utiliser mon propre nom de domaine" className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20">
                        <Globe size={15} /> Domaine
                      </Link>
                      {!s.published && (
                        <Link href={`/payer/${s.id}`} title="Mettre en ligne (paiement Orange Money)" className="flex items-center justify-center gap-2 rounded-xl border border-fuchsia-400/25 bg-fuchsia-400/10 px-4 py-2.5 text-sm font-semibold text-fuchsia-200 transition hover:bg-fuchsia-400/20">
                          <Zap size={15} />
                        </Link>
                      )}
                      {s.published && (
                        <a href={siteUrl(s.slug)} target="_blank" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5">
                          <ExternalLink size={15} /> Voir
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Suivi des demandes (hébergement projet, domaine) — la suite se gère avec nous */}
        {requests.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-2xl font-bold">Mes demandes</h2>
            <p className="mt-1 text-sm text-white/45">Hébergement de projet, domaine personnalisé. La suite se règle avec nous sur WhatsApp.</p>
            <div className="mt-5 space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-white/60">
                    {r.stack === "Domaine perso" ? <Globe size={18} /> : <FileArchive size={18} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.stack === "Domaine perso" ? `Domaine ${r.domain}` : r.name}</p>
                    <p className="text-xs text-white/40">
                      envoyée le {new Date(r.created_at + "Z").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      {r.stack !== "Domaine perso" && ` · ${r.repo_url ? "dépôt Git" : "fichier zip"}`}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    r.status === "en_ligne" ? "bg-emerald-500/15 text-emerald-300"
                    : r.status === "refuse" ? "bg-red-500/15 text-red-300"
                    : r.status === "en_cours" ? "bg-cyan-400/15 text-cyan-300"
                    : "bg-white/10 text-white/60"
                  }`}>
                    {r.status === "nouveau" ? "Reçue" : HOSTING_STATUS[r.status as keyof typeof HOSTING_STATUS]}
                  </span>
                  <a href={WA} target="_blank" className="flex items-center gap-1.5 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20">
                    <MessageCircle size={13} /> Nous contacter
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
