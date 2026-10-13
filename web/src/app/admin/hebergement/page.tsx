import { CheckCircle2, Download, FileArchive, GitBranch, Globe, Mail, MessageCircle, Trash2, XCircle } from "lucide-react";
import { activateDomainAction, deactivateDomainAction, deleteHostingAction, refuseDomainAction, updateHostingAction } from "../actions";
import { getCustomDomain, getHostingRequests, HOSTING_STATUS, type HostingStatus } from "@/lib/db";

const fmt = (iso: string) =>
  new Date(iso + "Z").toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const size = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} Mo` : `${Math.ceil(n / 1024)} Ko`);

const BADGE: Record<HostingStatus, string> = {
  nouveau: "bg-fuchsia-500/15 text-fuchsia-300",
  en_cours: "bg-amber-400/15 text-amber-300",
  en_ligne: "bg-emerald-500/15 text-emerald-300",
  refuse: "bg-white/5 text-white/40",
};

export default async function AdminHosting() {
  const list = getHostingRequests();
  const pending = list.filter((r) => r.status === "nouveau").length;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Hébergement</h1>
      <p className="mt-2 text-white/50">
        Projets envoyés par les clients pour mise en ligne · {list.length} demande{list.length > 1 ? "s" : ""}
        {pending > 0 && <span className="ml-2 rounded-full bg-fuchsia-500/15 px-2.5 py-0.5 text-xs font-semibold text-fuchsia-300">{pending} nouvelle{pending > 1 ? "s" : ""}</span>}
      </p>

      {list.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center text-white/40">
          Aucune demande pour l&apos;instant. Les projets envoyés depuis <span className="text-white/70">/heberger</span> apparaîtront ici.
        </div>
      )}

      <div className="mt-8 space-y-4">
        {list.map((r) => {
          const wa = r.phone.replace(/\D/g, "");
          const dom = r.stack === "Domaine perso" && r.domain ? getCustomDomain(r.domain) : null;
          return (
            <div key={r.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-6 py-4">
                <span className="brand-grad grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white">
                  {r.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{r.name} <span className="text-xs font-normal text-white/35">#{r.id}{r.user_id ? " · client inscrit" : ""}</span></p>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/45">
                    <a href={`mailto:${r.email}`} className="flex items-center gap-1 hover:text-white"><Mail size={12} /> {r.email}</a>
                    {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-emerald-300"><MessageCircle size={12} /> {r.phone}</a>}
                  </p>
                </div>
                <span className={`ml-auto rounded-full px-3 py-1 text-[11px] font-semibold ${BADGE[r.status] ?? BADGE.nouveau}`}>{HOSTING_STATUS[r.status] ?? r.status}</span>
                <span className="text-xs text-white/35">{fmt(r.created_at)}</span>
              </div>

              <div className="grid gap-6 px-6 py-5 lg:grid-cols-[1fr_320px]">
                <div className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {r.stack && <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-cyan-200">{r.stack}</span>}
                    {r.domain && <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-white/70"><Globe size={12} /> {r.domain}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.file && (
                      <a href={`/admin/hebergement/${r.id}/fichier`} className="flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25">
                        <FileArchive size={15} /> {r.file_name} {r.file_size ? `· ${size(r.file_size)}` : ""} <Download size={14} />
                      </a>
                    )}
                    {r.repo_url && (
                      <a href={r.repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 font-mono text-xs text-white/80 transition hover:bg-white/10">
                        <GitBranch size={15} /> {r.repo_url.replace(/^https:\/\//, "")}
                      </a>
                    )}
                  </div>
                  {r.message && <p className="whitespace-pre-line rounded-xl bg-white/[0.03] p-4 text-white/65">{r.message}</p>}
                  {dom && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-3">
                      <Globe size={14} className="shrink-0 text-cyan-300" />
                      <span className="font-mono text-xs text-cyan-200">{dom.domain}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        dom.status === "actif" ? "bg-emerald-500/15 text-emerald-300"
                        : dom.status === "en_attente" ? "bg-amber-400/15 text-amber-300"
                        : dom.status === "desactive" ? "bg-white/10 text-white/45" : "bg-red-500/10 text-red-300"
                      }`}>
                        {dom.status === "actif" ? "domaine en ligne" : dom.status === "en_attente" ? "en attente" : dom.status === "desactive" ? "désactivé" : "refusé"}
                      </span>
                      <span className="ml-auto flex gap-1.5">
                        {(dom.status === "en_attente" || dom.status === "desactive") && (
                          <form action={activateDomainAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <button className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25">
                              <CheckCircle2 size={13} /> Activer
                            </button>
                          </form>
                        )}
                        {dom.status === "actif" && (
                          <form action={deactivateDomainAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <button className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/10">
                              Désactiver
                            </button>
                          </form>
                        )}
                        {dom.status === "en_attente" && (
                          <form action={refuseDomainAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-red-300/70 transition hover:bg-red-500/10 hover:text-red-300">
                              <XCircle size={13} /> Refuser
                            </button>
                          </form>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <form action={updateHostingAction} className="space-y-2">
                    <input type="hidden" name="id" value={r.id} />
                    <select name="status" defaultValue={r.status} className="w-full rounded-xl border border-white/10 bg-[#0c0c14] px-3 py-2.5 text-sm outline-none focus:border-fuchsia-400/50">
                      {Object.entries(HOSTING_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <textarea name="note" defaultValue={r.note} rows={3} placeholder="Note interne : devis, URL de déploiement, suivi…" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm outline-none placeholder:text-white/25 focus:border-fuchsia-400/50" />
                    <button className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90">Enregistrer</button>
                  </form>
                  <form action={deleteHostingAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs text-white/35 transition hover:bg-red-500/10 hover:text-red-300">
                      <Trash2 size={13} /> Supprimer la demande et le fichier
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
