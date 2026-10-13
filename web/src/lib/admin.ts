import "server-only";
import { redirect } from "next/navigation";
import { requireUser } from "./auth";
import type { User } from "./db";

// Les admins sont déclarés via la variable d'environnement ADMIN_EMAILS
// (liste d'emails séparés par des virgules, dans .env sur le serveur).
export function isAdmin(user: Pick<User, "email"> | null): boolean {
  if (!user) return false;
  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!user.email && emails.includes(user.email.toLowerCase());
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user)) redirect("/dashboard");
  return user;
}
