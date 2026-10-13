"use client";
import { useEffect } from "react";

// Anime les éléments .rv à l'entrée dans l'écran, le parallax, les compteurs
// et l'état "scrollé" de la navigation. Un seul observer pour tout le site.
export default function AnimRuntime({ level, fx = "" }: { level: string; fx?: string }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-site]");
    if (!root) return;
    const scroller = root.closest("[data-scroll-root]") ?? window;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const els = root.querySelectorAll<HTMLElement>(".rv");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          e.target.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          if ((e.target as HTMLElement).dataset.count) countUp(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    requestAnimationFrame(() => root.classList.add("ready"));

    function countUp(el: HTMLElement) {
      if (level !== "rich" || reduce || el.dataset.done) return;
      el.dataset.done = "1";
      const raw = el.dataset.count || "";
      const m = raw.match(/[\d\s.,]+/);
      if (!m) return;
      const target = parseFloat(m[0].replace(/[\s,]/g, (c) => (c === "," ? "." : "")));
      if (!isFinite(target) || raw.includes("/")) return;
      const [pre, post] = raw.split(m[0]);
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / 1400);
        const v = target * (1 - Math.pow(1 - p, 3));
        el.textContent = `${pre}${Number.isInteger(target) ? Math.round(v).toLocaleString("fr-FR") : v.toFixed(1)}${post}`;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = raw;
      };
      requestAnimationFrame(step);
    }

    const nav = root.querySelector<HTMLElement>("[data-nav]");
    const par = level === "rich" && !reduce ? root.querySelectorAll<HTMLElement>("[data-parallax]") : [];
    const onScroll = () => {
      const y = scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;
      nav?.toggleAttribute("data-scrolled", y > 40);
      par.forEach((el) => {
        const r = el.parentElement!.getBoundingClientRect();
        el.style.transform = `translate3d(0, ${r.top * -0.15}px, 0)`;
      });
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Effet "projecteur" : la position de la souris alimente --mx / --my
    const fine = matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      root.style.setProperty("--mx", `${e.clientX - r.left}px`);
      root.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    if (fx.includes("spotlight") && fine) root.addEventListener("pointermove", onMove);

    // Effet 3D : cartes et images du hero s'inclinent vers la souris
    const tilts = fx.includes("tilt") && fine && !reduce ? [...root.querySelectorAll<HTMLElement>("main .group, [data-tilt]")] : [];
    const tiltMove = (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      // Transition posée au premier survol seulement : n'écrase pas l'apparition (.rv)
      if (!el.dataset.tilted) {
        el.dataset.tilted = "1";
        el.style.transition = "transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1), opacity 0.9s, filter 0.9s";
      }
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateZ(0)`;
    };
    const tiltLeave = (e: PointerEvent) => ((e.currentTarget as HTMLElement).style.transform = "");
    tilts.forEach((el) => {
      el.addEventListener("pointermove", tiltMove);
      el.addEventListener("pointerleave", tiltLeave);
    });

    return () => {
      io.disconnect();
      scroller.removeEventListener("scroll", onScroll);
      root.removeEventListener("pointermove", onMove);
      tilts.forEach((el) => {
        el.removeEventListener("pointermove", tiltMove);
        el.removeEventListener("pointerleave", tiltLeave);
      });
    };
  }, [level, fx]);
  return null;
}
