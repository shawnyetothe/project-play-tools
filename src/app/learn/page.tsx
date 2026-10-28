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
      {GROUPS.map((group) => {
        const tool = toolById.get(group.tool);
        return (
          <section key={group.id}>
            <h2>{group.title}</h2>
            {tool ? (
              <p>
                <Link href={`/tools/${tool.id}/`}>{tool.plain}</Link>
                {" — "}
                {tool.what} {typeof tool.projectCount === "number" ? `(${tool.projectCount.toLocaleString()} projects in the pull)` : ""}
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
