"use client";
import { useEffect, useState } from "react";
import type { HeroTextMode } from "../fx";

// Mots qui changent sous le titre du hero. Premier mot rendu côté serveur (SEO, sans JS).
export function Rotator({ mode, words, className = "" }: { mode: HeroTextMode; words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(Infinity); // lettres visibles (mode machine à écrire)
  const word = words[i % words.length] ?? "";

  useEffect(() => {
    if (words.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (mode !== "typing") {
      const id = setInterval(() => setI((x) => x + 1), 2600);
      return () => clearInterval(id);
    }
    // Machine à écrire : écrit, pause, efface, mot suivant
    let k = words[0].length, dir = -1, idx = 0, wait = 14;
    const id = setInterval(() => {
      if (wait > 0) return void wait--;
      k += dir;
      if (dir < 0 && k <= 0) { dir = 1; idx++; setI(idx); }
      else if (dir > 0 && k >= words[idx % words.length].length) { dir = -1; wait = 22; }
      setN(k);
    }, 70);
    return () => clearInterval(id);
  }, [mode, words]);

  if (!words.length) return null;
  if (mode === "typing")
    return (
      <span className={`rot-wrap ${className}`}>
        {word.slice(0, n)}
        <span className="rot-caret" />
      </span>
    );
  return (
    <span className={`rot-wrap rot-3d ${className}`}>
      <span key={i} className={`rot-word rot-${mode}`}>{word}</span>
    </span>
  );
}
