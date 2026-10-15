import { NextResponse } from "next/server";
import { confirmPayment, getDb, getPayment, notify, notifyAdmins, recordPulseDelivery, setPaymentExternal, setPaymentStatus } from "@/lib/db";
import { verifyPulseSignature } from "@/lib/chariow";

export const dynamic = "force-dynamic";

// Notre custom_metadata est renvoyé tel quel dans le payload de la vente —
// on le cherche aux endroits connus de la structure (sale → data → racine).
type PulsePayload = { sale?: { id?: string; custom_metadata?: Record<string, string> }; data?: { sale?: { id?: string; custom_metadata?: Record<string, string> }; custom_metadata?: Record<string, string> }; custom_metadata?: Record<string, string> };

function saleMeta(p: PulsePayload) {
  return p?.data?.sale?.custom_metadata ?? p?.sale?.custom_metadata ?? p?.data?.custom_metadata ?? p?.custom_metadata ?? {};
}
function saleRef(p: PulsePayload) {
  return String(p?.data?.sale?.id ?? p?.sale?.id ?? "");
}

// Motif d'un échec/abandon : la structure exacte du payload n'est pas documentée,
// on cherche donc une clé plausible (reason, error, message…) portant une valeur
// texte courte — à chaque niveau d'objet, profondeur limitée.
const REASON_KEY = /reason|fail|error|message|declin|reject|status_detail|detail/i;
function failureDetail(p: unknown, depth = 0): string {
  if (!p || typeof p !== "object" || depth > 4) return "";
  const entries = Object.entries(p as Record<string, unknown>);
  for (const [k, v] of entries) {
    if (REASON_KEY.test(k) && typeof v === "string" && v.trim() && v.length <= 200)
      return `${k} : ${v.trim()}`;
  }
  for (const [, v] of entries) {
    const r = failureDetail(v, depth + 1);
    if (r) return r;
  }
  return "";
}

// Webhook Chariow (« Pulse ») : activation automatique de l'abonnement après paiement en ligne.
// Sécurité : signature HMAC obligatoire (un POST forgé = 401) + déduplication des livraisons.
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyPulseSignature(raw, req.headers.get("x-chariow-signature")))
    return NextResponse.json({ error: "signature invalide" }, { status: 401 });

  const deliveryId = req.headers.get("x-pulse-delivery-id") ?? "";
  const event = req.headers.get("x-pulse-event") ?? "";
  // Chariow retente les livraisons : ignorer les doublons, confirmer quand même la réception
  if (deliveryId && !recordPulseDelivery(deliveryId, event))
    return NextResponse.json({ ok: true, duplicate: true });

  let payload: PulsePayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const meta = saleMeta(payload);
  const paymentId = Number(meta.payment_id ?? 0);
  let payment = paymentId ? getPayment(paymentId) : null;
  // Plan B : metadata absente/perdue → retrouver par l'id de vente stocké
  // à la création de la session (external_ref).
  if (!payment) {
    const ref = saleRef(payload);
    if (ref) payment = (getDb().prepare("SELECT * FROM payments WHERE external_ref = ? LIMIT 1").get(ref) as ReturnType<typeof getPayment>) ?? null;
  }

  if (event === "successful.sale") {
    if (!payment || payment.method !== "chariow") {
      // Vente Chariow sans paiement Mbila correspondant (boutique directe) : noté, ignoré
      console.log(`[pulse] successful.sale sans paiement lié (payment_id=${meta.payment_id ?? "?"})`);
      return NextResponse.json({ ok: true });
    }
    const ref = saleRef(payload);
    if (ref) setPaymentExternal(payment.id, ref);
    confirmPayment(payment.id); // prolonge paid_until, publie, lève la suspension
    setPaymentStatus(payment.id, "confirme", `Confirmé automatiquement via Chariow${ref ? ` (vente ${ref})` : ""}`);
    if (payment.user_id) notify(payment.user_id, "✅ Paiement confirmé : votre site est en ligne !", `/payer/${payment.site_id}`);
    notifyAdmins(`💳 Paiement en ligne confirmé : ${payment.amount.toLocaleString("fr-FR")} F (Chariow)`, "/admin/paiements");
  } else if (event === "failed.sale" || event === "abandoned.sale") {
    if (payment && payment.status === "en_attente") {
      // Motif exact envoyé par Chariow s'il est présent (ex. solde insuffisant) —
      // indispensable pour diagnostiquer pourquoi un numéro est refusé.
      const why = failureDetail(payload);
      console.log(`[pulse] ${event} paiement #${payment.id} (vente ${saleRef(payload) || "?"})${why ? ` — ${why}` : ""}`);
      setPaymentStatus(
        payment.id,
        "refuse",
        `Paiement en ligne ${event === "failed.sale" ? "échoué" : "abandonné"} (Chariow${why ? ` — ${why}` : ""})`,
      );
      if (payment.user_id)
        notify(payment.user_id, "Le paiement en ligne n'a pas abouti — vous pouvez réessayer avec un autre numéro ou payer par transfert.", `/payer/${payment.site_id}`);
    }
  }

  return NextResponse.json({ ok: true });
}
