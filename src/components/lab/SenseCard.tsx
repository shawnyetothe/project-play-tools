"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { fitCanvas } from "./canvas-fit";
import type { Piece } from "./use-piece";
import { drawSalt } from "@/lib/seed";
import { drawHero } from "@/lib/seed-draw";

export function SenseCard({ piece }: { piece: Piece }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const tilt = useRef(0);
  const { state, motion } = piece;

  useEffect(() => {
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma == null) return;
      tilt.current = Math.max(-1, Math.min(1, event.gamma / 40));
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let frame = 0;
    let looping = false;
    const visible = { current: true };
    const tick = () => {
      looping = false;
      const hidden = document.visibilityState === "hidden";
      const moving = motion && visible.current && !hidden;
      if (!moving && !visible.current) return;
      if (!visible.current || hidden) return;
      const fitted = fitCanvas(canvas);
      if (!fitted) {
        if (moving) {
          looping = true;
          frame = requestAnimationFrame(tick);
        }
        return;
      }
      const hour = new Date().getHours() + new Date().getMinutes() / 60;
      const scroll = Math.min(1, window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight));
      drawHero(fitted.ctx, fitted.w, fitted.h, {
        salt: drawSalt(state.seed, state.door, state.phrase, 5),
        tool: 5,
        door: state.door,
        t: motion ? performance.now() / 1000 : 0,
        pointer: { x: pointer.current.x + tilt.current * 0.15, y: pointer.current.y * 0.8 + scroll * 0.2 },
        hour,
        bursts: [],
        now: 0,
        still: !motion,
      });
      if (moving) {
        looping = true;
        frame = requestAnimationFrame(tick);
      }
    };
    const start = () => {
      if (looping) return;
      looping = true;
      frame = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (entry.isIntersecting) start();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", start);
    start();
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, [motion, state.seed, state.door, state.phrase]);

  return (
    <article className="lab-card" id="hear-sense">
      <h3>Sense</h3>
      <p>Pointer, scroll, the hour, and tilt if the browser already shares it. No camera. No microphone.</p>
      <canvas
        ref={ref}
        className="lineage-canvas"
        aria-label="Sketch steered by pointer and time"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          pointer.current = {
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height,
          };
        }}
      />
      <p>
        <Link className="try" href="/tools/clock/">
          Try it
        </Link>
      </p>
    </article>
  );
}
