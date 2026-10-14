import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ExternalLink, Loader2, Palette, RefreshCw, Wallet } from "lucide-react";
import DashHeader from "@/components/DashHeader";
import PendingPoll from "@/components/PendingPoll";
import PayForm from "@/components/editor/PayForm";
import { retryOnlinePayment, switchToManualPayment } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { DISPLAY_DOMAIN, PROTOCOL, siteUrl } from "@/lib/config";
import { getNotifications, getPaymentsBySite, getSiteById, manualPaymentEnabled, siteIsPaid, sitePlanPrice } from "@/lib/db";
import { chariowPricesForSite } from "@/lib/chariow";
import { planLabel } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mettre en ligne · Mbila" };

export default async function PayPage({ params }: { params: Promise<{ id  : string }> }) {
  const user = await requireUser();
  const site = getSiteById(Number((await params).id));
  if (!site || (site.user_id !== user.id && !isAdmin(user))) notFound();

  const url = siteUrl(site.slug); // URL réelle (liens « Ouvrir » — fonctionne en démo)
  const shownUrl = `${PROTOCOL}://${site.slug}.${DISPLAY_DOMAIN}`; // URL affichée/partagée (mbila.ca)
  const paid = siteIsPaid(site);
  const pending = getPaymentsBySite(site.id).find((p) => p.status === "en_attente");
  const online = site.published && paid && !site.suspended;
  const manualOn = manualPaymentEnabled(); // réglage admin : transfert OM autorisé ou non

  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      <DashHeader name={user.name} admin={isAdmin(user)} notifications={getNotifications(user.id).list} unread={getNotifications(user.id).unread} />
      <main className="mx-auto max-w-2xl px-6 py-14">
        {online || site.suspended ? (
          /* ── Site en ligne / suspendu : statut + renouvellement ── */
          <>
            {online ? (
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.06] p-10 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300"><Check size={30} /></span>
                <h1 className="pop-in mt-6 font-display text-4xl font-bold">Votre site est en ligne !</h1>
                <p className="mt-3 text-white/60">Partagez votre lien avec vos clients :</p>
                <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <a href={url} target="_blank" className="min-w-0 flex-1 truncate font-mono text-sm text-cyan-200 hover:underline">{shownUrl}</a>
                  <a href={url} target="_blank" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 hover:bg-white/10" aria-label="Ouvrir"><ExternalLink size={15} /></a>
                </div>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Découvrez ${site.data.name} : ${shownUrl}`)}`}
                  target="_blank"
                  className="mt-4 inline-block rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Partager sur WhatsApp
                </a>
                <p className="mt-6 text-xs text-white/40">
                  Abonnement actif jusqu&apos;au {new Date(site.paid_until!).toLocaleDateString("fr-FR")} ·{" "}
                  <Link href={`/dashboard/sites/${site.id}`} className="text-white/70 underline-offset-2 hover:underline">Continuer à personnaliser</Link>
                </p>
                <div className="mx-auto mt-6 max-w-md rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-4 text-left">
                  <p className="text-sm font-semibold text-cyan-200">Votre propre nom de domaine ?</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">
                    monentreprise.com au lieu de {shownUrl.split("://")[1]}. On s&apos;occupe de tout — demandez-le depuis
                    l&apos;éditeur (onglet Réglages) ou sur WhatsApp, réponse sous 24 h.
                  </p>
                  <Link href={`/dashboard/sites/${site.id}?tab=settings`} className="mt-2.5 inline-block rounded-full bg-cyan-400/15 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/25">
                    Demander mon domaine →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-amber-400/25 bg-amber-400/[0.06] p-8 text-center">
                <h1 className="font-display text-3xl font-bold">Site suspendu</h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55">
                  Votre site est hors ligne pour le moment. Réglez ou renouvelez votre abonnement ci-dessous :
                  il sera remis en ligne dès la confirmation du paiement.
                </p>
              </div>
            )}
            {pending ? (
              <div className="mt-6 rounded-3xl border border-amber-400/20 bg-amber-400/[0.05] p-8 text-center">
                <PendingPoll />
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-400/15 text-amber-300"><Loader2 size={24} className="animate-spin" /></span>
                <h2 className="mt-4 font-display text-2xl font-bold">Renouvellement en vérification</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
                  {pending.method === "chariow"
                    ? "Paiement en ligne en cours, la confirmation arrive automatiquement (généralement instantanée)."
                    : "Votre transfert est en cours de vérification. Votre abonnement sera prolongé dès la confirmation."}
                </p>
                <p className="mx-auto mt-2 text-sm text-white/45">
                  Offre : <b className="text-white/80">{planLabel(pending.plan, pending.months)} · {pending.amount.toLocaleString("fr-FR")} FCFA</b>
                </p>
                {pending.method === "chariow" && (
                  <div className="mx-auto mt-5 flex max-w-sm flex-col gap-2">
                    <form action={retryOnlinePayment}>
                      <input type="hidden" name="payment_id" value={pending.id} />
                      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black transition hover:brightness-110">
                        <RefreshCw size={15} /> Réessayer le paiement en ligne
                      </button>
                    </form>
                    {manualOn && (
                      <>
                        <form action={switchToManualPayment}>
                          <input type="hidden" name="payment_id" value={pending.id} />
                          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-400/40 bg-orange-400/10 px-5 py-3 text-sm font-semibold text-orange-200 transition hover:bg-orange-400/20">
                            <Wallet size={15} /> Payer par transfert Orange Money
                          </button>
                        </form>
                        <p className="text-[11px] text-white/40">Le paiement en ligne ne marche pas ? Choisissez le transfert, notre équipe vérifie et valide.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
                <h2 className="font-display text-2xl font-bold">{online ? "Prolonger ou changer d'offre" : "Régulariser mon abonnement"}</h2>
                <p className="mt-1 text-sm text-white/50">Le temps payé s&apos;ajoute à la fin de votre abonnement actuel, rien n&apos;est perdu.</p>
                <div className="mt-5">
                  <PayForm siteId={site.id} prices={{ essentiel: sitePlanPrice("essentiel", site.category) }} online={chariowPricesForSite(site.category, sitePlanPrice("essentiel", site.category).monthly)} manual={manualOn} />
                </div>
              </div>
            )}
          </>
        ) : pending ? (
          /* ── En attente de vérification ───────────────────────── */
          <div className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.05] p-10 text-center">
            <PendingPoll />
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-400/15 text-amber-300"><Loader2 size={28} className="animate-spin" /></span>
            <h1 className="mt-6 font-display text-3xl font-bold">Paiement en vérification</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55">
              {pending.method === "chariow"
                ? "Votre paiement en ligne est en cours de confirmation, en général quelques secondes. Votre site passe en ligne automatiquement, cette page se mettra à jour toute seule."
                : "On vérifie votre transfert Orange Money, ça peut prendre un peu de temps (généralement moins de 24 h). Votre site passe en ligne automatiquement dès la confirmation, cette page se mettra à jour toute seule."}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/45">
              Offre : <b className="text-white/80">{planLabel(pending.plan, pending.months)} · {pending.amount.toLocaleString("fr-FR")} FCFA</b>
            </p>
            {pending.method === "chariow" && (
              <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2">
                <form action={retryOnlinePayment}>
                  <input type="hidden" name="payment_id" value={pending.id} />
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black transition hover:brightness-110">
                    <RefreshCw size={15} /> Réessayer le paiement en ligne
                  </button>
                </form>
                {manualOn && (
                  <>
                    <form action={switchToManualPayment}>
                      <input type="hidden" name="payment_id" value={pending.id} />
                      <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-400/40 bg-orange-400/10 px-5 py-3 text-sm font-semibold text-orange-200 transition hover:bg-orange-400/20">
                        <Wallet size={15} /> Payer par transfert Orange Money
                      </button>
                    </form>
                    <p className="text-[11px] text-white/40">Le paiement en ligne ne marche pas ? Choisissez le transfert, notre équipe vérifie et valide.</p>
                  </>
                )}
              </div>
            )}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={`/dashboard/sites/${site.id}`} className="brand-grad flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-lg shadow-fuchsia-500/25 transition hover:scale-[1.03]">
                <Palette size={16} /> Personnaliser mon site en attendant
              </Link>
              <Link href="/dashboard" className="rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/70 transition hover:bg-white/5">
                Mes sites
              </Link>
            </div>
            <p className="mt-6 text-xs text-white/35">Cette page se met à jour toute seule quand le paiement est confirmé.</p>
          </div>
        ) : (
          /* ── Paiement ─────────────────────────────────────────── */
          <>
            <div className="text-center">
              <span className="pop-in inline-block rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-1.5 text-xs font-semibold text-fuchsia-200">
                Votre site « {site.data.name} » est prêt ✓
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold">Une dernière étape :<br /><span className="brand-text">le mettre en ligne.</span></h1>
              <p className="mx-auto mt-4 max-w-md text-white/55">
                Choisissez votre offre et payez par Orange Money. Pendant qu&apos;on vérifie
                (ça peut prendre un peu de temps), vous pouvez déjà personnaliser votre site à volonté.
              </p>
              <Link
                href={`/dashboard/sites/${site.id}`}
                className="mt-6 inline-flex items-center gap-2.5 rounded-2xl border border-cyan-400/40 bg-cyan-400/15 px-8 py-4 text-base font-bold text-cyan-100 shadow-lg shadow-cyan-500/15 transition hover:scale-[1.03] hover:bg-cyan-400/25"
              >
                <Palette size={20} /> Personnaliser mon site en attendant la validation
              </Link>
            </div>
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <PayForm siteId={site.id} prices={{ essentiel: sitePlanPrice("essentiel", site.category) }} online={chariowPricesForSite(site.category, sitePlanPrice("essentiel", site.category).monthly)} manual={manualOn} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
