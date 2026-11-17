// "The watch builds itself": a pixel cross-section of a dive watch.
// Each engineering stop shows the parts introduced so far, with the new one highlighted.
import type { BuildPart } from '../content/types';
import { buildSprite, ell, poly, line, rect, type Frame } from '../world/sprite';

export const ORDER: BuildPart[] = ['bezel', 'dial', 'hands', 'crown', 'gaskets', 'caseback', 'hev', 'lume', 'crystal', 'case'];

const W = 112;
const H = 64;
const HI = '#59e4ff';

function draw(g: CanvasRenderingContext2D, upto: number, focus: BuildPart | 'all', oil: boolean) {
  const has = (p: BuildPart) => focus === 'all' || ORDER.indexOf(p) <= upto;
  const col = (p: BuildPart, c: string) => (focus === p ? HI : has(p) ? c : 'rgba(150,175,190,0.28)');
  const steel = '#aab3ba';
  const steelD = '#7c858c';
  // case middle (always present as the frame)
  const caseC = focus === 'case' ? '#c9d2d8' : steel;
  poly(g, [16, 18, 26, 16, 26, 50, 18, 52, 14, 46, 14, 22], caseC);
  poly(g, [96, 18, 86, 16, 86, 50, 94, 52, 98, 46, 98, 22], caseC);
  rect(g, 26, 47, 60, 3, steelD);
  // oil fill (the Sinn chapter)
  if (oil) rect(g, 26, 22, 60, 25, 'rgba(214,160,60,0.55)');
  // movement
  rect(g, 32, 33, 48, 12, '#b08d4a');
  for (const [x, r] of [[42, 4], [56, 5], [69, 3.5]] as [number, number][]) { ell(g, x, 39, r, r, '#8d6f36'); ell(g, x, 39, 1, 1, '#d8c38a'); }
  // caseback
  poly(g, [20, 51, 92, 51, 88, 58, 24, 58], col('caseback', steel));
  if (has('caseback')) for (let x = 22; x < 92; x += 4) line(g, [x, 51, x + 2, 53], col('caseback', steelD), 0.8);
  // dial
  rect(g, 28, 28, 56, 3, col('dial', '#121416'));
  // lume on the indices
  for (const x of [31, 41, 71, 81]) rect(g, x, 26.5, 2.5, 1.6, col('lume', '#bfffd8'));
  // hands
  rect(g, 50, 24.5, 22, 1.6, col('hands', '#e7ebee'));
  rect(g, 40, 22.5, 16, 1.6, col('hands', '#e7ebee'));
  if (has('lume') || focus === 'all') { rect(g, 60, 24.5, 10, 1.6, focus === 'lume' ? HI : '#bfffd8'); rect(g, 44, 22.5, 10, 1.6, focus === 'lume' ? HI : '#bfffd8'); }
  ell(g, 56, 24, 2, 1.4, col('hands', '#d9dee2'));
  // crystal: a thick dome
  g.fillStyle = col('crystal', 'rgba(190,230,255,0.55)');
  g.beginPath(); g.moveTo(24, 19); g.quadraticCurveTo(56, 6, 88, 19); g.lineTo(88, 21); g.quadraticCurveTo(56, 12, 24, 21); g.closePath(); g.fill();
  // bezel
  rect(g, 12, 13, 16, 5, col('bezel', '#15181b'));
  rect(g, 84, 13, 16, 5, col('bezel', '#15181b'));
  if (has('bezel')) { rect(g, 12, 18, 16, 2, col('bezel', steelD)); rect(g, 84, 18, 16, 2, col('bezel', steelD)); }
  // gaskets at every joint
  for (const [x, y] of [[25, 21], [87, 21], [22, 50], [90, 50], [99, 33]] as [number, number][]) ell(g, x, y, 1.6, 1.6, col('gaskets', '#2a2f33'));
  // crown: screw-down, with tube and threads
  rect(g, 98, 30, 3, 6, col('crown', steelD));
  rect(g, 101, 28, 8, 10, col('crown', steel));
  if (has('crown')) for (let y = 29; y < 38; y += 2) line(g, [101, y, 109, y], col('crown', steelD), 0.6);
  // helium escape valve
  rect(g, 8, 27, 6, 6, col('hev', steel));
  rect(g, 4, 28.5, 4, 3, col('hev', steelD));
}

const cache = new Map<string, Frame>();

export function paintBuild(canvas: HTMLCanvasElement, part: string) {
  const all = part === 'all';
  const idx = all ? ORDER.length : ORDER.indexOf(part as BuildPart);
  const key = `${part}`;
  let f = cache.get(key);
  if (!f) {
    const sp = buildSprite({ id: `build-${key}`, w: W, h: H, translucent: true, draw: (g) => draw(g, idx, all ? 'all' : (part as BuildPart), part === 'case') });
    f = sp.frames[0];
    cache.set(key, f);
  }
  canvas.width = f.w;
  canvas.height = f.h;
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
  g.putImageData(img, 0, 0);
}
