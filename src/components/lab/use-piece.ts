"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  defaultPiece,
  knobsFromSeed,
  piecePath,
  pieceSearch,
  randomSeed,
  readPiece,
  readStoredPiece,
  writeStoredPiece,
  type Door,
  type Knobs,
  type PieceState,
} from "@/lib/seed";
import { seedForStart, toolForStart } from "@/lib/starts";

export function usePiece() {
  const [state, setState] = useState<PieceState>(defaultPiece);
  const [motion, setMotion] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = readPiece(window.location.search) || readStoredPiece();
    if (stored) setState(stored);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reduce);
    setMotion(!reduce);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current || !state.locked) return;
    const next = `${window.location.pathname}?${pieceSearch(state)}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(null, "", next);
    }
    writeStoredPiece(state);
  }, [state]);

  const lock = useCallback(() => {
    setState((current) => (current.locked ? current : { ...current, locked: true }));
  }, []);

  const shuffle = useCallback(() => {
    const seed = randomSeed();
    setState((current) => ({ ...current, seed, knobs: knobsFromSeed(seed), locked: true }));
  }, []);

  const setDoor = useCallback((door: Door) => {
    setState((current) => {
      if (current.door === door) {
        const fresh = defaultPiece();
        return { ...fresh, locked: true };
      }
      const seed = seedForStart(door);
      return {
        ...current,
        door,
        pick: "",
        seed,
        knobs: knobsFromSeed(seed),
        tool: toolForStart(door),
        locked: true,
      };
    });
  }, []);

  const setPick = useCallback((pick: string) => {
    setState((current) => {
      if (!current.door) return current;
      const seed = seedForStart(current.door, pick);
      return {
        ...current,
        pick,
        seed,
        knobs: knobsFromSeed(seed),
        tool: toolForStart(current.door, pick),
        locked: true,
      };
    });
  }, []);

  const clearStart = useCallback(() => {
    const fresh = defaultPiece();
    setState({ ...fresh, locked: true });
  }, []);

  const setPhrase = useCallback((phrase: string) => {
    setState((current) => ({ ...current, phrase: phrase.slice(0, 180), door: "message", locked: true }));
  }, []);

  const setTool = useCallback((tool: number, commit = true) => {
    setState((current) => ({
      ...current,
      tool: ((tool % 6) + 6) % 6,
      locked: commit ? true : current.locked,
    }));
  }, []);

  const setKnob = useCallback((key: keyof Knobs, value: number) => {
    setState((current) => ({
      ...current,
      locked: true,
      knobs: { ...current.knobs, [key]: value },
    }));
  }, []);

  return {
    state,
    motion,
    reduced,
    soundOn,
    setSoundOn,
    setMotion,
    lock,
    shuffle,
    setDoor,
    setPick,
    clearStart,
    setPhrase,
    setTool,
    setKnob,
    sharePath: piecePath(state),
  };
}

export type Piece = ReturnType<typeof usePiece>;
