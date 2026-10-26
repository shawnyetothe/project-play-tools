import type { ReactNode } from "react";

function badgeClass(inner: string): string {
  const text = inner.toLowerCase();
  if (text.includes("estimate")) return "mark mark-estimate";
  if (text.includes("gap")) return "mark mark-gap";
  if (text.includes("inference") || text.includes("suggestion") || text.includes("our call") || text.includes("our check")) {
    return "mark mark-ours";
  }
  if (text.includes("sourced") || text.includes("ab data")) return "mark mark-sourced";
  return "mark";
}

function Badge({ inner }: { inner: string }) {
  const url = inner.match(/https?:\/\/[^\s)\]]+/);
  const label = url ? inner.replace(url[0], "").replace(/[:\s]+$/g, "").trim() : inner;
  return (
    <span className={badgeClass(inner)}>
      {url ? (
        <a href={url[0]}>
          {label || "source"}
        </a>
      ) : (
        inner
      )}
    </span>
  );
}

export function Rich({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(\[[^\]]+\]|`[^`]+`|https?:\/\/[^\s)]+)/g);
  const nodes: ReactNode[] = [];
  parts.forEach((part, index) => {
    if (!part) return;
    if (part.startsWith("[") && part.endsWith("]")) {
      nodes.push(<Badge key={index} inner={part.slice(1, -1)} />);
      return;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(<code key={index}>{part.slice(1, -1)}</code>);
      return;
    }
    if (part.startsWith("http://") || part.startsWith("https://")) {
      const href = part.replace(/[.,;]+$/, "");
      const tail = part.slice(href.length);
      nodes.push(
        <a key={index} href={href}>
          {href.replace(/^https?:\/\//, "")}
        </a>,
      );
      if (tail) nodes.push(tail);
      return;
    }
    nodes.push(part);
  });
  return <>{nodes}</>;
}
