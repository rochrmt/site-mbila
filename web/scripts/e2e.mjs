// Test de bout en bout du parcours utilisateur (serveur de dev lancé sur :3000).
// node scripts/e2e.mjs [dossierCaptures]
import { chromium } from "playwright-core";

const out = process.argv[2] || ".";
const base = "http://localhost:3000";
const email = `test${Date.now()}@exemple.com`;
const slug = `ecole-${Date.now().toString(36)}`;
const browser = await chromium.launch({ channel: process.env.BROWSER || "msedge" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const shot = (n) => page.screenshot({ path: `${out}/e2e-${n}.jpg`, type: "jpeg", quality: 60 });
const cont = () => page.getByRole("button", { name: /Continuer|Générer/ }).click();
page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));

await page.goto(base);
await page.getByPlaceholder("votre-entreprise").fill(slug);
await page.getByRole("button", { name: "Créer mon site gratuitement" }).click();
await page.waitForURL("**/inscription");
await page.getByPlaceholder("Votre nom").fill("Awa Test");
await page.getByPlaceholder("Email").fill(email);
await page.getByPlaceholder(/Mot de passe/).fill("motdepasse123");
await page.getByRole("button", { name: /Continuer/ }).click();
await page.waitForURL("**/creer");
await shot("1-cat");

await page.getByPlaceholder(/Rechercher/).fill("ecole");
await page.getByRole("button", { name: /École & centre de formation/ }).click();
await page.getByPlaceholder(/Nom de votre activité/).fill("École Lumière");
await page.getByPlaceholder(/Ville/).fill("Bangui");
await cont();
await cont(); // description
await page.getByRole("button", { name: /Corporate/ }).click();
await page.getByRole("button", { name: /Élégant/ }).click();
await shot("2-mood");
await cont();
await page.getByRole("button", { name: /Clair & lumineux/ }).click();
await cont();
await page.getByRole("button", { name: /Éditorial/ }).click(); // typographie
await shot("3a-fonts");
await cont();
await page.getByRole("button", { name: /Spectaculaire/ }).click();
await shot("3-anim");
await cont();
await page.getByRole("button", { name: /^Audacieux/ }).click(); // effets
await page.waitForTimeout(800);
await shot("3b-fx");
await cont();
await cont(); // images stock
await page.getByPlaceholder(/Téléphone/).fill("+236 72 00 00 00");
await cont();
await page.waitForSelector("text=Adresse disponible");
await shot("4-slug");
await cont();
await page.waitForTimeout(2500);
await shot("5-gen");
await page.waitForURL("**/creer/choix/**", { timeout: 30000 });
await page.waitForTimeout(4000);
await shot("6-choix");
await page.getByRole("button", { name: "Choisir et publier" }).first().click();
await page.waitForURL("**/dashboard/sites/**");
await page.waitForTimeout(3000);
await shot("7-editor");

const pub = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const res = await pub.goto(`http://${slug}.localhost:3000/`);
console.log("site public:", res.status(), await pub.title());
await pub.waitForTimeout(1500);
await pub.screenshot({ path: `${out}/e2e-8-public.jpg`, type: "jpeg", quality: 60 });
const lead = await pub.evaluate((s) =>
  fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: s, name: "Parent", message: "Inscription ?" }) }).then((r) => r.status),
slug);
console.log("lead:", lead);
const missing = await pub.goto("http://nexistepas.localhost:3000/");
console.log("site inexistant:", missing.status());
await browser.close();
