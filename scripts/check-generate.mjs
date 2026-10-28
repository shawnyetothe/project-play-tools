import { readFileSync } from "node:fs";

const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");
const catalog = JSON.parse(readFileSync(new URL("../public/tools.json", import.meta.url), "utf8"));
let failed = 0;
function check(ok, message) {
  console.log(`${ok ? "PASS" : "FAIL"} ${message}`);
  if (!ok) failed += 1;
}

const gen = catalog.generate;
check(Boolean(gen), "tools.json has a generate block");
check(gen?.oneOfOne?.includes("edition=1") && gen.oneOfOne.includes("output=one"), "1 of 1 URL");
check(gen?.curated16?.includes("edition=16") && gen.curated16.includes("mode=curated"), "16-piece curated URL");
for (const field of ["seed", "mix", "mode", "output", "edition", "balance", "band", "sources", "rules", "strikes", "showing", "sample"]) {
  check(gen?.manifest?.includes(field), `manifest field ${field}`);
}
check(llms.includes("edition=1") && llms.includes("output=one"), "llms.txt can build a 1 of 1");
check(llms.includes("edition=16") && llms.includes("mode=curated"), "llms.txt can build a 16-piece set");
check(llms.includes("/lab/generate/"), "llms.txt names the generate page");

if (failed) process.exit(1);
console.log("generate check passed");
