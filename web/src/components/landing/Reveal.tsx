"use client";
import { useEffect } from "react";

// Apparition au scroll des éléments .lv de la landing
export default function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("lv-in"), io.unobserve(e.target))),
      { threshold: 0.15 },
    );
    document.querySelectorAll(".lv").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
