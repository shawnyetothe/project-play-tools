"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWorkspace } from "./Workspace";

const ROUTES: Record<string, string> = {
  g: "/generate/",
  e: "/examples/",
  t: "/tools/",
  l: "/learn/",
};

export function KeyHints() {
  const router = useRouter();
  const { href, share, reset } = useWorkspace();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onKey = (event: KeyboardEvent) => {
      if (!fine.matches) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return;
      if (document.documentElement.dataset.drawing === "1") return;
      const key = event.key.toLowerCase();
      if (key in ROUTES) {
        event.preventDefault();
        router.push(href(ROUTES[key]));
        return;
      }
      if (key === "s") {
        event.preventDefault();
        void share();
      } else if (key === "r") {
        event.preventDefault();
        reset();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.dataset.keys = "1";
    return () => {
      document.removeEventListener("keydown", onKey);
      delete document.documentElement.dataset.keys;
    };
  }, [href, reset, router, share]);

  return (
    <p className="key-hints" data-keys="">
      <kbd>[G]</kbd>
      <kbd>[E]</kbd>
      <kbd>[T]</kbd>
      <kbd>[L]</kbd>
      <kbd>[S]</kbd> share
      <kbd>[R]</kbd> reset
    </p>
  );
}
