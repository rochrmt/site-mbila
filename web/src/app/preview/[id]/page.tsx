import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { getSiteById } from "@/lib/db";
import { templateById } from "@/templates/all";
import SiteRenderer from "@/templates/render/SiteRenderer";
import type { AnimLevel } from "@/templates/types";

export const dynamic = "force-dynamic";

// Aperçu privé (propriétaire uniquement), avec surcharge possible du design
// via ?t=template&p=palette&a=anim — utilisé par l'écran de choix et l'éditeur.
export default async function Preview({ params, searchParams }: PageProps<"/preview/[id]">) {
  const [user, { id }, sp] = await Promise.all([getUser(), params, searchParams]);
  const site = getSiteById(Number(id));
  if (!user || !site || (site.user_id !== user.id && !isAdmin(user))) notFound();
  const str = (v: unknown) => (typeof v === "string" ? v : null);
  // L'aperçu montre le brouillon en cours s'il existe, sinon la version en ligne
  const base = site.draft ?? { data: site.data, templateId: site.template_id, paletteId: site.palette_id, anim: site.anim };
  return (
    <SiteRenderer
      data={base.data}
      tpl={templateById(str(sp.t) ?? base.templateId)}
      paletteId={str(sp.p) ?? base.paletteId}
      anim={(str(sp.a) as AnimLevel) ?? base.anim}
      slug={site.slug}
    />
  );
}
