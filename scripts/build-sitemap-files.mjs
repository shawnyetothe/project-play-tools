import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { routes, sitemapLetter, sitemapLetterLabel, urlParams } from "../src/lib/site-map.ts";

const root = new URL("..", import.meta.url).pathname;
const generated = join(root, "src/generated");
const artists = JSON.parse(readFileSync(join(generated, "artists.json"), "utf8"));
const projects = JSON.parse(readFileSync(join(generated, "projects.json"), "utf8"));
const tools = JSON.parse(readFileSync(join(generated, "tools.json"), "utf8"));
const meta = JSON.parse(readFileSync(join(generated, "meta.json"), "utf8"));

function group(items) {
  const map = new Map();
  for (const item of items) {
    const id = sitemapLetter(item.name || "");
    const list = map.get(id) ?? [];
    list.push({ slug: item.slug, name: item.name, path: "" });
    map.set(id, list);
  }
  return [...map.entries()]
    .map(([id, list]) => {
      list.sort((a, b) => a.name.localeCompare(b.name, "en"));
      return { id, label: sitemapLetterLabel(id), count: list.length, items: list };
    })
    .sort((a, b) => (a.id === "other" ? 1 : b.id === "other" ? -1 : a.id.localeCompare(b.id)));
}

const PAGE_SIZE = 40;

function withPaths(section, prefix) {
  const pages = [];
  for (const letter of group(section)) {
    const items = letter.items.map((item) => ({
      ...item,
      path: `/${prefix === "artists" ? "artists" : "projects"}/${item.slug}/`,
    }));
    const parts = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    for (let part = 0; part < parts; part++) {
      const id = part === 0 ? letter.id : `${letter.id}-${part + 1}`;
      const slice = items.slice(part * PAGE_SIZE, (part + 1) * PAGE_SIZE);
      pages.push({
        id,
        label: parts === 1 ? letter.label : `${letter.label} ${part + 1}`,
        count: slice.length,
        page: `/sitemap/${prefix}/${id}/`,
        json: `/sitemap/${prefix}/${id}.json`,
        items: slice,
      });
    }
  }
  return pages;
}

const artistLetters = withPaths(artists, "artists");
const projectLetters = withPaths(projects, "projects");

function write(path, body) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
}

const publicDir = join(root, "public");
for (const letter of artistLetters) {
  write(join(publicDir, "sitemap/artists", `${letter.id}.json`), JSON.stringify({ letter: letter.id, path: letter.page, items: letter.items }));
}
for (const letter of projectLetters) {
  write(join(publicDir, "sitemap/projects", `${letter.id}.json`), JSON.stringify({ letter: letter.id, path: letter.page, items: letter.items }));
}

const index = {
  index: "/sitemap/",
  json: "/sitemap.json",
  xml: "/sitemap.xml",
  artists: "/sitemap/artists/",
  projects: "/sitemap/projects/",
  routes,
  urlParams,
  make: meta.paths.map((item) => ({ path: `/make/${item.slug}/`, plain: item.plain })),
  recipes: meta.recipes.map((item) => ({ path: `/recipes/${item.slug}/`, plain: item.plain })),
  tools: tools.map((item) => ({ id: item.id, path: `/tools/${item.id}/`, lab: `/lab/tools/${item.id}/`, plain: item.plain })),
  sections: {
    artists: artistLetters.map(({ id, label, count, page, json }) => ({ id, label, count, page, json })),
    projects: projectLetters.map(({ id, label, count, page, json }) => ({ id, label, count, page, json })),
  },
};
write(join(publicDir, "sitemap.json"), JSON.stringify(index));

function urlset(locs) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...locs].sort().map((loc) => `  <url><loc>${loc}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");
}

const routeLocs = new Set(["/sitemap/", "/sitemap/artists/", "/sitemap/projects/", "/sitemap.json"]);
for (const route of routes) {
  if (!route.path.includes("{")) routeLocs.add(route.path);
}
for (const item of index.make) routeLocs.add(item.path);
for (const item of index.recipes) routeLocs.add(item.path);
for (const item of index.tools) {
  routeLocs.add(item.path);
  routeLocs.add(item.lab);
}
for (const letter of [...artistLetters, ...projectLetters]) {
  routeLocs.add(letter.page);
  routeLocs.add(letter.json);
}
write(join(publicDir, "sitemap/routes.xml"), urlset(routeLocs));
write(join(publicDir, "sitemap/artists.xml"), urlset(artistLetters.flatMap((letter) => letter.items.map((item) => item.path))));
write(join(publicDir, "sitemap/projects.xml"), urlset(projectLetters.flatMap((letter) => letter.items.map((item) => item.path))));
write(
  join(publicDir, "sitemap.xml"),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <sitemap><loc>/sitemap/routes.xml</loc></sitemap>",
    "  <sitemap><loc>/sitemap/artists.xml</loc></sitemap>",
    "  <sitemap><loc>/sitemap/projects.xml</loc></sitemap>",
    "</sitemapindex>",
    "",
  ].join("\n"),
);
console.log(`sitemap files: artists ${artistLetters.length} letters, projects ${projectLetters.length} letters, route locs ${routeLocs.size}`);
