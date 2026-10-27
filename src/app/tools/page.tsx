import type { Metadata } from "next";
import { ToolIndex } from "@/components/ToolIndex";
import { meta, tools } from "@/lib/data";
import { groupsFor } from "@/lib/tool-groups";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  const cards = tools.map((tool) => ({
    id: tool.id,
    plain: tool.plain,
    name: tool.name,
    what: tool.what,
    category: tool.category || "Dataset tags",
    groups: groupsFor(tool),
  }));
  return <ToolIndex tools={cards} categoryCount={meta.categories.length} />;
}
