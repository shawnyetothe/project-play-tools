export function fitCanvas(canvas: HTMLCanvasElement, cap = 0) {
  const phone = window.matchMedia("(max-width: 720px)").matches;
  const limit = cap > 0 ? cap : phone ? 1.5 : 2;
  const dpr = Math.min(window.devicePixelRatio || 1, limit);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (w < 2 || h < 2) return null;
  const width = Math.max(1, Math.round(w * dpr));
  const height = Math.max(1, Math.round(h * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}
