import { notFound } from "next/navigation";
import Chooser from "@/components/wizard/Chooser";
import { requireUser } from "@/lib/auth";
import { getSiteById } from "@/lib/db";
import { templateById } from "@/templates/library";
import { paletteById } from "@/templates/palettes";

export const metadata = { title: "Choisissez votre design · Mbila" };

export default async function Choose({ params }: PageProps<"/creer/choix/[id]">) {
  const user = await requireUser();
  const site = getSiteById(Number((await params).id));
  if (!site || site.user_id !== user.id) notFound();
  const proposals = site.proposals.map((p) => {
    const [tid, pid] = p.split(":");
    const t = templateById(tid);
    return {
      templateId: t.id,
      name: t.name,
      description: t.description,
      paletteId: pid,
      palettes: [...new Set([pid, t.palette, ...t.altPalettes])].map((id) => {
        const x = paletteById(id);
        return { id: x.id, name: x.name, colors: [x.bg, x.primary, x.accent] };
      }),
    };
  });
  return <Chooser siteId={site.id} name={site.data.name} proposals={proposals} />;
}
