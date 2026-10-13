// Captures d'écran des templates (Edge/Chrome installé localement).
// node scripts/shot.mjs <url> <out.jpg> [largeur] [full|viewport] [hauteur]
import { chromium } from "playwright-core";

const [url, out, w = "1440", mode = "full", h = "900"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: process.env.BROWSER || "msedge" });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle" });
await page.addStyleTag({
  content: `.rv{opacity:1!important;transform:none!important;filter:none!important}
  *,*::before{animation-play-state:paused!important;transition:none!important}
  .hero-title .word>span{animation:none!important}`,
});
await page.evaluate(() => document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager")));
await page.waitForLoadState("networkidle");
await page.waitForTimeout(800);
const buf = await page.screenshot({ path: mode === "tiles" ? undefined : out, fullPage: mode !== "viewport", type: "jpeg", quality: 70 });
await browser.close();
if (mode === "tiles") {
  const sharp = (await import("sharp")).default;
  const { height } = await sharp(buf).metadata();
  const tile = Math.round(+w * 1.1);
  for (let i = 0, y = 0; y < height; i++, y += tile)
    await sharp(buf).extract({ left: 0, top: y, width: +w, height: Math.min(tile, height - y) }).toFile(out.replace(/\.jpg$/, `-${i + 1}.jpg`));
  console.log(Math.ceil(height / tile), "tuiles");
}
