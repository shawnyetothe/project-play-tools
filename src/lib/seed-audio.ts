import { notesForSeed, noteHz } from "./seed-notes";

type BurstFn = (note: string) => void;

let playing = false;
let notes: string[] = [];
let listener: BurstFn | null = null;
let stopTone: (() => void) | null = null;

export function isPlaying() {
  return playing;
}

export function retargetNotes(seed: string) {
  notes = notesForSeed(seed);
}

function blip(freq: number) {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
  osc.onended = () => void ctx.close();
}

export async function playSeed(seed: string, onBurst: BurstFn) {
  retargetNotes(seed);
  listener = onBurst;
  const first = notes[0] || "C4";
  onBurst(first);
  blip(noteHz(first));
  if (playing) return;
  playing = true;
  const Tone = await import("tone");
  await Tone.start();
  const synth = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.005, decay: 0.16, sustain: 0, release: 0.08 },
    volume: -10,
  }).toDestination();
  let step = 0;
  const loop = new Tone.Loop((time) => {
    const note = notes[step % notes.length] || "C4";
    synth.triggerAttackRelease(note, "16n", time);
    Tone.Draw.schedule(() => listener?.(note), time);
    step += 1;
  }, "4n").start(0);
  Tone.getTransport().bpm.value = 96;
  if (Tone.getTransport().state !== "started") Tone.getTransport().start();
  stopTone = () => {
    loop.dispose();
    synth.dispose();
    Tone.getTransport().stop();
    Tone.getTransport().cancel(0);
  };
}

export function stopSeed() {
  playing = false;
  listener = null;
  stopTone?.();
  stopTone = null;
}
