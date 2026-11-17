/**
 * Everything that moves in the ocean.
 *
 * Ambient life is generated per "cell" (one viewport of document height) from a
 * seed, so scrolling back shows the same animals. Featured animals are anchored
 * to their story stop and swim in the free space beside it.
 */
import type { World, ViewState } from './renderer';
import { hash, pack, add, blend } from './renderer';
import type { Sprite } from './sprite';
import { FEATURES } from './walls';

export interface Actor {
  id: string; // creature id (field guide)
  sp: Sprite;
  x: number; // art px, screen space
  docY: number; // document y (CSS px) of the actor's centre
  vx: number; // art px / s
  dir: number;
  t: number; // animation phase
  fps: number;
  fog: number;
  bob: number;
  bobAmp: number;
  minX: number;
  maxX: number;
  featured: boolean;
  wrap: boolean;
  kind: 'swim' | 'school' | 'static' | 'line' | 'drift' | 'walk';
  school?: School;
  ox?: number;
  oy?: number;
  flee?: number; // reacts to the dive light: + flees, - is drawn to it
  rope?: boolean;
  cell?: number;
  screenY?: number;
  alpha?: number;
  vy?: number;
}

interface School {
  x: number;
  docY: number;
  vx: number;
  dir: number;
}

interface Species {
  id: string;
  sprite: string;
  from: number;
  to: number;
  per: number; // expected count per viewport-sized cell
  school?: [number, number]; // members min..max
  speed: [number, number];
  fog: number;
  fps: number;
  flee?: number;
  alpha?: number;
}

const AMBIENT: Species[] = [
  { id: 'sardines', sprite: 'sardines', from: 2, to: 60, per: 0.8, school: [14, 24], speed: [10, 16], fog: 0.15, fps: 6, flee: 1 },
  { id: 'moonjelly', sprite: 'moonjelly', from: 2, to: 30, per: 1.1, speed: [1, 2], fog: 0.2, fps: 2.5 },
  { id: 'manta', sprite: 'manta', from: 10, to: 110, per: 0.12, speed: [6, 8], fog: 0.3, fps: 2.2 },
  { id: 'penguin', sprite: 'penguin', from: 60, to: 420, per: 0.12, speed: [18, 26], fog: 0.2, fps: 6 },
  { id: 'redshrimp', sprite: 'redshrimp', from: 200, to: 1000, per: 0.9, speed: [2, 5], fog: 0.15, fps: 4, flee: 1 },
  { id: 'lanternfish', sprite: 'lanternfish', from: 220, to: 1000, per: 0.8, school: [6, 12], speed: [5, 9], fog: 0.1, fps: 5, flee: 1 },
  { id: 'hatchetfish', sprite: 'hatchetfish', from: 220, to: 950, per: 1.2, speed: [2, 4], fog: 0.1, fps: 3, flee: 1 },
  { id: 'vampsquid', sprite: 'vampsquid', from: 600, to: 1200, per: 0.18, speed: [2, 3], fog: 0.1, fps: 3 },
  { id: 'atolla', sprite: 'atolla', from: 1000, to: 4000, per: 0.45, speed: [0.5, 1.2], fog: 0.1, fps: 6 },
  { id: 'angler', sprite: 'angler', from: 1200, to: 4000, per: 0.1, speed: [1, 2], fog: 0.1, fps: 3, flee: -1 },
  { id: 'dumbo', sprite: 'dumbo', from: 1500, to: 7000, per: 0.12, speed: [1, 2], fog: 0.1, fps: 3 },
  { id: 'snailfish', sprite: 'snailfish', from: 6500, to: 8300, per: 0.35, speed: [1.5, 3], fog: 0.1, fps: 3, alpha: 0.95 },
  { id: 'amphipods', sprite: 'amphipods', from: 7000, to: 10935, per: 0.8, school: [8, 16], speed: [2, 4], fog: 0.05, fps: 5, flee: -1 },
];

/** Which sprite (if any) appears beside each story stop. */
const FEATURED: Record<string, { sprite: string; id?: string; kind?: Actor['kind']; speed?: number; fog?: number; fps?: number; count?: number; place?: 'ledge-left' | 'ledge-right' | 'floor' | 'far' }> = {
  turtle: { sprite: 'turtle', speed: 7, fps: 3 },
  'rec-limit': { sprite: 'diver', id: 'diver', speed: 6, fps: 4, count: 2 },
  nitsch: { sprite: 'freediver', id: 'freediver', kind: 'line', fps: 2 },
  redshrimp: { sprite: 'redshrimp', speed: 3, fps: 4, count: 3 },
  nautilus: { sprite: 'nautilus', speed: 3, fps: 3 },
  eiffel: { sprite: 'submarine', id: 'submarine', kind: 'swim', speed: 4, fog: 0.55, place: 'far' },
  gabr: { sprite: 'techdiver', id: 'techdiver', kind: 'line', fps: 1.5 },
  penguin: { sprite: 'penguin', speed: 20, fps: 6, count: 2 },
  hydra8: { sprite: 'satbell', id: 'diver', kind: 'line', fps: 1 },
  lanternfish: { sprite: 'lanternfish', kind: 'school', speed: 6, fps: 5, count: 14 },
  barreleye: { sprite: 'barreleye', speed: 2, fps: 3 },
  squid: { sprite: 'squid', speed: 5, fps: 4 },
  sponge: { sprite: 'sponge', kind: 'static', place: 'ledge-left', count: 3 },
  whale: { sprite: 'whale', speed: 9, fps: 2.5 },
  vent: { sprite: 'vent', kind: 'static', place: 'ledge-right', fps: 3 },
  angler: { sprite: 'angler', speed: 1.5, fps: 3 },
  titanic: { sprite: 'titanic', kind: 'static', place: 'far', fog: 0.45 },
  seapig: { sprite: 'seapig', kind: 'walk', place: 'ledge-left', speed: 1, fps: 2, count: 3 },
  dumbo: { sprite: 'dumbo', speed: 2, fps: 3 },
  snailfish: { sprite: 'snailfish', speed: 2, fps: 3, count: 3 },
  plastic: { sprite: 'plastic', kind: 'drift', fps: 1 },
  five: { sprite: 'trieste', kind: 'static', place: 'floor' },
};

export interface Anchor {
  stop: string;
  centre: number;
  top: number;
  bottom: number;
  side: string;
  depth: number;
}

export class Actors {
  w: World;
  list: Actor[] = [];
  cells = new Map<number, Actor[]>();
  anchors: Anchor[] = [];
  featuredBuilt = false;
  seen = new Map<string, number>();
  onSpotted: (id: string) => void = () => {};

  constructor(w: World) {
    this.w = w;
  }

  reset() {
    this.cells.clear();
    this.list = this.list.filter((a) => a.featured);
    this.featuredBuilt = false;
  }

  setAnchors(a: Anchor[]) {
    this.anchors = a;
    this.list = [];
    this.cells.clear();
    this.featuredBuilt = false;
  }

  private make(spId: string, id: string, extra: Partial<Actor>): Actor | null {
    const sp = this.w.sprite(spId);
    if (!sp) return null;
    return {
      id, sp, x: 0, docY: 0, vx: 0, dir: 1, t: Math.random(), fps: 3, fog: 0.15, bob: Math.random() * 6, bobAmp: 2,
      minX: -sp.w, maxX: this.w.W + sp.w, featured: false, wrap: true, kind: 'swim', ...extra,
    };
  }

  private buildFeatured(s: ViewState) {
    const W = this.w.W;
    const phone = s.vw < 760;
    for (const an of this.anchors) {
      const f = FEATURED[an.stop];
      if (!f) continue;
      const n = f.count ?? 1;
      for (let k = 0; k < n; k++) {
        const sp = this.w.sprite(f.sprite);
        if (!sp) continue;
        // free side of the screen next to the card
        let minX = -sp.w * 0.2;
        let maxX = W - sp.w * 0.8;
        let docY = an.centre;
        if (!phone && an.side === 'left') minX = W * 0.52;
        else if (!phone && an.side === 'right') maxX = W * 0.48 - sp.w;
        else docY = an.top - (sp.h * this.w.P) / 2 - 24 - k * 18; // above the card
        if (phone) docY = an.top - (sp.h * this.w.P) / 2 - 16 - k * 14;
        const a = this.make(f.sprite, f.id ?? an.stop, {
          featured: true,
          kind: f.kind ?? 'swim',
          fps: f.fps ?? 3,
          fog: f.fog ?? 0.05,
          vx: (f.speed ?? 3) * (k % 2 ? -1 : 1),
          dir: k % 2 ? -1 : 1,
          minX,
          maxX,
          wrap: false,
          docY: docY + (k - (n - 1) / 2) * 28,
          bobAmp: 3,
        });
        if (!a) continue;
        a.x = minX + (maxX - minX) * (n > 1 ? (k + 0.5) / n : 0.35);
        if (f.kind === 'school') {
          a.school = { x: (minX + maxX) / 2, docY, vx: f.speed ?? 6, dir: 1 };
          a.ox = (hash(k, 7) - 0.5) * 40;
          a.oy = (hash(k, 11) - 0.5) * 70;
          a.flee = 1;
          // share one school object
          const lead = this.list.find((o) => o.school && o.id === a.id && o.featured);
          if (lead) a.school = lead.school;
        }
        if (f.kind === 'line') {
          a.rope = true;
          a.x = an.side === 'left' ? W * 0.72 : an.side === 'right' ? W * 0.24 : W * 0.82;
          if (phone) a.x = W * 0.78;
          a.docY = an.centre;
        }
        if (f.place === 'far') {
          a.fog = f.fog ?? 0.5;
          if (f.sprite === 'titanic') {
            a.x = an.side === 'right' ? W * 0.03 : W * 0.5;
            if (phone) a.x = W * 0.5 - sp.w / 2;
            a.docY = an.centre + 40;
          }
        }
        if (f.place === 'ledge-left' || f.place === 'ledge-right') this.placeOnLedge(a, f.place, an, k, s);
        if (f.place === 'floor') this.placeFloor(s);
        this.list.push(a);
      }
    }
    this.featuredBuilt = true;
  }

  /** Sit benthic animals on top of the matching shelf. */
  private placeOnLedge(a: Actor, place: string, an: Anchor, k: number, s: ViewState) {
    const W = this.w.W;
    const side = place === 'ledge-left' ? 'left' : 'right';
    const shelf = FEATURES.find((f) => f.shape === 'shelf' && f.side === side && an.depth >= f.from - 400 && an.depth <= f.to + 400);
    if (!shelf) return;
    const topDoc = this.w.map.yAt(shelf.from);
    const width = shelf.w * W;
    a.docY = topDoc - (a.sp.h * this.w.P) / 2 + this.w.P;
    a.minX = side === 'left' ? 0 : W - width;
    a.maxX = side === 'left' ? width - a.sp.w : W - a.sp.w;
    a.x = side === 'left' ? width * (0.18 + k * 0.28) : W - width * (0.75 - k * 0.2);
    if (a.kind === 'walk') a.vx = (k % 2 ? -1 : 1) * 1.2;
  }

  /** The three subs that reached the bottom, resting on the floor around the finale. */
  private placeFloor(s: ViewState) {
    const W = this.w.W;
    const floor = this.w.map.yAt(10935) + s.vh * 0.36;
    const P = this.w.P;
    const subs: [string, number, string][] = [['trieste', 0.12, 'trieste'], ['challenger', 0.5, 'challenger'], ['limitingfactor', 0.8, 'limitingfactor']];
    for (const [sp, fx, id] of subs) {
      const a = this.make(sp, id, { featured: true, kind: 'static', fog: 0.05, wrap: false });
      if (!a) continue;
      a.x = W * fx - a.sp.w / 2;
      a.docY = floor - (a.sp.h * P) / 2 + 2 * P;
      this.list.push(a);
    }
    const bag = this.make('plastic', 'plastic', { featured: true, kind: 'drift', fps: 1, wrap: false });
    if (bag) {
      bag.x = W * 0.66;
      bag.docY = floor - 60;
      this.list.push(bag);
    }
  }

  private populateCell(c: number, s: ViewState) {
    const out: Actor[] = [];
    const vh = s.vh;
    const mid = (c + 0.5) * vh;
    const d = this.w.map.depthAt(mid);
    if (d <= 1) return out;
    const W = this.w.W;
    AMBIENT.forEach((sp, si) => {
      if (d < sp.from || d > sp.to) return;
      const r = hash(c * 31 + si, 1234);
      const n = Math.floor(sp.per + r); // per=0.9 → 0 or 1, per=1.2 → 1 or 2
      for (let k = 0; k < n; k++) {
        const seed = c * 977 + si * 131 + k * 17;
        const sx = hash(seed, 1) * W;
        const sy = c * vh + hash(seed, 2) * vh;
        const dir = hash(seed, 3) < 0.5 ? -1 : 1;
        const speed = sp.speed[0] + (sp.speed[1] - sp.speed[0]) * hash(seed, 4);
        if (sp.school) {
          const m = Math.floor(sp.school[0] + (sp.school[1] - sp.school[0]) * hash(seed, 5));
          const school: School = { x: sx, docY: sy, vx: speed * dir, dir };
          for (let j = 0; j < m; j++) {
            const a = this.make(sp.sprite, sp.id, { kind: 'school', school, fps: sp.fps, fog: sp.fog, flee: sp.flee, cell: c, alpha: sp.alpha });
            if (!a) continue;
            a.ox = (hash(seed + j, 6) - 0.5) * (sp.id === 'amphipods' ? 30 : 46);
            a.oy = (hash(seed + j, 7) - 0.5) * (sp.id === 'amphipods' ? 40 : 60);
            a.t = hash(seed + j, 8);
            out.push(a);
          }
        } else {
          const a = this.make(sp.sprite, sp.id, { vx: speed * dir, dir, fps: sp.fps, fog: sp.fog, flee: sp.flee, cell: c, alpha: sp.alpha });
          if (!a) continue;
          a.x = sx;
          a.docY = sy;
          out.push(a);
        }
      }
    });
    return out;
  }

  update(s: ViewState) {
    if (!this.featuredBuilt && this.anchors.length) this.buildFeatured(s);
    const vh = s.vh;
    // keep cells for the viewport ±1 screen
    const c0 = Math.floor((s.scrollY - vh) / vh);
    const c1 = Math.floor((s.scrollY + 2 * vh) / vh);
    for (const [c, arr] of this.cells) if (c < c0 || c > c1) { this.cells.delete(c); this.list = this.list.filter((a) => !arr.includes(a)); }
    for (let c = c0; c <= c1; c++) if (!this.cells.has(c)) { const arr = this.populateCell(c, s); this.cells.set(c, arr); this.list.push(...arr); }

    const dt = s.reduced ? 0 : Math.min(0.05, s.dt);
    const W = this.w.W;
    const P = this.w.P;
    const T = this.w.torch;
    const schools = new Set<School>();
    for (const a of this.list) {
      a.t = (a.t + dt * a.fps / Math.max(1, a.sp.frames.length)) % 1;
      a.bob += dt;
      if (a.kind === 'school' && a.school) schools.add(a.school);
    }
    for (const sc of schools) {
      sc.x += sc.vx * dt;
      if (sc.x > W + 40) sc.x = -40;
      if (sc.x < -40) sc.x = W + 40;
    }
    for (const a of this.list) {
      const sy = (a.docY - s.scrollY) / P;
      if (a.kind === 'school' && a.school) {
        const tx = a.school.x + (a.ox ?? 0) + Math.sin(a.bob * 1.3 + (a.oy ?? 0)) * 2;
        let ty = (a.school.docY - s.scrollY) / P + (a.oy ?? 0) * 0.5 + Math.sin(a.bob * 0.9 + (a.ox ?? 0)) * 2;
        // scatter from (or gather toward) the dive light
        if (a.flee && T.power > 0.2) {
          const dx = a.x - T.x;
          const dy = sy - T.y;
          const d = Math.hypot(dx, dy);
          if (d < T.r * 0.9 && d > 0.1) {
            a.ox = (a.ox ?? 0) + (dx / d) * 40 * dt * a.flee;
            a.oy = (a.oy ?? 0) + (dy / d) * 60 * dt * a.flee;
          }
        }
        a.ox = (a.ox ?? 0) * (1 - 0.05 * dt);
        a.x += (tx - a.x) * Math.min(1, dt * 3);
        a.docY += ((ty - sy) * P) * Math.min(1, dt * 3);
        a.dir = a.school.dir = a.school.vx >= 0 ? 1 : -1;
        continue;
      }
      if (a.kind === 'static' || a.kind === 'line') continue;
      if (a.kind === 'drift') {
        a.x += Math.sin(a.bob * 0.3) * 0.6 * dt;
        continue;
      }
      // single swimmers
      if (a.flee && T.power > 0.3) {
        const dx = a.x + a.sp.w / 2 - T.x;
        const dy = sy - T.y;
        const d = Math.hypot(dx, dy);
        if (d < T.r) {
          if (a.flee > 0) a.vx += Math.sign(dx || 1) * 30 * dt;
          else a.vx += -Math.sign(dx || 1) * 6 * dt; // anglers creep toward the light
        }
        a.vx *= 1 - 0.6 * dt;
        const base = 3;
        if (Math.abs(a.vx) < base) a.vx = Math.sign(a.vx || a.dir) * base;
      }
      a.x += a.vx * dt;
      if (a.vx !== 0) a.dir = a.vx > 0 ? 1 : -1;
      if (a.wrap) {
        if (a.x > W + a.sp.w) a.x = -a.sp.w;
        if (a.x < -a.sp.w * 2) a.x = W;
      } else {
        if (a.x > a.maxX) { a.x = a.maxX; a.vx = -Math.abs(a.vx); }
        if (a.x < a.minX) { a.x = a.minX; a.vx = Math.abs(a.vx); }
      }
    }
    this.trackSpotted(s);
  }

  private trackSpotted(s: ViewState) {
    const P = this.w.P;
    const H = this.w.H;
    for (const a of this.list) {
      const sy = (a.docY - s.scrollY) / P;
      if (sy < H * 0.08 || sy > H * 0.92 || a.x + a.sp.w < 0 || a.x > this.w.W) continue;
      // in the dark, only count what is lit or glows
      const v = (this.seen.get(a.id) || 0) + s.dt;
      this.seen.set(a.id, v);
      if (v > 0.8 && v - s.dt <= 0.8) this.onSpotted(a.id);
    }
  }

  /** Subs, the diving bell and tech divers light up the water around them. */
  collectLamps(s: ViewState, out: number[]) {
    const P = this.w.P;
    const H = this.w.H;
    const LAMPS: Record<string, [number, number, number, number]> = {
      // sprite id: [x offset (fraction of width), y offset (fraction of height), radius px, strength]
      trieste: [0.5, 1.05, 34, 0.55],
      challenger: [0.5, 0.82, 30, 0.6],
      limitingfactor: [0.45, 0.85, 40, 0.7],
      satbell: [0.5, 1.0, 26, 0.5],
      techdiver: [0.45, 0.05, 18, 0.35],
    };
    for (const a of this.list) {
      const l = LAMPS[a.sp.id];
      if (!l) continue;
      const cy = (a.docY - s.scrollY) / P;
      if (cy < -60 || cy > H + 60) continue;
      out.push(a.x + a.sp.w * l[0], cy - a.sp.h / 2 + a.sp.h * l[1], l[2], l[3]);
    }
  }

  /** Where the dive light drifts when nobody is pointing it. */
  torchTarget() {
    const P = this.w.P;
    const H = this.w.H;
    let best: { x: number; y: number } | null = null;
    let bestD = Infinity;
    for (const a of this.list) {
      if (!a.featured) continue;
      const sy = (a.docY - (window.scrollY || 0)) / P;
      if (sy < H * 0.1 || sy > H * 0.9) continue;
      const d = Math.abs(sy - H / 2);
      if (d < bestD) {
        bestD = d;
        best = { x: a.x + a.sp.w / 2, y: sy };
      }
    }
    return best;
  }

  draw(s: ViewState) {
    const P = this.w.P;
    const H = this.w.H;
    const W = this.w.W;
    this.drawParticles(s);
    // far first, then by size (small in front looks odd for big animals)
    const order = this.list.slice().sort((a, b) => b.fog - a.fog || b.sp.w - a.sp.w);
    for (const a of order) {
      const cy = (a.docY - s.scrollY) / P + (a.kind === 'static' || a.kind === 'line' ? 0 : Math.sin(a.bob * 0.8) * a.bobAmp);
      const y = cy - a.sp.h / 2;
      a.screenY = cy;
      if (y > H + 4 || y + a.sp.h < -4) continue;
      if (a.rope) this.drawRope(a, y);
      const fi = Math.floor(a.t * a.sp.frames.length) % a.sp.frames.length;
      const flip = a.dir * a.sp.facing;
      this.w.blit(a.sp.frames[fi], a.x, y, flip, { fog: a.fog, alpha: a.alpha ?? 1 });
    }
  }

  private drawRope(a: Actor, y: number) {
    const buf = this.w.buf;
    const W = this.w.W;
    const x = Math.round(a.x + a.sp.w / 2);
    if (x < 0 || x >= W) return;
    for (let yy = 0; yy < Math.min(this.w.H, y + 2); yy++) {
      this.w.litRGB(190, 182, 160, x, yy, 0.2);
      buf[yy * W + x] = pack(this.w.lr, this.w.lg, this.w.lb);
    }
  }

  private drawParticles(s: ViewState) {
    const { W, H, P, buf } = this.w;
    const vh = s.vh;
    const t = s.reduced ? 0 : s.time;
    const c0 = Math.floor(s.scrollY / vh) - 1;
    const c1 = Math.floor((s.scrollY + vh) / vh) + 1;
    for (let c = c0; c <= c1; c++) {
      const d = this.w.map.depthAt((c + 0.5) * vh);
      if (d <= 0) continue;
      // bubbles near the surface, marine snow below
      const bubbles = d < 50 ? 26 : 0;
      const snow = d > 120 ? Math.min(90, 18 + d / 80) : d > 40 ? 10 : 0;
      for (let k = 0; k < bubbles; k++) {
        const sx = hash(c, k * 3) * W + Math.sin(t * 1.5 + k) * 1.5;
        const span = vh;
        const off = (hash(c, k * 3 + 1) * span - t * (12 + hash(c, k) * 18) * P) % span;
        const docY = c * vh + (off < 0 ? off + span : off);
        const y = Math.round((docY - s.scrollY) / P);
        const x = Math.round(sx);
        if (x < 0 || x >= W || y < 0 || y >= H || this.w.rowDepth[y] <= 0.2) continue;
        const big = hash(c, k * 5) > 0.8;
        add(buf, y * W + x, 60, 70, 70);
        if (big && x + 1 < W && y + 1 < H) {
          add(buf, y * W + x + 1, 40, 50, 50);
          add(buf, (y + 1) * W + x, 30, 40, 40);
        }
      }
      for (let k = 0; k < snow; k++) {
        const sx = (hash(c, k * 7 + 3) * W + t * (hash(c, k) - 0.5) * 2) % W;
        const span = vh;
        const off = (hash(c, k * 7 + 4) * span + t * (2 + hash(c, k * 2) * 4) * P) % span;
        const docY = c * vh + off;
        const y = Math.round((docY - s.scrollY) / P);
        const x = Math.round(sx < 0 ? sx + W : sx);
        if (x < 0 || x >= W || y < 0 || y >= H || this.w.rowDepth[y] <= 0.2) continue;
        // snow shows faintly everywhere and brightly in the dive light
        const T = this.w.torch;
        const dl = Math.hypot(x - T.x, y - T.y) / T.r;
        const lit = dl < 1 ? (1 - dl) * T.power : 0;
        const base = 10 + hash(c, k * 9) * 14;
        add(buf, y * W + x, base + lit * 120, base + 4 + lit * 125, base + 8 + lit * 120);
      }
    }
    // vent smoke: a dark plume rising from the chimney
    const vent = this.list.find((a) => a.sp.id === 'vent');
    if (vent) {
      const vy = (vent.docY - s.scrollY) / P - vent.sp.h / 2 + 4;
      if (vy > -40 && vy < H + 80) {
        for (let k = 0; k < 60; k++) {
          const life = (t * 0.25 + hash(k, 3)) % 1;
          const x = Math.round(vent.x + vent.sp.w / 2 + Math.sin(life * 6 + k) * (2 + life * 8));
          const y = Math.round(vy - life * 44);
          if (x < 0 || x >= W || y < 0 || y >= H) continue;
          blend(buf, y * W + x, 20, 18, 18, 0.5 * (1 - life));
          if (x + 1 < W) blend(buf, y * W + x + 1, 20, 18, 18, 0.35 * (1 - life));
        }
      }
    }
  }

  /** Which creature (if any) is under a CSS-pixel point. */
  hit(cssX: number, cssY: number): string | null {
    const P = this.w.P;
    const x = cssX / P;
    const y = cssY / P;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const a = this.list[i];
      if (a.screenY === undefined) continue;
      const top = a.screenY - a.sp.h / 2;
      if (x >= a.x && x <= a.x + a.sp.w && y >= top && y <= top + a.sp.h) return a.id;
    }
    return null;
  }
}
