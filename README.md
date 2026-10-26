# Play Tools

A private, static guide to digital creative tools. Data comes from the public Art Blocks API: every artist and project in the dataset, the tools behind the work, and short recipes for getting started.

Independent project, not affiliated with Art Blocks.

This is a preview. It is not approved for public release. Pages send `noindex, nofollow`, and `robots.txt` disallows all crawling.

## Run it

```bash
npm install
npm run build
npm run preview
```

Open [http://127.0.0.1:47231](http://127.0.0.1:47231).

For a dev server with reload:

```bash
npm run dev
```

`npm run build` writes a static site to `out/`.

## Where the pages come from

`data/source/` holds the dataset (`projects.csv`, `artists.csv`, `verified_claims.csv`, `maturity_map.csv`, `whitespace_ranked.csv`, `learn_links.csv`, `hero_pages.csv`, `related_works.csv`, `usage_stats.csv`, `hero/hero_content.json`, `hero/images.json`, `tools.py`, `abx-notes.md`).

`python3 scripts/prepare.py` (also the first step of `npm run build`) turns those files into `src/generated/*.json`. The site reads that JSON. Do not hand-edit the generated files.

Play matches a note or a file to one medium in the browser. The first tool in that medium is the one to open, and its sketch starts in the Maker step. A file beats a written note. Drawing tools are suggested only when no specific medium matched. The rules and the ten example messages are in `src/lib/play-match.ts`. Check them with `node --experimental-strip-types scripts/check-play.ts`. Files are not read and not sent.

## Suggestions

Every page has a “Suggest a tool, example, or fix” form. It does not save anything here. Copy the text, email it, or open a GitHub issue.

Set the optional addresses in `.env.local` (see `.env.example`):

- `NEXT_PUBLIC_SUGGEST_EMAIL` — the local preview is set to Shawn Cheng’s address, `shawn.cheng@gmail.com`. Email opens a draft. This site does not store the message.
- `NEXT_PUBLIC_GITHUB_REPO` as `owner/repo`. It is unset. There is no GitHub repository for issues yet, so the form does not invent one.

Nothing goes live until a person reviews it. Artists are listed from the public Art Blocks record and are not featured beyond that record without consent.

## Logo

The header uses the Play Key lockup. Light pages use `public/logo.svg` (PNG fallback `logo.png`). Dark header chrome uses `public/logo-dark.svg` (`logo-dark.png`). The mark animates from `logo-mark-animated.webm`, with `logo-mark-animated.mp4` and `logo-mark-animated-dark.mp4` for Safari, then `logo-mark-animated.apng`. Reduced motion keeps the still lockup. The favicon files and `manifest.webmanifest` are in `public/`. Do not redraw the squiggle.

## Images

Example images on tool pages load from their original URLs. Each caption names the artist and the license and links to the source. Smartglasses and RFID use the lead photographs on the Wikipedia pages the dataset already cited (Wikimedia Commons, CC BY 2.0 and CC BY 4.0). The other sixteen tools with no image file stay on “No verified image yet,” with the source page linked. This site does not generate artwork. The home carousel draws its own sketches and does not use other artists’ work as decoration.
