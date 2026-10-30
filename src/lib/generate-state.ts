/** Query-string state for /generate. Favorites never go in the URL. */

export const FAV_KEY = "pt.fav.v1";
export const GRID_KEY = "pt.grid.v1";
export const DEFAULT_G = 0x91c0;
export const DEFAULT_R = 0.03;
export const DEFAULT_SP = 4.5;

const HEX = /^[0-9a-fA-F]{1,4}$/;

export type Fav = { s: string; r: number; sp: number; v: number };

export type GenView = {
  kind: "grid" | "piece";
  g: number;
  s: number;
  r: number;
  sp: number;
};

export function hex4(value: number): string {
  return (value & 0xffff).toString(16).padStart(4, "0");
}

export function parseHex4(value: string | null | undefined): number | null {
  if (!value || !HEX.test(value)) return null;
  return Number.parseInt(value, 16) & 0xffff;
}

export function clampR(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_R;
  const steps = Math.round((value - 0.005) / 0.005);
  const next = 0.005 + steps * 0.005;
  return Math.min(0.12, Math.max(0.005, Math.round(next * 1000) / 1000));
}

export function clampSp(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SP;
  const steps = Math.round((value - 0.5) / 0.1);
  const next = 0.5 + steps * 0.1;
  return Math.min(15, Math.max(0.5, Math.round(next * 10) / 10));
}

export function formatR(value: number): string {
  const milli = Math.round(clampR(value) * 1000);
  return (milli / 1000).toFixed(milli % 10 === 0 ? 2 : 3);
}

export function formatSp(value: number): string {
  return clampSp(value).toFixed(1);
}

export function gridQuery(g: number, r: number, sp: number): string {
  return `g=${hex4(g)}&r=${formatR(r)}&sp=${formatSp(sp)}&v=1`;
}

export function pieceQuery(s: number, r: number, sp: number): string {
  return `s=${hex4(s)}&r=${formatR(r)}&sp=${formatSp(sp)}&v=1`;
}

export function gridPath(g: number, r: number, sp: number): string {
  return `/generate/?${gridQuery(g, r, sp)}`;
}

export function piecePath(s: number, r: number, sp: number): string {
  return `/generate/?${pieceQuery(s, r, sp)}`;
}

export function readGenerate(search: string): { view: GenView; hasG: boolean; dirty: boolean; path: string } {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const sText = params.get("s");
  const gText = params.get("g");
  const hasS = sText != null && sText !== "";
  const hasG = gText != null && gText !== "";
  const s = parseHex4(sText);
  const g = parseHex4(gText);
  const kind = hasS ? "piece" : "grid";
  const rText = params.get("r");
  const spText = params.get("sp");
  const r = clampR(rText == null || rText === "" ? DEFAULT_R : Number(rText));
  const sp = clampSp(spText == null || spText === "" ? DEFAULT_SP : Number(spText));
  const view: GenView = {
    kind,
    g: g ?? DEFAULT_G,
    s: s ?? 0x9cd3,
    r,
    sp,
  };
  const path = kind === "piece" ? piecePath(view.s, view.r, view.sp) : gridPath(view.g, view.r, view.sp);
  const canonical = path.slice(path.indexOf("?") + 1);
  const dirty = raw !== canonical || (params.get("v") != null && params.get("v") !== "1") || (hasS && s == null) || (hasG && g == null);
  return { view, hasG, dirty: dirty || raw !== canonical, path };
}

export function readFavs(): Fav[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter((item): item is Fav => {
      if (!item || typeof item !== "object") return false;
      const fav = item as Fav;
      return typeof fav.s === "string" && HEX.test(fav.s);
    });
  } catch {
    return [];
  }
}

export function writeFavs(favs: Fav[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

export function favOf(seed: number, r: number, sp: number): Fav {
  return { s: hex4(seed), r: clampR(r), sp: clampSp(sp), v: 1 };
}

export function isFav(favs: Fav[], seed: number): boolean {
  const key = hex4(seed);
  return favs.some((item) => item.s === key);
}

export function toggleFav(favs: Fav[], seed: number, r: number, sp: number): Fav[] {
  const key = hex4(seed);
  if (favs.some((item) => item.s === key)) return favs.filter((item) => item.s !== key);
  return [...favs, favOf(seed, r, sp)];
}
