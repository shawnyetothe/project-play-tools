import type { Metadata } from "next";
import { Composed } from "@/components/lab/Composed";
import { meta, tools } from "@/lib/data";

export const metadata: Metadata = { title: "Start a piece" };

export default function ComposedPage() {
  const catalog = tools.map((tool) => ({
    id: tool.id,
    plain: tool.plain,
    name: tool.name,
    humanity: tool.humanity[0] ?? "",
    sketch: tool.sketch,
  }));
  const recipes = meta.recipes.map((recipe) => ({
    slug: recipe.slug,
    plain: recipe.plain,
    title: recipe.title,
  }));
  return <Composed tools={catalog} recipes={recipes} />;
}
