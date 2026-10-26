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
      <p className="lede">Start from one place. The tools follow.</p>
      <ul className="steps">
        <li>
          <strong>Message.</strong> What you want to say. On <Link href="/#play">Begin</Link>, add a note, a phrase, a lyric, or a file. It stays in the browser.
        </li>
        <li>
          <strong>Medium.</strong> What it is made of. Choose sound, a pen, cloth, or name your own. The page matches that choice to tools and says why.
        </li>
        <li>
          <strong>Maker.</strong> How you want to work. Choose a way of working, or add your own beginning. You decide what stays, and when to stop. A recipe, when there is one, ends with <Link href="/abx/">Publish with ABX</Link>.
        </li>
      </ul>
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
