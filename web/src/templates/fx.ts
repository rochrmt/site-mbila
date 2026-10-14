// Effets visuels optionnels choisis par l'utilisateur (assistant + éditeur).
// Ils s'ajoutent au design : c'est ce qui distingue un site basique d'un site premium.
export type Fx = "aurora" | "grid" | "particles" | "spotlight" | "grain" | "carousel" | "tilt" | "reveal" | "bw" | "shine" | "glow";

export const FX_LIST: { id: Fx; label: string; hint: string; group: "Fonds animés" | "Images" | "Textes & boutons" }[] = [
  { id: "aurora", label: "Aurore", hint: "Halos de couleur qui ondulent", group: "Fonds animés" },
  { id: "grid", label: "Grille tech", hint: "Quadrillage lumineux en mouvement", group: "Fonds animés" },
  { id: "particles", label: "Particules", hint: "Points flottants délicats", group: "Fonds animés" },
  { id: "spotlight", label: "Projecteur", hint: "Lumière qui suit la souris", group: "Fonds animés" },
  { id: "grain", label: "Grain ciné", hint: "Texture argentique premium", group: "Fonds animés" },
  { id: "carousel", label: "Carrousel", hint: "Les images d'accueil défilent", group: "Images" },
  { id: "tilt", label: "Effet 3D", hint: "Les cartes s'inclinent au survol", group: "Images" },
  { id: "reveal", label: "Dévoilement", hint: "Images révélées au défilement", group: "Images" },
  { id: "bw", label: "Noir & blanc", hint: "Couleur au survol, esprit galerie", group: "Images" },
  { id: "shine", label: "Titre brillant", hint: "Reflet lumineux sur le titre", group: "Textes & boutons" },
  { id: "glow", label: "Boutons néon", hint: "Halo pulsé sur les boutons", group: "Textes & boutons" },
];

// Texte changeant sous le titre du hero (mots-clés qui défilent)
export type HeroTextMode = "typing" | "slide" | "flip" | "blur";
export const HERO_TEXT_MODES: { id: HeroTextMode; label: string; hint: string }[] = [
  { id: "typing", label: "Machine à écrire", hint: "Les mots s'écrivent et s'effacent" },
  { id: "slide", label: "Glissement", hint: "Les mots montent un à un" },
  { id: "flip", label: "Rotation 3D", hint: "Les mots basculent en 3D" },
  { id: "blur", label: "Mise au point", hint: "Du flou au net, cinématique" },
];
export const HERO_TEXT_IDS = new Set<string>(HERO_TEXT_MODES.map((m) => m.id));

export const FX_PRESETS: { id: string; label: string; hint: string; fx: Fx[]; text?: HeroTextMode }[] = [
  { id: "basic", label: "Basique", hint: "Sobre et efficace", fx: [] },
  { id: "premium", label: "Premium", hint: "Raffiné, détails soignés", fx: ["grain", "reveal", "tilt", "shine"], text: "blur" },
  { id: "bold", label: "Audacieux", hint: "Tout en mouvement", fx: ["aurora", "particles", "spotlight", "carousel", "tilt", "glow"], text: "typing" },
];

export const FX_IDS = new Set<string>(FX_LIST.map((f) => f.id));

export const FONT_LABELS: Record<string, string> = {
  classic: "Classique", luxe: "Luxe", modern: "Moderne", geo: "Géométrique", friendly: "Amical",
  editorial: "Éditorial", impact: "Impact", "soft-serif": "Serif doux", avant: "Avant-garde", corporate: "Corporate",
  sf: "Épuré tech", grotesk: "Grotesque doux", scholar: "Académique",
};
