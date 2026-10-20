import type { Answers } from "@/content/generate";
import type { SiteData } from "@/templates/types";

// Génération de textes par un modèle externe via une API compatible OpenAI
// (Groq, z.ai/GLM, Gemini, Ollama…). Jamais bloquante : tout échec ou sortie
// invalide laisse en place les textes déterministes déjà produits.
// Configuration : AI_BASE_URL + AI_API_KEY + AI_MODEL (+ trio *_2 en secours).

type Provider = { baseUrl: string; key: string; model: string };

function providers(): Provider[] {
  const out: Provider[] = [];
  const mk = (b?: string, k?: string, m?: string) => {
    if (b && k && m) out.push({ baseUrl: b.replace(/\/+$/, ""), key: k, model: m });
  };
  mk(process.env.AI_BASE_URL, process.env.AI_API_KEY, process.env.AI_MODEL);
  mk(process.env.AI_BASE_URL_2, process.env.AI_API_KEY_2, process.env.AI_MODEL_2);
  return out;
}

// Disjoncteur : après 2 échecs d'affilée on n'appelle plus l'API pendant
// 10 min — un fournisseur en panne ne doit jamais ralentir la création d'un site.
let fails = 0;
let openUntil = 0;
const TIMEOUT_MS = 9000;

async function chat(p: Provider, system: string, user: string): Promise<string> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${p.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: p.model,
        temperature: 0.7,
        // Marge large : les modèles à « raisonnement » (gpt-oss, qwen3)
        // consomment des tokens avant de produire le JSON — 1400 coupait net.
        max_tokens: 3000,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: ac.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return j.choices?.[0]?.message?.content?.trim() ?? "";
  } finally {
    clearTimeout(timer);
  }
}

function extractJson(raw: string): Record<string, unknown> | null {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Sécurité rédactionnelle : le modèle écrit du texte, jamais des coordonnées —
// toute chaîne contenant URL, email ou numéro de téléphone est rejetée.
const BAD = /https?:\/\/|www\.|@|\b\d{6,}\b/;
const txt = (v: unknown, max: number) => {
  const s = String(v ?? "")
    .replace(/[*_#>`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return !s || s.length > max || BAD.test(s) ? "" : s;
};

const SYSTEM = `Tu es le rédacteur de Mbila, plateforme qui crée des sites vitrines pour des petites entreprises et indépendants d'Afrique centrale (marché principalement centrafricain).

Règles :
- Français naturel, professionnel, chaleureux et concret. Aucun anglicisme, aucun jargon.
- Phrases courtes et orientées client (bénéfices, confiance, réponse rapide sur WhatsApp).
- Témoignages : prénoms et noms francophones africains crédibles (ex : Grâce Mballa, Junior Nguema), rôles locaux réalistes. JAMAIS d'avis mentionnant des chiffres d'affaires ou des résultats mesurés précis.
- INTERDIT : numéros de téléphone, emails, URL, adresses précises, prix en chiffres, contenu religieux ou politique, promesses impossibles.
- Tu réponds UNIQUEMENT par un objet JSON valide, sans markdown ni commentaire.`;

function buildPrompt(d: SiteData, a: Answers) {
  const activity = a.activity?.trim() || a.specialtyText?.trim() || d.tagline || d.category;
  const services = d.services.items.map((s) => s.name);
  return `Rédige les textes du site vitrine de cette activité.

Activité : ${activity}
Nom du site : ${d.name}
Ville : ${d.city || "(non précisée — ne pas l'inventer)"}
Prestations proposées : ${services.join(" · ") || "(à déduire de l'activité)"}
Présentation libre du client : ${a.otherAbout?.trim() || a.description?.trim() || "(aucune)"}
Ambiance souhaitée : ${a.moods.join(", ")}
Réalisations citées : ${(a.works ?? []).join(" · ") || "(aucune)"}

JSON attendu (respecte EXACTEMENT ces clés) :
{
  "tagline": "accroche courte (max 80 car.)",
  "heroTitle": "titre principal avec l'activité et la ville si connue (max 65 car.)",
  "heroSubtitle": "phrase d'accroche client (max 140 car.)",
  "aboutTitle": "titre de la section à propos (max 60 car.)",
  "aboutText": "2-3 phrases de présentation personnalisées (max 450 car.)",
  "serviceDesc": ["une description par prestation, DANS LE MÊME ORDRE que la liste fournie, max 120 car. chacune — ${services.length} entrées"],
  "testimonials": [${d.testimonials.length ? `{ "name": "…", "role": "…", "text": "…" } × ${d.testimonials.length}, texte max 160 car.` : `"vide : []"`}],
  "faq": [{ "q": "…", "a": "…" } × 4 — vraies questions de clients de ce métier, réponses max 200 car.],
  "keywords": ["6 mots-clés ou métiers liés (max 30 car. chacun)"]
}`;
}

// Recopie champ par champ : chaque sortie invalide ou absente laisse en place
// le texte déterministe déjà généré — pas de tout-ou-rien.
function applyJson(d: SiteData, j: Record<string, unknown>) {
  const put = (key: string, max: number, fn: (s: string) => void) => {
    const s = txt(j[key], max);
    if (s) fn(s);
  };
  put("tagline", 90, (s) => (d.tagline = s));
  put("heroTitle", 70, (s) => (d.hero.title = s));
  put("heroSubtitle", 150, (s) => (d.hero.subtitle = s));
  put("aboutTitle", 70, (s) => (d.about.title = s));
  put("aboutText", 500, (s) => (d.about.text = s));

  // Les noms de prestations (souvent saisis par le client) ne bougent pas —
  // seules les descriptions sont réécrites, dans le même ordre.
  if (Array.isArray(j.serviceDesc)) {
    d.services.items.forEach((it, i) => {
      const s = txt((j.serviceDesc as unknown[])[i], 140);
      if (s) it.description = s;
    });
  }

  if (d.testimonials.length && Array.isArray(j.testimonials)) {
    const list = (j.testimonials as unknown[])
      .slice(0, d.testimonials.length)
      .map((t) => {
        const o = (t ?? {}) as Record<string, unknown>;
        const name = txt(o.name, 40);
        const text = txt(o.text, 170);
        return name && text ? { name, role: txt(o.role, 40) || "Cliente satisfaite", text } : null;
      })
      .filter((t): t is NonNullable<typeof t> => !!t);
    if (list.length) d.testimonials = list;
  }

  if (Array.isArray(j.faq)) {
    const list = (j.faq as unknown[])
      .slice(0, 4)
      .map((f) => {
        const o = (f ?? {}) as Record<string, unknown>;
        const q = txt(o.q, 120);
        const ans = txt(o.a, 220);
        return q && ans ? { q, a: ans } : null;
      })
      .filter((f): f is NonNullable<typeof f> => !!f);
    if (list.length) d.faq = list;
  }

  if (Array.isArray(j.keywords)) {
    const kws = (j.keywords as unknown[]).map((k) => txt(k, 30)).filter(Boolean).slice(0, 6);
    if (kws.length >= 3) d.keywords = kws;
  }
}

// Point d'entrée : enrichit `data` en place. Silencieux en cas d'indisponibilité.
export async function enrichSiteDataWithAi(d: SiteData, a: Answers): Promise<void> {
  const ps = providers();
  if (!ps.length || Date.now() < openUntil) return;
  const prompt = buildPrompt(d, a);
  for (const p of ps) {
    try {
      const j = extractJson(await chat(p, SYSTEM, prompt));
      if (!j) throw new Error("réponse non-JSON");
      applyJson(d, j);
      fails = 0;
      return;
    } catch (e) {
      console.warn(`[ai] ${p.model} indisponible : ${(e as Error).message}`);
    }
  }
  if (++fails >= 2) {
    openUntil = Date.now() + 10 * 60_000;
    fails = 0;
  }
}
