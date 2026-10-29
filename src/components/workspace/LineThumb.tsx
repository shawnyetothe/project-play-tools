import type { LinePoint } from "@/lib/workspace-state";

export function LineThumb({ line }: { line: LinePoint[] }) {
  const points = line
    .map((point) => `${(8 + point.x * 56).toFixed(1)},${(8 + point.y * 56).toFixed(1)}`)
    .join(" ");
  return (
    <svg className="line-thumb" data-thumb="" viewBox="0 0 72 72" aria-hidden="true">
      <rect width="72" height="72" fill="#F5F5F2" />
      {points ? (
        <polyline points={points} fill="none" stroke="#0B0B0F" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}
