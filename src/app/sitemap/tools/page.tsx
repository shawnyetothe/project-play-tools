import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";

export const metadata: Metadata = { title: "Tools · Site map" };

const PAGE = 30;

type ToolRow = { id: string; path: string; lab: string; plain: string };

function tools(): ToolRow[] {
  return (JSON.parse(readFileSync(join(process.cwd(), "public/sitemap.json"), "utf8")) as { tools: ToolRow[] }).tools;
}

function pageCount() {
  return Math.ceil(tools().length / PAGE);
}

function toolSlice(page: number) {
  return tools().slice((page - 1) * PAGE, page * PAGE);
}

export default function ToolSitemapPage() {
  const pages = pageCount();
  return (
    <article className="wrap site-map">
      <p>
        <Link href="/sitemap/">Site map</Link>
      </p>
      <h1>Tools</h1>
      <p>
        Page 1 of {pages}. Each tool has a guide page and a creative-index page. The full list is in /sitemap.json.
      </p>
      <ul className="link-list">
        {toolSlice(1).map((tool) => (
          <li key={tool.id}>
            <Link href={tool.path}>{tool.path}</Link>
            {" · "}
            <Link href={tool.lab}>{tool.lab}</Link>
            <span className="quiet"> — {tool.plain}</span>
          </li>
        ))}
      </ul>
      {pages > 1 ? (
        <p>
          <Link href="/sitemap/tools/2/">Next page</Link>
        </p>
      ) : null}
    </article>
  );
}
