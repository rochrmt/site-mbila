import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteBySlug } from "@/lib/db";
import { templateById } from "@/templates/all";
import SiteRenderer from "@/templates/render/SiteRenderer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/site/[slug]">): Promise<Metadata> {
  const site = getSiteBySlug((await params).slug);
  if (!site?.published || site.suspended) return { title: "Site introuvable" };
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
