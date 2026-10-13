"use client";
import { useEffect, useState } from "react";

export default function HeroSlider({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % images.length), 5500);
    return () => clearInterval(id);
  }, [images.length]);
  return (
    <div className="absolute inset-0">
      {images.map((src, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src + k}
          src={src}
          alt={k === 0 ? alt : ""}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${k === i ? "kb opacity-100" : "opacity-0"}`}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, k) => (
            <button
              key={k}
              aria-label={`Image ${k + 1}`}
              onClick={() => setI(k)}
              className={`h-1.5 rounded-full bg-white transition-all ${k === i ? "w-8" : "w-1.5 opacity-50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
