import './styles/fonts.css';
import './styles/main.css';
import Lenis from 'lenis';
import { DepthMap, layout, MAX_DEPTH } from './engine/depth';
import { settings, dive, load, save, depthStr, fmtInt, testDepth } from './engine/state';
import { Hud, Ribbon, zoneIndex } from './hud/hud';
import { World, type ViewState } from './world/renderer';
import type { Anchor } from './world/actors';
import { paintBuild } from './pixel/build';
import { paintTruescale } from './pixel/landmarks';
import { Replay } from './features/replay';
import { track, depthMilestones, collective, reportMaxDepth } from './features/analytics';
import {
  setupDialogs, setupByw, setupMyths, setupDecoder, setupTiers, setupCompare, setupField, setupLume,
  paintPrices, paintPixels, paintFinale, markSpotted, openField, openKit, toast, bywMilestones, paintMine,
} from './features/ui';

load();
document.documentElement.classList.add('js');
document.documentElement.classList.toggle('is-reduced', settings.reduced);

const story = document.getElementById('story')!;
const hero = document.getElementById('hero')!;
const stops = Array.from(story.querySelectorAll<HTMLElement>('.stop'));
const map = new DepthMap();
const hud = new Hud();
const ribbon = new Ribbon();
const world = new World(document.getElementById('world') as HTMLCanvasElement, map);
const replay = new Replay();

let vw = innerWidth;
let vh = innerHeight;
let laid: ReturnType<typeof layout> = [];
let lenis: Lenis | null = null;

// ───────── layout ─────────
function waterline() {
  return hero.offsetTop + vh * 0.3;
}

function relayout() {
  vw = innerWidth;
  vh = innerHeight;
  laid = layout(stops, story, waterline(), vh, map);
  const anchors: Anchor[] = laid.map((l) => {
    const r = l.el.getBoundingClientRect();
    return {
      stop: l.el.id,
      centre: l.centre,
      top: r.top + scrollY,
      bottom: r.bottom + scrollY,
      side: [...l.el.classList].find((c) => c.startsWith('side--'))?.slice(6) || 'center',
      depth: l.depth,
    };
  });
  world.actors.setAnchors(anchors);
  ribbon.setItems(
    laid.filter((l) => l.el.dataset.nav).map((l) => ({
      id: l.el.id,
      depth: l.depth,
      label: l.el.dataset.nav!,
      kind: l.el.dataset.kind === 'watches' || l.el.dataset.kind === 'plates' ? 'watch' : l.el.dataset.kind === 'nature' ? 'life' : l.el.dataset.kind === 'chapter' ? 'chapter' : 'fact',
    })),
  );
  lenis?.resize();
  // a deep link keeps its place while fonts and images settle, until the reader scrolls
  if (pendingHash) jump(pendingHash, false);
}

let pendingHash = '';
for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) addEventListener(ev, () => { pendingHash = ''; }, { passive: true, once: true });

let relayoutQueued = false;
function queueRelayout() {
  if (relayoutQueued) return;
  relayoutQueued = true;
  requestAnimationFrame(() => {
    relayoutQueued = false;
    relayout();
  });
}

// ───────── navigation ─────────
function targetFor(idOrDepth: string): number | null {
  const m = idOrDepth.match(/^(\d+(?:\.\d+)?)m$/);
  if (m) return map.yAt(Math.min(MAX_DEPTH, +m[1])) - vh / 2;
  const l = laid.find((x) => x.el.id === idOrDepth);
  if (l) return l.centre - vh / 2;
  const el = document.getElementById(idOrDepth);
  const host = el?.closest<HTMLElement>('.stop');
  const hl = host && laid.find((x) => x.el === host);
  if (hl) return hl.centre - vh / 2;
  if (el) return el.getBoundingClientRect().top + scrollY - vh * 0.2;
  return null;
}

function jump(idOrDepth: string, smooth = true) {
  const y = targetFor(idOrDepth);
  if (y == null) return;
  if (lenis && smooth && !settings.reduced) lenis.scrollTo(y, { duration: Math.min(2.4, 0.8 + Math.abs(y - scrollY) / 8000) });
  else scrollTo({ top: y, behavior: 'auto' });
}
ribbon.onJump = (id) => { jump(id); track('ribbon_jump', { id }); };

function stopIndexAtFocus() {
  const f = scrollY + vh / 2;
  let i = 0;
  for (let k = 0; k < laid.length; k++) if (laid[k].centre <= f + 4) i = k;
  return i;
}

function step(dir: number, chaptersOnly = false) {
  let i = stopIndexAtFocus();
  const f = scrollY + vh / 2;
  if (dir > 0 && laid[i] && laid[i].centre < f - 20) i--; // currently between stops
  for (let k = i + dir; k >= 0 && k < laid.length; k += dir) {
    if (chaptersOnly && laid[k].el.dataset.kind !== 'chapter') continue;
    if (laid[k].el.dataset.kind === 'marker' || laid[k].el.dataset.kind === 'line') continue;
    jump(laid[k].el.id);
    return;
  }
}

// ───────── ascent ─────────
let ascending = false;
function ascend() {
  if (ascending) return;
  ascending = true;
  track('ascend', { from: Math.round(dive.maxDepth) });
  const box = document.getElementById('ascent')!;
  const text = document.getElementById('ascentText')!;
  box.hidden = false;
  const lines = ['Ascending', 'Decompression stop: 21m', '9m', '6m', '3m', 'Ahmed Gabr needed almost 15 hours for this. You get four seconds.'];
  lines.forEach((l, i) => setTimeout(() => { text.textContent = l; }, i * 620));
  const done = () => {
    ascending = false;
    box.hidden = true;
    dive.ascended = true;
    welcome();
  };
  if (lenis && !settings.reduced) lenis.scrollTo(0, { duration: 4, easing: (t: number) => 1 - Math.pow(1 - t, 3), onComplete: () => setTimeout(done, 400) });
  else { scrollTo(0, 0); setTimeout(done, 400); }
}

function welcome() {
  const w = document.getElementById('welcome')!;
  const t = document.getElementById('welcomeText')!;
  const parts = [`You went ${depthStr(dive.maxDepth)} down`];
  if (dive.watch) {
    const T = testDepth(dive.watch);
    parts.push(T >= MAX_DEPTH ? `and your ${dive.watch.name} came back with you` : `and your ${dive.watch.name} gave up at ${depthStr(T)}`);
  }
  t.textContent = `${parts.join(' ')}. You spotted ${dive.spotted.size} kinds of life on the way.`;
  w.hidden = false;
}

// ───────── input ─────────
const pointer = { x: 0, y: 0, active: false, touch: false };
let touchTimer = 0;
addEventListener('pointermove', (e) => {
  if (!settings.torch) return;
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.touch = e.pointerType === 'touch';
  pointer.active = true;
  if (pointer.touch) { clearTimeout(touchTimer); touchTimer = window.setTimeout(() => (pointer.active = false), 1500); }
}, { passive: true });
addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || !settings.torch) return;
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.active = true;
  pointer.touch = true;
}, { passive: true });
document.addEventListener('pointerleave', () => { if (!pointer.touch) pointer.active = false; });

// tap a creature in the water for its field-guide card
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('button, a, input, select, label, dialog, .card, .watch, .plate, .hud, .ribbon, .topbar, .comp__head, .myths, .decoder, .ladder, .history, .same, .five, .finale, .zone, .chapter__title, .chapter__problem, .tier__head, .swatch')) return;
  const id = world.actors.hit(e.clientX, e.clientY);
  if (id) openField(id);
});

addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.metaKey || e.ctrlKey || e.altKey) return;
  if (document.querySelector('dialog[open]')) return;
  const k = e.key.toLowerCase();
  if (k === 'j') step(1);
  else if (k === 'k') step(-1);
  else if (k === 'n') step(1, true);
  else if (k === 'p') step(-1, true);
  else if (k === 'r') replay.open();
  else if (k === '.') openKit('logbook');
  else return;
  e.preventDefault();
});

document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!a) return;
  const act = a.dataset.action;
  if (act === 'begin') { e.preventDefault(); jump('briefing'); }
  if (act === 'surface') { e.preventDefault(); if (scrollY > vh) ascend(); else scrollTo({ top: 0, behavior: 'smooth' }); }
  if (act === 'ascend') ascend();
  if (act === 'replay') replay.open();
});

// ───────── settings ─────────
function applySettings() {
  for (const r of document.querySelectorAll<HTMLInputElement>('.settings input[type=radio]')) r.checked = (settings as Record<string, unknown>)[r.name] === r.value;
  (document.querySelector('input[name=motion]') as HTMLInputElement).checked = settings.reduced;
  (document.querySelector('input[name=torch]') as HTMLInputElement).checked = settings.torch;
  (document.querySelector('input[name=haptics]') as HTMLInputElement).checked = settings.haptics;
  document.documentElement.classList.toggle('is-reduced', settings.reduced);
  paintPrices();
  hud.last.d = -1;
}
document.querySelector('.settings')!.addEventListener('change', (e) => {
  const t = e.target as HTMLInputElement;
  if (t.type === 'radio') (settings as Record<string, unknown>)[t.name] = t.value;
  if (t.name === 'motion') {
    settings.reduced = t.checked;
    if (settings.reduced) { lenis?.destroy(); lenis = null; } else startLenis();
  }
  if (t.name === 'torch') settings.torch = t.checked;
  if (t.name === 'haptics') settings.haptics = t.checked;
  save();
  applySettings();
  track('setting', { name: t.name, value: t.type === 'checkbox' ? t.checked : t.value });
});

function startLenis() {
  if (settings.reduced || lenis) return;
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9, smoothWheel: true, syncTouch: false });
}

// ───────── boot ─────────
function boot() {
  setupDialogs((id) => jump(id));
  setupByw(() => { ribbon.setLimits(); hud.last.d = -1; });
  setupMyths();
  setupDecoder();
  setupTiers();
  setupCompare();
  setupField();
  paintPixels();
  for (const c of document.querySelectorAll<HTMLCanvasElement>('canvas.build')) paintBuild(c, c.dataset.part!);
  for (const c of document.querySelectorAll<HTMLCanvasElement>('canvas.truescale')) paintTruescale(c, c.dataset.landmark!, +c.dataset.height!);
  applySettings();
  paintMine();
  ribbon.setLimits();
  world.resize(innerWidth, innerHeight);
  world.actors.onSpotted = markSpotted;
  relayout();
  startLenis();
  setupLume(() => focusDepth);
  replay.onClose = () => track('replay_close');
  // reveal stops as they arrive
  const reveal = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('is-in'); reveal.unobserve(e.target); }
  }, { rootMargin: '0px 0px -12% 0px' });
  for (const s of stops) reveal.observe(s);
  const ro = new ResizeObserver(queueRelayout);
  for (const s of stops) ro.observe(s);
  // deep links: #300m or #stop-id
  const h = decodeURIComponent(location.hash.slice(1));
  if (h) { pendingHash = h; jump(h, false); setTimeout(() => (pendingHash = ''), 6000); }
  (window as unknown as { __ddw: object }).__ddw = { jump, map, world, relayout };
  requestAnimationFrame(frame);
}

let resizeT = 0;
addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = window.setTimeout(() => {
    if (Math.abs(innerWidth - vw) < 2 && Math.abs(innerHeight - vh) < 120) return; // mobile URL bar
    world.resize(innerWidth, innerHeight);
    relayout();
  }, 150);
});

// ───────── frame loop ─────────
let last = performance.now();
let focusDepth = 0;
let prevDepth = 0;
let prevZone = -1;
let hashT = 0;
let lastHash = '';
let visible = true;
document.addEventListener('visibilitychange', () => {
  visible = document.visibilityState === 'visible';
  if (visible) { last = performance.now(); requestAnimationFrame(frame); }
  else if (dive.maxDepth > 1) reportMaxDepth(dive.maxDepth);
});

function frame(now: number) {
  if (!visible) return;
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  lenis?.raf(now);
  const sy = scrollY;
  focusDepth = Math.max(0, map.depthAt(sy + vh / 2));

  // dive starts when you go under
  if (!dive.started && focusDepth > 0.3) {
    dive.started = true;
    dive.startTime = now;
    hud.setBezel(new Date());
    hud.root.classList.add('show-hint');
    setTimeout(() => hud.root.classList.remove('show-hint'), 9000);
    track('dive_start');
  }
  if (focusDepth > dive.maxDepth) {
    dive.maxDepth = focusDepth;
    if (Math.floor(focusDepth) % 25 === 0) save();
  }
  bywMilestones(focusDepth, prevDepth);
  depthMilestones(focusDepth);
  const z = zoneIndex(focusDepth);
  if (z !== prevZone && prevZone !== -1 && settings.haptics && !settings.reduced) navigator.vibrate?.(14);
  prevZone = z;
  if (!dive.bottom && focusDepth >= 10900) {
    dive.bottom = true;
    paintFinale();
    save();
    track('reached_bottom', { seconds: Math.round((now - dive.startTime) / 1000) });
    collective().then((c) => {
      if (!c) return;
      const p = document.querySelector('.finale__collective') as HTMLElement;
      p.textContent = `You went deeper than ${c.deeperThan(10935)}% of everyone who started this dive.`;
      p.hidden = false;
    });
  }
  if (dive.bottom && now % 1000 < 20) paintFinale();
  prevDepth = focusDepth;

  hud.update(focusDepth, now);
  ribbon.update(focusDepth);

  const s: ViewState = { scrollY: sy, vh, vw, time: now / 1000, dt, focusDepth, reduced: settings.reduced, pointer, torchEnabled: true };
  world.render(s);

  // keep the URL pointing at where you are (shareable)
  hashT += dt;
  if (hashT > 1 && !ascending) {
    hashT = 0;
    const i = stopIndexAtFocus();
    const id = focusDepth > 0.5 && laid[i] ? laid[i].el.id : '';
    if (id !== lastHash) {
      lastHash = id;
      history.replaceState(null, '', id ? `#${id}` : location.pathname + location.search);
    }
  }
  requestAnimationFrame(frame);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
// fonts change text heights: lay out again when they arrive
document.fonts?.ready.then(queueRelayout);
addEventListener('load', queueRelayout);

void fmtInt;
void toast;
