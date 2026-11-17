// Content model for The Deep Dive.
// Every number a reader sees should trace back to a Source (see sources.ts).

export type SourceId = string;

export interface Source {
  id: SourceId;
  title: string;
  url: string;
  checked: string; // ISO date the fact was last checked
}

/** How a watch's depth claim was tested. */
export type Standard =
  | 'iso6425' // "Diver's": tested at 125% of rating for 2 hours, plus legibility, shock, magnetism, etc.
  | 'iso2281' // "Water resistant": tested at rated pressure for 10 minutes
  | 'dnv' // certified by DNV (Sinn)
  | 'maker'; // maker's own claim, standard not published

export type PriceBand = 'entry' | 'mid' | 'luxury' | 'ultra';

export interface Price {
  /** Approximate list price in USD. Omit when unverified. */
  usd?: number;
  /** Price in another currency when that's what the maker publishes. */
  local?: { amount: number; currency: 'EUR' | 'GBP' | 'CHF' };
  band: PriceBand;
  /** Plain-language note shown under the price, e.g. "launched at £21,850 (2022)". */
  note?: string;
  status?: 'current' | 'discontinued' | 'limited' | 'unavailable';
  checked: string;
  source?: SourceId;
}

export interface Watch {
  id: string;
  brand: string;
  model: string;
  ref?: string;
  rating: number; // metres
  standard: Standard;
  caseMm: number;
  material: string;
  movement: string;
  reserve?: string;
  year?: string;
  /** The one-line reason this watch is on the page. */
  why: string;
  /** Up to three longer sentences shown when expanded. */
  more?: string;
  features: string[];
  price: Price;
  image?: string; // file name in /images/watches (webp is generated from it)
  /** Parameters for the pixel illustration used in the HUD, logbook and compare. */
  pixel: PixelWatchSpec;
  sources: SourceId[];
}

/** A reference watch shown as a pixel-art plate rather than a photo. */
export interface Plate {
  id: string;
  brand: string;
  model: string;
  rating?: number;
  year: string;
  caption: string;
  price?: Price;
  pixel: PixelWatchSpec;
  sources: SourceId[];
}

export interface PixelWatchSpec {
  shape?: 'round' | 'cushion' | 'tonneau' | 'ploprof' | 'tuna' | 'bubble' | 'octagon' | 'oil';
  caseColor: string; // steel, titanium, black, bronze-ish
  bezel?: 'dive' | 'nodeco' | 'none' | 'inner';
  bezelColor?: string;
  bezelAccent?: string; // first 15 minutes / pip colour
  dial: string;
  index?: 'dots' | 'batons' | 'arabic' | 'mixed';
  hands?: 'mercedes' | 'sword' | 'snowflake' | 'arrow' | 'baton' | 'plongeur';
  handColor?: string;
  lume?: string;
  crown?: 'right' | 'left' | 'guard';
  hev?: boolean;
  strap?: string;
  subdials?: number;
  accent?: string; // seconds hand / small accent
}

export type CreatureId = string;

export interface Creature {
  id: CreatureId;
  name: string;
  latin?: string;
  range: [number, number]; // typical depth range in metres
  fact: string; // field guide card
  trick?: string; // "Nature's trick" line
  sources: SourceId[];
}

export type BuildPart =
  | 'case'
  | 'gaskets'
  | 'crown'
  | 'caseback'
  | 'bezel'
  | 'dial'
  | 'hands'
  | 'lume'
  | 'crystal'
  | 'hev';

interface StopBase {
  id: string;
  depth: number;
  /** Extra breathing room before this stop, in viewport heights. */
  pad?: number;
  /** Desktop alignment. */
  side?: 'left' | 'right' | 'center' | 'wide';
  /** Label for the ribbon and logbook. Omit to hide from navigation. */
  nav?: string;
  sources?: SourceId[];
}

export type Stop = StopBase &
  (
    | { kind: 'chapter'; num: number; range: string; title: string; problem: string }
    | { kind: 'zone'; name: string; sci: string; range: string; desc: string; temp: string; pressure: string; light: string }
    | { kind: 'nature'; creature: CreatureId; label?: string; title: string; body: string; rhyme?: 'physics' | 'visual' | 'none' }
    | { kind: 'engineering'; part: BuildPart; title: string; body: string; note?: string }
    | { kind: 'fact'; number: string; label: string; title: string; body: string }
    | { kind: 'watches'; title?: string; intro?: string; ids: string[] }
    | { kind: 'plates'; title: string; intro?: string; ids: string[] }
    | { kind: 'compare'; landmark: string; height: number; title: string; body: string }
    | { kind: 'line'; text: string }
    | { kind: 'marker' }
    | { kind: 'component'; component: ComponentId; title?: string; intro?: string }
  );

export type ComponentId =
  | 'byw'
  | 'dial-decoder'
  | 'ladder'
  | 'myths'
  | 'colour-swatch'
  | 'history'
  | 'same-number'
  | 'five'
  | 'finale';

export interface Myth {
  id: string;
  claim: string;
  verdict: 'myth' | 'fact' | 'mostly-myth' | 'depends';
  answer: string;
}

export interface HistoryItem {
  year: string;
  title: string;
  text: string;
  plate?: string;
}

export interface Model {
  name: string;
  rating: number;
  diver: boolean;
  /** Real-world depth the maker endorses, when it differs from the default rule. */
  use?: number;
  style: 'diver' | 'sport' | 'dress' | 'digital' | 'smart' | 'chrono';
  note?: string;
}

export interface GlossaryEntry {
  term: string;
  def: string;
}
