"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { drawPiece, stampPiece } from "@/lib/piece-draw";
import {
  DEFAULT_G,
  DEFAULT_R,
  DEFAULT_SP,
  GRID_KEY,
  formatR,
  formatSp,
  gridPath,
  hex4,
  isFav,
  parseHex4,
  piecePath,
  readFavs,
  readGenerate,
  toggleFav,
  writeFavs,
  type Fav,
  type GenView,
} from "@/lib/generate-state";
import { gridSeeds, isBusy, isDim, phoneSeeds, traitLabel, traits } from "@/lib/traits";
import { ArtCanvas } from "./ArtCanvas";
import { ScrubValue } from "./ScrubValue";

const STEPS = ["The rule", "Where variation comes from", "The grid", "You curate", "1 of 1"];
const PICKED_LINES = [
  "The rule: points orbit one circle.",
  "Variation: the seed sets form, arms, ink mix, density, dot size, gaps and offset.",
  "The grid: 16 seeds from the grid base.",
  "You curate: star, reroll, pick.",
  "1 of 1: this piece, reopenable from its link.",
];

function Story({ step, phoneLabel }: { step: number; phoneLabel: string }) {
  return (
    <div className="story" data-testid="story">
      <div className="story-line" aria-hidden="true">
        {STEPS.map((label, index) => (
          <div key={label} className={`step${index === step ? " cur" : index < step ? " done" : ""}`}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            {label}
          </div>
        ))}
      </div>
      <div className="segments" aria-hidden="true">
        {STEPS.map((label, index) => (
          <span key={label} className={index <= step ? "on" : ""} />
        ))}
      </div>
      <p className="story-now mono">
        {String(step + 1).padStart(2, "0")} / 05 · {phoneLabel}
      </p>
    </div>
  );
}

function RuleLine({
  r,
  sp,
  onLive,
  onCommit,
}: {
  r: number;
  sp: number;
  onLive: (patch: { r?: number; sp?: number }) => void;
  onCommit: (patch: { r?: number; sp?: number }) => void;
}) {
  return (
    <p className="rule-line">
      <span className="fig-kicker">FIG. 02 · THE RULE</span> Points orbit the circle at{" "}
      <ScrubValue
        value={r}
        min={0.005}
        max={0.12}
        step={0.005}
        digits={3}
        label="Orbit speed in radians per second"
        text={formatR(r)}
        onChange={(next) => onLive({ r: next })}
        onCommit={(next) => onCommit({ r: next })}
      />{" "}
      rad/s, spread{" "}
      <ScrubValue
        value={sp}
        min={0.5}
        max={15}
        step={0.1}
        digits={1}
        label="Spread on either side"
        text={`${formatSp(sp)}%`}
        onChange={(next) => onLive({ sp: next })}
        onCommit={(next) => onCommit({ sp: next })}
      />{" "}
      on either side. The seed decides the rest.
    </p>
  );
}

function FavLine({ count }: { count: number }) {
  const star = count ? "★" : "☆";
  const noun = count === 1 ? "favorite" : "favorites";
  return (
    <p className="favline" data-testid="fav-count">
      <span className="mono">
        {star} {count} {noun}
      </span>
      <span className="muted">
        {" "}
        · <span data-testid="saved-device">Saved on this device</span> ·{" "}
        <span data-testid="collection-soon">Collection, soon</span>
      </span>
    </p>
  );
}

async function monoFamily(): Promise<string> {
  const probe = document.querySelector(".mono");
  const family = probe ? getComputedStyle(probe).fontFamily : "JetBrains Mono, ui-monospace, monospace";
  const primary = family.split(",")[0]?.trim() || "JetBrains Mono";
  try {
    await document.fonts.load(`500 28px ${primary}`);
  } catch {
    /* the stamp still draws in the fallback face */
  }
  return primary;
}

export function GenerateExperience() {
  const [view, setView] = useState<GenView>({
    kind: "grid",
    g: DEFAULT_G,
    s: 0x9cd3,
    r: DEFAULT_R,
    sp: DEFAULT_SP,
  });
  const [draft, setDraft] = useState<{ r: number; sp: number } | null>(null);
  const [favs, setFavs] = useState<Fav[]>([]);
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState(false);
  const [fine, setFine] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);
  const [rerolling, setRerolling] = useState(false);
  const [fresh, setFresh] = useState(0);
  const [focus, setFocus] = useState(0);
  const [popSeed, setPopSeed] = useState<string | null>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const viewRef = useRef(view);
  viewRef.current = view;
  const toastTimer = useRef(0);

  const show = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
  }, []);

  useLayoutEffect(() => {
    const phoneQuery = window.matchMedia("(max-width: 959px)");
    const fineQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setPhone(phoneQuery.matches);
      setFine(fineQuery.matches);
      setReduce(reduceQuery.matches);
    };
    apply();
    phoneQuery.addEventListener("change", apply);
    fineQuery.addEventListener("change", apply);
    reduceQuery.addEventListener("change", apply);

    const parsed = readGenerate(window.location.search);
    let g = parsed.view.g;
    if (parsed.view.kind === "piece" && !parsed.hasG) {
      const stored = parseHex4(sessionStorage.getItem(GRID_KEY));
      if (stored != null) g = stored;
    }
    const next = { ...parsed.view, g };
    if (next.kind === "grid") sessionStorage.setItem(GRID_KEY, hex4(next.g));
    setView(next);
    setFavs(readFavs());
    if (parsed.dirty) history.replaceState({ pt: next.kind, g: next.g }, "", parsed.path);
    setReady(true);
    (window as Window & { __ptTraits?: typeof traits }).__ptTraits = traits;

    const onPop = () => {
      const again = readGenerate(window.location.search);
      setView((current) => {
        let grid = again.view.g;
        if (again.view.kind === "piece" && !again.hasG) {
          const stored = parseHex4(sessionStorage.getItem(GRID_KEY));
          grid = stored ?? current.g;
        }
        return { ...again.view, g: grid };
      });
      setDraft(null);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      phoneQuery.removeEventListener("change", apply);
      fineQuery.removeEventListener("change", apply);
      reduceQuery.removeEventListener("change", apply);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const allSeeds = useMemo(() => gridSeeds(view.g), [view.g]);
  const shown = useMemo(() => (phone ? phoneSeeds(allSeeds) : allSeeds), [phone, allSeeds]);
  const liveR = draft?.r ?? view.r;
  const liveSp = draft?.sp ?? view.sp;
  const relative = view.kind === "piece" ? piecePath(view.s, view.r, view.sp) : gridPath(view.g, view.r, view.sp);
  const neighbors = shown.includes(view.s) ? shown : allSeeds;
  const place = neighbors.indexOf(view.s);

  const commit = useCallback((patch: { r?: number; sp?: number }) => {
    setView((current) => {
      const next = { ...current, ...patch };
      const path = next.kind === "piece" ? piecePath(next.s, next.r, next.sp) : gridPath(next.g, next.r, next.sp);
      history.replaceState({ pt: next.kind, g: next.g }, "", path);
      return next;
    });
    setDraft(null);
  }, []);

  const star = useCallback(
    (seed: number) => {
      setFavs((current) => {
        const next = toggleFav(current, seed, viewRef.current.r, viewRef.current.sp);
        writeFavs(next);
        return next;
      });
      if (!reduce) {
        setPopSeed(hex4(seed));
        window.setTimeout(() => setPopSeed((current) => (current === hex4(seed) ? null : current)), 140);
      }
    },
    [reduce],
  );

  const pick = useCallback((seed: number) => {
    const current = viewRef.current;
    sessionStorage.setItem(GRID_KEY, hex4(current.g));
    const path = piecePath(seed, current.r, current.sp);
    history.pushState({ pt: "piece", g: current.g }, "", path);
    setDraft(null);
    setView({ ...current, kind: "piece", s: seed });
  }, []);

  const backToGrid = useCallback(() => {
    const current = viewRef.current;
    const path = gridPath(current.g, current.r, current.sp);
    history.pushState({ pt: "grid", g: current.g }, "", path);
    setDraft(null);
    setView({ ...current, kind: "grid" });
  }, []);

  const stepPiece = useCallback(
    (dir: number) => {
      if (place < 0) return;
      const seed = neighbors[(place + dir + neighbors.length) % neighbors.length];
      const current = viewRef.current;
      const path = piecePath(seed, current.r, current.sp);
      history.replaceState({ pt: "piece", g: current.g }, "", path);
      setView({ ...current, kind: "piece", s: seed });
    },
    [neighbors, place],
  );

  const reroll = useCallback(() => {
    if (rerolling) return;
    setRerolling(true);
    const bytes = new Uint16Array(1);
    crypto.getRandomValues(bytes);
    let g = bytes[0];
    if (g === viewRef.current.g) g = (g + 1) & 0xffff;
    const current = viewRef.current;
    const path = gridPath(g, current.r, current.sp);
    history.pushState({ pt: "grid", g }, "", path);
    sessionStorage.setItem(GRID_KEY, hex4(g));
    setFresh((value) => value + 1);
    setFocus(0);
    setDraft(null);
    setView({ ...current, kind: "grid", g });
    const count = window.matchMedia("(max-width: 959px)").matches ? 9 : 16;
    window.setTimeout(() => setRerolling(false), (reduce ? 0 : count * 60 + 260));
  }, [reduce, rerolling]);

  const copyLink = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      show("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      show("Copy failed");
    }
  }, [show]);

  const exportPng = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    setExportFailed(false);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const current = viewRef.current;
    try {
      const family = await monoFamily();
      let canvas: HTMLCanvasElement;
      let note = "";
      try {
        canvas = document.createElement("canvas");
        canvas.width = 2400;
        canvas.height = 2400;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx || canvas.width !== 2400) throw new Error("canvas");
        drawPiece(ctx, 2400, 2400, current.s, current.r, current.sp);
      } catch {
        canvas = document.createElement("canvas");
        canvas.width = 1600;
        canvas.height = 1600;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("canvas");
        drawPiece(ctx, 1600, 1600, current.s, current.r, current.sp);
        note = "Exported at 1600². This device could not hold 2400².";
      }
      const stamp = stampPiece(canvas, current.s, family);
      canvas.dataset.stamp = stamp.corner;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("png");
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = `playtools-${hex4(current.s)}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(href), 4000);
      if (note) show(note);
    } catch {
      setExportFailed(true);
    } finally {
      setExporting(false);
    }
  }, [exporting, show]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat) return;
      if (document.documentElement.dataset.drawing === "1") return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return;
      if (target?.getAttribute("role") === "slider") return;
      const key = event.key.toLowerCase();
      const current = viewRef.current;
      if (current.kind === "grid") {
        const cols = window.matchMedia("(max-width: 959px)").matches ? 3 : 4;
        const count = cols === 3 ? Math.min(9, gridSeeds(current.g).length) : 16;
        if (key === "arrowright" || key === "arrowleft" || key === "arrowdown" || key === "arrowup") {
          event.preventDefault();
          const delta = key === "arrowright" ? 1 : key === "arrowleft" ? -1 : key === "arrowdown" ? cols : -cols;
          setFocus((index) => {
            const next = (index + delta + count) % count;
            tileRefs.current[next]?.focus();
            return next;
          });
        } else if (key === "f") {
          event.preventDefault();
          const seeds = window.matchMedia("(max-width: 959px)").matches ? phoneSeeds(gridSeeds(current.g)) : gridSeeds(current.g);
          const seed = seeds[focus];
          if (seed != null) star(seed);
        } else if (key === "r") {
          event.preventDefault();
          reroll();
        } else if (key === "s") {
          event.preventDefault();
          void copyLink();
        }
      } else if (key === "arrowleft") {
        event.preventDefault();
        stepPiece(-1);
      } else if (key === "arrowright") {
        event.preventDefault();
        stepPiece(1);
      } else if (key === "f") {
        event.preventDefault();
        star(current.s);
      } else if (key === "s") {
        event.preventDefault();
        void exportPng();
      } else if (key === "c") {
        event.preventDefault();
        void copyLink();
      } else if (key === "escape") {
        event.preventDefault();
        backToGrid();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [backToGrid, copyLink, exportPng, focus, reroll, star, stepPiece]);

  const firstFocus = shown.findIndex((seed) => !isDim(traits(seed)));
  useEffect(() => {
    if (view.kind !== "grid") return;
    setFocus(firstFocus < 0 ? 0 : firstFocus);
  }, [view.g, view.kind, firstFocus]);

  const labelFor = (seed: number) => traitLabel(seed);

  return (
    <div className={`gen-app${ready ? " is-ready" : ""}`} data-ready={ready ? "1" : "0"} data-kind={view.kind}>
      {view.kind === "grid" ? (
        <div className="gen-wrap">
          <Story step={2} phoneLabel="The grid" />
          <div className="gen-top">
            <div className="gen-copy">
              <h1 className="gen-title phone-only">Nine pieces, one rule.</h1>
              <h1 className="gen-title desk-only">Sixteen pieces, one rule.</h1>
              <RuleLine r={liveR} sp={liveSp} onLive={(patch) => setDraft({ r: liveR, sp: liveSp, ...patch })} onCommit={commit} />
            </div>
            <div className="reroll-stack">
              <button type="button" className="btn pri" data-testid="reroll" disabled={rerolling} onClick={reroll}>
                {rerolling ? "Rerolling…" : (
                  <>
                    <span className="phone-only">Reroll 9</span>
                    <span className="desk-only">Reroll 16</span>
                  </>
                )}
                {fine ? <kbd className="kbd on-dark">R</kbd> : null}
              </button>
              <FavLine count={favs.length} />
            </div>
          </div>
          <p className="grid-meta mono">
            <span>grid 0x{hex4(view.g)} · {phone ? "9" : "16"} seeds · tap a piece to pick it, ☆ to keep it</span>
            <span className="desk-only">{relative}</span>
          </p>
          <div className="gen-grid" data-testid="gen-grid" key={fresh}>
            {(phone ? shown : allSeeds).map((seed, index) => {
              const flagged = traits(seed);
              const dim = isDim(flagged);
              const on = isFav(favs, seed);
              const orbit = draft && index >= 3 ? view.r : liveR;
              const spread = draft && index >= 3 ? view.sp : liveSp;
              return (
                <div
                  key={`${fresh}-${seed}-${index}`}
                  className={`tile${dim ? " is-dim" : ""}${fresh ? " is-fresh" : ""}`}
                  style={fresh && !reduce ? { animationDelay: `${index * 60}ms` } : undefined}
                  ref={(node) => {
                    tileRefs.current[index] = node;
                  }}
                  role="button"
                  tabIndex={index === focus ? 0 : -1}
                  aria-label={`0x${hex4(seed)} Pick ${on ? "★" : "☆"}`}
                  data-dim={dim ? "1" : "0"}
                  data-busy={isBusy(flagged) ? "1" : "0"}
                  onClick={() => pick(seed)}
                  onFocus={() => setFocus(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      pick(seed);
                    }
                  }}
                >
                  <div className="art">
                    <ArtCanvas seed={seed} orbit={orbit} spread={spread} label="" />
                  </div>
                  <div className="cap">
                    <span className="mono seed-id">0x{hex4(seed)}</span>
                    <span className="cap-actions">
                      <span className="pick desk-only">Pick</span>
                      <button
                        type="button"
                        className={`star${on ? " on" : ""}${popSeed === hex4(seed) ? " pop" : ""}`}
                        aria-pressed={on}
                        aria-label={`${on ? "Remove" : "Save"} favorite 0x${hex4(seed)}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          star(seed);
                        }}
                      >
                        {on ? "★" : "☆"}
                      </button>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="gen-wrap">
          <Story step={4} phoneLabel="1 of 1" />
          <div className="picked">
            <div>
              <div className="picked-title-row phone-only">
                <h1 className="gen-title">
                  Seed <span className="mono seed-name">{hex4(view.s)}</span>
                </h1>
                <button type="button" className="back-link" onClick={backToGrid}>
                  ← grid{place >= 0 ? ` · ${place + 1} of ${neighbors.length}` : ""}
                </button>
              </div>
              <div
                className="art picked-art"
                data-testid="picked-art"
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  event.currentTarget.dataset.x = String(event.clientX);
                  event.currentTarget.dataset.y = String(event.clientY);
                }}
                onPointerUp={(event) => {
                  const x = Number(event.currentTarget.dataset.x || event.clientX);
                  const y = Number(event.currentTarget.dataset.y || event.clientY);
                  const dx = event.clientX - x;
                  const dy = event.clientY - y;
                  if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy)) stepPiece(dx < 0 ? 1 : -1);
                }}
              >
                <ArtCanvas
                  seed={view.s}
                  orbit={liveR}
                  spread={liveSp}
                  label={`Seed 0x${hex4(view.s)}, ${labelFor(view.s).form}`}
                />
              </div>
              <p className="picked-nav mono desk-only">
                <span>← → previous / next pick · Esc back to grid</span>
                <span>
                  0x{hex4(view.s)}
                  {place >= 0 ? ` · ${place + 1} of ${neighbors.length}` : ""}
                </span>
              </p>
            </div>
            <div className="picked-panel">
              <p className="from-grid mono desk-only">1 OF 1 · FROM GRID 0x{hex4(view.g)}</p>
              <h1 className="gen-title desk-only">
                Seed <span className="mono seed-name">{hex4(view.s)}</span>
              </h1>
              <p className="trait mono" data-testid="traits">
                {labelFor(view.s).form}
                <span className="muted"> · {labelFor(view.s).line}</span>
              </p>
              <RuleLine r={liveR} sp={liveSp} onLive={(patch) => setDraft({ r: liveR, sp: liveSp, ...patch })} onCommit={commit} />
              <ol className="step-list desk-only">
                {PICKED_LINES.map((line, index) => (
                  <li key={line} className={index === 4 ? "cur" : ""}>
                    <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                    <span>{index === 2 ? `The grid: 16 seeds from 0x${hex4(view.g)}.` : line}</span>
                  </li>
                ))}
              </ol>
              <div className="actions">
                <button type="button" className={`btn pri${exporting ? " is-busy" : ""}`} data-testid="export" disabled={exporting} onClick={() => void exportPng()}>
                  {exportFailed ? "Export failed · retry" : exporting ? "Exporting…" : "Export PNG"}
                  {exportFailed || exporting ? null : <span className="btn-note mono">2400²</span>}
                  {fine && !exporting && !exportFailed ? <kbd className="kbd on-dark">S</kbd> : null}
                </button>
                <button type="button" className="btn" data-testid="copy" onClick={() => void copyLink()}>
                  {copied ? "Copied" : "Copy link"}
                  {fine && !copied ? <kbd className="kbd">C</kbd> : null}
                </button>
                <button
                  type="button"
                  className={`btn star-btn${isFav(favs, view.s) ? " on" : ""}`}
                  aria-pressed={isFav(favs, view.s)}
                  aria-label={isFav(favs, view.s) ? "Favorited" : "Favorite"}
                  onClick={() => star(view.s)}
                >
                  <span aria-hidden="true">{isFav(favs, view.s) ? "★" : "☆"}</span>
                  <span className="desk-only">{isFav(favs, view.s) ? "Favorited" : "Favorite"}</span>
                </button>
              </div>
              <input className="link-field mono" readOnly aria-label="Relative link" data-testid="link-field" value={relative} />
              <FavLine count={favs.length} />
            </div>
          </div>
        </div>
      )}
      {toast ? (
        <p className="toast" role="status">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
