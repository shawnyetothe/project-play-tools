import { hashSeed, type Door } from "./seed";

export const STARTS: { id: Door; label: string; question: string; detail: string }[] = [
  {
    id: "message",
    label: "Message",
    question: "What do I want to say?",
    detail: "Start from a feeling or idea, and we'll suggest tools that can express it.",
  },
  {
    id: "medium",
    label: "Medium",
    question: "What do I want to make?",
    detail: "Start from the result: a print, plotter drawing, animation, sound or 3D.",
  },
  {
    id: "maker",
    label: "Maker",
    question: "Who am I?",
    detail: "Start from you: new to code, designer, musician or artist. We'll match tools to how you work.",
  },
];

type Pick = { id: string; label: string; lead: string; tool: number; mediumId?: string | null };

export const MEDIUM_PICKS: Pick[] = [
  { id: "print", label: "A print", lead: "prints", tool: 3, mediumId: null },
  { id: "plotter", label: "A plotter drawing", lead: "plotter", tool: 3, mediumId: "plot" },
  { id: "animation", label: "Animation", lead: "p5", tool: 0, mediumId: null },
  { id: "sound", label: "Sound", lead: "tonejs", tool: 2, mediumId: "sound" },
  { id: "3d", label: "3D", lead: "three", tool: 4, mediumId: "object" },
];

export const MAKER_PICKS: Pick[] = [
  { id: "new", label: "New to code", lead: "p5", tool: 0 },
  { id: "designer", label: "Designer", lead: "svg", tool: 4 },
  { id: "musician", label: "Musician", lead: "tonejs", tool: 2 },
  { id: "artist", label: "Artist", lead: "glsl", tool: 1 },
];

export function picksFor(door: Door): Pick[] {
  return door === "medium" ? MEDIUM_PICKS : door === "maker" ? MAKER_PICKS : [];
}

export function seedForStart(door: Door, pick = ""): string {
  return hashSeed(["start", door, pick || "open"]);
}

export function toolForStart(door: Door, pick = ""): number {
  const found = picksFor(door).find((item) => item.id === pick);
  return found ? found.tool : 0;
}

export function leadForStart(door: Door | "", pick: string, phrase: string): string | null {
  if (door === "message") return phrase.trim() ? null : "p5";
  const found = door ? picksFor(door).find((item) => item.id === pick) : undefined;
  return found?.lead ?? null;
}

export function mediumIdForStart(door: Door | "", pick: string): string | null {
  if (door !== "medium") return null;
  return MEDIUM_PICKS.find((item) => item.id === pick)?.mediumId ?? null;
}
