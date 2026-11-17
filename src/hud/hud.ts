// The dive computer (top right) and the true-scale depth ribbon (right edge).
import { MAX_DEPTH, type DepthMap } from '../engine/depth';
import { pressureBar, tempC, light, zoneOf, lungs, ZONES } from '../engine/env';
import { settings, dive, fmtDepth, fmtPressure, fmtTemp, verdict, testDepth, usageDepth, depthStr } from '../engine/state';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

export class Hud {
  root = $('hud');
  depth = $('hudDepth');
  unit = $('hudDepthUnit');
  zone = $('hudZone');
  pres = $('hudPressure');
  presU = $('hudPressureUnit');
  temp = $('hudTemp');
  light = $('hudLight');
  time = $('hudTime');
  lungsEl = $('hudLungs');
  cupEl = $('hudCup');
  mine = $('hudMine');
  mineName = $('hudMineName');
  mineVerdict = $('hudMineVerdict');
  mineDot = $('hudMineDot');
  hint = $('hudHint');
  bezel = this.root.querySelector('.hud__bezel') as SVGGElement;
  hH = this.root.querySelector('.hand--h') as SVGPathElement;
  hM = this.root.querySelector('.hand--m') as SVGPathElement;
  hS = this.root.querySelector('.hand--s') as SVGPathElement;
  last = { d: -1, zone: '', level: -1, sec: -1 };
  bezelAngle = 0;

  constructor() {
    // bezel: 60 ticks, triangles every 5, numbers at 10s rendered as bars
    const ticks = $('bezelTicks');
    let s = '';
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * 360;
      const major = i % 5 === 0;
      if (i === 0) continue;
      s += `<rect x="49.4" y="${major ? 5.5 : 6}" width="${major ? 1.4 : 0.6}" height="${major ? 5 : 2.6}" fill="${i <= 15 ? '#e9eef0' : '#c9d0d4'}" transform="rotate(${a} 50 50)"/>`;
    }
    ticks.innerHTML = s;
    const marks = $('dialMarks');
    let m = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * 360;
      if (i === 0) m += `<path class="lume" d="M46.5 17 h7 l-3.5 5z" transform="rotate(${a} 50 50)"/>`;
      else if (i % 3 === 0) m += `<rect class="lume" x="48.6" y="17" width="2.8" height="6.5" rx="0.6" transform="rotate(${a} 50 50)"/>`;
      else m += `<circle class="lume" cx="50" cy="19.5" r="2.1" transform="rotate(${a} 50 50)"/>`;
    }
    marks.innerHTML = m;
    this.root.querySelector('.hud__toggle')!.addEventListener('click', (e) => {
      const b = e.currentTarget as HTMLButtonElement;
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open));
      this.root.classList.toggle('is-open', open);
    });
  }

  setBezel(now: Date) {
    // line the bezel's zero up with the minute hand, like a diver does before going in
    this.bezelAngle = ((now.getMinutes() + now.getSeconds() / 60) / 60) * 360;
    this.bezel.style.transform = `rotate(${this.bezelAngle}deg)`;
  }

  update(d: number, now: number) {
    const date = new Date();
    const sec = date.getSeconds() + date.getMilliseconds() / 1000;
    const min = date.getMinutes() + sec / 60;
    const hr = (date.getHours() % 12) + min / 60;
    this.hH.setAttribute('transform', `rotate(${hr * 30} 50 50)`);
    this.hM.setAttribute('transform', `rotate(${min * 6} 50 50)`);
    this.hS.setAttribute('transform', `rotate(${(settings.reduced ? Math.floor(sec) : sec) * 6} 50 50)`);
    const r = Math.round(d * (d < 20 ? 10 : 1)) / (d < 20 ? 10 : 1);
    if (r !== this.last.d) {
      this.last.d = r;
      const f = fmtDepth(d);
      this.depth.textContent = d > 0.4 && d < 20 && settings.units === 'm' ? d.toFixed(1) : f.n;
      this.unit.textContent = f.u;
      const p = fmtPressure(pressureBar(d));
      this.pres.textContent = p.n >= 100 ? Math.round(p.n).toLocaleString('en-US') : p.n.toFixed(1);
      this.presU.textContent = p.u;
      this.temp.textContent = fmtTemp(tempC(d));
      const l = light(d) * 100;
      this.light.textContent = d >= 1000 ? '0%' : l >= 1 ? `${Math.round(l)}%` : l > 0.0001 ? '<1%' : '0%';
      const z = d <= 0.3 ? 'Surface' : `${zoneOf(d)} zone`;
      if (z !== this.last.zone) {
        this.last.zone = z;
        this.zone.textContent = z;
      }
      this.lungsEl.style.transform = `scale(${Math.sqrt(lungs(d)).toFixed(3)})`;
      const cup = Math.max(0.36, 1 - 0.64 * Math.min(1, d / 2500));
      this.cupEl.style.transform = `scale(${cup.toFixed(3)})`;
      this.root.classList.toggle('is-dark', d > 220);
      this.root.classList.toggle('is-under', d > 0.3);
      this.updateMine(d);
    }
    if (dive.started) {
      const s = Math.floor((now - dive.startTime) / 1000);
      if (s !== this.last.sec) {
        this.last.sec = s;
        this.time.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      }
    }
  }

  updateMine(d: number) {
    const w = dive.watch;
    this.mine.hidden = !w;
    if (!w) { delete this.root.dataset.mine; return; }
    const v = verdict(w, d);
    this.mineName.textContent = w.name;
    this.mineVerdict.textContent = v.short;
    this.mine.dataset.level = String(v.level);
    this.root.dataset.mine = String(v.level);
    this.mine.title = v.long;
    this.last.level = v.level;
  }
}

export class Ribbon {
  root = $('ribbon');
  marker = $('ribbonMarker');
  label = $('ribbonLabel');
  tip = $('ribbonTip');
  ticks = $('ribbonTicks');
  limits = $('ribbonLimits');
  onJump: (id: string) => void = () => {};
  items: { id: string; depth: number; label: string; kind: string }[] = [];

  constructor() {
    const zones = $('ribbonZones');
    zones.innerHTML = ZONES.map((z) => `<span class="rz rz--${z.name.toLowerCase()}" style="top:${(z.from / MAX_DEPTH) * 100}%;height:${((Math.min(z.to, MAX_DEPTH) - z.from) / MAX_DEPTH) * 100}%"><i>${z.name}</i></span>`).join('');
    const track = this.root.querySelector('.ribbon__track') as HTMLElement;
    const near = (e: PointerEvent) => {
      const r = track.getBoundingClientRect();
      const d = ((e.clientY - r.top) / r.height) * MAX_DEPTH;
      let best = this.items[0];
      let bd = Infinity;
      // distance measured in screen pixels so the crowded top stays usable
      for (const it of this.items) {
        const dy = Math.abs((it.depth / MAX_DEPTH) * r.height - (e.clientY - r.top));
        if (dy < bd) { bd = dy; best = it; }
      }
      return { best, d, y: e.clientY - r.top };
    };
    track.addEventListener('pointermove', (e) => {
      const { best, y } = near(e);
      if (!best) return;
      this.tip.textContent = `${depthStr(best.depth)} · ${best.label}`;
      this.tip.style.top = `${y}px`;
      this.root.classList.add('is-hover');
    });
    track.addEventListener('pointerleave', () => this.root.classList.remove('is-hover'));
    track.addEventListener('click', (e) => {
      const { best } = near(e as PointerEvent);
      if (best) this.onJump(best.id);
    });
  }

  setItems(items: { id: string; depth: number; label: string; kind: string }[]) {
    this.items = items;
    this.ticks.innerHTML = items
      .map((it) => `<span class="rt rt--${it.kind}" style="top:${(it.depth / MAX_DEPTH) * 100}%"></span>`)
      .join('');
  }

  setLimits() {
    const w = dive.watch;
    if (!w) { this.limits.innerHTML = ''; return; }
    const u = usageDepth(w);
    const t = testDepth(w);
    this.limits.innerHTML = `<span class="rl rl--use" style="top:${(u / MAX_DEPTH) * 100}%"></span><span class="rl rl--rating" style="top:${(w.rating / MAX_DEPTH) * 100}%"></span><span class="rl rl--test" style="top:${(Math.min(t, MAX_DEPTH) / MAX_DEPTH) * 100}%"></span>`;
  }

  update(d: number) {
    this.marker.style.top = `${(Math.max(0, Math.min(MAX_DEPTH, d)) / MAX_DEPTH) * 100}%`;
    this.label.textContent = depthStr(d);
  }
}

export function zoneIndex(d: number) {
  return ZONES.findIndex((z) => d >= z.from && d < z.to);
}

export type { DepthMap };
