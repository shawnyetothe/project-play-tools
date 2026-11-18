"use client";

import { useState } from "react";
import { HeroToy } from "@/components/workspace/HeroToy";
import { RuleCaption } from "@/components/workspace/RuleCaption";
import type { Piece } from "@/components/lab/use-piece";
import { isPlaying, playSeed, stopSeed } from "@/lib/seed-audio";
import { STARTS, picksFor } from "@/lib/starts";

export function PublicHero({ piece }: { piece: Piece }) {
  const { state, soundOn, setSoundOn, lock, shuffle, setDoor, setPick, setPhrase } = piece;
  const [live, setLive] = useState("");

  async function onPlay() {
    lock();
    if (isPlaying()) {
      stopSeed();
      setSoundOn(false);
      setLive("Sound stopped");
      return;
    }
    setLive("Sound on");
    setSoundOn(true);
    try {
      await playSeed(state.seed, () => {});
      setSoundOn(true);
    } catch {
      setSoundOn(false);
      setLive("Sound did not start. Tap play again.");
    }
  }

  return (
    <div className="public-hero">
      <div className="public-hero-art">
        <HeroToy
          seed={state.seed}
          onInteract={lock}
          caption={<RuleCaption />}
        />
      </div>
      <div className="public-hero-panel">
        <h1>Draw a line. Watch the rule take it.</h1>
        <p className="sub">Play it. Then read the rules.</p>
        <div className="hero-actions">
          <button
            type="button"
            className="hero-primary"
            onClick={() => document.querySelector<HTMLCanvasElement>("[data-testid=hero-canvas]")?.focus()}
          >
            Keep playing
          </button>
          <a className="hero-secondary" href="#rule">
            See the code
          </a>
        </div>
        <div className="door-stack" data-doors="open">
          <p>Pick a way in</p>
          {STARTS.map((item) => (
            <button
              key={item.id}
              id={`start-${item.id}`}
              type="button"
              aria-pressed={state.door === item.id}
              aria-expanded={state.door === item.id}
              onClick={() => setDoor(item.id)}
            >
              <strong>{item.label}</strong>
              <span>{item.id === "maker" ? "Who am I?" : item.question}</span>
            </button>
          ))}
          {state.door ? (
            <div className="start-panel" id="start-panel" role="region" aria-label={`${state.door} starting point`}>
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
                <div className="maker-row" role="group" aria-label={state.door === "maker" ? "Who you are" : "What you want to make"}>
                  {picksFor(state.door).map((item) => (
                    <button key={item.id} type="button" aria-pressed={state.pick === item.id} onClick={() => setPick(item.id)}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
        <div className="hero-actions">
          <button type="button" className="hero-secondary" aria-pressed={soundOn} onClick={() => void onPlay()}>
            {soundOn ? "Stop sound" : "Play sound"}
          </button>
          <button type="button" className="hero-secondary" onClick={shuffle}>
            Shuffle
          </button>
        </div>
        <p className="hero-hint" aria-live="polite">
          {live}
        </p>
      </div>
    </div>
  );
}
