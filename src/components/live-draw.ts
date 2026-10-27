export type Draw = (ctx: CanvasRenderingContext2D, t: number, parallax: number, w: number, h: number) => void;

/** Original sketches for this site. Not another artist’s work. */
export const liveDrawers: Record<string, Draw> = {
  p5(ctx, t, parallax, w, h) {
    ctx.fillStyle = "#f6f1e8";
    ctx.fillRect(0, 0, w, h);
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    ctx.strokeStyle = "#1c1915";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    const shift = parallax * 18;
    for (let i = 0; i < 42; i++) {
      const x = 24 + rnd() * (w - 48);
      const y = 24 + rnd() * (h - 48);
      const ang = rnd() * Math.PI * 2 + t * 0.35;
      ctx.beginPath();
      ctx.moveTo(x + shift, y);
      ctx.lineTo(x + Math.cos(ang) * 46, y + Math.sin(ang) * 28);
      ctx.stroke();
    }
  },
  three(ctx, t, parallax, w, h) {
    ctx.fillStyle = "#f6f1e8";
    ctx.fillRect(0, 0, w, h);
    const angle = t * 0.6 + parallax * 0.5;
    const boxes = [
      [-1.1, 0.2],
      [-0.2, -0.4],
      [0.7, 0.35],
      [1.3, -0.15],
    ];
    for (const [x, z] of boxes) {
      const rx = x * Math.cos(angle) - z * Math.sin(angle);
      const rz = x * Math.sin(angle) + z * Math.cos(angle);
      const px = w / 2 + rx * 70;
      const py = h * 0.62 + rz * 28;
      const bw = 54;
      const bh = 70 + (1 - rz) * 18;
      ctx.fillStyle = "#1c1915";
      ctx.fillRect(px - bw / 2, py - bh, bw, bh);
      ctx.fillStyle = "#0c3d73";
      ctx.fillRect(px - bw / 2, py - bh - 10, bw, 10);
    }
  },
  glsl(ctx, t, parallax, w, h) {
    const step = 3;
    for (let y = 0; y < h; y += step) {
      const wave = 0.5 + 0.5 * Math.sin(y * 0.045 + t * 1.4 + parallax * 1.2);
      const v = Math.round(232 - wave * 190);
      ctx.fillStyle = `rgb(${v}, ${Math.round(v * 0.96)}, ${Math.round(v * 0.9)})`;
      ctx.fillRect(0, y, w, step);
    }
  },
  plotter(ctx, t, parallax, w, h) {
    ctx.fillStyle = "#f6f1e8";
    ctx.fillRect(0, 0, w, h);
    const pts: [number, number][] = [];
    let seed = 11;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 8; i++) pts.push([36 + i * ((w - 72) / 7), 40 + rnd() * (h - 80)]);
    const travel = (t % (Math.PI * 2)) / (Math.PI * 2);
    const full = travel === 0 && t === 0;
    const segments = full ? pts.length - 1 : Math.max(1, Math.floor(travel * (pts.length - 1)));
    ctx.strokeStyle = "#1c1915";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + parallax * 10, pts[0][1]);
    for (let i = 1; i <= segments; i++) ctx.lineTo(pts[i][0] + parallax * 10, pts[i][1]);
    ctx.stroke();
    const pen = pts[Math.min(segments, pts.length - 1)];
    ctx.fillStyle = "#0c3d73";
    ctx.beginPath();
    ctx.arc(pen[0] + parallax * 10, pen[1], 7, 0, Math.PI * 2);
    ctx.fill();
  },
};
