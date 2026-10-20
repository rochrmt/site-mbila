"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, CircleCheck, Trash2 } from "lucide-react";
import { deleteUserAction, setUserBlockedAction } from "@/app/admin/actions";

type Props = { userId: number; name: string; sitesCount: number; blocked: boolean };

// Actions admin sur un compte client : bloquer (réversible — coupe la session et
// suspend ses sites) ou supprimer (définitif — compte + sites + leads effacés).
export default function UserActions({ userId, name, sitesCount, blocked }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const pill = "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition disabled:opacity-40";
  const send = (action: (fd: FormData) => Promise<{ error?: string; ok?: boolean }>) => {
    const fd = new FormData();
    fd.set("user_id", String(userId));
    return start(async () => {
      const r = await action(fd);
      if (r?.error) alert(r.error);
      router.refresh();
    });
  };

  return (
    <span className="flex flex-wrap items-center gap-2">
      <button
        disabled={pending}
        title={blocked ? "Redonner l'accès au compte (ses sites restent suspendus — à réactiver un par un)" : "Bloque le compte : session coupée, connexion refusée et sites suspendus"}
        onClick={() => send(setUserBlockedAction)}
        className={`${pill} ${blocked ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"}`}
      >
        {blocked ? <CircleCheck size={12} /> : <Ban size={12} />}
        {blocked ? "Débloquer" : "Bloquer"}
      </button>
      <button
        disabled={pending}
        title="Supprimer définitivement le compte, ses sites, ses leads et ses paiements"
        onClick={() => {
          if (window.confirm(`Supprimer définitivement le compte « ${name} » ?\n${sitesCount} site(s), les messages reçus et les paiements associés seront effacés — action irréversible.`))
            send(deleteUserAction);
        }}
        className={`${pill} bg-red-500/10 text-red-300 hover:bg-red-500/25`}
      >
        <Trash2 size={12} /> Supprimer
      </button>
    </span>
  );
}
