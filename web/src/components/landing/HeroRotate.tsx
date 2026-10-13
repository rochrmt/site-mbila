"use client";
import { useEffect, useRef, useState } from "react";

// Texte changeant du hero de l'accueil : alterne les promesses
// (site généré / projet déployé / appli pour le CV) façon machine à écrire.
export default function HeroRotate({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState(phrases[0]);
  const state = useRef({ i: 0, n: phrases[0].length, dir: -1 as 1 | -1, wait: 30 });

  useEffect(() => {
    const id = setInterval(() => {
      const s = state.current;
      if (s.wait > 0) { s.wait--; return; }
      s.n += s.dir;
      if (s.dir < 0 && s.n <= 0) { s.dir = 1; s.i = (s.i + 1) % phrases.length; }
      else if (s.dir > 0 && s.n >= phrases[s.i].length) { s.dir = -1; s.wait = 34; }
      setText(phrases[s.i].slice(0, Math.max(0, s.n)));
    }, 55);
    return () => clearInterval(id);
  }, [phrases]);

  return (
    <span className="brand-text font-semibold">
      {text}
      <span className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[3px] animate-pulse bg-fuchsia-300" />
    </span>
  );
}
