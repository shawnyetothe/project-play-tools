#!/usr/bin/env python3
"""Defer lab-page JavaScript until after first paint.

The headline and lede are in the HTML. Next's chunk scripts are not needed to
paint them, but on a fast origin they finish before LCP and Lighthouse then
treats them as part of the mobile critical path. Homepage HTML is left alone.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out" / "lab"

SCRIPT_RE = re.compile(
    r'<script src="(/_next/static/chunks/[^"]+)"([^>]*)></script>',
)
PRELOAD_RE = re.compile(
    r'<link rel="preload" as="script"[^>]*>',
)


def loader(srcs: list[tuple[str, bool]]) -> str:
    payload = ",".join(
        '{"s":"%s","n":%d}' % (src, 1 if no_module else 0) for src, no_module in srcs
    )
    return (
        "<script>"
        "(function(){"
        f"var list=[{payload}];"
        "function load(){"
        "var lab=document.querySelector('.lab');"
        "if(lab)lab.classList.add('fonts-ready');"
        "for(var i=0;i<list.length;i++){"
        "var s=document.createElement('script');"
        "s.src=list[i].s;"
        "if(list[i].n)s.noModule=true;"
        "s.async=false;"
        "document.body.appendChild(s);"
        "}"
        "}"
        "function later(){setTimeout(load,Math.max(0,400-performance.now()));}"
        "if(document.readyState==='complete')later();"
        "else window.addEventListener('load',later);"
        "})();"
        "</script>"
    )


def rewrite(path: Path) -> None:
    html = path.read_text()
    srcs: list[tuple[str, bool]] = []

    def take(match: re.Match[str]) -> str:
        attrs = match.group(2)
        srcs.append((match.group(1), "noModule" in attrs or "nomodule" in attrs))
        return ""

    html = PRELOAD_RE.sub("", html)
    html = SCRIPT_RE.sub(take, html)
    if not srcs:
        return
    if "</body>" not in html:
        raise SystemExit(f"no body in {path}")
    html = html.replace("</body>", loader(srcs) + "</body>", 1)
    path.write_text(html)
    print(f"{path.relative_to(ROOT)} deferred {len(srcs)} scripts")


def main() -> None:
    if not OUT.exists():
        raise SystemExit("out/lab is missing. Run next build first.")
    for path in sorted(OUT.rglob("*.html")):
        rewrite(path)


if __name__ == "__main__":
    main()
