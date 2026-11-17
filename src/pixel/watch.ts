// Parametric pixel watches: drawn with vectors, snapped to pixels like the sprites.
import type { PixelWatchSpec } from '../content/types';
import { buildSprite, ell, poly, line, rect, px, TAU, type Frame } from '../world/sprite';

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1, 7), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

export function drawWatch(g: CanvasRenderingContext2D, s: PixelWatchSpec, N: number, time = { h: 10, m: 9, s: 30 }) {
  const c = N / 2;
  const R = N * 0.33; // case radius
  const strap = s.strap || (s.caseColor === '#1a1b1d' ? '#1b1d20' : shade(s.caseColor, 0.85));
  // strap / bracelet stubs
  const sw = R * 1.05;
  rect(g, c - sw / 2, 0, sw, N * 0.22, strap);
  rect(g, c - sw / 2, N * 0.78, sw, N * 0.22, strap);
  for (let y = 1; y < N * 0.2; y += Math.max(2, N / 22)) { line(g, [c - sw / 2, y, c + sw / 2, y], shade(s.caseColor, 0.65), 0.6); line(g, [c - sw / 2, N - y, c + sw / 2, N - y], shade(s.caseColor, 0.65), 0.6); }
  // lugs
  rect(g, c - R * 0.78, c - R * 1.12, R * 0.3, R * 0.4, s.caseColor);
  rect(g, c + R * 0.48, c - R * 1.12, R * 0.3, R * 0.4, s.caseColor);
  rect(g, c - R * 0.78, c + R * 0.72, R * 0.3, R * 0.4, s.caseColor);
  rect(g, c + R * 0.48, c + R * 0.72, R * 0.3, R * 0.4, s.caseColor);
  // crown and guards
  const crownLeft = s.shape === 'ploprof';
  const cx = crownLeft ? c - R - R * 0.18 : c + R + R * 0.02;
  rect(g, cx, c - R * 0.14, R * 0.18, R * 0.28, shade(s.caseColor, 0.9));
  if (s.crown === 'guard') poly(g, [c + R * 0.9, c - R * 0.4, c + R * 1.28, c - R * 0.2, c + R * 1.28, c + R * 0.2, c + R * 0.9, c + R * 0.4], shade(s.caseColor, 0.95));
  if (s.hev) ell(g, c - R * 0.82, c - R * 0.62, R * 0.11, R * 0.11, shade(s.caseColor, 0.8));
  // case
  if (s.shape === 'cushion') { g.fillStyle = s.caseColor; g.beginPath(); g.roundRect(c - R * 1.05, c - R * 1.05, R * 2.1, R * 2.1, R * 0.45); g.fill(); }
  else if (s.shape === 'ploprof') poly(g, [c - R * 1.1, c - R * 0.9, c + R * 0.9, c - R * 1.05, c + R * 1.15, c + R * 0.2, c + R * 0.9, c + R * 1.05, c - R * 1.1, c + R * 0.9], s.caseColor);
  else if (s.shape === 'tuna') ell(g, c, c, R * 1.18, R * 1.18, '#1a1b1d');
  else ell(g, c, c, R, R, s.caseColor);
  ell(g, c - R * 0.3, c - R * 0.35, R * 0.45, R * 0.22, 'rgba(255,255,255,0.18)', -0.6);
  // bezel
  const br = R * 0.92;
  if (s.bezel !== 'none') {
    if (s.shape === 'octagon') {
      const pts: number[] = [];
      for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU + Math.PI / 12; pts.push(c + Math.cos(a) * br, c + Math.sin(a) * br); }
      poly(g, pts, s.bezelColor || '#111');
    } else ell(g, c, c, br, br, s.bezelColor || '#111');
    if (s.bezelAccent && s.bezel === 'dive') {
      g.fillStyle = s.bezelAccent;
      g.beginPath(); g.moveTo(c, c); g.arc(c, c, br, -Math.PI / 2, -Math.PI / 2 + TAU / 4); g.closePath(); g.fill();
    }
    if (s.bezel === 'nodeco' && s.bezelAccent) {
      g.strokeStyle = s.bezelAccent; g.lineWidth = Math.max(1, N / 40);
      g.beginPath(); g.arc(c, c, br * 0.86, -Math.PI / 2, TAU * 0.55 - Math.PI / 2); g.stroke();
    }
    // minute ticks every 5
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * TAU - Math.PI / 2;
      const r1 = br * 0.84;
      const r2 = br * 0.98;
      line(g, [c + Math.cos(a) * r1, c + Math.sin(a) * r1, c + Math.cos(a) * r2, c + Math.sin(a) * r2], s.bezel === 'nodeco' ? '#222' : '#e9e9e4', N > 70 ? 1.2 : 0.8);
    }
    ell(g, c, c - br * 0.9, Math.max(0.9, N / 60), Math.max(0.9, N / 60), s.lume || '#d8f5c8');
  }
  // dial
  const dr = s.bezel === 'none' ? R * 0.9 : R * 0.72;
  ell(g, c, c, dr, dr, s.dial);
  if (s.subdials) {
    const sub = dr * 0.28;
    const posns = s.subdials === 3 ? [[-0.45, 0], [0.45, 0], [0, 0.45]] : [[-0.42, 0.05], [0.42, 0.05]];
    for (const [x, y] of posns) ell(g, c + x * dr, c + y * dr, sub, sub, s.accent || shade(s.dial, 0.7));
  }
  // indices
  const lume = s.lume || '#e9f2e0';
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU - Math.PI / 2;
    const r = dr * 0.82;
    const x = c + Math.cos(a) * r;
    const y = c + Math.sin(a) * r;
    const big = N > 70;
    if (k === 0) poly(g, [x - dr * 0.1, y - dr * 0.08, x + dr * 0.1, y - dr * 0.08, x, y + dr * 0.1], lume);
    else if (s.index === 'arabic' && k % 3 === 0) ell(g, x, y, dr * 0.07, dr * 0.1, lume);
    else if (s.index === 'batons' || (s.index === 'mixed' && k % 3 === 0)) line(g, [c + Math.cos(a) * dr * 0.7, c + Math.sin(a) * dr * 0.7, x + Math.cos(a) * dr * 0.08, y + Math.sin(a) * dr * 0.08], lume, big ? 2 : 1.2);
    else ell(g, x, y, big ? dr * 0.065 : dr * 0.08, big ? dr * 0.065 : dr * 0.08, lume);
  }
  // hands
  const hc = s.handColor || '#e7ebee';
  const ha = ((time.h % 12) / 12 + time.m / 720) * TAU - Math.PI / 2;
  const ma = (time.m / 60) * TAU - Math.PI / 2;
  const sa = (time.s / 60) * TAU - Math.PI / 2;
  const hand = (a: number, len: number, w: number, color: string, tip: string) => {
    const x = c + Math.cos(a) * len;
    const y = c + Math.sin(a) * len;
    const nx = Math.cos(a + Math.PI / 2) * w;
    const ny = Math.sin(a + Math.PI / 2) * w;
    poly(g, [c + nx, c + ny, x + nx * 0.5, y + ny * 0.5, x, y, x - nx * 0.5, y - ny * 0.5, c - nx, c - ny], color);
    poly(g, [c + nx * 0.5 + Math.cos(a) * len * 0.3, c + ny * 0.5 + Math.sin(a) * len * 0.3, x, y, c - nx * 0.5 + Math.cos(a) * len * 0.3, c - ny * 0.5 + Math.sin(a) * len * 0.3], tip);
  };
  const hw = Math.max(0.9, N / 45);
  if (s.hands === 'snowflake') { hand(ha, dr * 0.5, hw * 1.1, hc, lume); rect(g, c + Math.cos(ha) * dr * 0.42 - hw * 1.4, c + Math.sin(ha) * dr * 0.42 - hw * 1.4, hw * 2.8, hw * 2.8, lume); }
  else if (s.hands === 'mercedes') { hand(ha, dr * 0.5, hw * 1.1, hc, lume); ell(g, c + Math.cos(ha) * dr * 0.4, c + Math.sin(ha) * dr * 0.4, hw * 1.6, hw * 1.6, lume); }
  else hand(ha, dr * 0.5, hw * 1.2, hc, lume);
  if (s.hands === 'plongeur') hand(ma, dr * 0.8, hw * 1.4, s.accent || '#ff6a13', s.accent || '#ff6a13');
  else hand(ma, dr * 0.78, hw, hc, lume);
  line(g, [c - Math.cos(sa) * dr * 0.15, c - Math.sin(sa) * dr * 0.15, c + Math.cos(sa) * dr * 0.8, c + Math.sin(sa) * dr * 0.8], s.accent || '#e04a3a', N > 70 ? 0.9 : 0.6);
  px(g, c - 0.5, c - 0.5, '#d9dee2');
  // bubble crystal highlight for the Deep Sea Special
  if (s.shape === 'bubble') { g.strokeStyle = 'rgba(220,240,255,0.7)'; g.lineWidth = 1.2; g.beginPath(); g.arc(c, c, R * 0.98, Math.PI * 1.1, Math.PI * 1.7); g.stroke(); }
}

const cache = new Map<string, Frame>();

/** Render a pixel watch into a canvas at its own pixel size; CSS scales it up crisply. */
export function paintWatch(canvas: HTMLCanvasElement, spec: PixelWatchSpec, key: string) {
  const N = canvas.width;
  const k = `${key}@${N}`;
  let f = cache.get(k);
  if (!f) {
    const sp = buildSprite({ id: k, w: N - 2, h: N - 2, draw: (g) => drawWatch(g, spec, N - 2) });
    f = sp.frames[0];
    cache.set(k, f);
  }
  const g = canvas.getContext('2d')!;
  const img = g.createImageData(f.w, f.h);
  for (let i = 0; i < f.w * f.h; i++) {
    if (!f.a[i]) continue;
    const v = f.rgb[i];
    img.data[i * 4] = v & 255;
    img.data[i * 4 + 1] = (v >> 8) & 255;
    img.data[i * 4 + 2] = (v >> 16) & 255;
    img.data[i * 4 + 3] = f.a[i];
  }
  canvas.width = f.w;
  canvas.height = f.h;
  g.putImageData(img, 0, 0);
}

/** A generic watch for a style, used when a reader picks a model or just a number. */
export function styleSpec(style: string, rating: number): PixelWatchSpec {
  switch (style) {
    case 'smart': return { shape: 'cushion', caseColor: '#2a2c30', bezel: 'none', dial: '#05070a', index: 'dots', hands: 'baton', lume: '#ff9f3a' };
    case 'digital': return { shape: 'cushion', caseColor: '#1c1d20', bezel: 'none', dial: '#9fb39a', index: 'batons', hands: 'baton', handColor: '#222' };
    case 'dress': return { caseColor: '#c9b98a', bezel: 'none', dial: '#efece4', index: 'batons', hands: 'baton', handColor: '#222', lume: '#888' };
    case 'chrono': return { caseColor: '#b9bec4', bezel: 'none', dial: '#151719', index: 'batons', hands: 'baton', subdials: 3, accent: '#e8e6df' };
    case 'sport': return { caseColor: '#b9bec4', bezel: 'none', dial: '#1d3557', index: 'batons', hands: 'sword' };
    default: return { caseColor: '#b9bec4', bezel: 'dive', bezelColor: '#111', dial: rating >= 300 ? '#101112' : '#1d3557', index: 'dots', hands: rating >= 1000 ? 'arrow' : 'mercedes', hev: rating >= 1000 };
  }
}
