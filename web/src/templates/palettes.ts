import type { FontPair, Palette } from "./types";

const p = (
  id: string,
  name: string,
  dark: boolean,
  bg: string,
  fg: string,
  muted: string,
  card: string,
  primary: string,
  primaryFg: string,
  accent: string,
  border: string,
  colorful = false,
): Palette => ({ id, name, dark, bg, fg, muted, card, primary, primaryFg, accent, border, colorful });

export const PALETTES: Palette[] = [
  // Clairs
  p("ivory", "Ivoire & terracotta", false, "#faf6f0", "#2b211a", "#7a6a5c", "#ffffff", "#c2562f", "#ffffff", "#e9c46a", "#eadfd2"),
  p("snow", "Blanc pur", false, "#ffffff", "#0b0b0c", "#6b6b73", "#f5f5f6", "#0b0b0c", "#ffffff", "#9a9aa3", "#e7e7ea"),
  p("sage", "Sauge", false, "#f4f6f1", "#1f2a22", "#627064", "#ffffff", "#4f7a5a", "#ffffff", "#c9a96e", "#dfe5da"),
  p("blush", "Poudré", false, "#fdf5f3", "#3a2328", "#8c6b70", "#ffffff", "#c9627a", "#ffffff", "#e8b4a0", "#f3dfdb"),
  p("sky", "Bleu confiance", false, "#f6f9fc", "#0f1c2e", "#5b6b80", "#ffffff", "#1d5fd1", "#ffffff", "#14b8a6", "#dde6f0"),
  p("sand", "Sable", false, "#f5efe6", "#2e2419", "#80705e", "#fffaf3", "#8a5a2b", "#ffffff", "#b08d57", "#e6dccd"),
  p("mint", "Menthe", false, "#f2fbf8", "#0e2a24", "#557a70", "#ffffff", "#0f9d7a", "#ffffff", "#f59e0b", "#d5eee6"),
  p("lavender", "Lavande", false, "#f7f5ff", "#221c3a", "#6d6690", "#ffffff", "#6d4de6", "#ffffff", "#f472b6", "#e4defa"),
  p("citrus", "Agrumes", false, "#fffbf0", "#1d1a14", "#6f6552", "#ffffff", "#f97316", "#ffffff", "#16a34a", "#f3e6c8", true),
  p("coral", "Corail vif", false, "#fff7f4", "#1f1416", "#7a5f62", "#ffffff", "#ef4a5f", "#ffffff", "#2563eb", "#f6dcd6", true),
  p("sunny", "Soleil", false, "#fffdf2", "#1a1a1a", "#666150", "#ffffff", "#facc15", "#1a1a1a", "#0ea5e9", "#f1ecc9", true),
  // Sombres
  p("noir-gold", "Noir & or", true, "#0c0b09", "#f4efe6", "#a79f90", "#16140f", "#c8a45c", "#0c0b09", "#e8d5a8", "#2a261d"),
  p("midnight", "Minuit", true, "#070b16", "#e8edf7", "#8b97ad", "#0f1626", "#38bdf8", "#04111c", "#a78bfa", "#1c2638"),
  p("volt", "Charbon & volt", true, "#0b0c0d", "#f2f3f0", "#9a9d97", "#151718", "#c6f432", "#0b0c0d", "#ff5a36", "#25282a", true),
  p("espresso", "Espresso", true, "#17110d", "#f3e9df", "#b09c8a", "#221a14", "#d4915a", "#17110d", "#e8c39e", "#34281f"),
  p("forest", "Forêt", true, "#0d1a14", "#e9f1ec", "#98ada1", "#14251d", "#7fc49a", "#0d1a14", "#e3c77d", "#223a2e"),
  p("plum", "Prune", true, "#150d1a", "#f4ecf7", "#ad9bb6", "#201427", "#e07bd0", "#150d1a", "#f7b267", "#33213c", true),
  p("crimson", "Carmin", true, "#0f0a0a", "#f6eeee", "#b19b9b", "#1a1111", "#e23b3b", "#ffffff", "#f5c26b", "#2e1f1f"),
  p("ember", "Braise", true, "#100b08", "#f8ede4", "#b59d8c", "#1a1210", "#ff4d21", "#ffffff", "#ffb347", "#332016", true),
];

// Couleur de texte lisible pour les palettes dont le primaire est trop clair sur fond clair
const INK: Record<string, string> = { sunny: "#a16207", citrus: "#c2410c", mint: "#0b7a5f", coral: "#d63a50" };
for (const x of PALETTES) if (INK[x.id]) x.ink = INK[x.id];

export const paletteById = (id: string) => PALETTES.find((x) => x.id === id) ?? PALETTES[0];

export const FONT_PAIRS: FontPair[] = [
  { id: "classic", head: "var(--f-playfair)", body: "var(--f-inter)" },
  { id: "luxe", head: "var(--f-cormorant)", body: "var(--f-montserrat)" },
  { id: "modern", head: "var(--f-space)", body: "var(--f-inter)" },
  { id: "geo", head: "var(--f-outfit)", body: "var(--f-outfit)" },
  { id: "friendly", head: "var(--f-poppins)", body: "var(--f-poppins)" },
  { id: "editorial", head: "var(--f-fraunces)", body: "var(--f-manrope)" },
  { id: "impact", head: "var(--f-bebas)", body: "var(--f-manrope)", headUpper: true },
  { id: "soft-serif", head: "var(--f-dmserif)", body: "var(--f-manrope)" },
  { id: "avant", head: "var(--f-syne)", body: "var(--f-inter)" },
  { id: "corporate", head: "var(--f-montserrat)", body: "var(--f-inter)" },
];

export const fontPairById = (id: string) => FONT_PAIRS.find((f) => f.id === id) ?? FONT_PAIRS[0];
