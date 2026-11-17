# The Deep Dive v3: plan and build status

The plan is the Claude Doc "The Deep Dive v3 — Overhaul Plan" (27 Oct 2026). This file keeps the parts that steer day-to-day work, notes what changed after review comments, and records what v3 actually shipped. If this file and the doc disagree, the doc's purpose and filters win. This file wins on build details.

## Why this exists

The Deep Dive answers a question every watch owner has and almost nobody can answer: what does the depth number on my watch actually mean? The hero says it outright ("Your watch says 200m. But what does that actually mean?"), and every decision in v3 should trace back to it.

**A reader should leave with**

1. Their own number, decoded: what a 30m, 100m or 300m watch can actually do, and why "200m" is a lab test, not a dive limit.
2. An answer to "why 11,000m when people stop at a few hundred?": test margins, engineering proof, and an arms race whose technology filters down.
3. A felt sense of scale: the ocean is mostly deep, dark and empty, and nearly every watch lives in its top tenth.
4. A map of the dive watch world: a $300 diver and a $10,000 diver can share a rating, so what does the extra money buy?

**Who it's for:** curious non-watch people arriving from newsletters and social (phone-first), and enthusiasts who will judge it on accuracy. One scroll serves both: plain language up front, depth one tap away.

**What it is for Ajinkya:** a calling card. A personal, bylined piece that shows editorial judgement, watch expertise and interactive craft together.

**Decision filters.** Every feature passes at least one and breaks none:

- Does it help a reader understand their own watch's number?
- Does it make depth or pressure physically felt?
- Is it accurate enough that a watch editor or a marine biologist would share it?
- Will someone send it to a friend?

## Changes after review (doc comments)

- **Colour loss is pixel-world only.** Watch photos are never filtered and always show true colour. Colour loss is taught once, in a clearly labelled swatch. Filtering photos "will lead people to believe something's wrong with the site."
- **Bring your watch was split** into a simple rating picker plus a popular-model list, so it isn't a monumental build.
- **Cut:** the share card, the depth score, and sound. They are not coming back without a new ask.

## The spine

At each depth the ocean poses a problem, nature shows how life solved it, and watchmakers show how steel solved it.

| Depth | Problem | Nature's answer | Watchmaker's answer |
| --- | --- | --- | --- |
| 0–40m | Divers must not overstay their air | (human problem) | Unidirectional bezel |
| 5–200m | Colours vanish, red first | Red deep-sea animals turn invisible | Orange dials, high contrast |
| 0–450m | Water gets in through any opening | Sealed shells (nautilus, turtle) | Screw-down crown, gaskets, caseback |
| 500–700m | Helium seeps into the case | (human problem) | Helium escape valve, or a sealed monocoque |
| 200–1,000m | Light runs out | Huge eyes, bioluminescence | Lume |
| 1,000–2,000m | The crystal must not flex | Barreleye's clear shield | Thick, domed sapphire |
| 2,000–5,000m | Air spaces get crushed | Whales collapse their lungs; no swim bladders | Remove the air: oil-filled cases |
| 5,000m+ | Pressure deforms the materials | Piezolytes keep proteins in shape | Ringlock architecture, titanium |

The copy says which pairs share physics and which are visual rhymes.

## Build status (v3 branch, 17 Nov 2026)

### Tier 1: core. All built.

| # | Idea | Status |
| --- | --- | --- |
| 1 | Bring your watch | Built: 56 popular models, rating chips and a "Diver's?" question. Rides in the HUD; verdicts and limit lines on the ribbon. |
| 2 | Pre-dive briefing | Built: real-life ladder, "a test, not a target" (ISO 6425 125%), ISO 2281 vs 6425. |
| 3 | Dial decoder | Built: pixel dial with six tap targets. |
| 4 | The spine | Built: nine chapters from "Time is air" to "The long dark". |
| 5 | Price on every watch | Built: band, list price, checked date, USD/INR toggle. |
| 6 | Same depth, different price | Built: Casio Duro vs Grand Seiko at 200m. |
| 7 | Colour loss, darkness, torch, lume | Built: pixel world only, plus the static swatch. Lume moment below 1,000m. |
| 8 | The five that came back | Built: finale before the floor. |
| 9 | Myth or fact cards | Built: six flip cards. |
| 10 | Deep links, ribbon, unit toggles | Built: `#300m`, `#ch5`, `#watch-<id>`, J/K/N/P keys, m/ft, bar/atm/psi. |

### Tier 2: what makes people share it. All built.

| # | Idea | Status |
| --- | --- | --- |
| 11 | Pressure you can see | Built: shrinking cup and lungs in the HUD. |
| 12 | The watch builds itself | Built: cross-section gains a part per engineering stop. |
| 13 | Field guide | Built: tap any creature; spotted tally. |
| 14 | Collective depth | Built behind a flag: shows once 50+ dives are recorded. Needs the `DIVES` KV binding. |
| 15 | The long dark | Built: 6,000–10,000m is markers, single lines and snow. |
| 16 | Plastic at the bottom | Built, sourced. |
| 17 | Landmarks at true scale | Built: Statue of Liberty, Eiffel Tower, Everest. The Titanic is in the world itself. |

### Tier 3. Built early.

Compare mode, logbook, care at the surface, haptics (Android), history lane: all in the dive kit. "Make DDW a series" is supported by the engine; see README.

### Where the build departs from the plan's tech table

- **Vite + TypeScript with build-time HTML instead of Astro.** Same outcome: every word of the story is real HTML in the built file. Less framework to maintain.
- **A small software pixel renderer instead of PixiJS.** A low-res canvas with per-row light, colour loss and dithering is simpler and lighter than WebGL. It fits the budget on phones.
- **Art is drawn in code (`src/world/art.ts`), not Aseprite.** Every sprite is a few vector calls, pixelised when the page loads, so anyone can tweak a creature in a text editor. A commissioned artist can still replace any sprite later; the sprite interface stays the same.

## Decisions taken (review these)

1. **Watches in pixel art?** Real photos in the cards. Reference watches with no photo (Fifty Fathoms, Submariner, Sea-Dweller, Ploprof, Deepsea, the five that came back) are parametric pixel "plates".
2. **Who makes the art?** Generated in code, reviewed sprite by sprite (`dev/sprites.html`).
3. **Depth curve:** designed compression by default, true scale as a replay.
4. **Bring your watch:** both a rating picker and a model list.
5. **Prices:** USD plus INR, list price, checked date shown. Refresh twice a year.
6. **Titan submersible:** left out. One restrained line is possible later if wanted.
7. **One piece or a series:** the engine is content-driven and ready for a second explainer.
8. **Identity:** "By Ajinkya Nair" kept, plus a short "Why I made this" draft in the footer for Ajinkya to rewrite in his own words.
