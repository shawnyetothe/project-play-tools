"use client";

import { useEffect, useRef } from "react";
import { fitCanvas } from "./canvas-fit";
import type { Piece } from "./use-piece";
import { seedUint, type Knobs } from "@/lib/seed";
import { drawLineage, rdRates, type LineageId } from "@/lib/seed-draw";

const STEPS: { id: LineageId; name: string; knob: keyof Knobs; label: string; min: number; max: number }[] = [
  { id: "walk", name: "Walk", knob: "walk", label: "Step size", min: 4, max: 40 },
  { id: "noise", name: "Noise", knob: "noise", label: "Noise scale", min: 5, max: 90 },
  { id: "field", name: "Field", knob: "grid", label: "Grid resolution", min: 6, max: 22 },
  { id: "flow", name: "Flow", knob: "count", label: "Particle count", min: 12, max: 140 },
  { id: "rd", name: "Reaction", knob: "rd", label: "Feed and kill", min: 0, max: 100 },
  { id: "tile", name: "Tiles", knob: "tile", label: "Rotation probability", min: 0, max: 100 },
];

function Cell({
  step,
  seed,
  knobs,
  onKnob,
}: {
  step: (typeof STEPS)[number];
  seed: string;
  knobs: Knobs;
  onKnob: (key: keyof Knobs, value: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const value = knobs[step.knob];
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const fitted = fitCanvas(canvas);
    if (!fitted) return;
    drawLineage(fitted.ctx, fitted.w, fitted.h, step.id, seedUint(seed), knobs);
  }, [step.id, seed, knobs, value]);

  const rates = step.id === "rd" ? rdRates(value) : null;
  return (
    <article className="lineage-cell">
      <h3>
        {step.name}
      </h3>
      <canvas ref={ref} className="lineage-canvas" aria-hidden="true" />
      <label>
        {step.label}
        <input
          type="range"
          min={step.min}
          max={step.max}
          value={value}
          onChange={(event) => onKnob(step.knob, Number(event.target.value))}
        />
      </label>
      <p className="quiet">
        {rates ? `Feed ${rates.feed.toFixed(3)}, kill ${rates.kill.toFixed(3)}` : value}
      </p>
    </article>
  );
}

export function LineageStrip({ piece }: { piece: Piece }) {
  return (
    <div className="lineage-strip">
      {STEPS.map((step) => (
        <Cell key={step.id} step={step} seed={piece.state.seed} knobs={piece.state.knobs} onKnob={piece.setKnob} />
      ))}
    </div>
  );
}
