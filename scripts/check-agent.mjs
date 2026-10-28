import { readFileSync } from "node:fs";

const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");
const catalog = JSON.parse(readFileSync(new URL("../public/tools.json", import.meta.url), "utf8"));
let failed = 0;
function check(ok, message) {
  console.log(`${ok ? "PASS" : "FAIL"} ${message}`);
  if (!ok) failed += 1;
}

check(llms.includes("/tools.json"), "llms.txt points at /tools.json");
check(llms.includes("/sitemap/"), "llms.txt points at /sitemap/");
check(llms.includes("/lab/suggest/"), "llms.txt points at /lab/suggest/");
check(llms.includes("strikes"), "llms.txt documents strikes");
check(llms.includes("group="), "llms.txt documents ?group=");
check(catalog.sitemap === "/sitemap/", "tools.json points at /sitemap/");
check(String(catalog.suggest || "").includes("/lab/suggest/"), "tools.json points at /lab/suggest/");
check(llms.includes("playtools-seed"), "llms.txt names the localStorage key");
check(llms.includes("noindex"), "llms.txt keeps the site noindex");
check(/seed: 6 lowercase hex/.test(llms), "llms.txt documents the seed param");
check(llms.includes("?start="), "llms.txt documents ?start=");
check(llms.includes("Maker") && llms.includes("who they are"), "llms.txt explains Maker as who they are");
check(Array.isArray(catalog.startingPoints) && catalog.startingPoints.length === 3, "tools.json lists three starting points");
check(Array.isArray(catalog.howToChoose) && catalog.howToChoose.length >= 4, "tools.json has choose rules");
check(String(catalog.howToFirstSketch).includes("original"), "prompt template demands an original sketch");
check(catalog.seedNeverSent === true, "tools.json says the seed is never sent");

for (const tool of catalog.tools) {
  for (const key of ["id", "name", "plain", "category", "starter", "licenseNotes", "heroExample"]) {
    if (!(key in tool) || tool.name === "" || !String(tool.starter).startsWith("/tools/")) {
      check(false, `${tool.id || "?"} missing ${key}`);
      break;
    }
  }
}
check(catalog.tools.length > 50, `catalog has ${catalog.tools.length} tools`);

function choose(phrase) {
  const text = phrase.toLowerCase();
  const rules = [
    [/lullaby|\bhum\b|song|music|\bsound\b|\bnote\b/, "tonejs"],
    [/\bpen\b|plotter|\bplot\b|\bink\b/, "plotter"],
    [/\b3d\b|sculpture|\bscene\b/, "three"],
    [/shader|pixel|\bcolor\b|\bcolour\b/, "glsl"],
  ];
  for (const [re, id] of rules) {
    if (re.test(text)) return catalog.tools.find((tool) => tool.id === id);
  }
  const words = text.split(/\W+/).filter((word) => word.length > 2);
  let best = null;
  let score = 0;
  for (const tool of catalog.tools) {
    const hay = `${tool.plain} ${tool.name} ${tool.category} ${tool.what} ${tool.firstProject}`.toLowerCase();
    const next = words.filter((word) => hay.includes(word)).length;
    if (next > score) {
      score = next;
      best = tool;
    }
  }
  return score ? best : catalog.tools.find((tool) => tool.id === "p5");
}

const pen = choose("a pen drawing");
check(pen?.id === "plotter", `pen drawing chooses plotter (${pen?.id})`);
const lullaby = choose("a lullaby I hum to my kids");
check(lullaby?.id === "tonejs", `lullaby chooses tonejs (${lullaby?.id})`);

const seed = "c19a4e";
const make = "a lullaby I hum to my kids";
const seedUrl = `/lab/composed/?seed=${seed}&door=message&tool=3&make=${encodeURIComponent(make)}`;
const prompt = catalog.howToFirstSketch
  .replaceAll("{name}", lullaby.name)
  .replaceAll("{plain}", lullaby.plain)
  .replaceAll("{category}", lullaby.category)
  .replaceAll("{firstProject}", lullaby.firstProject)
  .replaceAll("{starter}", lullaby.starter)
  .replaceAll("{licenseNotes}", lullaby.licenseNotes)
  .replaceAll("{seed}", seed)
  .replaceAll("{make}", make)
  .replaceAll("{seedUrl}", seedUrl);

check(prompt.includes(lullaby.name), "prompt names the tool");
check(prompt.includes(lullaby.starter), "prompt includes the starter link");
check(prompt.includes(seed) && prompt.includes("original"), "prompt carries the seed and the original-work rule");
check(!prompt.includes("{name}"), "template placeholders are filled");

if (failed) {
  console.error(`agent check failed: ${failed}`);
  process.exit(1);
}
console.log("agent check passed");
