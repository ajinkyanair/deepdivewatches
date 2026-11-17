// True-scale replay: the whole descent at constant speed, so the emptiness of the deep is felt.
import { WATCHES, PLATES } from '../content/watches';
import { waterRGB } from '../engine/env';
import { depthStr, settings } from '../engine/state';
import { MAX_DEPTH } from '../engine/depth';
import { track } from './analytics';

const LANDMARKS: [number, string][] = [
  [40, 'Recreational scuba limit'],
  [93, 'Statue of Liberty'],
  [214, 'Deepest freedive'],
  [332, 'Deepest scuba dive'],
  [534, 'Deepest open-sea working dive'],
  [828, 'Burj Khalifa'],
  [1000, 'Sunlight is gone'],
  [3800, 'Titanic'],
  [3700, 'Average ocean depth'],
  [6000, 'Hadal zone: the trenches'],
  [8336, 'Deepest fish ever filmed'],
  [8849, 'Everest would fit here'],
  [10898, 'A plastic bag'],
];

export class Replay {
  root = document.getElementById('replay')!;
  cv = document.getElementById('replayCanvas') as HTMLCanvasElement;
  dEl = document.getElementById('replayDepth')!;
  lEl = document.getElementById('replayLabel')!;
  intro = document.getElementById('replayIntro')!;
  speedBtn = document.getElementById('replaySpeed')!;
  running = false;
  speed = 1;
  d = 0;
  last = 0;
  events: [number, string][] = [];
  shownUntil = 0;
  onClose: () => void = () => {};

  constructor() {
    const ws: [number, string][] = WATCHES.map((w) => [w.rating, `${w.brand} ${w.model}`]);
    const ps: [number, string][] = PLATES.filter((p) => p.rating).map((p) => [p.rating!, `${p.brand} ${p.model}`]);
    this.events = [...ws, ...ps, ...LANDMARKS].sort((a, b) => a[0] - b[0]);
    this.root.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-replay]');
      if (!b) return;
      if (b.dataset.replay === 'close') this.close();
      if (b.dataset.replay === 'speed') {
        this.speed = this.speed === 1 ? 4 : this.speed === 4 ? 16 : 1;
        this.speedBtn.textContent = `${this.speed}×`;
      }
    });
    addEventListener('keydown', (e) => {
      if (this.running && e.key === 'Escape') this.close();
    });
  }

  open() {
    this.root.hidden = false;
    this.running = true;
    this.d = 0;
    this.speed = 1;
    this.speedBtn.textContent = '1×';
    this.intro.textContent = 'Every metre now takes the same time: 11 kilometres in one minute.';
    this.intro.classList.remove('is-out');
    this.last = performance.now();
    document.documentElement.classList.add('is-replay');
    track('replay_open');
    requestAnimationFrame(this.tick);
  }

  close() {
    this.running = false;
    this.root.hidden = true;
    document.documentElement.classList.remove('is-replay');
    this.onClose();
  }

  tick = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    const rate = MAX_DEPTH / 60; // metres per second at 1×
    const prev = this.d;
    this.d = Math.min(MAX_DEPTH, this.d + rate * dt * (settings.reduced ? 4 : this.speed));
    if (this.d > 400) this.intro.classList.add('is-out');
    for (const [depth, label] of this.events) {
      if (prev < depth && this.d >= depth) {
        this.lEl.textContent = label;
        this.lEl.classList.remove('is-pop');
        void this.lEl.offsetWidth;
        this.lEl.classList.add('is-pop');
        this.shownUntil = now + 1400;
      }
    }
    if (now > this.shownUntil) this.lEl.textContent = '';
    this.dEl.textContent = depthStr(this.d);
    this.draw(now / 1000);
    if (this.d >= MAX_DEPTH) {
      const shallow = WATCHES.filter((w) => w.rating <= MAX_DEPTH / 10).length;
      this.lEl.textContent = '';
      this.intro.textContent = `${shallow} of the ${WATCHES.length} watches on this page are rated for less than a tenth of this. Most of the ocean looks like the last 50 seconds.`;
      this.intro.classList.remove('is-out');
      this.running = false;
      track('replay_done');
      return;
    }
    requestAnimationFrame(this.tick);
  };

  draw(t: number) {
    const cv = this.cv;
    const w = (cv.width = Math.ceil(innerWidth / 3));
    const h = (cv.height = Math.ceil(innerHeight / 3));
    const g = cv.getContext('2d')!;
    // the view spans 120m of water: a true-scale window onto the column
    const span = 120;
    for (let y = 0; y < h; y++) {
      const d = this.d + (y / h - 0.5) * span;
      const [r, gg, b] = waterRGB(Math.max(0, d));
      g.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
      g.fillRect(0, y, w, 1);
    }
    // marine snow rising past you
    g.fillStyle = 'rgba(160,190,200,0.5)';
    for (let k = 0; k < 120; k++) {
      const x = ((k * 97) % w) + Math.sin(t + k) * 2;
      const y = (((k * 53) % h) - ((this.d * h) / span)) % h;
      g.fillRect(x | 0, (y < 0 ? y + h : y) | 0, 1, 1);
    }
    // depth scale ticks every 10m
    g.fillStyle = 'rgba(200,240,255,0.25)';
    for (let m = Math.floor((this.d - span / 2) / 10) * 10; m < this.d + span / 2; m += 10) {
      const y = ((m - this.d) / span + 0.5) * h;
      g.fillRect(0, y | 0, m % 100 === 0 ? 10 : 4, 1);
    }
    // a progress strip down the right edge, true scale
    g.fillStyle = 'rgba(255,255,255,0.12)';
    g.fillRect(w - 3, 4, 1, h - 8);
    g.fillStyle = '#59e4ff';
    g.fillRect(w - 4, 4 + (this.d / MAX_DEPTH) * (h - 8) - 1, 3, 3);
  }
}
