"use client";

import Link from "next/link";
import { useState } from "react";
import type { Piece } from "./use-piece";
import { drawSalt } from "@/lib/seed";
import { drawHero, downloadSvg, flowSvg } from "@/lib/seed-draw";
import { seedUint } from "@/lib/seed";

const PIECES = [
  {
    href: "https://n-e-r-v-o-u-s.com/shop/",
    title: "Nervous System shop",
    detail: "Jessica Rosenkrantz and Jesse Louis-Rosenberg. Generative wooden puzzles. The shop marks Earth Infinity as most popular.",
  },
  {
    href: "https://shop.tylerxhobbs.com",
    title: "Tyler Hobbs shop",
    detail: "Set of 10 prints from Please Respond, listed at $350. The prints sit beside his writing on flow fields.",
    maker: "/artists/tyler-hobbs/",
  },
  {
    href: "https://generativegoods.com/products/mio",
    title: "mio by Generative Goods",
    detail: "A small clicker that comes with a digital creature.",
    maker: "/artists/generative-goods/",
  },
  {
    href: "https://generativegoods.com/shop/micro1",
    title: "Micro¹ by Generative Goods",
    detail: "A generative object you finish yourself.",
    maker: "/artists/generative-goods/",
  },
];

export function ShareCard({ piece }: { piece: Piece }) {
  const [note, setNote] = useState("");
  const { state, lock, sharePath } = piece;

  async function copyLink() {
    lock();
    const url = `${window.location.origin}${sharePath}`;
    try {
      await navigator.clipboard.writeText(url);
      setNote("Link copied. Nothing is posted.");
    } catch {
      setNote(url);
    }
  }

  function saveImage() {
    lock();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawHero(ctx, 1200, 630, {
      salt: drawSalt(state.seed, state.door, state.phrase, state.tool),
      tool: state.tool,
      door: state.door,
      t: 0,
      pointer: { x: 0.5, y: 0.5 },
      hour: new Date().getHours(),
      bursts: [],
      now: 0,
      still: true,
    });
    ctx.fillStyle = "#f6f1e8";
    ctx.fillRect(0, 560, 1200, 70);
    ctx.fillStyle = "#1c1915";
    ctx.font = "28px sans-serif";
    ctx.fillText(`PlayTools  ${state.seed}`, 36, 604);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `playtools-${state.seed}.png`;
    link.click();
    setNote("Image saved on this device. Nothing is posted.");
  }

  function saveSvg() {
    lock();
    downloadSvg(`playtools-${state.seed}.svg`, flowSvg(seedUint(state.seed), state.knobs));
    setNote("SVG saved. It is a pen path from your seed.");
  }

  return (
    <div className="share-card">
      <h3>Save your seed</h3>
      <p>
        Seed {state.seed}
        {state.door ? ` · ${state.door}` : ""} · tool {state.tool + 1} / 6
      </p>
      <p className="quiet">The link is the share. It stays in the address and on this device.</p>
      <div className="row">
        <button type="button" onClick={() => void copyLink()}>
          Copy link
        </button>
        <button type="button" className="ghost" onClick={saveImage}>
          Save image
        </button>
        <button type="button" className="ghost" onClick={saveSvg}>
          Download plotter SVG
        </button>
      </div>
      {note ? <p className="quiet">{note}</p> : null}
      <h3>Made physical, elsewhere</h3>
      <ul className="link-list">
        {PIECES.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.title}</a>
            {item.maker ? (
              <>
                {" · "}
                <Link href={item.maker}>Maker in this guide</Link>
              </>
            ) : null}
            <p className="quiet">{item.detail}</p>
          </li>
        ))}
      </ul>
      <p className="quiet">
        Credits only. These pictures stay on their own sites.
      </p>
    </div>
  );
}
