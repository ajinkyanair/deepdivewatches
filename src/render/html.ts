// Build-time HTML for the story. Runs in Node (vite.config.ts) — no DOM here.
import { STOPS } from '../content/stops';
import { WATCHES, PLATES, watchById, plateById } from '../content/watches';
import { CREATURES, creatureById } from '../content/creatures';
import { MYTHS, LADDER, DIAL_MARKS, HISTORY, GLOSSARY, CARE } from '../content/extras';
import { SOURCES, sourceById } from '../content/sources';
import type { Stop, Watch, Plate, Price } from '../content/types';
import { imageName } from './images';
import { transmission, waterRGB } from '../engine/env';

export const esc = (s: string | number | undefined) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const fmtDepth = (d: number) => `${Math.round(d).toLocaleString('en-US')}m`;

const STANDARD_LABEL: Record<string, string> = {
  iso6425: 'Diver’s (ISO 6425)',
  iso2281: 'Water resistant',
  dnv: 'Certified by DNV',
  maker: 'Maker’s rating',
};

const BAND_LABEL: Record<string, string> = {
  entry: 'Under $1k',
  mid: '$1k–10k',
  luxury: '$10k–15k',
  ultra: '$15k+',
};

const STATUS_LABEL: Record<string, string> = {
  discontinued: 'Discontinued',
  limited: 'Limited',
  unavailable: 'Unavailable',
};

function priceHtml(p: Price | undefined) {
  if (!p) return '';
  const sym = { EUR: '€', GBP: '£', CHF: 'CHF ' } as const;
  let main = '';
  if (p.usd) main = `<span class="price__amt" data-usd="${p.usd}">≈ $${p.usd.toLocaleString('en-US')}</span>`;
  else if (p.local) main = `<span class="price__amt">${sym[p.local.currency]}${p.local.amount.toLocaleString('en-US')}</span>`;
  const status = p.status && STATUS_LABEL[p.status] ? `<span class="chip chip--${p.status}">${STATUS_LABEL[p.status]}</span>` : '';
  const note = p.note ? `<span class="price__note">${esc(p.note)}</span>` : '';
  return `<p class="price"><span class="chip chip--band" title="Price band">${BAND_LABEL[p.band]}</span>${main}${status}${note}</p>`;
}

function sourcesHtml(ids: string[] | undefined) {
  const list = (ids || []).map(sourceById).filter(Boolean) as { title: string; url: string }[];
  if (!list.length) return '';
  return `<p class="src">Sources: ${list
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`)
    .join(' · ')}</p>`;
}

export function watchCard(w: Watch) {
  const img = w.image ? imageName(w.id) : '';
  const fig = img
    ? `<img src="images/watches/${img}.webp" srcset="images/watches/${img}-s.webp 360w, images/watches/${img}.webp 720w" sizes="(max-width: 700px) 70vw, 300px" alt="${esc(w.brand + ' ' + w.model)}" loading="lazy" decoding="async" width="360" height="560">`
    : `<canvas class="pxwatch" data-watch="${w.id}" width="96" height="96" aria-label="${esc(w.brand + ' ' + w.model)} illustration"></canvas>`;
  const specs = [
    ['Case', `${w.caseMm ? `${w.caseMm}mm ` : ''}${w.material}`],
    ['Movement', w.movement],
    w.reserve ? ['Reserve', w.reserve] : null,
    w.year ? ['Year', w.year] : null,
  ].filter(Boolean) as string[][];
  return `
<article class="watch" id="watch-${w.id}" data-watch="${w.id}" data-rating="${w.rating}">
  <header class="watch__head"><span class="badge">${fmtDepth(w.rating)}</span><span class="watch__std">${STANDARD_LABEL[w.standard]}</span></header>
  <figure class="watch__fig"><div class="watch__glow" aria-hidden="true"></div>${fig}</figure>
  <p class="watch__brand">${esc(w.brand)}</p>
  <h3 class="watch__model">${esc(w.model)}</h3>
  <p class="watch__why">${esc(w.why)}</p>
  ${priceHtml(w.price)}
  <dl class="watch__specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <details class="watch__more"><summary>More</summary>
    ${w.more ? `<p>${esc(w.more)}</p>` : ''}
    <ul class="feat">${w.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
    ${w.ref ? `<p class="ref">Ref. ${esc(w.ref)}</p>` : ''}
    ${sourcesHtml(w.price.source ? Array.from(new Set([...w.sources, w.price.source])) : w.sources)}
  </details>
  <div class="watch__meter" aria-hidden="true"><span style="--r:${(Math.log10(w.rating) / Math.log10(11000)).toFixed(4)}"></span></div>
  <button class="watch__compare" type="button" data-compare="${w.id}">Compare</button>
</article>`;
}

export function plateCard(p: Plate) {
  return `
<article class="plate" id="plate-${p.id}" data-plate="${p.id}">
  <canvas class="pxwatch" data-plate="${p.id}" width="112" height="112" role="img" aria-label="Pixel illustration of the ${esc(p.brand + ' ' + p.model)}"></canvas>
  <div class="plate__body">
    <p class="plate__year">${esc(p.year)}${p.rating ? ` · ${fmtDepth(p.rating)}` : ''}</p>
    <h3 class="plate__name"><span>${esc(p.brand)}</span> ${esc(p.model)}</h3>
    <p class="plate__cap">${esc(p.caption)}</p>
    ${p.price ? priceHtml(p.price) : ''}
  </div>
</article>`;
}

const RHYME: Record<string, string> = {
  physics: '<span class="rhyme" title="The animal and the watch solve the same physical problem">Same physics</span>',
  visual: '<span class="rhyme rhyme--visual" title="A resemblance, not the same mechanism">A visual rhyme</span>',
};

const PART_LABEL: Record<string, string> = {
  bezel: 'Bezel', dial: 'Dial', hands: 'Hands', crown: 'Crown', gaskets: 'Gaskets', caseback: 'Caseback',
  hev: 'Helium valve', lume: 'Lume', crystal: 'Crystal', case: 'Case',
};

function stopInner(s: Stop): string {
  switch (s.kind) {
    case 'chapter': {
      const kicker = s.num === 0 ? `Pre-dive briefing · ${s.range}` : `Chapter ${s.num} · ${s.range}`;
      return `<p class="kicker">${kicker}</p><h2 class="chapter__title">${esc(s.title)}</h2><p class="chapter__problem">${s.num === 0 ? '' : '<span class="tag">The problem</span> '}${esc(s.problem)}</p>`;
    }
    case 'zone':
      return `<div class="zone"><p class="zone__range">${esc(s.range)}</p><h2 class="zone__name">${esc(s.name)}</h2><p class="zone__sci">${esc(s.sci)}</p><p class="zone__desc">${esc(s.desc)}</p>
<dl class="zone__stats"><div><dt>Temp</dt><dd>${esc(s.temp)}</dd></div><div><dt>Pressure</dt><dd>${esc(s.pressure)}</dd></div><div><dt>Light</dt><dd>${esc(s.light)}</dd></div></dl></div>`;
    case 'nature': {
      const c = creatureById(s.creature);
      return `<article class="card card--nature" data-creature="${s.creature}">
<p class="label">${esc(s.label || 'Nature’s answer')}${s.rhyme && RHYME[s.rhyme] ? RHYME[s.rhyme] : ''}</p>
<h3>${esc(s.title)}</h3>
${c ? `<p class="latin">${esc(c.name)}${c.latin ? ` · <i>${esc(c.latin)}</i>` : ''}</p>` : ''}
<p>${esc(s.body)}</p>
<button class="link field-link" type="button" data-field="${s.creature}">Field guide</button>
${sourcesHtml(s.sources)}
</article>`;
    }
    case 'engineering':
      return `<article class="card card--eng" data-part="${s.part}">
<p class="label">The watchmaker’s answer <span class="part">${PART_LABEL[s.part]}</span></p>
<h3>${esc(s.title)}</h3>
<div class="build-wrap"><canvas class="build" data-part="${s.part}" width="200" height="120" role="img" aria-label="Cross-section of a dive watch with the ${PART_LABEL[s.part].toLowerCase()} highlighted"></canvas></div>
<p>${esc(s.body)}</p>
${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}
${sourcesHtml(s.sources)}
</article>`;
    case 'fact':
      return `<article class="card card--fact"><p class="fact__num">${esc(s.number)}</p><p class="label">${esc(s.label)}</p><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p>${sourcesHtml(s.sources)}</article>`;
    case 'watches': {
      const ws = s.ids.map(watchById).filter(Boolean) as Watch[];
      return `<header class="tier__head"><p class="tier__depth">${fmtDepth(ws[0]?.rating ?? s.depth)}</p><h2 class="tier__title">${esc(s.title || '')}</h2>${s.intro ? `<p class="tier__intro">${esc(s.intro)}</p>` : ''}</header>
<div class="tier__track ${ws.length === 1 ? 'is-single' : ''}" data-count="${ws.length}">${ws.map(watchCard).join('')}</div>
${ws.length > 1 ? `<div class="tier__dots" aria-hidden="true">${ws.map((_, i) => `<span${i === 0 ? ' class="on"' : ''}></span>`).join('')}</div>` : ''}`;
    }
    case 'plates': {
      const ps = s.ids.map(plateById).filter(Boolean) as Plate[];
      return `<header class="tier__head tier__head--plates"><h2 class="tier__title">${esc(s.title)}</h2>${s.intro ? `<p class="tier__intro">${esc(s.intro)}</p>` : ''}</header><div class="plates">${ps.map(plateCard).join('')}</div>`;
    }
    case 'compare':
      return `<article class="card card--compare"><canvas class="truescale" data-landmark="${s.landmark}" data-height="${s.height}" width="64" height="120" role="img" aria-label="True-scale drawing: ${esc(s.title)}"></canvas><div><p class="label">To scale</p><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div></article>`;
    case 'line':
      return `<p class="line">${esc(s.text)}</p>`;
    case 'marker':
      return `<p class="marker" aria-hidden="true">${fmtDepth(s.depth)}</p>`;
    case 'component':
      return component(s.component, s);
  }
}

function component(id: string, s: Stop & { title?: string; intro?: string }) {
  const head = s.title ? `<header class="comp__head"><h2>${esc(s.title)}</h2>${s.intro ? `<p>${esc(s.intro)}</p>` : ''}</header>` : '';
  switch (id) {
    case 'byw':
      return `${head}<div class="byw-inline" data-byw-inline>
<div class="byw-chips" role="group" aria-label="Pick the number on your dial">
${[30, 50, 100, 150, 200, 300, 500, 1000].map((r) => `<button type="button" class="chip-btn" data-byw-rating="${r}">${r}m</button>`).join('')}
</div>
<p class="byw-or">or <button type="button" class="link" data-open="byw">search 56 popular watches</button> · <button type="button" class="link" data-byw-skip>skip</button></p>
<p class="byw-current" hidden></p>
</div>`;
    case 'dial-decoder':
      return `${head}<div class="decoder">
<div class="decoder__dial"><canvas class="decoder__canvas" width="160" height="160" aria-hidden="true"></canvas>
${DIAL_MARKS.map((m, i) => `<button type="button" class="decoder__mark" data-mark="${m.id}" style="--i:${i}">${esc(m.text)}</button>`).join('')}</div>
<dl class="decoder__list">${DIAL_MARKS.map((m) => `<div data-mark-def="${m.id}"><dt>${esc(m.text)}</dt><dd>${esc(m.meaning)}</dd></div>`).join('')}</dl>
</div>`;
    case 'ladder':
      return `${head}<div class="ladder" role="table" aria-label="Water resistance ratings and what they are good for">
<div class="ladder__row ladder__row--head" role="row"><span role="columnheader">On the dial</span><span role="columnheader">Test</span><span role="columnheader">Good for</span></div>
${LADDER.map((r, i) => `<div class="ladder__row" role="row" style="--i:${i}"><span role="cell" class="ladder__rating">${esc(r.rating)}</span><span role="cell" class="ladder__bar">${esc(r.bar)}</span><span role="cell"><b>${esc(r.use)}</b><small>${esc(r.note)}</small></span></div>`).join('')}
</div><p class="fine">Makers’ own guidance varies; when in doubt, read the manual for your reference.</p>`;
    case 'myths':
      return `${head}<div class="myths">${MYTHS.map(
        (m) => `<button type="button" class="myth" data-myth="${m.id}" aria-pressed="false">
<span class="myth__front"><span class="myth__q">${esc(m.claim)}</span><span class="myth__tap">Myth or fact?</span></span>
<span class="myth__back"><span class="myth__verdict myth__verdict--${m.verdict}">${{ myth: 'Myth', fact: 'Fact', 'mostly-myth': 'Mostly myth', depends: 'It depends' }[m.verdict]}</span><span class="myth__a">${esc(m.answer)}</span></span>
</button>`,
      ).join('')}</div>`;
    case 'colour-swatch': {
      const base: [string, number, number, number][] = [['Red', 220, 40, 40], ['Orange', 245, 140, 30], ['Yellow', 240, 215, 40], ['Green', 50, 170, 70], ['Blue', 40, 90, 220]];
      const depths = [0, 10, 20, 30, 40];
      const cell = (r: number, g: number, b: number, d: number) => {
        const T = transmission(d);
        const m = Math.max(...T);
        const k = 0.35 + 0.65 * Math.exp(-d / 60);
        const w = waterRGB(d);
        const mix = Math.min(0.55, d / 70);
        const c = [r, g, b].map((v, i) => Math.round((v * (T[i] / m) * k) * (1 - mix) + w[i] * mix));
        return `<span style="background:rgb(${c.join(',')})" title="${depths.indexOf(d) >= 0 ? d + 'm' : ''}"></span>`;
      };
      return `${head}<div class="swatch" data-swatch>
<div class="swatch__grid" role="img" aria-label="Simulated colour loss: red, orange, yellow, green and blue at 0, 10, 20, 30 and 40 metres. Red is gone first, blue lasts longest.">
<i></i>${depths.map((d) => `<b>${d}m</b>`).join('')}
${base.map(([n, r, g, b]) => `<i>${n}</i>${depths.map((d) => cell(r, g, b, d)).join('')}`).join('\n')}
</div>
<p class="fine">Simulated for clear seawater. Real water varies with plankton, sediment and sun angle.</p></div>`;
    }
    case 'history':
      return `${head}<ol class="history">${HISTORY.map(
        (h) => `<li class="history__item"${h.plate ? ` data-plate="${h.plate}"` : ''}><span class="history__year">${esc(h.year)}</span><b>${esc(h.title)}</b><span>${esc(h.text)}</span></li>`,
      ).join('')}</ol>`;
    case 'same-number': {
      const gs = watchById('grand-seiko-slga015')!;
      const duro = plateById('casio-duro')!;
      return `<div class="same">
<header class="comp__head"><p class="kicker">Same number, different promise</p><h2>${esc(s.title || '')}</h2>
<p>Both say 200m on the dial. One costs about $85, the other about $12,600. Here’s what the extra money buys, and what it doesn’t.</p></header>
<div class="same__grid">
  <div class="same__col"><canvas class="pxwatch" data-plate="casio-duro" width="96" height="96" role="img" aria-label="Casio Duro illustration"></canvas><h3>Casio Duro</h3><p class="same__price">≈ $85</p>
  <ul><li>200m, water resistant</li><li>Quartz, about ±20 seconds a month</li><li>Steel, mineral crystal</li><li>Battery every few years</li></ul></div>
  <div class="same__vs" aria-hidden="true">vs</div>
  <div class="same__col"><img src="images/watches/${imageName(gs.id)}-s.webp" alt="Grand Seiko SLGA015" loading="lazy" width="120" height="186"><h3>Grand Seiko SLGA015</h3><p class="same__price">≈ $12,600</p>
  <ul><li>200m, rated Diver’s</li><li>Spring Drive, about ±10 seconds a month</li><li>Titanium, sapphire, hand-polished</li><li>Five days of power, no battery</li></ul></div>
</div>
<p class="same__verdict"><b>What the money buys:</b> certification, materials, finishing, a movement you never have to replace a battery in, and a name. <b>What it doesn’t buy:</b> a single extra metre.</p>
${sourcesHtml(['duro', 'gs-slga015'])}
</div>`;
    }
    case 'five': {
      const dives: [string, string, string, string][] = [
        ['1960', 'Trieste', 'Jacques Piccard and Don Walsh · about 10,916m', 'deep-sea-special'],
        ['2012', 'Deepsea Challenger', 'James Cameron, solo · 10,908m', 'dsc-2012'],
        ['2019', 'Limiting Factor', 'Victor Vescovo · 10,928m', 'omega-ud-prototypes'],
      ];
      return `${head}<div class="five">${dives
        .map(([y, sub, crew, pid]) => {
          const p = plateById(pid)!;
          return `<article class="five__dive"><p class="five__year">${y}</p><h3>${esc(sub)}</h3><p class="five__crew">${esc(crew)}</p>
<canvas class="pxwatch" data-plate="${p.id}" width="112" height="112" role="img" aria-label="Pixel illustration of the ${esc(p.brand + ' ' + p.model)}"></canvas>
<p class="five__watch"><span>${esc(p.brand)}</span> ${esc(p.model)}</p><p class="five__cap">${esc(p.caption)}</p></article>`;
        })
        .join('')}</div>${sourcesHtml(['diving-watch', 'ud-newatlas', 'cd-epfl'])}`;
    }
    case 'finale':
      return `<div class="finale">
<p class="kicker">You have reached</p>
<p class="finale__depth">10,935m</p>
<h2 class="finale__title">Challenger Deep</h2>
<p class="finale__lede">The deepest known point on Earth, in the Mariana Trench. Measurements range from about 10,900 to 10,935m. Twenty-seven people have been here, as of 2022. Twelve have walked on the Moon.</p>
<dl class="finale__stats">
<div><dt>Pressure</dt><dd>≈ 1,100 bar</dd></div><div><dt>Temperature</dt><dd>≈ 2°C</dd></div><div><dt>Sunlight</dt><dd>0%</dd></div>
<div data-stat="time"><dt>Your dive</dt><dd>—</dd></div><div data-stat="species"><dt>Species spotted</dt><dd>—</dd></div><div data-stat="watch"><dt>Your watch</dt><dd>—</dd></div>
</dl>
<div class="finale__build"><canvas class="build build--complete" data-part="all" width="200" height="120" role="img" aria-label="Cross-section of a complete dive watch"></canvas><p class="fine">Everything a dive watch needs, assembled on the way down.</p></div>
<p class="finale__collective" hidden></p>
<div class="finale__actions">
<button type="button" class="btn btn--primary" data-action="ascend">Ascend</button>
<button type="button" class="btn" data-action="replay">Replay at true scale</button>
<button type="button" class="btn" data-open="kit" data-tab="logbook">Open the logbook</button>
<button type="button" class="btn" data-open="kit" data-tab="compare">Compare watches</button>
</div>
${sourcesHtml(['cd-people', 'cd-epfl'])}
</div>`;
  }
  return '';
}

export function renderStory() {
  // Validate monotonic depths at build time so a content edit can't break the engine.
  for (let i = 1; i < STOPS.length; i++) {
    if (STOPS[i].depth < STOPS[i - 1].depth) throw new Error(`Stop "${STOPS[i].id}" (${STOPS[i].depth}m) is shallower than "${STOPS[i - 1].id}"`);
  }
  return STOPS.map((s) => {
    const side = s.side || (s.kind === 'chapter' || s.kind === 'zone' || s.kind === 'line' || s.kind === 'marker' ? 'center' : 'center');
    const attrs = [
      `class="stop stop--${s.kind}${s.kind === 'component' ? ` stop--${(s as any).component}` : ''} side--${side}"`,
      `id="${s.id}"`,
      `data-depth="${s.depth}"`,
      s.pad ? `data-pad="${s.pad}"` : '',
      s.nav ? `data-nav="${esc(s.nav)}"` : '',
      `data-kind="${s.kind}"`,
    ].join(' ');
    const tag = s.kind === 'marker' || s.kind === 'line' ? '' : `<p class="stop__depth" aria-hidden="true">${fmtDepth(s.depth)}</p>`;
    return `<section ${attrs}>${tag}${stopInner(s)}</section>`;
  }).join('\n');
}

// ───────── Dive kit drawer (logbook, compare, field guide, care, glossary, sources) ─────────
export function renderKit() {
  const logbook = STOPS.filter((s) => s.nav)
    .map((s) => `<li><a href="#${s.id}" data-jump="${s.id}"><span>${fmtDepth(s.depth)}</span>${esc(s.nav!)}</a></li>`)
    .join('');
  const allWatches = [
    ...WATCHES.map((w) => ({ id: w.id, name: `${w.brand} ${w.model}`, rating: w.rating })),
    ...PLATES.filter((p) => p.rating).map((p) => ({ id: p.id, name: `${p.brand} ${p.model}`, rating: p.rating! })),
  ].sort((a, b) => a.rating - b.rating);
  const opts = allWatches.map((w) => `<option value="${w.id}">${esc(w.name)} (${fmtDepth(w.rating)})</option>`).join('');
  const field = CREATURES.map(
    (c) => `<li class="fg" data-fg="${c.id}"><canvas class="fg__sprite" data-sprite="${c.id}" width="64" height="40" aria-hidden="true"></canvas><div><b>${esc(c.name)}</b>${c.latin ? ` <i>${esc(c.latin)}</i>` : ''}<span class="fg__range">${fmtDepth(c.range[0])}${c.range[1] !== c.range[0] ? `–${fmtDepth(c.range[1])}` : ''}</span><p>${esc(c.fact)}</p></div></li>`,
  ).join('');
  const care = CARE.map((c) => `<li><b>${esc(c.title)}</b><span>${esc(c.text)}</span></li>`).join('');
  const gloss = GLOSSARY.map((g) => `<div><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`).join('');
  const src = SOURCES.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> <small>checked ${esc(s.checked)}</small></li>`).join('');
  return { logbook, opts, field, care, gloss, src };
}
