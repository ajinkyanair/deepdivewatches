import { ART } from '../src/world/art';
import { buildSprite } from '../src/world/sprite';
const out = document.getElementById('out')!;
const scale = Number(new URLSearchParams(location.search).get('s') || 4);
const only = new URLSearchParams(location.search).get('only');
for (const spec of ART) {
  if (only && !only.split(',').includes(spec.id)) continue;
  const sp = buildSprite(spec);
  const box = document.createElement('div'); box.className = 's';
  box.innerHTML = `<div>${sp.id} ${sp.w}x${sp.h}</div>`;
  const nf = Math.min(sp.frames.length, 3);
  for (let fi = 0; fi < nf; fi++) {
    const f = sp.frames[Math.floor(fi * sp.frames.length / nf)];
    const c = document.createElement('canvas'); c.width = f.w; c.height = f.h;
    c.style.width = f.w * scale + 'px'; c.style.height = f.h * scale + 'px';
    const g = c.getContext('2d')!; const img = g.createImageData(f.w, f.h);
    for (let i = 0; i < f.w * f.h; i++) { if (!f.a[i]) continue; const v = f.rgb[i]; img.data[i*4]=v&255; img.data[i*4+1]=(v>>8)&255; img.data[i*4+2]=(v>>16)&255; img.data[i*4+3]=f.a[i]; }
    g.putImageData(img, 0, 0); box.appendChild(c);
  }
  out.appendChild(box);
}
(window as any).__done = true;
