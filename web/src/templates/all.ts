import "server-only";
import { getCustomTemplates } from "@/lib/db";
import { TEMPLATES } from "./library";
import type { Template } from "./types";

// Bibliothèque complète : templates intégrés + templates créés par l'admin.
export function allTemplates(): Template[] {
  return [...TEMPLATES, ...getCustomTemplates()];
}

export function templateById(id: string): Template {
  return allTemplates().find((t) => t.id === id) ?? TEMPLATES[0];
}

export function templateExists(id: string): boolean {
  return allTemplates().some((t) => t.id === id);
}
