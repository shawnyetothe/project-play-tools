import type { Metadata } from "next";
import Link from "next/link";
import { meta, toolById } from "@/lib/data";

export const metadata: Metadata = { title: "Start here" };

export default function StartPage() {
  const p5 = toolById.get("p5");
  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / Start here
      </p>
      <h1>Start here</h1>
      <p className="lede">Five steps. Then stop and look at what you made.</p>
      <ol className="steps">
        <li>
          Say <Link href="/">what you want to make</Link>: paper, fabric, an object, sound, a screen, something that changes, or something that acts on its own.
        </li>
        <li>
          Open one tool. New to code? Start with{" "}
          {p5 ? <Link href={`/tools/${p5.id}/`}>{p5.plain}</Link> : "p5.js"} ({p5?.name}). It is free. It is the library on {meta.counts.p5.toLocaleString()} projects in this dataset.
        </li>
        <li>On that tool page, press Run. Change one line. Press Run again.</li>
        <li>
          Follow one <Link href="/recipes/">recipe</Link>. Keep it small.
        </li>
        <li>
          Publish on a test network first. Base Sepolia is the ABX default. Read the warning: ABX is prerelease and not independently audited. <Link href="/abx/">Publish, protect, monetize</Link>.
        </li>
      </ol>
      <p>
        <Link href="/tools/">All tools</Link>
        {" · "}
        <Link href="/explore/">Explore the data</Link>
      </p>
    </div>
  );
}
