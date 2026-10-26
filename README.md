# Art Blocks Toolmakers

A private, static guide to digital creative tools. It is built from the public Art Blocks artist record: every artist and project in the dataset, the tools behind the work, and short recipes for getting started.

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

## Suggestions

Every page has a “Suggest a tool, example, or fix” form. It does not save anything here. Copy the text, email it, or open a GitHub issue.

Set the optional addresses in `.env.local` (see `.env.example`):

- `NEXT_PUBLIC_SUGGEST_EMAIL`
- `NEXT_PUBLIC_GITHUB_REPO` as `owner/repo`

Nothing goes live until a person reviews it. Artists are listed from the public Art Blocks record and are not featured beyond that record without consent.

## Logo

The wordmark is text. A designer’s logo can replace these two files:

- `public/logo.svg` — shown beside the name
- `src/app/icon.svg` — the favicon

Do not redraw the Chromie Squiggle. Drop the finished files in place.

## Images

Example images load from their original URLs. Each caption names the artist and the license and links to the source. “No verified image yet” is kept where the dataset has no image. This site does not generate artwork.
