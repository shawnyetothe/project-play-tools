import Link from "next/link";
import { toolById } from "@/lib/data";

export function ToolLink({ id }: { id: string }) {
  const tool = toolById.get(id);
  if (!tool) return <span>{id}</span>;
  return (
    <Link href={`/tools/${tool.id}/`} className="tool-link">
      <span className="plain">{tool.plain}</span>
      {tool.plain !== tool.name ? <span className="tech">{tool.name}</span> : null}
    </Link>
  );
}
