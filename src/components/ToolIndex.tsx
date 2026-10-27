"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useState } from "react";
import { toolGroups, type ToolGroup } from "@/lib/tool-groups";

export type ToolCard = {
  id: string;
  plain: string;
  name: string;
  what: string;
  category: string;
  groups: string[];
};

export function ToolIndex({
  tools,
  categoryCount,
}: {
  tools: ToolCard[];
  categoryCount: number;
}) {
  const [active, setActive] = useState<string | null>(null);

  useLayoutEffect(() => {
    const group = new URLSearchParams(window.location.search).get("group");
    setActive(toolGroups.some((item) => item.id === group) ? group : null);
  }, []);

  const filter: ToolGroup | undefined = toolGroups.find((item) => item.id === active);
  const shown = useMemo(
    () => (filter ? tools.filter((tool) => tool.groups.includes(filter.id)) : tools),
    [filter, tools],
  );

  const sections = useMemo(() => {
    const groups = new Map<string, ToolCard[]>();
    for (const tool of shown) {
      const list = groups.get(tool.category) ?? [];
      list.push(tool);
      groups.set(tool.category, list);
    }
    return [...groups.keys()]
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        name,
        tools: (groups.get(name) ?? []).slice().sort((a, b) => a.plain.localeCompare(b.plain)),
      }));
  }, [shown]);

  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / Tools
      </p>
      <h1>Tools</h1>
      {filter ? (
        <p className="tool-filter">
          <span>
            {filter.label}. {shown.length} {shown.length === 1 ? "tool" : "tools"}.
          </span>
          <Link href="/tools/">All tools</Link>
        </p>
      ) : (
        <p>
          <Link href="/#play">Start making</Link> from a message, a medium, or the maker.
        </p>
      )}
      <ul className="quick-row">
        {toolGroups.map((group) => (
          <li key={group.id}>
            <Link href={`/tools/?group=${group.id}`} aria-current={group.id === active ? "page" : undefined}>
              {group.label}
            </Link>
          </li>
        ))}
      </ul>
      {sections.map((section) => (
        <section key={section.name}>
          <h2>{section.name}</h2>
          <div className="card-grid tools">
            {section.tools.map((tool) => (
              <Link key={tool.id} href={`/tools/${tool.id}/`} className="card tool-card">
                <span className="plain">{tool.plain}</span>
                {tool.plain !== tool.name ? <span className="tech">{tool.name}</span> : null}
                <span className="try">Try it</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <p className="quiet">
        {filter
          ? "This is a shortcut into the full index."
          : `Categories follow the maturity map. ${categoryCount} groups.`}
      </p>
    </div>
  );
}
