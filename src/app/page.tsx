import { Composed } from "@/components/lab/Composed";
import { meta, tools } from "@/lib/data";
import "./lab/lab.css";

export default function HomePage() {
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
  return (
    <div className="lab workspace public-home">
      <Composed tools={catalog} recipes={recipes} home />
    </div>
  );
}
