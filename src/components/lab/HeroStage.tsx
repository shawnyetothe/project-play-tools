"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fitCanvas } from "./canvas-fit";
import { CineTile } from "./CineTile";
import { MixRow } from "./MixRow";
import type { Piece } from "./use-piece";
import { FEATURED, drawSalt } from "@/lib/seed";
import { STARTS, picksFor } from "@/lib/starts";
import { burstPoint, drawHero, type Burst } from "@/lib/seed-draw";
import { drawMix } from "@/lib/cine";
import { isPlaying, playSeed, stopSeed } from "@/lib/seed-audio";

export function HeroStage({ piece }: { piece: Piece }) {
  const artRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bursts = useRef<Burst[]>([]);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const visible = useRef(true);
  const dirty = useRef(true);
  const wake = useRef<() => void>(() => {});
  const [live, setLive] = useState("");
  const [hotKind, setHotKind] = useState("");

  const { state, motion, reduced, soundOn, setSoundOn, setMotion, lock, shuffle, setDoor, setPick, clearStart, setPhrase, setTool } = piece;

  useEffect(() => {
    const node = artRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (entry.isIntersecting) wake.current();
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    dirty.current = true;
  }, [state.seed, state.door, state.phrase, state.tool, motion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frame = 0;
    let looping = false;
    let alive = true;
    const start = performance.now();
    const tick = (now: number) => {
      looping = false;
      if (!alive) return;
      const hidden = document.visibilityState === "hidden";
      const moving = motion && visible.current && !hidden;
      if (moving || dirty.current) {
        const fitted = fitCanvas(canvas);
        if (fitted) {
          const salt = drawSalt(state.seed, state.door, state.phrase, state.tool);
          bursts.current = moving ? bursts.current.filter((burst) => now - burst.born < 900) : bursts.current.slice(-4);
          if (state.mix) {
            drawMix(fitted.ctx, fitted.w, fitted.h, state.mix, salt, moving ? now : 0);
          } else {
            drawHero(fitted.ctx, fitted.w, fitted.h, {
              salt,
              tool: state.tool,
              door: state.door,
              t: (now - start) / 1000,
              pointer: pointer.current,
              hour: new Date().getHours() + new Date().getMinutes() / 60,
              bursts: bursts.current,
              now,
              still: !moving,
            });
          }
          dirty.current = false;
        }
      }
      if (moving || (visible.current && dirty.current)) {
        looping = true;
        frame = requestAnimationFrame(tick);
      }
    };
    const startLoop = () => {
      if (looping) return;
      dirty.current = true;
      looping = true;
      frame = requestAnimationFrame(tick);
    };
    wake.current = startLoop;
    const onVis = () => {
      if (document.visibilityState === "visible") startLoop();
    };
    document.addEventListener("visibilitychange", onVis);
    looping = true;
    frame = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [motion, state.seed, state.door, state.phrase, state.tool, state.mix]);

  useEffect(() => {
    if (!motion || reduced) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden" || !visible.current) return;
      setTool(state.tool + 1, false);
    }, 6000);
    return () => window.clearInterval(id);
  }, [motion, reduced, setTool, state.tool]);

  function onPointer(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
    dirty.current = true;
    wake.current();
  }

  async function onPlay() {
    lock();
    if (isPlaying()) {
      stopSeed();
      setSoundOn(false);
      setLive("Sound stopped");
      return;
    }
    const salt = drawSalt(state.seed, state.door, state.phrase, state.tool);
    setLive("Sound on");
    setSoundOn(true);
    try {
      await playSeed(state.seed, (note) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const point = burstPoint(note, rect.width, rect.height, salt);
        bursts.current.push({ ...point, born: performance.now() });
        dirty.current = true;
        wake.current();
      });
      setSoundOn(true);
    } catch {
      setSoundOn(false);
      setLive("Sound did not start. Tap play again.");
    }
  }

  const featured = FEATURED[state.tool];

  return (
    <div className="stage-grid">
      <div className="stage-copy">
        <h1 className="stage-title">Start a piece.</h1>
        <p className="stage-lede">Your seed follows you down the page. Nothing is sent anywhere.</p>
        <p className="stage-guide-line">Play · Change · Share</p>
        <div className="stage-ask">
          <h3 id="start-heading">Start from anywhere.</h3>
          <p className="start-line">Pick a way in. You’ll get a matching sketch to play with and the tools that make it.</p>
          <div className="chip-row" role="group" aria-labelledby="start-heading">
            {STARTS.map((item, index) => (
              <button
                key={item.id}
                id={`start-${item.id}`}
                type="button"
                className="chip start-chip"
                aria-expanded={state.door === item.id}
                aria-pressed={state.door === item.id}
                aria-controls={state.door === item.id ? "start-panel" : undefined}
                onClick={() => setDoor(item.id)}
                onPointerEnter={() => setHotKind(item.id)}
                onPointerLeave={() => setHotKind("")}
                onFocus={() => setHotKind(item.id)}
                onBlur={() => setHotKind("")}
                onKeyDown={(event) => {
                  if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) return;
                  event.preventDefault();
                  const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
                  const next = STARTS[(index + step + STARTS.length) % STARTS.length];
                  setDoor(next.id);
                  document.getElementById(`start-${next.id}`)?.focus();
                }}
              >
                <CineTile kind={item.id} seed={state.seed} hot={hotKind === item.id || state.door === item.id} reduced={reduced} />
                <span className="start-label">{item.label}</span>
                <span className="start-q">{item.question}</span>
                <span className="start-detail">{item.detail}</span>
              </button>
            ))}
          </div>
          {state.door ? (
            <div className="start-panel" id="start-panel" role="region" aria-label={`${state.door} starting point`}>
              <button type="button" className="text-btn" onClick={clearStart}>
                All starting points
              </button>
              {state.door === "message" ? (
                <label htmlFor="start-message">
                  What do I want to say?
                  <textarea
                    id="start-message"
                    rows={3}
                    value={state.phrase}
                    onChange={(event) => setPhrase(event.target.value)}
                    placeholder="a lullaby I hum to my kids"
                  />
                </label>
              ) : (
                <div className="start-options" role="group" aria-label={state.door === "maker" ? "Who you are" : "What you want to make"}>
                  {picksFor(state.door).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={state.pick === item.id}
                      onClick={() => setPick(item.id)}
                      onPointerEnter={() => setHotKind(item.id)}
                      onPointerLeave={() => setHotKind("")}
                      onFocus={() => setHotKind(item.id)}
                      onBlur={() => setHotKind("")}
                    >
                      <CineTile kind={item.id} seed={state.seed} hot={hotKind === item.id || state.pick === item.id} reduced={reduced} />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
          <p>
            <a className="lab-go" href="#find">
              Start making
            </a>
          </p>
        </div>
      </div>
      <div className="stage-art" ref={artRef}>
        <div className="stage-frame">
          <canvas
            ref={canvasRef}
            className="stage-canvas"
            aria-label="Live sketch from your seed"
            onPointerDown={() => lock()}
            onPointerMove={onPointer}
          />
        </div>
        <div className="stage-controls">
          <button type="button" className="play-mark" aria-pressed={soundOn} aria-label={soundOn ? "Stop sound" : "Play sound"} onClick={() => void onPlay()}>
            {soundOn ? (
              <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                <path fill="#F5F5F2" d="M1 1h3.2v10H1zM7.8 1H11v10H7.8z" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 14" width="12" height="14" aria-hidden="true">
                <path fill="#F5F5F2" d="M1 1l10 6-10 6z" />
              </svg>
            )}
          </button>
          <button type="button" className="seed-count" onClick={() => setTool(state.tool + 1)} aria-label={`Seed ${state.tool + 1} of 6, ${featured.name}. Next.`}>
            Seed {state.tool + 1} of 6
          </button>
          <Link className="tool-tag" href={`/tools/${featured.id}/`}>
            {featured.name}
          </Link>
          <span className="controls-end">
            <button type="button" className="text-btn" onClick={shuffle}>
              Shuffle
            </button>
            <button type="button" className="text-btn" aria-pressed={!motion} onClick={() => setMotion(!motion)}>
              {motion ? "Pause" : "Play motion"}
            </button>
          </span>
        </div>
        {state.mix ? <p className="mix-now">{state.mix.replace("+", " + ")}</p> : null}
        <p className="quiet reel-status" aria-live="polite">
          {live}
        </p>
      </div>
      <MixRow piece={piece} />
    </div>
  );
}
