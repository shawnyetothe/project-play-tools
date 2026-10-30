/** Canvas port of traits.py art(). Same PRNG draw order, same fit rule. */

import { PyRandom } from "./py-random";
import { INKS, palette, traits, type Traits } from "./traits";

const DENS = { sparse: 95, medium: 60, dense: 38 } as const;
const DOT = { fine: 0.7, medium: 1, coarse: 1.45 } as const;

export type CircleOp = {
  x: number;
  y: number;
  r: number;
  fill?: string;
  stroke?: string;
  opacity?: number;
  width?: number;
  dash?: [number, number];
};

export type LineOp = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
  width: number;
};

export type PieceModel = {
  w: number;
  h: number;
  traits: Traits;
  circles: CircleOp[];
  lines: LineOp[];
};

function pymod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

function inkOf(q: PyRandom, pal: [string, number][]): string {
  let x = q.random() * pal.reduce((sum, item) => sum + item[1], 0);
  for (const [c, v] of pal) {
    x -= v;
    if (x < 0) return c;
  }
  return pal[0][0];
}

export function buildPiece(w: number, h: number, seed: number, orbit = 0.03, spreadPct = 4.5, showRare = true): PieceModel {
  const T = traits(seed);
  const q = new PyRandom(`pt-v2-pts-${seed}`);
  const sc = w / 342;
  const off = { centre: [0, 0], left: [-0.08, 0], right: [0.08, 0], high: [0, -0.06] }[T.offset];
  const cx = w * (0.5 + off[0]);
  const cy = h * (0.46 + off[1]);
  const hz = h * 0.84;
  const ext =
    { shells: 1.05, spiral: 1.32, arcs: 1.38 }[T.form] *
    (1 + T.spread * 0.06) *
    (T.rare === "eclipse" ? 1.22 : 1);
  const R = Math.min(
    w * T.size,
    (Math.min(cx, w - cx) - w * 0.05) / (ext * 1.15),
    (cy - h * 0.05) / (ext * 0.95),
    (hz - h * 0.03 - cy) / (ext * 0.95),
  );
  const lw = Math.max(0.6, sc * (T.dot === "fine" ? 0.7 : T.dot === "medium" ? 1 : 1.3));
  const circles: CircleOp[] = [];
  const lines: LineOp[] = [];
  if (T.construction !== "none") {
    circles.push({
      x: cx,
      y: cy,
      r: R,
      stroke: "#0B0B0F",
      opacity: 0.22,
      width: lw,
      dash: [3 * sc, 5 * sc],
    });
  }
  if (T.construction === "full") {
    circles.push({ x: cx, y: cy, r: R * 1.5, stroke: "#0B0B0F", opacity: 0.12, width: lw });
    lines.push({ x1: 0, y1: hz, x2: w, y2: hz, opacity: 0.45, width: lw });
    for (let k = -8; k <= 8; k++) {
      lines.push({ x1: cx, y1: hz, x2: cx + k * w * 0.12, y2: h, opacity: 0.08, width: lw });
    }
    for (const a of [0, -1.047]) {
      lines.push({
        x1: cx,
        y1: cy,
        x2: cx + R * Math.cos(a),
        y2: cy + R * Math.sin(a),
        opacity: 0.28,
        width: lw,
      });
    }
  }
  const pal = palette(T, q);
  const gaps: number[] = [];
  for (let i = 0; i < T.gaps; i++) gaps.push(q.uniform(0, 6.283));
  const gw = 0.35 + orbit * 6;
  const gapScale = T.form === "arcs" ? 1 : 0.5;
  let n = Math.trunc((w * h) / (DENS[T.density] * sc * sc));
  if (n > 6000) n = 6000;
  const jit = R * T.spread * (spreadPct / 100) * 1.2;
  const centres: [number, number, number][] =
    T.rare === "eclipse"
      ? [
          [cx - R * 0.18, cy, 1],
          [cx + R * 0.22, cy - R * 0.05, 0.82],
        ]
      : [[cx, cy, 1]];
  const minRad = w < 200 ? 0.8 : 1;
  for (let i = 0; i < n; i++) {
    const [ccx, ccy, cs] = centres[i % centres.length];
    let ring: number;
    let a: number;
    if (T.form === "shells") {
      const k = Math.trunc(1 + T.tight);
      ring = R * cs * (0.45 + (0.55 * q.randrange(k + 1)) / Math.max(k, 1));
      a = q.uniform(0, 6.283);
    } else if (T.form === "spiral") {
      const arm = q.randrange(T.arms);
      const u = q.random();
      a = u * T.tight * 6.283 + (arm * 6.283) / T.arms;
      ring = R * cs * (0.25 + 1.05 * u);
    } else {
      ring = R * cs * q.choice([0.6, 1, 1, 1.35]);
      a = q.uniform(0, 6.283);
    }
    const gapped = gaps.some((g) => Math.abs(pymod(a - g + 3.1416, 6.2832) - 3.1416) < gw * gapScale);
    if (gapped) continue;
    ring += q.gauss(0, 1) * jit;
    const rad = Math.max(q.choice([0.9, 1.2, 1.6, 2.1]) * DOT[T.dot] * sc * 0.6, minRad);
    circles.push({
      x: ccx + ring * Math.cos(a) * 1.15,
      y: ccy + ring * Math.sin(a) * 0.95,
      r: rad,
      fill: inkOf(q, pal),
    });
  }
  if (T.rare === "accent-arc" && showRare) {
    const a0 = q.uniform(0, 6.283);
    const R2 = R * 1.18;
    const count = Math.trunc(n * 0.06);
    const rad = Math.max(1, 1.3 * sc * 0.7);
    for (let j = 0; j < count; j++) {
      const a = a0 + q.uniform(0, 1.6);
      const rr = R2 + q.gauss(0, 1) * R * 0.025;
      circles.push({
        x: cx + rr * Math.cos(a) * 1.15,
        y: cy + rr * Math.sin(a) * 0.95,
        r: rad,
        fill: INKS.vermilion,
      });
    }
  }
  return { w, h, traits: T, circles, lines };
}

export function stippleSignature(model: PieceModel): string {
  return model.circles
    .filter((circle) => circle.fill)
    .map((circle) => `${circle.x.toFixed(1)},${circle.y.toFixed(1)},${circle.r.toFixed(2)},${circle.fill}`)
    .join(";");
}

export function drawPiece(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
  orbit = 0.03,
  spreadPct = 4.5,
): PieceModel {
  const model = buildPiece(w, h, seed, orbit, spreadPct, true);
  paintPiece(ctx, model);
  return model;
}

export function paintPiece(ctx: CanvasRenderingContext2D, model: PieceModel) {
  const { w, h } = model;
  ctx.save();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#F5F5F2";
  ctx.fillRect(0, 0, w, h);
  for (const circle of model.circles) {
    if (!circle.stroke) continue;
    ctx.beginPath();
    ctx.globalAlpha = circle.opacity ?? 1;
    ctx.strokeStyle = circle.stroke;
    ctx.lineWidth = circle.width ?? 1;
    ctx.setLineDash(circle.dash ?? []);
    ctx.arc(circle.x, circle.y, Math.max(circle.r, 0), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  for (const line of model.lines) {
    ctx.beginPath();
    ctx.globalAlpha = line.opacity;
    ctx.strokeStyle = "#0B0B0F";
    ctx.lineWidth = line.width;
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (const circle of model.circles) {
    if (!circle.fill) continue;
    ctx.beginPath();
    ctx.fillStyle = circle.fill;
    ctx.arc(circle.x, circle.y, Math.max(circle.r, 0.4), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function pilLuma(r: number, g: number, b: number): number {
  return (r * 19595 + g * 38470 + b * 7471 + 0x8000) >> 16;
}

export type StampResult = { corner: string; busy: number; lum: number; width: number; height: number };

/** Stamp one line into the emptiest corner, or a 96px Snow strip when every corner is busy. */
export function stampPiece(canvas: HTMLCanvasElement, seed: number, fontFamily: string): StampResult {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no export context");
  const W = canvas.width;
  const scale = W / 2400;
  const margin = Math.trunc(64 * scale);
  const fontSize = Math.max(16, Math.trunc(28 * scale));
  const text = `playtools · seed 0x${seed.toString(16).padStart(4, "0")}`;
  ctx.font = `500 ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  const tw = ctx.measureText(text).width;
  const th = Math.trunc(fontSize * 1.2);
  const corners: [string, number, number][] = [
    ["br", W - margin - tw, W - margin - th],
    ["bl", margin, W - margin - th],
    ["tr", W - margin - tw, margin],
    ["tl", margin, margin],
  ];
  let best: { busy: number; name: string; x: number; y: number; lum: number } | null = null;
  for (const [name, x, y] of corners) {
    const x0 = Math.max(0, Math.floor(x) - 24);
    const y0 = Math.max(0, Math.floor(y) - 24);
    const x1 = Math.min(W, Math.ceil(x + tw) + 24);
    const y1 = Math.min(W, Math.ceil(y + th) + 24);
    const data = ctx.getImageData(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)).data;
    let sum = 0;
    let busy = 0;
    const count = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const lum = pilLuma(data[i], data[i + 1], data[i + 2]);
      sum += lum;
      if (Math.abs(lum - 245) > 18) busy++;
    }
    const ratio = busy / count;
    const lum = sum / count;
    if (!best || ratio < best.busy - 0.002) best = { busy: ratio, name, x, y, lum };
  }
  if (!best) throw new Error("no stamp corner");
  let { name, x, y, lum } = best;
  const { busy } = best;
  if (busy > 0.02) {
    const strip = Math.trunc(96 * scale);
    const next = document.createElement("canvas");
    next.width = W;
    next.height = W + strip;
    const nctx = next.getContext("2d");
    if (!nctx) throw new Error("no strip context");
    nctx.fillStyle = "#F5F5F2";
    nctx.fillRect(0, 0, next.width, next.height);
    nctx.drawImage(canvas, 0, 0);
    canvas.width = next.width;
    canvas.height = next.height;
    ctx.drawImage(next, 0, 0);
    x = W - margin - tw;
    y = W + strip / 2 - th / 2;
    lum = 245;
    name = "strip";
    ctx.font = `500 ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = lum > 140 ? "#0B0B0F" : "#F5F5F2";
  ctx.fillText(text, x, y);
  return { corner: name, busy, lum, width: canvas.width, height: canvas.height };
}
