"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Rich } from "@/components/RichText";
import { SketchPad } from "@/components/SketchPad";
import { STARTERS } from "@/components/sketches";
import {
  makerStarts,
  matchMedium,
  matchPlay,
  matchRules,
  playMedia,
  type FileHint,
  type PlayMatch,
} from "@/lib/play-match";
import { suggestEmail } from "@/lib/site";

export type PlayTool = { id: string; plain: string; name: string; humanity: string; sketch: string | null };
export type PlayRecipe = { slug: string; plain: string; title: string };

type Door = "message" | "medium" | "maker";

const doors: { id: Door; name: string; hint: string }[] = [
  { id: "message", name: "Message", hint: "What you want to say" },
  { id: "medium", name: "Medium", hint: "What it is made of" },
  { id: "maker", name: "Maker", hint: "How you want to work" },
];

const emptyMatch: PlayMatch = { tools: [], rules: [], primary: null };

const feedbackHref = suggestEmail
  ? `mailto:${suggestEmail}?subject=${encodeURIComponent("Play Tools: did this open the right tool?")}&body=${encodeURIComponent("Where I began:\n\nThe tool it opened:\n\nThe tool I would have handed them:\n")}`
  : "";

export function PlayFlow({ tools, recipes }: { tools: PlayTool[]; recipes: PlayRecipe[] }) {
  const [door, setDoor] = useState<Door | null>(null);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<FileHint | null>(null);
  const [mediumId, setMediumId] = useState<string | null>(null);
  const [mediumNote, setMediumNote] = useState("");
  const [makerId, setMakerId] = useState<string | null>(null);
  const [makerNote, setMakerNote] = useState("");

  const byId = useMemo(() => new Map(tools.map((tool) => [tool.id, tool])), [tools]);
  const byRecipe = useMemo(() => new Map(recipes.map((recipe) => [recipe.slug, recipe])), [recipes]);

  const match = useMemo(() => {
    if (door === "message") return note.trim() || file ? matchPlay(note, file) : emptyMatch;
    if (door === "medium") {
      if (mediumNote.trim().length >= 2) return matchPlay(mediumNote, null);
      if (mediumId) return matchMedium(mediumId);
      return emptyMatch;
    }
    if (door === "maker") {
      if (makerNote.trim().length >= 2) return matchPlay(makerNote, null);
      const start = makerStarts.find((item) => item.id === makerId);
      if (start) return matchMedium(start.medium);
      return emptyMatch;
    }
    return emptyMatch;
  }, [door, note, file, mediumId, mediumNote, makerId, makerNote]);

  function chooseDoor(next: Door) {
    setDoor(next);
  }

  return (
    <section className="wrap play" id="play" aria-labelledby="play-title">
      <h2 id="play-title">Begin</h2>
      <p className="lede">Start from one place. The tools follow. Nothing is sent.</p>
      <fieldset className="begin">
        <legend>Where do you want to begin?</legend>
        <div className="begin-choices">
          {doors.map((item) => (
            <label key={item.id} className={door === item.id ? "is-on" : undefined}>
              <input
                type="radio"
                name="begin"
                value={item.id}
                checked={door === item.id}
                onChange={() => chooseDoor(item.id)}
              />
              <span className="begin-name">{item.name}</span>
              <span className="quiet">{item.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {door === "message" ? (
        <div className="begin-panel" id="message">
          <h3>Add a message</h3>
          <p>A note, a phrase, or a lyric. That line is the beginning.</p>
          <label htmlFor="play-note">Your message</label>
          <textarea
            id="play-note"
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="a lullaby I hum to my kids"
          />
          <label htmlFor="play-file">Or a file. It stays on this device.</label>
          <input
            id="play-file"
            key={file ? file.name : "no-file"}
            type="file"
            onChange={(event) => {
              const picked = event.target.files?.[0];
              setFile(picked ? { name: picked.name, type: picked.type } : null);
            }}
          />
          {file ? (
            <p className="quiet">
              {file.name}
              {file.type ? ` · ${file.type}` : ""}. The file is not read.{" "}
              <button type="button" className="ghost" onClick={() => setFile(null)}>
                Remove file
              </button>
            </p>
          ) : (
            <p className="quiet">We use the file name and type only. There is no account and no model call.</p>
          )}
        </div>
      ) : null}

      {door === "medium" ? (
        <div className="begin-panel" id="medium">
          <h3>Choose a medium</h3>
          <p>Pick the stuff the work is made of, or name your own. That choice is the beginning.</p>
          <div className="chip-row" role="group" aria-label="Mediums">
            {playMedia.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chip"
                aria-pressed={mediumId === item.id && mediumNote.trim().length < 2}
                onClick={() => {
                  setMediumId(item.id);
                  setMediumNote("");
                }}
              >
                {item.label}
                <span className="quiet">{item.hint}</span>
              </button>
            ))}
          </div>
          <label htmlFor="medium-note">Or name a medium in your own words</label>
          <input
            id="medium-note"
            value={mediumNote}
            onChange={(event) => setMediumNote(event.target.value)}
            placeholder="ink, cloth, a slow clock"
          />
        </div>
      ) : null}

      {door === "maker" ? (
        <div className="begin-panel" id="maker">
          <h3>Begin as the maker</h3>
          <p>Choose a way of working, or add your own. That line is the beginning.</p>
          <div className="chip-row" role="group" aria-label="Ways of working">
            {makerStarts.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chip"
                aria-pressed={makerId === item.id && makerNote.trim().length < 2}
                onClick={() => {
                  setMakerId(item.id);
                  setMakerNote("");
                }}
              >
                {item.label}
                <span className="quiet">{item.hint}</span>
              </button>
            ))}
          </div>
          <label htmlFor="maker-note">Or add your own beginning</label>
          <textarea
            id="maker-note"
            rows={3}
            value={makerNote}
            onChange={(event) => setMakerNote(event.target.value)}
            placeholder="I want to work with my hands, slowly"
          />
        </div>
      ) : null}

      <div className="play-result" aria-live="polite">
        {door && match.tools.length ? (
          <MatchResult match={match} byId={byId} byRecipe={byRecipe} />
        ) : door ? (
          <p>Add something above. The matching tools show up here, with the reason beside each one.</p>
        ) : (
          <p className="quiet">Pick message, medium, or maker. Then add the thing that starts the work.</p>
        )}
      </div>

      <details>
        <summary>How a match is chosen</summary>
        <ul className="steps">
          {matchRules.map((rule) => (
            <li key={rule.id}>{rule.explain}</li>
          ))}
        </ul>
      </details>
      <p className="quiet">
        If you are giving feedback, say whether the tool is the one you would have handed them. <Link href="/about/">About</Link> explains “No verified image yet.”
        {feedbackHref ? (
          <>
            {" "}
            <a href={feedbackHref}>Email that note</a>.
          </>
        ) : null}
      </p>
    </section>
  );
}

function MatchResult({
  match,
  byId,
  byRecipe,
}: {
  match: PlayMatch;
  byId: Map<string, PlayTool>;
  byRecipe: Map<string, PlayRecipe>;
}) {
  const primary = match.primary ? byId.get(match.primary.toolId) : undefined;
  const recipe = match.primary?.recipe ? byRecipe.get(match.primary.recipe) : undefined;
  const starter = primary?.sketch ? STARTERS[primary.sketch] : "";

  return (
    <div>
      <h3>Tools for this beginning</h3>
      <ul className="suggest-list">
        {match.tools.map((hit) => {
          const tool = byId.get(hit.id);
          if (!tool) return null;
          const first = hit.id === match.primary?.toolId;
          return (
            <li key={hit.id}>
              <Link href={`/tools/${tool.id}/`}>
                <span className="plain">{tool.plain}</span>
                {tool.plain !== tool.name ? <span className="tech">{tool.name}</span> : null}
              </Link>
              {first ? <p className="quiet">Open this one first.</p> : null}
              <ul>
                {hit.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      {primary ? (
        <div className="begin-sketch">
          {primary.humanity ? (
            <p>
              <Rich text={primary.humanity} /> <span className="quiet">A prompt from this tool’s notes.</span>
            </p>
          ) : null}
          {starter && primary.sketch ? (
            <SketchPad kind={primary.sketch} initial={starter} autoRun />
          ) : (
            <p>This tool has no live sketch in the guide. The page has the steps.</p>
          )}
          {recipe ? (
            <p>
              Recipe: <Link href={`/recipes/${recipe.slug}/`}>{recipe.plain}</Link>. It ends with Publish with ABX.
            </p>
          ) : (
            <p className="quiet">This beginning has no recipe in the guide. The sketch is the start.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
