const SCALE = ["C4", "D4", "E4", "G4", "A4", "C5"];

const HZ: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392,
  A4: 440,
  C5: 523.25,
};

export function notesForSeed(seed: string): string[] {
  const n = parseInt(seed, 16) || 1;
  return SCALE.map((_, i) => SCALE[(n >> (i * 3)) % SCALE.length]);
}

export function noteHz(note: string): number {
  return HZ[note] || 261.63;
}
