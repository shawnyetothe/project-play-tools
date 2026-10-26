#!/usr/bin/env python3
"""Build src/generated JSON from data/source. Pages read that JSON. Do not hand-edit the output."""

from __future__ import annotations

import csv
import hashlib
import importlib.util
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "source"
OUT = ROOT / "src" / "generated"
OUT.mkdir(parents=True, exist_ok=True)

PLAIN = {
    "p5": "Draw in the browser",
    "glsl": "Color every pixel",
    "three": "Build a 3D scene",
    "vanilla": "Draw with plain code",
    "canvas2d": "Draw on a screen",
    "svg": "Make a vector file",
    "interactive": "Respond to a click or a key",
    "clock": "Change with the clock",
    "fetch": "Pull in live data",
    "niche": "Try a smaller library",
    "regl": "Talk to the graphics card",
    "paper": "Draw vector paths",
    "babylon": "Build a 3D world",
    "zdog": "Draw flat 3D shapes",
    "pjs": "An older Processing for the web",
    "aframe": "Place it in a headset",
    "tonejs": "Make notes in the browser",
    "webaudio": "Make sound in the browser",
    "twemoji": "Stamp with emoji",
    "jslegacy": "Early plain JavaScript",
    "custom": "A custom code bundle",
    "unspec": "No library recorded",
    "codetool": "A checked code claim",
    "sound": "A piece you can hear",
    "soundcode": "Sound found in the code",
    "ai": "Use a machine-learning model",
    "sensor": "Use a sensor or live data",
    "mic": "Listen with a microphone",
    "cv": "See with a camera",
    "bio": "Use a heartbeat",
    "eeg": "Use brain signals",
    "env": "Read the weather or the air",
    "motion": "Use tilt and motion",
    "haptics": "Buzz the phone",
    "gps": "Use a place",
    "xr": "View it in VR or AR",
    "mr": "Mix it with the room",
    "glasses": "Smart glasses",
    "spatial": "Place sound around you",
    "holo": "Show depth without a headset",
    "plotter": "Draw with a pen machine",
    "prints": "Print on paper",
    "screen": "Print with a screen",
    "riso": "Print on a risograph",
    "darkroom": "Print with light and chemistry",
    "embroid": "Stitch with a machine",
    "weave": "Weave cloth",
    "knit": "Knit with a machine",
    "fashion": "Print or stitch clothing",
    "textiles": "Work in cloth",
    "laser": "Cut with a laser",
    "cnc": "Carve with a machine",
    "fdm": "3D-print an object",
    "ceramic3d": "3D-print clay",
    "metal": "Cast or print metal",
    "ceramics": "Make ceramics",
    "glass": "Make glass",
    "sculpt": "Make a sculpture or a lamp",
    "kinetic": "Make something that moves",
    "furniture": "Make furniture",
    "physother": "Another physical output",
    "food": "Make food",
    "scent": "Make a scent",
    "vinyl": "Press a record",
    "projector": "Project it on a wall",
    "led": "Show it on lights",
    "frames": "Show it in a frame at home",
    "eink": "Show it on a paper-like screen",
    "pcb": "Build a small circuit",
    "button": "Use a physical button",
    "screenhw": "Put a screen in an object",
    "handheld": "Hold it in your hand",
    "rom": "Put it on a game cartridge",
    "nfc": "Tap to verify",
    "qr": "Link with a printed code",
    "rfid": "Use a long-range tag",
    "ble": "Announce it nearby",
    "passport": "Certify the object",
    "live": "Mint at a live event",
    "robot": "Draw with a robot arm",
    "oracle": "Read data from the chain",
    "mutable": "Let it change after mint",
    "decay": "Let a transfer change it",
    "onstate": "Read chain state",
    "onaudio": "Keep the sound on-chain",
    "timebased": "Let time change it",
    "pmp": "Let the owner change a setting",
    "redeem": "Redeem a physical object",
    "quantum": "Use a quantum computer",
    "fabfile": "Output a file a machine can make",
    "mech": "A token mechanic",
    "onchain": "Store it on the chain",
    "ipfs": "Store media on IPFS or Arweave",
    "erc8048": "Store notes on the token",
    "721t": "Let a token act as an agent",
    "erc6551": "Give a token its own wallet",
    "erc8004": "Give an agent an identity",
    "erc8217": "Bind an agent to a token",
    "erc7160": "Keep more than one version",
    "abx": "Publish it on-chain",
}

PHYSICAL = {
    "plotter", "prints", "screen", "riso", "darkroom", "embroid", "weave", "knit",
    "fashion", "textiles", "laser", "cnc", "fdm", "ceramic3d", "metal", "ceramics",
    "glass", "sculpt", "kinetic", "furniture", "physother", "food", "scent", "vinyl",
    "projector", "led", "frames", "eink", "pcb", "button", "screenhw", "handheld",
    "rom", "nfc", "qr", "rfid", "ble", "passport", "robot",
}

SKETCH = {
    "p5": "p5",
    "glsl": "glsl",
    "three": "three",
    "vanilla": "canvas",
    "canvas2d": "canvas",
    "jslegacy": "canvas",
    "interactive": "canvas",
    "svg": "svg",
    "plotter": "plotter",
    "tonejs": "tone",
    "sound": "tone",
    "webaudio": "webaudio",
    "soundcode": "webaudio",
    "onaudio": "webaudio",
    "spatial": "webaudio",
    "paper": "paper",
    "zdog": "zdog",
    "aframe": "aframe",
    "xr": "aframe",
    "regl": "regl",
    "babylon": "babylon",
    "clock": "canvas-clock",
    "timebased": "canvas-clock",
    "fetch": "canvas-offline",
}

V_TAG = {
    "l": "code/tool",
    "S": "sound",
    "a": "AI/ML",
    "d": "sensor/live data",
    "p": "plotter",
    "x": "prints",
    "k": "screen print",
    "r": "risograph",
    "e": "embroidery",
    "t": "textiles",
    "u": "sculpture/object",
    "o": "physical other",
    "4": "ROM in token",
    "5": "Live-event mint",
    "2": "On-chain state",
    "7": "Post-mint params (PMP)",
    "1": "Decay on transfer",
    "3": "On-chain audio",
    "6": "Time-based change",
    "8": "Physical redemption",
    "9": "Quantum raffle",
    "0": "Token as fabrication file",
    "m": "token mechanics",
}

V_COL = {
    "p": "plotter",
    "x": "prints",
    "k": "screen_print",
    "r": "risograph",
    "e": "embroidery",
    "t": "textiles",
    "u": "sculpture",
    "o": "physical_other",
    "S": "sound",
    "a": "ai_ml",
    "d": "sensor_data_desc",
}

HW = {
    "P": "custom PCB",
    "B": "physical button",
    "E": "embedded screen",
    "H": "handheld device",
}

PHYS_COLS = [
    ("plotter", "plotter", "Pen plotter"),
    ("embroidery", "embroidery", "Embroidery"),
    ("screen_print", "screen print", "Screen print"),
    ("risograph", "risograph", "Risograph"),
    ("sculpture", "sculpture/object", "Sculpture / object"),
    ("textiles", "textiles", "Textiles"),
    ("prints", "prints", "Prints"),
    ("physical_other", "physical other", "Physical (other)"),
]

CAUTION = re.compile(
    r"\b(first|before|slow|test|check|adjust|small|phone|stretch|duplicate|clean|not square)\b",
    re.I,
)

RECIPES = [
    {
        "slug": "plotter-edition",
        "title": "Plotter edition",
        "plain": "A drawing a pen machine can make",
        "toolIds": ["p5", "svg", "plotter"],
        "how": "Seeded p5.js sketch, exported as SVG paths, cleaned with vpype, drawn on an AxiDraw. Plot time per token is the real cost [estimate].",
        "publish": "Code project on Art Blocks (Studio) or ABX (deploy-code). To mark a token as plotted: PostParams on Art Blocks Flex, or a typed parameter on ABX [sourced features; the plotted flag is our suggestion].",
        "status": "Mature: 46 Art Blocks projects, rising",
    },
    {
        "slug": "3d-printed-object",
        "title": "3D-printed object",
        "plain": "An object from a 3D file",
        "toolIds": ["three", "fdm", "fabfile"],
        "how": "three.js scene from the token seed, exported as an .obj or STL, printed in FDM or resin. Collectors rarely own printers, so finishing is the product [estimate].",
        "publish": "Keep the export in the script so the token is the fabrication file (7 verified Art Blocks tokens do this) [AB data].",
        "status": "Under-explored",
    },
    {
        "slug": "chip-verified-physical",
        "title": "Chip-verified physical with redemption state",
        "plain": "A physical piece you can tap to check",
        "toolIds": ["plotter", "nfc", "erc8048", "redeem"],
        "how": "Plot or print each output, attach an NFC tag, and on redemption record 'issued' plus the chip ID as per-token state.",
        "publish": "Today: Art Blocks PostParams or an ABX typed parameter can hold that state [sourced features]. Next: ERC-8048 keys such as physical and chip [our inference: neither Art Blocks nor ABX documents ERC-8048].",
        "status": "Whitespace #1; ERC-8048 Emergent (Shawn's call)",
    },
    {
        "slug": "slow-token-eink",
        "title": "Slow token on an e-ink frame",
        "plain": "A picture that changes slowly on a paper-like screen",
        "toolIds": ["p5", "clock", "eink"],
        "how": "Clock-driven sketch that changes hourly, shown on a colour e-ink panel with an ESP32 (about $100 [estimate], SRB).",
        "publish": "A standard code project on either platform; the frame only needs the live view URL.",
        "status": "Whitespace #2",
    },
    {
        "slug": "generative-sound",
        "title": "Generative sound piece",
        "plain": "A piece you hear",
        "toolIds": ["webaudio", "tonejs", "interactive"],
        "how": "Web Audio graph seeded by the token hash; start sound on a tap because browsers block autoplay [estimate].",
        "publish": "Code project; on Art Blocks, libraries can come from the on-chain Dependency Registry [sourced].",
        "status": "Emergent: Web Audio rising",
    },
    {
        "slug": "embroidered-patch",
        "title": "Embroidered patch edition",
        "plain": "A stitched patch from a file",
        "toolIds": ["svg", "embroid"],
        "how": "SVG paths into Ink/Stitch (an Inkscape extension) to make a stitch file for an embroidery machine. {LOGO} made embroidery export a token feature [sourced].",
        "publish": "Code project that offers the stitch file as an output; physical redemption tracked with PostParams or an ABX parameter [our suggestion].",
        "status": "Emergent: 10 Art Blocks projects",
    },
    {
        "slug": "token-as-agent",
        "title": "Token as agent (experimental)",
        "plain": "A token that can act on its own",
        "toolIds": ["721t", "erc6551", "erc8048", "abx"],
        "how": "On a testnet: a generative ERC-721 that also carries 721T keys (context, endpoint[web]) read through ERC-8048 metadata(), plus an ERC-6551 account so the piece can hold things.",
        "publish": "ERC-6551 works with existing ERC-721s without contract changes per its spec [sourced], so an Art Blocks or ABX token could get an account [our inference]. 721T needs a contract that implements ERC-8048; neither platform documents that [our check].",
        "status": "Whitespace (Shawn's idea); no Art Blocks use found",
    },
]

MAKE_PATHS = [
    {
        "slug": "paper",
        "plain": "Paper",
        "line": "Drawings and prints",
        "blurb": "Start with a picture. Send it to a pen plotter or a print studio.",
        "toolIds": ["plotter", "prints", "screen", "riso", "darkroom", "svg", "p5"],
        "recipeSlugs": ["plotter-edition"],
    },
    {
        "slug": "fabric",
        "plain": "Fabric",
        "line": "Cloth and thread",
        "blurb": "Embroidery, weaving, and knitting. The file is often stitches or a thread grid.",
        "toolIds": ["embroid", "weave", "knit", "fashion", "textiles", "svg"],
        "recipeSlugs": ["embroidered-patch"],
    },
    {
        "slug": "objects",
        "plain": "Objects",
        "line": "Things you can hold",
        "blurb": "Print, cut, cast, or build a physical thing from the file.",
        "toolIds": ["fdm", "laser", "cnc", "sculpt", "ceramics", "ceramic3d", "glass", "metal", "kinetic", "pcb", "handheld", "nfc"],
        "recipeSlugs": ["3d-printed-object", "chip-verified-physical"],
    },
    {
        "slug": "sound",
        "plain": "Sound",
        "line": "Pieces you hear",
        "blurb": "Sound made in the browser, from the same seed as the picture.",
        "toolIds": ["tonejs", "webaudio", "sound", "spatial", "vinyl", "mic"],
        "recipeSlugs": ["generative-sound"],
    },
    {
        "slug": "screens",
        "plain": "Screens",
        "line": "Pictures on a display",
        "blurb": "Code that draws in a browser, a projector, a headset, or a frame at home.",
        "toolIds": ["p5", "glsl", "three", "vanilla", "canvas2d", "projector", "led", "frames", "eink", "xr"],
        "recipeSlugs": ["slow-token-eink"],
    },
    {
        "slug": "over-time",
        "plain": "Things that change over time",
        "line": "Work that keeps changing",
        "blurb": "Pieces that shift with the clock, the season, or what happens after mint.",
        "toolIds": ["clock", "timebased", "mutable", "decay", "pmp", "fetch", "eink"],
        "recipeSlugs": ["slow-token-eink"],
    },
    {
        "slug": "on-their-own",
        "plain": "Things that act on their own",
        "line": "Tokens as agents",
        "blurb": "A token that can hold things or speak for the work. Experimental.",
        "toolIds": ["721t", "erc6551", "erc8004", "erc8217", "erc8048", "abx"],
        "recipeSlugs": ["token-as-agent"],
    },
]


def read_csv(name: str) -> list[dict]:
    with (SRC / name).open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def slugify(value: str) -> str:
    text = unicodedata.normalize("NFKD", value)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text


def unique_slug(base: str, used: set[str]) -> str:
    slug = base or "item"
    n = 2
    while slug in used:
        slug = f"{base}-{n}"
        n += 1
    used.add(slug)
    return slug


def artist_slug(name: str, used: set[str]) -> str:
    base = slugify(name)
    if not base:
        base = "n-" + hashlib.sha1(name.encode("utf-8")).hexdigest()[:8]
    return unique_slug(base, used)


def day(value: str) -> str:
    return value[:10] if value else ""


def project_date(row: dict) -> str:
    return day(row["first_token_minted_et"] or row["mint_start_et"] or row["activated_at_et"])


def split_semi(value: str) -> list[str]:
    return [part for part in (value or "").split("; ") if part]


def load_tools_py() -> list:
    spec = importlib.util.spec_from_file_location("ab_tools", SRC / "tools.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("tools.py missing")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.T


def snippet(value: str, limit: int = 220) -> str:
    text = re.sub(r"\s+", " ", value or "").strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def evidence_rank(kind: str) -> int:
    return {"verified": 0, "inferred": 1, "guessed": 2}.get(kind, 9)


def match_project(row: dict, match: str) -> str | None:
    if not match or ":" not in match:
        return None
    kind, arg = match.split(":", 1)
    libs = set(split_semi(row["libraries_detected"]))
    if row["library"]:
        libs.add(row["library"])
    tags = set(split_semi(row["verified_tags"]))
    if kind == "L":
        return "inferred" if arg in libs else None
    if kind == "F":
        flags = {
            "g": row["webgl_glsl"] == "Y",
            "i": row["interactive"] == "Y",
            "n": row["network_fetch_in_script"] == "Y",
            "s": row["sound"] == "Y",
            "c": row["webcam_mic_input"] == "Y",
        }
        return "inferred" if flags.get(arg) else None
    if kind == "V":
        mechanics = (
            "Decay on transfer",
            "On-chain state",
            "On-chain audio",
            "ROM in token",
            "Live-event mint",
            "Time-based change",
            "Post-mint params (PMP)",
            "Physical redemption",
            "Quantum raffle",
            "Token as fabrication file",
        )
        if arg == "m":
            if "token mechanics" in tags or any(mech in tags for mech in mechanics):
                return "verified"
            return None
        name = V_TAG.get(arg)
        if name and name in tags:
            return "verified"
        col = V_COL.get(arg, "")
        if not col:
            return None
        raw = row.get(col, "")
        if raw.startswith("contract:"):
            return "inferred"
        if raw == "Y":
            return "inferred"
        if raw:
            return "guessed"
        return None
    return None


def project_tags(row: dict) -> list[dict]:
    tags = set(split_semi(row["verified_tags"]))
    found: list[dict] = []
    seen: set[tuple[str, str]] = set()

    def add(label: str, kind: str, note: str = "") -> None:
        key = (label, kind)
        if not label or key in seen:
            return
        seen.add(key)
        item = {"label": label, "kind": kind}
        if note:
            item["note"] = note
        found.append(item)

    for lib in split_semi(row["libraries_detected"]) or ([row["library"]] if row["library"] else []):
        add(lib, "inferred")
    if row["webgl_glsl"] == "Y":
        add("WebGL/GLSL", "inferred")
    if row["interactive"] == "Y":
        add("Interactive", "inferred")
    if row["webcam_mic_input"] == "Y":
        add("Webcam / mic", "inferred")
    if row["network_fetch_in_script"] == "Y":
        add("Network fetch", "inferred")
    if row["uses_clock_in_script"] == "Y":
        add("Clock", "inferred")
    if row["sound"] == "Y":
        add("Sound (in code)", "inferred")
    if row["ai_ml"] == "Y":
        add("AI/ML (in code)", "inferred")
    for asset in split_semi(row["external_assets"]):
        add(asset, "inferred")
    for col, vname, label in PHYS_COLS:
        raw = row.get(col, "")
        if vname in tags:
            add(label, "verified")
        elif raw.startswith("contract:"):
            add(label, "inferred", snippet(raw))
        elif raw and raw != "Y":
            add(label, "guessed", snippet(raw))
    if "sound" in tags:
        add("Sound", "verified")
    elif row["sound"] == "?":
        add("Sound", "guessed", "Keyword in the project description.")
    if "AI/ML" in tags:
        add("AI/ML", "verified")
    elif row["ai_ml"] == "?":
        add("AI/ML", "guessed", snippet(row["ai_ml_evidence"]) or "Keyword in the project description.")
    if "sensor/live data" in tags:
        add("Sensor / live data", "verified")
    elif row["sensor_data_desc"]:
        add("Sensor / live data", "guessed", snippet(row["sensor_data_desc"]))
    for label in (
        "code/tool",
        "token mechanics",
        "Decay on transfer",
        "On-chain state",
        "On-chain audio",
        "ROM in token",
        "Live-event mint",
        "Time-based change",
        "Post-mint params (PMP)",
        "Physical redemption",
        "Quantum raffle",
        "Token as fabrication file",
    ):
        if label in tags:
            add(label, "verified")
    found.sort(key=lambda item: (evidence_rank(item["kind"]), item["label"]))
    return found


def gotcha_for(steps: list[str]) -> str:
    for step in steps:
        if CAUTION.search(step):
            return step
    return steps[-1] if steps else ""


def parse_abx(text: str) -> dict:
    lines = text.splitlines()
    table: list[dict] = []
    in_table = False
    for line in lines:
        if line.startswith("| Job |"):
            in_table = True
            continue
        if in_table:
            if not line.startswith("|"):
                in_table = False
                continue
            if re.match(r"^\|\s*-+", line):
                continue
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            if len(cells) >= 3:
                table.append({"job": cells[0].replace("**", ""), "artblocks": cells[1], "abx": cells[2]})
    sources: list[dict] = []
    for line in lines:
        m = re.match(r"- ([a-z0-9-]+) = (https://\S+)", line.strip())
        if m:
            sources.append({"id": m.group(1), "url": m.group(2)})
    # ABX doc paths are listed as bare slugs under the ABX key.
    abx_base = "https://docs.abx.io/docs/"
    capture = False
    for line in lines:
        if line.startswith("- ABX:"):
            capture = True
            continue
        if capture:
            if not line.startswith("  - "):
                if line.startswith("## ") or (line.startswith("- ") and not line.startswith("  - ")):
                    break
                continue
            path = line.strip()[2:].strip()
            sources.append({"id": path.split("/")[-1], "url": abx_base + path})
    plugins: list[dict] = []
    uncertainties: list[str] = []
    plugin_lead: list[str] = []
    mode = ""
    buf: list[str] = []
    title = ""
    for line in lines:
        if line.startswith("## How the emergent tools plug in"):
            mode = "plug-lead"
            continue
        if line.startswith("## Uncertainties"):
            if title:
                plugins.append({"title": title, "body": " ".join(buf).strip()})
            mode = "unc"
            title = ""
            buf = []
            continue
        if line.startswith("## ") and mode:
            if mode == "plug" and title:
                plugins.append({"title": title, "body": " ".join(buf).strip()})
            mode = ""
        if mode == "plug-lead":
            if line.startswith("- **"):
                mode = "plug"
            elif line.strip():
                plugin_lead.append(line.strip())
                continue
        if mode == "plug":
            if line.startswith("- **"):
                if title:
                    plugins.append({"title": title, "body": " ".join(buf).strip()})
                title = line.split("**")[1].strip().rstrip(".")
                rest = line.split("**", 2)[-1].lstrip(". ").strip()
                buf = [rest] if rest else []
            elif line.startswith("  - ") or line.startswith("    "):
                buf.append(line.strip().lstrip("- ").strip())
            elif line.strip() and not line.startswith("#"):
                buf.append(line.strip())
        elif mode == "unc" and line.startswith("- "):
            uncertainties.append(line[2:].strip())
    intro = []
    mode = ""
    for line in lines:
        if line.startswith("## What ABX is"):
            mode = "intro"
            continue
        if mode == "intro":
            if line.startswith("## "):
                break
            if line.startswith("- "):
                intro.append(line[2:].strip())
    return {
        "intro": intro,
        "table": table,
        "sources": sources,
        "pluginLead": " ".join(plugin_lead),
        "plugins": plugins,
        "uncertainties": uncertainties,
    }


def main() -> None:
    projects_raw = read_csv("projects.csv")
    artists_raw = read_csv("artists.csv")
    claims_raw = read_csv("verified_claims.csv")
    maturity_raw = read_csv("maturity_map.csv")
    whitespace_raw = read_csv("whitespace_ranked.csv")
    usage_raw = read_csv("usage_stats.csv")
    related_raw = read_csv("related_works.csv")
    related_claims_raw = read_csv("related_work_claims.csv")
    hero = json.loads((SRC / "hero" / "hero_content.json").read_text(encoding="utf-8"))
    catalog = load_tools_py()

    used_artist: set[str] = set()
    artist_slugs: dict[str, str] = {}
    for row in artists_raw:
        artist_slugs[row["artist"]] = artist_slug(row["artist"], used_artist)

    used_project: set[str] = set()
    project_slugs: dict[str, str] = {}
    for row in projects_raw:
        base = slugify(row["project_name"])
        if not base:
            base = "project-" + hashlib.sha1(row["project_key"].encode()).hexdigest()[:8]
        extra = slugify(row["project_id"]) or "id"
        slug = base if base not in used_project else f"{base}-{extra}"
        slug = unique_slug(slug, used_project)
        project_slugs[row["project_key"]] = slug

    projects: list[dict] = []
    by_artist_projects: dict[str, list[dict]] = {row["artist"]: [] for row in artists_raw}
    for row in projects_raw:
        tags = project_tags(row)
        item = {
            "slug": project_slugs[row["project_key"]],
            "key": row["project_key"],
            "name": row["project_name"],
            "artist": row["artist"],
            "artistSlug": artist_slugs.get(row["artist"], ""),
            "apiName": row["artist_name_api"],
            "wallet": row["artist_wallet"],
            "tier": row["tier"],
            "chain": row["chain"],
            "contractLayer": row["contract_layer"],
            "contractName": row["contract_name"],
            "tokenStandard": row["token_standard"] or "ERC-721",
            "minter": row["minter_type"],
            "scriptType": row["script_type_and_version"],
            "library": row["library"],
            "libraries": split_semi(row["libraries_detected"]),
            "invocations": int(row["invocations"] or 0),
            "maxInvocations": int(row["max_invocations"]) if row["max_invocations"] else None,
            "license": row["license"],
            "website": row["website"],
            "artblocks": row["artblocks_link"],
            "date": project_date(row),
            "activated": row["activated_at_et"],
            "mintStart": row["mint_start_et"],
            "firstMint": row["first_token_minted_et"],
            "completed": row["completed_at_et"],
            "legacyActivation": bool(re.search(r"\bV[01]\b", row["contract_layer"])),
            "externalAssets": split_semi(row["external_assets"]),
            "notes": row["notes"],
            "tags": tags,
            "verifiedCount": int(row["verified_claims"] or 0),
        }
        projects.append(item)
        by_artist_projects.setdefault(row["artist"], []).append(item)

    claims: list[dict] = []
    claims_by_artist: dict[str, list[int]] = {row["artist"]: [] for row in artists_raw}
    for i, row in enumerate(claims_raw):
        artist = row["artist_canonical"] or row["artist"]
        item = {
            "id": i,
            "artist": artist,
            "artistSlug": artist_slugs.get(artist, ""),
            "project": row["matched_project"],
            "projectSlug": project_slugs.get(row["project_key"], ""),
            "category": row["tool_category"],
            "tool": row["tool"],
            "tags": split_semi(row["tags"]),
            "url": row["evidence_url"],
            "date": row["date"],
            "confidence": row["confidence"],
            "practice": not row["project_key"],
        }
        claims.append(item)
        if artist in claims_by_artist:
            claims_by_artist[artist].append(i)

    # Collaboration links: same rule as the v0.1 dataset build.
    names = [row["artist"] for row in artists_raw]
    sep = re.compile(r"\s(x|×|\+|&|with|and)\s|,", re.I)
    collabs: dict[str, list[str]] = {name: [] for name in names}

    def norm(value: str) -> str:
        return value.replace("ℏ", "ħ").lower()

    for i, left in enumerate(names):
        if left == "Unknown artist" or len(left) < 3:
            continue
        for right in names:
            if left == right or not sep.search(right):
                continue
            if re.search(r"(^|[\s(])" + re.escape(norm(left)) + r"($|[\s),.])", norm(right)):
                collabs[left].append(artist_slugs[right])

    related: list[dict] = []
    claims_by_work: dict[str, list[dict]] = {}
    for row in related_claims_raw:
        claims_by_work.setdefault(row["work"], []).append(
            {
                "tool": row["tool"],
                "claim": row["claim"],
                "url": row["evidence"] if row["evidence"].startswith("http") else "",
                "source": row["evidence"],
                "confidence": row["confidence"],
                "sourceType": row["source_type"],
                "date": row["date"],
            }
        )
    for row in related_raw:
        related.append(
            {
                "id": slugify(row["work"]) or "related",
                "name": row["work"],
                "maker": row["maker"],
                "makerSlug": artist_slugs.get(row["maker"], ""),
                "cross": [
                    {"name": name.strip(), "slug": artist_slugs.get(name.strip(), "")}
                    for name in row["cross_linked_artists"].split(";")
                    if name.strip()
                ],
                "makerNote": row["maker_note"],
                "kind": row["kind"],
                "description": row["description"],
                "date": row["date"],
                "status": row["status"],
                "category": row["tool_category"],
                "sources": [part.strip() for part in row["sources"].split(";") if part.strip()],
                "onArtBlocks": row["on_art_blocks"],
                "claims": claims_by_work.get(row["work"], []),
            }
        )

    def related_for(name: str) -> list[str]:
        ids = []
        for work in related:
            if work["maker"] == name or any(person["name"] == name for person in work["cross"]):
                ids.append(work["id"])
        return ids

    artists: list[dict] = []
    for row in artists_raw:
        own = by_artist_projects.get(row["artist"], [])
        own_sorted = sorted(own, key=lambda item: item["date"] or "9999")
        sites = []
        seen_sites = set()
        for project in own:
            url = (project["website"] or "").strip()
            if url and url not in seen_sites:
                seen_sites.add(url)
                sites.append(url)
        artists.append(
            {
                "slug": artist_slugs[row["artist"]],
                "name": row["artist"],
                "aliases": row["aliases"],
                "wallets": split_semi(row["artist_wallets"]),
                "count": int(row["num_projects"] or 0),
                "first": row["first_project_date_et"],
                "latest": row["latest_project_date_et"],
                "tiers": split_semi(row["tiers"]),
                "chains": split_semi(row["chains"]),
                "libraries": split_semi(row["libraries"]),
                "verifiedTags": split_semi(row["verified_tags"]),
                "scriptSignals": split_semi(row["script_signals"]),
                "guessed": split_semi(row["unverified_candidates"]),
                "mints": int(row["total_invocations"] or 0),
                "projectSlugs": [project["slug"] for project in own_sorted],
                "claimIds": claims_by_artist.get(row["artist"], []),
                "collabSlugs": collabs.get(row["artist"], []),
                "relatedIds": related_for(row["artist"]),
                "websites": sites,
            }
        )

    # Tool -> projects
    tool_hits: dict[str, list[dict]] = {row[0]: [] for row in catalog}
    for project in projects_raw:
        built = next(item for item in projects if item["key"] == project["project_key"])
        for tool_id, _name, _what, _mm, match, _first, _links in catalog:
            if match.startswith("H:"):
                continue
            kind = match_project(project, match)
            if not kind:
                continue
            tool_hits[tool_id].append(
                {
                    "slug": built["slug"],
                    "name": built["name"],
                    "artist": built["artist"],
                    "artistSlug": built["artistSlug"],
                    "date": built["date"],
                    "mints": built["invocations"],
                    "evidence": kind,
                    "tier": built["tier"],
                    "library": built["library"],
                }
            )

    def sort_hits(hits: list[dict]) -> list[dict]:
        return sorted(hits, key=lambda hit: (evidence_rank(hit["evidence"]), -hit["mints"], hit["date"] or "9999"))

    artist_by_len = sorted(artists, key=lambda item: len(item["name"]), reverse=True)

    def image_artist(text: str) -> str:
        hay = text or ""
        low = hay.lower()
        for artist in artist_by_len:
            name = artist["name"]
            if len(name) < 3:
                continue
            if name in hay or name.lower() in low:
                return artist["slug"]
        return ""

    tools = []
    mm_to_tools: dict[str, list[str]] = {}
    for tool_id, name, what, mm, match, first, links in catalog:
        hero_row = hero.get(tool_id, {})
        image = hero_row.get("image") or {}
        steps = list(hero_row.get("get_started") or [])
        credit = image.get("credit") or ""
        caption = image.get("caption") or ""
        hits = sort_hits(tool_hits.get(tool_id, []))
        counts = {"verified": 0, "inferred": 0, "guessed": 0}
        for hit in hits:
            counts[hit["evidence"]] = counts.get(hit["evidence"], 0) + 1
        learn = hero_row.get("learn_links") or [{"label": label, "url": url} for label, url in links]
        record = {
            "id": tool_id,
            "name": name,
            "plain": PLAIN.get(tool_id, name),
            "what": what,
            "maturityRow": mm,
            "match": match,
            "firstProject": hero_row.get("first_project") or first,
            "intro": hero_row.get("intro") or what,
            "history": hero_row.get("history") or [],
            "steps": steps,
            "starterCost": hero_row.get("starter_cost") or "",
            "humanity": hero_row.get("humanity") or [],
            "care": hero_row.get("care") or "short",
            "links": learn,
            "physical": tool_id in PHYSICAL,
            "sketch": SKETCH.get(tool_id),
            "gotcha": gotcha_for(steps) if tool_id in PHYSICAL else "",
            "image": {
                "url": image.get("url") or "",
                "source": image.get("source_page") or "",
                "caption": caption,
                "credit": credit,
                "license": image.get("license") or "",
                "status": image.get("status") or "placeholder",
                "kind": image.get("kind") or "",
                "checked": image.get("checked_at_ET") or "",
                "artistSlug": image_artist(f"{caption} {credit}"),
            },
            "projects": hits[:24],
            "projectCount": len(hits),
            "evidenceCounts": counts,
        }
        tools.append(record)
        if mm:
            mm_to_tools.setdefault(mm, []).append(tool_id)

    touch_category = {row["touchpoint"]: row["category"] for row in maturity_raw}
    for tool in tools:
        tool["category"] = touch_category.get(tool["maturityRow"], "")
    for tool in tools:
        siblings = [tid for tid in mm_to_tools.get(tool["maturityRow"], []) if tid != tool["id"]]
        tool["relatedIds"] = siblings[:8]
        more = [
            other["id"]
            for other in tools
            if other["id"] != tool["id"]
            and tool["category"]
            and other["category"] == tool["category"]
            and other["maturityRow"] != tool["maturityRow"]
        ]
        tool["categoryIds"] = more[:8]

    maturity = []
    for row in maturity_raw:
        ids = mm_to_tools.get(row["touchpoint"], [])
        maturity.append(
            {
                "name": row["touchpoint"],
                "category": row["category"],
                "tier": row["tier_ours"],
                "tierSrb": row["tier_srb"],
                "disagree": row["tier_disagreement_reason"],
                "call": row["our_call"],
                "abProjects": row["ab_projects"],
                "abTrend": row["ab_count_and_trend"],
                "inAb": row["in_ab_data"],
                "earliest": row["earliest_found"],
                "example1": row["example_1"],
                "example1Url": row["example_1_url"],
                "example2": row["example_2"],
                "example2Url": row["example_2_url"],
                "barrier": row["main_barrier"],
                "source": row["source_type"],
                "exploration": row["exploration"],
                "momentum": row["momentum"],
                "learnMore": row["learn_more"],
                "toolId": ids[0] if ids else "",
            }
        )

    whitespace = []
    for row in whitespace_raw:
        whitespace.append(
            {
                "rank": row["our_rank"],
                "pick": row["pick"],
                "srbRank": row["srb_rank"],
                "confidence": row["srb_confidence"],
                "why": row["why_our_call"],
                "test": row["cheap_test_srb"],
                "data": row["our_data"],
            }
        )

    usage = []
    for row in usage_raw:
        usage.append(
            {
                "category": row["category"],
                "tag": row["tag"],
                "projects": row["projects"],
                "artists": row["artists"],
                "verified": row["projects_verified"],
                "inferred": row["projects_inferred"],
                "guessedOnly": row["projects_guessed_only"],
                "trend": row["trend"],
                "first": row["first_use_date_et"],
                "firstProject": row["first_use_project"],
                "latest": row["latest_use_date_et"],
                "mostlyGuessed": row["mostly_guessed"],
                "notes": row.get("notes", ""),
            }
        )

    notes = (SRC / "abx-notes.md").read_text(encoding="utf-8")
    abx = parse_abx(notes)
    pulled = (SRC / "pulled_at.txt").read_text(encoding="utf-8").strip()

    p5_count = sum(1 for project in projects if project["library"] == "p5.js")
    verified_artists = sum(1 for artist in artists if artist["claimIds"])
    meta = {
        "pulledAt": pulled,
        "pulledLabel": "2026-10-25 19:40 ET",
        "api": "https://data.artblocks.io/v1/graphql",
        "counts": {
            "artists": len(artists),
            "projects": len(projects),
            "claims": len(claims),
            "tools": len(tools),
            "p5": p5_count,
            "verifiedArtists": verified_artists,
            "recipes": len(RECIPES),
        },
        "recipes": RECIPES,
        "paths": MAKE_PATHS,
        "maturity": maturity,
        "whitespace": whitespace,
        "usage": usage,
        "related": related,
        "abx": abx,
        "categories": sorted({row["category"] for row in maturity}),
    }

    explore = {
        "artists": [
            {
                "slug": artist["slug"],
                "name": artist["name"],
                "aliases": artist["aliases"],
                "count": artist["count"],
                "first": artist["first"],
                "latest": artist["latest"],
                "tiers": artist["tiers"],
                "chains": artist["chains"],
                "libraries": artist["libraries"],
                "verified": artist["verifiedTags"],
                "guessed": artist["guessed"],
                "mints": artist["mints"],
                "projects": " ".join(
                    project["name"] for project in projects if project["artistSlug"] == artist["slug"]
                ),
            }
            for artist in artists
        ],
        "projects": [
            {
                "slug": project["slug"],
                "name": project["name"],
                "artist": project["artist"],
                "artistSlug": project["artistSlug"],
                "date": project["date"],
                "tier": project["tier"],
                "chain": project["chain"],
                "library": project["library"],
                "mints": project["invocations"],
                "toolIds": [],
                "verified": [tag["label"] for tag in project["tags"] if tag["kind"] == "verified"],
                "inferred": [tag["label"] for tag in project["tags"] if tag["kind"] == "inferred"],
                "guessed": [tag["label"] for tag in project["tags"] if tag["kind"] == "guessed"],
            }
            for project in projects
        ],
        "tools": [
            {"id": tool["id"], "name": tool["name"], "plain": tool["plain"], "category": tool["category"]}
            for tool in tools
        ],
        "maturity": maturity,
        "whitespace": whitespace,
        "usage": usage,
        "counts": meta["counts"],
        "pulledLabel": meta["pulledLabel"],
    }

    # The explore toolIds loop above is O(projects * tools * hits) and can be slow.
    # It is acceptable at this size, but rebuild it from the hit lists directly.
    tools_for_slug: dict[str, list[str]] = {}
    for tool_id, hits in tool_hits.items():
        for hit in hits:
            tools_for_slug.setdefault(hit["slug"], []).append(tool_id)
    for project in explore["projects"]:
        project["toolIds"] = tools_for_slug.get(project["slug"], [])

    def dump(name: str, payload) -> None:
        (OUT / name).write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    dump("tools.json", tools)
    dump("artists.json", artists)
    dump("projects.json", projects)
    dump("claims.json", claims)
    dump("meta.json", meta)
    dump("explore.json", explore)

    assert len(artists) == 585, len(artists)
    assert len(projects) == 1268, len(projects)
    assert len(claims) == 126, len(claims)
    assert len(tools) == 100, len(tools)
    assert len(RECIPES) == 7
    assert len(MAKE_PATHS) == 7
    assert len(abx["table"]) >= 10, len(abx["table"])
    missing_hero = [tool["id"] for tool in tools if tool["id"] not in hero]
    assert not missing_hero, missing_hero
    print(
        f"artists={len(artists)} projects={len(projects)} claims={len(claims)} tools={len(tools)} p5={p5_count} verifiedArtists={verified_artists} abxRows={len(abx['table'])}"
    )


if __name__ == "__main__":
    main()
