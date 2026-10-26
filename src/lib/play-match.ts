export type FileHint = { name: string; type: string };

export type FiredRule = { id: string; detail: string };

export type ToolHit = {
  id: string;
  reasons: string[];
  recipes: string[];
};

export type PlayMatch = {
  tools: ToolHit[];
  rules: FiredRule[];
};

type Rule = {
  id: string;
  explain: string;
  keywords?: string[];
  file?: (file: FileHint) => boolean;
  tools: string[];
  recipe?: string;
  note?: string;
};

const AUDIO = ["lullaby", "hum", "humming", "hummed", "sing", "singing", "song", "songs", "melody", "music", "sound", "audio", "voice", "chord", "rhythm", "beat", "lyric", "lyrics", "tune", "hymn"];
const IMAGE = ["photo", "photograph", "picture", "image", "pixel", "pixels", "shader", "shaders", "colour", "color"];
const SLOW = ["slow", "slowly", "change", "changes", "changing", "changed", "clock", "season", "seasons", "decay", "mutable"];
const PLOT = ["plot", "plotter", "plotters", "pen", "ink"];
const OBJECT = ["3d", "sculpture", "stl", "print"];
const CLOTH = ["stitch", "embroidery", "cloth", "fabric", "thread", "knit", "weave", "textile"];
const AGENT = ["agent", "agents", "wallet"];
const TYPE = ["poem", "word", "words", "letter", "letters", "type", "font", "fonts", "text", "lyric", "lyrics", "phrase", "write", "writing"];

export const matchRules: { id: string; explain: string }[] = [
  { id: "audio", explain: "A sound word, such as lullaby, hum, song, or lyric, suggests Tone.js, Web Audio, and sound." },
  { id: "image", explain: "An image word, or an image file, suggests shaders and plotters." },
  { id: "slow", explain: "Words like slow or change suggest work that changes over time." },
  { id: "plot", explain: "Pen and plotter words suggest a plotter and a vector file." },
  { id: "object", explain: "Object and 3D words suggest a 3D scene and a printed object." },
  { id: "cloth", explain: "Cloth and stitch words suggest embroidery and a vector file." },
  { id: "agent", explain: "Agent words suggest a token that can act on its own." },
  { id: "type", explain: "Type, poem, and letter words suggest tools that can draw type." },
  { id: "words", explain: "Any written note also suggests tools that can draw type. This dataset has no separate typography tool." },
  { id: "file-audio", explain: "An audio file suggests Tone.js and Web Audio." },
  { id: "file-image", explain: "An image file suggests shaders and plotters." },
  { id: "file-text", explain: "A text file suggests tools that can draw type." },
  { id: "file-model", explain: "A 3D file suggests a 3D scene and a printed object." },
  { id: "file-video", explain: "A video file suggests work that changes over time." },
];

const rules: Rule[] = [
  { id: "audio", explain: "", keywords: AUDIO, tools: ["tonejs", "webaudio", "sound"], recipe: "generative-sound" },
  { id: "image", explain: "", keywords: IMAGE, tools: ["glsl", "plotter", "p5"], recipe: "plotter-edition" },
  { id: "slow", explain: "", keywords: SLOW, tools: ["clock", "timebased", "eink", "mutable"], recipe: "slow-token-eink" },
  { id: "plot", explain: "", keywords: PLOT, tools: ["plotter", "svg", "p5"], recipe: "plotter-edition" },
  { id: "object", explain: "", keywords: OBJECT, tools: ["three", "fdm", "fabfile"], recipe: "3d-printed-object" },
  { id: "cloth", explain: "", keywords: CLOTH, tools: ["embroid", "svg", "textiles"], recipe: "embroidered-patch" },
  { id: "agent", explain: "", keywords: AGENT, tools: ["721t", "erc6551", "erc8048"], recipe: "token-as-agent" },
  { id: "type", explain: "", keywords: TYPE, tools: ["p5", "svg", "canvas2d"] },
  { id: "file-audio", explain: "", file: (file) => isAudio(file), tools: ["tonejs", "webaudio", "sound"], recipe: "generative-sound" },
  { id: "file-image", explain: "", file: (file) => isImage(file), tools: ["glsl", "plotter", "p5"], recipe: "plotter-edition" },
  { id: "file-svg", explain: "", file: (file) => ext(file.name) === "svg", tools: ["svg", "plotter", "p5"], recipe: "plotter-edition" },
  { id: "file-text", explain: "", file: (file) => isTextFile(file), tools: ["p5", "svg", "canvas2d"] },
  { id: "file-model", explain: "", file: (file) => isModel(file), tools: ["three", "fdm", "fabfile"], recipe: "3d-printed-object" },
  { id: "file-video", explain: "", file: (file) => isVideo(file), tools: ["timebased", "clock", "p5"], recipe: "slow-token-eink" },
];

function ext(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function isAudio(file: FileHint): boolean {
  return file.type.startsWith("audio/") || ["mp3", "wav", "ogg", "flac", "m4a", "aac", "aiff", "aif"].includes(ext(file.name));
}

function isImage(file: FileHint): boolean {
  return file.type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "tif", "tiff", "bmp"].includes(ext(file.name));
}

function isTextFile(file: FileHint): boolean {
  return file.type.startsWith("text/") || ["txt", "md", "markdown", "json", "csv"].includes(ext(file.name));
}

function isModel(file: FileHint): boolean {
  return ["stl", "obj", "glb", "gltf", "3mf"].includes(ext(file.name));
}

function isVideo(file: FileHint): boolean {
  return file.type.startsWith("video/") || ["mp4", "webm", "mov"].includes(ext(file.name));
}

function findWords(text: string, words: string[]): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  for (const word of words) {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(text) && !seen.has(word)) {
      seen.add(word);
      found.push(word);
    }
  }
  return found;
}

export function matchPlay(note: string, file: FileHint | null): PlayMatch {
  const text = note.trim();
  const fired: FiredRule[] = [];
  const tools = new Map<string, ToolHit & { score: number }>();

  function add(id: string, score: number, reason: string, recipe?: string) {
    const current = tools.get(id) ?? { id, reasons: [], recipes: [], score: 0 };
    current.score = Math.max(current.score, score);
    if (!current.reasons.includes(reason)) current.reasons.push(reason);
    if (recipe && !current.recipes.includes(recipe)) current.recipes.push(recipe);
    tools.set(id, current);
  }

  for (const rule of rules) {
    const inNote = rule.keywords ? findWords(text, rule.keywords) : [];
    const inName = rule.keywords && file ? findWords(file.name, rule.keywords) : [];
    const fileHit = rule.file && file ? rule.file(file) : false;
    if (!inNote.length && !inName.length && !fileHit) continue;
    const bits: string[] = [];
    if (inNote.length) bits.push(`the note contains ${inNote.join(", ")}`);
    if (inName.length) bits.push(`the file name contains ${inName.join(", ")}`);
    if (fileHit && file) bits.push(`the file is ${file.type || ext(file.name) || "this type"}`);
    const detail = bits.join("; ");
    fired.push({ id: rule.id, detail });
    const reason = `${detail}.`;
    for (const id of rule.tools) add(id, 2, reason, rule.recipe);
  }

  if (text.length >= 2) {
    const reason = "You wrote words. These tools can draw type. This dataset has no separate typography tool.";
    fired.push({ id: "words", detail: "the note is written text" });
    for (const id of ["p5", "svg", "canvas2d"]) add(id, 1, reason);
  }

  const ranked = [...tools.values()].sort((a, b) => b.score - a.score || a.reasons.length - b.reasons.length);
  return {
    tools: ranked.slice(0, 6).map(({ id, reasons, recipes }) => ({ id, reasons, recipes })),
    rules: fired,
  };
}
