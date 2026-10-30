/** Exact port of the Generate v1 trait table (traits.py). Draw order matches CPython. */

import { PyRandom, pyRound } from "./py-random";

export const INKS = {
  navy: "#1F3A5F",
  sky: "#8FB8DE",
  vermilion: "#E4572E",
  ink: "#0B0B0F",
} as const;

export type InkName = keyof typeof INKS;
export type Form = "shells" | "spiral" | "arcs";
export type Mix = "solo" | "duo" | "full";
export type Density = "sparse" | "medium" | "dense";
export type Dot = "fine" | "medium" | "coarse";
export type Construction = "full" | "circle" | "none";
export type Offset = "centre" | "left" | "right" | "high";
export type Rare = "accent-arc" | "eclipse" | "none";

export type Traits = {
  form: Form;
  arms: number;
  tight: number;
  gaps: number;
  dominant: InkName;
  mix: Mix;
  density: Density;
  dot: Dot;
  construction: Construction;
  offset: Offset;
  size: number;
  spread: number;
  rare: Rare;
  _q: number;
};

function wpick<T extends string | number>(q: PyRandom, items: readonly (readonly [T, number])[]): T {
  const t = items.reduce((sum, item) => sum + item[1], 0);
  let x = q.random() * t;
  for (const [v, w] of items) {
    x -= w;
    if (x < 0) return v;
  }
  return items[items.length - 1][0];
}

export function traits(seed: number): Traits {
  const q = new PyRandom(`pt-v2-${seed}`);
  const T = {} as Traits;
  T.form = wpick(q, [
    ["shells", 0.38],
    ["spiral", 0.37],
    ["arcs", 0.25],
  ] as const);
  T.arms = T.form === "spiral" ? wpick(q, [[1, 0.3], [2, 0.35], [3, 0.25], [4, 0.1]] as const) : 0;
  T.tight = pyRound(q.uniform(0.8, 2.2), 2);
  T.gaps = wpick(q, [[0, 0.35], [1, 0.35], [2, 0.2], [3, 0.1]] as const);
  T.dominant = wpick(q, [
    ["navy", 0.4],
    ["ink", 0.25],
    ["vermilion", 0.15],
    ["sky", 0.2],
  ] as const);
  T.mix = wpick(q, [
    ["solo", 0.2],
    ["duo", 0.45],
    ["full", 0.35],
  ] as const);
  T.density = wpick(q, [
    ["sparse", 0.2],
    ["medium", 0.5],
    ["dense", 0.3],
  ] as const);
  T.dot = wpick(q, [
    ["fine", 0.3],
    ["medium", 0.45],
    ["coarse", 0.25],
  ] as const);
  T.construction = wpick(q, [
    ["full", 0.45],
    ["circle", 0.35],
    ["none", 0.2],
  ] as const);
  T.offset = wpick(q, [
    ["centre", 0.5],
    ["left", 0.15],
    ["right", 0.15],
    ["high", 0.2],
  ] as const);
  T.size = pyRound(q.uniform(0.24, 0.32), 3);
  T.spread = pyRound(q.uniform(0.6, 1.6), 2);
  const r = q.random();
  T.rare = r < 0.06 ? "accent-arc" : r < 0.1 ? "eclipse" : "none";
  if (T.dominant === "sky" && T.mix === "solo") T.mix = "duo";
  if (T.density === "sparse" && T.dot === "fine") T.dot = "medium";
  if (T.rare === "accent-arc" && T.dominant === "vermilion") T.dominant = "navy";
  if (T.dominant === "vermilion" && T.mix === "solo") T.mix = "duo";
  if (T.dominant === "sky" && T.density === "sparse") T.density = "medium";
  if (T.form === "spiral" && T.arms >= 3 && T.density === "sparse") T.density = "medium";
  if (T.mix === "full" && T.dot === "fine") T.dot = "medium";
  if (T.form === "spiral" && T.gaps === 3) T.gaps = 2;
  if (T.form === "shells" && T.gaps >= 2) T.gaps = 1;
  if (T.form === "spiral" && T.arms === 4) T.tight = Math.max(T.tight, 1.5);
  T._q = q.random();
  return T;
}

const DARK = new Set<InkName>(["navy", "ink"]);

export function palette(T: Traits, q: PyRandom): [string, number][] {
  const d = T.dominant;
  const others = (Object.keys(INKS) as InkName[]).filter((k) => k !== d);
  let w: Partial<Record<InkName, number>>;
  if (T.mix === "solo") w = { [d]: 1 };
  else if (T.mix === "duo") {
    const sec = others.filter((o) => DARK.has(o) !== DARK.has(d));
    const pool = sec.length ? sec : others;
    const s = q.choice(pool);
    w = { [d]: 0.72, [s]: 0.28 };
  } else {
    w = { [d]: 0.55 };
    for (const o of others) w[o] = 0.15;
  }
  if (T.rare === "accent-arc") delete w.vermilion;
  return (Object.entries(w) as [InkName, number][]).map(([k, v]) => [INKS[k], v]);
}

export function traitLabel(seed: number): { line: string; form: string } {
  const T = traits(seed);
  const form = T.form + (T.arms ? `×${T.arms}` : "");
  const line =
    `${T.dominant}/${T.mix} · ${T.density.slice(0, 3)} · ${T.dot.slice(0, 3)}` +
    (T.rare !== "none" ? ` · ★${T.rare}` : "");
  return { line, form };
}

/** Sky + full mix reads washed out. Dim it and don't offer it as the default pick. */
export function isDim(T: Traits): boolean {
  return T.dominant === "sky" && T.mix === "full";
}

/** Full mix + dense + a gap reads busy at tile size. Kept on desktop, skipped in the phone nine. */
export function isBusy(T: Traits): boolean {
  return T.mix === "full" && T.density === "dense" && T.gaps >= 1;
}

export function tileSeed(g: number, index: number): number {
  return Number((BigInt(g) * 2654435761n + BigInt(index) * 40503n) & 0xffffn);
}

export function gridSeeds(g: number, count = 16): number[] {
  return Array.from({ length: count }, (_, index) => tileSeed(g, index));
}

/** The 48 seeds on seeds-sheet-48-v2.png. */
export function sheetSeeds(): number[] {
  const out: number[] = [];
  for (let i = 0; i < 48; i++) out.push((0x5eed * 7919 + i * 104729) & 0xffff);
  return out;
}

export function phoneSeeds(seeds: number[]): number[] {
  const calm: number[] = [];
  const busy: number[] = [];
  for (const seed of seeds) {
    if (isBusy(traits(seed))) busy.push(seed);
    else calm.push(seed);
  }
  const picked = calm.slice(0, 9);
  for (const seed of busy) {
    if (picked.length >= 9) break;
    picked.push(seed);
  }
  return picked.slice(0, 9);
}
