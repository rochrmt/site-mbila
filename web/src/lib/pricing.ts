// Tarifs Mbila — partagé client/serveur.
// Une seule offre : Essentiel. Le domaine personnalisé se gère hors
// abonnement (demande dans l'éditeur → réglé directement avec l'équipe).
export const PLANS = [
  { id: "essentiel", name: "Essentiel", monthly: 6500, desc: "Votre site en ligne sur son adresse .mbila.ca", feats: ["Hébergement + HTTPS inclus", "Votre éditeur, messages, images", "Domaine perso possible (sur demande)"] },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];

// Tarif Essentiel par type d'activité (choisi au wizard) — le client ne voit
// que SON prix. Les sites pro/B2B et l'hôtellerie coûtent plus cher.
const PRICE_BY_CATEGORY: Record<string, number> = {
  portfolio: 3000,
  hotel: 8500,          // hôtels, auberges, résidences
  legal: 7500,          // cabinets, avocats, notaires
  medical: 7500,        // cliniques, pharmacies
  consulting: 7500,     // conseil, entreprises, prestations
  tech: 7500,           // agences, startup
  construction: 7500,   // BTP
  realestate: 7500,     // immobilier
  transport: 7500,      // logistique, flottes
};
const DEFAULT_PRICE = 5500; // boutique, resto, école, salon, sport…
export const PRICED_CATEGORIES = Object.keys(PRICE_BY_CATEGORY);

export function monthlyPrice(plan: string, category?: string | null): number {
  const p = PLANS.find((x) => x.id === plan);
  if (!p) return 0;
  if (p.id === "essentiel") return (category && PRICE_BY_CATEGORY[category]) || DEFAULT_PRICE;
  return p.monthly;
}

// Durées : plus c'est long, plus c'est réduit
export const DURATIONS = [
  { months: 1, label: "1 mois", coef: 1, badge: "" },
  { months: 6, label: "6 mois", coef: 0.9, badge: "-10 %" },
  { months: 12, label: "1 an", coef: 10 / 12, badge: "2 mois offerts" },
] as const;

export const MONTHS_OK = DURATIONS.map((d) => d.months);

export function priceFor(plan: string, months: number, category?: string | null): number | null {
  const d = DURATIONS.find((x) => x.months === months);
  const monthly = monthlyPrice(plan, category);
  if (!d || !monthly) return null;
  // Arrondi au centaine pour des montants propres en FCFA
  return Math.round((monthly * d.months * d.coef) / 100) * 100;
}

// Total à partir d'un prix mensuel déjà résolu (permet les tarifs admin)
export function totalFor(monthly: number, months: number): number {
  const d = DURATIONS.find((x) => x.months === months);
  if (!d) return 0;
  return Math.round((monthly * months * d.coef) / 100) * 100;
}

export function planLabel(plan: string, months: number): string {
  const p = PLANS.find((x) => x.id === plan);
  const d = DURATIONS.find((x) => x.months === months);
  return `${p?.name ?? plan} · ${d?.label ?? months + " mois"}`;
}
