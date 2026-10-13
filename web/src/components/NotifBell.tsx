"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { markNotificationsReadAction } from "@/app/actions";
import type { Notification } from "@/lib/db";

const fmt = (iso: string) =>
  new Date(iso + "Z").toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function NotifBell({ notifications, unread }: { notifications: Notification[]; unread: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function toggle() {
    setOpen((o) => !o);
    if (!open && unread > 0) markNotificationsReadAction();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        className="relative grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="pop-in absolute right-0 top-11 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d15] shadow-2xl shadow-black/60">
          <p className="border-b border-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Notifications</p>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-white/40">Rien pour l&apos;instant.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((n) => {
                const inner = (
                  <div className={`px-4 py-3 transition hover:bg-white/5 ${!n.read ? "bg-fuchsia-500/[0.06]" : ""}`}>
                    <p className="text-sm leading-snug text-white/85">{n.text}</p>
                    <p className="mt-1 text-[10px] text-white/35">{fmt(n.created_at)}</p>
                  </div>
                );
                return (
                  <li key={n.id} className="border-b border-white/5 last:border-0">
                    {n.href ? <Link href={n.href} onClick={() => setOpen(false)}>{inner}</Link> : inner}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
