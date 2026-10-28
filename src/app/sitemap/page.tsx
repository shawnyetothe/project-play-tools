import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { routes, urlParams } from "@/lib/site-map";

export const metadata: Metadata = {
  title: "Site map",
  description: "Routes, URL parameters, and links to the artist and project lists.",
};

type IndexFile = {
  make: { path: string; plain: string }[];
  recipes: { path: string; plain: string }[];
};

function readIndex(): IndexFile {
  return JSON.parse(readFileSync(join(process.cwd(), "public/sitemap.json"), "utf8")) as IndexFile;
}

export default function SitemapPage() {
  const index = readIndex();
  const staticRoutes = routes.filter((route) => !route.path.includes("{"));
  return (
    <article className="wrap site-map">
      <h1>Site map</h1>
      <p>Routes and URL parameters are on this page. Artist and project URLs are split by letter so each page stays small.</p>
      <ul className="link-list">
        <li>
          <Link href="/sitemap/artists/">Artists</Link>
          <span className="quiet"> — /sitemap/artists/</span>
        </li>
        <li>
          <Link href="/sitemap/projects/">Projects</Link>
          <span className="quiet"> — /sitemap/projects/</span>
        </li>
        <li>
          <Link href="/sitemap/tools/">Tools</Link>
          <span className="quiet"> — /sitemap/tools/</span>
        </li>
        <li>
          <a href="/sitemap.json">sitemap.json</a>
          <span className="quiet"> — routes, parameters, and letter files</span>
        </li>
        <li>
          <a href="/sitemap.xml">sitemap.xml</a>
          <span className="quiet"> — index of the path lists</span>
        </li>
        <li>
          <a href="/llms.txt">llms.txt</a>
          <span className="quiet"> — how an agent should read the site</span>
        </li>
      </ul>

      <h2>Routes</h2>
      <ul className="link-list">
        {staticRoutes.map((route) => (
          <li key={route.path}>
            <Link href={route.path}>{route.path}</Link>
            <span className="quiet"> — {route.note}</span>
          </li>
        ))}
        {routes
          .filter((route) => route.path.includes("{"))
          .map((route) => (
            <li key={route.path}>
              <code>{route.path}</code>
              <span className="quiet"> — {route.note}</span>
            </li>
          ))}
      </ul>

      <h2>URL parameters</h2>
      <ul className="link-list">
        {urlParams.map((param) => (
          <li key={`${param.name}-${param.routes.join(",")}`}>
            <code>{param.name}</code>
            <span className="quiet">
              {" "}
              on {param.routes.join(", ")}. {param.values}.
            </span>
          </li>
        ))}
      </ul>

      <h2>Make</h2>
      <ul className="link-list">
        {index.make.map((path) => (
          <li key={path.path}>
            <Link href={path.path}>{path.path}</Link>
            <span className="quiet"> — {path.plain}</span>
          </li>
        ))}
      </ul>

      <h2>Recipes</h2>
      <ul className="link-list">
        {index.recipes.map((recipe) => (
          <li key={recipe.path}>
            <Link href={recipe.path}>{recipe.path}</Link>
            <span className="quiet"> — {recipe.plain}</span>
          </li>
        ))}
      </ul>

    </article>
  );
}
