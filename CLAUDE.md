# Working on The Deep Dive

Read PLAN.md first: it holds the purpose, the decision filters and what was decided. README.md covers setup, layout and how to add content.

## Rules

- **Copy lives in `src/content/`, never in components or CSS.** `render/html.ts` only formats.
- **Every fact has a source** in `sources.ts` with a `checked` date. If you can't source it, cut it.
- **Stop depths never decrease** in `stops.ts`. A watch stop sits at the watch's rated depth.
- **Watch photos are never filtered, tinted or colour-shifted.** Colour loss happens only in the pixel world and the labelled swatch.
- **No share card, depth score or sound.** These were cut on purpose.
- **Plain language first, enthusiast detail one tap deeper.** Short, specific, slightly wry. Metres first, feet via the toggle.
- **Layout is read only on resize or relayout, never in the frame loop.** Depth comes from `DepthMap`.

## Performance budget

- World render under 8 ms per frame on a mid-range phone (profile with DevTools Performance; `window.__ddw.world` is exposed for poking). Renderer pixel size is chosen so `P × devicePixelRatio` is an integer.
- Initial JS under 60 KB gzipped, HTML under 50 KB gzipped. Watch photos are lazy WebP with a 360px `srcset` variant for phones.
- Pause rendering when the tab is hidden. Honour `prefers-reduced-motion` and the in-app setting: no inertia, no drifting, static ocean.

## Checks before committing

```bash
npm run check                                    # TypeScript, src + functions
DDW_GA=off npm run build                         # build must pass, depth validation included
node scripts/shot.mjs http://localhost:5173/ shots/x.png 390 844 '#3900m'   # phone screenshot at a depth
```

Look at the result on a phone-sized viewport (390×844) and desktop (1440×900) at the surface, ~200m, ~1,000m, ~4,000m and the bottom.

## Git

- Work on feature branches; the site deploys from `main`. Don't push to `main` without asking.
- `node_modules/` and `dist/` are ignored.
