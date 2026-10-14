import type { Section, Template } from "./types";

type T = Omit<Template, "sections" | "altPalettes" | "footer"> & {
  sections: string;
  alt?: string[];
  footer?: Template["footer"];
};

// "hero:split about:stats ..." → [["hero","split"],["about","stats"]]
const parse = (s: string): Section[] =>
  s.split(/\s+/).map((x) => x.split(":") as Section);

const t = (x: T): Template => ({
  ...x,
  footer: x.footer ?? "simple",
  altPalettes: x.alt ?? [],
  sections: parse(x.sections),
});

export const TEMPLATES: Template[] = [
  // ── Restauration ─────────────────────────────────────────────
  t({ id: "saveur", name: "Saveur", description: "Plein écran gourmand, menu élégant avec prix", categories: ["restaurant", "cafe", "bakery", "events"], moods: ["elegant", "warm"], anim: "subtle", palette: "espresso", alt: ["ivory", "noir-gold", "sand"], fonts: "classic", radius: "sm", nav: "overlay", footer: "big",
    sections: "hero:fullscreen about:split services:menu gallery:masonry testimonials:quote cta:image contact:split" }),
  t({ id: "bistrot", name: "Bistrot", description: "Chaleureux et convivial, esprit brasserie", categories: ["restaurant", "cafe", "bakery"], moods: ["warm", "playful"], anim: "subtle", palette: "ivory", alt: ["sand", "citrus", "espresso"], fonts: "soft-serif", radius: "lg", nav: "solid",
    sections: "hero:split marquee:text services:menu about:stats gallery:grid testimonials:cards contact:split" }),
  t({ id: "gastronomie", name: "Gastronomie", description: "Luxe noir et or, expérience haut de gamme", categories: ["restaurant", "hotel", "events"], moods: ["luxury", "elegant"], anim: "rich", palette: "noir-gold", alt: ["espresso", "crimson"], fonts: "luxe", radius: "none", nav: "centered", footer: "big",
    sections: "hero:slider about:quote services:menu gallery:strip testimonials:quote cta:band contact:card" }),
  t({ id: "fournil", name: "Fournil", description: "Artisanal et authentique, idéal boulangerie", categories: ["bakery", "cafe", "agriculture", "shop"], moods: ["warm", "minimal"], anim: "subtle", palette: "sand", alt: ["ivory", "blush", "sage"], fonts: "editorial", radius: "md", nav: "solid",
    sections: "hero:collage about:split services:products steps:cards gallery:grid testimonials:cards contact:split" }),
  t({ id: "street", name: "Street Food", description: "Coloré et énergique, commande rapide", categories: ["restaurant", "cafe", "shop", "sales"], moods: ["playful", "bold"], anim: "rich", palette: "citrus", alt: ["sunny", "coral", "volt"], fonts: "friendly", radius: "lg", nav: "solid",
    sections: "hero:bold marquee:text services:products about:stats testimonials:cards cta:band contact:card" }),
  t({ id: "barista", name: "Barista", description: "Ambiance café cosy, tons chauds", categories: ["cafe", "bakery", "restaurant"], moods: ["warm", "modern"], anim: "rich", palette: "espresso", alt: ["sand", "ivory"], fonts: "geo", radius: "lg", nav: "overlay",
    sections: "hero:card services:menu about:split gallery:masonry testimonials:cards contact:split" }),

  // ── Beauté & bien-être ───────────────────────────────────────
  t({ id: "eclat", name: "Éclat", description: "Doux et raffiné, pensé pour la beauté", categories: ["salon", "spa", "fashion", "jewelry"], moods: ["elegant", "warm"], anim: "subtle", palette: "blush", alt: ["lavender", "ivory", "snow"], fonts: "luxe", radius: "full", nav: "centered",
    sections: "hero:collage about:split services:cards steps:timeline gallery:masonry testimonials:quote faq:accordion contact:split" }),
  t({ id: "zen", name: "Zen", description: "Épuré et apaisant, respiration visuelle", categories: ["spa", "medical", "fitness", "salon"], moods: ["minimal", "elegant"], anim: "subtle", palette: "sage", alt: ["sand", "snow", "forest"], fonts: "soft-serif", radius: "lg", nav: "minimal",
    sections: "hero:minimal about:quote services:alternating gallery:grid testimonials:cards faq:accordion contact:card" }),
  t({ id: "velours", name: "Velours", description: "Sombre et sensuel, beauté premium", categories: ["salon", "spa", "barber", "jewelry"], moods: ["luxury", "bold"], anim: "rich", palette: "plum", alt: ["noir-gold", "crimson"], fonts: "classic", radius: "md", nav: "overlay", footer: "big",
    sections: "hero:fullscreen marquee:text services:cards about:stats gallery:strip testimonials:quote contact:split" }),
  t({ id: "blade", name: "Blade", description: "Style barbershop, contrasté et masculin", categories: ["barber", "fitness", "auto", "music"], moods: ["bold", "modern"], anim: "rich", palette: "crimson", alt: ["volt", "noir-gold", "snow"], fonts: "impact", radius: "none", nav: "overlay",
    sections: "hero:bold marquee:text services:menu about:split gallery:grid testimonials:cards cta:band contact:card" }),
  t({ id: "glow", name: "Glow", description: "Frais et pétillant, lumineux", categories: ["salon", "shop", "sales", "fashion"], moods: ["playful", "modern"], anim: "rich", palette: "lavender", alt: ["blush", "coral", "mint"], fonts: "friendly", radius: "full", nav: "solid",
    sections: "hero:gradient services:products about:split testimonials:cards gallery:strip faq:accordion contact:split" }),

  // ── Sport & fitness ──────────────────────────────────────────
  t({ id: "arena", name: "Arena", description: "Impact maximum, énergie sportive", categories: ["sport", "fitness", "events", "education"], moods: ["bold", "modern"], anim: "rich", palette: "volt", alt: ["crimson", "midnight", "sunny"], fonts: "impact", radius: "none", nav: "overlay", footer: "big",
    sections: "hero:bold marquee:text about:stats services:numbered gallery:strip testimonials:cards cta:image contact:card" }),
  t({ id: "pulse", name: "Pulse", description: "Coaching dynamique, programme clair", categories: ["fitness", "sport", "spa"], moods: ["bold", "playful"], anim: "rich", palette: "coral", alt: ["volt", "citrus", "midnight"], fonts: "geo", radius: "lg", nav: "solid",
    sections: "hero:split marquee:text services:cards steps:cards about:stats testimonials:cards faq:accordion contact:split" }),
  t({ id: "club", name: "Club", description: "Club sportif, équipes et inscriptions", categories: ["sport", "education", "events"], moods: ["corporate", "bold"], anim: "subtle", palette: "sky", alt: ["midnight", "mint", "volt"], fonts: "corporate", radius: "md", nav: "solid", footer: "big",
    sections: "hero:fullscreen about:stats services:icons steps:timeline gallery:masonry testimonials:cards faq:accordion contact:split" }),
  t({ id: "stride", name: "Stride", description: "Minimal et athlétique, performance", categories: ["sport", "fitness", "fashion"], moods: ["minimal", "modern"], anim: "rich", palette: "snow", alt: ["volt", "midnight"], fonts: "modern", radius: "none", nav: "minimal",
    sections: "hero:editorial services:numbered about:split gallery:grid testimonials:quote cta:band contact:card" }),

  // ── Éducation ────────────────────────────────────────────────
  t({ id: "academie", name: "Académie", description: "Institutionnel et rassurant, formations", categories: ["education", "consulting", "medical"], moods: ["corporate", "elegant"], anim: "subtle", palette: "sky", alt: ["sage", "snow", "midnight"], fonts: "classic", radius: "md", nav: "solid", footer: "big",
    sections: "hero:split about:stats services:cards steps:timeline testimonials:cards faq:accordion cta:band contact:split" }),
  t({ id: "campus", name: "Campus", description: "Vivant et coloré, école et jeunesse", categories: ["education", "events", "sport"], moods: ["playful", "warm"], anim: "rich", palette: "sunny", alt: ["citrus", "mint", "lavender"], fonts: "friendly", radius: "full", nav: "solid",
    sections: "hero:collage marquee:text services:icons about:stats steps:cards gallery:masonry testimonials:cards faq:accordion contact:split" }),
  t({ id: "savoir", name: "Savoir", description: "Formation en ligne, moderne et tech", categories: ["education", "tech", "consulting"], moods: ["modern", "corporate"], anim: "rich", palette: "midnight", alt: ["lavender", "sky", "plum"], fonts: "modern", radius: "lg", nav: "solid",
    sections: "hero:gradient about:stats services:numbered steps:cards testimonials:cards faq:accordion cta:band contact:card" }),
  t({ id: "mentor", name: "Mentor", description: "Formateur indépendant, personnel et chaleureux", categories: ["education", "consulting", "fitness"], moods: ["warm", "elegant"], anim: "subtle", palette: "ivory", alt: ["sage", "sand", "blush"], fonts: "editorial", radius: "lg", nav: "minimal",
    sections: "hero:card about:quote services:alternating steps:timeline testimonials:quote faq:accordion contact:split" }),

  // ── Commerce & vente ─────────────────────────────────────────
  t({ id: "vitrine", name: "Vitrine", description: "Catalogue produits, commande WhatsApp", categories: ["shop", "sales", "fashion", "bakery", "agriculture"], moods: ["modern", "minimal"], anim: "subtle", palette: "snow", alt: ["mint", "sand", "midnight"], fonts: "geo", radius: "md", nav: "solid",
    sections: "hero:split services:products about:stats steps:cards testimonials:cards faq:accordion contact:card" }),
  t({ id: "bazar", name: "Bazar", description: "Coloré et vendeur, promos en avant", categories: ["shop", "sales", "fashion"], moods: ["playful", "bold"], anim: "rich", palette: "coral", alt: ["citrus", "sunny", "lavender"], fonts: "friendly", radius: "lg", nav: "solid",
    sections: "hero:bold marquee:text services:products testimonials:cards about:split cta:band faq:accordion contact:split" }),
  t({ id: "boutique", name: "Boutique", description: "Boutique chic, mise en scène produits", categories: ["shop", "fashion", "jewelry", "sales"], moods: ["elegant", "luxury"], anim: "rich", palette: "sand", alt: ["noir-gold", "blush", "snow"], fonts: "luxe", radius: "none", nav: "centered", footer: "big",
    sections: "hero:editorial services:products gallery:strip about:split testimonials:quote contact:split" }),
  t({ id: "marche", name: "Marché", description: "Frais et naturel, produits locaux", categories: ["agriculture", "shop", "sales", "bakery"], moods: ["warm", "playful"], anim: "subtle", palette: "mint", alt: ["sage", "citrus", "forest"], fonts: "friendly", radius: "lg", nav: "solid",
    sections: "hero:collage services:products about:stats steps:cards gallery:grid testimonials:cards contact:split" }),
  t({ id: "express", name: "Express", description: "Vente rapide, conversion avant tout", categories: ["sales", "shop", "transport", "cleaning"], moods: ["bold", "modern"], anim: "rich", palette: "midnight", alt: ["volt", "coral", "sky"], fonts: "modern", radius: "md", nav: "solid",
    sections: "hero:gradient marquee:text services:products steps:cards testimonials:cards faq:accordion cta:band contact:card" }),
  t({ id: "atelier-mode", name: "Atelier Mode", description: "Éditorial mode, grand visuel", categories: ["fashion", "photography", "jewelry"], moods: ["elegant", "minimal"], anim: "rich", palette: "snow", alt: ["blush", "noir-gold", "sand"], fonts: "editorial", radius: "none", nav: "minimal",
    sections: "hero:editorial gallery:masonry services:products about:split testimonials:quote contact:card" }),
  t({ id: "joyau", name: "Joyau", description: "Précieux et lumineux, bijouterie", categories: ["jewelry", "fashion", "shop"], moods: ["luxury", "elegant"], anim: "rich", palette: "noir-gold", alt: ["plum", "sand"], fonts: "luxe", radius: "none", nav: "centered", footer: "big",
    sections: "hero:slider services:products about:quote gallery:strip testimonials:quote contact:split" }),

  // ── Services pros ────────────────────────────────────────────
  t({ id: "cabinet", name: "Cabinet", description: "Sobre et crédible, professions libérales", categories: ["legal", "consulting", "medical", "realestate"], moods: ["corporate", "elegant", "minimal"], anim: "subtle", palette: "snow", alt: ["sky", "sand", "noir-gold"], fonts: "classic", radius: "sm", nav: "solid", footer: "big",
    sections: "hero:split about:stats services:numbered steps:timeline testimonials:quote faq:accordion contact:split" }),
  t({ id: "prestige", name: "Prestige", description: "Autorité et excellence, sombre raffiné", categories: ["legal", "consulting", "realestate", "auto"], moods: ["luxury", "corporate"], anim: "subtle", palette: "noir-gold", alt: ["midnight", "espresso"], fonts: "luxe", radius: "none", nav: "overlay", footer: "big",
    sections: "hero:fullscreen about:quote services:alternating about:stats testimonials:quote cta:band contact:card" }),
  t({ id: "strategie", name: "Stratégie", description: "Conseil moderne, chiffres et méthode", categories: ["consulting", "tech", "legal", "education"], moods: ["corporate", "modern"], anim: "rich", palette: "sky", alt: ["midnight", "lavender", "snow"], fonts: "corporate", radius: "lg", nav: "solid",
    sections: "hero:card marquee:text about:stats services:icons steps:cards testimonials:cards faq:accordion cta:band contact:split" }),
  t({ id: "clinique", name: "Clinique", description: "Propre et rassurant, santé", categories: ["medical", "spa", "cleaning"], moods: ["minimal", "corporate"], anim: "subtle", palette: "mint", alt: ["sky", "sage", "snow"], fonts: "geo", radius: "lg", nav: "solid",
    sections: "hero:split services:icons about:stats steps:timeline testimonials:cards faq:accordion contact:split" }),
  t({ id: "nexus", name: "Nexus", description: "Tech & digital, dégradés animés", categories: ["tech", "consulting", "music", "education"], moods: ["modern", "bold"], anim: "rich", palette: "midnight", alt: ["plum", "volt", "lavender"], fonts: "avant", radius: "lg", nav: "solid", footer: "big",
    sections: "hero:gradient marquee:text services:icons about:stats steps:cards testimonials:cards faq:accordion cta:band contact:card" }),
  t({ id: "pixel", name: "Pixel", description: "Agence créative, audacieux et graphique", categories: ["tech", "photography", "music", "events"], moods: ["bold", "playful"], anim: "rich", palette: "sunny", alt: ["coral", "volt", "lavender"], fonts: "avant", radius: "none", nav: "minimal",
    sections: "hero:bold marquee:text services:numbered gallery:masonry about:stats testimonials:quote contact:card" }),

  // ── Immobilier & hôtellerie ──────────────────────────────────
  t({ id: "residence", name: "Résidence", description: "Immobilier haut de gamme, grands visuels", categories: ["realestate", "hotel", "construction"], moods: ["luxury", "elegant"], anim: "rich", palette: "sand", alt: ["noir-gold", "snow", "forest"], fonts: "luxe", radius: "sm", nav: "overlay", footer: "big",
    sections: "hero:slider about:stats services:products gallery:masonry testimonials:quote cta:image contact:split" }),
  t({ id: "horizon", name: "Horizon", description: "Hôtel & séjour, évasion totale", categories: ["hotel", "events", "restaurant", "spa"], moods: ["luxury", "warm"], anim: "rich", palette: "forest", alt: ["noir-gold", "sand", "ivory"], fonts: "soft-serif", radius: "md", nav: "overlay", footer: "big",
    sections: "hero:fullscreen about:split services:alternating gallery:strip testimonials:cards faq:accordion cta:image contact:card" }),
  t({ id: "habitat", name: "Habitat", description: "Agence immobilière moderne", categories: ["realestate", "construction", "cleaning"], moods: ["modern", "corporate"], anim: "subtle", palette: "snow", alt: ["sky", "sage", "midnight"], fonts: "geo", radius: "md", nav: "solid",
    sections: "hero:card services:products about:stats steps:cards testimonials:cards faq:accordion contact:split" }),

  // ── Artisans, BTP, auto, transport ───────────────────────────
  t({ id: "batisseur", name: "Bâtisseur", description: "Solide et fiable, artisans & BTP", categories: ["construction", "cleaning", "auto", "transport"], moods: ["corporate", "bold"], anim: "subtle", palette: "sunny", alt: ["citrus", "sky", "crimson"], fonts: "corporate", radius: "sm", nav: "solid", footer: "big",
    sections: "hero:fullscreen about:stats services:icons steps:timeline gallery:grid testimonials:cards cta:band contact:split" }),
  t({ id: "garage", name: "Moteur", description: "Mécanique & auto, contrasté", categories: ["auto", "transport", "construction"], moods: ["bold", "modern"], anim: "rich", palette: "crimson", alt: ["volt", "midnight", "sunny"], fonts: "impact", radius: "sm", nav: "overlay",
    sections: "hero:bold marquee:text services:numbered about:stats gallery:strip testimonials:cards contact:card" }),
  t({ id: "logistik", name: "Logistik", description: "Transport & livraison, efficace", categories: ["transport", "sales", "cleaning", "auto"], moods: ["corporate", "modern"], anim: "subtle", palette: "sky", alt: ["midnight", "citrus", "mint"], fonts: "modern", radius: "md", nav: "solid",
    sections: "hero:split marquee:text services:icons steps:cards about:stats testimonials:cards faq:accordion contact:split" }),
  t({ id: "net", name: "Impeccable", description: "Services à domicile, frais et net", categories: ["cleaning", "medical", "spa"], moods: ["minimal", "playful"], anim: "subtle", palette: "mint", alt: ["sky", "lavender", "snow"], fonts: "friendly", radius: "full", nav: "solid",
    sections: "hero:card services:cards steps:timeline about:stats testimonials:cards faq:accordion contact:split" }),

  // ── Créatifs & événementiel ──────────────────────────────────
  t({ id: "objectif", name: "Objectif", description: "Portfolio photo, images en vedette", categories: ["photography", "events", "fashion", "music"], moods: ["minimal", "elegant"], anim: "rich", palette: "noir-gold", alt: ["snow", "midnight"], fonts: "editorial", radius: "none", nav: "minimal",
    sections: "hero:fullscreen gallery:masonry about:split services:cards testimonials:quote contact:card" }),
  t({ id: "fete", name: "Fête", description: "Événementiel festif et élégant", categories: ["events", "restaurant", "music", "hotel"], moods: ["playful", "luxury"], anim: "rich", palette: "plum", alt: ["blush", "noir-gold", "coral"], fonts: "soft-serif", radius: "lg", nav: "overlay", footer: "big",
    sections: "hero:slider marquee:text services:cards gallery:masonry steps:timeline testimonials:quote faq:accordion contact:split" }),
  t({ id: "studio", name: "Studio", description: "Musique & scène, nocturne", categories: ["music", "events", "photography", "tech"], moods: ["bold", "modern"], anim: "rich", palette: "midnight", alt: ["plum", "volt", "crimson"], fonts: "avant", radius: "md", nav: "overlay",
    sections: "hero:gradient marquee:text services:cards gallery:strip about:stats testimonials:cards contact:card" }),
  t({ id: "terroir", name: "Terroir", description: "Nature & agriculture, organique", categories: ["agriculture", "bakery", "shop", "spa"], moods: ["warm", "minimal"], anim: "subtle", palette: "forest", alt: ["sage", "sand", "mint"], fonts: "editorial", radius: "lg", nav: "overlay",
    sections: "hero:fullscreen about:split services:products steps:cards gallery:grid testimonials:cards contact:split" }),

  // ── Portfolio & indépendants ───────────────────────────────
  t({ id: "folio", name: "Folio", description: "Portfolio sombre et raffiné, travaux en vedette", categories: ["portfolio", "photography", "music"], moods: ["minimal", "elegant", "bold"], anim: "rich", palette: "midnight", alt: ["noir-gold", "plum", "snow"], fonts: "editorial", radius: "sm", nav: "minimal", footer: "big",
    sections: "hero:portrait marquee:text works:grid services:cards about:quote testimonials:quote contact:split" }),
  t({ id: "prisme", name: "Prisme", description: "Portfolio lumineux, esprit galerie d'art", categories: ["portfolio", "photography", "fashion", "jewelry"], moods: ["minimal", "elegant", "playful"], anim: "rich", palette: "ivory", alt: ["blush", "snow", "sand"], fonts: "soft-serif", radius: "lg", nav: "centered", footer: "big",
    sections: "hero:collage works:grid services:products about:split testimonials:cards contact:card" }),
  t({ id: "artiste", name: "Artiste", description: "Univers créatif, couleurs et mouvement", categories: ["portfolio", "music", "events", "photography"], moods: ["playful", "bold"], anim: "rich", palette: "plum", alt: ["coral", "volt", "midnight"], fonts: "avant", radius: "md", nav: "minimal",
    sections: "hero:slider works:list gallery:masonry about:quote services:cards cta:band contact:card" }),
  t({ id: "solo", name: "Solo", description: "Indépendant crédible, clair et direct", categories: ["portfolio", "consulting", "tech", "legal", "education"], moods: ["corporate", "minimal", "modern"], anim: "subtle", palette: "snow", alt: ["sky", "mint", "midnight"], fonts: "corporate", radius: "md", nav: "solid",
    sections: "hero:portrait about:stats services:icons works:list testimonials:cards faq:accordion contact:split" }),
  t({ id: "select", name: "Select", description: "Portfolio minimaliste, liste de projets", categories: ["portfolio", "photography", "tech"], moods: ["minimal", "elegant"], anim: "rich", palette: "snow", alt: ["midnight", "noir-gold", "sand"], fonts: "editorial", radius: "sm", nav: "minimal", footer: "big",
    sections: "hero:minimal works:list services:numbered about:quote testimonials:quote contact:card" }),
  t({ id: "directeur", name: "Directeur", description: "Portfolio audacieux, titre géant et portrait mis en avant", categories: ["portfolio", "photography", "fashion", "music"], moods: ["bold", "elegant", "modern"], anim: "rich", palette: "ember", alt: ["crimson", "plum", "midnight"], fonts: "impact", radius: "md", nav: "minimal", footer: "big",
    sections: "hero:showcase marquee:text services:numbered works:grid about:stats testimonials:quote contact:split" }),
  t({ id: "plume", name: "Plume", description: "Portfolio éditorial clair, sérif élégant et projets sélectionnés", categories: ["portfolio", "photography", "jewelry", "consulting"], moods: ["minimal", "elegant", "corporate"], anim: "subtle", palette: "ivory", alt: ["snow", "sand", "blush"], fonts: "editorial", radius: "md", nav: "solid", footer: "big",
    sections: "hero:showcase services:icons works:grid about:stats testimonials:cards cta:band contact:card" }),

  // ── Renforts métiers ───────────────────────────────────────
  t({ id: "traiteur", name: "Banquet", description: "Traiteur & réceptions, appétissant", categories: ["events", "restaurant", "bakery"], moods: ["warm", "elegant", "luxury"], anim: "subtle", palette: "sand", alt: ["espresso", "blush", "ivory"], fonts: "classic", radius: "md", nav: "solid", footer: "big",
    sections: "hero:editorial services:menu gallery:grid about:split testimonials:cards cta:image contact:split" }),
  t({ id: "vroom", name: "Vroom", description: "Auto & performance, impact direct", categories: ["auto", "transport", "construction"], moods: ["bold"], anim: "rich", palette: "volt", alt: ["crimson", "espresso", "midnight"], fonts: "impact", radius: "sm", nav: "solid",
    sections: "hero:bold marquee:text services:numbered about:stats gallery:strip testimonials:cards cta:band contact:card" }),
  t({ id: "mile", name: "Mile", description: "Logistique fiable, structuré", categories: ["transport", "auto", "construction", "sales"], moods: ["corporate", "modern"], anim: "subtle", palette: "sky", alt: ["midnight", "citrus", "snow"], fonts: "corporate", radius: "sm", nav: "solid", footer: "big",
    sections: "hero:split marquee:text services:numbered steps:timeline about:stats testimonials:cards faq:accordion contact:split" }),
  t({ id: "tutor", name: "Tutor", description: "Formateur indépendant, accessible", categories: ["education", "consulting", "portfolio"], moods: ["warm", "modern", "corporate"], anim: "subtle", palette: "sand", alt: ["sky", "sage", "mint"], fonts: "friendly", radius: "lg", nav: "solid",
    sections: "hero:card services:cards steps:cards about:stats testimonials:cards faq:accordion contact:card" }),

  // ── Polyvalents ──────────────────────────────────────────────
  t({ id: "essentiel", name: "Essentiel", description: "Universel, clair et efficace", categories: ["*"], moods: ["minimal", "modern"], anim: "subtle", palette: "snow", alt: ["sky", "sage", "sand"], fonts: "geo", radius: "md", nav: "solid",
    sections: "hero:split services:cards about:stats testimonials:cards faq:accordion contact:split" }),
  t({ id: "signature", name: "Signature", description: "Universel premium, grands visuels", categories: ["*"], moods: ["elegant", "luxury"], anim: "rich", palette: "espresso", alt: ["noir-gold", "forest", "ivory"], fonts: "classic", radius: "sm", nav: "overlay", footer: "big",
    sections: "hero:fullscreen about:split services:alternating gallery:masonry testimonials:quote cta:image contact:card" }),
  t({ id: "dynamo", name: "Dynamo", description: "Universel moderne et animé", categories: ["*"], moods: ["modern", "bold", "playful"], anim: "rich", palette: "lavender", alt: ["midnight", "coral", "mint"], fonts: "modern", radius: "lg", nav: "solid",
    sections: "hero:gradient marquee:text services:icons about:stats steps:cards testimonials:cards faq:accordion contact:split" }),

  // ── Vitrines tech & moderne ──────────────────────────────────
  t({ id: "nova", name: "Nova", description: "Startup spectaculaire, dégradés et mouvement", categories: ["tech", "consulting", "sales", "events"], moods: ["modern", "bold"], anim: "rich", palette: "midnight", alt: ["plum", "volt", "sky"], fonts: "modern", radius: "lg", nav: "overlay", footer: "big",
    sections: "hero:gradient marquee:text services:icons about:stats steps:cards testimonials:cards faq:accordion cta:band contact:card" }),
  t({ id: "agence", name: "Agence", description: "Studio digital audacieux, grands visuels", categories: ["tech", "portfolio", "events", "consulting"], moods: ["bold", "playful", "modern"], anim: "rich", palette: "plum", alt: ["volt", "midnight", "coral"], fonts: "avant", radius: "md", nav: "minimal",
    sections: "hero:slider marquee:text services:alternating gallery:strip about:stats testimonials:quote cta:image contact:split" }),
  t({ id: "verre", name: "Verre", description: "Clair et structuré, esprit SaaS moderne", categories: ["tech", "consulting", "education", "medical"], moods: ["modern", "corporate", "minimal"], anim: "subtle", palette: "sky", alt: ["mint", "snow", "lavender"], fonts: "geo", radius: "lg", nav: "solid",
    sections: "hero:card marquee:text services:numbered steps:timeline about:stats testimonials:cards faq:accordion contact:split" }),
  t({ id: "notaire", name: "Notaire", description: "Institutionnel sobre, confiance immédiate", categories: ["legal", "medical", "consulting", "realestate"], moods: ["corporate", "elegant", "minimal"], anim: "none", palette: "snow", alt: ["sky", "sage", "sand"], fonts: "classic", radius: "sm", nav: "solid", footer: "big",
    sections: "hero:minimal about:stats services:cards testimonials:cards faq:accordion contact:split" }),
  t({ id: "palace", name: "Palace", description: "Hôtellerie de prestige, immersion totale", categories: ["hotel", "realestate", "events", "restaurant"], moods: ["luxury", "elegant"], anim: "rich", palette: "noir-gold", alt: ["espresso", "forest", "midnight"], fonts: "luxe", radius: "none", nav: "overlay", footer: "big",
    sections: "hero:fullscreen marquee:text about:quote services:alternating gallery:masonry testimonials:quote cta:image contact:card" }),
  t({ id: "chantier", name: "Chantier", description: "BTP solide et concret, preuves par l'image", categories: ["construction", "auto", "transport", "cleaning"], moods: ["corporate", "bold"], anim: "subtle", palette: "sand", alt: ["espresso", "sky", "sunny"], fonts: "corporate", radius: "sm", nav: "solid", footer: "big",
    sections: "hero:fullscreen about:stats services:alternating steps:timeline gallery:grid testimonials:cards faq:accordion contact:split" }),
  t({ id: "kiosque", name: "Kiosque", description: "Boutique vivante, produits en avant", categories: ["shop", "sales", "bakery", "fashion", "jewelry"], moods: ["playful", "modern", "warm"], anim: "rich", palette: "coral", alt: ["sunny", "citrus", "lavender"], fonts: "friendly", radius: "full", nav: "solid",
    sections: "hero:collage marquee:text services:products about:split gallery:strip testimonials:cards faq:accordion cta:band contact:split" }),

  // ── Signatures grandes marques (composition figée, jamais remélangée) ──
  t({ id: "lotus", name: "Lotus", description: "Palace contemporain : plein écran cinéma, barre de réservation, carrousel de destinations", categories: ["hotel", "spa", "restaurant", "events", "realestate"], moods: ["luxury", "elegant", "minimal"], anim: "subtle", palette: "pearl", alt: ["noir-gold", "sand", "forest"], fonts: "luxe", radius: "none", nav: "luxe", footer: "center", fixed: true,
    sections: "hero:cinema about:intro services:rail cta:editorial gallery:strip testimonials:quote faq:accordion contact:split" }),
  t({ id: "lumen", name: "Lumen", description: "Vitrine produit épurée : titres géants, tuiles grand format, annonce sur fond noir", categories: ["tech", "shop", "sales", "photography", "music", "auto"], moods: ["minimal", "modern", "elegant"], anim: "rich", palette: "studio", alt: ["graphite", "snow"], fonts: "sf", radius: "lg", nav: "glass", footer: "fine", fixed: true,
    sections: "hero:product services:tiles about:keynote gallery:rail testimonials:cards faq:accordion contact:card" }),
  t({ id: "sentier", name: "Sentier", description: "Boutique naturelle : photo lifestyle, rayon produits défilant, valeurs illustrées", categories: ["shop", "fashion", "sales", "sport", "agriculture", "fitness"], moods: ["warm", "minimal", "modern"], anim: "subtle", palette: "oat", alt: ["sand", "sage", "snow"], fonts: "geo", radius: "sm", nav: "shop", footer: "dark", fixed: true,
    sections: "hero:lifestyle services:shelf gallery:tiles steps:values about:split testimonials:cards faq:accordion contact:split" }),
  t({ id: "rosee", name: "Rosée", description: "Beauté pop et douce : aplat pastel, pastilles de catégories, manifeste final", categories: ["salon", "spa", "fashion", "jewelry", "shop", "sales"], moods: ["playful", "minimal", "elegant", "warm"], anim: "subtle", palette: "petal", alt: ["blush", "lavender", "snow"], fonts: "grotesk", radius: "md", nav: "shop", footer: "big", fixed: true,
    sections: "hero:beauty marquee:chips services:shelf gallery:tiles about:manifesto testimonials:cards faq:accordion contact:card" }),
  t({ id: "athenee", name: "Athénée", description: "Grande institution : barre couleur, encart sur photo, actualités à la une", categories: ["education", "legal", "medical", "consulting", "sport"], moods: ["corporate", "elegant", "minimal"], anim: "subtle", palette: "oxford", alt: ["sky", "snow", "sage"], fonts: "scholar", radius: "none", nav: "academic", footer: "dark", fixed: true,
    sections: "hero:panel services:news about:stats steps:band testimonials:quote faq:accordion contact:split" }),
];

export const templateById = (id: string) => TEMPLATES.find((x) => x.id === id) ?? TEMPLATES[0];
