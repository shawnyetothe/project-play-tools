export type Door = "message" | "medium" | "maker";

export type Knobs = {
  walk: number;
  noise: number;
  grid: number;
  count: number;
  rd: number;
  tile: number;
};

export type PieceState = {
  seed: string;
  door: Door | "";
  phrase: string;
  tool: number;
  knobs: Knobs;
  locked: boolean;
};

export const SEED_KEY = "playtools-seed";
export const DEFAULT_SEED = "c19a4e";

export const FEATURED = [
  { id: "p5", name: "p5.js", plain: "Draw in the browser" },
  { id: "glsl", name: "GLSL", plain: "Color every pixel" },
  { id: "tonejs", name: "Tone.js", plain: "Make notes in the browser" },
  { id: "plotter", name: "Pen plotter", plain: "Draw with a pen machine" },
  { id: "svg", name: "SVG", plain: "Make a vector file" },
  { id: "clock", name: "Time", plain: "Let the hour in" },
] as const;

export function normalizeSeed(value: string | null | undefined): string | null {
  if (!value) return null;
  const hex = value.trim().toLowerCase();
  return /^[0-9a-f]{6}$/.test(hex) ? hex : null;
}

export function hashSeed(parts: string[]): string {
  let h = 2166136261;
  const text = parts.join("|");
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 6);
}

export function randomSeed(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] % 0xffffff).toString(16).padStart(6, "0");
}

export function seedUint(seed: string): number {
  return parseInt(normalizeSeed(seed) || DEFAULT_SEED, 16);
}

export function knobsFromSeed(seed: string): Knobs {
  const n = seedUint(seed);
  return {
    walk: 8 + (n % 18),
    noise: 18 + ((n >> 5) % 46),
    grid: 8 + ((n >> 9) % 10),
    count: 40 + ((n >> 13) % 60),
    rd: (n >> 3) % 101,
    tile: (n >> 7) % 101,
  };
}

export function clampKnob(key: keyof Knobs, value: number): number {
  const ranges: Record<keyof Knobs, [number, number]> = {
    walk: [4, 40],
    noise: [5, 90],
    grid: [6, 22],
    count: [12, 140],
    rd: [0, 100],
    tile: [0, 100],
  };
  const [min, max] = ranges[key];
  if (Number.isNaN(value)) return knobsFromSeed(DEFAULT_SEED)[key];
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function drawSalt(seed: string, door: string, phrase: string, tool: number): number {
  return seedUint(hashSeed([seed, door || "open", phrase.trim().toLowerCase(), String(tool)]));
}

export function pieceSearch(state: PieceState): string {
  const params = new URLSearchParams();
  params.set("seed", state.seed);
  if (state.door) params.set("door", state.door);
  params.set("tool", String(state.tool + 1));
  if (state.phrase.trim()) params.set("make", state.phrase.trim());
  params.set("walk", String(state.knobs.walk));
  params.set("noise", String(state.knobs.noise));
  params.set("grid", String(state.knobs.grid));
  params.set("count", String(state.knobs.count));
  params.set("rd", String(state.knobs.rd));
  params.set("tile", String(state.knobs.tile));
  return params.toString();
}

export function piecePath(state: PieceState): string {
  return `/lab/composed/?${pieceSearch(state)}`;
}

function num(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key);
  if (raw == null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function readPiece(search: string): PieceState | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const seed = normalizeSeed(params.get("seed"));
  if (!seed) return null;
  const doorRaw = params.get("door") || "";
  const door: Door | "" = doorRaw === "message" || doorRaw === "medium" || doorRaw === "maker" ? doorRaw : "";
  const toolRaw = Number(params.get("tool"));
  const tool = Number.isFinite(toolRaw) ? Math.min(6, Math.max(1, Math.round(toolRaw))) - 1 : 0;
  const base = knobsFromSeed(seed);
  const knobs: Knobs = { ...base };
  (Object.keys(base) as (keyof Knobs)[]).forEach((key) => {
    const value = num(params, key);
    if (value != null) knobs[key] = clampKnob(key, value);
  });
  return {
    seed,
    door,
    phrase: (params.get("make") || "").slice(0, 180),
    tool,
    knobs,
    locked: true,
  };
}

export function readStoredPiece(): PieceState | null {
  try {
    const raw = localStorage.getItem(SEED_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<PieceState>;
    const seed = normalizeSeed(data.seed);
    if (!seed) return null;
    const door = data.door === "message" || data.door === "medium" || data.door === "maker" ? data.door : "";
    const tool = typeof data.tool === "number" ? Math.min(5, Math.max(0, data.tool)) : 0;
    const knobs = knobsFromSeed(seed);
    if (data.knobs) {
      (Object.keys(knobs) as (keyof Knobs)[]).forEach((key) => {
        const value = data.knobs?.[key];
        if (typeof value === "number") knobs[key] = clampKnob(key, value);
      });
    }
    return {
      seed,
      door,
      phrase: typeof data.phrase === "string" ? data.phrase.slice(0, 180) : "",
      tool,
      knobs,
      locked: true,
    };
  } catch {
    return null;
  }
}

export function writeStoredPiece(state: PieceState) {
  try {
    localStorage.setItem(
      SEED_KEY,
      JSON.stringify({
        seed: state.seed,
        door: state.door,
        phrase: state.phrase,
        tool: state.tool,
        knobs: state.knobs,
      }),
    );
  } catch {
    /* private mode */
  }
}

export function defaultPiece(): PieceState {
  return {
    seed: DEFAULT_SEED,
    door: "",
    phrase: "",
    tool: 0,
    knobs: knobsFromSeed(DEFAULT_SEED),
    locked: false,
  };
}
