"use client";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const authInput =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-400/60 focus:ring-4 focus:ring-fuchsia-500/10";

// Champ mot de passe avec œil pour afficher/masquer la saisie
export default function PasswordInput({
  name,
  placeholder,
  minLength,
  autoComplete,
  id,
  className = authInput,
}: {
  name: string;
  placeholder?: string;
  minLength?: number;
  autoComplete?: string;
  id?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${className} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2.5 text-white/40 transition hover:text-white"
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
