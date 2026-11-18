"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HeroStage } from "./HeroStage";
import { LineageStrip } from "./LineageStrip";
import { ProgressDots } from "./ProgressDots";
import { SenseCard } from "./SenseCard";
import { ShareCard } from "./ShareCard";
import { usePiece } from "./use-piece";
import { toolGroups } from "@/lib/tool-groups";
import { retargetNotes } from "@/lib/seed-audio";
import { leadForStart, mediumIdForStart } from "@/lib/starts";
import type { PlayRecipe, PlayTool } from "@/components/PlayFlow";

const Finder = dynamic(() => import("@/components/PlayFlow").then((mod) => mod.PlayFlow), {
  ssr: false,
  loading: () => <p>The finder opens as you reach it.</p>,
});

const ImmerseCard = dynamic(() => import("./ImmerseCard").then((mod) => mod.ImmerseCard), {
  ssr: false,
  loading: () => <p>The 3D scene stays unloaded until you reach it.</p>,
});

function WhenNear({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShow(true);
      },
      { rootMargin: "280px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{show ? children : fallback}</div>;
}

export function Composed({ tools, recipes }: { tools: PlayTool[]; recipes: PlayRecipe[] }) {
  const piece = usePiece();
  const { state, soundOn } = piece;

  useEffect(() => {
    if (soundOn) retargetNotes(state.seed);
  }, [soundOn, state.seed]);

  return (
    <div className="lab-page">
      <section className="lab-section lab-hero wrap" id="play">
        <HeroStage piece={piece} />
      </section>
      <ProgressDots generateHref={`/generate/?g=${state.seed.slice(0, 4)}&r=0.03&sp=4.5&v=1`} />
      <nav className="wrap quick" aria-label="Tool shortcuts">
        <ul className="quick-row">
          {toolGroups.map((group) => (
            <li key={group.id}>
              <Link href={`/tools/?group=${group.id}`}>{group.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <section className="lab-section wrap" id="lineage">
        <h2>Explore</h2>
        <p className="lede">One seed, walked from dots to a field you could plot. One knob on each step.</p>
        <LineageStrip piece={piece} />
        <p className="quiet">
          Walk, noise, field, and flow follow the line Tyler Hobbs describes in{" "}
          <a href="https://tylerxhobbs.com/words/flow-fields">Flow Fields</a> and that Daniel Shiffman teaches in{" "}
          <a href="https://natureofcode.com/autonomous-agents/">Nature of Code</a>. Reaction-diffusion uses feed and kill in the sense of{" "}
          <a href="https://www.karlsims.com/rd.html">Karl Sims</a>. Tiles follow the arc form in{" "}
          <a href="https://10print.org/">10 PRINT</a>.
        </p>
        <p>
          <Link href={`/generate/?g=${state.seed.slice(0, 4)}&r=0.03&sp=4.5&v=1`}>
            Make sixteen
          </Link>
        </p>
      </section>
      <section className="lab-section wrap" id="listen">
        <h2>Hear, immerse, sense</h2>
        <p className="lede">Three readings of the same seed. Sound already started if you tapped the mark.</p>
        <div className="trio">
          <article className="lab-card">
            <h3>Hear</h3>
            <p>{soundOn ? "The loop is playing. Each note draws a burst on the sketch." : "Tap play in the hero. Sound starts on that tap, and each note draws a burst."}</p>
            <p>
              <Link className="try" href="/tools/tonejs/">
                Try it
              </Link>
            </p>
          </article>
          <WhenNear fallback={<p className="lab-card">A still of the seed stands in until the scene is near.</p>}>
            <ImmerseCard piece={piece} />
          </WhenNear>
          <SenseCard piece={piece} />
        </div>
      </section>
      <section className="lab-section wrap" id="make">
        <h2>Make it real</h2>
        <p className="lede">A plotter file from your field, and a few physical pieces that already exist.</p>
        <ShareCard piece={piece} />
      </section>
      <section className="lab-section wrap find-publish" id="find">
        <div>
          <h2>Find your tool</h2>
          <p className="lede">The same beginning, in the finder.</p>
          <WhenNear fallback={<p>The finder opens as you reach it.</p>}>
            <Finder
              tools={tools}
              recipes={recipes}
            initialDoor={state.door || null}
            initialNote={state.door === "message" ? state.phrase : ""}
            initialMediumId={mediumIdForStart(state.door, state.pick)}
            initialLead={leadForStart(state.door, state.pick, state.phrase)}
            embed
            />
          </WhenNear>
        </div>
        <div id="publish">
          <h2>Publish</h2>
          <p>
            ABX is Art Blocks’ open protocol for putting a digital object on a blockchain. Anyone can deploy. This guide is not affiliated with Art Blocks.
          </p>
          <p>
            <Link href="/abx/">The publish path in this guide</Link>
            {" · "}
            <a href="https://abx.io">abx.io</a>
            {" · "}
            <a href="https://docs.abx.io/docs/using-abx/guides/deploy-a-digital-asset">Deploy a digital asset</a>
          </p>
        </div>
      </section>
      <p className="wrap lab-quiet-link">
        <Link href="/lab/suggest/">Suggest a tool, example, or fix</Link>
      </p>
    </div>
  );
}
