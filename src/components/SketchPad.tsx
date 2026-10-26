"use client";

import { useState } from "react";
import { sketchNeedsSound, sketchSrcdoc } from "./sketches";

export function SketchPad({ kind, initial }: { kind: string; initial: string }) {
  const [code, setCode] = useState(initial);
  const [doc, setDoc] = useState("");

  return (
    <div className="sketch">
      <label htmlFor="sketch-code">Starter sketch. Edit it, then press Run.</label>
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
        <p className="preview-wait">Press Run to preview the sketch.</p>
      )}
    </div>
  );
}
