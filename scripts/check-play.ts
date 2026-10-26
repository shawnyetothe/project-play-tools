import { matchPlay, playJudgments } from "../src/lib/play-match.ts";

let failed = 0;

for (const judgment of playJudgments) {
  const match = matchPlay(judgment.note, judgment.file ?? null);
  const ids = match.tools.map((tool) => tool.id);
  const problems: string[] = [];
  if (match.primary?.toolId !== judgment.toolId) problems.push(`primary ${match.primary?.toolId} != ${judgment.toolId}`);
  if ((match.primary?.recipe ?? null) !== judgment.recipe) problems.push(`recipe ${match.primary?.recipe} != ${judgment.recipe}`);
  for (const absent of judgment.absent) {
    if (ids.includes(absent)) problems.push(`still suggests ${absent}`);
  }
  if (ids[0] !== judgment.toolId) problems.push(`list starts with ${ids[0]}`);
  if (problems.length) {
    failed += 1;
    console.error(judgment.label, problems.join("; "), JSON.stringify(match));
  } else {
    console.log("ok", judgment.label, match.primary?.toolId, match.primary?.recipe);
  }
}

const hummedPoem = matchPlay("a poem I hum", null);
if (hummedPoem.primary?.toolId !== "tonejs") {
  failed += 1;
  console.error("hummed poem should open sound", hummedPoem.primary);
} else console.log("ok hummed poem", hummedPoem.primary?.toolId);

const poemFile = matchPlay("a poem about rain", { name: "harbor.png", type: "image/png" });
if (poemFile.primary?.toolId !== "glsl") {
  failed += 1;
  console.error("image file should beat the poem", poemFile.primary);
} else console.log("ok file beats poem", poemFile.primary?.toolId);

if (failed) {
  console.error(failed, "failed");
  process.exit(1);
}
