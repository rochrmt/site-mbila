"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileArchive, GitBranch, Loader2, MessageCircle, UploadCloud, X } from "lucide-react";
import { EMAIL_OK, PHONE_OK } from "@/lib/validation";

const STACKS = ["HTML / CSS / JS", "React / Vite", "Next.js", "Vue / Nuxt", "Svelte / Astro", "Node.js / Express", "PHP / Laravel", "WordPress", "Python (Django / Flask)", "Autre / je ne sais pas"];
const PROFILES = ["🎓 Étudiant·e", "💼 Travailleur·se", "🚀 Entrepreneur·se", "🧑‍💻 Indépendant·e", "✨ Autre"];
const DELAYS = ["Cette semaine (urgent)", "Ce mois-ci", "Pas pressé, je prépare"];
const MAX = 100 * 1024 * 1024;
const WA_NUMBER = "23672679175";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/20";

const size = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} Mo` : `${Math.ceil(n / 1024)} Ko`);

const stepCard = (active: boolean) =>
  `rounded-2xl border p-4 text-left transition ${active ? "border-fuchsia-400/60 bg-fuchsia-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`;

type Mode = "zip" | "repo" | "idea";
const STEPS = ["Vous êtes ?", "Votre idée", "Le projet", "Le délai", "Vos coordonnées"];

// Questionnaire interactif « Votre projet » : chaque réponse part en base
// + email admin + message WhatsApp pré-rempli que le client envoie lui-même.
export default function HostingForm({ defaults }: { defaults?: { name?: string; email?: string } }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState("");
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<Mode>("zip");
  const [repo, setRepo] = useState("");
  const [delay, setDelay] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [waLink, setWaLink] = useState("");
  const input = useRef<HTMLInputElement>(null);

  // « Envoyer » remplace « Continuer » à la même place : le relâchement du même clic
  // retomberait sur le nouveau bouton et soumettrait avant même l'affichage de l'étape.
  // Le bouton d'envoi ne s'arme donc qu'un court instant après l'arrivée.
  useEffect(() => {
    if (step !== STEPS.length - 1) return;
    const t = setTimeout(() => setArmed(true), 400);
    return () => clearTimeout(t);
  }, [step]);

  function pick(f: File | undefined) {
    setError("");
    if (!f) return;
    if (!/\.zip$/i.test(f.name)) return setError("Choisissez une archive .zip.");
    if (f.size > MAX) return setError("Le fichier dépasse 100 Mo. Utilisez plutôt un lien de dépôt.");
    setFile(f);
  }

  function next() {
    setError("");
    if (step === 0 && !profile) return setError("Choisissez ce qui vous ressemble le plus.");
    if (step === 1 && idea.trim().length < 10) return setError("Décrivez votre idée en une ou deux phrases (10 caractères min).");
    if (step === 2 && mode === "zip" && !file) return setError("Ajoutez l'archive .zip, ou choisissez une autre option.");
    if (step === 2 && mode === "repo" && !repo.trim()) return setError("Collez le lien de votre dépôt, ou choisissez une autre option.");
    if (step === 3 && !delay) return setError("Dites-nous quand vous voulez voir ça en ligne.");
    setArmed(false); // le bouton « Envoyer » se réarmera via l'effet à l'arrivée
    setStep((s) => s + 1);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < STEPS.length - 1) return; // jamais d'envoi depuis une étape intermédiaire
    setError("");
    const fd = new FormData(e.currentTarget);
    const emailV = String(fd.get("email") ?? "");
    const phoneV = String(fd.get("phone") ?? "");
    if (!EMAIL_OK(emailV)) return setError("Adresse email invalide.");
    if (phoneV && !PHONE_OK(phoneV)) return setError("Numéro de téléphone invalide (7 à 15 chiffres).");
    fd.set("profile", profile);
    fd.set("idea", idea.trim());
    fd.set("delay", delay);
    fd.delete("file");
    if (mode === "zip") { fd.set("file", file!); fd.delete("repo"); }
    else if (mode === "repo") fd.set("repo", repo.trim());
    else fd.delete("repo");

    const name = String(fd.get("name") ?? "");
    setWaLink(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
        `Bonjour Mbila 👋\nJe suis : ${profile}\nMon idée : ${idea.trim()}\nProjet : ${mode === "zip" ? `fichier zip (${file!.name})` : mode === "repo" ? `dépôt ${repo.trim()}` : "pas encore de code, juste l'idée"}\nDélai souhaité : ${delay}\nNom : ${name}`,
      )}`,
    );

    // XHR plutôt que fetch : progression réelle de l'envoi
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/hosting");
    xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress(Math.round((ev.loaded / ev.total) * 100));
    xhr.onload = () => {
      setProgress(null);
      const res = (() => { try { return JSON.parse(xhr.responseText); } catch { return {}; } })();
      if (xhr.status === 200 && res.ok) setDone(true);
      else setError(res.error || "Une erreur est survenue, réessayez.");
    };
    xhr.onerror = () => { setProgress(null); setError("Connexion interrompue, réessayez."); };
    setProgress(0);
    xhr.send(fd);
  }

  if (done)
    return (
      <div className="pop-in rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-10 text-center">
        <CheckCircle2 className="mx-auto text-emerald-300" size={48} />
        <h3 className="mt-5 font-display text-2xl font-bold">Projet bien reçu !</h3>
        <p className="mx-auto mt-3 max-w-md text-white/60">
          Suivez l&apos;avancement dans « Mes demandes » de votre espace.
          Pour une réponse immédiate, envoyez-nous le récap sur WhatsApp :
        </p>
        <a href={waLink} target="_blank" rel="noopener" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/25 transition hover:brightness-110">
          <MessageCircle size={18} /> Envoyer le récap sur WhatsApp
        </a>
        <p className="mt-4 text-xs text-white/35">Vos réponses y sont déjà rédigées, un clic suffit.</p>
      </div>
    );

  const sending = progress !== null;
  return (
    <form
      onSubmit={submit}
      // Entrée dans un champ avant l'étape contact → avance le wizard au lieu de
      // soumettre à blanc (sinon erreur « email invalide » sur un champ invisible)
      onKeyDown={(e) => {
        const el = e.target as HTMLElement;
        if (e.key === "Enter" && el.tagName === "INPUT" && step < STEPS.length - 1) {
          e.preventDefault();
          next();
        }
      }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:p-8"
    >
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {/* Progression */}
      <div className="mb-7 flex items-center gap-2">
        {STEPS.map((t, i) => (
          <div key={t} className="flex flex-1 flex-col gap-1.5">
            <div className={`h-1 rounded-full transition-all duration-500 ${i <= step ? "brand-grad" : "bg-white/10"}`} />
            <span className={`hidden text-[10px] font-medium sm:block ${i === step ? "text-white" : "text-white/30"}`}>{i + 1}. {t}</span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="pop-in">
          <h3 className="font-display text-2xl font-bold">Dites-nous qui vous êtes</h3>
          <p className="mt-1.5 text-sm text-white/50">Pour adapter la proposition et le devis.</p>
          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {PROFILES.map((p) => (
              <button key={p} type="button" onClick={() => { setProfile(p); setError(""); }} className={stepCard(profile === p)}>
                <span className="text-sm font-semibold">{p}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="pop-in">
          <h3 className="font-display text-2xl font-bold">Quelle est votre idée ?</h3>
          <p className="mt-1.5 text-sm text-white/50">Une ou deux phrases suffisent : quoi, pour qui, pourquoi.</p>
          <textarea
            name="idea_text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            autoFocus
            placeholder="Ex : un portfolio pour mes projets d'école, une appli de gestion de stock pour ma boutique…"
            className={`${field} mt-6`}
          />
        </div>
      )}

      {step === 2 && (
        <div className="pop-in">
          <h3 className="font-display text-2xl font-bold">Votre projet existe-t-il déjà en code ?</h3>
          <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
            <button type="button" onClick={() => { setMode("zip"); setError(""); }} className={stepCard(mode === "zip")}>
              <FileArchive size={18} className="mb-2 text-fuchsia-300" />
              <span className="block text-sm font-semibold">Oui, j&apos;ai un .zip</span>
              <span className="mt-0.5 block text-[11px] text-white/45">Export de votre projet</span>
            </button>
            <button type="button" onClick={() => { setMode("repo"); setError(""); }} className={stepCard(mode === "repo")}>
              <GitBranch size={18} className="mb-2 text-cyan-300" />
              <span className="block text-sm font-semibold">Oui, un dépôt Git</span>
              <span className="mt-0.5 block text-[11px] text-white/45">GitHub, GitLab…</span>
            </button>
            <button type="button" onClick={() => { setMode("idea"); setError(""); }} className={stepCard(mode === "idea")}>
              <CheckCircle2 size={18} className="mb-2 text-emerald-300" />
              <span className="block text-sm font-semibold">Pas encore de code</span>
              <span className="mt-0.5 block text-[11px] text-white/45">Juste l&apos;idée, on en parle</span>
            </button>
          </div>

          <div className="mt-5">
            {mode === "zip" && (
              file ? (
                <div className="flex items-center gap-4 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/[0.07] p-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-fuchsia-500/20 text-fuchsia-200"><FileArchive size={22} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{file.name}</p>
                    <p className="text-xs text-white/50">{size(file.size)}</p>
                  </div>
                  {!sending && (
                    <button type="button" onClick={() => setFile(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Retirer">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => input.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
                  className={`flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-9 text-center transition ${drag ? "border-fuchsia-400 bg-fuchsia-500/10" : "border-white/15 hover:border-white/30 hover:bg-white/[0.03]"}`}
                >
                  <UploadCloud size={32} className="text-fuchsia-300" />
                  <span className="font-semibold">Glissez l&apos;archive .zip ici</span>
                  <span className="text-xs text-white/45">ou cliquez pour parcourir · 100 Mo max · sans node_modules ni .env</span>
                </button>
              )
            )}
            {mode === "repo" && (
              <div>
                <input value={repo} onChange={(e) => setRepo(e.target.value)} type="url" placeholder="https://github.com/vous/mon-projet" className={field} />
                <p className="mt-2 text-xs text-white/40">GitHub, GitLab, Bitbucket ou Codeberg. Privé ? On vous dira qui inviter.</p>
              </div>
            )}
            {mode === "idea" && (
              <p className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] p-4 text-sm leading-relaxed text-emerald-100/80">
                Parfait, on vous aide à la concrétiser. Passez au délai, puis laissez vos coordonnées : on discute ensemble de la meilleure façon de la mettre en ligne.
              </p>
            )}
          </div>
          <input ref={input} type="file" accept=".zip,application/zip" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        </div>
      )}

      {step === 3 && (
        <div className="pop-in">
          <h3 className="font-display text-2xl font-bold">En ligne dans combien de temps ?</h3>
          <p className="mt-1.5 text-sm text-white/50">On calibre l&apos;urgence avec vous.</p>
          <div className="mt-6 grid gap-2.5">
            {DELAYS.map((d) => (
              <button key={d} type="button" onClick={() => { setDelay(d); setError(""); }} className={stepCard(delay === d)}>
                <span className="text-sm font-semibold">{d}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="pop-in">
          <h3 className="font-display text-2xl font-bold">Dernière étape : vos coordonnées</h3>
          <p className="mt-1.5 text-sm text-white/50">Pour vous répondre et lier la demande à votre espace.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input name="name" required defaultValue={defaults?.name} placeholder="Votre nom" className={field} />
            <input name="email" type="email" required defaultValue={defaults?.email} placeholder="Email" className={field} />
            <input name="phone" placeholder="WhatsApp / téléphone (recommandé)" className={field} />
            <select name="stack" defaultValue="" className={`${field} [&>option]:bg-[#0c0c14]`}>
              <option value="" disabled>Technologie du projet (optionnel)</option>
              {STACKS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <input name="domain" placeholder="Nom de domaine souhaité (optionnel, ex. monsite.com)" className={`${field} mt-4`} />
          <textarea name="message" rows={3} placeholder="Autre précision ? Base de données, fonctionnalités, variables…" className={`${field} mt-4`} />
        </div>
      )}

      {error && <p className="mt-5 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <div className="mt-7 flex items-center justify-between">
        {step > 0 ? (
          <button type="button" onClick={() => { setStep((s) => s - 1); setArmed(false); setError(""); }} className="rounded-full px-5 py-2.5 text-sm text-white/50 transition hover:bg-white/5">
            ← Retour
          </button>
        ) : <span />}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} className="brand-grad rounded-full px-8 py-3.5 text-sm font-semibold shadow-lg shadow-fuchsia-500/25 transition hover:scale-[1.02]">
            Continuer →
          </button>
        ) : (
          <button
            disabled={sending || !armed}
            className={`brand-grad shimmer relative overflow-hidden rounded-full px-8 py-3.5 font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02] disabled:cursor-wait ${armed ? "" : "opacity-60"}`}
          >
            {sending && <span className="absolute inset-y-0 left-0 bg-white/20 transition-all" style={{ width: `${progress}%` }} />}
            <span className="relative flex items-center gap-2">
              {sending ? <><Loader2 size={17} className="animate-spin" /> Envoi… {progress}%</> : "Envoyer mon projet →"}
            </span>
          </button>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-white/35">Vos fichiers restent privés et ne sont accessibles qu&apos;à notre équipe technique.</p>
    </form>
  );
}
