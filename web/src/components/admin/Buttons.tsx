"use client";
import { useTransition, type ReactNode } from "react";

export function DeleteBtn({ id, action, confirm, icon }: { id: string | number; action: (id: never) => Promise<{ error?: string; ok?: boolean }>; confirm: string; icon: ReactNode }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirm)) start(async () => { await action(id as never); });
      }}
      className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-white/60 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-40"
      title="Supprimer"
    >
      {icon}
    </button>
  );
}
