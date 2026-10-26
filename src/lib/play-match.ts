export type FileHint = { name: string; type: string };

export type FiredRule = { id: string; detail: string };

export type ToolHit = {
  id: string;
  reasons: string[];
  recipes: string[];
};

export type PlayPrimary = {
  toolId: string;
  recipe: string | null;
  medium: string;
};

export type PlayMatch = {
  tools: ToolHit[];
  rules: FiredRule[];
  primary: PlayPrimary | null;
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
const CLOTH = ["stitch", "stitched", "embroidery", "embroidered", "cloth", "fabric", "thread", "knit", "weave", "textile"];
const AGENT = ["agent", "agents", "wallet"];
const TYPE = ["poem", "word", "words", "letter", "letters", "type", "font", "fonts", "text", "lyric", "lyrics", "phrase", "write", "writing"];

export const matchRules: { id: string; explain: string }[] = [
  { id: "audio", explain: "A sound word, such as lullaby, hum, song, or lyric, suggests Tone.js, Web Audio, and sound." },
  { id: "image", explain: "An image word, or an image file, opens a shader first. A pen or plot word is what opens the plotter recipe." },
  { id: "slow", explain: "Words like slow or change suggest work that changes over time." },
  { id: "plot", explain: "Pen and plotter words suggest a plotter and a vector file." },
  { id: "object", explain: "Object and 3D words suggest a 3D scene and a printed object." },
  { id: "cloth", explain: "Cloth and stitch words suggest embroidery and a vector file." },
  { id: "agent", explain: "Agent words suggest a token that can act on its own." },
  { id: "type", explain: "Type, poem, and letter words suggest tools that can draw type." },
  { id: "words", explain: "A written note suggests drawing tools only when no specific medium matched. This dataset has no separate typography tool." },
  { id: "file-audio", explain: "An audio file suggests Tone.js and Web Audio." },
  { id: "file-image", explain: "An image file opens a shader first. It does not open the plotter recipe." },
  { id: "file-text", explain: "A text file suggests tools that can draw type." },
  { id: "file-model", explain: "A 3D file suggests a 3D scene and a printed object." },
  { id: "file-video", explain: "A video file suggests work that changes over time." },
];

const rules: Rule[] = [
  { id: "audio", explain: "", keywords: AUDIO, tools: ["tonejs", "webaudio", "sound"], recipe: "generative-sound" },
  { id: "image", explain: "", keywords: IMAGE, tools: ["glsl", "plotter", "p5"] },
  { id: "slow", explain: "", keywords: SLOW, tools: ["clock", "timebased", "eink", "mutable"], recipe: "slow-token-eink" },
  { id: "plot", explain: "", keywords: PLOT, tools: ["plotter", "svg", "p5"], recipe: "plotter-edition" },
  { id: "object", explain: "", keywords: OBJECT, tools: ["three", "fdm", "fabfile"], recipe: "3d-printed-object" },
  { id: "cloth", explain: "", keywords: CLOTH, tools: ["embroid", "svg", "textiles"], recipe: "embroidered-patch" },
  { id: "agent", explain: "", keywords: AGENT, tools: ["721t", "erc6551", "erc8048"], recipe: "token-as-agent" },
  { id: "type", explain: "", keywords: TYPE, tools: ["p5", "svg", "canvas2d"] },
  { id: "file-audio", explain: "", file: (file) => isAudio(file), tools: ["tonejs", "webaudio", "sound"], recipe: "generative-sound" },
  { id: "file-image", explain: "", file: (file) => isImage(file), tools: ["glsl", "plotter", "p5"] },
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

/** One medium wins. A file beats a note. Pen, cloth, and objects beat a general word. */
const MEDIUM_OF: Record<string, string> = {
  plot: "plot",
  "file-svg": "plot",
  cloth: "cloth",
  object: "object",
  "file-model": "object",
  audio: "sound",
  "file-audio": "sound",
  slow: "slow",
  "file-video": "slow",
  image: "image",
  "file-image": "image",
  agent: "agent",
  type: "type",
  "file-text": "type",
  words: "type",
};

const MEDIUMS: Record<string, { tools: string[]; recipe: string | null; rank: number }> = {
  plot: { tools: ["plotter", "svg", "p5"], recipe: "plotter-edition", rank: 10 },
  cloth: { tools: ["embroid", "svg", "textiles"], recipe: "embroidered-patch", rank: 20 },
  object: { tools: ["three", "fdm", "fabfile"], recipe: "3d-printed-object", rank: 30 },
  sound: { tools: ["tonejs", "webaudio", "sound"], recipe: "generative-sound", rank: 40 },
  slow: { tools: ["clock", "timebased", "eink", "mutable"], recipe: "slow-token-eink", rank: 50 },
  image: { tools: ["glsl", "plotter", "p5"], recipe: null, rank: 60 },
  agent: { tools: ["721t", "erc6551", "erc8048"], recipe: "token-as-agent", rank: 70 },
  type: { tools: ["p5", "svg", "canvas2d"], recipe: null, rank: 80 },
};

const FILE_RULES = new Set(["file-audio", "file-image", "file-svg", "file-text", "file-model", "file-video"]);

/** Places a person can begin, before any note is written. */
export const playMedia: { id: string; label: string; hint: string }[] = [
  { id: "sound", label: "Sound", hint: "A piece you can hear" },
  { id: "image", label: "Image", hint: "A photo, color, a shader" },
  { id: "plot", label: "Pen", hint: "A line a machine can draw" },
  { id: "slow", label: "Time", hint: "Work that changes slowly" },
  { id: "object", label: "Object", hint: "Something you can hold" },
  { id: "cloth", label: "Cloth", hint: "Stitch, thread, cloth" },
  { id: "agent", label: "Agent", hint: "A token that can act" },
  { id: "type", label: "Words", hint: "A poem, a letter, type" },
];

/** Maker beginnings taken from the tool notes. Each one opens that medium. */
export const makerStarts: { id: string; label: string; hint: string; medium: string }[] = [
  { id: "body", label: "The body", hint: "A tempo like a resting heartbeat", medium: "sound" },
  { id: "hand", label: "The hand", hint: "A pen, then the paper", medium: "plot" },
  { id: "time", label: "Time", hint: "A piece that needs a whole day", medium: "slow" },
  { id: "room", label: "A room", hint: "Built from memory, not a measuring tape", medium: "object" },
  { id: "stitch", label: "A few stitches", hint: "The machine starts, the hand finishes", medium: "cloth" },
  { id: "line", label: "A pencil line", hint: "Keep the wobble", medium: "type" },
];

export function matchMedium(id: string): PlayMatch {
  const spec = MEDIUMS[id];
  const named = playMedia.find((item) => item.id === id);
  if (!spec || !named) return { tools: [], rules: [], primary: null };
  const reason = `You began with ${named.label.toLowerCase()}.`;
  return {
    tools: spec.tools.map((toolId) => ({
      id: toolId,
      reasons: [reason],
      recipes: spec.recipe ? [spec.recipe] : [],
    })),
    rules: [{ id: "medium", detail: reason }],
    primary: { toolId: spec.tools[0], recipe: spec.recipe, medium: id },
  };
}

/** The ten messages this guide opens first, and the tools that should stay out. */
export const playJudgments: {
  label: string;
  note: string;
  file?: FileHint;
  toolId: string;
  recipe: string | null;
  absent: string[];
}[] = [
  { label: "lullaby", note: "a lullaby I hum to my kids", toolId: "tonejs", recipe: "generative-sound", absent: ["p5", "svg", "canvas2d"] },
  { label: "song", note: "a song I sing at night", toolId: "tonejs", recipe: "generative-sound", absent: ["p5", "svg", "canvas2d"] },
  { label: "photo", note: "a photo of the harbor", toolId: "glsl", recipe: null, absent: ["tonejs", "canvas2d"] },
  { label: "slow", note: "slow change across a season", toolId: "clock", recipe: "slow-token-eink", absent: ["p5", "svg", "canvas2d"] },
  { label: "pen", note: "a pen plot of a coastline", toolId: "plotter", recipe: "plotter-edition", absent: ["tonejs", "canvas2d"] },
  { label: "sculpture", note: "a small sculpture I can print", toolId: "three", recipe: "3d-printed-object", absent: ["p5", "svg", "canvas2d"] },
  { label: "patch", note: "an embroidered patch for a jacket", toolId: "embroid", recipe: "embroidered-patch", absent: ["p5", "tonejs"] },
  { label: "poem", note: "a poem about rain", toolId: "p5", recipe: null, absent: ["tonejs", "glsl", "plotter"] },
  { label: "agent", note: "an agent that can hold its own wallet", toolId: "721t", recipe: "token-as-agent", absent: ["p5", "svg", "canvas2d"] },
  { label: "audio file", note: "", file: { name: "lullaby.wav", type: "audio/wav" }, toolId: "tonejs", recipe: "generative-sound", absent: ["p5", "svg", "canvas2d"] },
];

export function matchPlay(note: string, file: FileHint | null): PlayMatch {
  const text = note.trim();
  const fired: FiredRule[] = [];
  const tools = new Map<string, ToolHit>();

  function add(id: string, reason: string, recipe?: string) {
    const current = tools.get(id) ?? { id, reasons: [], recipes: [] };
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
    for (const id of rule.tools) add(id, reason, rule.recipe);
  }

  const specific = fired.some((rule) => rule.id !== "words");
  if (!specific && text.length >= 2) {
    const reason = "You wrote words. These tools can draw type. This dataset has no separate typography tool.";
    fired.push({ id: "words", detail: "the note is written text, and no specific medium matched" });
    for (const id of MEDIUMS.type.tools) add(id, reason);
  }

  let best: { id: string; rank: number } | null = null;
  for (const rule of fired) {
    const medium = MEDIUM_OF[rule.id];
    if (!medium) continue;
    let rank = MEDIUMS[medium].rank;
    if (FILE_RULES.has(rule.id)) rank -= 100;
    if (!best || rank < best.rank) best = { id: medium, rank };
  }

  if (!best) return { tools: [], rules: fired, primary: null };

  const spec = MEDIUMS[best.id];
  const allowed = new Set(spec.tools);
  const ranked = spec.tools.filter((id) => tools.has(id) && allowed.has(id)).map((id) => tools.get(id)!);
  const keptRules = fired.filter((rule) => MEDIUM_OF[rule.id] === best.id);
  return {
    tools: ranked,
    rules: keptRules,
    primary: { toolId: spec.tools[0], recipe: spec.recipe, medium: best.id },
  };
}
