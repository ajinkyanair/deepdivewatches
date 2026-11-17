// The ocean as numbers: colour, light, temperature and pressure by depth.
// Shared by the HUD (readouts) and the world renderer (pixels).

type Stopv = [number, number, number, number]; // depth, r, g, b

const WATER: Stopv[] = [
  [0, 46, 196, 214],
  [6, 22, 164, 199],
  [20, 12, 126, 176],
  [50, 8, 92, 144],
  [100, 6, 64, 110],
  [200, 5, 40, 74],
  [400, 4, 23, 46],
  [700, 3, 14, 29],
  [1000, 2, 9, 19],
  [2000, 1, 6, 13],
  [6000, 1, 4, 10],
  [11000, 1, 3, 8],
];

export function waterRGB(d: number): [number, number, number] {
  if (d <= 0) return [WATER[0][1], WATER[0][2], WATER[0][3]];
  for (let i = 1; i < WATER.length; i++) {
    const [d1, r1, g1, b1] = WATER[i];
    if (d <= d1) {
      const [d0, r0, g0, b0] = WATER[i - 1];
      const t = (d - d0) / (d1 - d0);
      return [r0 + (r1 - r0) * t, g0 + (g1 - g0) * t, b0 + (b1 - b0) * t];
    }
  }
  const l = WATER[WATER.length - 1];
  return [l[1], l[2], l[3]];
}

/** Fraction of surface light remaining (1% at ~200m). */
export const light = (d: number) => (d <= 0 ? 1 : Math.exp(-d / 43.4));

/** Perceptual light for drawing: 1 at the surface, 0 by ~550m (where a dark-adapted eye gives up). */
export function seeLight(d: number) {
  const l = light(d);
  const v = Math.max(0, Math.min(1, (Math.log10(l) + 5.5) / 5.5));
  return v * v * (1.6 - 0.6 * v); // keep the shallows bright, fall off through the twilight
}

/** Per-channel transmission of sunlight down to depth d (red goes first). */
export function transmission(d: number): [number, number, number] {
  if (d <= 0) return [1, 1, 1];
  return [Math.exp(-d / 7), Math.exp(-d / 36), Math.exp(-d / 100)];
}

const TEMP: [number, number][] = [
  [0, 25], [50, 22], [100, 18], [200, 13], [500, 8], [1000, 4.5], [2000, 3], [4000, 2], [6000, 1.5], [11000, 2.2],
];
export function tempC(d: number) {
  if (d <= 0) return TEMP[0][1];
  for (let i = 1; i < TEMP.length; i++) {
    if (d <= TEMP[i][0]) {
      const t = (d - TEMP[i - 1][0]) / (TEMP[i][0] - TEMP[i - 1][0]);
      return TEMP[i - 1][1] + (TEMP[i][1] - TEMP[i - 1][1]) * t;
    }
  }
  return TEMP[TEMP.length - 1][1];
}

/** Absolute pressure in bar: about one more bar per 10m of seawater. */
export const pressureBar = (d: number) => 1 + Math.max(0, d) / 10;

export function zoneOf(d: number) {
  if (d < 200) return 'Sunlight';
  if (d < 1000) return 'Twilight';
  if (d < 4000) return 'Midnight';
  if (d < 6000) return 'Abyssal';
  return 'Hadal';
}

export const ZONES = [
  { name: 'Sunlight', from: 0, to: 200 },
  { name: 'Twilight', from: 200, to: 1000 },
  { name: 'Midnight', from: 1000, to: 4000 },
  { name: 'Abyssal', from: 4000, to: 6000 },
  { name: 'Hadal', from: 6000, to: 11000 },
];

/** Lung volume relative to the surface (Boyle's law). */
export const lungs = (d: number) => 1 / pressureBar(d);
