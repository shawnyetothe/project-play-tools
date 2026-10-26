import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { meta, pathBySlug, recipeBySlug, toolById } from "@/lib/data";

export function generateStaticParams() {
  return meta.paths.map((path) => ({ slug: path.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const path = pathBySlug.get(slug);
    return { title: path ? path.plain : "Make" };
  });
}

export default async function MakePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = pathBySlug.get(slug);
  if (!path) notFound();
  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / {path.plain}
      </p>
      <h1>{path.plain}</h1>
      <p className="tech">{path.line}</p>
      <p className="lede">{path.blurb}</p>
      <h2>Tools</h2>
      <div className="card-grid">
        {path.toolIds.map((id) => {
          const tool = toolById.get(id);
          if (!tool) return null;
          return (
            <Link key={id} href={`/tools/${id}/`} className="card">
              <span className="plain">{tool.plain}</span>
              {tool.plain !== tool.name ? <span className="tech">{tool.name}</span> : null}
              <span>{tool.what}</span>
            </Link>
          );
        })}
      </div>
      <h2>Recipes</h2>
      <div className="card-grid">
        {path.recipeSlugs.map((id) => {
          const recipe = recipeBySlug.get(id);
          if (!recipe) return null;
          return (
            <Link key={id} href={`/recipes/${id}/`} className="card">
              <span className="plain">{recipe.plain}</span>
              <span className="tech">{recipe.title}</span>
              <span className="quiet">
                {recipe.toolIds
                  .map((toolId) => toolById.get(toolId)?.plain ?? toolId)
                  .join(" + ")}
              </span>
            </Link>
          );
        })}
      </div>
      <p>
        <Link href="/start/">Start here</Link>
        {" · "}
        <Link href="/explore/">Explore the data</Link>
      </p>
    </div>
  );
}
