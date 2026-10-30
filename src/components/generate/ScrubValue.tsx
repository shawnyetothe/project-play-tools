"use client";

import { useRef, type KeyboardEvent } from "react";

export function ScrubValue({
  value,
  min,
  max,
  step,
  digits,
  label,
  text,
  onChange,
  onCommit,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  digits: number;
  label: string;
  text: string;
  onChange: (next: number) => void;
  onCommit: (next: number) => void;
}) {
  const node = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; value: number; pointer: number } | null>(null);
  const latest = useRef({ value, min, max, step, onChange, onCommit });
  latest.current = { value, min, max, step, onChange, onCommit };
  const frame = useRef(0);
  const pending = useRef<number | null>(null);
  const lastPaint = useRef(0);

  const quantize = (raw: number) => {
    const current = latest.current;
    const steps = Math.round((raw - current.min) / current.step);
    const next = current.min + steps * current.step;
    const clamped = Math.min(current.max, Math.max(current.min, next));
    return Number(clamped.toFixed(digits));
  };

  const flush = () => {
    if (pending.current == null) return;
    const next = pending.current;
    pending.current = null;
    latest.current.onChange(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const key = event.key;
    if (key !== "ArrowRight" && key !== "ArrowUp" && key !== "ArrowLeft" && key !== "ArrowDown") return;
    event.preventDefault();
    event.stopPropagation();
    const dir = key === "ArrowRight" || key === "ArrowUp" ? 1 : -1;
    const mult = event.shiftKey ? 10 : 1;
    const current = latest.current;
    const next = quantize(current.value + dir * current.step * mult);
    current.onChange(next);
    current.onCommit(next);
  };

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
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { x: event.clientX, value, pointer: event.pointerId };
        setDrawing(true);
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const mult = event.shiftKey ? 10 : 1;
        const steps = Math.round(event.clientX - drag.current.x) * mult;
        pending.current = quantize(drag.current.value + steps * step);
        const now = performance.now();
        if (now - lastPaint.current >= 33) {
          lastPaint.current = now;
          flush();
          return;
        }
        if (frame.current) return;
        frame.current = window.requestAnimationFrame(() => {
          frame.current = 0;
          lastPaint.current = performance.now();
          flush();
        });
      }}
      onPointerUp={(event) => {
        if (!drag.current) return;
        const mult = event.shiftKey ? 10 : 1;
        const steps = Math.round(event.clientX - drag.current.x) * mult;
        const next = quantize(drag.current.value + steps * step);
        drag.current = null;
        setDrawing(false);
        if (frame.current) cancelAnimationFrame(frame.current);
        frame.current = 0;
        pending.current = null;
        onChange(next);
        onCommit(next);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
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
