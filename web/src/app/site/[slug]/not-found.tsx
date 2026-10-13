import { appUrl } from "@/lib/config";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#07070c] px-6 text-center text-white">
      <div>
        <p className="brand-text font-display text-7xl font-bold">404</p>
        <h1 className="mt-4 text-2xl font-semibold">Ce site n&apos;existe pas (encore)</h1>
        <p className="mt-3 text-white/60">Cette adresse est peut-être libre. Réservez-la en 2 minutes.</p>
        <a href={appUrl("/inscription")} className="brand-grad mt-8 inline-block rounded-full px-7 py-3.5 text-sm font-semibold">
          Créer mon site gratuitement
        </a>
      </div>
    </main>
  );
}
