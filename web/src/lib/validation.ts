// Validation partagée — même règles client et serveur.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Numéro de téléphone : 7 à 15 chiffres (format libre : +, espaces, tirets, parenthèses)
export const PHONE_OK = (v: string) => {
  const d = String(v ?? "").replace(/\D/g, "");
  return d.length >= 7 && d.length <= 15;
};

export const EMAIL_OK = (v: string) => EMAIL_RE.test(v ?? "");
