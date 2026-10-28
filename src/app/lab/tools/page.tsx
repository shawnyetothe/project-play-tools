import type { Metadata } from "next";
import Link from "next/link";
import { CreativeIndex } from "@/components/lab/CreativeIndex";
import { tools } from "@/lib/data";

export const metadata: Metadata = { title: "Creative index" };

export default function ToolsLabPage() {
  const cards = tools.map((tool) => {
    const text = `${tool.plain} ${tool.what} ${tool.intro}`.toLowerCase();
    const count = typeof tool.projectCount === "number" ? tool.projectCount : null;
    return {
      id: tool.id,
      name: tool.name,
      plain: tool.plain,
      category: tool.category || "",
      what: tool.what,
      projectCount: count,
      underused: count != null && count < 10,
      hasStarter: Boolean(tool.sketch),
      beginnerFriendly: text.includes("beginner"),
    };
  });

  return (
    <div className="wrap lab-page">
      <p className="quiet">
        <Link href="/lab/">Hero lab</Link>
        {" / "}
        Creative index
      </p>
      <h1>Creative index</h1>
      <p className="lede">How much of this Art Blocks pull uses each tool, and what that tool is for.</p>
      <p>
        Source: Art Blocks public GraphQL at <a href="https://data.artblocks.io/v1/graphql">data.artblocks.io</a>, pulled 2026-10-25 19:40 ET. A count is projects in that pull matched to the tool. A project can match more than one tool. Zero is a real zero. Where this page has no number, it says no data yet.
      </p>
      <CreativeIndex tools={cards} />
    </div>
  );
}
