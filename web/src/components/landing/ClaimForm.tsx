"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const clean = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+/, "").slice(0, 30);

export default function ClaimForm({ domain, compact }: { domain: string; compact?: boolean }) {
  const [v, setV] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (v) localStorage.setItem("mbila:slug", v.replace(/-+$/, ""));
        router.push("/inscription");
      }}
      className={`mx-auto flex w-full ${compact ? "" : "max-w-xl"} flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur ${compact ? "" : "sm:flex-row sm:rounded-full"}`}
    >
      <div className="flex flex-1 items-center rounded-full px-4 py-2">
        <input
          value={v}
          onChange={(e) => setV(clean(e.target.value))}
          placeholder="votre-entreprise"
          aria-label="Adresse de votre site"
          className="w-full min-w-0 bg-transparent text-right text-white outline-none placeholder:text-white/30"
        />
        <span className="shrink-0 text-white/50">.{domain}</span>
      </div>
      <button className="brand-grad shimmer rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02]">
        Créer mon site gratuitement
      </button>
    </form>
  );
}
