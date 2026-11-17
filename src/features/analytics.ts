// Analytics: GA4 events when gtag is present, plus the optional "collective depth" API.
declare global {
  interface Window { gtag?: (...a: unknown[]) => void; __ddw?: Record<string, unknown> }
}

export function track(name: string, params: Record<string, unknown> = {}) {
  try {
    window.gtag?.('event', name, params);
  } catch {
    /* never let analytics break the page */
  }
}

const MILESTONES = [10, 40, 100, 200, 300, 500, 1000, 2000, 3800, 6000, 8000, 10000, 10935];
let next = 0;
export function depthMilestones(d: number) {
  while (next < MILESTONES.length && d >= MILESTONES[next]) {
    track('depth_reached', { depth: MILESTONES[next] });
    next++;
  }
}

/**
 * Collective depth: an optional Cloudflare Pages Function at /api/dive keeps an
 * anonymous histogram of how deep readers get. If it isn't deployed, nothing shows.
 */
export async function collective(): Promise<{ deeperThan: (d: number) => number } | null> {
  try {
    const r = await fetch('api/dive', { headers: { accept: 'application/json' } });
    if (!r.ok) return null;
    const j = (await r.json()) as { buckets: Record<string, number>; total: number };
    if (!j.total || j.total < 50) return null;
    return {
      deeperThan(d: number) {
        let below = 0;
        for (const [k, v] of Object.entries(j.buckets)) if (+k < d) below += v;
        return Math.round((below / j.total) * 100);
      },
    };
  } catch {
    return null;
  }
}

export function reportMaxDepth(d: number) {
  try {
    const bucket = d >= 10900 ? 10935 : d >= 1000 ? Math.floor(d / 500) * 500 : Math.floor(d / 50) * 50;
    navigator.sendBeacon?.('api/dive', JSON.stringify({ bucket }));
  } catch {
    /* ignore */
  }
}
