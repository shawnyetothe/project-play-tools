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
    count = tool.get("projectCount")
    has_count = isinstance(count, int)
    text = f"{tool.get('plain') or ''} {tool.get('what') or ''} {tool.get('intro') or ''}".lower()
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
            "projectCount": count if has_count else None,
            "underused": has_count and count < 10,
            "hasStarter": bool(tool.get("sketch")),
            "beginnerFriendly": "beginner" in text,
        }
    )

payload = {
    "name": "PlayTools",
    "independent": True,
    "robots": "noindex, nofollow, noarchive",
    "seedUrl": "/lab/composed/?seed={6 hex}&start={message|medium|maker}&pick={option}&tool={1-6}&make={phrase}&walk={n}&noise={n}&grid={n}&count={n}&rd={n}&tile={n}",
    "seedStorageKey": "playtools-seed",
    "seedNeverSent": True,
    "startingPoints": [
        {
            "id": "message",
            "question": "What do I want to say?",
            "detail": "Start from a feeling or idea, and we'll suggest tools that can express it.",
        },
        {
            "id": "medium",
            "question": "What do I want to make?",
            "detail": "Start from the result: a print, plotter drawing, animation, sound or 3D.",
            "picks": ["print", "plotter", "animation", "sound", "3d"],
        },
        {
            "id": "maker",
            "question": "Who am I?",
            "detail": "Start from you: new to code, designer, musician or artist. We'll match tools to how you work.",
            "picks": ["new", "designer", "musician", "artist"],
        },
    ],
    "creativeIndex": {
        "page": "/lab/tools/",
        "pulledAt": "2026-10-25 19:40 ET",
        "source": "Art Blocks public GraphQL at https://data.artblocks.io/v1/graphql, stored in this guide's pull. projectCount is how many projects in that pull matched the tool. A project can match more than one tool. Category sums are not published because they would double-count.",
        "underusedRule": "underused is true when projectCount is a real number under 10. The cutoff is this guide's. The count is not an estimate. 0 means zero matched projects, not missing data.",
        "noDataYet": "projectCount null means no data yet. Named effects in mixes have no project counts.",
        "beginnerFriendly": "true only when the tool text in this dataset says beginner. hasStarter means this guide includes a starter sketch.",
    },
    "mixes": {
        "param": "mix",
        "example": "flowfield+dither",
        "label": "try this pairing",
        "why": "The 2026-10-25 19:40 ET Art Blocks pull counts libraries (p5.js 842, shaders 394, three.js 84, Tone.js 17). It does not count how often named effects such as flow field and dithering are combined, so pairings are not marked popular or rarely combined.",
    },
    "howToChoose": [
        "If the URL has start=message, start=medium, or start=maker, begin there. pick= is the option inside that starting point.",
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
