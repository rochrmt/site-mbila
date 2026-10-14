export type CtaType = "whatsapp" | "call" | "email" | "booking" | "quote";
export type AnimLevel = "none" | "subtle" | "rich";
export type Mood = "elegant" | "modern" | "bold" | "minimal" | "warm" | "luxury" | "playful" | "corporate";
export type ColorPref = "light" | "dark" | "colorful" | "auto";

export type Img = { src: string; alt?: string };

export type ServiceItem = { name: string; description: string; price?: string; image?: string };
export type WorkItem = { name: string; tag: string; year?: string; image?: string };

export type EducationItem = { title: string; school: string; year: string };

export type SiteData = {
  name: string;
  tagline: string;
  category: string;
  city: string;
  logo?: string;
  logoSize?: number; // hauteur du logo dans la navigation, en px (défaut 40)
  hero: { title: string; subtitle: string; image: string; images: string[] };
  about: { title: string; text: string; image: string; stats: { value: string; label: string }[] };
  services: { title: string; subtitle: string; items: ServiceItem[] };
  works?: { title: string; items: WorkItem[] };
  steps: { title: string; items: { title: string; text: string }[] };
  gallery: { title: string; images: string[] };
  testimonials: { name: string; role: string; text: string }[];
  faq: { q: string; a: string }[];
  keywords: string[];
  cta: { type: CtaType; label: string };
  contact: { phone: string; whatsapp: string; email: string; address: string; hours: string };
  socials: { facebook: string; instagram: string; tiktok: string; linkedin: string };
  education?: EducationItem[]; // portfolio : formation / diplômes (optionnel)
  store?: { url: string; label?: string }; // lien vers une boutique externe (Chariow, Maketou…)
  // Personnalisation visuelle : police imposée (sinon celle du design) et effets
  style?: {
    fonts?: string;
    fx?: import("./fx").Fx[];
    heroText?: { mode: import("./fx").HeroTextMode; words: string[] };
  };
};

export type SectionKey =
  | "hero"
  | "marquee"
  | "about"
  | "services"
  | "works"
  | "steps"
  | "gallery"
  | "testimonials"
  | "faq"
  | "cta"
  | "contact";

export type Variant = string;
export type Section = [SectionKey, Variant];

export type Palette = {
  id: string;
  name: string;
  dark: boolean;
  colorful?: boolean;
  bg: string;
  fg: string;
  muted: string;
  card: string;
  primary: string;
  primaryFg: string;
  accent: string;
  border: string;
  ink?: string;
};

export type FontPair = { id: string; head: string; body: string; headUpper?: boolean; headTight?: boolean };

export type Template = {
  id: string;
  name: string;
  description: string;
  categories: string[];
  moods: Mood[];
  anim: AnimLevel;
  palette: string;
  altPalettes: string[];
  fonts: string;
  radius: "none" | "sm" | "md" | "lg" | "full";
  nav: "overlay" | "solid" | "centered" | "minimal" | "luxe" | "glass" | "shop" | "academic";
  footer: "simple" | "big" | "center" | "fine" | "dark";
  sections: Section[];
  // Design « signature » : sections jamais remélangées (la composition fait le style)
  fixed?: boolean;
};
