// True-scale comparisons: the water column from the surface down to you, with a landmark standing on the seabed.
import { buildSprite, poly, rect, line, ell } from '../world/sprite';
import { waterRGB } from '../engine/env';

const W = 40;
const H = 96;

function silhouette(g: CanvasRenderingContext2D, kind: string) {
  const top = 6;
  const base = H - 4;
  const ink = '#e9f4f7';
  if (kind === 'liberty') {
    rect(g, 13, base - 26, 14, 26, '#c9d6db'); // pedestal
    rect(g, 11, base - 4, 18, 4, '#aebfc5');
    poly(g, [16, base - 26, 24, base - 26, 23, base - 56, 21, base - 66, 19, base - 66, 17, base - 56], '#7fc4b4');
    ell(g, 20, base - 69, 3, 3.4, '#7fc4b4');
    poly(g, [23, base - 58, 26, base - 80, 28, base - 80, 25, base - 57], '#7fc4b4');
    ell(g, 27, top + 4, 2, 2.4, '#ffd36b');
  } else if (kind === 'eiffel') {
    poly(g, [8, base, 14, base, 20, top + 18, 26, base, 32, base, 21, top + 2, 19, top + 2], '#b5875a');
    line(g, [11, base - 22, 29, base - 22], '#b5875a', 1.4);
    line(g, [14, base - 50, 26, base - 50], '#b5875a', 1.2);
    rect(g, 19.5, top - 2, 1, 6, '#b5875a');
  } else if (kind === 'everest') {
    poly(g, [0, base, 14, top + 18, 18, top + 22, 23, top, 30, top + 16, 40, base], '#8b8f96');
    poly(g, [19, top + 8, 23, top, 27, top + 9, 24, top + 7, 21, top + 11], ink);
  }
}

export function paintTruescale(canvas: HTMLCanvasElement, kind: string, depth: number) {
  const sp = buildSprite({
    id: `ts-${kind}`, w: W, h: H, outline: false,
    draw(g) {
      // water column, coloured by real depth at each row
      for (let y = 0; y < H; y++) {
        const [r, gg, b] = waterRGB((y / H) * depth);
        rect(g, 0, y, W, 1, `rgb(${r | 0},${gg | 0},${b | 0})`);
      }
      rect(g, 0, 0, W, 1, '#c9f3ff');
      rect(g, 0, H - 3, W, 3, '#2b2620');
      silhouette(g, kind);
      // you, at the bottom
      ell(g, 34, H - 7, 1.6, 1.6, '#59e4ff');
    },
  });
  const f = sp.frames[0];
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
