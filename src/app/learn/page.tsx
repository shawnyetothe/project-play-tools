import type { Metadata } from "next";
import Link from "next/link";
import { toolById } from "@/lib/data";

export const metadata: Metadata = { title: "Learn" };

const GROUPS = [
  { id: "new", title: "New to code", tool: "p5" },
  { id: "designer", title: "Designer", tool: "svg" },
  { id: "musician", title: "Musician", tool: "tonejs" },
  { id: "artist", title: "Artist", tool: "glsl" },
];

export default function LearnPage() {
  return (
    <div className="workspace wrap">
      <h1>Learn</h1>
      <p>Grouped by who is making. Each link is a tool page from this guide. Counts on those pages come from the Art Blocks pull.</p>
      <ol className="index-rows">
        {GROUPS.map((group, index) => {
          const tool = toolById.get(group.tool);
          return (
            <li key={group.id}>
              <Link className="index-row" href={tool ? `/tools/${tool.id}/` : "/tools/"}>
                <span className="index-num">{String(index + 1).padStart(2, "0")}</span>
                <span className="index-label">{group.title}</span>
                <span className="index-desc">{tool ? tool.what : group.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
