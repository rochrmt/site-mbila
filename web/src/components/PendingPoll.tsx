"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Rafraîchit la page serveur toutes les 15 s — le client atterrit
// automatiquement sur « site en ligne » dès que l'admin confirme.
export default function PendingPoll() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 15000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
