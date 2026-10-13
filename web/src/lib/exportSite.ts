import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";
import { appUrl, DATA_DIR, siteUrl } from "./config";
import { getLeads, type SiteRow } from "./db";

// Export = le HTML réel du site (rendu par le serveur Next lui-même) +
// le CSS compilé + les polices woff2 + les images + un runtime JS sans
// dépendance qui reproduit les interactions. 100 % autonome, déployable
// sur n'importe quel hébergeur statique.

const IMG_RE = /\/u\/\d+\/[a-f0-9]{8,}\.webp|\/s\/[a-f0-9]{8,}\.webp|\/stock\/[\w./-]+\.(?:jpg|jpeg|png|webp)/g;

async function fetchHtml(site: SiteRow, cookie: string | null): Promise<string> {
  // 1. Site publié → URL publique (le rendu exact que voient les visiteurs)
  const pub = await fetch(siteUrl(site.slug), { cache: "no-store" }).catch(() => null);
  if (pub?.ok) return pub.text();
  // 2. Brouillon/non publié → aperçu privé avec la session de l'admin
  if (cookie) {
    const prev = await fetch(appUrl(`/preview/${site.id}`), { headers: { cookie }, cache: "no-store" });
    if (prev.ok) return prev.text();
  }
  throw new Error("Impossible de rendre le site pour l'export");
}

async function imageFile(src: string): Promise<Buffer | null> {
  const p = src.startsWith("/u/")
    ? path.join(DATA_DIR, "uploads", src.slice(3))
    : src.startsWith("/s/")
      ? path.join(DATA_DIR, "uploads", "stock", src.slice(3))
      : path.join("public", src);
  return fs.readFile(p).catch(() => null);
}

const staticFile = (urlPath: string) =>
  fs.readFile(path.join(".next", "static", urlPath.replace(/^\/_next\/static\//, "")));

// runtime.js vanilla : reproduit AnimRuntime / HeroSlider / Rotator /
// ContactForm sans aucune dépendance.
function runtimeJs() {
  return `// runtime Mbila — aucune dépendance
var R = matchMedia("(prefers-reduced-motion: reduce)").matches;
var root = document.querySelector(".site") || document.body;
var LV = root.getAttribute("data-anim") || "subtle", FX = root.getAttribute("data-fx") || "";

function countUp(el){if(LV!=="rich"||R||el.dataset.done)return;el.dataset.done="1";
var raw=el.dataset.count||"",m=raw.match(/[\\d\\s.,]+/);if(!m||raw.includes("/"))return;
var t=parseFloat(m[0].replace(/[\\s,]/g,function(c){return c===","?".":""}));if(!isFinite(t))return;
var sp=raw.split(m[0]),t0=performance.now();
(function step(n){var p=Math.min(1,(n-t0)/1400),v=t*(1-Math.pow(1-p,3));
el.textContent=sp[0]+(Number.isInteger(t)?Math.round(v).toLocaleString("fr-FR"):v.toFixed(1))+sp[1];
if(p<1)requestAnimationFrame(step);else el.textContent=raw;})(t0);}

var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;
e.target.classList.add("is-in");
e.target.querySelectorAll("[data-count]").forEach(countUp);
if(e.target.dataset.count)countUp(e.target);io.unobserve(e.target);});},{threshold:.15});
root.querySelectorAll(".rv").forEach(function(el){io.observe(el);});
requestAnimationFrame(function(){root.classList.add("ready");});

var nav=root.querySelector("[data-nav]");
var par=LV==="rich"&&!R?root.querySelectorAll("[data-parallax]"):[];
addEventListener("scroll",function(){var y=scrollY;if(nav)nav.toggleAttribute("data-scrolled",y>40);
par.forEach(function(el){var r=el.parentElement.getBoundingClientRect();
el.style.transform="translate3d(0,"+r.top*-0.15+"px,0)";});},{passive:true});

if(FX.indexOf("spotlight")>=0&&matchMedia("(pointer: fine)").matches)
root.addEventListener("pointermove",function(e){var r=root.getBoundingClientRect();
root.style.setProperty("--mx",e.clientX-r.left+"px");root.style.setProperty("--my",e.clientY-r.top+"px");});

if(FX.indexOf("tilt")>=0&&matchMedia("(pointer: fine)").matches&&!R)
root.querySelectorAll("main .group").forEach(function(el){
el.addEventListener("pointermove",function(e){var r=el.getBoundingClientRect();
var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
el.style.transform="perspective(900px) rotateY("+(x*8)+"deg) rotateX("+(-y*8)+"deg)";});
el.addEventListener("pointerleave",function(){el.style.transform="";});});

// Carrousel du hero (images absolues dans le même conteneur)
root.querySelectorAll("div").forEach(function(d){
var imgs=[].slice.call(d.children).filter(function(c){return c.tagName==="IMG";});
if(imgs.length<2)return;
var dots=[].slice.call(d.querySelectorAll("button")),i=0;
function show(k){i=k;imgs.forEach(function(im,j){im.classList.toggle("opacity-100",j===k);
im.classList.toggle("opacity-0",j!==k);im.classList.toggle("kb",j===k&&!R);});
dots.forEach(function(b,j){b.className="h-1.5 rounded-full bg-white transition-all "+(j===k?"w-8":"w-1.5 opacity-50");});}
dots.forEach(function(b,j){b.addEventListener("click",function(){show(j);});});
if(!R)setInterval(function(){show((i+1)%imgs.length);},5500);});

// Texte changeant du hero
var rot=window.MBILA&&MBILA.rot,w=root.querySelector(".rot-wrap");
if(rot&&w&&rot.words&&rot.words.length>1&&!R){var words=rot.words,k=0;
if(rot.mode==="typing"){var t=words[0].length,dir=-1,wait=14;
setInterval(function(){if(wait>0)return wait--;t+=dir;
if(dir<0&&t<=0){dir=1;k++;}else if(dir>0&&t>=words[k%words.length].length){dir=-1;wait=22;}
w.childNodes[0].nodeValue=words[k%words.length].slice(0,t);},70);}
else setInterval(function(){k++;var s=w.querySelector(".rot-word");
if(s){s.textContent=words[k%words.length];var c=s.className;s.className="";void s.offsetWidth;s.className=c;}},2600);}

// Pré-sélection de service + formulaire → WhatsApp
document.addEventListener("click",function(e){
var el=e.target.closest&&e.target.closest("[data-service]");if(!el)return;
var sel=document.querySelector('select[name="service"]');if(!sel)return;
if(![].slice.call(sel.options).some(function(o){return o.value===el.dataset.service;}))
sel.add(new Option(el.dataset.service,el.dataset.service));
sel.value=el.dataset.service;
if(!el.closest("a")){var c=document.getElementById("contact");if(c)c.scrollIntoView({behavior:"smooth"});}});

var form=document.querySelector("form");
if(form&&window.MBILA&&MBILA.wa)form.addEventListener("submit",function(e){e.preventDefault();
var b={};new FormData(form).forEach(function(v,k2){b[k2]=v;});
var msg=["Bonjour "+MBILA.name+",",b.service?"Je suis intéressé(e) par : "+b.service:"",
"Nom : "+b.name,b.phone?"Téléphone : "+b.phone:"",b.email?"Email : "+b.email:"","",b.message]
.filter(function(l){return l!=="";}).join("\\n");
var url="https://wa.me/"+MBILA.wa+"?text="+encodeURIComponent(msg);
window.open(url,"_blank","noopener");
form.outerHTML='<div class="grid h-full place-items-center rounded-s p-10 text-center"><div><div class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-s-primary text-2xl text-s-onprimary">✓</div><p class="mt-6 font-s-head text-2xl">Message envoyé !</p><a href="'+url+'" target="_blank" rel="noopener" class="mt-5 inline-flex items-center gap-2 rounded-btn bg-[#25D366] px-5 py-3 text-sm font-semibold text-white">Continuer sur WhatsApp ↗</a></div></div>';});
`;
}

export async function exportSite(site: SiteRow, cookie: string | null): Promise<Uint8Array> {
  const d = site.data;
  const files: Record<string, Uint8Array> = {};
  let html = await fetchHtml(site, cookie);

  // ── Polices (woff2 référencés par next/font dans le HTML/CSS) ──
  const media = new Set([...html.matchAll(/\/_next\/static\/media\/([\w.-]+\.(?:woff2?|ttf))/g)].map((m) => m[1]));
  for (const name of media) {
    const buf = await staticFile(`media/${name}`).catch(() => null);
    if (buf) files[`fonts/${name}`] = new Uint8Array(buf);
  }
  html = html.split("/_next/static/media/").join("fonts/");

  // ── CSS compilé : fichiers référencés par le HTML (prod) ou tout le
  // dossier de chunks en dev (Turbopack injecte le CSS via JS, sans <link>) ──
  const cssPaths = new Set([...html.matchAll(/\/_next\/static\/[^"'()\s]+\.css/g)].map((m) => m[0]));
  let css = "";
  for (const p of cssPaths) css += (await staticFile(p).catch(() => null))?.toString() ?? "";
  // En dev Turbopack injecte le CSS via JS (aucun <link>) → on lit les chunks.
  // Chemin littéral : borne le traçage de fichiers au dossier concerné.
  if (!css.trim() && process.env.NODE_ENV !== "production") {
    const chunks = path.join(".next", "dev", "static", "chunks");
    const names = await fs.readdir(chunks).catch(() => [] as string[]);
    for (const n of names) if (n.endsWith(".css")) css += await fs.readFile(path.join(chunks, n), "utf8");
  }
  css = css.split("/_next/static/media/").join("fonts/");
  files["site.css"] = strToU8(css);

  // ── Images du site → images/ ──
  let dataJson = JSON.stringify(
    { slug: site.slug, templateId: site.template_id, paletteId: site.palette_id, anim: site.anim, published: site.published, data: d },
    null, 2,
  );
  for (const src of new Set([...(html + dataJson).matchAll(IMG_RE)].map((m) => m[0]))) {
    const buf = await imageFile(src);
    if (!buf) continue;
    const flat = src.startsWith("/u/")
      ? "u-" + path.posix.basename(src)
      : src.startsWith("/s/")
        ? "s-" + path.posix.basename(src)
        : "stock-" + src.split("/").slice(-2).join("-"); // garde la catégorie : stock-education-10.jpg
    files[`images/${flat}`] = new Uint8Array(buf);
    html = html.split(src).join(`images/${flat}`);
    dataJson = dataJson.split(src).join(`images/${flat}`);
  }

  // ── Nettoyage du HTML : plus besoin du runtime Next ──
  html = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, "")
    .replace(/<link\b[^>]*rel="preload"[^>]*>/g, "");
  html = html
    .replace("</head>", `<link rel="stylesheet" href="site.css" /></head>`)
    .replace(
      "</body>",
      `<script>window.MBILA=${JSON.stringify({
        name: d.name,
        wa: (d.contact.whatsapp || d.contact.phone || "").replace(/\D/g, ""),
        rot: d.style?.heroText ?? null,
      })};</script><script src="runtime.js"></script></body>`,
    );
  files["index.html"] = strToU8(html);
  files["runtime.js"] = strToU8(runtimeJs());
  files["data.json"] = strToU8(dataJson);
  files["leads.csv"] = strToU8(
    "id,date,nom,telephone,email,message\n" +
      getLeads(site.id)
        .map((l) => [l.id, l.created_at, l.name, l.phone, l.email, l.message].map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n"),
  );
  files["README.txt"] = strToU8(`Site exporté depuis Mbila — ${d.name} (${site.slug})
========================================================

Contenu
-------
index.html   Le site complet, autonome (aucun serveur requis)
site.css     Tous les styles compilés
runtime.js   Animations et interactions (carrousel, effets, formulaire WhatsApp)
fonts/       Polices embarquées (woff2) — fonctionne hors ligne
images/      Toutes les images du site
data.json    Données sources (sauvegarde / réimport dans Mbila)
leads.csv    Messages reçus via le formulaire

Déploiement
-----------
Le site est 100% statique : servez ce dossier avec n'importe quel hébergeur.
- nginx : copier dans /var/www/<site> et pointer le server_name vers le dossier
- Docker : FROM nginx:alpine + COPY . /usr/share/nginx/html
- Apache/Hostinger : déposer le contenu dans public_html

Remarque : le formulaire ouvre WhatsApp du client (messages directs).
Les leads ne sont plus enregistrés en base hors plateforme Mbila.
`);

  return zipSync(files, { level: 6 });
}
