import type { Metadata } from "next";
import Link from "next/link";
import { artists, meta, projects, tools } from "@/lib/data";
import { routes, urlParams } from "@/lib/site-map";

export const metadata: Metadata = {
  title: "Site map",
  description: "Every route and URL parameter on this PlayTools preview.",
};

export default function SitemapPage() {
  const staticRoutes = routes.filter((route) => !route.path.includes("{"));
  return (
    <article className="wrap site-map">
      <h1>Site map</h1>
      <p>Every route on this preview, and every URL parameter the pages read. Concrete artist, project, tool, recipe, and make URLs are listed below.</p>
      <p>
        Machine-readable copies: <a href="/llms.txt">/llms.txt</a> and <a href="/tools.json">/tools.json</a>.
      </p>

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
        {meta.paths.map((path) => (
          <li key={path.slug}>
            <Link href={`/make/${path.slug}/`}>{`/make/${path.slug}/`}</Link>
            <span className="quiet"> — {path.plain}</span>
          </li>
        ))}
      </ul>

      <h2>Recipes</h2>
      <ul className="link-list">
        {meta.recipes.map((recipe) => (
          <li key={recipe.slug}>
            <Link href={`/recipes/${recipe.slug}/`}>{`/recipes/${recipe.slug}/`}</Link>
            <span className="quiet"> — {recipe.plain}</span>
          </li>
        ))}
      </ul>

      <h2>Tools</h2>
      <ul className="link-list">
        {tools.map((tool) => (
          <li key={tool.id}>
            <Link href={`/tools/${tool.id}/`}>{`/tools/${tool.id}/`}</Link>
            {" · "}
            <Link href={`/lab/tools/${tool.id}/`}>{`/lab/tools/${tool.id}/`}</Link>
            <span className="quiet"> — {tool.plain}</span>
          </li>
        ))}
      </ul>

      <h2>Artists</h2>
      <ul className="link-list">
        {artists.map((artist) => (
          <li key={artist.slug}>
            <Link href={`/artists/${artist.slug}/`}>{`/artists/${artist.slug}/`}</Link>
            <span className="quiet"> — {artist.name}</span>
          </li>
        ))}
      </ul>

      <h2>Projects</h2>
      <ul className="link-list">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={`/projects/${project.slug}/`}>{`/projects/${project.slug}/`}</Link>
            <span className="quiet"> — {project.name}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
