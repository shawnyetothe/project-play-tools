import type { Tag } from "@/lib/types";

const word: Record<string, string> = {
  verified: "Verified",
  inferred: "Inferred",
  guessed: "Guessed",
};

export function Tags({ tags }: { tags: Tag[] }) {
  if (!tags.length) return <p className="quiet">No tool tags on this row.</p>;
  return (
    <ul className="tags">
      {tags.map((tag) => (
        <li key={`${tag.kind}-${tag.label}`} className={`tag tag-${tag.kind}`}>
          <span className="tag-kind">{word[tag.kind] ?? tag.kind}</span> {tag.label}
          {tag.note ? <span className="tag-note">{tag.note}</span> : null}
        </li>
      ))}
    </ul>
  );
}

export function Legend() {
  return (
    <ul className="legend">
      <li className="tag tag-verified">
        <span className="tag-kind">Verified</span> checked against a source
      </li>
      <li className="tag tag-inferred">
        <span className="tag-kind">Inferred</span> from the Art Blocks API or the on-chain script
      </li>
      <li className="tag tag-guessed">
        <span className="tag-kind">Guessed</span> a keyword in the description, not yet checked
      </li>
    </ul>
  );
}
