import type { Metadata } from "next";
import Link from "next/link";
import { PublishWithAbx } from "@/components/PublishWithAbx";
import { Rich } from "@/components/RichText";
import { meta } from "@/lib/data";

export const metadata: Metadata = { title: "Publish, protect, monetize" };

export default function AbxPage() {
  const abx = meta.abx;
  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / ABX
      </p>
      <h1>Publish, protect, monetize</h1>
      <p className="lede">
        ABX is Art Blocks’ open protocol and toolkit for putting digital objects on a blockchain. Anyone can deploy. There is no application. The curated flagship and Studio still use their own path.{" "}
        <a href="https://abx.io">abx.io</a> is Art Blocks’ own site. Docs:{" "}
        <a href="https://docs.abx.io/docs/using-abx/guides/deploy-a-digital-asset">deploy a digital asset</a>.
      </p>
      <p>
        You can deploy a whole folder of files as a numbered series (<code>abx deploy-series --dir ./art</code>). Uploads can go to Arweave, IPFS, or cloud storage. <code>abx mint-page</code> generates a static mint page. ETH sales for now.
      </p>
      <ul className="steps">
        {abx.intro.map((line) => (
          <li key={line.slice(0, 40)}>
            <Rich text={line.replace(/\*\*/g, "")} />
          </li>
        ))}
      </ul>
      <PublishWithAbx />
      <h2>How the newer token tools plug in</h2>
      {abx.pluginLead ? (
        <p>
          <Rich text={abx.pluginLead} />
        </p>
      ) : null}
      {abx.plugins.map((plugin) => (
        <section key={plugin.title}>
          <h3>{plugin.title}</h3>
          <p>
            <Rich text={plugin.body} />
          </p>
        </section>
      ))}
      <h2>What is still uncertain</h2>
      <ul className="steps">
        {abx.uncertainties.map((line) => (
          <li key={line.slice(0, 32)}>
            <Rich text={line.replace(/\*\*/g, "")} />
          </li>
        ))}
      </ul>
      <p className="quiet">
        These notes were read from Art Blocks and ABX docs on October 25, 2026. The source file in this repo is <code>data/source/abx-notes.md</code>.
      </p>
    </div>
  );
}
