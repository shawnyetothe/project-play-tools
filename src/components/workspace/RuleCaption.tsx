"use client";

import { useEffect, useRef } from "react";
import { useWorkspace } from "./Workspace";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value * 1000) / 1000));
}

function Scrub({
  value,
  min,
  max,
  step,
  label,
  text,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  text: string;
  onChange: (next: number) => void;
}) {
  const drag = useRef<{ x: number; value: number } | null>(null);
  const node = useRef<HTMLButtonElement>(null);
  const latest = useRef({ value, min, max, step, onChange });
  latest.current = { value, min, max, step, onChange };
  useEffect(() => {
    const button = node.current;
    if (!button) return;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      if (key !== "ArrowRight" && key !== "ArrowUp" && key !== "ArrowLeft" && key !== "ArrowDown") return;
      event.preventDefault();
      const dir = key === "ArrowRight" || key === "ArrowUp" ? 1 : -1;
      const current = latest.current;
      current.onChange(clamp(current.value + dir * current.step, current.min, current.max));
    };
    button.addEventListener("keydown", onKey);
    return () => button.removeEventListener("keydown", onKey);
  }, []);
  const setDrawing = (on: boolean) => {
    document.documentElement.dataset.drawing = on ? "1" : "0";
  };
  return (
    <button
      ref={node}
      type="button"
      className="scrub"
      role="slider"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={text}
      onKeyDown={(event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowLeft" && event.key !== "ArrowDown") return;
        event.preventDefault();
        const dir = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1;
        onChange(clamp(value + dir * step, min, max));
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { x: event.clientX, value };
        setDrawing(true);
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const steps = Math.round((event.clientX - drag.current.x) / 28);
        onChange(clamp(drag.current.value + steps * step, min, max));
      }}
      onPointerUp={() => {
        drag.current = null;
        setDrawing(false);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDrawing(false);
      }}
    >
      {text}
    </button>
  );
}

export function RuleCaption() {
  const { state, setState } = useWorkspace();
  const speed = state.speed || 0.03;
  const spread = state.spread ?? 0.045;
  return (
    <figure className="hero-caption">
      <figcaption>
        <p className="fig-kicker">FIG. 01 · THE RULE</p>
        <p className="fig-sentence">
          Points orbit the circle at{" "}
          <Scrub
            value={speed}
            min={0.01}
            max={0.12}
            step={0.01}
            label="Orbit speed in radians per second"
            text={`${speed.toFixed(2)} rad/s.`}
            onChange={(next) => setState({ speed: next })}
          /><sup>1</sup>{" "}
          Draw a line and they take it as their path, spread{" "}
          <Scrub
            value={spread}
            min={0}
            max={0.12}
            step={0.005}
            label="Spread on either side of the line"
            text={`${(spread * 100).toFixed(1)}%`}
            onChange={(next) => setState({ spread: next })}
          />{" "}on either side.<sup>2</sup>
        </p>
      </figcaption>
      <ol className="fig-notes">
        <li>Angular speed of the idle orbit.</li>
        <li>How far points sit from the line, as a share of the frame height.</li>
      </ol>
    </figure>
  );
}
