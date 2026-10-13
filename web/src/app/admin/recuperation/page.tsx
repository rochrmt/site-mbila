import { AlertTriangle, Clock, KeyRound } from "lucide-react";
import { getPasswordResets } from "@/lib/db";
import RecoveryActions from "@/components/admin/RecoveryActions";

export const metadata = { title: "Récupérations · Admin Mbila" };
export const dynamic = "force-dynamic";

// Demandes de récupération de compte. Jamais de remise automatique :
// l'admin vérifie l'identité du client (WhatsApp) PUIS réinitialise.
export default function Recuperation() {
  const list = getPasswordResets();
  const pendingCount = list.filter((r) => r.status === "en_attente").length;

  // Une seule liste (SQL trie : en attente d'abord) — le composant d'action n'est jamais
  // déplacé/démonté quand le statut change, sinon le mot de passe temporaire serait perdu.
  const Row = ({ r }: { r: (typeof list)[number] }) => (
    <li className={`rounded-xl border bg-white/[0.03] p-4 ${r.status === "en_attente" ? "border-amber-400/30" : "border-white/10 opacity-60"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{r.user_name ?? "Compte non identifié"}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.status === "en_attente" ? "bg-amber-400/15 text-amber-300" : r.status === "traite" ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white/40"}`}>
              {r.status === "en_attente" ? "en attente" : r.status === "traite" ? "réinitialisé" : "rejetée"}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/50">
            Saisi : <span className="font-mono text-white/70">{r.identifier}</span>
            {r.user_email && <> · compte : {r.user_email}</>}
            {r.user_phone && <> · 📱 {r.user_phone}</>}
          </p>
          {r.site_slugs && <p className="mt-0.5 text-xs text-white/45">Sites du compte : {r.site_slugs}</p>}
          {r.message && <p className="mt-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs italic text-white/55">« {r.message} »</p>}
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-white/35"><Clock size={11} /> {new Date(r.created_at + "Z").toLocaleString("fr-FR")} · rappel WhatsApp : <span className="font-mono text-white/55">{r.contact}</span></p>
        </div>
        <RecoveryActions resetId={r.id} contact={r.contact} userName={r.user_name ?? "le client"} canReset={!!r.user_id} pending={r.status === "en_attente"} />
      </div>
    </li>
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Récupérations de compte</h1>
      <p className="mt-2 text-white/50">Clients qui ont perdu leur mot de passe et demandent une réinitialisation.</p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-5 py-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />
        <p className="text-sm leading-relaxed text-amber-200/80">
          <b>Avant de réinitialiser, vérifiez l&apos;identité du client par WhatsApp</b> (numéro indiqué ci-dessous) :
          demandez le nom du site, un détail de son contenu ou une capture de son espace. Ne transmettez jamais le mot de
          passe temporaire à un autre numéro que celui du compte — c&apos;est le seul rempart contre l&apos;usurpation.
        </p>
      </div>

      {list.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/40">
          <KeyRound size={28} className="mx-auto mb-3 opacity-50" />
          Aucune demande de récupération pour le moment.
        </div>
      )}

      {list.length > 0 && (
        <>
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-amber-300/80">
            {pendingCount > 0 ? `${pendingCount} en attente` : "Historique"}
          </h2>
          <ul className="mt-3 space-y-3">{list.map((r) => <Row key={r.id} r={r} />)}</ul>
        </>
      )}
    </div>
  );
}
