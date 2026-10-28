# Hero lab lessons

## 1. A second navigation row costs the phone fold

The first composed layout had section links and then the same words again as progress dots. On a 390px screen that stack pushed the sketch down until the play mark was the last visible thing. One row, then a one-line headline, then the canvas, put the art and the play mark above the fold. The chips can sit just under the sketch. Measure the control bar’s right edge against `innerWidth`. A wrapped Pause button is a failed pause control even if the button exists in the DOM.

## 2. Do not add a font to chase LCP

Desktop LCP was 1.1s and the element was the HTML headline, which is what we wanted. Mobile LCP was 4.4s under Lighthouse’s 4× CPU throttle, almost all render delay, because Atkinson uses `font-display: swap` and the swap rewrites the headline. A second Atkinson face with `font-display: optional` made the mobile score worse (77, LCP 5.5s). Keep one face. Python’s `http.server` also lies about LCP because it serves one file at a time. Measure on a server that answers in parallel, and still say which throttle you used.

## 3. Heavy libraries stay out of the first load only if the import is inside the gesture

The composed route’s first load is 119 kB. Tone.js is a separate chunk because `import("tone")` sits inside the play handler. three.js is a separate chunk because the card is `next/dynamic` and it does not mount until the section is near, and it still waits for a click before creating a renderer. A synchronous Web Audio blip in that same click is what makes a sound before the Tone chunk finishes. `Tone.start()` has to stay in the click’s async chain or the browser drops the gesture.

## 4. The agent test needs the rules written down, not implied

`/llms.txt` plus `/tools.json` passed a script that never opened the HTML. The file has to say: seed is 6 hex digits, door is message | medium | maker, the storage key is `playtools-seed`, nothing is sent to a server, and how to choose (lullaby → tonejs, pen → plotter, otherwise word overlap, else p5). Each tool needs name, category, starter path, license notes, and hero-example credit. Leave the image URL out so the credit does not become a hotlink. The script filled the prompt template and checked that “original” and the starter path survived.

## 5. Pixel hashes, not data-URL prefixes, and don’t double the finder anchor

Comparing the first 80 characters of a canvas data URL always matches, because that is the PNG header. A stride over `getImageData` showed the Message chip actually changing the drawing (714326 → 352728). Also, the existing finder uses `id="play"`. Embedding it under the hero made two elements with that id, so “Start making” could hit the wrong one. The embedded finder drops the id.

## What to do differently on the first try

Start the phone layout from the canvas upward, with one skip row. Put Tone and three behind a click from the first commit. Write the seed URL format into `llms.txt` before building the button that copies a prompt. Plan on the webfont being the mobile LCP, and don’t spend a round swapping `font-display` unless the desktop number is also bad.
