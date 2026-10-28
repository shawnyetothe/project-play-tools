import { valueNoise } from "./seed-draw";

const PAPER = "#f6f1e8";
const INK = "#1c1915";

function paper(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
}

function rnd(seed: number) {
  let s = seed % 2147483646 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** One original sketch. Pass t = null for the still frame. */
export function drawCine(ctx: CanvasRenderingContext2D, w: number, h: number, kind: string, seed: number, t: number | null) {
  paper(ctx, w, h);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  const move = t == null ? 0 : (t / 1000) % 1;
  const still = t == null;
  if (kind === "medium" || kind === "print" || kind === "plotter") drawField(ctx, w, h, seed, still ? 0.2 : move);
  else if (kind === "maker" || kind === "new" || kind === "designer" || kind === "artist") drawMarks(ctx, w, h, seed, still ? 0.15 : move);
  else if (kind === "sound" || kind === "musician") drawBars(ctx, w, h, seed, still ? 0.4 : move);
  else if (kind === "animation" || kind === "3d") drawDrift(ctx, w, h, seed, still ? 0.3 : move);
  else drawLines(ctx, w, h, seed, still ? 0.25 : move);
}

function drawLines(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, move: number) {
  const rand = rnd(seed);
  for (let i = 0; i < 7; i++) {
    const x = 8 + rand() * (w - 16);
    const y = 10 + rand() * (h - 20);
    ctx.globalAlpha = i === 3 ? 0.35 + Math.abs(move - 0.5) : 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 18 + (i === 3 ? move * 10 : 0), y + (i === 3 ? Math.sin(move * Math.PI * 2) * 4 : 0));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawField(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, move: number) {
  for (let i = 0; i < 5; i++) {
    const y = ((i + 0.5) / 5) * h;
    ctx.beginPath();
    for (let x = 4; x <= w - 4; x += 6) {
      const n = valueNoise(x * 0.02, y * 0.02, seed);
      const yy = y + (n - 0.5) * 8;
      if (x === 4) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(8 + move * (w - 16), h * 0.5, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawMarks(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, move: number) {
  const rand = rnd(seed + 3);
  for (let i = 0; i < 6; i++) {
    const x = 10 + rand() * (w - 20);
    const y = 8 + rand() * (h - 16);
    ctx.globalAlpha = i === 2 ? 0.4 + move * 0.6 : 1;
    ctx.fillRect(x, y, 3, 8 + rand() * 6);
  }
  ctx.globalAlpha = 1;
}

function drawBars(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, move: number) {
  const rand = rnd(seed + 9);
  for (let i = 0; i < 6; i++) {
    const bh = 8 + rand() * (h * 0.45) + (i === 4 ? Math.sin(move * Math.PI * 2) * 6 : 0);
    ctx.fillRect(8 + i * ((w - 16) / 6), h - 8 - bh, 4, bh);
  }
}

function drawDrift(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, move: number) {
  const rand = rnd(seed + 4);
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(12 + rand() * (w - 24), 10 + rand() * (h - 20), 4 + rand() * 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(w * (0.2 + move * 0.6), h * 0.55, 3, 0, Math.PI * 2);
  ctx.fill();
}

export const EFFECTS = [
  { id: "flowfield", name: "flow field" },
  { id: "reaction", name: "reaction-diffusion" },
  { id: "perlin", name: "Perlin noise" },
  { id: "lsystem", name: "L-system" },
  { id: "voronoi", name: "Voronoi" },
  { id: "packing", name: "circle packing" },
  { id: "truchet", name: "truchet tiles" },
  { id: "dither", name: "dithering" },
  { id: "glitch", name: "glitch" },
  { id: "trails", name: "particle trails" },
  { id: "audio", name: "audio-reactive" },
  { id: "boids", name: "boids" },
] as const;

export type EffectId = (typeof EFFECTS)[number]["id"];

export const MIXES: [EffectId, EffectId][] = [
  ["flowfield", "dither"],
  ["boids", "audio"],
  ["truchet", "glitch"],
  ["voronoi", "trails"],
  ["perlin", "packing"],
  ["lsystem", "dither"],
  ["reaction", "flowfield"],
  ["packing", "truchet"],
];

export function effectName(id: string): string {
  return EFFECTS.find((item) => item.id === id)?.name ?? id;
}

export function mixLabel(mix: string): string {
  const [a, b] = mix.split("+");
  return `${effectName(a)} + ${effectName(b)}`;
}

function paintEffect(ctx: CanvasRenderingContext2D, w: number, h: number, id: string, seed: number, move: number) {
  if (id === "flowfield") drawField(ctx, w, h, seed, move);
  else if (id === "reaction") {
    const rand = rnd(seed);
    for (let i = 0; i < 8; i++) {
      ctx.globalAlpha = 0.35 + (i === 2 ? move * 0.4 : 0.2);
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 6 + rand() * 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (id === "perlin") {
    for (let y = 0; y < h; y += 5) {
      for (let x = 0; x < w; x += 5) {
        const n = valueNoise(x * 0.03, y * 0.03 + move, seed);
        if (n > 0.55) ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
  } else if (id === "lsystem") {
    ctx.beginPath();
    ctx.moveTo(w / 2, h - 4);
    ctx.lineTo(w / 2, h * 0.45);
    ctx.moveTo(w / 2, h * 0.6);
    ctx.lineTo(w * 0.3, h * 0.35);
    ctx.moveTo(w / 2, h * 0.6);
    ctx.lineTo(w * 0.7, h * 0.3 + move * 8);
    ctx.stroke();
  } else if (id === "voronoi") {
    const rand = rnd(seed);
    const pts = Array.from({ length: 5 }, () => [rand() * w, rand() * h] as const);
    pts.forEach(([x, y], i) => {
      ctx.beginPath();
      ctx.arc(x, y + (i === 0 ? Math.sin(move * Math.PI * 2) * 3 : 0), 2, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (id === "packing") {
    const rand = rnd(seed + 2);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 4 + rand() * 10 + (i === 1 ? move * 4 : 0), 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (id === "truchet") {
    const s = Math.max(8, w / 6);
    for (let j = 0; j < h / s; j++) {
      for (let i = 0; i < w / s; i++) {
        const flip = ((i * 3 + j + seed) % 2 === 0) !== (i === 1 && j === 1 && move > 0.5);
        ctx.beginPath();
        ctx.arc(i * s + (flip ? s : 0), j * s, s / 2, 0, Math.PI / 2);
        ctx.stroke();
      }
    }
  } else if (id === "dither") {
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        if ((x + y + (move > 0.5 ? 2 : 0)) % 8 === 0) ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
  } else if (id === "glitch") {
    ctx.fillRect(0, h * 0.2, w, 1);
    ctx.fillRect(0, h * 0.55, w, 1);
    ctx.globalAlpha = 0.8;
    ctx.fillRect(move * 12, h * 0.55, w, 3);
    ctx.globalAlpha = 1;
  } else if (id === "trails") {
    for (let i = 0; i < 5; i++) {
      const x = ((seed + i * 40) % 100) / 100 * w;
      ctx.globalAlpha = i === 0 ? 1 : 0.35;
      ctx.fillRect(i === 0 ? move * w : x, 8 + i * (h / 6), 3, 3);
    }
    ctx.globalAlpha = 1;
  } else if (id === "audio") drawBars(ctx, w, h, seed, move);
  else {
    const rand = rnd(seed + 6);
    for (let i = 0; i < 5; i++) {
      const x = rand() * w;
      const y = rand() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 8, y + (i === 1 ? Math.sin(move * Math.PI * 2) * 6 : 4));
      ctx.stroke();
    }
  }
}

export function drawMix(ctx: CanvasRenderingContext2D, w: number, h: number, mix: string, seed: number, t: number) {
  const [a, b] = mix.split("+");
  const move = (t / 1000) % 1;
  paper(ctx, w, h);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 1.25;
  ctx.lineCap = "round";
  paintEffect(ctx, w, h, a || "flowfield", seed, 0.2);
  ctx.save();
  ctx.globalAlpha = 0.55;
  paintEffect(ctx, w, h, b || "dither", seed + 17, move);
  ctx.restore();
}
