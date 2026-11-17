/**
 * Pixel sprites built from vector drawing code.
 *
 * Each sprite is drawn with the Canvas 2D API at its true pixel size, then
 * "pixelised": soft edges are snapped to hard pixels, alpha is quantised to
 * three levels (clear / translucent / solid) and a 1px outline is added from
 * darker neighbours. The result reads as hand-placed pixel art but stays easy
 * to edit, and every animation frame is a real redraw.
 */

export interface Frame {
  w: number;
  h: number;
  /** premultiplied-free RGB in 0..255, packed as r | g << 8 | b << 16 */
  rgb: Uint32Array;
  /** 0 = empty, 1..255 alpha */
  a: Uint8Array;
  /** 1 = emits its own light (bioluminescence, lamps, lume) */
  glow: Uint8Array;
}

export interface SpriteSpec {
  id: string;
  w: number;
  h: number;
  frames?: number; // animation frames (default 1)
  /** draw one frame. t in [0,1). Origin top-left, units are pixels. */
  draw: (g: CanvasRenderingContext2D, t: number) => void;
  /** colours (hex) that should glow in the dark */
  glow?: string[];
  outline?: boolean; // default true
  /** keep partially transparent pixels translucent (jellies, glass) */
  translucent?: boolean;
  /** which way the art faces: 1 = right, -1 = left */
  facing?: 1 | -1;
}

export interface Sprite {
  id: string;
  w: number;
  h: number;
  frames: Frame[];
  facing: 1 | -1;
}

const hex = (c: string): [number, number, number] => {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function buildSprite(spec: SpriteSpec): Sprite {
  const n = spec.frames ?? 1;
  const pad = spec.outline === false ? 0 : 1;
  const W = spec.w + pad * 2;
  const H = spec.h + pad * 2;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  const glowSet = (spec.glow || []).map(hex);
  const frames: Frame[] = [];
  for (let f = 0; f < n; f++) {
    g.clearRect(0, 0, W, H);
    g.save();
    g.translate(pad, pad);
    spec.draw(g, f / n);
    g.restore();
    const img = g.getImageData(0, 0, W, H).data;
    const rgb = new Uint32Array(W * H);
    const a = new Uint8Array(W * H);
    const glow = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const al = img[i * 4 + 3];
      if (al < 70) continue;
      let r = img[i * 4];
      let gg = img[i * 4 + 1];
      let b = img[i * 4 + 2];
      let alpha = 255;
      if (spec.translucent) {
        alpha = al > 215 ? 255 : al > 120 ? 170 : 110;
      } else if (al < 120) continue;
      // canvas returns un-premultiplied colours; snap glow colours exactly
      for (const [gr, ggg, gb] of glowSet) {
        if (Math.abs(r - gr) + Math.abs(gg - ggg) + Math.abs(b - gb) < 60) {
          r = gr;
          gg = ggg;
          b = gb;
          glow[i] = 1;
          break;
        }
      }
      rgb[i] = r | (gg << 8) | (b << 16);
      a[i] = alpha;
    }
    if (pad) {
      // 1px outline: darker copy of the neighbouring colour
      const add: number[] = [];
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const i = y * W + x;
          if (a[i]) continue;
          let src = -1;
          if (x > 0 && a[i - 1] === 255) src = i - 1;
          else if (x < W - 1 && a[i + 1] === 255) src = i + 1;
          else if (y > 0 && a[i - W] === 255) src = i - W;
          else if (y < H - 1 && a[i + W] === 255) src = i + W;
          if (src >= 0 && !glow[src]) add.push(i, src);
        }
      for (let k = 0; k < add.length; k += 2) {
        const c = rgb[add[k + 1]];
        const r = ((c & 255) * 0.35) | 0;
        const gg = (((c >> 8) & 255) * 0.35) | 0;
        const b = (((c >> 16) & 255) * 0.4) | 0;
        rgb[add[k]] = r | (gg << 8) | (b << 16);
        a[add[k]] = 255;
      }
    }
    frames.push({ w: W, h: H, rgb, a, glow });
  }
  return { id: spec.id, w: W, h: H, frames, facing: spec.facing ?? 1 };
}

// ───────── drawing helpers ─────────
export const TAU = Math.PI * 2;

export function ell(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string, rot = 0) {
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU);
  g.fill();
}

export function poly(g: CanvasRenderingContext2D, pts: number[], color: string) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath();
  g.fill();
}

export function line(g: CanvasRenderingContext2D, pts: number[], color: string, w = 1.2) {
  g.strokeStyle = color;
  g.lineWidth = w;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.stroke();
}

export function curve(g: CanvasRenderingContext2D, pts: number[], color: string, w = 1.2) {
  // quadratic chain through points (smooth tentacles)
  g.strokeStyle = color;
  g.lineWidth = w;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length - 2; i += 2) {
    const mx = (pts[i] + pts[i + 2]) / 2;
    const my = (pts[i + 1] + pts[i + 3]) / 2;
    g.quadraticCurveTo(pts[i], pts[i + 1], mx, my);
  }
  g.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
  g.stroke();
}

export function px(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1) {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

export function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

/** Clip subsequent drawing to an ellipse (for shading inside a body). */
export function clipEll(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, rot = 0) {
  g.beginPath();
  g.ellipse(cx, cy, rx, ry, rot, 0, TAU);
  g.clip();
}
