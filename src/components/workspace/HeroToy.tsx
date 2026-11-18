"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { assignFlow, makeSwarm, resample, shellPoint, stepSwarm, type Particle, type Vec } from "@/lib/hero-sim";
import { KeyHintLine } from "./Keys";
import { useWorkspace } from "./Workspace";
import type { LinePoint } from "@/lib/workspace-state";

function posterPoints(seed: string) {
  const swarm = makeSwarm(seed, 220);
  return swarm.map((particle) => {
    const point = shellPoint(particle, 880, 620);
    return { x: point.x / 880, y: point.y / 620, ink: particle.ink, size: particle.size };
  });
}

export function HeroPoster({ seed }: { seed: string }) {
  const points = posterPoints(seed);
  return (
    <svg className="hero-poster" viewBox="0 0 880 620" role="img" aria-label="Idle sketch">
      <rect width="880" height="620" fill="#F5F5F2" />
      <circle cx="440" cy="260" r="186" fill="none" stroke="#0B0B0F" strokeOpacity="0.22" strokeDasharray="3 5" />
      <circle cx="440" cy="260" r="279" fill="none" stroke="#0B0B0F" strokeOpacity="0.12" />
      <path d="M505 260 A65 65 0 0 0 473 316" fill="none" stroke="#0B0B0F" strokeOpacity="0.4" />
      <line x1="40" y1="496" x2="840" y2="496" stroke="#0B0B0F" strokeOpacity="0.55" />
      {points.map((point, index) => (
        <circle key={index} cx={point.x * 880} cy={point.y * 620} r={point.size} fill={point.ink} />
      ))}
    </svg>
  );
}

export function HeroToy({
  seed: seedProp,
  onInteract,
  caption,
}: {
  seed?: string;
  onInteract?: () => void;
  caption?: ReactNode;
} = {}) {
  const { state, line, setLine, markInteracted } = useWorkspace();
  const swarmSeed = seedProp || state.seed;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const particles = useRef<Particle[]>([]);
  const tune = useRef({ speed: state.speed || 0.03, spread: state.spread ?? 0.045 });
  tune.current.speed = state.speed || 0.03;
  tune.current.spread = state.spread ?? 0.045;
  const stroke = useRef<Vec[]>([]);
  const settled = useRef<Vec[] | null>(line.length ? line.map((point) => ({ x: point.x, y: point.y })) : null);
  const [status, setStatus] = useState(line.length ? "settled" : "orbiting");
  const [fps, setFps] = useState(60);
  const [size, setSize] = useState({ w: 880, h: 620 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const phone = window.matchMedia("(max-width: 720px)").matches;
    let count = phone ? 500 : 1200;
    let alive = true;
    let frame = 0;
    let last = performance.now();
    let fpsWindow = 0;
    let slow = 0;
    let interval = 1000 / 60;
    const grid = document.createElement("canvas");
    particles.current = makeSwarm(swarmSeed, count);
    if (settled.current) assignFlow(particles.current);

    const contentBox = () => ({
      w: Math.max(2, wrap.clientWidth),
      h: Math.max(2, wrap.clientHeight),
    });
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const { w, h } = contentBox();
      setSize({ w: Math.round(w), h: Math.round(h) });
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      grid.width = canvas.width;
      grid.height = canvas.height;
      const g = grid.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const radius = Math.min(w, h) * 0.3;
      const cx = w / 2;
      const cy = h * 0.42;
      g.strokeStyle = "rgba(11,11,15,0.22)";
      g.setLineDash([3, 5]);
      g.beginPath();
      g.arc(cx, cy, radius, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      g.strokeStyle = "rgba(11,11,15,0.12)";
      g.beginPath();
      g.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = "rgba(11,11,15,0.25)";
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + radius, cy);
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(Math.PI / 3) * radius, cy + Math.sin(Math.PI / 3) * radius);
      g.stroke();
      g.strokeStyle = "rgba(11,11,15,0.4)";
      g.beginPath();
      g.arc(cx, cy, radius * 0.35, 0, Math.PI / 3);
      g.stroke();
      g.strokeStyle = "rgba(11,11,15,0.55)";
      g.beginPath();
      g.moveTo(16, h * 0.8);
      g.lineTo(w - 16, h * 0.8);
      g.stroke();
      g.strokeStyle = "rgba(11,11,15,0.1)";
      for (let i = -8; i <= 8; i++) {
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + i * (w / 16), h);
        g.stroke();
      }
    };
    fit();
    const placed = contentBox();
    for (const particle of particles.current) {
      const home = shellPoint(particle, placed.w || 342, placed.h || 320);
      particle.x = home.x;
      particle.y = home.y;
    }
    const motionOff = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!motionOff) wrap.classList.add("is-live");
    const pending = (window as Window & { __playStroke?: LinePoint[] }).__playStroke;
    if (pending && pending.length > 1) {
      const rect = contentBox();
      const pixels = pending.map((point) => ({ x: point.x * rect.w, y: point.y * rect.h }));
      settled.current = pixels;
      stroke.current = pixels.slice();
      assignFlow(particles.current);
      setLine(pending);
      setStatus(reduced ? "paused" : "settled");
    }

    const draw = (now: number) => {
      if (!alive) return;
      const hidden = document.visibilityState === "hidden";
      const box = wrap.getBoundingClientRect();
      const visible = box.bottom > 0 && box.top < window.innerHeight;
      if (!hidden && visible) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const { w, h } = contentBox();
        const line = stroke.current.length > 1 ? stroke.current : settled.current;
        stepSwarm(particles.current, line, w, h, reduced ? 0 : dt || 0.016, reduced, tune.current.speed, tune.current.spread);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.fillStyle = "#F5F5F2";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(grid, 0, 0, w, h);
          const byInk = new Map<string, Particle[]>();
          for (const particle of particles.current) {
            const list = byInk.get(particle.ink) ?? [];
            list.push(particle);
            byInk.set(particle.ink, list);
          }
          for (const [ink, list] of byInk) {
            ctx.fillStyle = ink;
            ctx.beginPath();
            for (const particle of list) {
              ctx.moveTo(particle.x + particle.size, particle.y);
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            ctx.fill();
          }
          const drawn = stroke.current.length > 1 ? stroke.current : settled.current;
          if (drawn && drawn.length > 1) {
            ctx.strokeStyle = "#0B0B0F";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(drawn[0].x, drawn[0].y);
            for (const point of drawn.slice(1)) ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        }
        fpsWindow += 1;
        if (fpsWindow % 20 === 0) {
          const frameMs = now - (fpsWindow === 20 ? now - 16 : last);
          if (frameMs > 12) slow += 1;
          else slow = Math.max(0, slow - 1);
          if (slow > 8) {
            interval = 1000 / 30;
            if (count > 300) {
              count = 300;
              particles.current = particles.current.slice(0, 300);
            }
          }
          setFps(interval > 20 ? 30 : 60);
        }
      } else {
        last = now;
      }
      frame = window.setTimeout(() => requestAnimationFrame(draw), Math.max(0, interval - 8)) as unknown as number;
    };
    const start = requestAnimationFrame(draw);
    const onVis = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio < 0.1) last = performance.now();
    }, { threshold: [0, 0.1] });
    io.observe(wrap);
    return () => {
      alive = false;
      cancelAnimationFrame(start);
      window.clearTimeout(frame);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, [swarmSeed, reduced, setLine]);

  function localPoint(event: React.PointerEvent<HTMLCanvasElement>): Vec {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function commit(points: Vec[]) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const normal = points.map((point) => ({ x: point.x / rect.width, y: point.y / rect.height }));
    const smooth = resample(normal, 40);
    settled.current = smooth.map((point) => ({ x: point.x * rect.width, y: point.y * rect.height }));
    stroke.current = settled.current.slice();
    assignFlow(particles.current);
    setLine(smooth as LinePoint[]);
    setStatus(reduced ? "paused" : "re-forming");
    window.setTimeout(() => setStatus(reduced ? "paused" : "settled"), reduced ? 0 : 900);
    markInteracted();
  }

  return (
    <div className="hero-toy" data-hero="live" data-reduced={reduced ? "true" : "false"}>
      {caption ? null : <p className="fig-label">FIG. 01</p>}
      <div className="hero-frame" ref={wrapRef} data-orbit={state.speed || 0.03} data-spread={state.spread ?? 0.045}>
        <HeroPoster seed={state.seed} />
        <canvas
          ref={canvasRef}
          className="hero-art"
          data-testid="hero-canvas"
          tabIndex={0}
          aria-label="Live sketch. Drag to draw a line."
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            document.documentElement.dataset.drawing = "1";
            stroke.current = [localPoint(event)];
            setStatus("drawing");
            onInteract?.();
          }}
          onPointerMove={(event) => {
            if (stroke.current.length === 0 || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
            stroke.current.push(localPoint(event));
          }}
          onPointerUp={(event) => {
            document.documentElement.dataset.drawing = "0";
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            if (stroke.current.length < 2) {
              stroke.current = [];
              return;
            }
            commit(stroke.current);
          }}
        />
      </div>
      {caption}
      <p className="hero-readout" data-testid="hero-readout">
        <span>seed {swarmSeed}</span>
        <span>edition open</span>
        <span>pts {particles.current.length || (size.w < 720 ? 500 : 1200)}</span>
        <span>fps {reduced ? "—" : fps}</span>
        <span>state: {reduced && status === "orbiting" ? "paused" : status}</span>
      </p>
      <KeyHintLine />
      <p className="hero-hint">{line.length ? "the line stays. points flow along it." : ""}</p>
    </div>
  );
}
