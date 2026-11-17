// Rock walls, shelves and the trench: the shape of the seabed you descend beside.
import type { DepthMap } from '../engine/depth';

interface Feature {
  side: 'left' | 'right' | 'both';
  from: number;
  to: number;
  w: number; // fraction of screen width at full size
  shape: 'slope' | 'shelf' | 'trench';
}

export const FEATURES: Feature[] = [
  { side: 'left', from: 140, to: 1150, w: 0.12, shape: 'slope' },
  { side: 'left', from: 925, to: 975, w: 0.2, shape: 'shelf' }, // glass sponges live here
  { side: 'right', from: 2560, to: 2880, w: 0.24, shape: 'shelf' }, // vent field
  { side: 'left', from: 4330, to: 4520, w: 0.26, shape: 'shelf' }, // abyssal plain: sea pigs, tripod fish
  { side: 'both', from: 6000, to: 11000, w: 0.3, shape: 'trench' },
];

const smooth = (t: number) => t * t * (3 - 2 * t);

export class Walls {
  out = { left: 0, right: 0, r: 64, g: 58, b: 54 };

  width(f: Feature, d: number, docY: number, W: number) {
    if (d < f.from || d > f.to) return 0;
    const u = (d - f.from) / (f.to - f.from);
    const n = Math.sin(docY * 0.013) * 0.6 + Math.sin(docY * 0.031 + 1) * 0.3 + Math.sin(docY * 0.077 + 2) * 0.15;
    let k = 0;
    if (f.shape === 'slope') k = Math.sin(u * Math.PI);
    else if (f.shape === 'shelf') k = u < 0.04 ? 1 : u > 0.75 ? smooth(1 - (u - 0.75) / 0.25) : 1;
    else k = smooth(Math.min(1, u * 1.4));
    const jag = f.shape === 'shelf' && u < 0.04 ? 0 : n * 0.025 * W;
    return Math.max(0, k * f.w * W + jag * k);
  }

  /** Wall extents for one screen row, or null when open water. */
  row(map: DepthMap, docY: number, d: number, W: number, _s: unknown) {
    let L = 0;
    let R = 0;
    for (const f of FEATURES) {
      if (d < f.from || d > f.to) continue;
      const w = this.width(f, d, docY, W);
      if (f.side === 'left' || f.side === 'both') L = Math.max(L, w);
      if (f.side === 'right' || f.side === 'both') R = Math.max(R, f.side === 'both' ? this.width(f, d, docY + 333, W) : w);
    }
    if (L < 0.5 && R < 0.5) return null;
    this.out.left = L | 0;
    this.out.right = R | 0;
    return this.out;
  }
}
