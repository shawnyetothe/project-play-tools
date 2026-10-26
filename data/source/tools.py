# Learn-more catalog. Each tool: id, name, what (our one-line description), mm (maturity-map row name or ""),
# match (dataset matcher: L:<lib>, F:<script flag>, V:<verified/guess code>, H:<hardware code>, "" none),
# first (our suggested first project), links [(label, url)]. All links checked by check_links.py.
AB = "https://docs.artblocks.io/"
ABX = "https://docs.abx.io/docs/"
MDN = "https://developer.mozilla.org/en-US/docs/Web/API/"
W = "https://en.wikipedia.org/wiki/"
T = []
def t(id, name, what, mm, match, first, links): T.append([id, name, what, mm, match, first, links])

# ---- Code & rendering
t("p5", "p5.js", "A beginner-friendly JavaScript library for drawing, animation and interaction in the browser; the most used library on Art Blocks.", "p5.js", "L:p5.js",
  "Draw 100 random lines from one seed; change the seed and see a new output. That is long-form generative art in miniature.",
  [("p5.js tutorials", "https://p5js.org/tutorials/"), ("The Coding Train: p5.js track", "https://thecodingtrain.com/tracks/code-programming-with-p5-js"), ("Art Blocks: building your project (tokenData, PRNG)", AB+"creator-onboarding/artists/1-building-your-project/")])
t("glsl", "WebGL / GLSL shaders", "Programs that run on the graphics card, colouring every pixel in parallel; fast, dense, and a third of Art Blocks projects.", "WebGL / GLSL shaders", "F:g",
  "Write a fragment shader that maps a noise field to a two-colour palette, then feed it a seed.",
  [("The Book of Shaders", "https://thebookofshaders.com/"), ("WebGL Fundamentals", "https://webglfundamentals.org/")])
t("three", "three.js", "The standard JavaScript 3D library: scenes, cameras, lights and meshes in the browser.", "three.js", "L:three.js",
  "Generate a field of boxes whose heights come from a seed; orbit around it.",
  [("three.js manual", "https://threejs.org/manual/"), ("three.js docs", "https://threejs.org/docs/"), ("Discover three.js (book)", "https://discoverthreejs.com/")])
t("vanilla", "Vanilla JS / canvas 2D", "Plain JavaScript drawing on the browser's canvas, with no framework; smaller scripts and full control.", "Vanilla JS / canvas 2D", "L:vanilla JS",
  "Port a small p5 sketch to plain canvas 2D calls; compare file size.",
  [("MDN: Canvas tutorial", MDN+"Canvas_API/Tutorial"), ("Art Blocks: building your project", AB+"creator-onboarding/artists/1-building-your-project/")])
t("canvas2d", "canvas 2D", "The browser's built-in 2D drawing API, used directly or under libraries.", "Vanilla JS / canvas 2D", "L:canvas 2D",
  "Draw a seeded grid of circles with the canvas 2D API only.",
  [("MDN: Canvas tutorial", MDN+"Canvas_API/Tutorial")])
t("svg", "SVG output in script", "Vector output: shapes as paths, which plotters, cutters and embroidery software can read.", "SVG output in script", "L:SVG",
  "Render your sketch as SVG paths and open the file in a plotter or vector tool.",
  [("MDN: SVG from scratch", "https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch"), ("vpype (plotter-ready SVG)", "https://vpype.readthedocs.io/en/latest/")])
t("interactive", "Interactivity (input handlers)", "Works that respond to mouse, touch or keys.", "Interactivity (input handlers)", "F:i",
  "Let a click reseed one layer of the piece while the token hash fixes the rest.",
  [("MDN: Introduction to events", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events")])
t("clock", "Clock / time-driven output", "Works that read the clock and change by hour, day or season.", "Clock / time-driven output", "",
  "Shift the palette with the hour of day; check it at noon and midnight.",
  [("MDN: requestAnimationFrame", MDN+"Window/requestAnimationFrame"), ("Art Blocks: PostParams (timestamps)", AB+"protocol/postparams/")])
t("fetch", "Live network fetch in script", "Scripts that pull live data from the web when they render.", "Live network fetch in script", "F:n",
  "Fetch one public value (for example a block number) and let it nudge a parameter; render a fallback when offline.",
  [("MDN: Using the Fetch API", MDN+"Fetch_API/Using_Fetch")])
t("niche", "Niche libraries", "Smaller libraries (regl, babylon.js, paper.js, zdog, Processing.js) that were tried and mostly dropped.", "Niche libraries (regl, babylon.js, paper.js, zdog, Processing.js)", "",
  "Pick the one that matches your idea's shape (paper.js for vector paths, zdog for flat 3D) and rebuild one sketch.",
  [("regl", "https://github.com/regl-project/regl"), ("paper.js tutorials", "https://paperjs.org/tutorials/"), ("Babylon.js docs", "https://doc.babylonjs.com/"), ("Zdog", "https://zzz.dog/")])
t("regl", "regl", "A functional wrapper for WebGL.", "Niche libraries (regl, babylon.js, paper.js, zdog, Processing.js)", "L:regl", "Draw one full-screen shader quad with regl.", [("regl on GitHub", "https://github.com/regl-project/regl")])
t("paper", "paper.js", "A vector-graphics scripting library built on canvas.", "Niche libraries (regl, babylon.js, paper.js, zdog, Processing.js)", "L:paper.js", "Generate and smooth a seeded path.", [("paper.js tutorials", "https://paperjs.org/tutorials/")])
t("babylon", "babylon.js", "A full 3D engine for the web.", "Niche libraries (regl, babylon.js, paper.js, zdog, Processing.js)", "L:babylon.js", "Build a seeded scene from the playground examples.", [("Babylon.js docs", "https://doc.babylonjs.com/")])
t("zdog", "zdog", "A small pseudo-3D engine for flat, rounded shapes.", "Niche libraries (regl, babylon.js, paper.js, zdog, Processing.js)", "L:zdog", "Model one seeded zdog object and spin it.", [("Zdog", "https://zzz.dog/")])
t("pjs", "Processing.js", "A retired JavaScript port of Processing; learn Processing or p5.js instead.", "Niche libraries (regl, babylon.js, paper.js, zdog, Processing.js)", "L:Processing.js", "Start in p5.js, its successor.", [("Processing tutorials", "https://processing.org/tutorials/"), ("p5.js tutorials", "https://p5js.org/tutorials/")])
t("aframe", "A-Frame", "An HTML-style framework for WebXR scenes.", "VR / AR (WebXR)", "L:A-Frame", "Place a seeded set of shapes in an A-Frame scene and open it in a headset browser.", [("A-Frame docs", "https://aframe.io/docs/"), ("Immersive Web (WebXR)", "https://immersiveweb.dev/")])
t("tonejs", "Tone.js", "A Web Audio framework for synths, sequencing and effects.", "In-browser generative sound (Web Audio, Tone.js)", "L:Tone.js", "Sequence four notes whose pitches come from the seed; start on a click.", [("Tone.js", "https://tonejs.github.io/")])
t("webaudio", "Web Audio", "The browser's native audio API: oscillators, filters and sound graphs.", "In-browser generative sound (Web Audio, Tone.js)", "L:Web Audio", "Make a seeded drone with two oscillators and a filter; start it on a click (autoplay rules).", [("MDN: Using the Web Audio API", MDN+"Web_Audio_API/Using_Web_Audio_API")])
t("twemoji", "twemoji", "An open-source emoji graphics set, used as a dependency by a few projects.", "", "L:twemoji", "Use one emoji glyph as a seeded stamp.", [("twemoji on GitHub", "https://github.com/jdecked/twemoji")])
t("jslegacy", "js-legacy", "Art Blocks' label for early plain-JavaScript projects.", "Vanilla JS / canvas 2D", "L:js-legacy", "Start with plain canvas 2D.", [("MDN: Canvas tutorial", MDN+"Canvas_API/Tutorial"), ("Art Blocks: building your project", AB+"creator-onboarding/artists/1-building-your-project/")])
t("custom", "custom", "A custom or bundled dependency rather than a registered library.", "", "L:custom", "Read how Art Blocks loads dependencies before bundling your own.", [("Art Blocks: the on-chain generator", AB+"protocol/on-chain-generator/"), ("Art Blocks: building your project", AB+"creator-onboarding/artists/1-building-your-project/")])
t("unspec", "(unspecified)", "No library recorded in the Art Blocks API for this project.", "", "L:(unspecified)", "", [("Art Blocks: building your project", AB+"creator-onboarding/artists/1-building-your-project/")])
t("codetool", "Code/tool (verified)", "A research-verified claim about the artist's code or tooling.", "", "V:l", "", [("Art Blocks: building your project", AB+"creator-onboarding/artists/1-building-your-project/")])

# ---- Sound, AI, inputs
t("sound", "In-browser generative sound (Web Audio, Tone.js)", "Sound generated live in the browser from the token's seed.", "In-browser generative sound (Web Audio, Tone.js)", "V:S",
  "Map three traits of a visual piece to pitch, tempo and timbre; start on a click.",
  [("MDN: Using the Web Audio API", MDN+"Web_Audio_API/Using_Web_Audio_API"), ("Tone.js", "https://tonejs.github.io/")])
t("soundcode", "Sound (in code)", "Audio APIs detected in the on-chain script.", "In-browser generative sound (Web Audio, Tone.js)", "F:s", "Add a seeded drone to an existing sketch.", [("MDN: Using the Web Audio API", MDN+"Web_Audio_API/Using_Web_Audio_API"), ("Tone.js", "https://tonejs.github.io/")])
t("ai", "AI models (training, in-browser inference)", "Machine-learning models used to make or run the work, including small models in the browser.", "AI models (training, in-browser inference)", "V:a",
  "Run a pretrained ml5.js model on your own drawing and let its output steer one parameter.",
  [("ml5.js docs", "https://docs.ml5js.org/"), ("The Coding Train: ml5.js beginner's guide", "https://thecodingtrain.com/tracks/ml5js-beginners-guide"), ("TensorFlow.js tutorials", "https://www.tensorflow.org/js/tutorials")])
t("sensor", "Sensor / live data", "Work driven by sensors or live external data.", "Live network fetch in script", "V:d", "Fetch one live value and render a fallback when offline.", [("MDN: Using the Fetch API", MDN+"Fetch_API/Using_Fetch")])
t("mic", "Microphone / audio input", "Works that listen through the viewer's microphone.", "Microphone / audio input", "F:c",
  "Make the line weight follow microphone level; ask for permission on a click.",
  [("MDN: getUserMedia", MDN+"MediaDevices/getUserMedia"), ("p5.sound AudioIn", "https://p5js.org/reference/p5.sound/p5.AudioIn/")])
t("cv", "Cameras / computer vision", "Works that see through a camera, from pixels to pose detection.", "Cameras / computer vision", "",
  "Use the webcam image as a mask for a generative pattern.",
  [("p5.js createCapture", "https://p5js.org/reference/p5/createCapture/"), ("ml5.js docs", "https://docs.ml5js.org/")])
t("bio", "Heart rate / biometric", "Works shaped by body data such as heartbeat.", "Heart rate / biometric", "",
  "Capture heart rate once at mint from a Bluetooth chest strap and use it as a seed (capture once, store nothing else).",
  [("MDN: Web Bluetooth API", MDN+"Web_Bluetooth_API")])
t("eeg", "EEG", "Brain-signal input from consumer EEG headsets.", "EEG", "", "Stream an OpenBCI signal into a sketch and smooth it heavily.", [("OpenBCI docs", "https://docs.openbci.com/")])
t("env", "Environmental sensors (weather, air)", "Air quality, temperature or weather read by a local sensor.", "Environmental sensors (weather, air)", "",
  "Wire a PM2.5 sensor to a microcontroller and let the reading change density in a running token view.",
  [("Adafruit: PM2.5 air quality sensor guide", "https://learn.adafruit.com/pm25-air-quality-sensor"), ("ESP32 get started", "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/")])
t("motion", "Motion / accelerometer", "Phone tilt and motion as input.", "Motion / accelerometer", "", "Tilt the phone to rotate the composition.", [("MDN: Detecting device orientation", MDN+"Device_orientation_events/Detecting_device_orientation")])
t("haptics", "Haptics (vibration output)", "Vibration as output on phones.", "Haptics (vibration output)", "", "Pulse the phone in a seeded rhythm.", [("MDN: Vibration API", MDN+"Vibration_API")])
t("gps", "GPS / location", "Location as input or as a condition to mint.", "GPS / location", "", "Change the palette by city (coarse location only, with consent).", [("MDN: Geolocation API", MDN+"Geolocation_API")])

# ---- Immersive
t("xr", "VR / AR (WebXR)", "Immersive scenes in a headset or phone browser.", "VR / AR (WebXR)", "", "Load a three.js piece in WebXR and walk around it.", [("Immersive Web (WebXR)", "https://immersiveweb.dev/"), ("MDN: WebXR Device API", MDN+"WebXR_Device_API"), ("A-Frame docs", "https://aframe.io/docs/")])
t("mr", "MR headsets (Vision Pro)", "Mixed-reality headsets that blend the work with the room.", "MR headsets (Vision Pro)", "", "Open a WebXR version of your piece in the headset browser before building a native app.", [("Apple visionOS developer", "https://developer.apple.com/visionos/"), ("Immersive Web (WebXR)", "https://immersiveweb.dev/")])
t("glasses", "Smart glasses", "Head-worn displays; no art example found.", "Smart glasses", "", "", [("Wikipedia: Smartglasses", W+"Smartglasses")])
t("spatial", "Spatial / binaural audio", "Sound placed in 3D around the listener.", "Spatial / binaural audio", "", "Pan three seeded voices around the listener with a PannerNode.", [("MDN: Web audio spatialization basics", MDN+"Web_Audio_API/Web_audio_spatialization_basics")])
t("holo", "Holographic / volumetric / stereoscopic", "Displays that show depth without a headset.", "Holographic / volumetric / stereoscopic", "", "Export a three.js scene to a light-field display.", [("Looking Glass docs", "https://docs.lookingglassfactory.com/")])

# ---- Physical: print & drawing
t("plotter", "Pen plotters", "A machine that draws your vector output with real pens.", "Pen plotters", "V:p",
  "Export one SVG from your sketch, optimise it with vpype and plot it on A4.",
  [("AxiDraw docs (Evil Mad Scientist)", "https://wiki.evilmadscientist.com/AxiDraw"), ("AxiDraw Python API", "https://axidraw.com/doc/py_api/"), ("vpype", "https://vpype.readthedocs.io/en/latest/")])
t("prints", "Inkjet / giclée / archival prints", "High-resolution prints of a token's output.", "Inkjet / giclée / archival prints", "V:x",
  "Render your token at print resolution (set pixelDensity, then saveCanvas) and proof it at a local print shop.",
  [("p5.js saveCanvas", "https://p5js.org/reference/p5/saveCanvas/"), ("Wikipedia: Giclée", W+"Gicl%C3%A9e")])
t("screen", "Screen print / silkscreen", "Ink pushed through a mesh stencil, one colour per screen.", "Screen print / silkscreen", "V:k", "Separate your output into 2 colour layers and print a test with a local studio.", [("Wikipedia: Screen printing", W+"Screen_printing")])
t("riso", "Risograph", "A stencil duplicator with spot-colour drums; cheap per sheet.", "Risograph", "V:r", "Export each colour as its own greyscale layer and run 10 different outputs.", [("Stencil wiki (risograph)", "https://stencil.wiki/wiki/Main_Page"), ("Wikipedia: Risograph", W+"Risograph")])
t("darkroom", "Darkroom / film / cyanotype", "Light-sensitive processes such as cyanotype prints from digital negatives.", "Darkroom / film / cyanotype", "", "Print your output as a transparency and make a cyanotype in sunlight.", [("Wikipedia: Cyanotype", W+"Cyanotype")])
# ---- Physical: textile
t("embroid", "Embroidery", "Machine embroidery from stitch files (DST) generated by code.", "Embroidery", "V:e",
  "Turn one SVG output into a stitch file with Ink/Stitch and sew a 10 cm patch.",
  [("Ink/Stitch (install)", "https://inkstitch.org/docs/install/"), ("Ink/Stitch home", "https://inkstitch.org/")])
t("weave", "Weaving / Jacquard / tapestry / cane", "Woven output from a loom file; Jacquard looms control each thread.", "Weaving / Jacquard / tapestry / cane", "V:t", "Quantise your output to 6 colours and a thread grid; ask a weaving studio for a sample quote.", [("Wikipedia: Jacquard machine", W+"Jacquard_machine")])
t("knit", "Machine knitting", "Knitted output from a computer-controlled knitting machine.", "Machine knitting", "", "Make a 2-colour seeded pattern and knit it with AYAB on a supported machine.", [("AYAB (open-source knitting control)", "https://www.ayab-knitting.com/"), ("Wikipedia: Knitting machine", W+"Knitting_machine")])
t("fashion", "Generative fashion / apparel", "Clothing printed or stitched from generative output.", "Generative fashion / apparel", "", "Print one output on a shirt by direct-to-garment printing.", [("Wikipedia: Direct-to-garment printing", W+"Direct-to-garment_printing")])
t("textiles", "Textiles (any)", "Textile output: weaving, knitting, embroidery, rugs.", "Weaving / Jacquard / tapestry / cane", "V:t", "Start with embroidery: cheapest way into textile.", [("Ink/Stitch home", "https://inkstitch.org/"), ("AYAB (open-source knitting control)", "https://www.ayab-knitting.com/")])
# ---- Physical: fabrication
t("laser", "Laser cutting", "Cutting or engraving sheet material from vector paths.", "Laser cutting", "", "Cut one SVG output in 3 mm plywood at a makerspace.", [("Inkscape manual", "https://inkscape-manuals.readthedocs.io/en/latest/"), ("Wikipedia: Laser cutting", W+"Laser_cutting")])
t("cnc", "CNC milling / engraving", "Computer-controlled carving from toolpaths.", "CNC milling / engraving", "", "Engrave a 2D output into wood with a single V-bit pass.", [("Wikipedia: Numerical control", W+"Numerical_control")])
t("fdm", "3D printing: FDM / resin", "Printing a 3D model layer by layer.", "3D printing: FDM / resin", "", "Export a mesh from three.js and print it at 10 cm.", [("Prusa knowledge base", "https://help.prusa3d.com/"), ("OpenSCAD documentation", "https://openscad.org/documentation.html")])
t("ceramic3d", "3D printing: ceramic clay", "Extruding clay with a 3D printer, then firing it.", "3D printing: ceramic clay", "", "Send 3 STL exports to a ceramic-printing studio (SRB's cheap test).", [("Parametric Pottery (Anatoly Zenkov)", "https://anatolyzenkov.com/parametric-pottery/info")])
t("metal", "3D printing: metal / bronze casting", "Metal parts by printing or lost-wax casting from a printed pattern.", "3D printing: metal / bronze casting", "", "Print a small wax or resin pattern and get a foundry quote.", [("Wikipedia: Lost-wax casting", W+"Lost-wax_casting")])
t("ceramics", "Ceramics (hand / kiln)", "Hand-built or thrown ceramics guided by generative designs.", "Ceramics (hand / kiln)", "", "Use one output as a glaze pattern on a test tile.", [("Wikipedia: Pottery", W+"Pottery")])
t("glass", "Glass / stained glass", "Generative designs cut and leaded in glass.", "Glass / stained glass", "", "Generate a 6-colour cell pattern sized for a small panel.", [("Wikipedia: Stained glass", W+"Stained_glass")])
t("sculpt", "Sculpture / lighting objects", "Physical objects and lamps shaped by code.", "Sculpture / lighting objects", "V:u", "Model a parametric lamp shade in OpenSCAD from 3 seeded values.", [("OpenSCAD documentation", "https://openscad.org/documentation.html")])
t("kinetic", "Kinetic sculpture", "Moving physical work driven by motors.", "Kinetic sculpture", "", "Drive one servo from a seeded sequence with an Arduino.", [("Adafruit Arduino lesson 14: servo motors", "https://learn.adafruit.com/adafruit-arduino-lesson-14-servo-motors"), ("Wikipedia: Kinetic art", W+"Kinetic_art")])
t("furniture", "Furniture / architecture", "Furniture or built forms from parametric designs.", "Furniture / architecture", "", "Generate a flat-pack chair profile and laser-cut a 1:5 model.", [("Wikipedia: Parametric design", W+"Parametric_design")])
t("physother", "Physical (other)", "Other physical outputs.", "", "V:o", "", [("Wikipedia: Digital modeling and fabrication", W+"Digital_modeling_and_fabrication")])
# ---- Sensory
t("food", "Food", "Edible output; nothing token-linked found.", "Food", "", "", [("Wikipedia: 3D food printing", W+"3D_food_printing")])
t("scent", "Scent / perfume", "Fragrances composed from a token's parameters.", "Scent / perfume", "", "Map 3 parameters to 3 accords with a perfumer (SRB's cheap test).", [("Wikipedia: Perfume", W+"Perfume")])
t("vinyl", "Vinyl / physical music releases", "Records and sleeves tied to generative work.", "Vinyl / physical music releases", "", "Print unique sleeves from token outputs for a small pressing.", [("Wikipedia: Phonograph record", W+"Phonograph_record")])
# ---- Display & hardware
t("projector", "Projectors / projection mapping", "Projecting work onto walls or objects.", "Projectors / projection mapping", "", "Map a live token view onto a box with MadMapper's trial.", [("MadMapper", "https://madmapper.com/"), ("Wikipedia: Projection mapping", W+"Projection_mapping")])
t("led", "LED walls / pixel screens", "Large LED or addressable-pixel displays.", "LED walls / pixel screens", "", "Drive a 16x16 NeoPixel grid from a seeded pattern.", [("Adafruit NeoPixel Überguide", "https://learn.adafruit.com/adafruit-neopixel-uberguide"), ("FastLED", "https://fastled.io/")])
t("frames", "Dynamic NFT displays (Infinite Objects, Tokenframe)", "Screens and frames that show a token at home.", "Dynamic NFT displays (Infinite Objects, Tokenframe)", "", "Open your token's live view (Art Blocks generator URL) full-screen on a spare tablet for a week.", [("Art Blocks: token and generator APIs", AB+"developer/token-and-generator-apis/"), ("Infinite Objects", "https://infiniteobjects.com/")])
t("eink", "E-ink / e-paper", "Low-power paper-like displays; good for slow, time-based tokens.", "E-ink / e-paper", "", "Render one frame per hour to a colour e-ink panel from an ESP32 (SRB's cheap test).", [("Adafruit eInk display guide", "https://learn.adafruit.com/adafruit-eink-display-breakouts"), ("Waveshare e-paper ESP32 driver board", "https://www.waveshare.com/wiki/E-Paper_ESP32_Driver_Board")])
t("pcb", "Custom PCBs / handheld hardware", "Bespoke circuit boards and handheld objects that run the work.", "Custom PCBs / handheld hardware", "H:P", "Run your sketch on an ESP32 with a small OLED before designing a board in KiCad.", [("KiCad docs", "https://docs.kicad.org/"), ("ESP32 get started", "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/")])
t("button", "Physical button", "A physical button as the interface.", "Custom PCBs / handheld hardware", "H:B", "Wire one button to an Arduino and reseed on press.", [("Adafruit Arduino lesson 6: digital inputs (buttons)", "https://learn.adafruit.com/adafruit-arduino-lesson-6-digital-inputs")])
t("screenhw", "Embedded screen", "A small screen built into the object.", "Custom PCBs / handheld hardware", "H:E", "Draw a seeded pattern on a 128x64 OLED.", [("Adafruit: monochrome OLED breakouts", "https://learn.adafruit.com/monochrome-oled-breakouts")])
t("handheld", "Handheld device", "A handheld object carrying the work.", "Custom PCBs / handheld hardware", "H:H", "Battery-power the ESP32 + OLED build and put it in a printed case.", [("ESP32 get started", "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/"), ("KiCad docs", "https://docs.kicad.org/")])
t("rom", "Game ROMs / cartridges", "Game Boy-style programs stored in the token or on a cartridge.", "Game ROMs / cartridges", "V:4", "Build a seeded Game Boy ROM with GBDK and run it in an emulator.", [("gbdev (Game Boy development)", "https://gbdev.io/"), ("Pan Docs", "https://gbdev.io/pandocs/"), ("GBDK docs", "https://gbdk.org/docs/api/")])
# ---- Linking token to object
t("nfc", "NFC chips", "Tap-to-verify chips that link an object to its token.", "NFC chips", "",
  "Stick a tag on one plot and link the tap to the token page; then try a cryptographic chip platform.",
  [("IYK docs", "https://docs.iyk.app/"), ("IYK phygitals API", "https://docs.iyk.app/api-core/phygitals")])
t("qr", "QR codes", "Printed codes that link to the token; easy, but copyable.", "QR codes", "", "Print a QR code on the back of a plot that opens the token page.", [("Wikipedia: QR code", W+"QR_code")])
t("rfid", "RFID (UHF, non-NFC)", "Long-range tags that phones can't read.", "RFID (UHF, non-NFC)", "", "", [("Wikipedia: Radio-frequency identification", W+"Radio-frequency_identification")])
t("ble", "Bluetooth beacons", "Small radios that announce an object nearby.", "Bluetooth beacons", "", "", [("MDN: Web Bluetooth API", MDN+"Web_Bluetooth_API"), ("Wikipedia: Bluetooth low energy beacon", W+"Bluetooth_low_energy_beacon")])
t("passport", "Physical-backed NFT passports (Arianee, IYK)", "Digital passports that certify a physical object.", "Physical-backed NFT passports (Arianee, IYK)", "", "Issue a test passport for one print on a testnet.", [("Arianee docs", "https://docs.arianee.org/"), ("IYK phygitals API", "https://docs.iyk.app/api-core/phygitals")])
# ---- Performance, data, chain
t("live", "Live performance / live minting", "Mints tied to an event or performance.", "Live performance / live minting", "V:5", "Mint at a small event with a set-price or allowlist minter on a testnet first.", [("Art Blocks: minters for artists", AB+"creator-onboarding/artists/minters/")])
t("robot", "Robotics / robot arms", "Robot arms drawing or performing the work.", "Robotics / robot arms", "", "Send your SVG to a hobby arm or a plotter first; robots later.", [("Wikipedia: Robotic arm", "https://en.wikipedia.org/wiki/Robotic_arm")])
t("oracle", "Oracles / on-chain data feeds", "On-chain data from outside the chain, read by the token.", "Oracles / on-chain data feeds", "V:2", "Read one price feed on a testnet and map it to a colour.", [("Chainlink data feeds", "https://docs.chain.link/data-feeds")])
t("mutable", "Mutable / evolving tokens (PMP, time, transfers)", "Tokens whose output changes after mint: by time, by owner choices, or by transfers.", "Mutable / evolving tokens (PMP, time, transfers)", "V:7",
  "Add one owner-settable parameter (a palette) to a test project and watch it change the render.",
  [("Art Blocks: PostParams", AB+"protocol/postparams/"), ("ABX: parameters", ABX+"protocol/params"), ("Art Blocks: transfer hooks", AB+"protocol/transfer-hooks/")])
t("decay", "Decay on transfer", "A token that changes each time it is transferred.", "Mutable / evolving tokens (PMP, time, transfers)", "V:1", "Count transfers in a transfer hook and fade one layer per transfer (testnet).", [("Art Blocks: transfer hooks", AB+"protocol/transfer-hooks/"), ("ABX: custom mechanics (hooks)", ABX+"using-abx/guides/custom-mechanics")])
t("onstate", "On-chain state", "Output that reads live chain state.", "Oracles / on-chain data feeds", "V:2", "Read one on-chain value in your script and map it to one parameter.", [("Art Blocks: PostParams", AB+"protocol/postparams/"), ("ABX: parameters", ABX+"protocol/params")])
t("onaudio", "On-chain audio", "Audio stored or generated fully on-chain.", "In-browser generative sound (Web Audio, Tone.js)", "V:3", "Generate a sound entirely in script, with no external files.", [("MDN: Using the Web Audio API", MDN+"Web_Audio_API/Using_Web_Audio_API"), ("Art Blocks: on-chain storage", AB+"protocol/on-chain-storage/")])
t("timebased", "Time-based change", "Output that changes on a schedule.", "Clock / time-driven output", "V:6", "Make one element change by season.", [("MDN: requestAnimationFrame", MDN+"Window/requestAnimationFrame"), ("Art Blocks: PostParams", AB+"protocol/postparams/")])
t("pmp", "Post-mint params", "Parameters set after mint by the owner or artist (Art Blocks PostParams).", "Mutable / evolving tokens (PMP, time, transfers)", "V:7", "Add one owner-settable parameter in a test project.", [("Art Blocks: PostParams", AB+"protocol/postparams/"), ("ABX: parameters", ABX+"protocol/params")])
t("redeem", "Physical redemption (token mechanic)", "A token that can be redeemed for a physical object.", "Physical redemption (token mechanic)", "V:8", "Record 'redeemed' as an artist-set parameter on a test token, and pair it with an NFC tag on the object.", [("Art Blocks: PostParams", AB+"protocol/postparams/"), ("ABX: parameters", ABX+"protocol/params"), ("IYK docs", "https://docs.iyk.app/")])
t("quantum", "Quantum hardware", "Using a quantum computer as a source of randomness or input.", "Quantum hardware", "V:9", "Run a tiny circuit on IBM's free tier and use the result as a seed.", [("IBM Quantum Learning", "https://quantum.cloud.ibm.com/learning/en")])
t("fabfile", "Token as fabrication file", "The token outputs a machine file (SVG, DST stitch file, .obj mesh).", "Token as fabrication file", "V:0", "Add a key that downloads the current output as SVG or OBJ.", [("Ink/Stitch home", "https://inkstitch.org/"), ("three.js manual", "https://threejs.org/manual/")])
t("mech", "Token mechanic (any)", "Any verified on-chain mechanic.", "", "V:m", "", [("Art Blocks: PostParams", AB+"protocol/postparams/"), ("Art Blocks: minters for artists", AB+"creator-onboarding/artists/minters/")])
t("onchain", "Fully on-chain assets (ONCHAIN)", "Scripts and assets stored on the blockchain itself.", "Fully on-chain assets (ONCHAIN)", "", "Deploy a small SVG work with on-chain metadata on a testnet.", [("Art Blocks: on-chain storage", AB+"protocol/on-chain-storage/"), ("ABX: onchain storage", ABX+"protocol/onchain-storage")])
t("ipfs", "External media on IPFS / Arweave", "Large assets stored on decentralized storage and referenced by the token.", "External media on IPFS / Arweave", "", "Upload one image to IPFS or Arweave and reference it from a test token.", [("Art Blocks: IPFS and Arweave assets (Engine Flex)", AB+"creator-onboarding/artists/flex-assets/"), ("ABX: storage", ABX+"using-abx/guides/storage"), ("IPFS docs", "https://docs.ipfs.tech/"), ("Arweave docs", "https://docs.arweave.org/developers")])

# ---- New emergent standards (Shawn's call: Emergent)
t("erc8048", "ERC-8048 onchain metadata", "A draft standard for a per-token key/value store kept on-chain: metadata(tokenId, key) and a MetadataSet event.", "ERC-8048 (onchain metadata)", "",
  "On a testnet, store 'physical: issued' and a chip ID under two keys on one token, then read them back.",
  [("ERC-8048 spec", "https://eips.ethereum.org/EIPS/eip-8048"), ("Ethereum Magicians discussion", "https://ethereum-magicians.org/t/erc-8048-onchain-metadata-for-token-registries/25820"), ("Vyper reference implementation", "https://github.com/rafael-abuawad/erc-8048-vyper")])
t("721t", "721T (agent metadata profile)", "The Agent Metadata Profile of ERC-8048: reserved keys for an agent's context, MCP/A2A/web/x402 endpoints and per-chain addresses.", "721T (agent metadata on ERC-8048)", "",
  "Give one test token a 721T context key describing the artwork's 'voice' and a web endpoint that answers as the piece.",
  [("721T on GitHub", "https://github.com/nxt3d/721t"), ("ERC-8048 spec (721T section)", "https://eips.ethereum.org/EIPS/eip-8048"), ("Loopers post (nxt3d)", "https://x.com/nxt3d/status/2101005222197833954")])
t("erc6551", "ERC-6551 token-bound accounts", "Gives an NFT its own smart-contract wallet that can hold assets and act.", "ERC-6551 (token-bound accounts)", "",
  "Create a token-bound account for one test token and send it a second NFT, so the artwork 'owns' something.",
  [("ERC-6551 spec", "https://eips.ethereum.org/EIPS/eip-6551"), ("Tokenbound docs", "https://docs.tokenbound.org/")])
t("erc8004", "ERC-8004 trustless agents", "Draft registries for agent identity, reputation and validation.", "ERC-8004 (agent identity)", "",
  "Read the spec's identity registry section and sketch what an artwork-agent's registration file would say.",
  [("ERC-8004 spec", "https://eips.ethereum.org/EIPS/eip-8004"), ("Ethereum Magicians discussion", "https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098")])
t("erc8217", "ERC-8217 agent NFT identity bindings", "Draft protocol that binds ERC-8004 agents to NFTs in other collections.", "ERC-8217 (agent NFT bindings)", "",
  "Follow the spec's verification flow on paper for one artwork token bound to one agent ID.",
  [("ERC-8217 spec", "https://eips.ethereum.org/EIPS/eip-8217"), ("Ethereum Magicians discussion", "https://ethereum-magicians.org/t/add-erc-8217-agent-nft-identity-bindings/28339")])
t("erc7160", "ERC-7160 multi-metadata", "Lets one ERC-721 token carry several metadata URIs, with one pinned as primary.", "ERC-7160 (multi-metadata)", "",
  "Give a test token two renderings (screen and plot) and let the owner pin which one shows.",
  [("ERC-7160 spec", "https://eips.ethereum.org/EIPS/eip-7160")])
t("abx", "ABX (Art Blocks)", "Art Blocks' free, open-source (MIT) protocol and toolkit for putting digital objects on-chain, with a CLI, an agent skill and an SDK.", "ABX (Art Blocks' open protocol)", "",
  "Deploy one code project to the Base Sepolia testnet with the ABX quickstart, using its dry run first.",
  [("ABX quickstart", ABX+"using-abx/quickstart"), ("ABX: choose a project", ABX+"using-abx/guides/deploy-a-digital-asset"), ("ABX source (GitHub)", "https://github.com/ArtBlocks/abx")])
