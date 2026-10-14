import crypto from "node:crypto";
import { PRICED_CATEGORIES } from "./pricing";

export type ChariowProduct = { id: string; price: number };

// Mapping produit Chariow. Clé préférée = "<tier>:<mois>" où tier est la
// catégorie tarifaire : portfolio | hotel | pro | standard | premium.
// Ex. : {"hotel:6":{"id":"prd_…","price":51300}}
// Rétro-compatible : "plan:mois" et "plan:mois:prixMensuel" restent lus.
// Le prix enregistré chez nous = celui du produit Chariow (prix réel payé).
export function chariowProducts(): Record<string, ChariowProduct> {
  try {
    const parsed = JSON.parse(process.env.CHARIOW_PRODUCTS ?? "{}") as Record<string, ChariowProduct>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([k, v]) => /^[a-z0-9_-]+:[0-9]+(:[0-9]+)?$/i.test(k) && v?.id && v.price > 0),
    );
  } catch {
    return {};
  }
}

// Catégorie de site → tier tarifaire (aligné sur PRICE_BY_CATEGORY).
// portfolio et hotel ont leurs propres produits ; les catégories à prix
// renforcé (legal, medical, tech…) partagent le tier « pro ».
export function tierForCategory(category?: string | null): string {
  if (category === "hotel" || category === "portfolio") return category;
  if (category && PRICED_CATEGORIES.includes(category)) return "pro";
  return "standard";
}

// Résolution : "hotel:6" → "essentiel:6:9500" (legacy) → "essentiel:6" → "essentiel".
export function chariowProductFor(plan: string, months: number, monthly?: number, category?: string | null) {
  const all = chariowProducts();
  const tiered = all[`${tierForCategory(category)}:${months}`];
  if (tiered) return tiered;
  if (monthly) {
    const exact = all[`${plan}:${months}:${monthly}`];
    if (exact) return exact;
  }
  return all[`${plan}:${months}`] ?? all[plan] ?? null;
}

// Prix en ligne par durée pour un site — pour l'affichage du bouton « Payer en ligne ».
export function chariowPricesForSite(category: string | null | undefined, monthly: number): Record<number, ChariowProduct> {
  const out: Record<number, ChariowProduct> = {};
  for (const m of [1, 6, 12]) {
    const p = chariowProductFor("essentiel", m, monthly, category);
    if (p) out[m] = p;
  }
  return out;
}

export function chariowEnabled() {
  return !!process.env.CHARIOW_API_KEY;
}

// Prix réel du produit chez Chariow (source de vérité — le client paie CE montant).
// Retourne null si l'API ne répond pas : on retombe alors sur le price du .env.
export async function fetchProductPrice(productId: string): Promise<number | null> {
  const key = process.env.CHARIOW_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://api.chariow.com/v1/products/${productId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const data = (await res.json()) as { data?: { pricing?: { current_price?: { value?: number } } } };
    const v = data?.data?.pricing?.current_price?.value;
    return typeof v === "number" && v > 0 ? v : null;
  } catch {
    return null;
  }
}

// API checkout : crée une session de paiement et renvoie l'URL hébergée par Chariow.
export async function initiateCheckout(input: {
  productId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  redirectUrl: string;
  metadata: Record<string, string>;
  customerIp?: string;
}) {
  const key = process.env.CHARIOW_API_KEY;
  if (!key) throw new Error("Chariow non configuré (CHARIOW_API_KEY manquant)");
  const res = await fetch("https://api.chariow.com/v1/checkout", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: input.productId,
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: { number: input.phone, country_code: input.countryCode },
      redirect_url: input.redirectUrl,
      custom_metadata: input.metadata,
      customer_ip: input.customerIp,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    data?: { step?: string; message?: string; purchase?: { id?: string }; payment?: { checkout_url?: string } };
    message?: string;
  };
  if (!res.ok) throw new Error(data?.message || `Chariow HTTP ${res.status}`);
  const url = data?.data?.payment?.checkout_url;
  if (!url) throw new Error(data?.data?.message || "Chariow n'a pas renvoyé d'URL de paiement");
  return { checkoutUrl: url, saleId: String(data?.data?.purchase?.id ?? "") };
}

// Signature du Pulse : sha256=<HMAC-SHA256 du corps brut> avec le secret du dashboard.
export function verifyPulseSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.CHARIOW_PULSE_SECRET;
  if (!secret || !signature) return false;
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
