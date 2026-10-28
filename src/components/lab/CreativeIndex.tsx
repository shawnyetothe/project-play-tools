"use client";

import Link from "next/link";
import { useMemo, useState, type KeyboardEvent } from "react";

export type IndexTool = {
  id: string;
  name: string;
  plain: string;
  category: string;
  what: string;
  projectCount: number | null;
  underused: boolean;
  hasStarter: boolean;
  beginnerFriendly: boolean;
};

const sorts = [
  { id: "used", label: "Most used" },
  { id: "under", label: "Underused" },
  { id: "medium", label: "By medium" },
  { id: "starter", label: "Starter sketches" },
] as const;

type SortId = (typeof sorts)[number]["id"];

function sizeFor(count: number | null, max: number) {
  if (count == null) return 72;
  const span = Math.sqrt(count / Math.max(max, 1));
  return Math.round(72 + span * 140);
}

export function CreativeIndex({ tools }: { tools: IndexTool[] }) {
  const [sort, setSort] = useState<SortId>("used");
  const [medium, setMedium] = useState("all");
  const max = Math.max(...tools.map((tool) => tool.projectCount ?? 0), 1);
  const mediums = useMemo(
    () => [...new Set(tools.map((tool) => tool.category).filter(Boolean))].sort(),
    [tools],
  );
  const shown = useMemo(() => {
    let list = tools.filter((tool) => medium === "all" || tool.category === medium);
    if (sort === "under") list = list.filter((tool) => tool.underused);
    if (sort === "starter") list = list.filter((tool) => tool.hasStarter || tool.beginnerFriendly);
    if (sort === "medium") {
      list = [...list].sort((a, b) => a.category.localeCompare(b.category) || (b.projectCount ?? -1) - (a.projectCount ?? -1));
    } else {
      list = [...list].sort((a, b) => (b.projectCount ?? -1) - (a.projectCount ?? -1));
    }
    return list;
  }, [tools, sort, medium]);

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"];
    if (!keys.includes(event.key)) return;
    const items = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>("a.bubble")];
    const index = items.findIndex((item) => item === document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    items[(index + step + items.length) % items.length]?.focus();
  }

  return (
    <div>
      <div className="index-sorts" role="toolbar" aria-label="Sort the index">
        {sorts.map((item) => (
          <button key={item.id} type="button" aria-pressed={sort === item.id} onClick={() => setSort(item.id)}>
            {item.label}
          </button>
        ))}
        <label>
          Medium
          <select value={medium} onChange={(event) => setMedium(event.target.value)}>
            <option value="all">All</option>
            {mediums.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="quiet">
        {sort === "starter"
          ? "Starter sketches are ones you can run in this guide. Only a tool whose own text says beginner is marked beginner-friendly."
          : sort === "under"
            ? "Underused means under 10 projects in this pull. The cutoff is ours. The counts are not."
            : "Bigger tiles are tools matched to more projects in this pull."}
      </p>
      <div className="bubble-map" role="list" aria-label="Creative index" onKeyDown={onKey}>
        {shown.map((tool) => {
          const size = sizeFor(tool.projectCount, max);
          return (
            <Link
              key={tool.id}
              href={`/lab/tools/${tool.id}/`}
              className="bubble"
              role="listitem"
              style={{ width: size, height: size }}
            >
              <span className="bubble-name">{tool.plain}</span>
              <span className="bubble-count">{tool.projectCount == null ? "no data yet" : tool.projectCount}</span>
              {tool.underused ? <span className="bubble-flag">few people make with this yet</span> : null}
              {tool.beginnerFriendly ? <span className="bubble-flag">beginner-friendly</span> : null}
            </Link>
          );
        })}
      </div>
      <h2>Plain list</h2>
      <ol className="index-list">
        {shown.map((tool) => (
          <li key={tool.id}>
            <Link href={`/lab/tools/${tool.id}/`}>{tool.plain}</Link>
            {" · "}
            {tool.name}
            {" · "}
            {tool.category || "no medium listed"}
            {" · "}
            {tool.projectCount == null ? "no data yet" : `${tool.projectCount} projects`}
            {tool.underused ? " · few people make with this yet" : ""}
          </li>
        ))}
      </ol>
      <h2>Named effects</h2>
      <p>These names are in the hero mixer. This pull does not count them.</p>
      <ul className="index-list">
        {["flow field", "reaction-diffusion", "Perlin noise", "L-system", "Voronoi", "circle packing", "truchet tiles", "dithering", "glitch", "particle trails", "audio-reactive", "boids"].map(
          (name) => (
            <li key={name}>
              {name} · no data yet
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
