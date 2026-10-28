/** Original PlayTools sketches. Credits for outside work are links only. */

export type ExampleKind = "lineage" | "physical" | "sound" | "sensor";

export type ExampleItem = {
  slug: string;
  title: string;
  kind: ExampleKind;
  rule: string;
  summary: string;
  doors: Array<"message" | "medium" | "maker">;
  maker?: string;
  credit?: { label: string; href: string };
};

export const examples: ExampleItem[] = [
  {
    slug: "orbit",
    title: "Points on a shell",
    kind: "lineage",
    rule: "orbit",
    summary: "Points drift on an ellipse above a horizon. One rule, already running.",
    doors: ["message", "maker"],
    maker: "artist",
  },
  {
    slug: "flow",
    title: "A line becomes a path",
    kind: "lineage",
    rule: "flow",
    summary: "After a stroke, points travel along the line and curl at the ends.",
    doors: ["message", "medium"],
    maker: "artist",
    credit: { label: "Tyler Hobbs, Flow Fields", href: "https://tylerxhobbs.com/words/flow-fields" },
  },
  {
    slug: "walk",
    title: "A walk from the seed",
    kind: "lineage",
    rule: "walk",
    summary: "A seeded walk, one step at a time. The line is the record.",
    doors: ["medium", "maker"],
    maker: "new",
  },
  {
    slug: "field",
    title: "Noise as a direction",
    kind: "lineage",
    rule: "field",
    summary: "Each point reads a direction from the seed and steps that way.",
    doors: ["medium"],
    maker: "designer",
    credit: { label: "Daniel Shiffman, Nature of Code", href: "https://natureofcode.com/autonomous-agents/" },
  },
  {
    slug: "tiles",
    title: "Two strokes, a tile",
    kind: "lineage",
    rule: "tiles",
    summary: "A grid of two possible strokes. The seed picks which one.",
    doors: ["medium", "maker"],
    maker: "designer",
    credit: { label: "10 PRINT", href: "https://10print.org/" },
  },
  {
    slug: "plot",
    title: "A line a pen could follow",
    kind: "physical",
    rule: "plot",
    summary: "One continuous path. A plotter could draw it. No photograph of a print is shown here.",
    doors: ["medium", "maker"],
    maker: "designer",
    credit: { label: "Tyler Hobbs, Fidenza prints", href: "https://www.tylerxhobbs.com/pages/fidenza-prints" },
  },
  {
    slug: "note",
    title: "A note for the seed",
    kind: "sound",
    rule: "orbit",
    summary: "The same seed can drive a tone. Sound loads only if you open the tool.",
    doors: ["message", "maker"],
    maker: "musician",
    credit: { label: "Tone.js tool page", href: "/tools/tonejs/" },
  },
];

export function exampleBySlug(slug: string) {
  return examples.find((item) => item.slug === slug);
}
