import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sitemapLetterLabel } from "@/lib/site-map";

export const dynamicParams = false;

type LetterFile = { items: { slug: string; name: string; path: string }[] };

function readLetters(): { id: string }[] {
  const index = JSON.parse(readFileSync(join(process.cwd(), "public/sitemap.json"), "utf8")) as {
    sections: { artists: { id: string }[] };
  };
  return index.sections.artists;
}

function readLetter(letter: string): LetterFile {
  return JSON.parse(readFileSync(join(process.cwd(), "public/sitemap/artists", `${letter}.json`), "utf8")) as LetterFile;
}

export function generateStaticParams() {
  return readLetters().map((letter) => ({ letter: letter.id }));
}

export function generateMetadata({ params }: { params: Promise<{ letter: string }> }): Promise<Metadata> {
  return params.then(({ letter }) => ({ title: `Artists ${sitemapLetterLabel(letter)} · Site map` }));
}

export default async function ArtistLetterPage({ params }: { params: Promise<{ letter: string }> }) {
  const { letter } = await params;
  const known = readLetters().some((item) => item.id === letter);
  if (!known) notFound();
  const rows = readLetter(letter).items;
  return (
    <article className="wrap site-map">
      <p>
        <Link href="/sitemap/">Site map</Link>
        {" · "}
        <Link href="/sitemap/artists/">Artists</Link>
      </p>
      <h1>Artists · {sitemapLetterLabel(letter)}</h1>
      <p>
        <a href={`/sitemap/artists/${letter}.json`}>JSON for this letter</a>
      </p>
      <ul className="link-list">
        {rows.map((artist) => (
          <li key={artist.slug}>
            <Link href={artist.path}>{artist.path}</Link>
            <span className="quiet"> — {artist.name}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
