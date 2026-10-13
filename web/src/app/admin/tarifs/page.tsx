import { CATEGORIES } from "@/content/categories";
import { getAllPricing } from "@/lib/db";
import { monthlyPrice } from "@/lib/pricing";
import { savePricingAction } from "../actions";

const catLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

// Lignes tarifaires éditables : tarif standard + catégories à prix spécifique + premium
const ROWS: { id: string; label: string; hint: string; def: number }[] = [
  { id: "essentiel", label: "Essentiel · tarif standard", hint: "Boutique, resto, école, salon, sport…", def: monthlyPrice("essentiel") },
  { id: "essentiel:portfolio", label: `Essentiel · ${catLabel("portfolio")}`, hint: "CV en ligne, freelance", def: monthlyPrice("essentiel", "portfolio") },
  { id: "essentiel:hotel", label: `Essentiel · ${catLabel("hotel")}`, hint: "Hôtels, auberges, résidences", def: monthlyPrice("essentiel", "hotel") },
  { id: "essentiel:legal", label: `Essentiel · ${catLabel("legal")}`, hint: "Cabinets, avocats, notaires", def: monthlyPrice("essentiel", "legal") },
  { id: "essentiel:medical", label: `Essentiel · ${catLabel("medical")}`, hint: "Cliniques, pharmacies", def: monthlyPrice("essentiel", "medical") },
  { id: "essentiel:consulting", label: `Essentiel · ${catLabel("consulting")}`, hint: "Conseil, prestations", def: monthlyPrice("essentiel", "consulting") },
  { id: "essentiel:tech", label: `Essentiel · ${catLabel("tech")}`, hint: "Agences, startups", def: monthlyPrice("essentiel", "tech") },
  { id: "essentiel:construction", label: `Essentiel · ${catLabel("construction")}`, hint: "BTP, artisans", def: monthlyPrice("essentiel", "construction") },
  { id: "essentiel:realestate", label: `Essentiel · ${catLabel("realestate")}`, hint: "Agences immo, promoteurs", def: monthlyPrice("essentiel", "realestate") },
  { id: "essentiel:transport", label: `Essentiel · ${catLabel("transport")}`, hint: "Logistique, flottes", def: monthlyPrice("essentiel", "transport") },
  { id: "premium", label: "Premium", hint: "Domaine personnalisé inclus", def: monthlyPrice("premium") },
];

const input =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/60";
const field = "text-[11px] font-medium uppercase tracking-wider text-white/35";

export default function AdminTarifs() {
  const rows = getAllPricing();
  const cur = (id: string) => rows.find((r) => r.id === id);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Tarifs</h1>
      <p className="mt-2 text-white/50">
        Prix mensuels par type de site — le client ne voit que le tarif de sa catégorie. Une promo remplace le prix et affiche son étiquette.
      </p>

      <form action={savePricingAction} className="mt-8 space-y-3">
        {ROWS.map((r) => {
          const p = cur(r.id);
          return (
            <div key={r.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <input type="hidden" name="ids" value={r.id} />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.label}</p>
                  <p className="text-xs text-white/40">{r.hint}</p>
                </div>
                <p className="text-sm text-white/35">Défaut : {r.def.toLocaleString("fr-FR")} F/mois</p>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={field}>Prix mensuel (FCFA)</label>
                  <input name={`m:${r.id}`} type="number" min={0} step={100} defaultValue={p?.monthly ?? r.def} className={`${input} mt-1.5`} />
                </div>
                <div>
                  <label className={field}>Prix promo/mois <span className="normal-case text-white/25">(vide = pas de promo)</span></label>
                  <input name={`p:${r.id}`} type="number" min={0} step={100} defaultValue={p?.promo ?? ""} placeholder="—" className={`${input} mt-1.5`} />
                </div>
                <div>
                  <label className={field}>Étiquette promo</label>
                  <input name={`l:${r.id}`} maxLength={60} defaultValue={p?.promo_label ?? ""} placeholder="Ex : Promo lancement −30 %" className={`${input} mt-1.5`} />
                </div>
              </div>
              {p?.promo ? (
                <p className="mt-3 text-xs text-emerald-300/80">
                  En promo : <b>{p.promo.toLocaleString("fr-FR")} F</b> au lieu de {p.monthly.toLocaleString("fr-FR")} F{p.promo_label ? ` · « ${p.promo_label} »` : ""}
                </p>
              ) : null}
            </div>
          );
        })}
        <button className="brand-grad rounded-xl px-8 py-3.5 font-semibold shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110">
          Enregistrer les tarifs
        </button>
      </form>
    </div>
  );
}
