"use client";

import Link from "next/link";
import { useState } from "react";
import type { ExampleItem, ExampleKind } from "@/lib/examples";
import { useWorkspace } from "./Workspace";

const FILTERS: Array<ExampleKind | "all"> = ["all", "lineage", "physical", "sound", "sensor"];

export function ExampleList({ items }: { items: ExampleItem[] }) {
  const { state, href, setState } = useWorkspace();
  const [kind, setKind] = useState<ExampleKind | "all">("all");
  const visible = items.filter((item) => {
    if (kind !== "all" && item.kind !== kind) return false;
    if (state.door && !item.doors.includes(state.door)) return false;
    if (state.door === "maker" && state.pick && item.maker && item.maker !== state.pick) return false;
    return true;
  });
  return (
    <div>
      <div className="maker-row" role="group" aria-label="Example types">
        {FILTERS.map((filter) => (
          <button key={filter} type="button" aria-pressed={kind === filter} onClick={() => setKind(filter)}>
            {filter}
          </button>
        ))}
      </div>
      <div className="example-list">
        {visible.map((item) => (
          <article key={item.slug} className="example-card">
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            {item.credit ? <p><a href={item.credit.href}>{item.credit.label}</a></p> : null}
            <p>
              <button type="button" onClick={() => setState({ rule: item.rule, interacted: true })}>Use this rule</button>
              {" · "}
              <Link href={href(`/examples/${item.slug}/`)}>Open</Link>
            </p>
          </article>
        ))}
        {!visible.length ? <p>No examples for this filter. Reset the door or pick another type.</p> : null}
      </div>
    </div>
  );
}
