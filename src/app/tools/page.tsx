import type { Metadata } from "next";
import Link from "next/link";
import { meta, tools } from "@/lib/data";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  const groups = new Map<string, typeof tools>();
  for (const tool of tools) {
    const key = tool.category || "Dataset tags";
    const list = groups.get(key) ?? [];
    list.push(tool);
    groups.set(key, list);
  }
  const names = [...groups.keys()].sort((a, b) => a.localeCompare(b));
  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / Tools
      </p>
      <h1>Tools</h1>
      <p>
        {tools.length} tools. Plain name first. The technical name is underneath.{" "}
        <Link href="/start/">Start here</Link> if you want one path.
      </p>
      {names.map((name) => (
        <section key={name}>
          <h2>{name}</h2>
          <div className="card-grid tools">
            {groups
              .get(name)!
              .slice()
              .sort((a, b) => a.plain.localeCompare(b.plain))
              .map((tool) => (
                <Link key={tool.id} href={`/tools/${tool.id}/`} className="card">
                  <span className="plain">{tool.plain}</span>
                  {tool.plain !== tool.name ? <span className="tech">{tool.name}</span> : null}
                  <span>{tool.what}</span>
                </Link>
              ))}
          </div>
        </section>
      ))}
      <p className="quiet">Categories follow the maturity map. {meta.categories.length} groups.</p>
    </div>
  );
}
