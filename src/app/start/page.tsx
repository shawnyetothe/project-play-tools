import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Start here" };

export default function StartPage() {
  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / Start here
      </p>
      <h1>Start here</h1>
      <p className="lede">Three steps, in this order.</p>
      <ol className="steps">
        <li>
          <strong>The Message.</strong> What you want to say. On <Link href="/#play">Play</Link>, write a note, a phrase, or a lyric. Or choose a file. It stays in the browser.
        </li>
        <li>
          <strong>The Medium.</strong> Your tool or tools. The page matches keywords, themes, and file types against the 100-tool dataset, and says why. Open a tool, then a recipe.
        </li>
        <li>
          <strong>The Maker.</strong> Self-expression. A short prompt from the tool notes. You decide what stays, and when to stop. The recipe ends with <Link href="/abx/">Publish with ABX</Link> on a test network first.
        </li>
      </ol>
      <p>
        <Link href="/#play">Play</Link>
        {" · "}
        <Link href="/tools/">All tools</Link>
        {" · "}
        <Link href="/explore/">Explore the data</Link>
      </p>
    </div>
  );
}
