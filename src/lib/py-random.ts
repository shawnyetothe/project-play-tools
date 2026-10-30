const K = [
  0x428a2f98d728ae22n,
  0x7137449123ef65cdn,
  0xb5c0fbcfec4d3b2fn,
  0xe9b5dba58189dbbcn,
  0x3956c25bf348b538n,
  0x59f111f1b605d019n,
  0x923f82a4af194f9bn,
  0xab1c5ed5da6d8118n,
  0xd807aa98a3030242n,
  0x12835b0145706fben,
  0x243185be4ee4b28cn,
  0x550c7dc3d5ffb4e2n,
  0x72be5d74f27b896fn,
  0x80deb1fe3b1696b1n,
  0x9bdc06a725c71235n,
  0xc19bf174cf692694n,
  0xe49b69c19ef14ad2n,
  0xefbe4786384f25e3n,
  0x0fc19dc68b8cd5b5n,
  0x240ca1cc77ac9c65n,
  0x2de92c6f592b0275n,
  0x4a7484aa6ea6e483n,
  0x5cb0a9dcbd41fbd4n,
  0x76f988da831153b5n,
  0x983e5152ee66dfabn,
  0xa831c66d2db43210n,
  0xb00327c898fb213fn,
  0xbf597fc7beef0ee4n,
  0xc6e00bf33da88fc2n,
  0xd5a79147930aa725n,
  0x06ca6351e003826fn,
  0x142929670a0e6e70n,
  0x27b70a8546d22ffcn,
  0x2e1b21385c26c926n,
  0x4d2c6dfc5ac42aedn,
  0x53380d139d95b3dfn,
  0x650a73548baf63den,
  0x766a0abb3c77b2a8n,
  0x81c2c92e47edaee6n,
  0x92722c851482353bn,
  0xa2bfe8a14cf10364n,
  0xa81a664bbc423001n,
  0xc24b8b70d0f89791n,
  0xc76c51a30654be30n,
  0xd192e819d6ef5218n,
  0xd69906245565a910n,
  0xf40e35855771202an,
  0x106aa07032bbd1b8n,
  0x19a4c116b8d2d0c8n,
  0x1e376c085141ab53n,
  0x2748774cdf8eeb99n,
  0x34b0bcb5e19b48a8n,
  0x391c0cb3c5c95a63n,
  0x4ed8aa4ae3418acbn,
  0x5b9cca4f7763e373n,
  0x682e6ff3d6b2b8a3n,
  0x748f82ee5defb2fcn,
  0x78a5636f43172f60n,
  0x84c87814a1f0ab72n,
  0x8cc702081a6439ecn,
  0x90befffa23631e28n,
  0xa4506cebde82bde9n,
  0xbef9a3f7b2c67915n,
  0xc67178f2e372532bn,
  0xca273eceea26619cn,
  0xd186b8c721c0c207n,
  0xeada7dd6cde0eb1en,
  0xf57d4f7fee6ed178n,
  0x06f067aa72176fban,
  0x0a637dc5a2c898a6n,
  0x113f9804bef90daen,
  0x1b710b35131c471bn,
  0x28db77f523047d84n,
  0x32caab7b40c72493n,
  0x3c9ebe0a15c9bebcn,
  0x431d67c49c100d4cn,
  0x4cc5d4becb3e42b6n,
  0x597f299cfc657e2an,
  0x5fcb6fab3ad6faecn,
  0x6c44198c4a475817n
];
const H0 = [
  0x6a09e667f3bcc908n,
  0xbb67ae8584caa73bn,
  0x3c6ef372fe94f82bn,
  0xa54ff53a5f1d36f1n,
  0x510e527fade682d1n,
  0x9b05688c2b3e6c1fn,
  0x1f83d9abfb41bd6bn,
  0x5be0cd19137e2179n
];


const MASK = (1n << 64n) - 1n;

function rotr(x: bigint, n: bigint): bigint {
  return ((x >> n) | (x << (64n - n))) & MASK;
}

function sha512(data: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(data);
  const bitLen = BigInt(bytes.length) * 8n;
  const withOne = bytes.length + 1;
  const zeros = (128 - ((withOne + 16) % 128)) % 128;
  const padded = new Uint8Array(withOne + zeros + 16);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setBigUint64(padded.length - 8, bitLen);
  let h = H0.slice();
  const w = new Array<bigint>(80);
  for (let off = 0; off < padded.length; off += 128) {
    for (let i = 0; i < 16; i++) w[i] = view.getBigUint64(off + i * 8);
    for (let i = 16; i < 80; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const s0 = rotr(w15, 1n) ^ rotr(w15, 8n) ^ (w15 >> 7n);
      const s1 = rotr(w2, 19n) ^ rotr(w2, 61n) ^ (w2 >> 6n);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) & MASK;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 80; i++) {
      const S1 = rotr(e, 14n) ^ rotr(e, 18n) ^ rotr(e, 41n);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + K[i] + w[i]) & MASK;
      const S0 = rotr(a, 28n) ^ rotr(a, 34n) ^ rotr(a, 39n);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) & MASK;
      hh = g;
      g = f;
      f = e;
      e = (d + temp1) & MASK;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) & MASK;
    }
    h = [
      (h[0] + a) & MASK,
      (h[1] + b) & MASK,
      (h[2] + c) & MASK,
      (h[3] + d) & MASK,
      (h[4] + e) & MASK,
      (h[5] + f) & MASK,
      (h[6] + g) & MASK,
      (h[7] + hh) & MASK,
    ];
  }
  const out = new Uint8Array(64);
  const ov = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) ov.setBigUint64(i * 8, h[i]);
  return out;
}

const N = 624;
const M = 397;
const MATRIX_A = 0x9908b0df;
const UPPER = 0x80000000;
const LOWER = 0x7fffffff;

function u32(n: number): number {
  return n >>> 0;
}

export class PyRandom {
  private mt = new Uint32Array(N);
  private index = N;
  private gaussNext: number | null = null;

  constructor(seed: string | number | bigint) {
    if (typeof seed === "string") this.seedString(seed);
    else if (typeof seed === "bigint") this.seedBig(seed < 0n ? -seed : seed);
    else this.seedBig(BigInt(Math.trunc(Math.abs(seed))));
  }

  private seedString(text: string) {
    const bytes = new TextEncoder().encode(text);
    const digest = sha512(bytes);
    const all = new Uint8Array(bytes.length + digest.length);
    all.set(bytes, 0);
    all.set(digest, bytes.length);
    let n = 0n;
    for (let i = 0; i < all.length; i++) n = (n << 8n) | BigInt(all[i]);
    this.seedBig(n);
  }

  private seedBig(n: bigint) {
    this.gaussNext = null;
    if (n === 0n) {
      this.initGenrand(0);
      return;
    }
    const bits = n.toString(2).length;
    const keyused = Math.floor((bits - 1) / 32) + 1;
    const key = new Uint32Array(keyused);
    let x = n;
    for (let i = 0; i < keyused; i++) {
      key[i] = Number(x & 0xffffffffn);
      x >>= 32n;
    }
    this.initByArray(key);
  }

  private initGenrand(s: number) {
    this.mt[0] = u32(s);
    for (let mti = 1; mti < N; mti++) {
      const prev = this.mt[mti - 1];
      this.mt[mti] = u32(Math.imul(1812433253, prev ^ (prev >>> 30)) + mti);
    }
    this.index = N;
  }

  private initByArray(key: Uint32Array) {
    this.initGenrand(19650218);
    const mt = this.mt;
    let i = 1;
    let j = 0;
    const keyLength = key.length;
    for (let k = N > keyLength ? N : keyLength; k; k--) {
      const prev = mt[i - 1];
      mt[i] = u32((mt[i] ^ u32(Math.imul(prev ^ (prev >>> 30), 1664525))) + key[j] + j);
      i++;
      j++;
      if (i >= N) {
        mt[0] = mt[N - 1];
        i = 1;
      }
      if (j >= keyLength) j = 0;
    }
    for (let k = N - 1; k; k--) {
      const prev = mt[i - 1];
      mt[i] = u32((mt[i] ^ u32(Math.imul(prev ^ (prev >>> 30), 1566083941))) - i);
      i++;
      if (i >= N) {
        mt[0] = mt[N - 1];
        i = 1;
      }
    }
    mt[0] = 0x80000000;
    this.index = N;
  }

  private genrandUint32(): number {
    if (this.index >= N) {
      const mt = this.mt;
      const mag01 = [0, MATRIX_A];
      let kk = 0;
      for (; kk < N - M; kk++) {
        const y = (mt[kk] & UPPER) | (mt[kk + 1] & LOWER);
        mt[kk] = u32(mt[kk + M] ^ (y >>> 1) ^ mag01[y & 1]);
      }
      for (; kk < N - 1; kk++) {
        const y = (mt[kk] & UPPER) | (mt[kk + 1] & LOWER);
        mt[kk] = u32(mt[kk + (M - N)] ^ (y >>> 1) ^ mag01[y & 1]);
      }
      const y = (mt[N - 1] & UPPER) | (mt[0] & LOWER);
      mt[N - 1] = u32(mt[M - 1] ^ (y >>> 1) ^ mag01[y & 1]);
      this.index = 0;
    }
    let y = this.mt[this.index++];
    y = u32(y ^ (y >>> 11));
    y = u32(y ^ ((y << 7) & 0x9d2c5680));
    y = u32(y ^ ((y << 15) & 0xefc60000));
    y = u32(y ^ (y >>> 18));
    return y;
  }

  random(): number {
    const a = this.genrandUint32() >>> 5;
    const b = this.genrandUint32() >>> 6;
    return (a * 67108864.0 + b) / 9007199254740992.0;
  }

  getrandbits(k: number): number {
    if (k <= 0) return 0;
    if (k <= 32) return this.genrandUint32() >>> (32 - k);
    throw new Error("getrandbits > 32 is unused");
  }

  private randbelow(n: number): number {
    const k = 32 - Math.clz32(n);
    let r = this.getrandbits(k);
    while (r >= n) r = this.getrandbits(k);
    return r;
  }

  randrange(stop: number): number {
    if (stop <= 0) throw new Error("empty randrange");
    return this.randbelow(stop);
  }

  choice<T>(seq: readonly T[]): T {
    return seq[this.randbelow(seq.length)];
  }

  uniform(a: number, b: number): number {
    return a + (b - a) * this.random();
  }

  gauss(mu = 0, sigma = 1): number {
    let z = this.gaussNext;
    this.gaussNext = null;
    if (z === null) {
      const x2pi = this.random() * Math.PI * 2;
      const g2rad = Math.sqrt(-2.0 * Math.log(1.0 - this.random()));
      z = Math.cos(x2pi) * g2rad;
      this.gaussNext = Math.sin(x2pi) * g2rad;
    }
    return mu + z * sigma;
  }
}

export function pyRound(value: number, ndigits: number): number {
  const factor = 10 ** ndigits;
  const shifted = value * factor;
  const sign = shifted < 0 ? -1 : 1;
  const abs = Math.abs(shifted);
  const base = Math.floor(abs);
  const diff = abs - base;
  let rounded: number;
  if (Math.abs(diff - 0.5) <= 1e-8) rounded = base % 2 === 0 ? base : base + 1;
  else rounded = Math.round(abs);
  return (sign * rounded) / factor;
}
