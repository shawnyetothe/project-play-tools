"use client";

import { useEffect, useState } from "react";
import { sketchLoops, sketchNeedsSound, sketchSrcdoc } from "./sketches";

export function SketchPad({ kind, initial, autoRun = true }: { kind: string; initial: string; autoRun?: boolean }) {
  const [code, setCode] = useState(initial);
  const [doc, setDoc] = useState("");
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wait = autoRun && media.matches && sketchLoops(kind);
    setHeld(wait);
    setCode(initial);
    setDoc(autoRun && !wait ? sketchSrcdoc(kind, initial) : "");
  }, [autoRun, kind, initial]);

  return (
    <div className="sketch">
      <label htmlFor="sketch-code">
        {doc ? "Starter sketch. It is running. Edit it, then press Run." : "Starter sketch. Edit it, then press Run."}
      </label>
      <textarea
        id="sketch-code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        spellCheck={false}
        rows={14}
      />
      <div className="row">
        <button
          type="button"
          onClick={() => setDoc(sketchSrcdoc(kind, code))}
        >
          Run
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => {
            setCode(initial);
            setDoc("");
          }}
        >
          Reset
        </button>
      </div>
      <p className="quiet">
        This starter was written for this guide. It is not an Art Blocks project. It runs in a sandbox and cannot read this page.
        {sketchNeedsSound(kind) ? " Browsers block autoplay. Press Start sound inside the preview. [estimate]" : ""}
      </p>
      {doc ? (
        <iframe title="Sketch preview" sandbox="allow-scripts" srcDoc={doc} className="sketch-frame" />
      ) : (
        <p className="preview-wait">
          {held ? "Motion is reduced, so this preview waits. Press Run to start it." : "Press Run to preview the sketch."}
        </p>
      )}
    </div>
  );
}
