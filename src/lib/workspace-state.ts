/** Public piece state in the query. The drawn line lives in the hash, never on the server. */

export const STORAGE_KEY = "playtools-workspace";

export type Door = "" | "message" | "medium" | "maker";

export type PieceState = {
  seed: string;
  rule: string;
  palette: string;
  door: Door;
  pick: string;
  var: string;
  n: number;
  interacted: boolean;
};

export type LinePoint = { x: number; y: number };

export const DEFAULT_STATE: PieceState = {
  seed: "0x3f2a",
  rule: "orbit",
  palette: "snow",
  door: "",
  pick: "",
  var: "rng",
  n: 16,
  interacted: false,
};

const DOORS: Door[] = ["", "message", "medium", "maker"];

export function normalizeSeed(value: string | null | undefined): string {
  const raw = (value || "").toLowerCase().replace(/[^0-9a-f]/g, "");
  if (raw.length >= 6) return raw.slice(0, 6);
  return DEFAULT_STATE.seed;
}

export function readPublic(search: string): PieceState {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const door = params.get("door") || "";
  const rawN = params.get("n");
  const parsedN = rawN == null || rawN === "" ? DEFAULT_STATE.n : Number(rawN);
  return {
    seed: normalizeSeed(params.get("seed")),
    rule: (params.get("rule") || DEFAULT_STATE.rule).slice(0, 24),
    palette: (params.get("palette") || DEFAULT_STATE.palette).slice(0, 24),
    door: (DOORS.includes(door as Door) ? door : "") as Door,
    pick: (params.get("pick") || "").slice(0, 24),
    var: (params.get("var") || DEFAULT_STATE.var).slice(0, 24),
    n: Number.isFinite(parsedN) ? Math.min(10000, Math.max(1, Math.round(parsedN))) : DEFAULT_STATE.n,
    interacted: params.get("door") != null || params.get("rule") != null,
  };
}

export function writePublic(state: PieceState): string {
  const params = new URLSearchParams();
  if (state.seed) params.set("seed", state.seed);
  if (state.rule) params.set("rule", state.rule);
  if (state.palette) params.set("palette", state.palette);
  if (state.door) params.set("door", state.door);
  if (state.pick) params.set("pick", state.pick);
  if (state.var) params.set("var", state.var);
  if (state.n) params.set("n", String(state.n));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function encodeLine(points: LinePoint[]): string {
  const bytes = new Uint8Array(points.length * 2);
  points.forEach((point, index) => {
    bytes[index * 2] = Math.max(0, Math.min(255, Math.round(point.x * 255)));
    bytes[index * 2 + 1] = Math.max(0, Math.min(255, Math.round(point.y * 255)));
  });
  let text = "";
  bytes.forEach((value) => {
    text += String.fromCharCode(value);
  });
  return btoa(text).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function decodeLine(value: string): LinePoint[] {
  try {
    const padded = value.replaceAll("-", "+").replaceAll("_", "/");
    const bin = atob(padded);
    const points: LinePoint[] = [];
    for (let i = 0; i + 1 < bin.length; i += 2) {
      points.push({ x: bin.charCodeAt(i) / 255, y: bin.charCodeAt(i + 1) / 255 });
    }
    return points;
  } catch {
    return [];
  }
}

export function readHash(hash: string): LinePoint[] {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const raw = params.get("s");
  return raw ? decodeLine(raw) : [];
}

export function writeHash(points: LinePoint[]): string {
  if (!points.length) return "";
  return `#s=${encodeLine(points)}`;
}

export function withState(path: string, state: PieceState, hash = ""): string {
  const base = path.split("?")[0].split("#")[0];
  return `${base}${writePublic(state)}${hash}`;
}
