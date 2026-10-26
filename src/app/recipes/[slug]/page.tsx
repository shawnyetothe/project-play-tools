import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublishWithAbx } from "@/components/PublishWithAbx";
import { Rich } from "@/components/RichText";
import { ToolLink } from "@/components/ToolLink";
import { meta, recipeBySlug } from "@/lib/data";

export function generateStaticParams() {
  return meta.recipes.map((recipe) => ({ slug: recipe.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => ({ title: recipeBySlug.get(slug)?.plain ?? "Recipe" }));
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = recipeBySlug.get(slug);
  if (!recipe) notFound();
  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / <Link href="/recipes/">Recipes</Link> / {recipe.plain}
      </p>
      <h1>{recipe.plain}</h1>
      <p className="tech">{recipe.title}</p>
      <p>
        Status: <Rich text={recipe.status} />
      </p>
      <h2>Tools</h2>
      <p>
        {recipe.toolIds.map((id) => (
          <ToolLink key={id} id={id} />
        ))}
      </p>
      <h2>How</h2>
      <p>
        <Rich text={recipe.how} />
      </p>
      <p className="quiet">Recipes are our suggestions. Platform facts below are tagged from the source notes.</p>
      <PublishWithAbx blurb={recipe.publish} />
    </div>
  );
}
