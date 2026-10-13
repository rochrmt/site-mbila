import sharp from "sharp";

// Nettoyage des logos : si l'image a un fond uni (souvent blanc, typique des JPG
// ou des logos générés par IA), ce fond est rendu transparent par remplissage
// depuis les bords — l'intérieur du logo n'est jamais touché.
const TOL = 42; // distance couleur : bords considérés comme fond uni
const CLEAR = 18; // en dessous : pixel totalement transparent
const SOFT = 100; // jusqu'ici : pixel semi-transparent (ombres douces, halos, anti-crénelage)

export async function processLogo(input: Buffer, removeBg = true) {
  const img = sharp(input).rotate().resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true }).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const removed = removeBg ? clearBackground(data, w, h) : false;
  const out = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 1 })
    .webp({ quality: 92, alphaQuality: 100 })
    .toBuffer()
    .catch(() => sharp(data, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 92, alphaQuality: 100 }).toBuffer());
  return { buffer: out, removed };
}

function clearBackground(px: Buffer, w: number, h: number) {
  const at = (x: number, y: number) => (y * w + x) * 4;
  const border: number[] = [];
  for (let x = 0; x < w; x++) border.push(at(x, 0), at(x, h - 1));
  for (let y = 1; y < h - 1; y++) border.push(at(0, y), at(w - 1, y));

  // Déjà transparent sur les bords → rien à faire
  if (border.filter((i) => px[i + 3] < 250).length > border.length * 0.2) return false;

  // Couleur de fond = moyenne des bords ; il faut que les bords soient majoritairement unis
  let r = 0, g = 0, b = 0;
  for (const i of border) { r += px[i]; g += px[i + 1]; b += px[i + 2]; }
  r /= border.length; g /= border.length; b /= border.length;
  const dist = (i: number) => Math.hypot(px[i] - r, px[i + 1] - g, px[i + 2] - b);
  if (border.filter((i) => dist(i) < TOL).length < border.length * 0.75) return false;

  // Remplissage depuis les bords, façon « couleur vers alpha » : plus un pixel est
  // proche du fond, plus il devient transparent ; sa couleur est corrigée pour
  // qu'une ombre grise sur blanc devienne une ombre sombre translucide.
  // Fond clair : on mesure l'écart au blanc pur (un pixel plus clair que le fond
  // moyen devient transparent au lieu de laisser un halo blanc).
  const light = 0.3 * r + 0.59 * g + 0.11 * b > 200;
  const bg = light ? [255, 255, 255] : [r, g, b];
  const diff = light ? (i: number) => 255 - Math.min(px[i], px[i + 1], px[i + 2]) : dist;
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  for (const i of border) if (diff(i) < SOFT) { seen[i / 4] = 1; stack.push(i / 4); }
  while (stack.length) {
    const p = stack.pop()!;
    const i = p * 4;
    const d = diff(i);
    let a = d <= CLEAR ? 0 : Math.min(1, (d - CLEAR) / (SOFT - CLEAR));
    if (a < 0.06) a = 0;
    if (a > 0) for (let c = 0; c < 3; c++) px[i + c] = Math.max(0, Math.min(255, Math.round(bg[c] + (px[i + c] - bg[c]) / a)));
    px[i + 3] = Math.round(Math.min(px[i + 3], a * 255));
    const x = p % w, y = (p / w) | 0;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const q = ny * w + nx;
      if (seen[q]) continue;
      seen[q] = 1;
      if (diff(q * 4) < SOFT) stack.push(q);
    }
  }
  return true;
}
