/** Deterministic edition math for /lab/generate. Original sketches only. */

export const EDITION_MIN = 1;
export const EDITION_MAX = 10000;
export const LIVE_CAP = 64;

export const MARKERS = [
  { n: 1, label: "1 of 1", href: "", note: "A single output." },
  {
    n: 999,
    label: "Fidenza 999",
    href: "https://www.artblocks.io/collections/curated/projects/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/78",
    note: "Maximum edition. Art Blocks: fixed edition of 999.",
  },
  {
    n: 1000,
    label: "Ringers · Meridian 1,000",
    href: "https://www.artblocks.io/collections/curated/projects/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/13",
    note: "Maximum edition. Ringers and Meridian are each a fixed edition of 1,000.",
  },
  {
    n: 10000,
    label: "Chromie Squiggle 10,000",
    href: "https://www.artblocks.io/collections/curated/projects/0x059edd72cd353df5106d2b9cc5ab83a52287ac3a/0",
    note: "Maximum edition, the cap. Art Blocks: fixed edition of 10,000.",
  },
] as const;

/** Library counts from the 2026-10-25 19:40 ET Art Blocks pull. Not effect-combination counts. */
export const PULL_DATA = {
  source: "PlayTools Art Blocks pull, 2026-10-25 19:40 ET",
  url: "https://data.artblocks.io/v1/graphql",
  series: [
    { name: "p5.js", count: 842 },
    { name: "shaders", count: 394 },
    { name: "three.js", count: 84 },
    { name: "Tone.js", count: 17 },
  ],
};

export type Mode = "long-form" | "curated";
export type OutputMode = "one" | "sheet";

export type SourceId = "rng" | "time" | "color" | "movement" | "sound" | "data" | "sensor";

export type SourceState = { on: boolean; weight: number };

export type Rule = { id: string; text: string; fromCuration: boolean; maxDensity?: number };

export type Token = {
  index: number;
  frame: string;
  density: number;
  trait: string;
  hue: number;
};

export function hash32(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function unit(seed: number): number {
  const n = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return n / 4294967296;
}

export function logPosition(n: number): number {
  const clamped = Math.min(EDITION_MAX, Math.max(EDITION_MIN, n));
  return Math.log10(clamped) / 4;
}

export function editionFromPosition(p: number): number {
  const n = Math.round(Math.pow(10, Math.min(1, Math.max(0, p)) * 4));
  return Math.min(EDITION_MAX, Math.max(EDITION_MIN, n));
}

export function stepEdition(n: number, direction: 1 | -1, decade: boolean): number {
  if (decade) {
    const next = direction > 0 ? n * 10 : n / 10;
    return Math.min(EDITION_MAX, Math.max(EDITION_MIN, Math.round(next)));
  }
  const pos = logPosition(n);
  const next = editionFromPosition(pos + direction * 0.01);
  if (next === n) return Math.min(EDITION_MAX, Math.max(EDITION_MIN, n + direction));
  return next;
}

export function bandFor(balance: number): { lo: number; hi: number } {
  const loosen = Math.min(1, Math.max(0, balance / 100));
  const half = 0.06 + loosen * 0.42;
  const mid = 0.44;
  return {
    lo: Math.round(Math.max(0, mid - half) * 100) / 100,
    hi: Math.round(Math.min(1, mid + half) * 100) / 100,
  };
}

export function makeToken(seed: string, index: number, balance: number, salt: string): Token {
  const base = hash32(`${seed}|${salt}|${index}`);
  const raw = unit(base);
  const { lo, hi } = bandFor(balance);
  const density = Math.round((lo + raw * (hi - lo)) * 1000) / 1000;
  const traits = ["tight", "woven", "open", "rare"];
  const trait = traits[Math.floor(unit(base ^ 0x9e3779b9) * traits.length)];
  const hue = Math.floor(unit(base ^ 0x85ebca6b) * 360);
  return { index, frame: String(index + 1).padStart(3, "0"), density, trait, hue };
}

/** Six distinct constraint positions, tight to loose, in a window that follows the slider. */
export function proofBalances(balance: number): number[] {
  const current = Math.min(100, Math.max(0, Math.round(balance)));
  const start = Math.max(0, Math.min(50, current - 25));
  return Array.from({ length: 6 }, (_, i) => start + i * 10);
}

/** A window of the edition. Indexes are positions in the full edition, so strikes survive paging. */
export function sampleIndexes(edition: number, offset = 0, cap = LIVE_CAP): number[] {
  const count = Math.min(cap, Math.max(0, edition));
  if (count === 0) return [];
  const start = ((offset % edition) + edition) % edition;
  if (edition <= cap) return Array.from({ length: edition }, (_, i) => i);
  return Array.from({ length: count }, (_, i) => (start + i) % edition);
}

export function histogram(edition: number, balance: number): { trait: string; count: number }[] {
  const loosen = balance / 100;
  const weights = [0.46 - loosen * 0.2, 0.28, 0.18 + loosen * 0.12, 0.08 + loosen * 0.08];
  const sum = weights.reduce((a, b) => a + b, 0);
  const names = ["tight", "woven", "open", "rare"];
  return names.map((trait, i) => ({ trait, count: Math.round((weights[i] / sum) * edition) }));
}

export function drawToken(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  token: Token,
  palette: string[],
) {
  ctx.fillStyle = "#F5F5F2";
  ctx.fillRect(0, 0, w, h);
  const ink = palette[0] || "#0B0B0F";
  const accent = palette[1 + (token.index % Math.max(1, palette.length - 1))] || `hsl(${token.hue} 42% 42%)`;
  ctx.strokeStyle = ink;
  ctx.fillStyle = accent;
  ctx.lineWidth = 1.2;
  const lines = 6 + Math.floor(token.density * 10);
  for (let i = 0; i < lines; i++) {
    const y = ((i + 0.5) / lines) * h;
    ctx.beginPath();
    ctx.moveTo(4, y);
    const amp = 4 + token.density * h * 0.18;
    ctx.bezierCurveTo(w * 0.3, y - amp, w * 0.7, y + amp, w - 4, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(w * (0.3 + token.density * 0.4), h * 0.5, 3 + token.density * 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export type Manifest = {
  seed: string;
  mix: string;
  mode: Mode;
  output: OutputMode;
  edition: number;
  balance: number;
  band: { lo: number; hi: number };
  sources: Record<string, { on: boolean; weight: number; value: string }>;
  rules: Rule[];
  strikes: number[];
  showing: number;
  /** The full edition size. `showing` is only the live sample. */
  sample: { offset: number; indexes: number[] };
};

export function parseGenerateSearch(search: string): {
  seed: string;
  mix: string;
  mode: Mode;
  edition: number;
  balance: number;
  output: OutputMode;
} {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const seed = /^[0-9a-f]{6}$/i.test(params.get("seed") || "") ? (params.get("seed") || "").toLowerCase() : "c19a4e";
  const mixRaw = (params.get("mix") || "").toLowerCase();
  const mix = /^[a-z0-9]+\+[a-z0-9]+$/.test(mixRaw) ? mixRaw : "";
  const mode = params.get("mode") === "curated" ? "curated" : "long-form";
  const edition = editionFromPosition(logPosition(Number(params.get("edition")) || 256));
  const balance = Math.min(100, Math.max(0, Number(params.get("balance")) || 42));
  const output = params.get("output") === "one" ? "one" : "sheet";
  return { seed, mix, mode, edition, balance, output };
}
