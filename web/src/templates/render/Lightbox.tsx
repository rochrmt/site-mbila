"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Visionneuse plein écran : chaque enfant portant data-lb="<index>" ouvre l'image.
export default function Lightbox({ images, children }: { images: string[]; children: ReactNode }) {
  const [cur, setCur] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => setCur(null), []);
  const nav = useCallback(
    (dir: number) => setCur((c) => (c === null ? c : (c + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (cur === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") nav(1);
      else if (e.key === "ArrowLeft") nav(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cur, close, nav]);

  const btn =
    "grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25";

  return (
    <>
      <div
        onClick={(e) => {
          const el = (e.target as HTMLElement).closest<HTMLElement>("[data-lb]");
          if (el) setCur(Math.max(0, Math.min(images.length - 1, Number(el.dataset.lb) || 0)));
        }}
      >
        {children}
      </div>
      {cur !== null && images[cur] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galerie en plein écran"
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 40) nav(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <button type="button" aria-label="Fermer" onClick={close} className={`${btn} absolute right-4 top-4 z-10`}>
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Image précédente"
                onClick={(e) => { e.stopPropagation(); nav(-1); }}
                className={`${btn} absolute left-3 top-1/2 z-10 -translate-y-1/2 md:left-6`}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                aria-label="Image suivante"
                onClick={(e) => { e.stopPropagation(); nav(1); }}
                className={`${btn} absolute right-3 top-1/2 z-10 -translate-y-1/2 md:right-6`}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[cur]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
          />
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20">
            {cur + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
