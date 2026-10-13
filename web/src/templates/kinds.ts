// Catalogue des "formes" disponibles pour composer un template (admin).
// Chaque section accepte une variante de présentation.
export const SECTION_KINDS: { id: string; label: string; variants: { id: string; label: string }[] }[] = [
  {
    id: "hero",
    label: "En-tête (hero)",
    variants: [
      { id: "fullscreen", label: "Plein écran" },
      { id: "slider", label: "Diaporama" },
      { id: "editorial", label: "Éditorial" },
      { id: "bold", label: "Impact" },
      { id: "collage", label: "Collage" },
      { id: "gradient", label: "Dégradé animé" },
      { id: "card", label: "Carte" },
      { id: "minimal", label: "Minimal" },
      { id: "portrait", label: "Portrait (portfolio)" },
      { id: "split", label: "Divisé" },
    ],
  },
  { id: "marquee", label: "Bandeau défilant", variants: [{ id: "text", label: "Mots-clés" }] },
  {
    id: "about",
    label: "À propos",
    variants: [
      { id: "split", label: "Image + texte" },
      { id: "stats", label: "Chiffres" },
      { id: "quote", label: "Citation" },
    ],
  },
  {
    id: "services",
    label: "Services / produits",
    variants: [
      { id: "cards", label: "Cartes" },
      { id: "menu", label: "Menu (liste + prix)" },
      { id: "icons", label: "Icônes" },
      { id: "alternating", label: "Alterné grand format" },
      { id: "products", label: "Produits (boutique)" },
      { id: "numbered", label: "Liste numérotée" },
    ],
  },
  {
    id: "works",
    label: "Réalisations",
    variants: [
      { id: "grid", label: "Grille d'images" },
      { id: "list", label: "Liste numérotée" },
    ],
  },
  {
    id: "steps",
    label: "Étapes",
    variants: [
      { id: "cards", label: "Cartes" },
      { id: "timeline", label: "Chronologie" },
    ],
  },
  {
    id: "gallery",
    label: "Galerie",
    variants: [
      { id: "grid", label: "Grille" },
      { id: "masonry", label: "Mosaïque" },
      { id: "strip", label: "Bande défilante" },
    ],
  },
  {
    id: "testimonials",
    label: "Témoignages",
    variants: [
      { id: "cards", label: "Cartes" },
      { id: "quote", label: "Grande citation" },
    ],
  },
  { id: "faq", label: "FAQ", variants: [{ id: "accordion", label: "Accordéon" }] },
  {
    id: "cta",
    label: "Appel à l'action",
    variants: [
      { id: "band", label: "Bandeau" },
      { id: "image", label: "Image de fond" },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    variants: [
      { id: "split", label: "Formulaire + infos" },
      { id: "card", label: "Carte centrée" },
    ],
  },
];

export const NAV_LABELS = { overlay: "Superposé (sur l'image)", solid: "Barre classique", centered: "Centré", minimal: "Minimal" } as const;
export const FOOTER_LABELS = { simple: "Simple", big: "Grand pied de page" } as const;
export const RADIUS_LABELS = { none: "Anguleux", sm: "Légèrement arrondi", md: "Arrondi", lg: "Très arrondi", full: "Maximal" } as const;
export const ANIM_LABELS = { none: "Aucune animation", subtle: "Fluide", rich: "Spectaculaire" } as const;
export const MOOD_LABELS = { elegant: "Élégant", modern: "Moderne", bold: "Audacieux", minimal: "Minimal", warm: "Chaleureux", luxury: "Luxe", playful: "Ludique", corporate: "Corporate" } as const;
