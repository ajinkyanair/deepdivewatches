/**
 * The depth engine. Lays the story out on a designed depth curve and maps
 * document scroll position <-> depth in metres. Every layer (HUD, world, ribbon)
 * reads depth from here, so they can never disagree.
 *
 * Layout rule for each stop, in order:
 *   centre_i = max( centre_{i-1} + curve(d_{i-1} → d_i),          // the designed pacing
 *                   bottom_{i-1} + gap + height_i / 2 )             // never overlap
 * Stops keep normal document flow; we only set their margin-top. With JS off,
 * the page is simply a long article.
 */

export const MAX_DEPTH = 10935;

/** Scroll distance per metre, in viewport heights, by depth band. Tuned by eye. */
const PACE: [number, number][] = [
  // [up to depth, vh per metre]
  [10, 0.08],
  [60, 0.04],
  [200, 0.025],
  [1000, 0.011],
  [2000, 0.0028],
  [6000, 0.0025],
  [10000, 0.003], // the long dark: deliberately slow and empty
  [11000, 0.0025],
];

export function curve(d0: number, d1: number) {
  // integrate PACE between d0 and d1 (in vh)
  let total = 0;
  let lo = 0;
  for (const [hi, pace] of PACE) {
    const a = Math.max(d0, lo);
    const b = Math.min(d1, hi);
    if (b > a) total += (b - a) * pace;
    lo = hi;
  }
  return total;
}

export interface Anchor {
  y: number; // document y of the focus line when at this anchor
  d: number;
}

export class DepthMap {
  anchors: Anchor[] = [];
  waterlineY = 0;
  bottomY = 0;

  /** Depth at a document y (the focus line, or any screen row). Negative above the waterline. */
  depthAt(y: number): number {
    const a = this.anchors;
    if (!a.length) return 0;
    if (y <= a[0].y) return a[0].d - (a[0].y - y) * 0.004; // gently negative above water
    if (y >= a[a.length - 1].y) return a[a.length - 1].d;
    let lo = 0;
    let hi = a.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (a[mid].y <= y) lo = mid;
      else hi = mid;
    }
    const A = a[lo];
    const B = a[hi];
    const t = (y - A.y) / Math.max(1e-6, B.y - A.y);
    return A.d + (B.d - A.d) * t;
  }

  /** Document y of the focus line for a depth (first occurrence for holds). */
  yAt(d: number): number {
    const a = this.anchors;
    if (!a.length) return 0;
    if (d <= a[0].d) return a[0].y;
    if (d >= a[a.length - 1].d) return a[a.length - 1].y;
    let lo = 0;
    let hi = a.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (a[mid].d < d) lo = mid;
      else hi = mid;
    }
    const A = a[lo];
    const B = a[hi];
    const t = (d - A.d) / Math.max(1e-6, B.d - A.d);
    return A.y + (B.y - A.y) * t;
  }
}

export interface LayoutStop {
  el: HTMLElement;
  depth: number;
  centre: number; // document y of the stop's centre after layout
}

/**
 * Lay out the stops and build the depth map.
 * @param story container whose children are the stops (normal flow)
 * @param waterlineY document y of the sea surface
 * @param vh viewport height
 */
export function layout(stops: HTMLElement[], story: HTMLElement, waterlineY: number, vh: number, map: DepthMap): LayoutStop[] {
  const phone = innerWidth < 760;
  const baseGap = vh * (phone ? 0.16 : 0.2);
  // Reset margins so we can measure natural heights.
  for (const el of stops) el.style.marginTop = '0px';
  const heights = stops.map((el) => el.offsetHeight);
  const storyTop = story.getBoundingClientRect().top + scrollY;

  const out: LayoutStop[] = [];
  const anchors: Anchor[] = [{ y: waterlineY, d: 0 }];
  // The first stop sits just below the hero.
  let prevCentre = waterlineY;
  let prevDepth = 0;
  let prevBottom = storyTop;
  stops.forEach((el, i) => {
    const d = parseFloat(el.dataset.depth || '0');
    const h = heights[i];
    const pad = parseFloat(el.dataset.pad || '0') * vh;
    const kind = el.dataset.kind;
    // small items breathe less; watch tiers and components breathe more
    const gap = kind === 'line' || kind === 'marker' ? baseGap * 0.5 : kind === 'watches' || kind === 'component' ? baseGap * 1.15 : baseGap;
    const paced = prevCentre + curve(prevDepth, d) * vh + pad;
    const minimal = prevBottom + gap + h / 2;
    const centre = Math.max(paced, minimal, i === 0 ? storyTop + h / 2 + vh * 0.25 : 0);
    const top = centre - h / 2;
    el.style.marginTop = `${Math.max(0, top - prevBottom)}px`;
    anchors.push({ y: centre, d });
    out.push({ el, depth: d, centre });
    prevCentre = centre;
    prevDepth = d;
    prevBottom = top + h;
  });
  map.anchors = anchors;
  map.waterlineY = waterlineY;
  map.bottomY = prevBottom;
  // Leave room so the last stop can reach the focus line.
  story.style.paddingBottom = `${vh * 0.55}px`;
  return out;
}
