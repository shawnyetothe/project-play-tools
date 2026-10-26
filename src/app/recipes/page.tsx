import type { Metadata } from "next";
import Link from "next/link";
import { meta, toolById } from "@/lib/data";

export const metadata: Metadata = { title: "Recipes" };

export default function RecipesPage() {
  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / Recipes
      </p>
      <h1>Recipes</h1>
      <p>Seven ways to combine tools. Each one ends with publishing on ABX, test network first.</p>
      <div className="card-grid">
        {meta.recipes.map((recipe) => (
          <Link key={recipe.slug} href={`/recipes/${recipe.slug}/`} className="card">
            <span className="plain">{recipe.plain}</span>
            <span className="tech">{recipe.title}</span>
            <span className="quiet">
              {recipe.toolIds.map((id) => toolById.get(id)?.plain ?? id).join(" + ")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
