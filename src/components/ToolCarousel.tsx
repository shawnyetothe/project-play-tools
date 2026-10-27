"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { liveDrawers } from "./live-draw";

export type CarouselTool = { id: string; plain: string; name: string };

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
        const draw = liveDrawers[tool.id];
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
