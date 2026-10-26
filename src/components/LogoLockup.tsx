"use client";

import { useEffect, useState } from "react";

type Motion = "off" | "video" | "apng";

/** Designer’s Play Key lockup. The mark animates unless the visitor asks for less motion. */
export function LogoLockup() {
  const [motion, setMotion] = useState<Motion>("off");
  const [lightSrc, setLightSrc] = useState("/logo.svg");
  const [darkSrc, setDarkSrc] = useState("/logo-dark.svg");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotion(media.matches ? "off" : "video");
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return (
    <span className="logo-lockup">
      <img
        className="logo-still logo-still-light"
        src={lightSrc}
        alt="Play Tools"
        width={168}
        height={50}
        onError={() => setLightSrc("/logo.png")}
      />
      <img
        className="logo-still logo-still-dark"
        src={darkSrc}
        alt="Play Tools"
        width={168}
        height={50}
        onError={() => setDarkSrc("/logo-dark.png")}
      />
      {motion === "video" ? (
        <video
          className="lockup-mark"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          onError={() => setMotion("apng")}
        >
          <source src="/logo-mark-animated.webm" type="video/webm" />
          <source
            src="/logo-mark-animated.mp4"
            type="video/mp4"
            media="(prefers-color-scheme: light)"
          />
          <source
            src="/logo-mark-animated-dark.mp4"
            type="video/mp4"
            media="(prefers-color-scheme: dark)"
          />
          <source src="/logo-mark-animated.mp4" type="video/mp4" />
        </video>
      ) : null}
      {motion === "apng" ? (
        <img
          className="lockup-mark"
          src="/logo-mark-animated.apng"
          alt=""
          onError={() => setMotion("off")}
        />
      ) : null}
    </span>
  );
}
