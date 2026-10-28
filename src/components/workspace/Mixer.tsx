"use client";

import { useState } from "react";

const PAIRS = [
  ["flow field", "dither"],
  ["orbit", "noise"],
  ["walk", "tiles"],
];

export function Mixer() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h2>Effect mixer</h2>
      <p>Pairings are labeled “try this pairing.” This pull does not count how often named effects are combined.</p>
      {open ? (
        <ul>
          {PAIRS.map(([a, b]) => (
            <li key={a + b}>try this pairing · {a} + {b}</li>
          ))}
        </ul>
      ) : (
        <button type="button" onClick={() => setOpen(true)}>Show pairings</button>
      )}
    </section>
  );
}
