import Link from "next/link";
import { CreditCard, ImageIcon, KeyRound, LayoutTemplate, LayoutDashboard, ArrowLeft, Server, Settings2, Tag, Users } from "lucide-react";
import Logo from "@/components/Logo";
import { requireAdmin } from "@/lib/admin";
import { getNotifications } from "@/lib/db";
import NotifBell from "@/components/NotifBell";

export const metadata = { title: "Administration · Mbila" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const links = [
    { href: "/admin", label: "Vue d'ensemble", Icon: LayoutDashboard },
    { href: "/admin/templates", label: "Modèles", Icon: LayoutTemplate },
    { href: "/admin/images", label: "Images", Icon: ImageIcon },
    { href: "/admin/clients", label: "Clients", Icon: Users },
    { href: "/admin/hebergement", label: "Hébergement", Icon: Server },
    { href: "/admin/paiements", label: "Paiements", Icon: CreditCard },
    { href: "/admin/tarifs", label: "Tarifs", Icon: Tag },
    { href: "/admin/recuperation", label: "Récupérations", Icon: KeyRound },
  ];
  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#07070c]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              <ArrowLeft size={15} /> Mon espace
            </Link>
            <Link href="/compte" title="Mon compte" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              <Settings2 size={15} /> Compte
            </Link>
            <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-semibold text-fuchsia-300">Admin</span>
            <NotifBell notifications={getNotifications(user.id).list} unread={getNotifications(user.id).unread} />
            <span className="hidden text-sm text-white/50 sm:block">{user.name}</span>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <aside className="w-52 shrink-0">
          <nav className="sticky top-24 space-y-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">
                <l.Icon size={17} /> {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
