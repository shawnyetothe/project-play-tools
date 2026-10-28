"use client";

import { useState } from "react";
import { SEED_KEY, readPiece, readStoredPiece } from "@/lib/seed";

export function AgentPrompt({
  name,
  plain,
  category,
  firstProject,
  starter,
  licenseNotes,
}: {
  name: string;
  plain: string;
  category: string;
  firstProject: string;
  starter: string;
  licenseNotes: string;
}) {
  const [note, setNote] = useState("");

  async function copy() {
    const fromUrl = readPiece(window.location.search);
    const stored = fromUrl || readStoredPiece();
    const seed = stored?.seed || "none";
    const make = stored?.phrase || "";
    const door = stored?.door || "";
    const tool = stored ? String(stored.tool + 1) : "";
    const params = new URLSearchParams();
    if (seed !== "none") params.set("seed", seed);
    if (door) params.set("door", door);
    if (tool) params.set("tool", tool);
    if (make) params.set("make", make);
    const seedUrl = `${window.location.origin}/lab/composed/${params.toString() ? `?${params}` : ""}`;
    const prompt = [
      "Build an original first sketch. Do not copy or redraw an existing artwork.",
      "",
      `Tool: ${name}`,
      `Plain name: ${plain}`,
      `Category: ${category}`,
      `First project to try: ${firstProject || "None recorded."}`,
      `Starter page: ${starter}`,
      `License: ${licenseNotes}`,
      "",
      `Visitor seed: ${seed}`,
      `Phrase: ${make || "none"}`,
      `Door: ${door || "unset"}`,
      `Seed URL: ${seedUrl}`,
      `Local storage key: ${SEED_KEY}`,
      "",
      "Use the seed as the random seed. Write a small original sketch and say how to run it. Do not send the seed to a server.",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(prompt);
      setNote("Prompt copied.");
    } catch {
      setNote(prompt);
    }
  }

  return (
    <p>
      <button type="button" className="ghost" onClick={() => void copy()}>
        Copy agent prompt
      </button>
      {note ? <span className="quiet"> {note.startsWith("Prompt") ? note : "Copy blocked. The prompt is below."}</span> : null}
      {note && !note.startsWith("Prompt") ? <pre>{note}</pre> : null}
    </p>
  );
}
