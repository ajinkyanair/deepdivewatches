// The sprite bible, as drawing code. Sizes are in art pixels (1 art px = 2–3 CSS px).
import { type SpriteSpec, TAU, ell, poly, line, curve, px, rect, clipEll } from './sprite';

const S = Math.sin;
const C = Math.cos;

function rot(pts: number[], cx: number, cy: number, a: number) {
  const out: number[] = [];
  for (let i = 0; i < pts.length; i += 2) {
    const x = pts[i];
    const y = pts[i + 1];
    out.push(cx + x * C(a) - y * S(a), cy + x * S(a) + y * C(a));
  }
  return out;
}

export const ART: SpriteSpec[] = [
  // ───────────────── Shallows ─────────────────
  {
    id: 'sardines', w: 14, h: 7, frames: 4,
    draw(g, t) {
      const sw = S(t * TAU) * 1.3;
      poly(g, [3.2, 3.5, 0.2, 1.4 + sw * 0.5, 0.2, 5.6 + sw * 0.5], '#4b8ea4');
      ell(g, 7.8, 3.5, 5.4, 2.1, '#bfd2da');
      g.save(); clipEll(g, 7.8, 3.5, 5.4, 2.1); rect(g, 0, 0, 14, 2.9, '#2e6d84'); rect(g, 0, 4.4, 14, 3, '#eef6f8'); g.restore();
      px(g, 11.2, 2.6, '#050709');
    },
  },
  {
    id: 'turtle', w: 46, h: 26, frames: 6,
    draw(g, t) {
      const f = S(t * TAU);
      const flipper = [0, -2.2, -6, -3, -13, -1, -16.5, 1.5, -11, 2.8, 0, 2.6];
      // far flippers (behind the shell)
      poly(g, rot(flipper, 30, 14, -0.25 - f * 0.55), '#55603a');
      poly(g, rot([0, -1.5, -5, -1.8, -7, 1, -3, 2], 12, 15, 0.4 + f * 0.3), '#55603a');
      // shell
      ell(g, 23, 12.5, 13, 8.2, '#4a3d20', -0.06);
      g.save(); clipEll(g, 23, 12.5, 12.4, 7.6, -0.06);
      rect(g, 0, 0, 46, 26, '#6e5c2f');
      const plates = [[17, 9, 3.4, 2.4], [24, 8, 3.6, 2.6], [31, 9.5, 3.2, 2.3], [20, 14, 3.4, 2.4], [28, 14, 3.4, 2.4], [13, 13, 2.8, 2.2], [35, 13.5, 2.4, 2]];
      for (const [x, y, rx, ry] of plates) { ell(g, x, y, rx, ry, '#8a7540'); ell(g, x - 0.6, y - 0.6, rx * 0.55, ry * 0.5, '#a08a4e'); }
      rect(g, 0, 18, 46, 4, '#b9ad73');
      g.restore();
      // head and neck
      ell(g, 36, 14, 3.4, 2.8, '#7a8650');
      ell(g, 40, 12.6, 4.4, 3.2, '#7a8650');
      ell(g, 39.5, 11.6, 2.4, 1.3, '#a9b47a');
      px(g, 41.5, 11.4, '#0a0a0a');
      px(g, 43.6, 13.2, '#4b5432');
      // near flippers
      poly(g, rot([0, -1.6, -5, -2, -7.5, 0.8, -3, 2.2], 12, 17, 0.25 - f * 0.3), '#6e7a48');
      const nf = rot(flipper, 31, 16, -0.15 + f * 0.6);
      poly(g, nf, '#748151');
      poly(g, rot([-2, -1.2, -10, -0.8, -14, 1, -9, 0.8], 31, 16, -0.15 + f * 0.6), '#9aa66b');
    },
  },
  {
    id: 'manta', w: 52, h: 34, frames: 8,
    draw(g, t) {
      const f = S(t * TAU);
      const cy = 17;
      const span = 13.5 + f * 3;
      const tipX = 21 - f * 1.5;
      g.fillStyle = '#1d242b';
      g.beginPath();
      g.moveTo(41, cy - 2.5);
      g.quadraticCurveTo(33, cy - span * 0.55, tipX, cy - span);
      g.quadraticCurveTo(19, cy - 6, 11, cy);
      g.quadraticCurveTo(19, cy + 6, tipX, cy + span);
      g.quadraticCurveTo(33, cy + span * 0.55, 41, cy + 2.5);
      g.closePath();
      g.fill();
      // shoulder patches (reef manta)
      ell(g, 31, cy - 5.5 - f * 0.8, 3.2, 1.6, '#c9d3d6', -0.5);
      ell(g, 31, cy + 5.5 + f * 0.8, 3.2, 1.6, '#c9d3d6', 0.5);
      ell(g, 30, cy, 9, 3.2, '#262e36');
      // cephalic fins and tail
      poly(g, [41, cy - 2.8, 46, cy - 4.5, 47.5, cy - 2.5, 43, cy - 1], '#1d242b');
      poly(g, [41, cy + 2.8, 46, cy + 4.5, 47.5, cy + 2.5, 43, cy + 1], '#1d242b');
      line(g, [11, cy, 5, cy + f * 1.5, 0.5, cy + f * 2.5], '#1d242b', 1.2);
      px(g, 40, cy - 3.2, '#0a0a0a');
    },
  },
  {
    id: 'moonjelly', w: 18, h: 24, frames: 6, translucent: true, outline: false,
    draw(g, t) {
      const p = S(t * TAU);
      const rx = 7.8 - p * 0.9;
      const ry = 5.2 + p * 0.7;
      for (let k = 0; k < 6; k++) {
        const x0 = 3 + k * 2.4;
        const pts: number[] = [];
        for (let y = 7; y <= 22; y += 3) pts.push(x0 + S(t * TAU + y * 0.45 + k) * 1.3 * ((y - 7) / 15), y);
        curve(g, pts, 'rgba(214,236,244,0.55)', 0.9);
      }
      g.fillStyle = 'rgba(214,236,244,0.62)';
      g.beginPath(); g.ellipse(9, 8, rx, ry, 0, Math.PI, TAU); g.fill();
      for (const [x, y] of [[6.5, 6], [11.5, 6], [7.6, 7.8], [10.4, 7.8]]) ell(g, x, y, 1.3, 1.1, 'rgba(233,165,200,0.95)');
      line(g, [9 - rx, 8, 9 + rx, 8], 'rgba(240,250,255,0.95)', 1);
    },
  },
  {
    id: 'diver', w: 42, h: 18, frames: 6,
    draw(g, t) {
      const k = S(t * TAU) * 0.38;
      // fins
      poly(g, rot([0, -1.2, -8, -2.5, -9.5, 1.8, 0, 1.2], 10, 9, k), '#c99c1d');
      line(g, [17, 9.5, 10, 9 + k * 4], '#1b1f25', 2.6);
      poly(g, rot([0, -1.2, -8, -2.5, -9.5, 1.8, 0, 1.2], 11, 9.5, -k), '#f0c233');
      line(g, [17, 10, 11, 9.5 - k * 4], '#22272e', 2.6);
      // body
      ell(g, 23, 9.5, 7.5, 3.4, '#1b1f25');
      line(g, [17, 11.4, 29, 11.4], '#2f7bd6', 1);
      // tank and BCD
      g.fillStyle = '#e7b833'; g.beginPath(); g.roundRect(15, 4, 14, 3.6, 1.8); g.fill();
      rect(g, 28.5, 4.6, 1.5, 2.4, '#8e9399');
      // head, mask, regulator
      ell(g, 32.6, 8.2, 3, 2.7, '#1b1f25');
      rect(g, 33.4, 6.9, 3, 1.8, '#7fd3ff');
      px(g, 35.6, 9.6, '#3a3f45');
      // arm reaching forward, watch on the wrist
      line(g, [28, 10.4, 34.5, 12.6, 38.5, 12.6], '#1b1f25', 1.8);
      px(g, 35.5, 11.8, '#b8ffd6');
    },
    glow: ['#b8ffd6'],
  },
  {
    id: 'freediver', w: 16, h: 40, frames: 4,
    draw(g, t) {
      const f = S(t * TAU) * 1.4;
      poly(g, [1 + f, 0, 15 + f, 0, 10, 7, 6, 7], '#2a6fd6');
      line(g, [8, 7, 8, 19], '#121519', 3.2);
      ell(g, 8, 23.5, 3.2, 5.5, '#121519');
      ell(g, 8, 31.5, 2.6, 2.8, '#121519');
      rect(g, 8.6, 31, 2.2, 1.4, '#7fd3ff');
      line(g, [5.5, 26, 4, 36.5], '#121519', 1.4);
      line(g, [10.5, 26, 12, 36.5], '#121519', 1.4);
      rect(g, 1, 36.5, 14, 1.8, '#a1a9b1');
      rect(g, 7.2, 37.5, 1.6, 2.5, '#6b737b');
    },
  },
  {
    id: 'techdiver', w: 24, h: 34, frames: 4,
    draw(g, t) {
      const f = S(t * TAU) * 0.3;
      line(g, [14.5, 11, 19.5, 1], '#141820', 1.6);
      poly(g, rot([0, 0, -2, 9, 1, 9.5, 2, 0], 9.5, 22, f), '#2a3038');
      poly(g, rot([0, 0, 2, 9, -1, 9.5, -2, 0], 14.5, 22, -f), '#2a3038');
      ell(g, 12, 15, 4, 8, '#141820');
      g.fillStyle = '#e9e9e4'; g.beginPath(); g.roundRect(3.5, 9, 3.4, 13, 1.6); g.fill();
      g.fillStyle = '#f2c230'; g.beginPath(); g.roundRect(17.2, 9, 3.4, 13, 1.6); g.fill();
      ell(g, 12, 5.5, 3, 3, '#141820');
      rect(g, 12.6, 4.3, 2.8, 1.8, '#7fd3ff');
      px(g, 10.5, 2.4, '#fff4c2');
    },
    glow: ['#fff4c2'],
  },
  {
    id: 'satbell', w: 30, h: 36, frames: 1,
    draw(g) {
      rect(g, 14, 0, 2, 6, '#7d838a');
      ell(g, 15, 19, 12, 12.5, '#b8861f');
      g.save(); clipEll(g, 15, 19, 12, 12.5); rect(g, 0, 0, 30, 18, '#e5b53a'); rect(g, 0, 22, 30, 2, '#8f6a17'); g.restore();
      ell(g, 9.5, 16, 2.2, 2.2, '#3b2c0f');
      ell(g, 20.5, 16, 2.2, 2.2, '#3b2c0f');
      ell(g, 9.5, 16, 1.4, 1.4, '#ffe9a8');
      ell(g, 20.5, 16, 1.4, 1.4, '#ffe9a8');
      line(g, [5, 29, 3, 35], '#5c6168', 1.2);
      line(g, [25, 29, 27, 35], '#5c6168', 1.2);
      rect(g, 12, 31, 6, 2, '#ffe9a8');
    },
    glow: ['#ffe9a8'],
  },
  {
    id: 'penguin', w: 30, h: 13, frames: 6,
    draw(g, t) {
      const a = 0.5 + S(t * TAU) * 0.8;
      ell(g, 14, 6.5, 11.5, 4.2, '#14171b');
      g.save(); clipEll(g, 14, 6.5, 11.5, 4.2); ell(g, 15, 9.2, 11, 3.6, '#eef2f5'); g.restore();
      ell(g, 22.5, 5.7, 1.7, 1.2, '#f1b234');
      poly(g, [25.2, 5.2, 29, 6.2, 25.2, 7], '#26282b');
      px(g, 26.2, 6.2, '#e88b2a');
      poly(g, rot([0, -0.8, 7, -0.6, 7.5, 0.8, 0, 1], 15, 7.5, a), '#0f1115');
      poly(g, [3, 6, 0, 4.5, 0, 8.5], '#2a2c2f');
    },
  },
  // ───────────────── Twilight ─────────────────
  {
    id: 'nautilus', w: 26, h: 22, frames: 4, facing: -1,
    draw(g, t) {
      for (let k = 0; k < 7; k++) {
        const pts: number[] = [];
        for (let x = 7; x >= 0.5; x -= 2) pts.push(x, 12.5 + (k - 3) * 1.1 + S(t * TAU + x * 0.7 + k) * 0.7);
        curve(g, pts, '#e8cfae', 1);
      }
      ell(g, 15.5, 11, 9.8, 9.8, '#efe3c6');
      g.save(); clipEll(g, 15.5, 11, 9.8, 9.8);
      for (let k = 0; k < 7; k++) {
        const th = -0.35 + k * 0.62;
        const p0 = [15.5 + 10.5 * C(th), 11 + 10.5 * S(th)];
        const p1 = [15.5 + 6 * C(th + 0.55), 11 + 6 * S(th + 0.55)];
        const p2 = [15.5 + 2.6 * C(th + 1.1), 11 + 2.6 * S(th + 1.1)];
        curve(g, [p0[0], p0[1], p1[0], p1[1], p2[0], p2[1]], '#a8562e', 1.6 - k * 0.1);
      }
      g.restore();
      ell(g, 15.5, 11, 1.6, 1.6, '#6a4128');
      ell(g, 8, 12.5, 4, 4.4, '#8a5233');
      ell(g, 8.6, 10.6, 2.6, 2, '#b4744a');
      px(g, 6.4, 11.4, '#111111');
    },
  },
  {
    id: 'redshrimp', w: 20, h: 12, frames: 4,
    draw(g, t) {
      const a = S(t * TAU) * 0.6;
      line(g, [14, 4, 19.5, 1 + a, 19.5, 0.5], '#e4523d', 0.8);
      line(g, [14, 4.5, 19.5, 6 - a, 19.5, 7], '#e4523d', 0.8);
      for (let i = 0; i < 5; i++) ell(g, 13 - i * 2.2, 5.6 + i * 0.25, 2.6 - i * 0.2, 2.1 - i * 0.15, i % 2 ? '#c7352a' : '#d8402f');
      poly(g, [3.5, 6.5, 0.3, 4.6, 0.3, 9], '#b02d24');
      ell(g, 13.5, 4.6, 2.6, 1.2, '#ef6a52');
      px(g, 15, 4.4, '#0b0b0b');
      for (let i = 0; i < 4; i++) line(g, [12 - i * 2, 7.4, 11.5 - i * 2 + a * 0.5, 10], '#b5332a', 0.8);
    },
  },
  {
    id: 'lanternfish', w: 16, h: 8, frames: 4,
    draw(g, t) {
      const sw = S(t * TAU) * 1.2;
      poly(g, [3.5, 4, 0.4, 1.8 + sw * 0.5, 0.4, 6.2 + sw * 0.5], '#1c2436');
      ell(g, 8.6, 4, 6, 2.6, '#29344d');
      g.save(); clipEll(g, 8.6, 4, 6, 2.6); rect(g, 0, 0, 16, 2.5, '#1b2233'); g.restore();
      ell(g, 12.6, 3.4, 1.5, 1.5, '#cfe1ff');
      px(g, 12.9, 3.2, '#06080c');
      for (const x of [4.5, 6.5, 8.5, 10.5]) px(g, x, 5.6, '#7ff0ff');
      px(g, 7.5, 4.2, '#7ff0ff');
    },
    glow: ['#7ff0ff'],
  },
  {
    id: 'hatchetfish', w: 12, h: 12, frames: 2,
    draw(g, t) {
      poly(g, [2.5, 4, 0, 2.5 + S(t * TAU), 0, 6.5 + S(t * TAU)], '#7e8a94');
      poly(g, [2, 3.2, 8, 1, 11, 3, 11, 7, 7, 10.5, 2.5, 8], '#c8d4db');
      poly(g, [2, 3.2, 8, 1, 11, 3, 9, 3.4, 4, 3.6], '#4f5c68');
      ell(g, 8.6, 3.4, 1.8, 1.8, '#d9e5ec');
      ell(g, 8.6, 3.3, 1.1, 1.1, '#070a0d');
      for (const [x, y] of [[4, 8], [5.5, 9.2], [7, 10]]) px(g, x, y, '#9ad8ff');
    },
    glow: ['#9ad8ff'],
  },
  {
    id: 'barreleye', w: 28, h: 15, frames: 4, translucent: true,
    draw(g, t) {
      const sw = S(t * TAU);
      poly(g, [5, 9, 0.5, 6.5 + sw, 0.5, 11.5 + sw], '#3a3330');
      ell(g, 12.5, 9, 9, 3.4, '#38302d');
      ell(g, 13, 10.5, 3.5, 1.4, '#4a413c', 0.4);
      ell(g, 19, 5.8, 6.4, 4.6, 'rgba(190,230,255,0.42)');
      ell(g, 18.4, 5.2, 1.6, 2.6, '#79ff74');
      ell(g, 20.6, 5.6, 1.4, 2.3, '#5fd85a');
      px(g, 24.5, 9.6, '#2a2320');
    },
  },
  {
    id: 'squid', w: 108, h: 30, frames: 6,
    draw(g, t) {
      const ph = t * TAU;
      // two long feeding tentacles
      for (const k of [-1, 1]) {
        const pts: number[] = [];
        for (let x = 52; x >= 2; x -= 5) pts.push(x, 15 + k * 1.5 + S(ph + x * 0.16 + k) * 2.2 * ((52 - x) / 50));
        curve(g, pts, '#9a3d30', 1.2);
        ell(g, pts[pts.length - 2] + 2, pts[pts.length - 1], 3, 1.6, '#a84535');
      }
      // eight arms
      for (let k = 0; k < 8; k++) {
        const y0 = 15 + (k - 3.5) * 1.2;
        const pts: number[] = [];
        for (let x = 54; x >= 25; x -= 4) {
          const u = (54 - x) / 29;
          pts.push(x, y0 + (k - 3.5) * 1.1 * u + S(ph + x * 0.22 + k * 0.8) * 1.5 * u);
        }
        curve(g, pts, k % 2 ? '#b1483a' : '#a24033', 1.5);
      }
      // mantle and fins
      g.fillStyle = '#b34f3f';
      g.beginPath();
      g.moveTo(58, 9.5);
      g.quadraticCurveTo(84, 6, 104, 15);
      g.quadraticCurveTo(84, 24, 58, 20.5);
      g.closePath();
      g.fill();
      poly(g, [88, 15, 97, 6.5, 106, 15, 97, 23.5], '#a2453a');
      g.save(); g.beginPath(); g.moveTo(58, 9.5); g.quadraticCurveTo(84, 6, 104, 15); g.lineTo(58, 15); g.closePath(); g.clip();
      rect(g, 50, 0, 60, 13, '#cd6a55');
      for (const [x, y] of [[66, 10], [74, 9], [82, 10.5], [70, 12], [90, 12]]) px(g, x, y, '#9a3a2e', 2, 1);
      g.restore();
      // head and eye
      ell(g, 55, 15, 5.5, 5.4, '#b04b3c');
      ell(g, 55, 14, 3.4, 3.4, '#ece6da');
      ell(g, 55, 14, 1.9, 1.9, '#0b0b0b');
      px(g, 54, 13, '#ffffff');
    },
  },
  {
    id: 'vampsquid', w: 32, h: 24, frames: 6,
    draw(g, t) {
      const f = S(t * TAU);
      // webbed cloak with scalloped hem
      g.fillStyle = '#3a0e13';
      g.beginPath();
      g.moveTo(10, 9);
      g.quadraticCurveTo(3 - f * 2, 14, 2 - f * 2, 20 + f);
      for (let k = 0; k < 6; k++) {
        const x0 = 2 - f * 2 + (k * (28 + f * 4)) / 6;
        const x1 = 2 - f * 2 + ((k + 1) * (28 + f * 4)) / 6;
        g.quadraticCurveTo((x0 + x1) / 2, 17 + f, x1, 20 + f);
      }
      g.quadraticCurveTo(29 + f * 2, 14, 22, 9);
      g.closePath();
      g.fill();
      for (let k = 0; k <= 6; k++) line(g, [16, 10, 2 - f * 2 + (k * (28 + f * 4)) / 6, 20 + f], '#250709', 0.7);
      // mantle and ear-like fins
      ell(g, 9, 4, 3, 1.6, '#6c2129', -0.7 + f * 0.3);
      ell(g, 23, 4, 3, 1.6, '#6c2129', 0.7 - f * 0.3);
      ell(g, 16, 7, 6, 6, '#5a1b21');
      ell(g, 14.5, 4.6, 2.6, 1.6, '#7a2a31');
      // big blue eyes
      ell(g, 13, 8.6, 1.9, 1.9, '#5fa8e8');
      ell(g, 19, 8.6, 1.9, 1.9, '#5fa8e8');
      px(g, 13, 8.6, '#06121c');
      px(g, 19, 8.6, '#06121c');
      // light organs at the fin bases and arm tips
      px(g, 10.5, 5.2, '#7fd4ff');
      px(g, 21, 5.2, '#7fd4ff');
      for (const k of [0, 3, 6]) px(g, 2 - f * 2 + (k * (28 + f * 4)) / 6, 20 + f, '#7fd4ff');
    },
    glow: ['#7fd4ff'],
  },
  {
    id: 'sponge', w: 16, h: 40, frames: 1, translucent: true,
    draw(g) {
      g.fillStyle = 'rgba(214,232,228,0.9)';
      g.beginPath();
      g.moveTo(2, 3);
      g.quadraticCurveTo(8, 0, 14, 3);
      g.quadraticCurveTo(12, 20, 10, 33);
      g.lineTo(6, 33);
      g.quadraticCurveTo(4, 20, 2, 3);
      g.closePath();
      g.fill();
      g.save(); g.clip();
      for (let y = -10; y < 40; y += 3) { line(g, [0, y, 16, y + 8], 'rgba(140,170,166,0.95)', 0.7); line(g, [16, y, 0, y + 8], 'rgba(140,170,166,0.95)', 0.7); }
      g.restore();
      line(g, [2.5, 3, 8, 1.4, 13.5, 3], '#f1f8f6', 1.2);
      for (const x of [6.5, 8, 9.5]) line(g, [x, 33, x + (x - 8) * 1.6, 39.5], 'rgba(230,244,240,0.8)', 0.6);
    },
  },
  // ───────────────── Midnight and below ─────────────────
  {
    id: 'whale', w: 154, h: 48, frames: 8,
    draw(g, t) {
      const f = S(t * TAU);
      // flukes
      const fy = 23 + f * 4;
      poly(g, [30, 21, 16, fy - 1.5, 16, fy + 1.5, 30, 26], '#40454c');
      poly(g, [17, fy, 3, fy - 11 + f * 2, 7, fy, 3, fy + 11 + f * 2], '#3a3e45');
      // body
      g.fillStyle = '#4b5059';
      g.beginPath();
      g.moveTo(28, 21);
      g.quadraticCurveTo(52, 9, 74, 9);
      g.lineTo(144, 7);
      g.quadraticCurveTo(151.5, 7.5, 151.5, 17);
      g.quadraticCurveTo(151.5, 28.5, 141, 31);
      g.lineTo(108, 33);
      g.quadraticCurveTo(70, 37, 44, 31);
      g.quadraticCurveTo(32, 28, 28, 26);
      g.closePath();
      g.fill();
      // belly light, wrinkles, hump
      g.save(); g.clip();
      rect(g, 0, 29, 154, 10, '#636a74');
      for (let i = 0; i < 26; i++) { const x = 40 + ((i * 37) % 96); const y = 13 + ((i * 11) % 16); line(g, [x, y, x + 4, y + 0.6], '#41464e', 0.8); }
      g.restore();
      poly(g, [56, 10, 60, 6.5, 64, 9.5], '#4b5059');
      poly(g, [66, 9.5, 69, 7, 72, 9.3], '#4b5059');
      // lower jaw, flipper, eye
      line(g, [141, 30.5, 106, 32.5], '#2c3036', 1.2);
      poly(g, [110, 32, 118, 33, 108, 40, 104, 38], '#40454c');
      px(g, 113, 22, '#0d0e10', 2, 1);
    },
  },
  {
    id: 'angler', w: 36, h: 30, frames: 6,
    draw(g, t) {
      const b = S(t * TAU) * 1.2;
      curve(g, [19, 8, 22, 1.5, 29, 1.5 + b, 32, 4 + b], '#4a3c35', 1);
      poly(g, [6, 17, 0.5, 12, 1.5, 17, 0.5, 23], '#2a211d');
      ell(g, 15, 17, 11, 9.5, '#2e2521');
      g.save(); clipEll(g, 15, 17, 11, 9.5); rect(g, 0, 22, 36, 8, '#3a2f2a'); rect(g, 0, 7, 36, 3, '#251d1a'); g.restore();
      ell(g, 24.5, 19, 5.2, 4.2, '#120b0a');
      for (const x of [21, 23, 25, 27]) { px(g, x, 15.6, '#efe9dc'); px(g, x + 1, 22.2, '#efe9dc'); }
      px(g, 20.8, 13, '#6f5a4c');
      ell(g, 9, 21, 3, 1.6, '#3a2f2a', 0.6);
      ell(g, 32.4, 4.2 + b, 2.2, 2.2, '#bffff0');
      px(g, 32.2, 3.8 + b, '#ffffff');
    },
    glow: ['#bffff0', '#ffffff'],
  },
  {
    id: 'atolla', w: 26, h: 18, frames: 8,
    draw(g, t) {
      curve(g, [13, 9, 15, 13, 12 + S(t * TAU) * 2, 17.5], '#b8332c', 0.9);
      g.fillStyle = '#a3211c';
      g.beginPath(); g.ellipse(13, 9, 11, 7, 0, Math.PI, TAU); g.fill();
      for (let k = 0; k < 8; k++) { const x = 4 + k * 2.6; line(g, [13, 3.5, x, 9], '#741410', 0.8); }
      ell(g, 13, 6, 4, 3, '#5a0d0b');
      // the burglar-alarm ring: a light that chases around the rim
      const on = Math.floor(t * 10);
      for (let k = 0; k < 10; k++) {
        const x = 3 + k * 2.2;
        if ((k + on) % 10 < 4) px(g, x, 9, '#58d7ff');
        else px(g, x, 9, '#7a1813');
      }
    },
    glow: ['#58d7ff'],
  },
  {
    id: 'vent', w: 40, h: 66, frames: 4,
    draw(g, t) {
      poly(g, [0, 66, 4, 58, 12, 56, 28, 56, 36, 58, 40, 66], '#2a2523');
      g.fillStyle = '#3b3431';
      g.beginPath();
      g.moveTo(11, 58); g.lineTo(13, 44); g.lineTo(11.5, 36); g.lineTo(14.5, 24); g.lineTo(14, 12); g.lineTo(16.5, 4);
      g.lineTo(23.5, 4); g.lineTo(25, 13); g.lineTo(24, 26); g.lineTo(27.5, 37); g.lineTo(26, 46); g.lineTo(28.5, 58);
      g.closePath(); g.fill();
      for (const [x, y, w] of [[15, 10, 6], [14, 22, 7], [15, 34, 9], [14, 46, 10]]) rect(g, x, y, w, 1.4, '#5c4f45');
      for (const [x, y] of [[16, 16], [22, 28], [17, 40], [23, 51]]) rect(g, x, y, 2, 3, '#7a6a50');
      rect(g, 16.5, 3, 7, 2, '#151110');
      for (let k = 0; k < 6; k++) {
        const x = 4 + k * (k < 3 ? 2.6 : 2.6) + (k >= 3 ? 22 : 0);
        const h = 7 + ((k * 5) % 4);
        const sw = S(t * TAU + k) * 0.8;
        line(g, [x, 58, x + sw * 0.3, 58 - h], '#e9e4dc', 1.4);
        ell(g, x + sw, 58 - h - 1, 1.3, 1.6, '#e2343e');
      }
    },
  },
  {
    id: 'seapig', w: 20, h: 12, frames: 4, translucent: true,
    draw(g, t) {
      const w = S(t * TAU);
      for (const [x, k] of [[11, 0], [13, 1], [15, 2]]) curve(g, [x, 5, x + 0.5, 2.5, x + 1 + S(t * TAU + k) * 0.8, 0.5], 'rgba(236,170,172,0.9)', 0.9);
      ell(g, 10, 7.4, 8.6, 3.4, 'rgba(230,163,166,0.85)');
      ell(g, 9.5, 6.4, 6, 1.6, 'rgba(244,198,198,0.9)');
      for (const x of [4, 7, 10, 13, 16]) line(g, [x, 10, x + w * 0.4, 11.6], 'rgba(214,140,144,0.95)', 1);
      px(g, 17, 6.6, '#7a3a3e');
    },
  },
  {
    id: 'tripod', w: 28, h: 22, frames: 2,
    draw(g, t) {
      line(g, [12, 8, 8, 21.5], '#6a6d73', 0.9);
      line(g, [15, 8, 19, 21.5], '#6a6d73', 0.9);
      line(g, [4, 7, 1, 21.5], '#6a6d73', 0.9);
      line(g, [14, 5, 7, 0.5 + S(t * TAU) * 0.5], '#55585e', 0.7);
      poly(g, [4.5, 6.5, 0.5, 4.5, 0.5, 9], '#3b3d42');
      ell(g, 14, 6.5, 10, 2.7, '#3b3d42');
      ell(g, 14, 5.6, 8, 1.2, '#55585e');
      px(g, 21.5, 6, '#0b0b0b');
    },
  },
  {
    id: 'dumbo', w: 26, h: 24, frames: 6,
    draw(g, t) {
      const f = S(t * TAU);
      ell(g, 4.5, 7, 3.6, 2.2, '#e89a90', -0.6 + f * 0.6);
      ell(g, 21.5, 7, 3.6, 2.2, '#e89a90', 0.6 - f * 0.6);
      g.fillStyle = '#d98f87';
      g.beginPath();
      g.moveTo(6, 11);
      g.lineTo(20, 11);
      g.lineTo(24 + f, 21);
      for (let k = 0; k <= 6; k++) g.quadraticCurveTo(22 - k * 3.3, 23 + (k % 2) * -2, 22 - k * 3.3 - 1.6, 21);
      g.lineTo(2 - f, 21);
      g.closePath();
      g.fill();
      ell(g, 13, 8, 7.2, 6.8, '#e8a69c');
      ell(g, 11.5, 5.5, 3.6, 2.2, '#f5c8c0');
      px(g, 9.5, 9.2, '#4a2622');
      px(g, 16, 9.2, '#4a2622');
    },
  },
  {
    id: 'snailfish', w: 32, h: 12, frames: 4, translucent: true,
    draw(g, t) {
      const sw = S(t * TAU);
      g.fillStyle = 'rgba(242,214,211,0.72)';
      g.beginPath();
      g.moveTo(17, 2);
      g.quadraticCurveTo(8, 3.5, 1, 6 + sw * 1.2);
      g.quadraticCurveTo(8, 9.5, 17, 10.4);
      g.closePath();
      g.fill();
      ell(g, 23, 6, 7, 4.6, 'rgba(242,214,211,0.85)');
      ell(g, 20, 7, 3, 1.6, 'rgba(226,160,156,0.9)');
      ell(g, 26.5, 4.5, 1.2, 1.2, '#2c2028');
      line(g, [17, 2.5, 4, 5.4 + sw], 'rgba(255,240,238,0.6)', 0.7);
    },
  },
  {
    id: 'amphipods', w: 7, h: 4, frames: 2,
    draw(g, t) {
      ell(g, 3.5, 2, 2.6, 1.3, '#e9dcc5');
      px(g, 1 + t * 2, 3, '#cbb998');
      px(g, 5 - t * 2, 3, '#cbb998');
      px(g, 6, 1, '#cbb998');
    },
  },
  {
    id: 'plastic', w: 18, h: 22, frames: 4, translucent: true, outline: false,
    draw(g, t) {
      const w = S(t * TAU) * 0.8;
      g.strokeStyle = 'rgba(236,240,236,0.8)'; g.lineWidth = 1.1;
      g.beginPath(); g.ellipse(5.5, 3.5, 2.4, 3, 0, Math.PI, TAU); g.stroke();
      g.beginPath(); g.ellipse(12.5, 3.5, 2.4, 3, 0, Math.PI, TAU); g.stroke();
      g.fillStyle = 'rgba(236,240,236,0.62)';
      g.beginPath();
      g.moveTo(2.5, 4); g.lineTo(15.5, 4); g.quadraticCurveTo(17 + w, 12, 15 + w, 20); g.lineTo(9, 21.5); g.lineTo(3 - w, 20); g.quadraticCurveTo(1 - w, 12, 2.5, 4);
      g.fill();
      line(g, [6, 8, 8 + w, 15], 'rgba(255,255,255,0.85)', 0.8);
      line(g, [11, 6, 12 + w, 13], 'rgba(200,206,200,0.85)', 0.8);
    },
  },
  // ───────────────── Machines and wrecks ─────────────────
  {
    id: 'boat', w: 70, h: 30, frames: 1,
    draw(g) {
      line(g, [44, 18, 44, 1], '#c9ced3', 1);
      rect(g, 44.5, 2, 10, 6, '#d6262f');
      poly(g, [44.5, 2, 47, 2, 54.5, 8, 52, 8], '#ffffff');
      g.fillStyle = '#f2f2ee';
      g.beginPath(); g.moveTo(2, 18); g.lineTo(68, 18); g.lineTo(62, 27); g.lineTo(8, 27); g.closePath(); g.fill();
      rect(g, 6, 22, 59, 2, '#2a5d9f');
      rect(g, 24, 10, 24, 8, '#e9e9e4');
      for (const x of [27, 33, 39]) rect(g, x, 12, 4, 3, '#79c8ff');
      line(g, [8, 18, 4, 12, 10, 12], '#a4abb2', 1);
      rect(g, 6, 27, 58, 1, '#0d3a52');
    },
  },
  {
    id: 'submarine', w: 136, h: 28, frames: 1,
    draw(g) {
      ell(g, 68, 17, 60, 8.2, '#2a3036');
      poly(g, [76, 9, 80, 1, 96, 1, 99, 9], '#252a30');
      rect(g, 84, 3, 1, 3, '#3a4047');
      poly(g, [16, 17, 4, 11, 5, 23], '#22272c');
      rect(g, 2, 13, 2, 8, '#3a4047');
      g.save(); clipEll(g, 68, 17, 60, 8.2); rect(g, 0, 9, 136, 3, '#353c43'); g.restore();
    },
  },
  {
    id: 'titanic', w: 210, h: 78, frames: 1,
    draw(g) {
      // the mud mound she ploughed into
      g.fillStyle = '#2b2722';
      g.beginPath(); g.moveTo(0, 78); g.quadraticCurveTo(40, 58, 110, 62); g.quadraticCurveTo(170, 60, 210, 70); g.lineTo(210, 78); g.closePath(); g.fill();
      // hull
      g.fillStyle = '#5a2b1c';
      g.beginPath();
      g.moveTo(14, 66); g.lineTo(10, 40); g.lineTo(16, 35); g.lineTo(22, 41); g.lineTo(26, 33);
      g.lineTo(196, 30); g.quadraticCurveTo(206, 34, 204, 46); g.lineTo(192, 66);
      g.closePath(); g.fill();
      g.save(); g.clip();
      rect(g, 0, 30, 210, 7, '#6e3a24');
      for (let x = 30; x < 196; x += 6) { px(g, x, 40, '#1a100c', 2, 2); px(g, x + 3, 47, '#1a100c', 2, 2); }
      for (let i = 0; i < 40; i++) { const x = 14 + ((i * 53) % 182); line(g, [x, 37, x + 1, 37 + 3 + (i % 5)], '#8a4a28', 0.8); }
      rect(g, 0, 58, 210, 10, '#3a1b12');
      g.restore();
      // deck rail, well deck, fallen foremast
      line(g, [40, 29.5, 196, 27.5], '#7d3d22', 0.8);
      for (let x = 44; x < 196; x += 4) line(g, [x, 30, x, 27.5], '#7d3d22', 0.6);
      rect(g, 40, 22, 26, 8, '#4d2416');
      rect(g, 46, 16, 12, 6, '#46200f');
      line(g, [112, 29, 168, 20], '#6b3420', 1.6);
      line(g, [168, 20, 176, 19], '#6b3420', 1);
      // jagged break where she split
      poly(g, [10, 40, 4, 44, 9, 50, 3, 56, 10, 62, 14, 66], '#2a140d');
    },
  },
  {
    id: 'trieste', w: 70, h: 60, frames: 1,
    draw(g) {
      ell(g, 35, 20, 32, 10, '#9a9e98');
      g.save(); clipEll(g, 35, 20, 32, 10); rect(g, 0, 22, 70, 10, '#767a74'); rect(g, 0, 12, 70, 2, '#b8bbb5'); g.restore();
      rect(g, 30, 4, 9, 7, '#8b8f89');
      line(g, [8, 10.5, 62, 10.5], '#c9ccc6', 0.8);
      rect(g, 18, 29, 5, 10, '#666a64');
      rect(g, 47, 29, 5, 10, '#666a64');
      rect(g, 33, 29, 4, 9, '#555a5f');
      ell(g, 35, 47, 9.5, 9.5, '#3a3e43');
      ell(g, 32, 44, 2.6, 2.6, '#1c1f22');
      ell(g, 32, 44, 1.5, 1.5, '#ffe2a0');
      px(g, 22, 40, '#fff1b8', 2, 2);
      px(g, 47, 40, '#fff1b8', 2, 2);
    },
    glow: ['#ffe2a0', '#fff1b8'],
  },
  {
    id: 'challenger', w: 24, h: 80, frames: 1,
    draw(g) {
      g.fillStyle = '#4f8a3c';
      g.beginPath(); g.moveTo(5, 62); g.lineTo(5, 8); g.quadraticCurveTo(12, -1, 19, 8); g.lineTo(19, 62); g.closePath(); g.fill();
      rect(g, 13, 6, 3, 54, '#6fae52');
      rect(g, 5, 30, 14, 2, '#3a6b2c');
      rect(g, 2, 60, 20, 3.5, '#b9bdbf');
      for (const x of [3, 7, 11, 15, 19]) px(g, x, 61, '#fff4c8', 2, 1);
      ell(g, 12, 70, 7.5, 7.5, '#2f3b31');
      ell(g, 9.5, 68, 1.6, 1.6, '#ffe2a0');
    },
    glow: ['#fff4c8', '#ffe2a0'],
  },
  {
    id: 'limitingfactor', w: 60, h: 44, frames: 1,
    draw(g) {
      g.fillStyle = '#ece9e2'; g.beginPath(); g.roundRect(4, 6, 50, 22, 4); g.fill();
      rect(g, 4, 18, 50, 2, '#f2c230');
      line(g, [10, 6, 10, 28], '#bdb9ae', 0.8);
      line(g, [48, 6, 48, 28], '#bdb9ae', 0.8);
      ell(g, 29, 32, 9.5, 8.5, '#54585d');
      ell(g, 26, 31, 1.8, 1.8, '#ffe2a0');
      rect(g, 1, 9, 3, 6, '#8d9298');
      rect(g, 54, 9, 3, 6, '#8d9298');
      rect(g, 6, 28, 4, 4, '#8d9298');
      rect(g, 48, 28, 4, 4, '#8d9298');
      // manipulator arm, with a watch strapped on
      line(g, [12, 30, 4, 36, 1, 41], '#9aa0a6', 1.4);
      px(g, 5, 35, '#b8ffd6', 2, 1);
      for (const x of [16, 22, 36, 42]) px(g, x, 27, '#fff4c8', 2, 1);
    },
    glow: ['#ffe2a0', '#fff4c8', '#b8ffd6'],
  },
];
