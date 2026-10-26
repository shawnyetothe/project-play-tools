"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Rich } from "@/components/RichText";
import { SketchPad } from "@/components/SketchPad";
import { STARTERS } from "@/components/sketches";
import { matchPlay, matchRules, type FileHint } from "@/lib/play-match";
import { suggestEmail } from "@/lib/site";

export type PlayTool = { id: string; plain: string; name: string; humanity: string; sketch: string | null };
export type PlayRecipe = { slug: string; plain: string; title: string };

export function PlayFlow({ tools, recipes }: { tools: PlayTool[]; recipes: PlayRecipe[] }) {
  const [note, setNote] = useState("");
  const [file, setFile] = useState<FileHint | null>(null);
  const byId = useMemo(() => new Map(tools.map((tool) => [tool.id, tool])), [tools]);
  const byRecipe = useMemo(() => new Map(recipes.map((recipe) => [recipe.slug, recipe])), [recipes]);
  const match = useMemo(() => matchPlay(note, file), [note, file]);
  const recipeIds = [...new Set(match.tools.flatMap((tool) => tool.recipes))];

  return (
    <section className="wrap play" id="play" aria-labelledby="play-title">
      <h2 id="play-title">Play</h2>
      <p className="lede">Three steps. The match runs in this browser. Nothing is sent.</p>
      <p>
        If you are giving feedback, type a real message. Then say whether the tool it opens is the one you would have handed them.{" "}
        <Link href="/about/">About</Link> explains “No verified image yet.”
        {suggestEmail ? (
          <>
            {" "}
            <a
              href={`mailto:${suggestEmail}?subject=${encodeURIComponent("Play Tools: did this open the right tool?")}&body=${encodeURIComponent("The message I tried:\n\nThe tool it opened:\n\nThe tool I would have handed them:\n")}`}
            >
              Email that note
            </a>
            .
          </>
        ) : null}
      </p>
      <ol className="play-steps">
        <li id="message">
          <h3>The Message</h3>
          <p className="tech">What you want to say.</p>
          <label htmlFor="play-note">A note, a phrase, or a lyric</label>
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
            type="file"
            onChange={(event) => {
              const picked = event.target.files?.[0];
              setFile(picked ? { name: picked.name, type: picked.type } : null);
            }}
          />
          <p className="quiet">
            We use the file name and type only. The file is not read and not sent. There is no account and no model call.
          </p>
        </li>
        <li id="medium">
          <h3>The Medium</h3>
          <p className="tech">Your tool or tools of choice.</p>
          <details>
            <summary>How a match is chosen</summary>
            <ul className="steps">
              {matchRules.map((rule) => (
                <li key={rule.id}>{rule.explain}</li>
              ))}
            </ul>
          </details>
          {match.tools.length ? (
            <div aria-live="polite">
              <p className="quiet">
                One medium matched. Open {byId.get(match.primary?.toolId ?? "")?.plain ?? "the first tool"} first. The others are the same medium.
              </p>
              <ul className="steps">
                {match.rules.map((rule) => (
                  <li key={`${rule.id}-${rule.detail}`}>
                    <strong>{rule.id}. </strong>
                    {rule.detail}
                  </li>
                ))}
              </ul>
              <ul className="suggest-list">
                {match.tools.map((hit) => {
                  const tool = byId.get(hit.id);
                  if (!tool) return null;
                  return (
                    <li key={hit.id}>
                      <Link href={`/tools/${tool.id}/`}>
                        <span className="plain">{tool.plain}</span>
                        {tool.plain !== tool.name ? <span className="tech">{tool.name}</span> : null}
                      </Link>
                      <ul>
                        {hit.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
              {recipeIds.length ? (
                <p>
                  Recipe{recipeIds.length > 1 ? "s" : ""}:{" "}
                  {recipeIds.map((slug, index) => {
                    const recipe = byRecipe.get(slug);
                    if (!recipe) return null;
                    return (
                      <span key={slug}>
                        {index > 0 ? " · " : null}
                        <Link href={`/recipes/${recipe.slug}/`}>{recipe.plain}</Link>
                      </span>
                    );
                  })}
                  . Each recipe ends with Publish with ABX.
                </p>
              ) : null}
            </div>
          ) : (
            <p>Add a note or a file. Matching tools show up here, with the reason beside each one.</p>
          )}
        </li>
        <li id="maker">
          <h3>The Maker</h3>
          <p className="tech">Self-expression.</p>
          <p>The tool is the medium. You decide what stays, and when to stop.</p>
          {match.primary ? (
            <MakerStart
              tool={byId.get(match.primary.toolId)}
              recipe={match.primary.recipe ? byRecipe.get(match.primary.recipe) : undefined}
            />
          ) : (
            <p>After a match, this step opens one tool, runs its sketch, and links the recipe. The recipe ends with Publish with ABX.</p>
          )}
        </li>
      </ol>
    </section>
  );
}

function MakerStart({ tool, recipe }: { tool: PlayTool | undefined; recipe: PlayRecipe | undefined }) {
  if (!tool) return <p>That tool is not in this guide.</p>;
  const starter = tool.sketch ? STARTERS[tool.sketch] : "";
  return (
    <div>
      <p>
        Open <Link href={`/tools/${tool.id}/`}>{tool.plain}</Link> first.
        {tool.plain !== tool.name ? <span className="tech"> {tool.name}</span> : null}
      </p>
      {tool.humanity ? (
        <p>
          <Rich text={tool.humanity} /> <span className="quiet">A prompt from this tool’s notes.</span>
        </p>
      ) : null}
      {starter && tool.sketch ? (
        <SketchPad kind={tool.sketch} initial={starter} autoRun />
      ) : (
        <p>This tool has no live sketch in the guide. The page has the steps.</p>
      )}
      {recipe ? (
        <p>
          Recipe: <Link href={`/recipes/${recipe.slug}/`}>{recipe.plain}</Link>. It ends with Publish with ABX.
        </p>
      ) : (
        <p className="quiet">This medium has no recipe in the guide. The sketch is the start.</p>
      )}
    </div>
  );
}
