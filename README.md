# The Deep Dive

**What the depth rating on your watch actually means.** An 11 km scroll from the surface to the bottom of the Challenger Deep, with real watches at their rated depths and a living pixel ocean behind them.

Live at [deepdivewatches.com](https://deepdivewatches.com). By Ajinkya Nair.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then writes dist/
npm run preview    # serves dist/ on :4173
npm run check      # type-checks src and the Pages Function
```

Build without Google Analytics (for previews and staging): `DDW_GA=off npm run build`.

## Deploying (Cloudflare Pages)

The v2 site was a single `index.html` served as-is. v3 needs a build step, so before merging `v3` into the branch Pages deploys from, set the Pages project to:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 20 or newer (`NODE_VERSION=20`) |

The `functions/` folder is picked up automatically by Pages.

**Collective depth (optional).** "The average reader turns back at …" needs a KV namespace:

1. Workers & Pages → KV → create a namespace (e.g. `ddw-dives`).
2. Pages project → Settings → Functions → KV namespace bindings → variable name `DIVES`.

Without the binding the endpoint answers 404 and the site hides the line. With it, the line appears once 50 dives have been recorded. Only depth buckets are stored: no IPs, no IDs.

**Share links.** Every chapter and watch gets a page at `/s/<id>/` with its own title, description and 1200×630 image (`public/og/og-<id>.jpg`). The page redirects into the dive at the right depth. Examples: `/s/ch5/`, `/s/sinn-ux/`.

## How it works

```
index.html            page shell: hero, HUD, ribbon, dialogs, footer
vite.config.ts        renders the story into the HTML at build time, adds GA, emits share pages
src/
  content/            ALL copy and data: stops, watches, creatures, sources, extras
  render/html.ts      turns content into HTML (build time only)
  engine/             depth curve + layout, ocean physics (light, colour, temp), saved state
  world/              the pixel ocean: renderer, walls, actors (creatures), sprite art
  pixel/              pixel watch plates, the build diagram, landmark silhouettes
  hud/                the dive-watch HUD and the depth ribbon
  features/           dialogs and interactive pieces, replay, analytics
  main.ts             boot, input, frame loop
functions/api/dive.ts Pages Function for collective depth
dev/                  sprite sheet (dev/sprites.html) and share-image renderer (dev/og.html)
scripts/              images.py (photos → webp), og.cjs (share images), shot.mjs (screenshots)
assets-src/watches/   original watch photos
archive/v2/           the previous site, for reference
```

**The depth engine.** `src/engine/depth.ts` has a pace curve (screen heights per metre, by depth band) and lays out each stop so it sits at its depth without overlapping the one before. Everything that needs depth reads one map: the HUD, the ribbon, the light, the creatures and deep links. Nothing in the frame loop reads layout.

**The pixel ocean.** `src/world/renderer.ts` draws a low-resolution canvas (2–3 CSS px per art pixel). For each row it works out water colour, how much sunlight is left, and which colours have been absorbed. The diver's torch, sub lamps and bioluminescence are added on top. Creatures are built in `art.ts` as small vector drawings that get pixelised and outlined, then animated by `actors.ts`.

## Editing content

All words live in `src/content/`. Components never hold copy.

- **Add a watch:** add an entry to `WATCHES` in `watches.ts` (rated depth, standard, price with `checked` date, `sources`). Put the photo in `assets-src/watches/`, run `npm run images`, then reference the id from a `watches` stop in `stops.ts`. The stop's depth should be the watch's rating.
- **Add a stop:** insert it in `stops.ts` in depth order. The build fails if depths ever go backwards.
- **Add a creature:** add a field-guide entry in `creatures.ts` and a sprite with the same id in `world/art.ts`. Then either list it in `AMBIENT` (wanders a depth range) or `FEATURED` (anchored to a stop) in `world/actors.ts`. Check it on `dev/sprites.html`.
- **Sources:** every fact names a source id from `sources.ts`, with the date it was checked.
- **Prices and FX:** `USD_INR` and `FX_CHECKED` live at the top of `watches.ts`.
- **Share images:** with `npm run dev` running, `npm run og` regenerates `public/og/`.

## Making it a series

The engine doesn't know it's about dive watches. A second explainer (altitude and pilot watches, anti-magnetism) is a new `content/` folder, a new `PACE` curve and a new `env.ts` (air pressure and temperature by altitude instead of depth), with the world renderer's palette swapped for sky.
