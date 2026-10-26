import { PlayFlow } from "@/components/PlayFlow";
import { ToolCarousel } from "@/components/ToolCarousel";
import { meta, toolById, tools } from "@/lib/data";

const QUOTE_SOURCE =
  "https://www.cnbc.com/video/2024/11/13/ai-doesnat-stand-a-chance-against-actors-or-shakespeare-ben-affleck-says.html";

const featured = ["p5", "three", "glsl", "plotter"]
  .map((id) => toolById.get(id))
  .filter((tool) => tool != null)
  .map((tool) => ({ id: tool.id, plain: tool.plain, name: tool.name }));

export default function HomePage() {
  const catalog = tools.map((tool) => ({
    id: tool.id,
    plain: tool.plain,
    name: tool.name,
    humanity: tool.humanity[0] ?? "",
  }));
  const recipes = meta.recipes.map((recipe) => ({
    slug: recipe.slug,
    plain: recipe.plain,
    title: recipe.title,
  }));

  return (
    <>
      <div className="wrap hero">
        <p className="quiet">A private guide for artists. Plain words first.</p>
        <h1>Play Tools</h1>
        <blockquote className="quote" cite={QUOTE_SOURCE}>
          <p>Craft is knowing how to work; art is knowing when to stop.</p>
          <footer>
            <a href={QUOTE_SOURCE}>— Ben Affleck, CNBC Delivering Alpha, 2024</a>
          </footer>
        </blockquote>
      </div>
      <PlayFlow tools={catalog} recipes={recipes} />
      <ToolCarousel tools={featured} />
    </>
  );
}
