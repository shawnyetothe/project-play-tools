# Hero lab notes

Rubric, from the research files: wow under 2 seconds, one click or key and no sign-up, 3 inline steps, a URL that encodes the result, one action for sight and sound, shuffle, and one accent with one typeface around the art. Also: the seed is one piece, a first visit is clear, an agent can find a tool from `/llms.txt` and `/tools.json`, and the phone flow works.

The homepage on `main` is unchanged. This branch is `hero-lab`.

## Round 1

Built `/lab/composed` and `/lab/hero-1` through `/lab/hero-5`. Smoke test on the static export: the canvas painted, the three steps were present, a chip wrote `seed` into the URL and changed the pixels, shuffle wrote a new 6-hex seed, the play mark toggled, six lineage steps rendered, the physical credits were text, the footer sitemap was intact, and there were no console errors.

Weak: the phone screenshot showed two navigation rows (jump links and the same words again as dots). The sketch started under that stack, so the play mark was the last thing on the screen.

## Round 2

Removed the duplicate row. On a phone the order is the headline, “Play. Change. Share.”, the sketch, then the chips. The control bar uses one line and smaller padding so Pause fits inside 390px.

Recheck: phone canvas height about 388px with the headline at about 137px, so the sketch and the play mark sit above the fold. Pause’s right edge measured at 355px. The section links ended at 380px. Reduced motion shows “Play motion” and the canvas pixels do not change over 600ms. A requestAnimationFrame loop on the page counted 61 frames in a second.

## Round 3

Lighthouse against a concurrent static server, not Python’s one-request-at-a-time server.

Desktop: performance 98. FCP 0.5s, LCP 1.1s, TTI 1.1s, TBT 0ms, CLS 0. The LCP element is the headline.

Mobile, with Lighthouse’s 4× CPU throttle: performance 83. FCP 2.0s, LCP 4.4s, TTI 5.4s, TBT 20ms, CLS 0. LCP is still the headline. About 4.0s of that is render delay, which is the Atkinson webfont swap under the throttle. First-load JS for the route is 119 kB. Tone.js and three.js are separate chunks, loaded on the play tap and when the 3D card is near.

## Round 4

Tried `font-display: optional` on a second Atkinson instance for the lab, hoping the headline would stop waiting on the swap. Mobile score fell to 77 and LCP rose to 5.5s. Reverted. The lab stays on the site’s Atkinson face.

## Scores for `/lab/composed`

| Rubric | Score |
| --- | --- |
| Wow under 2 seconds | 4 |
| One click or key, no sign-up | 5 |
| Three inline steps, no tour | 5 |
| URL encodes the result | 5 |
| One action, sight and sound | 4 |
| Shuffle / seed variation | 5 |
| One accent, one typeface around the art | 4 |
| One continuous piece | 5 |
| Clear to a first visitor | 4 |
| Agent can find a tool and draft a sketch | 5 |
| Phone flow | 4 |
| Performance | 3 |

Performance stays at 3 because throttled mobile LCP is 4.4s. Desktop LCP is 1.1s and main-thread blocking on mobile is 20ms.
