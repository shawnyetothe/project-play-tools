"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fitCanvas } from "./canvas-fit";
import type { Piece } from "./use-piece";
import { FEATURED, drawSalt, type Door } from "@/lib/seed";
import { burstPoint, drawHero, type Burst } from "@/lib/seed-draw";
import { isPlaying, playSeed, stopSeed } from "@/lib/seed-audio";

const DOORS: { id: Door; hint: string }[] = [
  { id: "message", hint: "What you want to say" },
  { id: "medium", hint: "What it is made of" },
  { id: "maker", hint: "How you want to work" },
];

export function HeroStage({ piece }: { piece: Piece }) {
  const artRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bursts = useRef<Burst[]>([]);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const visible = useRef(true);
  const dirty = useRef(true);
  const wake = useRef<() => void>(() => {});
  const [live, setLive] = useState("Sketch");

  const { state, motion, reduced, soundOn, setSoundOn, setMotion, lock, shuffle, setDoor, setPhrase, setTool } = piece;

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
  }, [motion, state.seed, state.door, state.phrase, state.tool]);

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
        <p className="guide-phone">Play. Change. Share.</p>
        <p className="stage-lede">Your seed follows you down the page. Nothing is sent anywhere.</p>
        <div className="stage-ask">
        <p className="ask" id="make-label">
          What do you want to make?
        </p>
        <div className="chip-row" role="group" aria-labelledby="make-label">
          {DOORS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip"
              aria-pressed={state.door === item.id}
              onClick={() => setDoor(item.id)}
            >
              {item.id[0].toUpperCase() + item.id.slice(1)}
              <span className="quiet">{item.hint}</span>
            </button>
          ))}
        </div>
        {state.door === "message" ? (
          <label>
            Your message
            <input
              value={state.phrase}
              onChange={(event) => setPhrase(event.target.value)}
              placeholder="a lullaby I hum to my kids"
              autoComplete="off"
            />
          </label>
        ) : null}
        <p>
          <a className="lab-go" href="#find">
            Start making
          </a>
        </p>
        <p className="quiet reel-status" aria-live="polite">
          {live}
        </p>
        </div>
      </div>
      <div className="stage-art" ref={artRef}>
        <canvas
          ref={canvasRef}
          className="stage-canvas"
          aria-label="Live sketch from your seed"
          onPointerDown={() => lock()}
          onPointerMove={onPointer}
        />
        <div className="stage-guide">
          <ol>
            <li>Play. Tap the mark.</li>
            <li>Change. Pick a chip, or shuffle.</li>
            <li>Share. The address is the piece.</li>
          </ol>
        </div>
        <div className="stage-hud">
          <button type="button" className="play-mark" aria-pressed={soundOn} aria-label={soundOn ? "Stop sound" : "Play sound"} onClick={() => void onPlay()}>
            <img src="/logo-mark.png" alt="" width={48} height={48} />
          </button>
          <button type="button" className="reel" onClick={() => setTool(state.tool + 1)} aria-label={`Featured tool ${state.tool + 1} of 6, ${featured.name}. Next.`}>
            {state.tool + 1} / 6
          </button>
          <Link href={`/tools/${featured.id}/`}>{featured.name}</Link>
          <button type="button" className="ghost" onClick={shuffle}>
            Shuffle
          </button>
          <button type="button" className="ghost" aria-pressed={!motion} onClick={() => setMotion(!motion)}>
            {motion ? "Pause" : "Play motion"}
          </button>
        </div>
      </div>
    </div>
  );
}
