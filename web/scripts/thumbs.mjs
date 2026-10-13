// Génère public/thumbs/<template>.jpg (haut de page) pour chaque template.
// Avec --mobile : public/thumbs/m/<template>.jpg (premier écran en 390px, pour la maquette téléphone de l'accueil).
// Prérequis : serveur lancé (npm run dev). Usage : node scripts/thumbs.mjs [baseUrl] [ids…] [--mobile]
import fs from "node:fs/promises";
import { chromium } from "playwright-core";
import sharp from "sharp";

const args = process.argv.slice(2);
const mobile = args.includes("--mobile");
const [base = "http://localhost:3000", ...rest] = args.filter((a) => a !== "--mobile");
const only = new Set(rest);
const src = await fs.readFile("src/templates/library.ts", "utf8");
const ids = [...src.matchAll(/t\(\{ id: "([^"]+)"/g)].map((m) => m[1]).filter((id) => !only.size || only.has(id));
const dir = mobile ? "public/thumbs/m" : "public/thumbs";
await fs.mkdir(dir, { recursive: true });

const browser = await chromium.launch({ channel: process.env.BROWSER || "msedge" });
const page = await browser.newPage(
  mobile
    ? { viewport: { width: 390, height: 693 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 1000 } },
);
for (const id of ids) {
  await page.goto(`${base}/demo/${id}`, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `.rv{opacity:1!important;transform:none!important;filter:none!important}
    *{animation-play-state:paused!important;transition:none!important}
    .hero-title .word>span{animation:none!important} nextjs-portal{display:none!important}
    .fixed.bottom-5{display:none!important}`,
  });
  await page.waitForTimeout(600);
  if (mobile) {
    const buf = await page.screenshot({ type: "png" });
    await sharp(buf).jpeg({ quality: 74, mozjpeg: true }).toFile(`${dir}/${id}.jpg`);
  } else {
    const buf = await page.screenshot({ type: "png", fullPage: true });
    const { height } = await sharp(buf).metadata();
    await sharp(buf)
      .extract({ left: 0, top: 0, width: 1440, height: Math.min(height, 2400) })
      .resize({ width: 720 })
      .jpeg({ quality: 76, mozjpeg: true })
      .toFile(`${dir}/${id}.jpg`);
  }
  console.log(id);
}
await browser.close();
