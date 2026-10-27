"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { liveDrawers } from "./live-draw";
import { LogoLockup } from "./LogoLockup";

export type HeroWindow = {
  control: "play" | "pause" | "stop" | "rewind" | "forward";
  verb: string;
  id: string;
  label: string;
  image: { url: string; caption: string; license: string } | null;
};

export function PlayerHero({ windows }: { windows: HeroWindow[] }) {
  const root = useRef<HTMLElement>(null);
  const canvases = useRef<Record<string, HTMLCanvasElement | null>>({});
  const [reduce, setReduce] = useState(false);
  const [named, setNamed] = useState<string | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    let frame = 0;
    let running = true;
    const visible = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
    });
    if (root.current) visible.observe(root.current);

    const paint = (now: number) => {
      const t = reduce || !running ? 0 : now / 1000;
      for (const item of windows) {
        const canvas = canvases.current[item.id];
        const draw = liveDrawers[item.id];
        if (!canvas || !draw) continue;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (width < 2 || height < 2) continue;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const nextW = Math.max(1, Math.floor(width * ratio));
        const nextH = Math.max(1, Math.floor(height * ratio));
        if (canvas.width !== nextW || canvas.height !== nextH) {
          canvas.width = nextW;
          canvas.height = nextH;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw(ctx, t, 0, width, height);
      }
      if (!reduce) frame = window.requestAnimationFrame(paint);
    };

    frame = window.requestAnimationFrame(paint);
    const onResize = () => {
      if (reduce) paint(0);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      visible.disconnect();
    };
  }, [reduce, windows]);

  function onPress(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (!coarse || named === id) return;
    event.preventDefault();
    setNamed(id);
  }

  return (
    <section className="stage" ref={root} aria-labelledby="home-title">
      <div className="stage-inner">
        <h1 id="home-title" className="sr-only">PlayTools</h1>
        <div className="stage-brand" aria-hidden="true">
          <LogoLockup tone="dark" />
        </div>
        <div className="player-row">
          {windows.map((item) => {
            const showImage = Boolean(item.image) && !failed[item.id];
            const credit =
              item.image && !failed[item.id]
                ? `${item.image.caption}${item.image.license ? `. ${item.image.license}` : ""}`
                : failed[item.id]
                  ? "The library image did not load."
                  : "";
            return (
              <Link
                key={item.id}
                href={`/tools/${item.id}/`}
                className={named === item.id || failed[item.id] ? "player-link is-named" : "player-link"}
                data-control={item.control}
                data-tool={item.id}
                aria-label={credit ? `${item.verb}, ${item.label}. ${credit}` : `${item.verb}, ${item.label}`}
                onClick={(event) => onPress(event, item.id)}
              >
                <span className={`player-window is-${item.control}`}>
                  {showImage && item.image ? (
                    <img
                      src={item.image.url}
                      alt=""
                      onError={() => setFailed((current) => ({ ...current, [item.id]: true }))}
                    />
                  ) : (
                    <canvas
                      ref={(node) => {
                        canvases.current[item.id] = node;
                      }}
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="player-caption" aria-hidden="true">
                  <span className="player-name">{item.label}</span>
                  {credit ? <span className="player-credit">{credit}</span> : null}
                </span>
              </Link>
            );
          })}
        </div>
        <blockquote
          className="quote"
          cite="https://www.cnbc.com/video/2024/11/13/ai-doesnat-stand-a-chance-against-actors-or-shakespeare-ben-affleck-says.html"
        >
          <p>Craft is knowing how to work; art is knowing when to stop.</p>
          <footer>
            <a href="https://www.cnbc.com/video/2024/11/13/ai-doesnat-stand-a-chance-against-actors-or-shakespeare-ben-affleck-says.html">
              — Ben Affleck, CNBC Delivering Alpha, 2024
            </a>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
