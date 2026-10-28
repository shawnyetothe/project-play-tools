import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";

const PAGE = 30;

type ToolRow = { id: string; path: string; lab: string; plain: string };

function allTools(): ToolRow[] {
  return (JSON.parse(readFileSync(join(process.cwd(), "public/sitemap.json"), "utf8")) as { tools: ToolRow[] }).tools;
}

export const dynamicParams = false;

export function generateStaticParams() {
  const pages = Math.ceil(allTools().length / PAGE);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, index) => ({ page: String(index + 2) }));
}

export function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  return params.then(({ page }) => ({ title: `Tools ${page} · Site map` }));
}

export default async function ToolSitemapPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const number = Number(page);
  const rows = allTools();
  const pages = Math.ceil(rows.length / PAGE);
  if (!Number.isInteger(number) || number < 2 || number > pages) notFound();
  const slice = rows.slice((number - 1) * PAGE, number * PAGE);
  return (
    <article className="wrap site-map">
      <p>
        <Link href="/sitemap/">Site map</Link>
        {" · "}
        <Link href="/sitemap/tools/">Tools</Link>
      </p>
      <h1>Tools · {number}</h1>
      <p>Page {number} of {pages}.</p>
      <ul className="link-list">
        {slice.map((tool) => (
          <li key={tool.id}>
            <Link href={tool.path}>{tool.path}</Link>
            {" · "}
            <Link href={tool.lab}>{tool.lab}</Link>
            <span className="quiet"> — {tool.plain}</span>
          </li>
        ))}
      </ul>
      <p>
        {number > 2 ? <Link href={`/sitemap/tools/${number - 1}/`}>Previous page</Link> : <Link href="/sitemap/tools/">Previous page</Link>}
        {number < pages ? (
          <>
            {" · "}
            <Link href={`/sitemap/tools/${number + 1}/`}>Next page</Link>
          </>
        ) : null}
      </p>
    </article>
  );
}
