import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteBySlug, siteIsPaid } from "@/lib/db";
import { templateById } from "@/templates/all";
import SiteRenderer from "@/templates/render/SiteRenderer";
import ExpiredSite from "@/components/ExpiredSite";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/site/[slug]">): Promise<Metadata> {
  const site = getSiteBySlug((await params).slug);
  if (!site?.published || site.suspended) return { title: "Site introuvable" };
  if (!siteIsPaid(site)) return { title: "Site momentanément indisponible", robots: { index: false } };
  const d = site.data;
  return {
    title: `${d.name}${d.city ? ` · ${d.city}` : ""}`,
    description: d.hero.subtitle,
    openGraph: { title: d.name, description: d.tagline, images: [d.hero.image] },
  };
}

export default async function PublicSite({ params }: PageProps<"/site/[slug]">) {
  const site = getSiteBySlug((await params).slug);
  if (!site?.published || site.suspended) notFound();
  // Abonnement expiré : page neutre « indisponible » (pas 404 — le site revient au renouvellement)
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
