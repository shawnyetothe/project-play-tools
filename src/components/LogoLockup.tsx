"use client";

import { useEffect, useState } from "react";
import { logoDarkSvg, logoLightSvg } from "./logo-markup";

type Motion = "off" | "video" | "apng";
type Tone = "auto" | "light" | "dark";

/** Play Key at 65% plus the PlayTools wordmark. The gradient follows the kit CSS. */
export function LogoLockup({ tone = "auto" }: { tone?: Tone }) {
  const [motion, setMotion] = useState<Motion>("off");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotion(media.matches ? "off" : "video");
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return (
    <span className={`logo-swap tone-${tone}`}>
      {tone !== "dark" ? (
        <Lockup variant="light" place="header" motion={motion} setMotion={setMotion} />
      ) : null}
      {tone !== "light" ? (
        <Lockup variant="dark" place={tone === "dark" ? "hero" : "header"} motion={motion} setMotion={setMotion} />
      ) : null}
    </span>
  );
}

function restartGradient(video: HTMLVideoElement) {
  const root = video.closest(".logo-lockup");
  if (!root) return;
  root.classList.remove("playtools-animated");
  void root.getBoundingClientRect();
  root.classList.add("playtools-animated");
}

function scopeSvg(svg: string, prefix: string) {
  let next = svg;
  for (const id of ["wlight", "wdark", "kwlightbz", "kwdarkbz", "kwlightcp", "kwdarkcp"]) {
    next = next.replaceAll(`id="${id}"`, `id="${prefix}-${id}"`).replaceAll(`url(#${id})`, `url(#${prefix}-${id})`);
  }
  return next;
}

function Lockup({
  variant,
  place,
  motion,
  setMotion,
}: {
  variant: "light" | "dark";
  place: string;
  motion: Motion;
  setMotion: (motion: Motion) => void;
}) {
  const moving = motion !== "off";
  const svg = scopeSvg(variant === "light" ? logoLightSvg : logoDarkSvg, `${place}-${variant}`);
  return (
    <span
      className={`logo-lockup lockup-${variant}${variant === "light" ? " playtools-on-light" : ""}${moving ? " playtools-animated" : ""}`}
    >
      <span className="logo-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      {motion === "video" ? (
        <video
          className="lockup-mark"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          poster="/logo-mark.png"
          onPlaying={(event) => {
            if (event.currentTarget.currentTime < 0.12) restartGradient(event.currentTarget);
          }}
          onSeeked={(event) => {
            if (event.currentTarget.currentTime < 0.08) restartGradient(event.currentTarget);
          }}
          onError={() => setMotion("apng")}
        >
          <source src="/logo-mark-animated.webm" type="video/webm" />
          {variant === "dark" ? (
            <source src="/logo-mark-animated-dark.mp4" type="video/mp4" />
          ) : (
            <source src="/logo-mark-animated.mp4" type="video/mp4" />
          )}
        </video>
      ) : null}
      {motion === "apng" ? (
        <img className="lockup-mark" src="/logo-mark-animated.apng" alt="" onError={() => setMotion("off")} />
      ) : null}
    </span>
  );
}
