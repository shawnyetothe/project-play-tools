"use client";

import { useEffect, useRef } from "react";
import { fitCanvas } from "./canvas-fit";
import { drawCine } from "@/lib/cine";
import { seedUint } from "@/lib/seed";

export function CineTile({
  kind,
  seed,
  hot,
  reduced,
}: {
  kind: string;
  seed: string;
  hot: boolean;
  reduced: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const seen = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let frame = 0;
    let last = 0;
    let alive = true;
    let looping = false;
    const tick = (now: number) => {
      looping = false;
      if (!alive) return;
      const play = hot && seen.current && !reduced && document.visibilityState === "visible";
      const fitted = fitCanvas(canvas, 1.5);
      if (fitted && (play ? now - last > 34 : last === 0)) {
        drawCine(fitted.ctx, fitted.w, fitted.h, kind, seedUint(seed), play ? now : null);
        last = now || 1;
      }
      if (play) {
        looping = true;
        frame = requestAnimationFrame(tick);
      }
    };
    const wake = () => {
      if (looping) return;
      looping = true;
      frame = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      seen.current = entry.isIntersecting;
      if (entry.isIntersecting) wake();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", wake);
    wake();
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      io.disconnect();
      document.removeEventListener("visibilitychange", wake);
    };
  }, [kind, seed, hot, reduced]);

  return <canvas ref={ref} className="cine-tile" aria-hidden="true" />;
}
