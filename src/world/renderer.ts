/**
 * The pixel ocean. A software renderer that writes every pixel of a small
 * canvas each frame, then lets the browser scale it up with hard edges.
 *
 * Light model, per pixel:
 *   - water colour and ambient light come from the depth of that screen row
 *   - sunlit sprites lose red first, then orange and yellow (colour loss)
 *   - below ~300m ambient light is zero: only bioluminescence and the dive light show
 *   - inside the dive light, sprites get their true colours back
 */
import { DepthMap } from '../engine/depth';
import { waterRGB, seeLight, transmission } from '../engine/env';
import { type Sprite, type Frame, buildSprite } from './sprite';
import { ART } from './art';
import { Actors, type Actor } from './actors';
import { Walls } from './walls';

export interface ViewState {
  scrollY: number;
  vh: number;
  vw: number;
  time: number; // seconds
  dt: number;
  focusDepth: number;
  reduced: boolean;
  pointer: { x: number; y: number; active: boolean; touch: boolean };
  torchEnabled: boolean;
}

// 4x4 Bayer matrix for ordered dithering, scaled to -0.5..0.5
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);

export class World {
  canvas: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
  P = 3; // CSS px per art px
  W = 0;
  H = 0;
  img!: ImageData;
  buf!: Uint32Array;
  rowDepth = new Float32Array(0);
  rowR = new Float32Array(0);
  rowG = new Float32Array(0);
  rowB = new Float32Array(0);
  rowAmb = new Float32Array(0);
  rowTint = new Float32Array(0); // packed per row: 3 floats in rowTintR/G/B
  rowTR = new Float32Array(0);
  rowTG = new Float32Array(0);
  rowTB = new Float32Array(0);
  sprites = new Map<string, Sprite>();
  actors: Actors;
  walls: Walls;
  torch = { x: 0, y: 0, tx: 0, ty: 0, power: 0, r: 56 };
  glowList: number[] = [];
  map: DepthMap;
  waterlinePx = 0;
  skyClouds: { x: number; y: number; w: number; s: number }[] = [];

  constructor(canvas: HTMLCanvasElement, map: DepthMap) {
    this.canvas = canvas;
    this.g = canvas.getContext('2d', { alpha: false })!;
    this.map = map;
    for (const spec of ART) this.sprites.set(spec.id, buildSprite(spec));
    this.actors = new Actors(this);
    this.walls = new Walls();
    for (let i = 0; i < 6; i++) this.skyClouds.push({ x: Math.random(), y: 0.15 + Math.random() * 0.5, w: 14 + Math.random() * 26, s: 0.4 + Math.random() * 0.6 });
  }

  resize(vw: number, vh: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const base = vw < 760 ? 2 : 3;
    const devPx = Math.max(2, Math.round(base * dpr));
    this.P = devPx / dpr;
    this.W = Math.ceil(vw / this.P);
    this.H = Math.ceil(vh / this.P);
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.canvas.style.width = `${this.W * this.P}px`;
    this.canvas.style.height = `${this.H * this.P}px`;
    this.img = this.g.createImageData(this.W, this.H);
    this.buf = new Uint32Array(this.img.data.buffer);
    const H = this.H;
    this.rowDepth = new Float32Array(H);
    this.rowR = new Float32Array(H);
    this.rowG = new Float32Array(H);
    this.rowB = new Float32Array(H);
    this.rowAmb = new Float32Array(H);
    this.rowTR = new Float32Array(H);
    this.rowTG = new Float32Array(H);
    this.rowTB = new Float32Array(H);
    this.torch.r = vw < 760 ? 44 : 58;
    this.actors.reset();
  }

  sprite(id: string) {
    return this.sprites.get(id);
  }

  render(s: ViewState) {
    const { W, H, P, buf } = this;
    if (!W || !H) return;
    const map = this.map;
    // ───── per-row environment ─────
    let firstWater = H;
    for (let y = 0; y < H; y++) {
      const docY = s.scrollY + (y + 0.5) * P;
      const d = map.depthAt(docY);
      this.rowDepth[y] = d;
      if (d > 0 && firstWater === H) firstWater = y;
      const [r, g, b] = waterRGB(d);
      this.rowR[y] = r;
      this.rowG[y] = g;
      this.rowB[y] = b;
      const amb = seeLight(d);
      this.rowAmb[y] = amb;
      const [tr, tg, tb] = transmission(d);
      const m = Math.max(tr, tg, tb);
      // colour loss as a hue shift (normalised) so things dim through `amb`, not twice
      this.rowTR[y] = 0.2 + 0.8 * (tr / m);
      this.rowTG[y] = 0.2 + 0.8 * (tg / m);
      this.rowTB[y] = tb / m;
    }
    this.waterlinePx = (map.waterlineY - s.scrollY) / P;

    // ───── torch ─────
    const focusAmb = seeLight(s.focusDepth);
    const want = s.torchEnabled ? Math.max(0, Math.min(1, (0.55 - focusAmb) / 0.4)) : 0;
    this.torch.power += (want - this.torch.power) * Math.min(1, s.dt * 2.5);
    if (s.pointer.active && !s.reduced) {
      this.torch.tx = s.pointer.x / P;
      this.torch.ty = s.pointer.y / P;
    } else {
      const t = this.actors.torchTarget();
      if (t) {
        this.torch.tx = t.x;
        this.torch.ty = t.y;
      } else {
        this.torch.tx = W * (0.62 + Math.sin(s.time * 0.13) * 0.18);
        this.torch.ty = H * (0.48 + Math.sin(s.time * 0.21) * 0.14);
      }
    }
    const ease = s.pointer.active ? 0.35 : Math.min(1, s.dt * 1.6);
    this.torch.x += (this.torch.tx - this.torch.x) * ease;
    this.torch.y += (this.torch.ty - this.torch.y) * ease;

    // ───── lamps carried by machines on screen ─────
    this.lamps.length = 0;
    this.actors.collectLamps(s, this.lamps);

    // ───── background: sky, water, rays, walls ─────
    this.drawBackground(s, firstWater);

    // ───── actors and particles ─────
    this.glowList.length = 0;
    this.actors.update(s);
    this.actors.draw(s);

    // ───── dive light scatter and glow halos ─────
    this.drawTorchScatter();
    this.drawGlow();

    this.g.putImageData(this.img, 0, 0);
  }

  colA = new Float32Array(0);
  colB = new Float32Array(0);
  rayLut = new Float32Array(2048);

  drawBackground(s: ViewState, firstWater: number) {
    const { W, H, buf } = this;
    const t = s.time;
    const wl = this.waterlinePx;
    const rays = !s.reduced;
    // god rays: per-column terms plus a lookup table, instead of trig per pixel
    if (this.colA.length !== W) { this.colA = new Float32Array(W); this.colB = new Float32Array(W); }
    let umin = Infinity;
    let umax = -Infinity;
    const anyRays = rays && this.rowDepth[0] < 90;
    if (anyRays) {
      for (let x = 0; x < W; x++) {
        const a = x * 0.03 + Math.sin(x * 0.007 + t * 0.18) * 1.3 + t * 0.05;
        this.colA[x] = a;
        this.colB[x] = 0.55 + 0.45 * Math.sin(x * 0.013 - t * 0.11);
        if (a < umin) umin = a;
        if (a > umax) umax = a;
      }
      umax += H * 0.012;
      const L = this.rayLut;
      for (let i = 0; i < 2048; i++) {
        const u = umin + ((umax - umin) * i) / 2047;
        const v = Math.sin(u * 1.7) * 0.6 + Math.sin(u * 3.1 + 1.3) * 0.4;
        const c = v > 0 ? v : 0;
        const c2 = c * c;
        L[i] = c2 * c2 * c2;
      }
    }
    const lutK = 2047 / Math.max(1e-6, umax - umin);
    for (let y = 0; y < H; y++) {
      const d = this.rowDepth[y];
      const row = y * W;
      if (y < wl - 0.5) {
        // sky
        const k = Math.max(0, Math.min(1, (wl - y) / Math.max(1, wl)));
        const r0 = 205 - k * 95;
        const g0 = 232 - k * 60;
        const b0 = 238 - k * 10;
        for (let x = 0; x < W; x++) {
          const dth = BAYER[(y & 3) * 4 + (x & 3)] * 7;
          buf[row + x] = pack(r0 + dth, g0 + dth, b0 + dth);
        }
        continue;
      }
      const r = this.rowR[y];
      const g = this.rowG[y];
      const b = this.rowB[y];
      const rayFade = d < 90 && rays ? Math.max(0, 1 - d / 90) : 0;
      const nearSurf = y - wl;
      const walls = this.walls.row(this.map, s.scrollY + (y + 0.5) * this.P, d, this.W, s);
      for (let x = 0; x < W; x++) {
        let rr = r;
        let gg = g;
        let bb = b;
        if (rayFade > 0) {
          const ray = this.rayLut[((this.colA[x] + y * 0.012 - umin) * lutK) | 0] * rayFade * this.colB[x];
          rr += ray * 38;
          gg += ray * 46;
          bb += ray * 40;
          if (nearSurf < 10 && nearSurf >= 0) {
            // caustic net just below the surface
            const c = Math.max(0, Math.sin(x * 0.42 + t * 1.3) * Math.sin(x * 0.17 - t * 0.9 + nearSurf * 0.7) * Math.sin(y * 0.5 + t * 0.8));
            const k = (1 - nearSurf / 10) * c * c * 90;
            rr += k;
            gg += k;
            bb += k * 0.8;
          }
        }
        // rock walls and ledges
        if (walls && (x < walls.left || x >= W - walls.right)) {
          if (this.rowAmb[y] < 0.002 && !this.inLight(x, y)) {
            // rock no light reaches: just a dark silhouette against the water
            buf[row + x] = pack(r * 0.25, g * 0.25, b * 0.3);
            continue;
          }
          const n = hash(x, (y + Math.floor(s.scrollY / this.P)) | 0);
          const edge = x < walls.left ? walls.left - x : x - (W - walls.right) + 1;
          const shade = edge < 2 ? 1.35 : 0.9 + n * 0.25;
          this.litRGB(walls.r * shade, walls.g * shade, walls.b * shade, x, y, 0.1);
          rr = this.lr;
          gg = this.lg;
          bb = this.lb;
        }
        const dth = BAYER[(y & 3) * 4 + (x & 3)] * 6;
        buf[row + x] = pack(rr + dth, gg + dth, bb + dth);
      }
    }
    // surface line, foam, sun and clouds
    if (wl > -4 && wl < H + 4) this.drawSurface(s);
    // sea floor at the very bottom
    this.drawFloor(s);
  }

  drawSurface(s: ViewState) {
    const { W, H, buf } = this;
    const wl = this.waterlinePx;
    const t = s.time;
    // sun
    const sx = W * 0.78;
    const sy = wl * 0.35;
    if (sy > -10) {
      for (let y = Math.max(0, Math.floor(sy - 14)); y < Math.min(H, sy + 14) && y < wl; y++)
        for (let x = Math.floor(sx - 14); x < sx + 14; x++) {
          if (x < 0 || x >= W) continue;
          const dd = Math.hypot(x - sx, y - sy);
          if (dd < 6) buf[y * W + x] = pack(255, 248, 220);
          else if (dd < 14) {
            const k = (1 - (dd - 6) / 8) * 0.5 + BAYER[(y & 3) * 4 + (x & 3)] * 0.4;
            if (k > 0.2) blend(buf, y * W + x, 255, 246, 214, k * 0.6);
          }
        }
    }
    // clouds
    for (const c of this.skyClouds) {
      const cx = ((c.x * W + t * c.s * 1.5) % (W + 60)) - 30;
      const cy = c.y * wl * 0.8;
      for (let k = 0; k < 3; k++) {
        const ox = cx + (k - 1) * c.w * 0.32;
        const oy = cy - (k === 1 ? 3 : 0);
        const rx = c.w * (k === 1 ? 0.4 : 0.3);
        const ry = rx * 0.45;
        for (let y = Math.floor(oy - ry); y <= oy + ry; y++) {
          if (y < 0 || y >= wl - 1) continue;
          for (let x = Math.floor(ox - rx); x <= ox + rx; x++) {
            if (x < 0 || x >= W) continue;
            if (((x - ox) / rx) ** 2 + ((y - oy) / ry) ** 2 <= 1) buf[y * W + x] = y > oy + ry * 0.4 ? pack(222, 232, 238) : pack(250, 252, 252);
          }
        }
      }
    }
    // waves and foam
    for (let x = 0; x < W; x++) {
      const yy = wl + Math.sin(x * 0.12 + t * 1.6) * 1.2 + Math.sin(x * 0.045 - t * 0.9) * 0.8;
      const y0 = Math.round(yy);
      for (let y = y0 - 1; y <= y0 + 1; y++) {
        if (y < 0 || y >= H) continue;
        if (y === y0 - 1) buf[y * W + x] = pack(118, 214, 230);
        else if (y === y0) buf[y * W + x] = (x + Math.floor(t * 8)) % 9 < 3 ? pack(240, 252, 255) : pack(150, 226, 238);
      }
    }
    // the dive boat
    const boat = this.sprites.get('boat');
    if (boat) {
      const bx = Math.round(W * 0.16);
      const by = Math.round(wl - boat.h + 6 + Math.sin(t * 1.4) * 0.8);
      this.blit(boat.frames[0], bx, by, 1, { lit: false, fog: 0 });
    }
  }

  drawFloor(s: ViewState) {
    const floorDoc = this.map.yAt(10935) + s.vh * 0.36;
    const fy = (floorDoc - s.scrollY) / this.P;
    if (fy > this.H) return;
    const { W, H, buf } = this;
    for (let y = Math.max(0, Math.floor(fy)); y < H; y++) {
      for (let x = 0; x < W; x++) {
        const bump = Math.sin(x * 0.07) * 2 + Math.sin(x * 0.19) * 1;
        if (y < fy + bump) continue;
        if (!this.inLight(x, y)) { buf[y * W + x] = pack(3, 4, 6); continue; }
        const n = hash(x, y);
        this.litRGB(54 + n * 16, 48 + n * 12, 40 + n * 10, x, y, 0.05);
        buf[y * W + x] = pack(this.lr, this.lg, this.lb);
      }
    }
  }

  lr = 0;
  lg = 0;
  lb = 0;
  /** Extra lamps this frame (subs, the diving bell): x, y, radius, strength. */
  lamps: number[] = [];

  inLight(x: number, y: number) {
    const T = this.torch;
    if (T.power > 0.01) {
      const dx = x - T.x;
      const dy = y - T.y;
      if (dx * dx + dy * dy < T.r * T.r) return true;
    }
    const L = this.lamps;
    for (let i = 0; i < L.length; i += 4) {
      const dx = x - L[i];
      const dy = y - L[i + 1];
      if (dx * dx + dy * dy < L[i + 2] * L[i + 2]) return true;
    }
    return false;
  }
  /** Light a colour at a screen pixel: colour loss + ambient + dive light. Result in this.lr/lg/lb. */
  litRGB(r: number, g: number, b: number, x: number, y: number, fog: number) {
    const yy = Math.max(0, Math.min(this.H - 1, y | 0));
    const amb = this.rowAmb[yy];
    let lr = r * this.rowTR[yy] * amb;
    let lg = g * this.rowTG[yy] * amb;
    let lb = b * this.rowTB[yy] * amb;
    if (fog > 0) {
      lr += (this.rowR[yy] - lr) * fog;
      lg += (this.rowG[yy] - lg) * fog;
      lb += (this.rowB[yy] - lb) * fog;
    }
    const T = this.torch;
    if (T.power > 0.01) {
      const dx = x - T.x;
      const dy = y - T.y;
      const d2 = dx * dx + dy * dy;
      const R = T.r;
      if (d2 < R * R) {
        const dist = Math.sqrt(d2) / R;
        const k = (dist < 0.55 ? 1 : 1 - (dist - 0.55) / 0.45) * T.power;
        // true colours inside the beam
        lr = Math.max(lr, r * (0.25 + 0.85 * k) * k + lr * (1 - k));
        lg = Math.max(lg, g * (0.25 + 0.85 * k) * k + lg * (1 - k));
        lb = Math.max(lb, b * (0.25 + 0.85 * k) * k + lb * (1 - k));
      }
    }
    const L = this.lamps;
    for (let i = 0; i < L.length; i += 4) {
      const dx = x - L[i];
      const dy = y - L[i + 1];
      const d2 = dx * dx + dy * dy;
      const R = L[i + 2];
      if (d2 < R * R) {
        const k = (1 - Math.sqrt(d2) / R) * L[i + 3];
        lr = Math.max(lr, r * k * 0.95);
        lg = Math.max(lg, g * k * 0.92);
        lb = Math.max(lb, b * k * 0.8);
      }
    }
    this.lr = lr;
    this.lg = lg;
    this.lb = lb;
  }

  /**
   * Draw a sprite frame at art-pixel position (x, y), mirrored if dir < 0.
   * opts.lit: apply the light model; opts.fog: distance haze 0..1; opts.alpha: overall opacity
   */
  blit(f: Frame, x0: number, y0: number, dir: number, opts: { lit?: boolean; fog?: number; alpha?: number; dim?: number } = {}) {
    const { W, H, buf } = this;
    const lit = opts.lit !== false;
    const fog = opts.fog ?? 0;
    const alphaAll = opts.alpha ?? 1;
    const dim = opts.dim ?? 1;
    const xs = Math.round(x0);
    const ys = Math.round(y0);
    if (xs > W || ys > H || xs + f.w < 0 || ys + f.h < 0) return;
    for (let j = 0; j < f.h; j++) {
      const y = ys + j;
      if (y < 0 || y >= H) continue;
      for (let i = 0; i < f.w; i++) {
        const si = j * f.w + (dir < 0 ? f.w - 1 - i : i);
        const a = f.a[si];
        if (!a) continue;
        const x = xs + i;
        if (x < 0 || x >= W) continue;
        const c = f.rgb[si];
        let r = c & 255;
        let g = (c >> 8) & 255;
        let b = (c >> 16) & 255;
        if (f.glow[si]) {
          this.glowList.push(x, y, c);
        } else if (lit) {
          this.litRGB(r * dim, g * dim, b * dim, x, y, fog);
          r = this.lr;
          g = this.lg;
          b = this.lb;
        }
        const al = (a / 255) * alphaAll;
        if (al >= 0.99) buf[y * W + x] = pack(r, g, b);
        else blend(buf, y * W + x, r, g, b, al);
      }
    }
  }

  drawTorchScatter() {
    const T = this.torch;
    if (T.power < 0.02) return;
    const { W, H, buf } = this;
    const R = T.r * 1.15;
    const x0 = Math.max(0, Math.floor(T.x - R));
    const x1 = Math.min(W, Math.ceil(T.x + R));
    const y0 = Math.max(0, Math.floor(T.y - R));
    const y1 = Math.min(H, Math.ceil(T.y + R));
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const dd = Math.hypot(x - T.x, y - T.y) / R;
        if (dd >= 1) continue;
        const k = (1 - dd) * (1 - dd) * 0.16 * T.power + BAYER[(y & 3) * 4 + (x & 3)] * 0.03 * T.power;
        if (k <= 0) continue;
        add(buf, y * W + x, 120 * k, 170 * k, 190 * k);
      }
  }

  drawGlow() {
    const { W, H, buf } = this;
    const L = this.glowList;
    for (let i = 0; i < L.length; i += 3) {
      const x = L[i];
      const y = L[i + 1];
      const c = L[i + 2];
      const r = c & 255;
      const g = (c >> 8) & 255;
      const b = (c >> 16) & 255;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const dd = Math.abs(dx) + Math.abs(dy);
          if (dd === 0) continue;
          const k = dd === 1 ? 0.22 : dd === 2 ? 0.08 : 0.03;
          add(buf, yy * W + xx, r * k, g * k, b * k);
        }
    }
    for (let i = 0; i < L.length; i += 3) buf[L[i + 1] * W + L[i]] = 0xff000000 | L[i + 2];
  }
}

// ───── pixel helpers (ABGR little-endian) ─────
export function pack(r: number, g: number, b: number) {
  r = r < 0 ? 0 : r > 255 ? 255 : r;
  g = g < 0 ? 0 : g > 255 ? 255 : g;
  b = b < 0 ? 0 : b > 255 ? 255 : b;
  return 0xff000000 | (b << 16) | (g << 8) | (r | 0);
}
export function blend(buf: Uint32Array, i: number, r: number, g: number, b: number, a: number) {
  const c = buf[i];
  const r0 = c & 255;
  const g0 = (c >> 8) & 255;
  const b0 = (c >> 16) & 255;
  buf[i] = pack(r0 + (r - r0) * a, g0 + (g - g0) * a, b0 + (b - b0) * a);
}
export function add(buf: Uint32Array, i: number, r: number, g: number, b: number) {
  const c = buf[i];
  buf[i] = pack((c & 255) + r, ((c >> 8) & 255) + g, ((c >> 16) & 255) + b);
}
export function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export type { Actor };
