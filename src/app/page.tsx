import Link from "next/link";
import { PlayerHero, type HeroWindow } from "@/components/PlayerHero";
import { PlayFlow } from "@/components/PlayFlow";
import { ToolCarousel } from "@/components/ToolCarousel";
import { meta, toolById, tools } from "@/lib/data";
import { toolGroups } from "@/lib/tool-groups";

const featured = ["p5", "three", "glsl", "plotter"]
  .map((id) => toolById.get(id))
  .filter((tool) => tool != null)
  .map((tool) => ({ id: tool.id, plain: tool.plain, name: tool.name }));

// Counts are projects in the Art Blocks pull. Tone.js is named on purpose:
// the broader sound tag is larger, and its starter makes sound rather than a picture.
const heroSpec: { control: HeroWindow["control"]; verb: string; id: string; label: string; image?: boolean }[] = [
  { control: "play", verb: "Play", id: "p5", label: "p5.js" },
  { control: "pause", verb: "Pause", id: "three", label: "three.js" },
  { control: "stop", verb: "Stop", id: "glsl", label: "GLSL" },
  { control: "rewind", verb: "Rewind", id: "tonejs", label: "Tone.js", image: true },
  { control: "forward", verb: "Fast-forward", id: "plotter", label: "Pen plotter" },
];

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
  const windows: HeroWindow[] = heroSpec.flatMap((spec) => {
    const tool = toolById.get(spec.id);
    if (!tool) return [];
    const verified = spec.image && tool.image.status === "verified" && tool.image.url;
    return [
      {
        control: spec.control,
        verb: spec.verb,
        id: tool.id,
        label: spec.label,
        image: verified
          ? { url: tool.image.url, caption: tool.image.caption, license: tool.image.license }
          : null,
      },
    ];
  });

  return (
    <>
      <PlayerHero windows={windows} />
      <nav className="wrap quick" aria-label="Tool shortcuts">
        <ul className="quick-row">
          {toolGroups.map((group) => (
            <li key={group.id}>
              <Link href={`/tools/?group=${group.id}`}>{group.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <ToolCarousel tools={featured} />
      <PlayFlow tools={catalog} recipes={recipes} />
    </>
  );
}
