"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { githubRepo, suggestEmail, suggestKinds, type SuggestKind } from "@/lib/site";

function buildBody(input: {
  kind: string;
  page: string;
  name: string;
  about: string;
  details: string;
  source: string;
}) {
  const kindLabel = suggestKinds.find((item) => item.id === input.kind)?.label ?? input.kind;
  return [
    "Play Tools — suggestion for review",
    "",
    "Nothing in this message is published automatically.",
    "Nothing goes live until a person reviews it.",
    "Artists are never listed or featured beyond the public Art Blocks record without consent.",
    "",
    `Kind: ${kindLabel}`,
    `Page: ${input.page}`,
    `Name: ${input.name || "(not given)"}`,
    `About: ${input.about || "(not given)"}`,
    `Source: ${input.source || "(none)"}`,
    "",
    "Details:",
    input.details,
  ].join("\n");
}

export function SuggestForm() {
  const pathname = usePathname() || "/";
  const params = useSearchParams();
  const preset = params.get("suggest");
  const initialKind: SuggestKind = suggestKinds.some((item) => item.id === preset)
    ? (preset as SuggestKind)
    : "fix";
  const [kind, setKind] = useState<SuggestKind>(initialKind);
  const [name, setName] = useState("");
  const [about, setAbout] = useState(params.get("about") || "");
  const [details, setDetails] = useState("");
  const [source, setSource] = useState("");
  const [consent, setConsent] = useState(false);
  const [note, setNote] = useState("");

  const page = useMemo(() => {
    if (typeof window === "undefined") return pathname;
    return window.location.origin + pathname;
  }, [pathname]);

  const body = buildBody({ kind, page, name, about, details, source });
  const ready = consent && details.trim().length > 0;
  const subject = `Play Tools: ${suggestKinds.find((item) => item.id === kind)?.label ?? "suggestion"}`;

  function mailto() {
    const short = body.length > 1500 ? `${body.slice(0, 1400)}\n\n[truncated — paste the full text from the box]` : body;
    const href = `mailto:${suggestEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(short)}`;
    window.location.href = href;
  }

  function github() {
    if (!githubRepo) return;
    const short = body.length > 1500 ? `${body.slice(0, 1400)}\n\n[truncated — paste the full text from the box]` : body;
    const href = `https://github.com/${githubRepo}/issues/new?title=${encodeURIComponent(subject)}&body=${encodeURIComponent(short)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setNote("Copied. Send it for review. Nothing is published from this page.");
    } catch {
      setNote("Select the text in the box and copy it.");
    }
  }

  return (
    <form
      id="suggest"
      className="suggest"
      onSubmit={(event) => {
        event.preventDefault();
        if (!ready) return;
        void copy();
      }}
    >
      <h2>Suggest a tool, example, or fix</h2>
      <p>
        This is a moderation queue, not a live edit. Nothing goes live until a person reviews it. Artists are never listed or featured beyond the public Art Blocks record without consent.
      </p>
      <label htmlFor="suggest-kind">What is this?</label>
      <select
        id="suggest-kind"
        value={kind}
        onChange={(event) => setKind(event.target.value as SuggestKind)}
      >
        {suggestKinds.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      <label htmlFor="suggest-name">Your name (optional)</label>
      <input id="suggest-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
      <label htmlFor="suggest-about">Artist, tool, or page this is about</label>
      <input id="suggest-about" value={about} onChange={(event) => setAbout(event.target.value)} />
      <label htmlFor="suggest-details">What should change?</label>
      <textarea id="suggest-details" required value={details} onChange={(event) => setDetails(event.target.value)} rows={5} />
      <label htmlFor="suggest-source">Source link, if you have one</label>
      <input id="suggest-source" type="url" value={source} onChange={(event) => setSource(event.target.value)} placeholder="https://" />
      <label className="check">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>I understand nothing is published until it is reviewed.</span>
      </label>
      <label htmlFor="suggest-preview">Submission</label>
      <textarea id="suggest-preview" readOnly value={body} rows={8} />
      <div className="row">
        <button type="submit" disabled={!ready}>
          Copy submission
        </button>
        <button type="button" className="ghost" disabled={!ready} onClick={mailto}>
          Email this
        </button>
        {githubRepo ? (
          <button type="button" className="ghost" disabled={!ready} onClick={github}>
            Open a GitHub issue
          </button>
        ) : null}
      </div>
      {!githubRepo ? (
        <p className="quiet">
          Email opens a draft in your mail app{suggestEmail ? ` to ${suggestEmail}` : ""}. Set <code>NEXT_PUBLIC_GITHUB_REPO</code> to also open a prefilled GitHub issue. Nothing is stored on this site.
        </p>
      ) : null}
      {note ? <p role="status">{note}</p> : null}
    </form>
  );
}
