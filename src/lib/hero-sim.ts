/** Plain-canvas swarm. After a drag, points flow along the line and curl at the ends. */

export type Vec = { x: number; y: number };

export const INKS = [
  { color: "#1F3A5F", weight: 0.42 },
  { color: "#8FB8DE", weight: 0.3 },
  { color: "#E4572E", weight: 0.18 },
  { color: "#0B0B0F", weight: 0.1 },
] as const;

export const SIZES = [1.2, 1.6, 2.0, 2.6];

export function hash32(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function unit(seed: number): number {
  let h = seed >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

function mix(base: number, index: number, salt: number): number {
  return unit(Math.imul(base ^ salt, 0x9e3779b9) ^ Math.imul(index + 1, 0x85ebca6b));
}

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  ink: string;
  size: number;
  along: number;
  shell: number;
  normal: number;
  flow: boolean;
};

export function makeSwarm(seed: string, count: number): Particle[] {
  const base = hash32(seed || "play");
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const roll = mix(base, i, 1);
    let ink = INKS[INKS.length - 1].color;
    let acc = 0;
    for (const item of INKS) {
      acc += item.weight;
      if (roll <= acc) {
        ink = item.color;
        break;
      }
    }
    particles.push({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: mix(base, i, 2) * Math.PI * 2,
      speed: 0.02 + mix(base, i, 3) * 0.03,
      ink,
      size: SIZES[Math.floor(mix(base, i, 4) * SIZES.length)],
      along: i / count,
      shell: Math.pow(mix(base, i, 6), 0.55),
      normal: (mix(base, i, 5) - 0.5) * 0.045,
      flow: false,
    });
  }
  return particles;
}

export function shellPoint(particle: Particle, w: number, h: number): Vec {
  const radius = Math.min(w, h) * 0.3;
  const shell = radius * (0.45 + particle.shell * 0.55);
  const x = w / 2 + Math.cos(particle.angle) * shell * 1.25;
  let y = h * 0.42 + Math.sin(particle.angle) * shell * 0.95;
  const horizon = h * 0.8 - 6;
  if (y > horizon) y = h * 0.42 - Math.abs(Math.sin(particle.angle)) * shell * 0.95;
  return { x, y };
}

export function resample(points: Vec[], count = 40): Vec[] {
  if (points.length < 2) return points.slice();
  let total = 0;
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    lengths.push(total);
  }
  if (total < 2) return points.slice();
  const out: Vec[] = [];
  for (let i = 0; i < count; i++) {
    const dist = (i / (count - 1)) * total;
    let index = 1;
    while (index < lengths.length && lengths[index] < dist) index += 1;
    const a = points[index - 1];
    const b = points[Math.min(index, points.length - 1)];
    const span = lengths[index] - lengths[index - 1] || 1;
    const t = (dist - lengths[index - 1]) / span;
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return chaikin(chaikin(out));
}

function chaikin(points: Vec[]): Vec[] {
  if (points.length < 3) return points;
  const out: Vec[] = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    out.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
    out.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
  }
  out.push(points[points.length - 1]);
  return out;
}

export function samplePath(points: Vec[], t: number): { point: Vec; tangent: Vec } {
  if (!points.length) return { point: { x: 0, y: 0 }, tangent: { x: 1, y: 0 } };
  const wrapped = ((t % 1) + 1) % 1;
  const index = wrapped * (points.length - 1);
  const i = Math.min(points.length - 2, Math.floor(index));
  const local = index - i;
  const a = points[i];
  const b = points[i + 1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    point: { x: a.x + dx * local, y: a.y + dy * local },
    tangent: { x: dx / len, y: dy / len },
  };
}

/** Flow along the stroke. Near either end the tangent curls so the swarm loops instead of scattering. */
export function flowTarget(particle: Particle, line: Vec[], h: number): Vec {
  const along = ((particle.along % 1) + 1) % 1;
  const sample = samplePath(line, along);
  let curl = 0;
  if (along < 0.12) curl = ((0.12 - along) / 0.12) * Math.PI * 1.4;
  if (along > 0.88) curl = ((along - 0.88) / 0.12) * Math.PI * 1.4;
  const cos = Math.cos(curl);
  const sin = Math.sin(curl);
  const tx = sample.tangent.x * cos - sample.tangent.y * sin;
  const ty = sample.tangent.x * sin + sample.tangent.y * cos;
  const nx = -sample.tangent.y;
  const ny = sample.tangent.x;
  const gap = h * particle.normal;
  const curlPush = Math.abs(curl) * h * 0.06;
  return {
    x: sample.point.x + nx * gap + tx * curlPush,
    y: sample.point.y + ny * gap + ty * curlPush,
  };
}

export function stepSwarm(particles: Particle[], line: Vec[] | null, w: number, h: number, dt: number, reduced: boolean) {
  for (const particle of particles) {
    if (!reduced && !particle.flow) particle.angle += particle.speed * dt;
    if (particle.flow && line && line.length > 1 && !reduced) particle.along += dt * 0.18;
    const target = particle.flow && line && line.length > 1 ? flowTarget(particle, line, h) : shellPoint(particle, w, h);
    if (reduced) {
      particle.x = target.x;
      particle.y = target.y;
      particle.vx = 0;
      particle.vy = 0;
      continue;
    }
    const k = particle.flow ? 42 : 9;
    const damp = 2 * Math.sqrt(k);
    const ax = (target.x - particle.x) * k - particle.vx * damp;
    const ay = (target.y - particle.y) * k - particle.vy * damp;
    particle.vx += ax * dt;
    particle.vy += ay * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
  }
}

export function assignFlow(particles: Particle[]) {
  particles.forEach((particle, index) => {
    particle.flow = true;
    particle.along = index / particles.length;
  });
}
