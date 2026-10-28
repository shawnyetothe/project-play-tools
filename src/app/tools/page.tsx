import type { Metadata } from "next";
import Link from "next/link";
import { meta, tools } from "@/lib/data";
import { Mixer } from "@/components/workspace/Mixer";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  const ranked = tools.filter((tool) => typeof tool.projectCount === "number").slice().sort((a, b) => b.projectCount - a.projectCount);
  return (
    <div className="workspace wrap">
      <h1>Tools</h1>
      <p>
        Counts are from the Art Blocks pull on {meta.pulledLabel}. A project can match more than one tool, so these are not a pie. 0 is a real zero.
      </p>
      <ul className="link-list">
        {ranked.slice(0, 24).map((tool) => (
          <li key={tool.id}>
            <Link href={`/tools/${tool.id}/`}>{tool.plain}</Link>
            <span className="quiet"> — {tool.projectCount.toLocaleString()} {tool.projectCount < 10 ? "· few people make with this yet" : ""}</span>
          </li>
        ))}
      </ul>
      <p><Link href="/lab/tools/">Full creative index</Link></p>
      <Mixer />
    </div>
  );
}
