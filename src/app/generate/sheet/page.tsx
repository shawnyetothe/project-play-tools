import type { Metadata } from "next";
import { ArtCanvas } from "@/components/generate/ArtCanvas";
import { sheetSeeds, traitLabel } from "@/lib/traits";
import "../generate.css";

export const metadata: Metadata = {
  title: "Seed sheet",
  robots: { index: false, follow: false },
};

export default function SheetPage() {
  const seeds = sheetSeeds();
  return (
    <div className="sheet-page" data-testid="seed-sheet">
      <p className="mono muted">PlayTools Generate v1 · 48 seeds · same seeds as seeds-sheet-48-v2 · 196px tiles</p>
      <div className="sheet-grid">
        {seeds.map((seed) => {
          const label = traitLabel(seed);
          return (
            <div key={seed}>
              <div className="art" style={{ width: 196, height: 196 }}>
                <ArtCanvas seed={seed} orbit={0.03} spread={4.5} label={`Seed 0x${seed.toString(16)}`} />
              </div>
              <div className="mono seed-id">0x{seed.toString(16).padStart(4, "0")} · {label.form}</div>
              <p className="trait mono muted">{label.line}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
