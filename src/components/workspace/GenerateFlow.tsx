"use client";

import { useState } from "react";
import { MARKERS } from "@/lib/generate";
import { examples } from "@/lib/examples";
import { useWorkspace } from "./Workspace";

const PALETTES = [
  { id: "snow", label: "Snow inks" },
  { id: "ink", label: "Ink only" },
];

export function GenerateFlow() {
  const { state, setState } = useWorkspace();
  const [screen, setScreen] = useState<"a" | "b">("a");
  const [strikes, setStrikes] = useState<number[]>([]);
  return (
    <div className="gen-screen">
      <p className="hero-kicker">Generate · {screen === "a" ? "Rule" : "Edition"}</p>
      {screen === "a" ? (
        <>
          <h1>Rule, variance, palette</h1>
          <p>These three stay on one surface. Edition and curation are the next screen.</p>
          <label htmlFor="gen-rule">Rule</label>
          <select id="gen-rule" value={state.rule} onChange={(event) => setState({ rule: event.target.value })}>
            {examples.map((item) => (
              <option key={item.rule + item.slug} value={item.rule}>{item.title}</option>
            ))}
          </select>
          <label htmlFor="gen-var">Variance</label>
          <select id="gen-var" value={state.var} onChange={(event) => setState({ var: event.target.value })}>
            <option value="rng">Seed only</option>
            <option value="time">Clock, stored as the moment you generate</option>
          </select>
          <label htmlFor="gen-palette">Palette</label>
          <select id="gen-palette" value={state.palette} onChange={(event) => setState({ palette: event.target.value })}>
            {PALETTES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <div className="gen-actions">
            <button type="button" className="is-primary" onClick={() => setScreen("b")}>Edition and curation</button>
          </div>
        </>
      ) : (
        <>
          <h1>Edition, rarity, grid</h1>
          <p>Markers are maximum editions from Art Blocks project pages. They are context, not snap points.</p>
          <label htmlFor="gen-n">Edition size {state.n.toLocaleString()}</label>
          <input id="gen-n" type="range" min={1} max={10000} value={state.n} onChange={(event) => setState({ n: Number(event.target.value) })} />
          <ul>
            {MARKERS.map((marker) => (
              <li key={marker.label}>
                {marker.href ? <a href={marker.href}>{marker.label}</a> : marker.label}
                {" — "}
                {marker.note}
              </li>
            ))}
          </ul>
          <div className="edition-grid">
            {Array.from({ length: Math.min(16, state.n) }, (_, index) => {
              const struck = strikes.includes(index);
              return (
                <button key={index} type="button" aria-pressed={struck} onClick={() => setStrikes((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])}>
                  <span style={{ opacity: struck ? 0.32 : 1 }} />
                  #{index + 1}
                </button>
              );
            })}
          </div>
          <p>{strikes.length ? `${strikes.length} held out as outliers.` : "Tap a tile to hold it out."}</p>
          <div className="gen-actions">
            <button type="button" onClick={() => setScreen("a")}>Back to the rule</button>
            <button type="button" className="is-primary" onClick={() => setState({ n: 1 })}>1 of 1</button>
            <button type="button" onClick={() => setState({ n: Math.max(state.n, 16) })}>Collection</button>
          </div>
        </>
      )}
    </div>
  );
}
