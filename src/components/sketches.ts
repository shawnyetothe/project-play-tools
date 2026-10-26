const P5 = `function setup() {
  createCanvas(480, 320);
  noLoop();
}
function draw() {
  background(246, 241, 232);
  randomSeed(7);
  stroke(28, 24, 20);
  strokeWeight(2);
  for (let i = 0; i < 40; i++) {
    const x = random(width);
    const y = random(height);
    line(x, y, x + random(-48, 48), y + random(-48, 48));
  }
}`;

const CANVAS = `let seed = 7;
function rnd() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
ctx.fillStyle = "#f6f1e8";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = "#1c1915";
ctx.lineWidth = 2;
for (let i = 0; i < 28; i++) {
  ctx.beginPath();
  ctx.arc(24 + rnd() * 432, 24 + rnd() * 272, 8 + rnd() * 26, 0, Math.PI * 2);
  ctx.stroke();
}`;

const CLOCK = `function frame() {
  const now = new Date();
  ctx.fillStyle = "#f6f1e8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1c1915";
  ctx.font = "22px sans-serif";
  ctx.fillText(now.toLocaleTimeString(), 24, 56);
  const x = (now.getSeconds() / 60) * (canvas.width - 64);
  ctx.fillRect(24 + x, 140, 40, 14);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);`;

const OFFLINE = `ctx.fillStyle = "#f6f1e8";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "#1c1915";
ctx.font = "20px sans-serif";
ctx.fillText("Offline fallback", 24, 56);
ctx.font = "16px sans-serif";
ctx.fillText("This starter does not call the network.", 24, 96);
ctx.fillText("Draw a stand-in when live data is missing.", 24, 124);
for (let i = 0; i < 12; i++) {
  ctx.fillRect(24 + i * 36, 200 - (i % 4) * 18, 20, 40 + (i % 4) * 18);
}`;

const THREE = `const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 480 / 320, 0.1, 100);
camera.position.set(0, 1.2, 4.2);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(480, 320);
renderer.setClearColor(0xf6f1e8);
document.body.appendChild(renderer.domElement);
let seed = 7;
function rnd() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
const group = new THREE.Group();
for (let i = 0; i < 16; i++) {
  const h = 0.3 + rnd() * 1.3;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, h, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x1c1915 })
  );
  mesh.position.set((rnd() - 0.5) * 3.2, h / 2, (rnd() - 0.5) * 1.8);
  group.add(mesh);
}
scene.add(group);
scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(2, 4, 3);
scene.add(light);
(function tick() {
  group.rotation.y += 0.008;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
})();`;

const GLSL = `precision mediump float;
uniform vec2 u_res;
uniform float u_time;
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float wave = 0.5 + 0.5 * sin(uv.x * 10.0 + u_time);
  vec3 color = mix(vec3(0.11, 0.10, 0.08), vec3(0.96, 0.94, 0.91), wave);
  gl_FragColor = vec4(color, 1.0);
}`;

const PLOTTER = `let seed = 11;
function rnd() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
let d = "M 28 200";
let x = 28;
for (let i = 0; i < 18; i++) {
  x += 24;
  const y = Math.round(40 + rnd() * 240);
  d += " L " + x + " " + y;
}
document.body.innerHTML =
  '<svg viewBox="0 0 480 320" width="480" height="320" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="480" height="320" fill="#f6f1e8"/>' +
  '<path d="' + d + '" fill="none" stroke="#1c1915" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
  "</svg>";`;

const SVG = `let seed = 7;
function rnd() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
let d = "M 36 170";
for (let i = 1; i <= 8; i++) {
  d += " L " + (36 + i * 50) + " " + Math.round(40 + rnd() * 230);
}
document.body.innerHTML =
  '<svg viewBox="0 0 480 320" width="480" height="320" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="480" height="320" fill="#f6f1e8"/>' +
  '<path d="' + d + '" fill="none" stroke="#1c1915" stroke-width="3" stroke-linecap="round"/>' +
  "</svg>";`;

const TONE = `function startSound() {
  const synth = new Tone.Synth({ oscillator: { type: "triangle" } }).toDestination();
  const notes = ["C4", "E4", "G4", "A4"];
  let step = 0;
  const loop = new Tone.Loop((time) => {
    synth.triggerAttackRelease(notes[step % notes.length], "8n", time);
    step += 1;
    if (step > 7) Tone.getTransport().stop();
  }, "4n");
  loop.start(0);
  Tone.getTransport().start();
}`;

const WEB_AUDIO = `function startSound() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 196;
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
  osc.stop(ctx.currentTime + 1.5);
}`;

const PAPER = `let seed = 7;
function rnd() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
const path = new paper.Path();
path.strokeColor = "#1c1915";
path.strokeWidth = 3;
for (let i = 0; i < 6; i++) path.add(new paper.Point(40 + i * 80, 36 + rnd() * 240));
path.smooth();
paper.view.draw();`;

const ZDOG = `const illo = new Zdog.Illustration({ element: canvas, zoom: 2, dragRotate: true });
new Zdog.Ellipse({ addTo: illo, diameter: 72, stroke: 10, color: "#1c1915" });
new Zdog.Rect({ addTo: illo, width: 28, height: 28, stroke: 6, color: "#0c3d73", translate: { z: 20 } });
(function tick() {
  illo.rotate.y += 0.02;
  illo.updateRenderGraph();
  requestAnimationFrame(tick);
})();`;

const AFRAME = `<a-scene embedded style="width:100%;height:320px">
  <a-box position="0 1.1 -3" color="#1c1915" rotation="0 18 0"></a-box>
  <a-plane position="0 0 -4" rotation="-90 0 0" width="6" height="6" color="#e7e0d4"></a-plane>
  <a-sky color="#f6f1e8"></a-sky>
</a-scene>`;

const REGL = `const r = createREGL();
const draw = r({
  frag: "precision mediump float; uniform vec4 color; void main(){ gl_FragColor = color; }",
  vert: "precision mediump float; attribute vec2 position; void main(){ gl_Position = vec4(position, 0.0, 1.0); }",
  attributes: { position: [[-0.8, -0.6], [0.8, -0.6], [0, 0.8]] },
  uniforms: { color: [0.11, 0.1, 0.08, 1] },
  count: 3
});
r.frame(() => {
  r.clear({ color: [0.965, 0.945, 0.91, 1], depth: 1 });
  draw();
});`;

const BABYLON = `const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.965, 0.945, 0.91, 1);
new BABYLON.ArcRotateCamera("cam", 0.9, 1.15, 5, BABYLON.Vector3.Zero(), scene);
new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1.2 }, scene);
const mat = new BABYLON.StandardMaterial("mat", scene);
mat.diffuseColor = new BABYLON.Color3(0.11, 0.1, 0.08);
box.material = mat;
engine.runRenderLoop(() => {
  box.rotation.y += 0.01;
  scene.render();
});`;

export const STARTERS: Record<string, string> = {
  p5: P5,
  canvas: CANVAS,
  "canvas-clock": CLOCK,
  "canvas-offline": OFFLINE,
  three: THREE,
  glsl: GLSL,
  svg: SVG,
  plotter: PLOTTER,
  tone: TONE,
  webaudio: WEB_AUDIO,
  paper: PAPER,
  zdog: ZDOG,
  aframe: AFRAME,
  regl: REGL,
  babylon: BABYLON,
};

const STYLE = `html,body{margin:0;background:#f6f1e8;color:#1c1915;font-family:Georgia,serif}
canvas,svg{display:block;max-width:100%;height:auto}
button{font:16px/1.2 sans-serif;margin:12px;padding:10px 14px;background:#1c1915;color:#f6f1e8;border:0;border-radius:4px}
pre{margin:12px;white-space:pre-wrap;color:#6b1d1d}`;

function js(code: string): string {
  return JSON.stringify(code).replace(/</g, "\\u003c");
}

function page(inner: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${STYLE}</style></head><body>
<script>window.onerror=function(m){var p=document.createElement("pre");p.textContent=String(m);document.body.appendChild(p);};</script>
${inner}</body></html>`;
}

function runUser(code: string, before = ""): string {
  return `${before}<script>var userCode=${js(code)};var el=document.createElement("script");el.textContent=userCode;document.body.appendChild(el);</script>`;
}

export function sketchSrcdoc(kind: string, code: string): string {
  if (kind === "p5") {
    return page(
      `<script src="https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js"></script>${runUser(code)}`,
    );
  }
  if (kind === "canvas" || kind === "canvas-clock" || kind === "canvas-offline") {
    return page(
      `<canvas id="c" width="480" height="320"></canvas><script>var canvas=document.getElementById("c");var ctx=canvas.getContext("2d");</script>${runUser(code)}`,
    );
  }
  if (kind === "three") {
    return page(`<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"}}</script>
<script type="module">import * as THREE from "three"; const userCode=${js(code)}; try { new Function("THREE", userCode)(THREE); } catch (err) { const p=document.createElement("pre"); p.textContent=String(err); document.body.appendChild(p);} </script>`);
  }
  if (kind === "glsl") {
    return page(`<canvas id="c" width="480" height="320"></canvas><script>
const frag=${js(code)};
const canvas=document.getElementById("c");
const gl=canvas.getContext("webgl");
if(!gl){document.body.appendChild(document.createTextNode("WebGL is not available."));}
else {
  const vs=gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs,"attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}");
  gl.compileShader(vs);
  const fs=gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, frag);
  gl.compileShader(fs);
  if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)){
    const p=document.createElement("pre"); p.textContent=gl.getShaderInfoLog(fs)||"Shader error"; document.body.appendChild(p);
  } else {
    const prog=gl.createProgram(); gl.attachShader(prog,vs); gl.attachShader(prog,fs); gl.linkProgram(prog); gl.useProgram(prog);
    const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(prog,"p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    const uRes=gl.getUniformLocation(prog,"u_res"); const uTime=gl.getUniformLocation(prog,"u_time");
    const start=performance.now();
    (function frame(t){ gl.viewport(0,0,canvas.width,canvas.height); gl.uniform2f(uRes,canvas.width,canvas.height); gl.uniform1f(uTime,(t-start)/1000); gl.drawArrays(gl.TRIANGLES,0,6); requestAnimationFrame(frame); })(start);
  }
}
</script>`);
  }
  if (kind === "svg" || kind === "plotter") return page(runUser(code));
  if (kind === "tone") {
    return page(`<button id="play" type="button">Start sound</button>
<script src="https://cdn.jsdelivr.net/npm/tone@15.1.22/build/Tone.js"></script>
${runUser(code)}
<script>document.getElementById("play").addEventListener("click",function(){ if (window.startSound) window.startSound(); });</script>`);
  }
  if (kind === "webaudio") {
    return page(`<button id="play" type="button">Start sound</button>${runUser(code)}
<script>document.getElementById("play").addEventListener("click",function(){ if (window.startSound) window.startSound(); });</script>`);
  }
  if (kind === "paper") {
    return page(`<canvas id="c" width="480" height="320"></canvas>
<script src="https://cdn.jsdelivr.net/npm/paper@0.12.17/dist/paper-full.min.js"></script>
<script>paper.setup("c"); const userCode=${js(code)}; try { new Function("paper", userCode)(paper); } catch(err){ const p=document.createElement("pre"); p.textContent=String(err); document.body.appendChild(p);} </script>`);
  }
  if (kind === "zdog") {
    return page(`<canvas id="c" width="480" height="320"></canvas>
<script src="https://cdn.jsdelivr.net/npm/zdog@1.1.3/dist/zdog.dist.min.js"></script>
<script>var canvas=document.getElementById("c");</script>${runUser(code)}`);
  }
  if (kind === "aframe") {
    return page(`<script src="https://cdn.jsdelivr.net/npm/aframe@1.6.0/dist/aframe-master.min.js"></script><div id="stage"></div>
<script>document.getElementById("stage").innerHTML=${js(code)};</script>`);
  }
  if (kind === "regl") {
    return page(`<script src="https://cdn.jsdelivr.net/npm/regl@2.1.1/dist/regl.min.js"></script>${runUser(code)}`);
  }
  if (kind === "babylon") {
    return page(`<canvas id="c" width="480" height="320"></canvas>
<script src="https://cdn.jsdelivr.net/npm/babylonjs@7.29.0/babylon.js"></script>
<script>var canvas=document.getElementById("c");</script>${runUser(code)}`);
  }
  return page(`<p>No preview for this tool.</p>`);
}

export function sketchNeedsSound(kind: string): boolean {
  return kind === "tone" || kind === "webaudio";
}

export function sketchLoops(kind: string): boolean {
  return ["three", "glsl", "canvas-clock", "zdog", "aframe", "regl", "babylon"].includes(kind);
}
