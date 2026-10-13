// Page affichée aux visiteurs quand l'abonnement du site est expiré.
// Volontairement neutre : on n'affiche jamais « impayé » aux visiteurs du client.
export default function ExpiredSite({ name }: { name?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#07070c] px-6 text-center text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/30">{name || "Site"}</p>
      <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">Site momentanément indisponible</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
        Ce site est en cours de maintenance. Revenez un peu plus tard.
      </p>
    </div>
  );
}
