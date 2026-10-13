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
    if (payment && payment.status === "en_attente")
      setPaymentStatus(payment.id, "refuse", `Paiement en ligne ${event === "failed.sale" ? "échoué" : "abandonné"} (Chariow)`);
  }

  return NextResponse.json({ ok: true });
}
