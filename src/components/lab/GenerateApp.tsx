"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { fitCanvas } from "./canvas-fit";
import {
  EDITION_MAX,
  EDITION_MIN,
  LIVE_CAP,
  MARKERS,
  PULL_DATA,
  bandFor,
  drawToken,
  editionFromPosition,
  histogram,
  logPosition,
  makeToken,
  parseGenerateSearch,
  sampleIndexes,
  stepEdition,
  type Manifest,
  type Mode,
  type OutputMode,
  type Rule,
  type SourceId,
  type SourceState,
  type Token,
} from "@/lib/generate";

const STEPS = ["Rules", "Sources of variance", "Constraint vs expression", "Edition size", "Generated grid", "Curate", "Output"] as const;

const SOURCE_ORDER: { id: SourceId; name: string; hint: string }[] = [
  { id: "rng", name: "RNG seed", hint: "The seed from the page address." },
  { id: "time", name: "Time", hint: "The clock on this device, frozen when you generate." },
  { id: "color", name: "Color · heritage palette", hint: "Colors from a photo you pick. Nothing is uploaded." },
  { id: "movement", name: "Movement", hint: "Pointer or tilt, saved as two numbers." },
  { id: "sound", name: "Sound / beat", hint: "Tap a tempo. A microphone stays behind a separate tap." },
  { id: "data", name: "Data", hint: PULL_DATA.source },
  { id: "sensor", name: "Sensor", hint: "Device orientation or ambient light, when the browser has it." },
];

const DEFAULT_SOURCES: Record<SourceId, SourceState> = {
  rng: { on: true, weight: 0.5 },
  time: { on: false, weight: 0.2 },
  color: { on: false, weight: 0.35 },
  movement: { on: false, weight: 0.25 },
  sound: { on: false, weight: 0.3 },
  data: { on: false, weight: 0.2 },
  sensor: { on: false, weight: 0.15 },
};

function useReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return reduced;
}

function TileCanvas({ token, palette, struck }: { token: Token; palette: string[]; struck: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const fitted = fitCanvas(canvas, 1.5);
    if (!fitted) return;
    drawToken(fitted.ctx, fitted.w, fitted.h, token, palette);
  }, [token, palette]);
  return <canvas ref={ref} className="gen-art" style={{ opacity: struck ? 0.32 : 1 }} aria-hidden="true" />;
}

export function GenerateApp() {
  const reduced = useReduced();
  const [step, setStep] = useState(0);
  const [seed, setSeed] = useState("c19a4e");
  const [mix, setMix] = useState("");
  const [mode, setMode] = useState<Mode>("long-form");
  const [edition, setEdition] = useState(256);
  const [balance, setBalance] = useState(42);
  const [sources, setSources] = useState(DEFAULT_SOURCES);
  const [values, setValues] = useState<Record<SourceId, string>>({
    rng: "c19a4e",
    time: "",
    color: "no photo yet",
    movement: "0.50, 0.50",
    sound: "no tempo yet",
    data: PULL_DATA.series.map((row) => `${row.name} ${row.count}`).join("; "),
    sensor: "not available on this device",
  });
  const [palette, setPalette] = useState<string[]>(["#0B0B0F", "#C4513A", "#E2B857", "#3E6B8A"]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [strikes, setStrikes] = useState<number[]>([]);
  const [developed, setDeveloped] = useState(0);
  const [output, setOutput] = useState<OutputMode>("sheet");
  const [copied, setCopied] = useState(false);
  const [micNote, setMicNote] = useState("");
  const [sensorNote, setSensorNote] = useState("not available on this device");
  const taps = useRef<number[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const parsed = parseGenerateSearch(window.location.search);
    setSeed(parsed.seed);
    setMix(parsed.mix);
    setMode(parsed.mode);
    setEdition(parsed.edition);
    setBalance(parsed.balance);
    setOutput(parsed.output);
    setValues((current) => ({ ...current, rng: parsed.seed, time: new Date().toISOString() }));
  }, []);

  const band = bandFor(balance);
  const maxRule = rules.reduce<number | null>((acc, rule) => (rule.maxDensity == null ? acc : acc == null ? rule.maxDensity : Math.min(acc, rule.maxDensity)), null);
  const indexes = useMemo(() => sampleIndexes(edition), [edition]);
  const tokens = useMemo(
    () =>
      indexes
        .map((index) => makeToken(seed, index, balance, `${mix}|${values.time}|${values.movement}|${values.sound}|${values.data}|${values.sensor}`))
        .filter((token) => maxRule == null || token.density <= maxRule),
    [indexes, seed, balance, mix, values, maxRule],
  );
  const bars = histogram(edition, balance);
  const struckTokens = tokens.filter((token) => strikes.includes(token.index));
  const proposed = struckTokens.length ? Math.round(Math.min(...struckTokens.map((token) => token.density)) * 100) / 100 : null;

  const tokenKey = tokens.map((token) => token.index).join(",");
  useEffect(() => {
    if (reduced) {
      setDeveloped(tokens.length);
      return;
    }
    setDeveloped(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setDeveloped(i);
      if (i >= tokens.length) window.clearInterval(id);
    }, 45);
    return () => window.clearInterval(id);
  }, [tokenKey, tokens.length, reduced]);

  function toggleStrike(index: number) {
    setStrikes((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]));
  }

  function addRule() {
    if (proposed == null) return;
    setRules((current) => [
      ...current,
      { id: `curation-${current.length + 1}`, text: `max density ${proposed.toFixed(2)}`, fromCuration: true, maxDensity: proposed },
    ]);
    setStrikes([]);
  }

  function setSource(id: SourceId, patch: Partial<SourceState>) {
    setSources((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  }

  async function onPhoto(file: File) {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, 24, 24);
      const data = ctx.getImageData(0, 0, 24, 24).data;
      const found: string[] = [];
      for (let i = 0; i < data.length && found.length < 4; i += 16) {
        found.push(`rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`);
      }
      setPalette(found.length ? found : palette);
      setValues((current) => ({ ...current, color: found.join(" ") }));
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }

  function tapTempo() {
    const now = performance.now();
    taps.current = [...taps.current.filter((time) => now - time < 4000), now];
    if (taps.current.length < 2) return;
    const gaps = taps.current.slice(1).map((time, i) => time - taps.current[i]);
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const bpm = Math.round(60000 / avg);
    setValues((current) => ({ ...current, sound: `${bpm} bpm from taps` }));
  }

  async function listenMic() {
    setMicNote("The browser will ask permission. Audio stays on this device and is saved only as a level number.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      ctx.createMediaStreamSource(stream).connect(analyser);
      const bins = new Uint8Array(analyser.frequencyBinCount);
      await new Promise((resolve) => setTimeout(resolve, 280));
      analyser.getByteFrequencyData(bins);
      const level = Math.round(bins.reduce((a, b) => a + b, 0) / bins.length);
      stream.getTracks().forEach((track) => track.stop());
      await ctx.close();
      setValues((current) => ({ ...current, sound: `mic level ${level}` }));
      setMicNote("Saved a level number. The recording was not kept.");
    } catch {
      setMicNote("The microphone is not available. Tap tempo still works.");
    }
  }

  function enableSensor() {
    const motion = window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    const ask = motion?.requestPermission?.();
    Promise.resolve(ask)
      .catch(() => "granted")
      .then(() => {
        let heard = false;
        const onOrient = (event: DeviceOrientationEvent) => {
          if (event.gamma == null) return;
          heard = true;
          setSensorNote(`${Math.round(event.gamma)}° tilt`);
          setValues((current) => ({ ...current, sensor: `${Math.round(event.gamma ?? 0)} gamma` }));
        };
        window.addEventListener("deviceorientation", onOrient);
        window.setTimeout(() => {
          window.removeEventListener("deviceorientation", onOrient);
          if (!heard) setSensorNote("not available on this device");
        }, 700);
      });
  }

  function shareQuery() {
    const params = new URLSearchParams();
    params.set("seed", seed);
    if (mix) params.set("mix", mix);
    params.set("mode", mode);
    params.set("edition", String(edition));
    params.set("balance", String(balance));
    params.set("output", output);
    if (strikes.length) params.set("strikes", strikes.join(","));
    return `${window.location.origin}/lab/generate/?${params}`;
  }

  function manifest(): Manifest {
    const sourceMeta = Object.fromEntries(
      SOURCE_ORDER.map((source) => [
        source.id,
        { on: sources[source.id].on, weight: sources[source.id].weight, value: values[source.id] },
      ]),
    );
    return {
      seed,
      mix,
      mode,
      output,
      edition,
      balance,
      band,
      sources: sourceMeta,
      rules,
      strikes,
      showing: tokens.length,
    };
  }

  function download(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadPng() {
    const token = tokens.find((item) => !strikes.includes(item.index)) || tokens[0];
    if (!token) return;
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawToken(ctx, 800, 800, token, palette);
    canvas.toBlob((blob) => blob && download(`playtools-${seed}-${token.frame}.png`, blob));
  }

  function downloadSvg() {
    const token = tokens.find((item) => !strikes.includes(item.index)) || tokens[0];
    if (!token) return;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
  <desc>Original plot from PlayTools seed ${seed}, frame ${token.frame}. Not an existing artwork.</desc>
  <rect width="800" height="800" fill="#F5F5F2"/>
  <path d="M40 ${400 - token.density * 80} C 240 ${400 - token.density * 160}, 560 ${400 + token.density * 160}, 760 ${400 + token.density * 40}" fill="none" stroke="#0B0B0F" stroke-width="2"/>
</svg>`;
    download(`playtools-${seed}-${token.frame}.svg`, new Blob([svg], { type: "image/svg+xml" }));
  }

  function downloadManifest() {
    download(`playtools-${seed}.json`, new Blob([JSON.stringify(manifest(), null, 2)], { type: "application/json" }));
  }

  async function copyShare() {
    const url = shareQuery();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const title = mix ? mix.replace("+", " + ") : `Seed ${seed}`;

  return (
    <div className="gen-app">
      <div className="gen-shell">
        <nav className="gen-rail" aria-label="Generate steps">
          <p className="gen-eyebrow">Generate</p>
          {STEPS.map((label, index) => (
            <button key={label} type="button" aria-current={step === index ? "step" : undefined} onClick={() => setStep(index)}>
              <span className={index < step ? "is-done" : step === index ? "is-now" : "is-next"} />
              {label}
            </button>
          ))}
        </nav>
        <div className="gen-main">
          <p className="gen-phone-step">Step {step + 1} of 7 · {STEPS[step]}</p>
          <div className="gen-progress" aria-hidden="true">
            {STEPS.map((label, index) => (
              <span key={label} className={index <= step ? "is-on" : ""} />
            ))}
          </div>
          <p className="gen-eyebrow">Lab · Generate</p>
          <h1>{title}</h1>
          <p className="gen-measure">What the machine produces defines the work. No crypto is needed.</p>

          <section id="gen-rules" hidden={step !== 0}>
            <h2>Rules</h2>
            <p className="gen-measure">The seed {mix ? `and ${mix}` : ""} carries over from the composed page. Long-form ships every output. Curated lets you strike outliers first.</p>
            <div className="gen-segment" role="group" aria-label="Long-form or curated">
              <button type="button" aria-pressed={mode === "long-form"} onClick={() => setMode("long-form")}>Long-form</button>
              <button type="button" aria-pressed={mode === "curated"} onClick={() => setMode("curated")}>Curated</button>
            </div>
            <ul className="gen-rules">
              <li><span>Seed</span><code>{seed}</code></li>
              {mix ? <li><span>Mix</span><code>{mix}</code></li> : null}
              {rules.map((rule) => (
                <li key={rule.id}>
                  <span>{rule.text}</span>
                  {rule.fromCuration ? <em>FROM CURATION</em> : null}
                </li>
              ))}
            </ul>
          </section>

          <section id="gen-sources" hidden={step !== 1}>
            <h2>Sources of variance</h2>
            <p className="gen-measure">Turn a source on, then set its weight. The values used are saved with the output.</p>
            <div className="gen-sources">
              {SOURCE_ORDER.map((source) => {
                const row = sources[source.id];
                return (
                  <article key={source.id} className={row.on ? "is-on" : ""}>
                    <div className="gen-source-top">
                      <strong>{source.name}</strong>
                      <button type="button" className="gen-toggle" role="switch" aria-checked={row.on} aria-label={`${source.name} ${row.on ? "on" : "off"}`} onClick={() => setSource(source.id, { on: !row.on })} />
                    </div>
                    <div className="gen-weight" aria-hidden="true"><span style={{ width: `${row.on ? row.weight * 100 : 0}%` }} /></div>
                    <p>{source.hint}</p>
                    <p className="gen-weight-label">weight {row.weight.toFixed(2)}</p>
                    <input aria-label={`${source.name} weight`} type="range" min={0} max={100} value={Math.round(row.weight * 100)} disabled={!row.on} onChange={(event) => setSource(source.id, { weight: Number(event.target.value) / 100 })} />
                    {source.id === "color" && row.on ? (
                      <button type="button" onClick={() => fileRef.current?.click()}>Pick a photo</button>
                    ) : null}
                    {source.id === "sound" && row.on ? (
                      <>
                        <button type="button" onClick={tapTempo}>Tap tempo</button>
                        <button type="button" onClick={() => void listenMic()}>Use the microphone</button>
                        {micNote ? <p>{micNote}</p> : null}
                      </>
                    ) : null}
                    {source.id === "movement" && row.on ? (
                      <div
                        className="gen-pad"
                        onPointerMove={(event) => {
                          const rect = event.currentTarget.getBoundingClientRect();
                          const x = ((event.clientX - rect.left) / rect.width).toFixed(2);
                          const y = ((event.clientY - rect.top) / rect.height).toFixed(2);
                          setValues((current) => ({ ...current, movement: `${x}, ${y}` }));
                        }}
                      />
                    ) : null}
                    {source.id === "sensor" && row.on ? (
                      <>
                        <button type="button" onClick={enableSensor}>Check this device</button>
                        <p>{sensorNote}</p>
                      </>
                    ) : null}
                    {source.id === "time" && row.on ? <p>{values.time || "Waiting for the clock."}</p> : null}
                    {source.id === "data" && row.on ? (
                      <p>
                        <a href={PULL_DATA.url}>{PULL_DATA.source}</a>
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
            <input ref={fileRef} className="sr-only" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void onPhoto(file); }} />
          </section>

          <section id="gen-balance" hidden={step !== 2}>
            <h2>Constraint vs expression</h2>
            <p className="gen-measure">Push toward rules and the proofs stay close. Push toward variance and they spread.</p>
            <div className="gen-balance">
              <div className="gen-balance-bar">
                <span>Rules constraint {100 - balance}%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={balance}
                  aria-label="Constraint versus expression"
                  onChange={(event) => setBalance(Number(event.target.value))}
                />
                <span>expression Variance {balance}%</span>
                <p>allowed band: density {band.lo.toFixed(2)} – {band.hi.toFixed(2)}</p>
              </div>
              <div className="gen-proof" aria-hidden="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={i} style={{ background: `hsl(${20 + balance + i * 8} 42% ${30 + i * 6}%)` }} />
                ))}
              </div>
            </div>
          </section>

          <section id="gen-edition" hidden={step !== 3}>
            <h2>Edition size</h2>
            <p className="gen-measure">Markers are maximum editions from Art Blocks project pages. They are context, not snap points. CryptoPunks is 10,000 and pre-generated, so it is not a long-form marker.</p>
            <div className="gen-edition">
              <div className="gen-log">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={Math.round(logPosition(edition) * 1000)}
                  aria-valuemin={EDITION_MIN}
                  aria-valuemax={EDITION_MAX}
                  aria-valuenow={edition}
                  aria-label="Edition size"
                  onChange={(event) => setEdition(editionFromPosition(Number(event.target.value) / 1000))}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                    event.preventDefault();
                    setEdition(stepEdition(edition, event.key === "ArrowRight" ? 1 : -1, event.shiftKey));
                  }}
                />
                <div className="gen-markers">
                  {MARKERS.map((marker) =>
                    marker.href ? (
                      <a key={marker.label} href={marker.href} title={marker.note} style={{ left: `${logPosition(marker.n) * 100}%` }}>
                        {marker.label}
                      </a>
                    ) : (
                      <span key={marker.label} title={marker.note} style={{ left: `${logPosition(marker.n) * 100}%` }}>
                        {marker.label}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="gen-stepper">
                <button type="button" aria-label="Smaller edition" onClick={() => setEdition(stepEdition(edition, -1, false))}>−</button>
                <strong>{edition.toLocaleString()}</strong>
                <button type="button" aria-label="Larger edition" onClick={() => setEdition(stepEdition(edition, 1, false))}>+</button>
              </div>
            </div>
            <div className="gen-segment" role="group" aria-label="Long-form or curated">
              <button type="button" aria-pressed={mode === "long-form"} onClick={() => setMode("long-form")}>Long-form</button>
              <button type="button" aria-pressed={mode === "curated"} onClick={() => setMode("curated")}>Curated</button>
            </div>
            <h3>Expected traits</h3>
            <ul className="gen-hist">
              {bars.map((bar) => (
                <li key={bar.trait}>
                  <span>{bar.trait}</span>
                  <span style={{ width: `${(bar.count / edition) * 100}%` }} />
                  <span>{bar.count}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="gen-grid" hidden={step !== 4 && step !== 5}>
            <h2>{step === 5 ? "Curate" : "Generated grid"}</h2>
            <p className="gen-measure">
              Showing {tokens.length} of {edition.toLocaleString()}
              {edition > LIVE_CAP ? `, sampled to ${LIVE_CAP} live tiles` : ""}. Frame numbers sit under the art.
            </p>
            <div className="gen-sheet-wrap">
              <div className="gen-sheet">
                {tokens.map((token, order) => {
                  const struck = strikes.includes(token.index);
                  const visible = order < developed;
                  return (
                    <button
                      key={token.index}
                      type="button"
                      className={struck ? "is-struck" : visible ? "is-kept" : "is-wait"}
                      onClick={() => toggleStrike(token.index)}
                      disabled={!visible}
                    >
                      {visible ? <TileCanvas token={token} palette={palette} struck={struck} /> : <span className="gen-art gen-blank" />}
                      <span className="gen-caption">
                        <span>#{token.frame}</span>
                        <span>{struck ? `struck · density ${token.density.toFixed(2)}` : visible ? `density ${token.density.toFixed(2)}` : "developing"}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {step === 5 ? (
                <aside className="gen-curate">
                  <p className="gen-eyebrow">Curation</p>
                  <h2>Struck {strikes.length} outlier{strikes.length === 1 ? "" : "s"}</h2>
                  <p>{proposed == null ? "Strike a tile to propose a density cap." : "The lowest struck density becomes the cap."}</p>
                  {proposed != null ? (
                    <div className="gen-proposed">
                      <strong>max density {proposed.toFixed(2)}</strong>
                      <p>Would hold later frames at or under that density.</p>
                    </div>
                  ) : null}
                  <button type="button" className="gen-primary" onClick={addRule} disabled={proposed == null}>Add rule & regenerate</button>
                  <button type="button" className="gen-secondary" onClick={() => setStep(6)}>Keep as strikes</button>
                </aside>
              ) : null}
            </div>
          </section>

          <section id="gen-output" hidden={step !== 6}>
            <h2>Output</h2>
            <div className="gen-segment" role="group" aria-label="One piece or a collection">
              <button type="button" aria-pressed={output === "one"} onClick={() => setOutput("one")}>1 of 1</button>
              <button type="button" aria-pressed={output === "sheet"} onClick={() => setOutput("sheet")}>Collection sheet</button>
            </div>
            <article className="gen-out">
              <h2>{title}</h2>
              <p>seed {seed} · {edition.toLocaleString()} · {mode}{mix ? ` · ${mix}` : ""}</p>
              <div className={output === "one" ? "gen-out-grid is-one" : "gen-out-grid"}>
                {(output === "one" ? tokens.slice(0, 1) : tokens.slice(0, 12)).map((token) => (
                  <TileCanvas key={token.index} token={token} palette={palette} struck={false} />
                ))}
              </div>
              <p>Showing {Math.min(output === "one" ? 1 : 12, tokens.length)} of {edition.toLocaleString()} · seed {seed}</p>
            </article>
            <div className="gen-downloads">
              <button type="button" onClick={downloadPng}>PNG</button>
              <button type="button" onClick={downloadSvg}>SVG</button>
              <button type="button" onClick={downloadManifest}>Manifest JSON</button>
            </div>
            <div className="gen-share">
              <input readOnly value={typeof window === "undefined" ? "" : shareQuery()} aria-label="Share URL" />
              <button type="button" onClick={() => void copyShare()}>{copied ? "Copied" : "Copy"}</button>
            </div>
          </section>

          <section className="gen-credits" hidden={step !== 6}>
            <h2>Learn from the greats</h2>
            <ul>
              <li><a href="https://www.artblocks.io/collections/curated/projects/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/78">Fidenza</a>, Tyler Hobbs. Fixed edition of 999.</li>
              <li><a href="https://www.artblocks.io/collections/curated/projects/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/13">Ringers</a>, Dmitri Cherniak. Fixed edition of 1,000.</li>
              <li><a href="https://www.artblocks.io/collections/curated/projects/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/163">Meridian</a>, Matt DesLauriers. Fixed edition of 1,000.</li>
              <li><a href="https://www.artblocks.io/collections/curated/projects/0x059edd72cd353df5106d2b9cc5ab83a52287ac3a/0">Chromie Squiggle</a>, Snowfro. Fixed edition of 10,000, the cap.</li>
              <li><a href="https://www.artblocks.io/collection/memories-of-qilin-by-emily-xie">Memories of Qilin</a>, Emily Xie. Fixed edition of 1,024, March 21, 2022. <a href="https://emilyxie.art/projects/memories_of_qilin">Artist page</a>.</li>
              <li><a href="https://cryptopunks.app/">CryptoPunks</a>, Larva Labs. 10,000 images generated ahead of time, then claimed. Not a long-form mint.</li>
              <li><a href="https://www.artblocks.io/collection/gazers-by-matt-kane">Gazers</a>, Matt Kane. A lunar calendar tied to moon phases.</li>
              <li><a href="https://mint.zeblocks.com/about">Sensthesia</a>, Zeblocks. Microphone frequencies drive the movement.</li>
              <li><a href="https://earth.nullschool.net/about.html">earth.nullschool</a>, Cameron Beccario. Live weather and ocean data, not a minted edition.</li>
            </ul>
          </section>
        </div>
      </div>
      <div className="gen-bar">
        <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>Back</button>
        <button type="button" className="gen-primary" onClick={() => setStep((value) => Math.min(6, value + 1))} disabled={step === 6}>Continue</button>
      </div>
      <p className="gen-home-link"><Link href="/lab/composed/">Back to the composed page</Link></p>
    </div>
  );
}
