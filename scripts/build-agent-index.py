#!/usr/bin/env python3
"""Write public/tools.json from the generated tool dataset."""

import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
tools = json.loads((root / "src/generated/tools.json").read_text())
rows = []
for tool in tools:
    image = tool.get("image") or {}
    verified = image.get("status") == "verified" and image.get("caption")
    slug = image.get("artistSlug") or ""
    artist = f"/artists/{slug}/" if verified and slug and slug != "art-blocks" else None
    if verified:
        hero = {
            "caption": image.get("caption") or "",
            "credit": image.get("credit") or "",
            "license": image.get("license") or "",
            "artist": artist,
        }
        license_notes = (
            "Starter sketches in this guide are original and are not an artist's project. "
            f"Example: {hero['caption']}. {hero['license'] or 'No license line.'} Do not reproduce that image."
        )
    else:
        hero = None
        license_notes = "No verified example image. Starter sketches in this guide are original and are not an artist's project."
    rows.append(
        {
            "id": tool["id"],
            "name": tool["name"],
            "plain": tool["plain"],
            "category": tool.get("category") or "",
            "what": tool.get("what") or "",
            "firstProject": tool.get("firstProject") or "",
            "starter": f"/tools/{tool['id']}/",
            "licenseNotes": license_notes,
            "heroExample": hero,
            "physical": bool(tool.get("physical")),
        }
    )

payload = {
    "name": "PlayTools",
    "independent": True,
    "robots": "noindex, nofollow, noarchive",
    "seedUrl": "/lab/composed/?seed={6 hex}&door={message|medium|maker}&tool={1-6}&make={phrase}&walk={n}&noise={n}&grid={n}&count={n}&rd={n}&tile={n}",
    "seedStorageKey": "playtools-seed",
    "seedNeverSent": True,
    "howToChoose": [
        "Read tools[].plain, name, category, what, and firstProject.",
        "If the phrase mentions lullaby, hum, song, music, sound, or note, choose id tonejs.",
        "If the phrase mentions pen, plot, plotter, or ink, choose id plotter.",
        "If the phrase mentions 3d, sculpture, or scene, choose id three.",
        "If the phrase mentions shader, pixel, or color, choose id glsl.",
        "Otherwise choose the tool with the most overlapping words. If none overlap, choose id p5.",
    ],
    "howToFirstSketch": "Build an original first sketch. Do not copy or redraw an existing artwork. Tool: {name}. Plain name: {plain}. Category: {category}. First project: {firstProject}. Starter page: {starter}. License: {licenseNotes}. Visitor seed: {seed}. Phrase: {make}. Seed URL: {seedUrl}. Use the seed as the random seed. Do not send the seed to a server.",
    "tools": rows,
}
out = root / "public/tools.json"
out.write_text(json.dumps(payload, indent=2) + "\n")
print(f"wrote {out} ({len(rows)} tools)")
