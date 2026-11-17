// Reader state: settings, their watch, what they've seen. Persisted per browser, best effort.
import { USD_INR } from '../content/watches';

export interface MyWatch {
  name: string;
  rating: number;
  diver: boolean;
  use?: number;
  style: string;
}

const KEY = 'ddw:v3';

export const settings = {
  units: 'm' as 'm' | 'ft',
  pres: 'bar' as 'bar' | 'atm' | 'psi',
  cur: 'USD' as 'USD' | 'INR',
  reduced: false,
  torch: true,
  haptics: true,
};

export const dive = {
  started: false,
  startTime: 0,
  maxDepth: 0,
  spotted: new Set<string>(),
  watch: null as MyWatch | null,
  bottom: false,
  ascended: false,
};

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const j = JSON.parse(raw);
      Object.assign(settings, j.settings || {});
      dive.watch = j.watch || null;
      dive.maxDepth = j.maxDepth || 0;
      for (const id of j.spotted || []) dive.spotted.add(id);
    }
  } catch {
    /* private mode or blocked storage: run without memory */
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) settings.reduced = true;
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ settings, watch: dive.watch, maxDepth: dive.maxDepth, spotted: [...dive.spotted] }));
  } catch {
    /* ignore */
  }
}

// ───── formatting ─────
const nf = new Intl.NumberFormat('en-US');
export const fmtInt = (n: number) => nf.format(Math.round(n));

export function fmtDepth(m: number) {
  if (settings.units === 'ft') return { n: fmtInt(Math.max(0, m) * 3.28084), u: 'ft' };
  return { n: fmtInt(Math.max(0, m)), u: 'm' };
}
export const depthStr = (m: number) => {
  const d = fmtDepth(m);
  return `${d.n}${d.u === 'm' ? 'm' : ' ft'}`;
};

export function fmtPressure(bar: number) {
  if (settings.pres === 'atm') return { n: bar / 1.01325, u: 'atm' };
  if (settings.pres === 'psi') return { n: bar * 14.5038, u: 'psi' };
  return { n: bar, u: 'bar' };
}

export function fmtTemp(c: number) {
  return settings.units === 'ft' ? `${Math.round(c * 9 / 5 + 32)}°F` : `${Math.round(c)}°C`;
}

export function fmtPrice(usd: number) {
  if (settings.cur === 'INR') return `≈ ₹${new Intl.NumberFormat('en-IN').format(Math.round((usd * USD_INR) / 1000) * 1000)}`;
  return `≈ $${fmtInt(usd)}`;
}

// ───── your watch ─────
export function usageDepth(w: MyWatch) {
  if (w.use != null) return w.use;
  const r = w.rating;
  if (r < 50) return 0;
  if (r < 100) return 1;
  if (r < 200) return w.diver ? 40 : 5;
  if (r < 300) return 40;
  if (r < 500) return 100;
  if (r < 1000) return 300;
  return 534;
}

export const testDepth = (w: MyWatch) => (w.diver ? w.rating * 1.25 : w.rating);

export function useLabel(u: number) {
  if (u <= 0) return 'rain and splashes';
  if (u <= 1) return 'a swim at the surface';
  if (u <= 5) return 'swimming and snorkelling';
  if (u <= 40) return 'recreational scuba';
  if (u <= 100) return 'deep diving';
  if (u <= 300) return 'technical diving';
  return 'saturation diving';
}

export type Verdict = { level: 0 | 1 | 2 | 3; short: string; long: string };

export function verdict(w: MyWatch, d: number): Verdict {
  const u = usageDepth(w);
  const T = testDepth(w);
  if (d <= Math.max(u, 0.5)) return { level: 0, short: 'Built for this', long: `Made for ${useLabel(u)}.` };
  if (d <= w.rating) return { level: 1, short: 'Beyond its job', long: `Rated ${fmtInt(w.rating)}m, but meant for ${useLabel(u)}.` };
  if (d <= T) return { level: 2, short: 'Past its rating', long: `Inside the 25% test margin. Barely.` };
  return { level: 3, short: 'Flooded', long: `Its test stopped at ${fmtInt(T)}m.` };
}
