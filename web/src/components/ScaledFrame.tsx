"use client";
import { useEffect, useRef, useState } from "react";

// Iframe rendue en 1440px puis réduite à la largeur du conteneur
export default function ScaledFrame({ src, width = 1440, ratio = 0.68, className = "", interactive = false }: { src: string; width?: number; ratio?: number; className?: string; interactive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [loadedSrc, setLoadedSrc] = useState("");
  const loaded = loadedSrc === src;
  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={ref} className={`relative overflow-hidden bg-white/5 ${className}`} style={{ aspectRatio: `1 / ${ratio}` }}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-white/10" />}
      {scale > 0 && (
        <iframe
          src={src}
          onLoad={() => setLoadedSrc(src)}
          title="Aperçu"
          className={`absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${interactive ? "" : "pointer-events-none"}`}
          style={{ width, height: width * ratio, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}
