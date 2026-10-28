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
    sections: { projects: { id: string }[] };
  };
  return index.sections.projects;
}

function readLetter(letter: string): LetterFile {
  return JSON.parse(readFileSync(join(process.cwd(), "public/sitemap/projects", `${letter}.json`), "utf8")) as LetterFile;
}

export function generateStaticParams() {
  return readLetters().map((letter) => ({ letter: letter.id }));
}

export function generateMetadata({ params }: { params: Promise<{ letter: string }> }): Promise<Metadata> {
  return params.then(({ letter }) => ({ title: `Projects ${sitemapLetterLabel(letter)} · Site map` }));
}

export default async function ProjectLetterPage({ params }: { params: Promise<{ letter: string }> }) {
  const { letter } = await params;
  const known = readLetters().some((item) => item.id === letter);
  if (!known) notFound();
  const rows = readLetter(letter).items;
  return (
    <article className="wrap site-map">
      <p>
        <Link href="/sitemap/">Site map</Link>
        {" · "}
        <Link href="/sitemap/projects/">Projects</Link>
      </p>
      <h1>Projects · {sitemapLetterLabel(letter)}</h1>
      <p>
        <a href={`/sitemap/projects/${letter}.json`}>JSON for this letter</a>
      </p>
      <ul className="link-list">
        {rows.map((project) => (
          <li key={project.slug}>
            <Link href={project.path}>{project.path}</Link>
            <span className="quiet"> — {project.name}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
