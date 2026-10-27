import type { Metadata } from "next";
import Link from "next/link";
import { Legend } from "@/components/Tags";
import { meta } from "@/lib/data";

export const metadata: Metadata = { title: "How to read this" };

export default function AboutPage() {
  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / How to read this
      </p>
      <h1>How to read this</h1>
      <p>PlayTools is an independent project, not affiliated with Art Blocks.</p>
      <p className="quiet">Logo mark: Chromie Squiggle #3937 by Snowfro, owned by Shawn Cheng, shown unaltered.</p>
      <p>
        The record is the public Art Blocks API ({meta.api}), pulled {meta.pulledLabel}. It covers {meta.counts.projects.toLocaleString()} projects and {meta.counts.artists.toLocaleString()} artists, plus one never-minted Factory project read from the token API.
      </p>
      <Legend />
      <ul className="steps">
        <li>
          <span className="mark mark-sourced">sourced</span> means the line has a link in the notes.
        </li>
        <li>
          <span className="mark mark-estimate">estimate</span> means a rough figure, not a quoted price.
        </li>
        <li>
          <span className="mark mark-ours">our inference</span> or <span className="mark mark-ours">our suggestion</span> is our reading, not a platform promise.
        </li>
        <li>
          <span className="mark mark-gap">gap</span> means the pages we read did not say.
        </li>
      </ul>
      <p>
        {meta.counts.claims} verified claims cover {meta.counts.verifiedArtists} artists. The other artists have not been researched. Dashed guesses can be metaphors. Where a verified claim covers a guess, the guess is dropped.
      </p>
      <p>
        mio, the Generative Goods clicker, is off Art Blocks. It is not in the project or artist counts. Its custom PCB line is an owner note, not a web source.
      </p>
      <p>
        Name variants are merged and shown as “aka”. Collaborations stay separate and are linked. Shared wallets alone were not treated as proof of one person.
      </p>
      <p>
        Images load from their original URLs. Each one shows the artist and the license, and links back to the source. If the dataset says there is no verified image, the page says “No verified image yet.” We do not generate stand-in artworks.
      </p>
      <p>
        <Link href="/explore/">Explore the data</Link>
        {" · "}
        <a href="#suggest">Suggest a fix</a>
        {" · "}
        <a href="?suggest=removal#suggest">Request removal</a>
      </p>
    </div>
  );
}
