"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_STATE,
  STORAGE_KEY,
  readHash,
  readPublic,
  withState,
  writeHash,
  writePublic,
  type Door,
  type LinePoint,
  type PieceState,
} from "@/lib/workspace-state";

type WorkspaceValue = {
  state: PieceState;
  line: LinePoint[];
  href: (path: string) => string;
  setState: (patch: Partial<PieceState>) => void;
  setLine: (points: LinePoint[]) => void;
  markInteracted: () => void;
  reset: () => void;
  share: () => Promise<void>;
  shared: boolean;
};

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Workspace is missing");
  return value;
}

function readStored(): { state: PieceState; line: LinePoint[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { state?: PieceState; line?: LinePoint[] };
    if (!data.state?.seed) return null;
    return { state: { ...DEFAULT_STATE, ...data.state }, line: data.line || [] };
  } catch {
    return null;
  }
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [state, setPiece] = useState<PieceState>(DEFAULT_STATE);
  const [line, setLineState] = useState<LinePoint[]>([]);
  const [ready, setReady] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const fromUrl = readPublic(window.location.search);
    const hashLine = readHash(window.location.hash);
    const stored = readStored();
    const early = (window as Window & { __playStroke?: LinePoint[] }).__playStroke;
    const hasQuery = window.location.search.length > 1;
    const next = hasQuery ? { ...fromUrl, interacted: fromUrl.interacted || hashLine.length > 0 } : stored?.state || fromUrl;
    if (hashLine.length || stored?.line.length || (early && early.length > 1)) next.interacted = true;
    setPiece(next);
    setLineState(hashLine.length ? hashLine : early && early.length > 1 ? early : stored?.line || []);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const query = writePublic(state);
    const hash = writeHash(line);
    const next = `${pathname}${query}${hash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== next) {
      window.history.replaceState(null, "", next);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, line }));
  }, [state, line, ready, pathname]);

  const setState = useCallback((patch: Partial<PieceState>) => {
    setPiece((current) => ({ ...current, ...patch }));
  }, []);

  const setLine = useCallback((points: LinePoint[]) => {
    setLineState(points);
    setPiece((current) => ({ ...current, interacted: true }));
  }, []);

  const markInteracted = useCallback(() => {
    setPiece((current) => ({ ...current, interacted: true }));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPiece({ ...DEFAULT_STATE, interacted: false });
    setLineState([]);
    router.replace(pathname);
  }, [pathname, router]);

  const share = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    } catch {
      setShared(false);
    }
  }, []);

  const href = useCallback((path: string) => withState(path, state, writeHash(line)), [state, line]);

  const value = useMemo(
    () => ({ state, line, href, setState, setLine, markInteracted, reset, share, shared }),
    [state, line, href, setState, setLine, markInteracted, reset, share, shared],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function Tray() {
  const { state, href, share, shared, reset } = useWorkspace();
  if (!state.interacted) return null;
  return (
    <aside className="tray" data-tray="open" aria-label="Current piece">
      <span className="tray-thumb" aria-hidden="true" />
      <span className="tray-meta">
        <strong>{state.seed}</strong>
        <span>{state.door || "no door"}</span>
      </span>
      <Link href={href("/generate/")}>Generate</Link>
      <button type="button" onClick={() => void share()}>{shared ? "Copied" : "Share"}</button>
      <button type="button" onClick={reset}>Reset</button>
    </aside>
  );
}

export function PhoneNav() {
  const pathname = usePathname() || "/";
  const { href } = useWorkspace();
  const links = [
    { href: "/generate/", label: "Generate" },
    { href: "/examples/", label: "Examples" },
    { href: "/tools/", label: "Tools" },
    { href: "/learn/", label: "Learn" },
  ];
  return (
    <nav className="phone-nav" aria-label="Workspace">
      {links.map((link) => {
        const current = pathname === link.href || pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={href(link.href)} aria-current={current ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function doorLabel(door: Door) {
  if (door === "message") return "Message";
  if (door === "medium") return "Medium";
  if (door === "maker") return "Maker";
  return "";
}
