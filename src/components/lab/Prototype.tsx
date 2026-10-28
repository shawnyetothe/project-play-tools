"use client";

import Link from "next/link";
import { HeroStage } from "./HeroStage";
import { ImmerseCard } from "./ImmerseCard";
import { LineageStrip } from "./LineageStrip";
import { SenseCard } from "./SenseCard";
import { usePiece } from "./use-piece";

const copy: Record<number, { title: string; lede: string }> = {
  1: { title: "Sketch and prompt", lede: "One sketch. Shuffle it, or let a chip change it." },
  2: { title: "Lineage", lede: "The same seed, one knob at a time." },
  3: { title: "Play", lede: "Tap the mark. A note plays, and a burst is drawn." },
  4: { title: "Scene", lede: "A still frame first. The 3D scene loads only if you ask." },
  5: { title: "Live input", lede: "Pointer, scroll, and the hour. No permission prompt." },
};

export function Prototype({ which }: { which: 1 | 2 | 3 | 4 | 5 }) {
  const piece = usePiece();
  const text = copy[which];
  return (
    <div className="wrap lab-page">
      <p className="quiet">
        <Link href="/lab/">Hero lab</Link>
        {" / "}
        {text.title}
      </p>
      <h1>{text.title}</h1>
      <p className="lede">{text.lede}</p>
      {which === 1 || which === 3 ? <HeroStage piece={piece} /> : null}
      {which === 2 ? <LineageStrip piece={piece} /> : null}
      {which === 4 ? <ImmerseCard piece={piece} /> : null}
      {which === 5 ? <SenseCard piece={piece} /> : null}
      <p>
        <Link href="/lab/composed/">Open the composed page</Link>
      </p>
    </div>
  );
}
