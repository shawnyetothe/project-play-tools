import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Hero lab" };

const parts = [
  { href: "/lab/composed/", title: "Composed page", text: "The whole site as one piece. Your seed starts in the hero and is redrawn in every section." },
  { href: "/lab/tools/", title: "Creative index", text: "How used or underused each tool is, from the Art Blocks pull." },
  { href: "/lab/hero-1/", title: "Sketch and prompt", text: "One live sketch, shuffle, and the Message, Medium, Maker chips." },
  { href: "/lab/hero-2/", title: "Lineage", text: "Walk, noise, field, flow, reaction, tiles. One knob each." },
  { href: "/lab/hero-3/", title: "Play", text: "The mark starts Tone.js. Each note draws a burst." },
  { href: "/lab/hero-4/", title: "Scene", text: "three.js, loaded only when you ask, with a still frame first." },
  { href: "/lab/hero-5/", title: "Live input", text: "Pointer, scroll, and the hour. No camera or microphone." },
];

export default function LabIndex() {
  return (
    <div className="wrap lab-page">
      <h1>Hero lab</h1>
      <p className="lede">Prototypes for the front of PlayTools. The composed page is the one to judge.</p>
      <div className="lab-index">
        {parts.map((part) => (
          <p key={part.href}>
            <Link href={part.href}>{part.title}</Link>
            <span className="quiet"> — {part.text}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
