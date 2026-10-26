"use client";

import { useEffect, useState } from "react";

type Kind = "svg" | "png" | "apng" | "video";

function probeImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

function probeVideo(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const timer = window.setTimeout(() => resolve(false), 1200);
    video.preload = "auto";
    video.muted = true;
    video.onloadeddata = () => {
      window.clearTimeout(timer);
      resolve(true);
    };
    video.onerror = () => {
      window.clearTimeout(timer);
      resolve(false);
    };
    video.src = url;
    video.load();
  });
}

/** Static SVG until a designer file is present. Motion files are skipped when the visitor asks for less motion. */
export function LogoMark() {
  const [kind, setKind] = useState<Kind>("svg");

  useEffect(() => {
    let gone = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    (async () => {
      if (!reduce && (await probeVideo("/logo.webm"))) {
        if (!gone) setKind("video");
        return;
      }
      if (!reduce && (await probeImage("/logo.apng"))) {
        if (!gone) setKind("apng");
        return;
      }
      if (await probeImage("/logo.png")) {
        if (!gone) setKind("png");
      }
    })();
    return () => {
      gone = true;
    };
  }, []);

  if (kind === "video") {
    return (
      <video className="logo-mark" autoPlay muted loop playsInline poster="/logo.svg" width={40} height={40} aria-hidden="true">
        <source src="/logo.webm" type="video/webm" />
      </video>
    );
  }

  const src = kind === "apng" ? "/logo.apng" : kind === "png" ? "/logo.png" : "/logo.svg";
  return <img className="logo-mark" src={src} alt="" width={40} height={40} />;
}
