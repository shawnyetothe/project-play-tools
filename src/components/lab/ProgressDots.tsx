"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { id: "play", label: "Play" },
  { id: "lineage", label: "Lineage" },
  { id: "listen", label: "Listen" },
  { id: "find", label: "Find" },
  { id: "make", label: "Make" },
  { id: "publish", label: "Publish" },
];

export function ProgressDots() {
  const [current, setCurrent] = useState("play");

  useEffect(() => {
    const nodes = STEPS.map((step) => document.getElementById(step.id)).filter((node): node is HTMLElement => !!node);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setCurrent(visible.target.id);
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0.1, 0.3, 0.6] },
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="seed-dots" aria-label="How far the seed has gone">
      {STEPS.map((step, index) => (
        <a key={step.id} href={`#${step.id}`} aria-current={current === step.id ? "true" : undefined}>
          <span className="dot" aria-hidden="true" />
          <span className="sr-only">
            {index + 1}. {step.label}
          </span>
          <span aria-hidden="true">{step.label}</span>
        </a>
      ))}
    </nav>
  );
}
