"use client";

import { MIXES, mixLabel } from "@/lib/cine";
import { hashSeed } from "@/lib/seed";
import type { Piece } from "./use-piece";

export function MixRow({ piece }: { piece: Piece }) {
  const { state, applyMix } = piece;
  return (
    <div className="mix-row">
      <p className="mix-note">
        Try a pairing. Our Art Blocks pull on 2026-10-25 19:40 ET counts libraries, not these effect names: p5.js 842 projects, shaders 394, three.js 84, Tone.js 17. We have no count of how often the effects below are combined.
      </p>
      <div className="mix-chips" role="group" aria-label="Effect pairings">
        {MIXES.map(([a, b]) => {
          const mix = `${a}+${b}`;
          return (
            <button
              key={mix}
              type="button"
              aria-pressed={state.mix === mix}
              onClick={() => applyMix(mix, hashSeed(["mix", mix]))}
            >
              <span>{mixLabel(mix)}</span>
              <span className="mix-tag">try this pairing</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
