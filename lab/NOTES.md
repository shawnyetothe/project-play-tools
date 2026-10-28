# Hero lab notes

Scoring uses the research rubric: wow under 2 seconds, one click or key and no sign-up, 3 inline steps, a URL that encodes the result, one action for sight and sound, shuffle, and restraint (one accent, one typeface around the art).

The homepage on main is untouched. These routes live on `hero-lab`.

## Round 1 — build

- `/lab/composed` is the page. `/lab/hero-1` through `/lab/hero-5` are the ingredients.
- The hero is one canvas. Shuffle re-seeds. Pointer and the hour steer it. Message, Medium, and Maker chips change the drawing and open that door in the finder.
- A `1 / 6` control names the featured tool and moves every 6 seconds unless motion is paused.
- The PlayTools mark is the sound control. The first tap plays a short tone immediately, then loads Tone.js and calls `Tone.start()` on that same gesture. Each note draws a burst. No microphone.
- Three steps sit on a paper panel over the sketch: Play, Change, Share.
- Below the fold: lineage strip (step size, noise scale, grid resolution, particle count, feed/kill, tile rotation), hear / immerse / sense, the existing finder, a plotter SVG of the visitor's field, text-only credits for Nervous System, Tyler Hobbs's shop, and Generative Goods, then the ABX path.
- Seed, door, tool, phrase, and knobs are written to the URL and to `localStorage` key `playtools-seed` after the first gesture. Nothing is posted and nothing is sent to a server.
- three.js loads only after the immerse card is near and the visitor asks. Tone.js loads on the play tap.
- Reduced motion starts on a still frame. Pause is always visible. Canvas DPR is capped at 1.5 on narrow screens. Loops stop when the canvas is offscreen or the tab is hidden.

Measurements for this round are filled in after the build.
