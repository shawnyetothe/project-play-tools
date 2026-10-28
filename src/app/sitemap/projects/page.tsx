import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";

export const metadata: Metadata = { title: "Projects · Site map" };

type Letter = { id: string; label: string; count: number; page: string };

function letters(): Letter[] {
  const index = JSON.parse(readFileSync(join(process.cwd(), "public/sitemap.json"), "utf8")) as {
    sections: { projects: Letter[] };
  };
  return index.sections.projects;
}

export default function ProjectSitemapIndex() {
  return (
    <article className="wrap site-map">
      <p>
        <Link href="/sitemap/">Site map</Link>
      </p>
      <h1>Projects</h1>
      <p>Each letter is its own page. The same lists are in /sitemap/projects/a.json and the other letter files.</p>
      <nav className="sitemap-letters" aria-label="Project letters">
        {letters().map((letter) => (
          <Link key={letter.id} href={letter.page}>
            {letter.label}
            <span>{letter.count}</span>
          </Link>
        ))}
      </nav>
    </article>
  );
}
