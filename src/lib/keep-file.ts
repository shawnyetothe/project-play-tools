import { drawSalt, seedUint, type PieceState } from "./seed";
import { flowSvg } from "./seed-draw";

const OFFLINE_DRAW = `
function rng(seed) {
  var s = seed % 2147483646;
  if (s < 1) s = 1;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
function hash2(ix, iy, seed) {
  var h = (seed + ix * 374761393 + iy * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function valueNoise(x, y, seed) {
  var x0 = Math.floor(x), y0 = Math.floor(y);
  var fx = x - x0, fy = y - y0;
  var sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  var a = hash2(x0, y0, seed), b = hash2(x0 + 1, y0, seed);
  var c = hash2(x0, y0 + 1, seed), d = hash2(x0 + 1, y0 + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
function drawSketch(ctx, w, h, piece) {
  var salt = piece.salt, tool = piece.tool, door = piece.door;
  var pointer = { x: 0.5, y: 0.5 };
  var bias = door === "message" ? 0.15 : door === "maker" ? -0.2 : 0;
  var density = door === "medium" ? 1.35 : door === "maker" ? 0.85 : 1;
  ctx.fillStyle = "#f6f1e8";
  ctx.fillRect(0, 0, w, h);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (tool === 1) {
    var hue = salt % 360, step = 4, y;
    for (y = 0; y < h; y += step) {
      var wave = 0.5 + 0.5 * Math.sin(y * 0.02 + pointer.x * 2 + (salt % 20));
      ctx.fillStyle = "hsl(" + hue + " 38% " + (28 + wave * 46) + "%)";
      ctx.fillRect(0, y, w, step);
    }
  } else if (tool === 2) {
    var rand = rng(salt), notes = 6, i;
    ctx.strokeStyle = "#1c1915";
    ctx.lineWidth = 1.25;
    for (i = 0; i < notes; i++) {
      var x = w * (0.16 + (i / notes) * 0.7);
      var amp = 20 + rand() * (h * 0.28);
      ctx.beginPath();
      ctx.moveTo(x, h * 0.62);
      ctx.lineTo(x, h * 0.62 - amp);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, h * 0.62 - amp, 7, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (tool === 3) {
    var pen = rng(salt);
    ctx.strokeStyle = "#1c1915";
    ctx.lineWidth = 1.6;
    var px = w * (0.15 + pen() * 0.1), py = h * (0.2 + pen() * 0.2), n;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (n = 0; n < 18; n++) {
      var ang = valueNoise(n * 0.35, salt, salt) * Math.PI * 2 + bias + pointer.x;
      px += Math.cos(ang) * (w / 14);
      py += Math.sin(ang) * (h / 16) * (0.6 + pointer.y);
      px = Math.max(24, Math.min(w - 24, px));
      py = Math.max(24, Math.min(h - 24, py));
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  } else if (tool === 4) {
    ctx.strokeStyle = "#1c1915";
    ctx.lineWidth = 1.15;
    var lines = Math.round(16 * density), row;
    for (row = 0; row < lines; row++) {
      var y0 = ((row + 0.5) / lines) * h, xx;
      ctx.beginPath();
      for (xx = 16; xx <= w - 16; xx += 8) {
        var noise = valueNoise(xx * 0.01, y0 * 0.01 + row, salt);
        var yy = y0 + (noise - 0.5) * 36 + Math.sin(xx * 0.02 + pointer.x * 3) * (6 + pointer.y * 10);
        if (xx === 16) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
    }
  } else if (tool === 5) {
    var clock = rng(salt);
    var cx = w * 0.5, cy = h * 0.55, radius = Math.min(w, h) * 0.32, k;
    ctx.strokeStyle = "#1c1915";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    for (k = 0; k < 12; k++) {
      var a = (k / 12) * Math.PI * 2 - Math.PI / 2;
      var mark = 8 + clock() * 10;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (radius - mark), cy + Math.sin(a) * (radius - mark));
      ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.stroke();
    }
    var hand = ((12 % 12) / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hand) * radius * 0.72, cy + Math.sin(hand) * radius * 0.72);
    ctx.stroke();
  } else {
    var strokes = rng(salt), count = Math.round(42 * density), s;
    ctx.strokeStyle = "#1c1915";
    ctx.lineWidth = 1.4;
    for (s = 0; s < count; s++) {
      var sx = 28 + strokes() * (w - 56);
      var sy = 28 + strokes() * (h - 56);
      var sang = strokes() * Math.PI + bias + pointer.x * 0.8;
      var len = 18 + strokes() * 54;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(sang) * len, sy + Math.sin(sang) * len * (0.45 + pointer.y * 0.4));
      ctx.stroke();
    }
  }
}
function paint() {
  var canvas = document.getElementById("art");
  var w = Math.max(280, Math.min(canvas.clientWidth || 640, 900));
  var h = Math.round(w * 0.72);
  canvas.width = w;
  canvas.height = h;
  drawSketch(canvas.getContext("2d"), w, h, window.PIECE);
  canvas.dataset.ready = "1";
  canvas.dataset.seed = window.PIECE.seed;
}
paint();
addEventListener("resize", paint);
`;

function pageShell(title: string, body: string, script: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  html, body { margin: 0; background: #f6f1e8; color: #1c1915; }
  body { font: 16px/1.45 ui-sans-serif, system-ui, sans-serif; padding: 16px; }
  h1 { font-size: 22px; font-weight: 650; letter-spacing: -0.02em; margin: 0 0 8px; }
  p { margin: 0 0 12px; }
  canvas, svg { display: block; width: 100%; height: auto; background: #f6f1e8; }
  svg { max-width: 800px; margin-top: 16px; }
  .meta { font: 12px/1.4 ui-monospace, monospace; color: #6b6b73; }
</style>
</head>
<body>
${body}
<script>
${script}
</script>
</body>
</html>
`;
}

export function heroHtml(state: PieceState): string {
  const salt = drawSalt(state.seed, state.door, state.phrase, state.tool);
  const piece = {
    seed: state.seed,
    salt,
    tool: state.tool,
    door: state.door,
  };
  const svg = flowSvg(seedUint(state.seed), state.knobs);
  const body = `<h1>PlayTools</h1>
<p class="meta">seed ${state.seed}. This file draws itself. It does not use the network.</p>
<canvas id="art" aria-label="Sketch for seed ${state.seed}"></canvas>
${svg}`;
  const script = `window.PIECE = ${JSON.stringify(piece)};\n${OFFLINE_DRAW}`;
  return pageShell(`PlayTools ${state.seed}`, body, script);
}

export function rasterHtml(hex: string, orbit: number, spread: number, png: string): string {
  const piece = { seed: hex, orbit, spread, png };
  const body = `<h1>PlayTools</h1>
<p class="meta">seed 0x${hex}. Orbit ${orbit}, spread ${spread}. This file draws itself. It does not use the network.</p>
<canvas id="art" aria-label="Piece 0x${hex}"></canvas>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="PNG of seed 0x${hex}">
  <image href="${png}" width="800" height="800"/>
</svg>`;
  const script = `window.PIECE = ${JSON.stringify(piece)};
function paint() {
  var canvas = document.getElementById("art");
  var size = Math.max(240, Math.min(canvas.clientWidth || 640, 800));
  canvas.width = size;
  canvas.height = size;
  var img = new Image();
  img.onload = function () {
    canvas.getContext("2d").drawImage(img, 0, 0, size, size);
    canvas.dataset.ready = "1";
    canvas.dataset.seed = window.PIECE.seed;
  };
  img.src = window.PIECE.png;
}
paint();
addEventListener("resize", paint);
`;
  return pageShell(`PlayTools 0x${hex}`, body, script);
}

export function downloadHtml(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
