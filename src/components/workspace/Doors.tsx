"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "./Workspace";

const MAKERS = [
  { id: "new", label: "New to code" },
  { id: "designer", label: "Designer" },
  { id: "musician", label: "Musician" },
  { id: "artist", label: "Artist" },
];

export function Doors() {
  const { state, setState } = useWorkspace();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!state.interacted) {
      setOpen(false);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setOpen(true), reduced ? 0 : 400);
    return () => window.clearTimeout(timer);
  }, [state.interacted]);

  if (!open) return null;
  return (
    <div className="door-stack" data-doors="open">
      <p>Pick a way in</p>
      {(
        [
          ["message", "Message", "Say something"],
          ["medium", "Medium", "Make something"],
          ["maker", "Maker", "Find your style"],
        ] as const
      ).map(([id, label, detail]) => (
        <button key={id} type="button" aria-pressed={state.door === id} onClick={() => setState({ door: id, pick: id === "maker" ? state.pick : "" })}>
          <strong>{label}</strong>
          <span>{detail}</span>
        </button>
      ))}
      {state.door === "maker" ? (
        <div className="maker-row" data-makers="open">
          {MAKERS.map((maker) => (
            <button key={maker.id} type="button" aria-pressed={state.pick === maker.id} onClick={() => setState({ pick: maker.id })}>
              {maker.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
