/** Route table for /sitemap, /llms.txt, and /tools.json. Dynamic slugs are expanded on the sitemap page. */

export type RouteRow = {
  path: string;
  note: string;
  params: string[];
};

export const routes: RouteRow[] = [
  { path: "/", note: "Home. Hero, three lineages, a generate preview.", params: ["seed", "rule", "palette", "var", "door", "pick", "n"] },
  { path: "/generate/", note: "Rule, variance, and palette, then edition and curation.", params: ["seed", "rule", "palette", "var", "n"] },
  { path: "/examples/", note: "Example list with type filters.", params: ["door", "pick"] },
  { path: "/examples/{slug}/", note: "One example. Use this rule loads it into the tray.", params: ["seed", "rule"] },
  { path: "/learn/", note: "Links grouped by maker type.", params: [] },
  { path: "/start/", note: "Start here.", params: [] },
  { path: "/about/", note: "About this guide.", params: [] },
  { path: "/abx/", note: "Publish path.", params: [] },
  { path: "/explore/", note: "Explore the data.", params: ["tool"] },
  { path: "/artists/", note: "Artist index. Each artist is /artists/{slug}/.", params: [] },
  { path: "/artists/{slug}/", note: "One artist.", params: [] },
  { path: "/projects/{slug}/", note: "One project.", params: [] },
  { path: "/tools/", note: "Tool index.", params: ["group"] },
  { path: "/tools/{id}/", note: "One tool. Ids are in /tools.json.", params: [] },
  { path: "/recipes/", note: "Recipe index.", params: [] },
  { path: "/recipes/{slug}/", note: "One recipe.", params: [] },
  { path: "/make/{slug}/", note: "One way of making.", params: [] },
  { path: "/lab/", note: "Hero lab index.", params: [] },
  { path: "/lab/composed/", note: "The composed piece. Seed follows the page.", params: ["seed", "start", "door", "pick", "mix", "tool", "make", "walk", "noise", "grid", "count", "rd", "tile"] },
  { path: "/lab/hero-1/", note: "Sketch and prompt. Reads the composed seed params.", params: ["seed", "start", "door", "pick", "mix", "tool", "make", "walk", "noise", "grid", "count", "rd", "tile"] },
  { path: "/lab/hero-2/", note: "Lineage. Reads the composed seed params.", params: ["seed", "start", "door", "pick", "mix", "tool", "make", "walk", "noise", "grid", "count", "rd", "tile"] },
  { path: "/lab/hero-3/", note: "Play. Reads the composed seed params.", params: ["seed", "start", "door", "pick", "mix", "tool", "make", "walk", "noise", "grid", "count", "rd", "tile"] },
  { path: "/lab/hero-4/", note: "Scene. Reads the composed seed params.", params: ["seed", "start", "door", "pick", "mix", "tool", "make", "walk", "noise", "grid", "count", "rd", "tile"] },
  { path: "/lab/hero-5/", note: "Live input. Reads the composed seed params.", params: ["seed", "start", "door", "pick", "mix", "tool", "make", "walk", "noise", "grid", "count", "rd", "tile"] },
  { path: "/lab/generate/", note: "Edition from a seed.", params: ["seed", "mix", "mode", "edition", "balance", "output", "strikes"] },
  { path: "/lab/tools/", note: "Creative index.", params: [] },
  { path: "/lab/tools/{id}/", note: "One tool in the creative index.", params: [] },
  { path: "/lab/suggest/", note: "Suggest a tool, example, or fix.", params: ["suggest", "about"] },
  { path: "/sitemap/", note: "Short index of routes, parameters, and section pages.", params: [] },
  { path: "/sitemap/artists/", note: "Artist URLs by letter.", params: [] },
  { path: "/sitemap/artists/{letter}/", note: "Artist URLs for one letter. letter is a–z or other.", params: [] },
  { path: "/sitemap/projects/", note: "Project URLs by letter.", params: [] },
  { path: "/sitemap/projects/{letter}/", note: "Project URLs for one letter. A long letter continues at {letter}-2, {letter}-3. letter is a–z or other.", params: [] },
  { path: "/sitemap/tools/", note: "Every tool page and its creative-index page.", params: [] },
];

/** First letter of a name. A–Z, or "other" for digits and other scripts. */
export function sitemapLetter(name: string): string {
  const ch = name.trim().charAt(0).toUpperCase();
  return ch >= "A" && ch <= "Z" ? ch.toLowerCase() : "other";
}

export function sitemapLetterLabel(id: string): string {
  return id === "other" ? "Other" : id.toUpperCase();
}

export const urlParams = [
  { name: "seed", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/", "/lab/generate/"], values: "6 lowercase hex digits" },
  { name: "start", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/"], values: "message | medium | maker" },
  { name: "door", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/"], values: "alias of start" },
  { name: "pick", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/"], values: "medium: print, plotter, animation, sound, 3d. maker: new, designer, musician, artist" },
  { name: "mix", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/", "/lab/generate/"], values: "two effect ids joined by +, for example flowfield+dither" },
  { name: "tool", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/"], values: "1 through 6. 1 p5.js, 2 GLSL, 3 Tone.js, 4 pen plotter, 5 SVG, 6 time" },
  { name: "make", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/"], values: "visitor phrase, up to 180 characters" },
  { name: "walk", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/"], values: "lineage knob, number" },
  { name: "noise", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/"], values: "lineage knob, number" },
  { name: "grid", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/"], values: "lineage knob, number" },
  { name: "count", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/"], values: "lineage knob, number" },
  { name: "rd", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/"], values: "lineage knob, number" },
  { name: "tile", routes: ["/lab/composed/", "/lab/hero-1/", "/lab/hero-2/", "/lab/hero-3/", "/lab/hero-4/", "/lab/hero-5/"], values: "lineage knob, number" },
  { name: "mode", routes: ["/lab/generate/"], values: "long-form | curated" },
  { name: "edition", routes: ["/lab/generate/"], values: "integer from 1 to 10000" },
  { name: "balance", routes: ["/lab/generate/"], values: "0 to 100. 0 is rules, 100 is variance" },
  { name: "output", routes: ["/lab/generate/"], values: "one | sheet" },
  { name: "strikes", routes: ["/lab/generate/"], values: "comma-separated frame indexes" },
  { name: "group", routes: ["/tools/"], values: "sound | image | plot | 3d | textile | hardware | agents" },
  { name: "tool", routes: ["/explore/"], values: "all, or a tool id from /tools.json" },
  { name: "suggest", routes: ["/lab/suggest/"], values: "tool | example | fix | claim | removal" },
  { name: "about", routes: ["/lab/suggest/"], values: "artist, tool, or page this suggestion is about" },
] as const;
