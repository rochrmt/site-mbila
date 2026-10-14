"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Check, Copy, Loader2, Zap } from "lucide-react";
import { payOnline } from "@/app/actions";
import { DURATIONS, PLANS, planLabel, totalFor, type PlanId } from "@/lib/pricing";
import { PHONE_OK } from "@/lib/validation";

// Prix résolus côté serveur (peuvent venir de la grille admin, avec promo)
export type PlanPrice = { monthly: number; original?: number; label?: string };
export type Prices = { essentiel: PlanPrice; premium?: PlanPrice };
// Produits Chariow disponibles : clé "<plan>:<mois>" → prix réellement payé en ligne
export type OnlineProducts = Record<string, { price: number }>;

const OM_NUMBER = "72 67 91 75";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-400/60 focus:ring-4 focus:ring-fuchsia-500/10";

// Paiement en 3 étapes (comme le wizard de création) : offre → transfert
// Orange Money → « j'ai payé ». Validation manuelle côté admin.
// Le paiement en ligne (Chariow) est proposé quand l'offre a un produit associé.
export default function PayForm({ siteId, prices, onDone, online, manual = true }: { siteId: number; prices: Prices; onDone?: () => void; online?: OnlineProducts; manual?: boolean }) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<PlanId>("essentiel");
  const [months, setMonths] = useState(1);
  const [payer, setPayer] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [onlineErr, onlineAction, onlineBusy] = useActionState(payOnline, undefined);

  const pp = prices[plan];
  const total = totalFor(pp.monthly, months);
  const amount = total.toLocaleString("fr-FR");
  const dur = DURATIONS.find((d) => d.months === months)!;
  const fullPrice = (pp.monthly * months).toLocaleString("fr-FR");
  const promoLabel = pp.label ?? (pp.original ? "Promotion" : null);

  async function send() {
    if (payer && !PHONE_OK(payer)) return setErr("Numéro invalide : entrez le numéro utilisé pour payer (ex : 72 67 91 75).");
    setBusy(true); setErr("");
    const f = new FormData();
    f.set("site_id", String(siteId));
    f.set("plan", plan);
    f.set("months", String(months));
    f.set("payer", payer);
    const r = await fetch("/api/payment", { method: "POST", body: f });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok || !j.ok) return setErr(j.error || "Envoi échoué. Réessayez.");
    setDone(true);
    onDone?.();
  }

  if (done) {
    return (
      <div className="pop-in text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-300"><Check size={26} /></span>
        <p className="mt-4 font-semibold">Paiement signalé !</p>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          On vérifie votre transfert sur notre compte Orange Money, ça peut prendre
          un peu de temps (généralement moins de 24 h). Votre site passe en ligne
          automatiquement dès la confirmation. En attendant, personnalisez-le à volonté.
        </p>
      </div>
    );
  }

  const titles = ["Choisissez votre offre", "Effectuez le transfert", "Confirmez votre paiement"];

  return (
    <div>
      {/* Indicateur d'étapes — masqué quand le transfert manuel est désactivé */}
      {manual && (
        <div className="mb-6 flex items-center gap-2">
          {titles.map((t, i) => (
            <div key={t} className="flex flex-1 flex-col gap-1.5">
              <div className={`h-1 rounded-full transition-all duration-500 ${i <= step ? "brand-grad" : "bg-white/10"}`} />
              <span className={`text-[10px] font-medium ${i === step ? "text-white" : "text-white/35"}`}>{i + 1}. {t}</span>
            </div>
          ))}
        </div>
      )}

      {step === 0 && (
        <div className="pop-in">
          <div className="grid gap-3 sm:grid-cols-2">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={`rounded-2xl border p-4 text-left transition ${plan === p.id ? "border-fuchsia-400/60 bg-fuchsia-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
              >
                <p className="font-semibold">{p.name}</p>
                <p className="brand-text mt-1 font-display text-lg font-bold">
                  {prices[p.id].original && <span className="mr-2 align-middle text-sm font-medium text-white/35 line-through">{prices[p.id].original!.toLocaleString("fr-FR")}</span>}
                  {totalFor(prices[p.id].monthly, months).toLocaleString("fr-FR")} FCFA
                </p>
                {(prices[p.id].original || prices[p.id].label) && (
                  <span className="mt-1.5 inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">🏷️ {prices[p.id].label ?? "Promotion"}</span>
                )}
                <p className="mt-1 text-xs text-white/50">{p.desc}</p>
                <ul className="mt-3 space-y-1">
                  {p.feats.map((f) => <li key={f} className="flex items-start gap-1.5 text-[11px] text-white/55"><Check size={12} className="mt-0.5 shrink-0 text-emerald-400" />{f}</li>)}
                </ul>
              </button>
            ))}
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/40">Durée · plus c&apos;est long, moins c&apos;est cher</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.months}
                onClick={() => setMonths(d.months)}
                className={`relative rounded-xl border px-3 py-2.5 text-center transition ${months === d.months ? "border-fuchsia-400/60 bg-fuchsia-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
              >
                <p className="text-sm font-semibold">{d.label}</p>
                <p className="mt-0.5 text-[11px] text-white/45">{totalFor(pp.monthly, d.months).toLocaleString("fr-FR")} F</p>
                {d.badge && <span className="absolute -top-2 right-1.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-black">{d.badge}</span>}
              </button>
            ))}
          </div>
          {dur.badge && <p className="mt-2 text-center text-xs text-emerald-300/80">Au lieu de {fullPrice} FCFA, vous économisez {(pp.monthly * months - total).toLocaleString("fr-FR")} F</p>}
          {promoLabel && <p className="mt-3 text-center text-xs font-semibold text-emerald-300/90">🏷️ {promoLabel}{pp.original ? " appliquée sur votre tarif" : ""}</p>}

          {(online?.[`${plan}:${months}:${pp.monthly}`] ?? online?.[`${plan}:${months}`] ?? online?.[plan]) && (
            <form action={onlineAction} className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
              <input type="hidden" name="site_id" value={siteId} />
              <input type="hidden" name="plan" value={plan} />
              <input type="hidden" name="months" value={months} />
              <button
                disabled={onlineBusy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/25 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
              >
                {onlineBusy ? <Loader2 size={17} className="animate-spin" /> : <Zap size={17} />}
                {onlineBusy
                  ? "Redirection vers le paiement…"
                  : `Payer ${(online[`${plan}:${months}:${pp.monthly}`] ?? online[`${plan}:${months}`] ?? online[plan]).price.toLocaleString("fr-FR")} F en ligne, activation immédiate`}
              </button>
              <p className="mt-2 text-center text-[11px] text-white/45">Orange Money · MTN MoMo · Moov · Wave · carte · sécurisé par Chariow</p>
              {onlineErr?.error && <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">{onlineErr.error}</p>}
              {manual && <p className="mt-2 text-center text-[11px] text-white/35">↓ ou ci-dessous : transfert Orange Money avec vérification manuelle</p>}
            </form>
          )}
          {/* Manuel désactivé + pas de produit en ligne pour cette offre → message clair */}
          {!manual && !(online?.[`${plan}:${months}:${pp.monthly}`] ?? online?.[`${plan}:${months}`] ?? online?.[plan]) && (
            <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-xs leading-relaxed text-white/50">
              Le paiement en ligne n&apos;est pas disponible pour cette offre. Contactez-nous pour finaliser votre commande.
            </p>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="pop-in">
          <div className="rounded-2xl border border-orange-400/25 bg-orange-500/[0.07] p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-white/40">{planLabel(plan, months)} · Envoyez par Orange Money</p>
            <p className="brand-text mt-3 font-display text-4xl font-bold">{amount} FCFA</p>
            <p className="mt-1 text-sm text-white/55">vers le numéro</p>
            <button
              onClick={() => { navigator.clipboard?.writeText(OM_NUMBER.replace(/\s/g, "")); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
              className="mx-auto mt-3 flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-mono text-xl font-bold tracking-wider transition hover:border-orange-400/40"
            >
              {OM_NUMBER} {copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={15} className="text-white/40" />}
            </button>
            <p className="mt-3 text-xs text-white/45">Depuis votre appli Orange Money ou au <code className="rounded bg-white/10 px-1.5 py-0.5">#144#</code> → Transfert</p>
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-white/40">
            La vérification est faite à la main, ça peut prendre un peu de temps. On vous prévient dès que c&apos;est bon.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="pop-in">
          <label className="text-sm text-white/70">Numéro Orange Money utilisé pour payer <span className="text-white/35">(recommandé, accélère la vérification)</span></label>
          <input autoFocus value={payer} onChange={(e) => { setPayer(e.target.value); setErr(""); }} inputMode="tel" placeholder="Ex : 72 00 00 00" className={`${input} mt-3 ${payer && !PHONE_OK(payer) ? "border-red-400/60" : ""}`} />
          {payer && !PHONE_OK(payer) && <p className="mt-2 text-xs text-red-300">Format attendu : 7 à 15 chiffres (ex : 72 67 91 75)</p>}
          {err && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>}
          <button
            onClick={send}
            disabled={busy}
            className="brand-grad mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? <><Loader2 size={16} className="animate-spin" /> Envoi…</> : "J'ai envoyé le paiement"}
          </button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-white/35">
            Pas encore payé ? Envoyez d&apos;abord le montant, puis revenez cliquer ici.
            En confirmant vous acceptez nos <Link href="/conditions" target="_blank" className="text-fuchsia-300/80 underline-offset-2 hover:underline">Conditions d&apos;utilisation</Link>.
          </p>
        </div>
      )}

      {/* « Continuer » mène au transfert manuel — désactivé si l'admin coupe le manuel */}
      {step < 2 && manual && (
        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="rounded-full px-5 py-2.5 text-sm text-white/50 transition hover:bg-white/5">← Retour</button>
          ) : <span />}
          <button
            onClick={() => setStep((s) => s + 1)}
            className="brand-grad rounded-full px-7 py-3 text-sm font-semibold shadow-lg shadow-fuchsia-500/20 transition hover:scale-[1.02]"
          >
            Continuer →
          </button>
        </div>
      )}
    </div>
  );
}
