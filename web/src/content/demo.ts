import { categoryById } from "./categories";
import { generateSiteData, type Answers } from "./generate";

export const DEMO_NAMES: Record<string, [string, string]> = {
  restaurant: ["Le Baobab Gourmand", "Abidjan"],
  bakery: ["Maison Dorée", "Dakar"],
  cafe: ["Café Kora", "Montréal"],
  salon: ["Studio Éclat", "Douala"],
  barber: ["King's Cut", "Kinshasa"],
  spa: ["Oasis Spa", "Marrakech"],
  fitness: ["Iron Pulse Gym", "Lomé"],
  sport: ["AS Étoile Académie", "Bangui"],
  education: ["Institut Horizon", "Yaoundé"],
  shop: ["La Belle Boutique", "Cotonou"],
  sales: ["TrendyShop", "Libreville"],
  fashion: ["Atelier Nyota", "Bamako"],
  jewelry: ["Maison Aurum", "Genève"],
  agriculture: ["Ferme Terra Verde", "Bouaké"],
  legal: ["Cabinet Mensah & Associés", "Accra"],
  consulting: ["Stratégia Conseil", "Casablanca"],
  tech: ["Nexa Digital", "Kigali"],
  medical: ["Clinique Espérance", "Brazzaville"],
  realestate: ["Prestige Immobilier", "Abidjan"],
  hotel: ["Hôtel Les Palmiers", "Saly"],
  construction: ["Bâtir Plus", "Ouagadougou"],
  auto: ["Garage Turbo", "Niamey"],
  transport: ["Rapide Express", "Conakry"],
  cleaning: ["Net & Clair", "Québec"],
  photography: ["Lumière Studio", "Paris"],
  events: ["Élégance Events", "Dakar"],
  music: ["Kora Records", "Bamako"],
  portfolio: ["Studio Kara Design", "Paris"],
};

export function demoData(category: string) {
  const [name, city] = DEMO_NAMES[category] ?? ["Mon Entreprise", "Montréal"];
  const a: Answers = {
    category,
    name,
    city,
    moods: [],
    color: "auto",
    anim: "rich",
    images: "stock",
    cta: categoryById(category).cta,
    phone: "+1 514 000 0000",
    whatsapp: "15140000000",
    email: "contact@exemple.com",
    currency: "FCFA",
  };
  return generateSiteData(a);
}
