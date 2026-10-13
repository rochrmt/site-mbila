import Link from "next/link";
import { LogOut, Settings2, ShieldCheck } from "lucide-react";
import { logout } from "@/app/actions";
import type { Notification } from "@/lib/db";
import Logo from "./Logo";
import NotifBell from "./NotifBell";

export default function DashHeader({ name, admin, notifications, unread }: { name: string; admin?: boolean; notifications?: Notification[]; unread?: number }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#07070c]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />
        <div className="flex items-center gap-4">
          {admin && (
            <Link href="/admin" className="flex items-center gap-1.5 rounded-full bg-fuchsia-500/15 px-3 py-1.5 text-sm font-semibold text-fuchsia-300 transition hover:bg-fuchsia-500/25">
              <ShieldCheck size={15} /> Admin
            </Link>
          )}
          {notifications && <NotifBell notifications={notifications} unread={unread ?? 0} />}
          <Link href="/compte" title="Mon compte" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">
            <Settings2 size={15} /> <span className="hidden sm:inline">Compte</span>
          </Link>
          <span className="hidden text-sm text-white/50 sm:block">{name}</span>
          <form action={logout}>
            <button className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">
              <LogOut size={16} /> Déconnexion
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
