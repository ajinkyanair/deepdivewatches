// Interactive pieces of the story: Bring your watch, myths, dial decoder, carousels,
// the dive kit (logbook, compare, field guide, settings), toasts and the lume moment.
import { MODELS, DIAL_MARKS } from '../content/extras';
import { WATCHES, PLATES, watchById, plateById, USD_INR, FX_CHECKED } from '../content/watches';
import { CREATURES, creatureById } from '../content/creatures';
import { settings, dive, save, verdict, testDepth, useLabel, usageDepth, fmtPrice, depthStr, fmtInt, type MyWatch } from '../engine/state';
import { paintWatch, styleSpec } from '../pixel/watch';
import { buildSprite } from '../world/sprite';
import { ART } from '../world/art';
import { track } from './analytics';

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll(sel)) as T[];

// ───── toasts ─────
export function toast(text: string, kind = '') {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = text;
  box.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => {
    el.classList.remove('in');
    setTimeout(() => el.remove(), 500);
  }, 5200);
}

// ───── dialogs ─────
function openDialog(id: string) {
  const d = document.getElementById(`dlg-${id}`) as HTMLDialogElement;
  if (!d || d.open) return d;
  d.showModal();
  return d;
}

export function setupDialogs(onJump: (id: string) => void) {
  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-open]');
    if (!t) return;
    e.preventDefault();
    const id = t.dataset.open!;
    if (id === 'kit') openKit(t.dataset.tab || 'logbook');
    else if (id === 'byw') {
      openDialog('byw');
      ($('#bywSearch') as HTMLInputElement).focus();
      track('byw_open');
    }
  });
  // close on backdrop click
  for (const d of $$<HTMLDialogElement>('dialog')) {
    d.addEventListener('click', (e) => {
      if (e.target === d) d.close();
    });
  }
  // tabs
  for (const b of $$('.tabs [role=tab]')) b.addEventListener('click', () => selectTab(b.dataset.tab!));
  // logbook jumps
  $('#dlg-kit').addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-jump]');
    if (!a) return;
    e.preventDefault();
    ($('#dlg-kit') as HTMLDialogElement).close();
    onJump(a.dataset.jump!);
  });
}

export function openKit(tab: string) {
  openDialog('kit');
  selectTab(tab);
  track('kit_open', { tab });
}

function selectTab(tab: string) {
  for (const b of $$('.tabs [role=tab]')) b.setAttribute('aria-selected', String(b.dataset.tab === tab));
  for (const p of $$('.tabpanel')) p.hidden = p.id !== `tab-${tab}`;
  if (tab === 'compare') renderCompare();
  if (tab === 'field') renderFieldList();
}

// ───── Bring your watch ─────
export function setupByw(onChange: () => void) {
  const input = $('#bywSearch') as HTMLInputElement;
  const list = $('#bywResults');
  const render = () => {
    const q = input.value.trim().toLowerCase();
    const hits = (q ? MODELS.filter((m) => m.name.toLowerCase().includes(q)) : MODELS.slice(0, 8)).slice(0, 8);
    list.innerHTML = hits
      .map((m, i) => `<li><button type="button" role="option" data-model="${MODELS.indexOf(m)}" ${i === 0 ? 'class="first"' : ''}><span>${m.name}</span><small>${fmtInt(m.rating)}m${m.diver ? ' · Diver’s' : ''}</small></button></li>`)
      .join('') || '<li class="none">No match. Pick the number on your dial below.</li>';
  };
  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); ($('button.first', list) as HTMLButtonElement)?.click(); }
  });
  render();
  const set = (w: MyWatch | null) => {
    dive.watch = w;
    save();
    onChange();
    paintMine();
    if (w) {
      toast(`${w.name} is riding along. Rated ${fmtInt(w.rating)}m, built for ${useLabel(usageDepth(w))}.`);
      track('byw_set', { rating: w.rating, diver: w.diver, name: w.name });
    }
  };
  list.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-model]');
    if (!b) return;
    const m = MODELS[+b.dataset.model!];
    set({ name: m.name, rating: m.rating, diver: m.diver, use: m.use, style: m.style });
    ($('#dlg-byw') as HTMLDialogElement).close();
  });
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-byw-rating]');
    if (b) {
      const r = +b.dataset.bywRating!;
      const sel = (document.querySelector('input[name=diver]:checked') as HTMLInputElement | null)?.value;
      const diver = sel === 'yes' ? true : sel === 'no' ? false : r >= 200;
      set({ name: r < 30 ? '“Water resist” watch' : `Your ${fmtInt(r)}m watch`, rating: r, diver, style: r >= 200 ? 'diver' : 'sport' });
      ($('#dlg-byw') as HTMLDialogElement).close();
    }
    if ((e.target as HTMLElement).closest('[data-byw-clear]')) {
      set(null);
      ($('#dlg-byw') as HTMLDialogElement).close();
    }
    if ((e.target as HTMLElement).closest('[data-byw-skip]')) {
      const inl = $('[data-byw-inline]');
      inl.classList.add('is-skipped');
      track('byw_skip');
    }
  });
  paintMine();
}

export function paintMine() {
  const w = dive.watch;
  const cur = $('.byw-current');
  if (cur) {
    cur.hidden = !w;
    if (w) cur.innerHTML = `Riding along: <b>${w.name}</b>, rated ${fmtInt(w.rating)}m${w.diver ? ' (Diver’s)' : ''}. Built for ${useLabel(usageDepth(w))}; tested to ${fmtInt(testDepth(w))}m. <button type="button" class="link" data-open="byw">Change</button>`;
  }
  for (const b of $$('[data-byw-rating]')) b.classList.toggle('is-on', !!w && +b.dataset.bywRating! === w.rating);
  const c = $('.pxwatch--mine') as HTMLCanvasElement;
  if (w && c) {
    c.width = 40;
    c.height = 40;
    paintWatch(c, styleSpec(w.style, w.rating), `mine-${w.style}-${w.rating}`);
  }
}

/** Crossing your watch's limits on the way down. On a big jump, only the most serious one is announced. */
export function bywMilestones(d: number, prevD: number) {
  const w = dive.watch;
  if (!w || d <= prevD) return;
  const u = usageDepth(w);
  const T = testDepth(w);
  const crossed = (x: number) => prevD < x && d >= x;
  if (crossed(T)) {
    toast(`This is where your ${w.name} gives up: its test stopped at ${fmtInt(T)}m.`, 'danger');
    track('byw_flooded', { depth: Math.round(T) });
  } else if (crossed(w.rating)) toast(`Your ${w.name} just passed its ${fmtInt(w.rating)}m rating.`, 'warn');
  else if (u > 0 && crossed(u)) toast(`You’re now past what your ${w.name} is built for: ${useLabel(u)}.`, 'warn');
}

// ───── Myths ─────
export function setupMyths() {
  for (const b of $$('.myth')) {
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      if (on) track('myth_flip', { id: b.dataset.myth });
    });
  }
}

// ───── Dial decoder ─────
export function setupDecoder() {
  const root = $('.decoder');
  if (!root) return;
  root.classList.add('is-live');
  const c = $('.decoder__canvas', root) as HTMLCanvasElement;
  c.width = 96;
  c.height = 96;
  paintWatch(c, { caseColor: '#b9bec4', bezel: 'dive', bezelColor: '#111', bezelAccent: '#1f3f99', dial: '#0f1720', index: 'dots', hands: 'mercedes', hev: true, lume: '#d8f5c8' }, 'decoder');
  const out = document.createElement('p');
  out.className = 'decoder__out';
  out.setAttribute('aria-live', 'polite');
  root.appendChild(out);
  const pick = (id: string) => {
    const m = DIAL_MARKS.find((x) => x.id === id)!;
    out.innerHTML = `<b>${m.text}</b> ${m.meaning}`;
    for (const b of $$('.decoder__mark', root)) b.classList.toggle('is-on', b.dataset.mark === id);
  };
  for (const b of $$('.decoder__mark', root)) b.addEventListener('click', () => { pick(b.dataset.mark!); track('decoder', { mark: b.dataset.mark }); });
  pick('divers');
}

// ───── Watch tiers: carousel dots on phones ─────
export function setupTiers() {
  for (const track_ of $$('.tier__track')) {
    const dots = track_.parentElement!.querySelector('.tier__dots');
    if (!dots) continue;
    track_.addEventListener('scroll', () => {
      const cards = $$('.watch', track_);
      const mid = track_.scrollLeft + track_.clientWidth / 2;
      let best = 0;
      cards.forEach((c, i) => { if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid)) best = i; });
      $$('span', dots as HTMLElement).forEach((s, i) => s.classList.toggle('on', i === best));
    }, { passive: true });
  }
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-compare]');
    if (!b) return;
    const sel = $('#cmpA') as HTMLSelectElement;
    const selB = $('#cmpB') as HTMLSelectElement;
    if (sel.value === b.dataset.compare) selB.value = b.dataset.compare!;
    else { selB.value = sel.value; sel.value = b.dataset.compare!; }
    openKit('compare');
    track('compare_add', { id: b.dataset.compare });
  });
}

// ───── Prices follow the currency setting ─────
export function paintPrices() {
  for (const el of $$('[data-usd]')) el.textContent = fmtPrice(+el.dataset.usd!);
  $('#fxNote').textContent = settings.cur === 'INR' ? `Rupee prices are US list prices converted at ₹${USD_INR} per dollar (${FX_CHECKED}). Indian retail prices include duties and are usually higher.` : '';
}

// ───── Compare ─────
function itemFor(id: string) {
  const w = watchById(id);
  if (w) return { id, name: `${w.brand} ${w.model}`, rating: w.rating, w };
  const p = plateById(id)!;
  return { id, name: `${p.brand} ${p.model}`, rating: p.rating || 0, p };
}

export function setupCompare() {
  const a = $('#cmpA') as HTMLSelectElement;
  const b = $('#cmpB') as HTMLSelectElement;
  a.value = 'seiko-5-sports';
  b.value = 'rolex-deepsea-challenge';
  a.addEventListener('change', renderCompare);
  b.addEventListener('change', renderCompare);
}

function renderCompare() {
  const out = $('#cmpOut');
  const ids = [($('#cmpA') as HTMLSelectElement).value, ($('#cmpB') as HTMLSelectElement).value];
  const items = ids.map(itemFor);
  const max = Math.max(...items.map((i) => i.rating), 1);
  out.innerHTML = items
    .map((it) => {
      const w = it.w;
      const p = it.p;
      const img = w?.image
        ? `<img src="images/watches/${w.id}-s.webp" alt="" width="120" height="186">`
        : `<canvas class="pxwatch" width="80" height="80" data-cmp="${it.id}"></canvas>`;
      const rows: [string, string][] = w
        ? [
            ['Rated', depthStr(w.rating)],
            ['Standard', { iso6425: 'Diver’s (ISO 6425)', iso2281: 'Water resistant', dnv: 'DNV certified', maker: 'Maker’s rating' }[w.standard]],
            ['Price', w.price.usd ? fmtPrice(w.price.usd) : w.price.local ? `${w.price.local.currency} ${fmtInt(w.price.local.amount)}` : '—'],
            ['Case', `${w.caseMm}mm ${w.material}`],
            ['Movement', w.movement],
          ]
        : [
            ['Rated', it.rating ? depthStr(it.rating) : '—'],
            ['Year', p!.year],
            ['Price', p!.price?.usd ? fmtPrice(p!.price.usd) : '—'],
          ];
      return `<div class="cmp__col"><div class="cmp__img">${img}</div><h3>${it.name}</h3>
<div class="cmp__bar"><span style="width:${(Math.log10(Math.max(10, it.rating)) / Math.log10(Math.max(10, max))) * 100}%"></span></div>
<dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>${p ? `<p class="fine">${p.caption}</p>` : ''}</div>`;
    })
    .join('');
  const [x, y] = items;
  const ratio = x.rating && y.rating ? Math.max(x.rating, y.rating) / Math.min(x.rating, y.rating) : 0;
  if (ratio > 1.01) out.insertAdjacentHTML('beforeend', `<p class="cmp__note">One is rated ${ratio >= 10 ? Math.round(ratio) : ratio.toFixed(1)} times deeper than the other. Bars are on a log scale.</p>`);
  for (const c of $$<HTMLCanvasElement>('canvas[data-cmp]', out)) {
    const p = plateById(c.dataset.cmp!);
    if (p) paintWatch(c, p.pixel, `plate-${p.id}`);
  }
}

// ───── Field guide ─────
const spriteCache = new Map<string, ReturnType<typeof buildSprite>>();
function spriteFor(id: string) {
  const map: Record<string, string> = { diver: 'diver', freediver: 'freediver', techdiver: 'techdiver', submarine: 'submarine' };
  const sid = map[id] || id;
  if (!spriteCache.has(sid)) {
    const spec = ART.find((s) => s.id === sid);
    if (!spec) return null;
    spriteCache.set(sid, buildSprite(spec));
  }
  return spriteCache.get(sid)!;
}

function paintSprite(c: HTMLCanvasElement, id: string) {
  const sp = spriteFor(id);
  if (!sp) return;
  const f = sp.frames[0];
  c.width = f.w;
  c.height = f.h;
  const g = c.getContext('2d')!;
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

export function openField(id: string) {
  const c = creatureById(id);
  if (!c) return;
  $('#fieldName').textContent = c.name;
  $('#fieldLatin').textContent = c.latin || '';
  $('#fieldRange').textContent = c.range[0] === c.range[1] ? depthStr(c.range[0]) : `${depthStr(c.range[0])} – ${depthStr(c.range[1])}`;
  $('#fieldFact').textContent = c.fact;
  const tr = $('#fieldTrick');
  tr.hidden = !c.trick;
  tr.textContent = c.trick ? `Nature’s trick: ${c.trick}` : '';
  paintSprite($('#fieldSprite') as HTMLCanvasElement, id);
  openDialog('field');
  track('field_open', { id });
}

export function setupField() {
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-field]');
    if (b) openField(b.dataset.field!);
    const li = (e.target as HTMLElement).closest<HTMLElement>('[data-fg]');
    if (li) openField(li.dataset.fg!);
  });
}

let fieldPainted = false;
function renderFieldList() {
  if (!fieldPainted) {
    for (const c of $$<HTMLCanvasElement>('canvas[data-sprite]')) paintSprite(c, c.dataset.sprite!);
    fieldPainted = true;
  }
  for (const li of $$('[data-fg]')) li.classList.toggle('is-seen', dive.spotted.has(li.dataset.fg!));
  $('#fgCount').textContent = `You’ve spotted ${dive.spotted.size} of ${CREATURES.length}. Tap any creature for its card, or tap one in the water.`;
}

export function markSpotted(id: string) {
  if (!creatureById(id) || dive.spotted.has(id)) return;
  dive.spotted.add(id);
  save();
}

// ───── Plates and other pixel canvases ─────
export function paintPixels() {
  for (const c of $$<HTMLCanvasElement>('canvas.pxwatch[data-plate]')) {
    const p = plateById(c.dataset.plate!);
    if (p) paintWatch(c, p.pixel, `plate-${p.id}`);
  }
  for (const c of $$<HTMLCanvasElement>('canvas.pxwatch[data-watch]')) {
    const w = watchById(c.dataset.watch!);
    if (w) paintWatch(c, w.pixel, `w-${w.id}`);
  }
}

// ───── Lume moment: in the dark, a watch shows its lume first, then lights up ─────
export function setupLume(getDepth: () => number) {
  const seen = new WeakSet<Element>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting || seen.has(en.target)) continue;
        seen.add(en.target);
        if (getDepth() < 1000 || settings.reduced) continue;
        const fig = en.target as HTMLElement;
        const img = fig.querySelector('img');
        if (!img) continue;
        const l = img.cloneNode() as HTMLImageElement;
        l.className = 'watch__lume';
        l.alt = '';
        l.removeAttribute('loading');
        fig.appendChild(l);
        fig.classList.add('is-lume');
        setTimeout(() => fig.classList.add('is-lit'), 650);
        setTimeout(() => { fig.classList.remove('is-lume', 'is-lit'); l.remove(); }, 1700);
      }
    },
    { threshold: 0.55 },
  );
  for (const f of $$('.watch__fig')) io.observe(f);
}

// ───── Finale ─────
export function paintFinale() {
  const time = $('[data-stat=time] dd');
  if (time && dive.started) {
    const s = Math.floor((performance.now() - dive.startTime) / 1000);
    time.textContent = `${Math.floor(s / 60)} min ${s % 60} s`;
  }
  const sp = $('[data-stat=species] dd');
  if (sp) sp.textContent = `${dive.spotted.size} of ${CREATURES.length}`;
  const w = $('[data-stat=watch] dd');
  if (w) {
    const m = dive.watch;
    if (!m) w.innerHTML = '<button class="link" type="button" data-open="byw">Bring one</button>';
    else {
      const T = testDepth(m);
      w.textContent = T >= 10935 ? `${m.name}: made it` : `${m.name}: gave up at ${depthStr(T)}`;
    }
  }
}

export function allWatchCount() {
  return WATCHES.length + PLATES.length;
}

export { verdict };
