import '../src/styles/fonts.css';
import { WATCHES } from '../src/content/watches';
import { STOPS } from '../src/content/stops';
import { waterRGB } from '../src/engine/env';
import { buildSprite } from '../src/world/sprite';
import { ART } from '../src/world/art';

const q = new URLSearchParams(location.search);
const id = q.get('id') || 'default';
const $ = (i: string) => document.getElementById(i)!;
const w = WATCHES.find((x) => x.id === id);
const ch = STOPS.find((x) => x.id === id && x.kind === 'chapter') as any;
let depth = 0;
const CH_SPRITE: Record<string, string> = { ch1: 'turtle', ch2: 'redshrimp', ch3: 'nautilus', ch4: 'satbell', ch5: 'lanternfish', ch6: 'sponge', ch7: 'whale', ch8: 'angler', ch9: 'snailfish', briefing: 'diver' };
if (w) {
  depth = w.rating;
  $('t').textContent = `${w.brand} ${w.model}`;
  $('d').textContent = `${w.rating.toLocaleString('en-US')}m`;
  $('s').textContent = w.why.split('. ')[0] + '.';
  $('r').innerHTML = `<img src="/images/watches/${w.id}.webp" alt="">`;
} else if (ch) {
  depth = ch.depth;
  $('t').textContent = ch.title;
  $('d').textContent = ch.num ? `Chapter ${ch.num} · ${ch.range}` : ch.range;
  ($('d') as HTMLElement).style.fontSize = '34px';
  $('s').textContent = ch.problem.split('. ')[0] + '.';
} else {
  depth = 0;
  $('t').innerHTML = 'Your watch says 200m.<br>What does that actually mean?';
  ($('t') as HTMLElement).style.fontSize = '60px';
  $('d').textContent = '0 → 10,935m';
  ($('d') as HTMLElement).style.fontSize = '44px';
  $('s').textContent = 'An interactive descent to the bottom of the Mariana Trench, with the dive watches rated for every depth.';
}
// background: the water column at this depth, dithered
const c = $('bg') as HTMLCanvasElement;
c.width = 300; c.height = 158;
const g = c.getContext('2d')!;
for (let y = 0; y < 158; y++) {
  const d = Math.max(0, depth * 0.85 + (y / 158) * Math.max(30, depth * 0.3));
  const [r, gg, b] = waterRGB(d);
  for (let x = 0; x < 300; x++) {
    const k = ((x + y) % 2) * 3;
    g.fillStyle = `rgb(${(r + k) | 0},${(gg + k) | 0},${(b + k) | 0})`;
    g.fillRect(x, y, 1, 1);
  }
}
g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, 190, 158);
const sid = ch ? CH_SPRITE[id] : !w ? 'turtle' : '';
if (sid) {
  const sp = buildSprite(ART.find((a) => a.id === sid)!);
  const f = sp.frames[0];
  const cv = document.createElement('canvas'); cv.width = f.w; cv.height = f.h;
  const cg = cv.getContext('2d')!; const img = cg.createImageData(f.w, f.h);
  for (let i = 0; i < f.w * f.h; i++) { if (!f.a[i]) continue; const v = f.rgb[i]; img.data[i*4]=v&255; img.data[i*4+1]=(v>>8)&255; img.data[i*4+2]=(v>>16)&255; img.data[i*4+3]=f.a[i]; }
  cg.putImageData(img, 0, 0);
  cv.style.width = Math.min(360, f.w * 6) + 'px';
  $('r').appendChild(cv);
}
// a few bubbles / snow
for (let k = 0; k < 60; k++) { g.fillStyle = depth < 60 ? 'rgba(255,255,255,0.35)' : 'rgba(160,190,200,0.25)'; g.fillRect((k * 97) % 300, (k * 53) % 158, 1, 1); }
document.fonts.ready.then(() => setTimeout(() => ((window as any).__ready = true), 300));
