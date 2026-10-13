// Construit la banque d'images stock (CC0 : StockSnap + Rawpixel via Openverse).
// Usage : node scripts/fetch-stock.mjs [categorie...]
// Résultat : public/stock/<cat>/NN.jpg + src/lib/stock-manifest.json
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const QUERIES = {
  restaurant: ["restaurant interior", "gourmet food plate", "chef cooking"],
  bakery: ["bakery bread", "pastry cake", "croissant"],
  cafe: ["coffee shop", "latte coffee", "cafe interior"],
  salon: ["hair salon", "beauty makeup", "manicure nails"],
  barber: ["barber shop", "barber haircut", "beard"],
  spa: ["spa massage", "spa relax", "wellness candles"],
  fitness: ["gym workout", "fitness training", "yoga"],
  sport: ["football soccer", "basketball", "running athlete", "tennis", "sports team"],
  photography: ["photographer camera", "wedding photography", "portrait studio"],
  legal: ["lawyer office", "business meeting desk", "justice law books"],
  medical: ["doctor clinic", "medical stethoscope", "dentist"],
  realestate: ["modern house exterior", "living room interior", "apartment kitchen"],
  hotel: ["hotel room", "hotel lobby", "swimming pool resort"],
  education: ["classroom students", "students studying", "teacher teaching", "graduation", "children school", "online learning laptop"],
  consulting: ["business team office", "business handshake", "office laptop meeting"],
  tech: ["laptop code", "technology workspace", "startup team"],
  construction: ["construction site", "architect blueprint", "carpenter tools"],
  auto: ["car mechanic", "car repair garage", "luxury car"],
  fashion: ["fashion model", "clothing store", "tailor sewing"],
  jewelry: ["jewelry ring", "necklace jewelry", "gold watch"],
  events: ["wedding reception", "event party decoration", "catering buffet"],
  shop: ["retail store", "shopping bags", "grocery market", "boutique display", "cosmetics products"],
  sales: ["online shopping", "shopping woman", "delivery package box", "smartphone payment", "credit card shopping", "store products shelf"],
  cleaning: ["cleaning service", "clean home interior", "laundry"],
  transport: ["delivery truck", "logistics warehouse", "taxi car city"],
  music: ["recording studio", "music concert", "guitar musician"],
  agriculture: ["farm field", "fresh vegetables", "organic farming"],
  creative: ["creative workspace designer", "art studio painting", "graphic design desk", "freelancer laptop working", "drawing sketchbook artist"],
  // ── Portfolio : une banque par domaine d'expertise ──
  "folio-dev": ["programmer laptop code", "computer code screen", "developer desk monitors", "software developer working"],
  "folio-mobile": ["smartphone app", "mobile phone hand", "smartphone laptop desk", "tablet smartphone"],
  "folio-data": ["data analytics dashboard", "charts graphs laptop", "business analytics", "computer data"],
  "folio-cyber": ["server room", "network cables", "data center", "cyber security laptop", "network switch", "computer server"],
  "folio-it": ["computer repair", "computer hardware", "technician computer", "computer keyboard office"],
  "folio-uiux": ["web design laptop", "designer tablet", "wireframe sketch", "ui design screen", "smartphone app design", "designer computer"],
  "folio-design": ["graphic designer", "design studio desk", "color swatches", "creative workspace designer", "designer laptop", "creative desk"],
  "folio-photo": ["camera lens", "photographer camera", "photo studio", "dslr camera", "photographer outdoor"],
  "folio-video": ["video camera", "film production", "video editing", "filmmaker", "cinema camera"],
  "folio-art": ["painting artist", "art studio painting", "paint brushes"],
  "folio-redac": ["writing notebook", "typewriter", "writer laptop coffee"],
  "folio-arch": ["interior design", "architect blueprint", "modern interior"],
  "folio-compta": ["accounting calculator", "financial documents", "accountant office", "calculator money", "invoice paperwork"],
  "folio-finance": ["finance charts", "business report", "banking finance", "stock market"],
  "folio-rh": ["job interview", "office team meeting", "business woman office", "handshake office"],
  "folio-gestion": ["project planning", "team whiteboard", "business meeting", "warehouse logistics", "office planning calendar", "manager team office"],
  "folio-marketing": ["social media phone", "marketing team", "smartphone instagram", "laptop marketing"],
};
const BIG = new Set(["education", "shop", "sales", "sport", "fitness", "tech", "consulting", "creative"]);

const OUT = path.resolve("public/stock");
const MANIFEST = path.resolve("src/lib/stock-manifest.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BAD = /png|sticker|illustration|clipart|vector|collage|element|drawing|cigarette|poster|package design|label|psd|mockup|icon|pattern/i;

const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8").catch(() => "{}"));
const cats = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(QUERIES);

for (const cat of cats) {
  const PER_CAT = BIG.has(cat) ? 22 : cat.startsWith("folio-") ? 16 : 14;
  const seen = new Set();
  const picks = [];
  for (const q of QUERIES[cat]) {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=20&source=stocksnap,rawpixel&license=cc0`;
    const res = await fetch(url).catch(() => null);
    await sleep(3500);
    if (!res?.ok) { console.warn(cat, q, res?.status ?? "réseau"); continue; }
    // Uniquement de vraies photos : pas de stickers, illustrations, affiches…
    const results = (await res.json()).results.filter(
      (r) =>
        !BAD.test(r.title || "") &&
        (r.source === "stocksnap" || /(photo|image)$/i.test(r.title || "")),
    );
    // Mélange des requêtes : on prend les meilleurs résultats de chaque
    for (const r of results.slice(0, Math.ceil(PER_CAT / QUERIES[cat].length) + 2)) {
      if (seen.has(r.url) || picks.length >= PER_CAT) continue;
      seen.add(r.url);
      picks.push({ url: r.url, title: r.title, w: r.width, h: r.height, q });
    }
  }
  await fs.rm(path.join(OUT, cat), { recursive: true, force: true });
  await fs.mkdir(path.join(OUT, cat), { recursive: true });
  const files = [];
  for (const p of picks) {
    const file = `${String(files.length + 1).padStart(2, "0")}.jpg`;
    const img = await fetch(p.url).catch(() => null);
    if (!img?.ok) continue;
    const out = sharp(Buffer.from(await img.arrayBuffer())).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true });
    const { width, height } = await out.toFile(path.join(OUT, cat, file));
    files.push({ src: `/stock/${cat}/${file}`, alt: p.title, w: width, h: height, q: p.q });
  }
  manifest[cat] = files;
  console.log(cat, files.length);
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
}
