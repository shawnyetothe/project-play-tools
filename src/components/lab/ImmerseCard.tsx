"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Piece } from "./use-piece";
import { drawSalt } from "@/lib/seed";
import { drawHero } from "@/lib/seed-draw";
import { fitCanvas } from "./canvas-fit";

function stillSpace(canvas: HTMLCanvasElement, seed: string, tool: number) {
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  drawHero(fitted.ctx, fitted.w, fitted.h, {
    salt: drawSalt(seed, "maker", "", 4),
    tool,
    door: "maker",
    t: 0,
    pointer: { x: 0.5, y: 0.5 },
    hour: 12,
    bursts: [],
    now: 0,
    still: true,
  });
}

function lowPower() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return true;
  if (nav.deviceMemory && nav.deviceMemory <= 2) return true;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return true;
  return false;
}

export function ImmerseCard({ piece }: { piece: Piece }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stillRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"still" | "live" | "failed">("still");
  const [blocked, setBlocked] = useState(false);
  const { state, reduced } = piece;

  useEffect(() => {
    setBlocked(reduced || lowPower());
  }, [reduced]);

  useEffect(() => {
    const canvas = stillRef.current;
    if (!canvas || mode === "live") return;
    stillSpace(canvas, state.seed, state.tool);
  }, [mode, state.seed, state.tool]);

  useEffect(() => {
    if (mode !== "live") return;
    const host = mountRef.current;
    if (!host) return;
    let dead = false;
    let cleanup = () => {};
    const phone = window.matchMedia("(max-width: 720px)").matches;
    void import("three").then((THREE) => {
      if (dead || !mountRef.current) return;
      const width = host.clientWidth || 320;
      const height = host.clientHeight || 220;
      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75));
      renderer.setSize(width, height);
      renderer.setClearColor(0xf6f1e8, 1);
      host.replaceChildren(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 40);
      camera.position.set(0, 1.1, 4.2);
      const salt = drawSalt(state.seed, state.door, state.phrase, state.tool);
      const group = new THREE.Group();
      let s = salt % 2147483646 || 1;
      const rnd = () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
      const geo = new THREE.BoxGeometry(0.28, 1, 0.28);
      const mat = new THREE.MeshStandardMaterial({ color: 0x1c1915 });
      for (let i = 0; i < 14; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        const h = 0.3 + rnd() * 1.2;
        mesh.scale.y = h;
        mesh.position.set((rnd() - 0.5) * 3.2, h / 2, (rnd() - 0.5) * 1.6);
        group.add(mesh);
      }
      scene.add(group);
      scene.add(new THREE.AmbientLight(0xffffff, 0.85));
      const key = new THREE.DirectionalLight(0xffffff, 0.45);
      key.position.set(2, 3, 2);
      scene.add(key);
      let frame = 0;
      let running = true;
      const onVis = () => {
        running = document.visibilityState === "visible";
      };
      document.addEventListener("visibilitychange", onVis);
      const loop = (t: number) => {
        if (dead) return;
        frame = requestAnimationFrame(loop);
        if (!running) return;
        group.rotation.y = t * 0.00025;
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      cleanup = () => {
        cancelAnimationFrame(frame);
        document.removeEventListener("visibilitychange", onVis);
        renderer.dispose();
        geo.dispose();
        mat.dispose();
        host.replaceChildren();
      };
    }).catch(() => {
      if (!dead) setMode("failed");
    });
    return () => {
      dead = true;
      cleanup();
    };
  }, [mode, state.seed, state.door, state.phrase, state.tool]);

  return (
    <article className="lab-card" id="space">
      <h3>Immerse</h3>
      <p>The same seed, as a quiet 3D scene. It loads only when you ask.</p>
      {mode === "live" ? <div className="immerse-mount" ref={mountRef} /> : <canvas ref={stillRef} className="lineage-canvas" aria-hidden="true" />}
      {mode !== "live" ? (
        <button
          type="button"
          onClick={() => setMode("live")}
        >
          {blocked ? "Load the 3D scene" : "Show the scene"}
        </button>
      ) : (
        <button type="button" className="ghost" onClick={() => setMode("still")}>
          Hide the scene
        </button>
      )}
      {mode === "failed" ? <p className="quiet">The scene did not load. The still frame stays.</p> : null}
      <p>
        <Link className="try" href="/tools/three/">
          Try it
        </Link>
      </p>
    </article>
  );
}
