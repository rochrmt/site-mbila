import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { siteForDomain, siteIsPaid } from "@/lib/db";
import { templateById } from "@/templates/all";
import SiteRenderer from "@/templates/render/SiteRenderer";
import ExpiredSite from "@/components/ExpiredSite";

export const dynamic = "force-dynamic";

type Params = Promise<{ host: string }>;

// Rend un site client servi sous son propre domaine (ex. monentreprise.com).
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const match = siteForDomain((await params).host);
  if (!match?.site.published || match.site.suspended) return { title: "Site introuvable" };
  if (!siteIsPaid(match.site)) return { title: "Site momentanément indisponible", robots: { index: false } };
  const d = match.site.data;
  return {
    title: `${d.name}${d.city ? ` · ${d.city}` : ""}`,
    description: d.hero.subtitle,
    openGraph: { title: d.name, description: d.tagline, images: [d.hero.image] },
  };
}

export default async function DomainSite({ params }: { params: Params }) {
  const host = (await params).host;
  const match = siteForDomain(host);
  if (!match?.site.published || match.site.suspended) notFound();
  // www.x.com → x.com (une seule adresse canonique)
  if (host.startsWith("www.")) redirect(`https://${match.canonical}/`);
  const { site } = match;
  // Abonnement expiré : page neutre « indisponible » jusqu'au renouvellement
  if (!siteIsPaid(site)) return <ExpiredSite name={site.data.name} />;
  return (
    <SiteRenderer
      data={site.data}
      tpl={templateById(site.template_id)}
      paletteId={site.palette_id}
      anim={site.anim}
      slug={site.slug}
    />
  );
}
