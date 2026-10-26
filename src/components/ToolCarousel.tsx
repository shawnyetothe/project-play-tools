"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type CarouselTool = { id: string; plain: string; name: string };

type Draw = (ctx: CanvasRenderingContext2D, t: number, parallax: number, w: number, h: number) => void;

const drawers: Record<string, Draw> = {
  p5(ctx, t, parallax, w, h) {
    ctx.fillStyle = "#f6f1e8";
    ctx.fillRect(0, 0, w, h);
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    ctx.strokeStyle = "#1c1915";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    const shift = parallax * 18;
    for (let i = 0; i < 42; i++) {
      const x = 24 + rnd() * (w - 48);
      const y = 24 + rnd() * (h - 48);
      const ang = rnd() * Math.PI * 2 + t * 0.35;
      ctx.beginPath();
      ctx.moveTo(x + shift, y);
      ctx.lineTo(x + Math.cos(ang) * 46, y + Math.sin(ang) * 28);
      ctx.stroke();
    }
  },
  three(ctx, t, parallax, w, h) {
    ctx.fillStyle = "#f6f1e8";
    ctx.fillRect(0, 0, w, h);
    const angle = t * 0.6 + parallax * 0.5;
    const boxes = [
      [-1.1, 0.2],
      [-0.2, -0.4],
      [0.7, 0.35],
      [1.3, -0.15],
    ];
    for (const [x, z] of boxes) {
      const rx = x * Math.cos(angle) - z * Math.sin(angle);
      const rz = x * Math.sin(angle) + z * Math.cos(angle);
      const px = w / 2 + rx * 70;
      const py = h * 0.62 + rz * 28;
      const bw = 54;
      const bh = 70 + (1 - rz) * 18;
      ctx.fillStyle = "#1c1915";
      ctx.fillRect(px - bw / 2, py - bh, bw, bh);
      ctx.fillStyle = "#0c3d73";
      ctx.fillRect(px - bw / 2, py - bh - 10, bw, 10);
    }
  },
  glsl(ctx, t, parallax, w, h) {
    const step = 3;
    for (let y = 0; y < h; y += step) {
      const wave = 0.5 + 0.5 * Math.sin(y * 0.045 + t * 1.4 + parallax * 1.2);
      const v = Math.round(232 - wave * 190);
      ctx.fillStyle = `rgb(${v}, ${Math.round(v * 0.96)}, ${Math.round(v * 0.9)})`;
      ctx.fillRect(0, y, w, step);
    }
  },
  plotter(ctx, t, parallax, w, h) {
    ctx.fillStyle = "#f6f1e8";
    ctx.fillRect(0, 0, w, h);
    const pts: [number, number][] = [];
    let seed = 11;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 8; i++) pts.push([36 + i * ((w - 72) / 7), 40 + rnd() * (h - 80)]);
    const travel = (t % (Math.PI * 2)) / (Math.PI * 2);
    const full = travel === 0 && t === 0;
    const segments = full ? pts.length - 1 : Math.max(1, Math.floor(travel * (pts.length - 1)));
    ctx.strokeStyle = "#1c1915";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + parallax * 10, pts[0][1]);
    for (let i = 1; i <= segments; i++) ctx.lineTo(pts[i][0] + parallax * 10, pts[i][1]);
    ctx.stroke();
    const pen = pts[Math.min(segments, pts.length - 1)];
    ctx.fillStyle = "#0c3d73";
    ctx.beginPath();
    ctx.arc(pen[0] + parallax * 10, pen[1], 7, 0, Math.PI * 2);
    ctx.fill();
  },
};

export function ToolCarousel({ tools }: { tools: CarouselTool[] }) {
  const root = useRef<HTMLElement>(null);
  const canvases = useRef<Record<string, HTMLCanvasElement | null>>({});
  const [index, setIndex] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    let frame = 0;
    let running = true;
    const visible = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
    });
    if (root.current) visible.observe(root.current);

    const paint = (now: number) => {
      const section = root.current;
      let parallax = 0;
      if (section && !reduce) {
        const rect = section.getBoundingClientRect();
        const mid = rect.top + rect.height / 2 - window.innerHeight / 2;
        parallax = Math.max(-1, Math.min(1, -mid / window.innerHeight));
      }
      const t = reduce ? 0 : now / 1000;
      for (const tool of tools) {
        const canvas = canvases.current[tool.id];
        const draw = drawers[tool.id];
        if (!canvas || !draw) continue;
        const width = canvas.clientWidth || 640;
        const height = 280;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== Math.floor(width * ratio) || canvas.height !== Math.floor(height * ratio)) {
          canvas.width = Math.floor(width * ratio);
          canvas.height = Math.floor(height * ratio);
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw(ctx, running ? t : 0, parallax, width, height);
      }
      frame = window.requestAnimationFrame(paint);
    };
    frame = window.requestAnimationFrame(paint);
    return () => {
      window.cancelAnimationFrame(frame);
      visible.disconnect();
    };
  }, [reduce, tools]);

  function go(next: number) {
    const count = tools.length;
    const wrapped = (next + count) % count;
    setIndex(wrapped);
    const card = root.current?.querySelectorAll(".reel-card")[wrapped];
    card?.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section className="wrap carousel" ref={root} aria-roledescription="carousel" aria-label="Tools drawn live">
      <h2>Tools, drawn live</h2>
      <p className="quiet">
        Sketches made for this page, in code. They are not another artist’s work. The marks stand in for p5.js, three.js, a shader, and a plotter.
      </p>
      <div className="carousel-bar">
        <button type="button" onClick={() => go(index - 1)}>
          Previous
        </button>
        <span>
          {index + 1} of {tools.length}
        </span>
        <button type="button" onClick={() => go(index + 1)}>
          Next
        </button>
      </div>
      <div className="reel">
        {tools.map((tool, i) => (
          <article key={tool.id} className={i === index ? "reel-card is-current" : "reel-card"} id={`tool-slide-${tool.id}`}>
            <canvas
              ref={(node) => {
                canvases.current[tool.id] = node;
              }}
              aria-hidden="true"
            />
            <h3>
              <Link href={`/tools/${tool.id}/`}>{tool.plain}</Link>
            </h3>
            <p className="tech">{tool.name}</p>
            <p className="quiet">{reduce ? "Still frame. Motion is off." : "The drawing shifts a little as you scroll."}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
