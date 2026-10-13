// Mélange déterministe des variantes de sections : pour un même template, deux
// sites (slugs différents) n'ont pas la même combinaison de sections. Le hero et
// le marquee restent fixes (cohérence visuelle, nav overlay, diversité des
// propositions) — seules les sections « corps » permutent.
import type { Template } from "./types";

const POOLS: Record<string, string[]> = {
  services: ["cards", "icons", "alternating", "numbered", "menu", "products"],
  gallery: ["grid", "masonry", "strip"],
  works: ["grid", "list"],
  about: ["split", "stats", "quote"],
  steps: ["cards", "timeline"],
  testimonials: ["cards", "quote"],
  cta: ["band", "image"],
  contact: ["card", "split"],
};

function rng(seed: string) {
  let a = 2166136261;
  for (let i = 0; i < seed.length; i++) a = Math.imul(a ^ seed.charCodeAt(i), 16777619);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mixSections(sections: Template["sections"], seed: string): Template["sections"] {
  const r = rng(seed);
  let changed = false;
  const out = sections.map(([k, v]) => {
    const pool = POOLS[k];
    if (!pool || pool.length < 2 || r() < 0.45) return [k, v] as [string, string];
    const nv = pool[Math.floor(r() * pool.length)];
    if (nv !== v) changed = true;
    return [k, nv] as [string, string];
  });
  return changed ? (out as Template["sections"]) : sections;
}
