import type { Door, Knobs } from "./seed";

export type Burst = { x: number; y: number; born: number; hue: number };

const PAPER = "#f6f1e8";
const INK = "#1c1915";

export function rng(seed: number) {
  let s = seed % 2147483646;
  if (s < 1) s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hash2(ix: number, iy: number, seed: number) {
  let h = (seed + ix * 374761393 + iy * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function valueNoise(x: number, y: number, seed: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash2(x0, y0, seed);
  const b = hash2(x0 + 1, y0, seed);
  const c = hash2(x0, y0 + 1, seed);
  const d = hash2(x0 + 1, y0 + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

export function accent(seed: number) {
  return `hsl(${seed % 360} 42% 32%)`;
}

function paper(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
}

export function drawHero(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: {
    salt: number;
    tool: number;
    door: Door | "";
    t: number;
    pointer: { x: number; y: number };
    hour: number;
    bursts: Burst[];
    now: number;
    still: boolean;
  },
) {
  const { salt, tool, door, pointer, hour, still } = opts;
  const t = still ? 0 : opts.t;
  paper(ctx, w, h);
  ctx.save();
  if (door === "medium") ctx.translate(0, 0);
  const bias = door === "message" ? 0.15 : door === "maker" ? -0.2 : 0;
  const density = door === "medium" ? 1.35 : door === "maker" ? 0.85 : 1;
  if (tool === 1) drawBands(ctx, w, h, salt, t, pointer);
  else if (tool === 2) drawNotes(ctx, w, h, salt);
  else if (tool === 3) drawPen(ctx, w, h, salt, t, pointer, bias);
  else if (tool === 4) drawCurves(ctx, w, h, salt, t, pointer, density);
  else if (tool === 5) drawHour(ctx, w, h, salt, hour, pointer);
  else drawStrokes(ctx, w, h, salt, t, pointer, bias, density);
  for (const burst of opts.bursts) {
    const age = opts.still ? 0.35 : Math.min(1, (opts.now - burst.born) / 900);
    if (!opts.still && age >= 1) continue;
    const radius = opts.still ? Math.min(w, h) * 0.08 : 8 + age * Math.min(w, h) * 0.22;
    ctx.beginPath();
    ctx.strokeStyle = accent(burst.hue);
    ctx.globalAlpha = opts.still ? 0.85 : 1 - age;
    ctx.lineWidth = 1.5;
    ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawStrokes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  salt: number,
  t: number,
  pointer: { x: number; y: number },
  bias: number,
  density: number,
) {
  const rand = rng(salt);
  const count = Math.round(42 * density);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  for (let i = 0; i < count; i++) {
    const x = 28 + rand() * (w - 56);
    const y = 28 + rand() * (h - 56);
    const ang = rand() * Math.PI + bias + pointer.x * 0.8 + t * 0.15;
    const len = 18 + rand() * 54;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len * (0.45 + pointer.y * 0.4));
    ctx.stroke();
  }
}

function drawBands(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  salt: number,
  t: number,
  pointer: { x: number; y: number },
) {
  const hue = salt % 360;
  const step = 4;
  for (let y = 0; y < h; y += step) {
    const wave = 0.5 + 0.5 * Math.sin(y * 0.02 + t * 0.6 + pointer.x * 2 + (salt % 20));
    const light = 28 + wave * 46;
    ctx.fillStyle = `hsl(${hue} 38% ${light}%)`;
    ctx.fillRect(0, y, w, step);
  }
  ctx.globalAlpha = 0.35 + pointer.y * 0.25;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
  ctx.globalAlpha = 1;
}

function drawNotes(ctx: CanvasRenderingContext2D, w: number, h: number, salt: number) {
  const rand = rng(salt);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.25;
  const notes = 6;
  for (let i = 0; i < notes; i++) {
    const x = w * (0.16 + (i / notes) * 0.7);
    const amp = 20 + rand() * (h * 0.28);
    ctx.beginPath();
    ctx.moveTo(x, h * 0.62);
    ctx.lineTo(x, h * 0.62 - amp);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, h * 0.62 - amp, 7, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  salt: number,
  t: number,
  pointer: { x: number; y: number },
  bias: number,
) {
  const rand = rng(salt);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  let x = w * (0.15 + rand() * 0.1);
  let y = h * (0.2 + rand() * 0.2);
  ctx.beginPath();
  ctx.moveTo(x, y);
  const steps = 18;
  for (let i = 0; i < steps; i++) {
    const ang = valueNoise(i * 0.35, salt, salt) * Math.PI * 2 + bias + pointer.x + t * 0.05;
    x += Math.cos(ang) * (w / 14);
    y += Math.sin(ang) * (h / 16) * (0.6 + pointer.y);
    x = Math.max(24, Math.min(w - 24, x));
    y = Math.max(24, Math.min(h - 24, y));
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawCurves(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  salt: number,
  t: number,
  pointer: { x: number; y: number },
  density: number,
) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.15;
  const lines = Math.round(16 * density);
  for (let i = 0; i < lines; i++) {
    const y0 = ((i + 0.5) / lines) * h;
    ctx.beginPath();
    for (let x = 16; x <= w - 16; x += 8) {
      const n = valueNoise(x * 0.01, y0 * 0.01 + i, salt);
      const y = y0 + (n - 0.5) * 36 + Math.sin(x * 0.02 + t + pointer.x * 3) * (6 + pointer.y * 10);
      if (x === 16) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawHour(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  salt: number,
  hour: number,
  pointer: { x: number; y: number },
) {
  const rand = rng(salt);
  const cx = w * (0.5 + (pointer.x - 0.5) * 0.15);
  const cy = h * (0.55 + (pointer.y - 0.5) * 0.1);
  const radius = Math.min(w, h) * 0.32;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const mark = 8 + rand() * 10;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * (radius - mark), cy + Math.sin(ang) * (radius - mark));
    ctx.lineTo(cx + Math.cos(ang) * radius, cy + Math.sin(ang) * radius);
    ctx.stroke();
  }
  const hand = ((hour % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hand) * radius * 0.72, cy + Math.sin(hand) * radius * 0.72);
  ctx.stroke();
}

export function burstPoint(note: string, w: number, h: number, salt: number): { x: number; y: number; hue: number } {
  const name = note[0] || "C";
  const order = "CDEFGAB".indexOf(name);
  const slot = order < 0 ? 0 : order;
  const rand = rng(salt + slot * 17);
  return {
    x: w * (0.18 + (slot / 7) * 0.64 + (rand() - 0.5) * 0.06),
    y: h * (0.3 + rand() * 0.45),
    hue: salt,
  };
}

export type LineageId = "walk" | "noise" | "field" | "flow" | "rd" | "tile";

export function drawLineage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  id: LineageId,
  seed: number,
  knobs: Knobs,
) {
  paper(ctx, w, h);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  if (id === "walk") drawWalk(ctx, w, h, seed, knobs.walk);
  else if (id === "noise") drawNoiseField(ctx, w, h, seed, knobs.noise);
  else if (id === "field") drawVectors(ctx, w, h, seed, knobs);
  else if (id === "flow") drawFlow(ctx, w, h, seed, knobs);
  else if (id === "rd") drawRd(ctx, w, h, seed, knobs.rd);
  else drawTruchet(ctx, w, h, seed, knobs.tile);
}

function drawWalk(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, step: number) {
  const rand = rng(seed);
  let x = w / 2;
  let y = h / 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i < 80; i++) {
    const ang = rand() * Math.PI * 2;
    x = Math.max(8, Math.min(w - 8, x + Math.cos(ang) * step));
    y = Math.max(8, Math.min(h - 8, y + Math.sin(ang) * step));
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawNoiseField(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, scale: number) {
  const step = 6;
  const s = scale / 400;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const n = valueNoise(x * s, y * s, seed);
      if (n > 0.55) {
        ctx.globalAlpha = (n - 0.55) * 2.2;
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }
  ctx.globalAlpha = 1;
}

function fieldAngle(x: number, y: number, w: number, h: number, seed: number, knobs: Knobs) {
  const s = knobs.noise / 400;
  return valueNoise((x / w) * s * 40, (y / h) * s * 40, seed) * Math.PI * 2;
}

function drawVectors(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, knobs: Knobs) {
  const cols = knobs.grid;
  const rows = Math.max(4, Math.round(cols * (h / w)));
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = ((i + 0.5) / cols) * w;
      const y = ((j + 0.5) / rows) * h;
      const ang = fieldAngle(x, y, w, h, seed, knobs);
      const len = Math.min(w / cols, h / rows) * 0.55;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
  }
}

function traces(seed: number, knobs: Knobs, w: number, h: number) {
  const rand = rng(seed ^ 0x9e3779b9);
  const paths: { x: number; y: number }[][] = [];
  const n = Math.min(knobs.count, 140);
  for (let i = 0; i < n; i++) {
    let x = rand() * w;
    let y = rand() * h;
    const path = [{ x, y }];
    const steps = 24;
    for (let s = 0; s < steps; s++) {
      const ang = fieldAngle(x, y, w, h, seed, knobs);
      x += Math.cos(ang) * knobs.walk * 0.45;
      y += Math.sin(ang) * knobs.walk * 0.45;
      if (x < 0 || y < 0 || x > w || y > h) break;
      path.push({ x, y });
    }
    paths.push(path);
  }
  return paths;
}

function drawFlow(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, knobs: Knobs) {
  for (const path of traces(seed, knobs, w, h)) {
    ctx.beginPath();
    path.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
  }
}

export function rdRates(t: number) {
  const u = Math.min(1, Math.max(0, t / 100));
  const feed = 0.022 + u * 0.016;
  const kill = 0.049 + u * 0.016;
  return { feed, kill };
}

function drawRd(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, t: number) {
  const W = 72;
  const H = 48;
  const { feed, kill } = rdRates(t);
  let A = new Float32Array(W * H).fill(1);
  let B = new Float32Array(W * H);
  const rand = rng(seed);
  for (let k = 0; k < 6; k++) {
    const cx = 4 + Math.floor(rand() * (W - 8));
    const cy = 4 + Math.floor(rand() * (H - 8));
    for (let y = cy - 2; y <= cy + 2; y++) {
      for (let x = cx - 2; x <= cx + 2; x++) {
        const i = y * W + x;
        A[i] = 0;
        B[i] = 1;
      }
    }
  }
  let nextA = new Float32Array(W * H);
  let nextB = new Float32Array(W * H);
  const at = (arr: Float32Array, x: number, y: number) => arr[((y + H) % H) * W + ((x + W) % W)];
  for (let iter = 0; iter < 24; iter++) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const a = A[i];
        const b = B[i];
        const lapA = at(A, x - 1, y) + at(A, x + 1, y) + at(A, x, y - 1) + at(A, x, y + 1) - 4 * a;
        const lapB = at(B, x - 1, y) + at(B, x + 1, y) + at(B, x, y - 1) + at(B, x, y + 1) - 4 * b;
        const abb = a * b * b;
        nextA[i] = Math.min(1, Math.max(0, a + (lapA - abb + feed * (1 - a))));
        nextB[i] = Math.min(1, Math.max(0, b + (0.5 * lapB + abb - (kill + feed) * b)));
      }
    }
    const swapA = A;
    A = nextA;
    nextA = swapA;
    const swapB = B;
    B = nextB;
    nextB = swapB;
  }
  const cw = w / W;
  const ch = h / H;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = B[y * W + x];
      ctx.globalAlpha = Math.min(1, v * 1.4);
      ctx.fillRect(x * cw, y * ch, cw + 0.5, ch + 0.5);
    }
  }
  ctx.globalAlpha = 1;
}

function drawTruchet(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, probability: number) {
  const cols = 10;
  const size = w / cols;
  const rows = Math.ceil(h / size);
  const p = probability / 100;
  ctx.lineWidth = 1.3;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = i * size;
      const y = j * size;
      const flip = hash2(i, j, seed) < p;
      ctx.beginPath();
      if (flip) {
        ctx.arc(x, y, size / 2, 0, Math.PI / 2);
        ctx.moveTo(x + size, y + size / 2);
        ctx.arc(x + size, y + size, size / 2, Math.PI, Math.PI * 1.5);
      } else {
        ctx.arc(x + size, y, size / 2, Math.PI / 2, Math.PI);
        ctx.moveTo(x, y + size / 2);
        ctx.arc(x, y + size, size / 2, Math.PI * 1.5, Math.PI * 2);
      }
      ctx.stroke();
    }
  }
}

export function flowSvg(seed: number, knobs: Knobs): string {
  const w = 800;
  const h = 500;
  const paths = traces(seed, knobs, w, h)
    .map((path) => {
      const d = path
        .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(" ");
      return `<path d="${d}"/>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <desc>Plotter paths drawn from this visitor's PlayTools seed ${seed.toString(16)}. Original. Not an existing artwork.</desc>
  <rect width="100%" height="100%" fill="${PAPER}"/>
  <g fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${paths}</g>
</svg>`;
}

export function downloadSvg(filename: string, svg: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
