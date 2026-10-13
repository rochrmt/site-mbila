import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-display text-xl font-bold tracking-tight ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Mbila" className="h-8 w-8 rounded-lg object-cover shadow-lg shadow-emerald-500/20" />
      mbila
    </Link>
  );
}
