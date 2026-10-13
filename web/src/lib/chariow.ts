import crypto from "node:crypto";

export type ChariowProduct = { id: string; price: number };

// Mapping offre → produit Chariow. Clé = "<plan>:<mois>" ou "<plan>:<mois>:<prixMensuel>".
// Le prix mensuel différencie les catégories Essentiel (3000/5500/7500/8500) — sinon le
// client paierait un produit au prix d'une autre catégorie que la sienne.
// Configuré via CHARIOW_PRODUCTS (JSON) dans .env, ex. :
//   {"essentiel:1:5500":{"id":"prd_7p3kh2gj","price":5500},"premium:1":{"id":"prd_…","price":11500}}
// Le prix enregistré chez nous = celui du produit Chariow (c'est ce que le client paie vraiment).
export function chariowProducts(): Record<string, ChariowProduct> {
  try {
    const parsed = JSON.parse(process.env.CHARIOW_PRODUCTS ?? "{}") as Record<string, ChariowProduct>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([k, v]) => /^(essentiel|premium):[0-9]+(:[0-9]+)?$/.test(k) && v?.id && v.price > 0),
    );
  } catch {
    return {};
  }
}

// Recherche la clé la plus précise : "essentiel:1:7500" → "essentiel:1" → "essentiel".
export function chariowProductFor(plan: string, months: number, monthly?: number) {
  const all = chariowProducts();
  if (monthly) {
    const exact = all[`${plan}:${months}:${monthly}`];
    if (exact) return exact;
  }
  return all[`${plan}:${months}`] ?? all[plan] ?? null;
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
