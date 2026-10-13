import { notFound } from "next/navigation";
import Editor from "@/components/editor/Editor";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { DISPLAY_DOMAIN, siteUrl } from "@/lib/config";
import { getDomainsBySite, getLeads, getNotifications, getPaymentsBySite, getSiteById, getStockImages, historyCount, sitePlanPrice } from "@/lib/db";
import stock from "@/lib/stock-manifest.json";
import { allTemplates } from "@/templates/all";
import { TEMPLATES } from "@/templates/library";
import { PALETTES } from "@/templates/palettes";

export const metadata = { title: "Modifier mon site · Mbila" };

export default async function EditSite({ params, searchParams }: PageProps<"/dashboard/sites/[id]">) {
  const user = await requireUser();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const site = getSiteById(Number(id));
  // Propriétaire ou administrateur (support : l'admin peut modifier le site d'un client)
  const admin = isAdmin(user);
  if (!site || (site.user_id !== user.id && !admin)) notFound();
  const cat = site.data.category;
  const builtin = new Set(TEMPLATES.map((t) => t.id));
  // Le client ne voit que les modèles adaptés à SON métier — les autres
  // catégories restent invisibles (il doit croire que son design est unique).
  const templates = allTemplates().map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    palettes: [t.palette, ...t.altPalettes],
    fits: t.categories.includes(cat),
    custom: !builtin.has(t.id),
  })).filter((t) => t.fits || t.id === site.template_id);
  const stockMerged = Object.fromEntries(Object.entries(stock).map(([k, v]) => [k, v.map((x) => x.src)]));
  for (const i of getStockImages()) (stockMerged[i.category] ??= []).unshift(i.src);
  return (
    <Editor
      site={{ id: site.id, slug: site.slug, templateId: site.template_id, paletteId: site.palette_id ?? "", anim: site.anim ?? "subtle", published: site.published, paidUntil: site.paid_until, data: site.data, draft: site.draft }}
      history={historyCount(site.id)}
      url={siteUrl(site.slug)}
      host={`${site.slug}.${DISPLAY_DOMAIN}`}
      leads={getLeads(site.id)}
      templates={templates}
      palettes={PALETTES.map((p) => ({ id: p.id, name: p.name, colors: [p.bg, p.primary, p.accent] }))}
      stock={stockMerged}
      welcome={sp.bienvenue === "1"}
      support={admin}
      initialTab={typeof sp.tab === "string" ? sp.tab : undefined}
      domains={getDomainsBySite(site.id)}
      pendingPayment={getPaymentsBySite(site.id).some((p) => p.status === "en_attente")}
      notifications={getNotifications(user.id).list}
      unreadNotifs={getNotifications(user.id).unread}
      price={sitePlanPrice("essentiel", site.category)}
    />
  );
}
