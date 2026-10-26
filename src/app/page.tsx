import Link from "next/link";
import { meta } from "@/lib/data";

export default function HomePage() {
  const { counts } = meta;
  return (
    <div className="wrap">
      <p className="quiet">A guide for artists. Plain words first.</p>
      <h1>What do you want to make?</h1>
      <p className="lede">
        Pick a kind of work. Each choice shows tools and a recipe. The tables sit one step further in, under Explore the data.
      </p>
      <div className="choice-grid">
        {meta.paths.map((path) => (
          <Link key={path.slug} href={`/make/${path.slug}/`} className="choice">
            <span className="plain">{path.plain}</span>
            <span className="line">{path.line}</span>
            <span className="tech">{path.blurb}</span>
          </Link>
        ))}
      </div>
      <p>
        <Link href="/start/">Start here</Link> if you are new. It is a short path, then a test publish.
      </p>
      <p>
        <Link href="/explore/">Explore the data</Link>
        {" · "}
        {counts.artists.toLocaleString()} artists, {counts.projects.toLocaleString()} projects, pulled {meta.pulledLabel}.
      </p>
      <p className="quiet">
        Names come from the public Art Blocks record. We do not feature anyone beyond that record without consent.
      </p>
    </div>
  );
}
