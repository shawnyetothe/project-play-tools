"use client";

import { useEffect, useRef } from "react";
import { drawPiece } from "@/lib/piece-draw";

export function ArtCanvas({
  seed,
  orbit,
  spread,
  label,
}: {
  seed: number;
  orbit: number;
  spread: number;
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let frame = 0;
    const paint = () => {
      const css = canvas.clientWidth;
      if (css < 2) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const px = Math.max(1, Math.round(css * dpr));
      if (canvas.width !== px || canvas.height !== px) {
        canvas.width = px;
        canvas.height = px;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawPiece(ctx, css, css, seed, orbit, spread);
      canvas.dataset.ready = "1";
      canvas.dataset.seed = seed.toString(16).padStart(4, "0");
      canvas.dataset.orbit = orbit.toFixed(3);
      canvas.dataset.spread = spread.toFixed(1);
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    });
    observer.observe(canvas);
    frame = requestAnimationFrame(paint);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [seed, orbit, spread]);

  return <canvas ref={ref} className="art-canvas" role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true} />;
}
