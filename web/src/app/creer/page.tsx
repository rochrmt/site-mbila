import Wizard from "@/components/wizard/Wizard";
import { CATEGORIES, GROUPS, PORTFOLIO_SPECS } from "@/content/categories";
import { stockImages } from "@/content/generate";
import { requireUser } from "@/lib/auth";
import { DISPLAY_DOMAIN } from "@/lib/config";

export const metadata = { title: "Créer mon site · Mbila" };

const SPEC_ORDER = ["dev", "mobile", "data", "cyber", "it", "compta", "finance", "rh", "gestion", "marketing"];

export default async function Create() {
  const user = await requireUser();
  const cats = CATEGORIES.map(({ id, label, group, icon, search, cta }) => ({
    id, label, group, icon, search, cta, preview: stockImages(id).slice(0, 3).map((i) => i.src),
  }));
  return (
    <Wizard
      user={{ name: user.name.split(" ")[0], email: user.email ?? "" }}
      categories={[...cats, { id: "other", label: "Autre activité", group: "Autre", icon: "star", search: "autre", cta: "whatsapp", preview: stockImages("other").slice(0, 3).map((i) => i.src) }]}
      groups={[...GROUPS, "Autre"]}
      domain={DISPLAY_DOMAIN}
      specs={[...PORTFOLIO_SPECS]
        // Technologie puis gestion/comptabilité en tête, créatifs ensuite
        .sort((x, y) => (SPEC_ORDER.indexOf(x.id) + 1 || 99) - (SPEC_ORDER.indexOf(y.id) + 1 || 99))
        .map(({ id, label, role, works }) => ({ id, label, role, works }))}
    />
  );
}
