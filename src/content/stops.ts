import type { Stop } from './types';

/**
 * The descent, in order. Depths must never decrease.
 *
 * The spine: at each depth the ocean poses a problem, nature shows how life handles it,
 * and watchmakers show how steel handles it. Some pairs share the same physics; others
 * only rhyme, and the copy says which.
 */
export const STOPS: Stop[] = [
  // ─────────────── 0–10 m · Briefing ───────────────
  {
    id: 'briefing', kind: 'chapter', depth: 0.5, num: 0, range: '0–10m', nav: 'Briefing',
    title: 'Every watch has a depth number. Almost nobody knows what it means.',
    problem: 'Water resistance is the most printed and least understood spec in watchmaking. Five minutes in the shallows will fix that. Then we’ll take your watch somewhere it should never go.',
  },
  { id: 'byw', kind: 'component', component: 'byw', depth: 1.5, side: 'wide', nav: 'Bring your watch', title: 'Bring your watch', intro: 'Tell us what’s on your wrist. It rides along in the gauge and tells you when it would give up.' },
  { id: 'dial', kind: 'component', component: 'dial-decoder', depth: 3, side: 'wide', nav: 'Read your dial', title: 'Read your dial', intro: 'The words next to the number matter as much as the number. Tap each marking.' },
  { id: 'ladder', kind: 'component', component: 'ladder', depth: 5, side: 'wide', nav: 'What the number means', title: 'What your number really means', intro: 'What makers and the standards say each rating is good for. The number is a test pressure, not a depth.' },
  {
    id: 'test-not-target', kind: 'fact', depth: 6.5, side: 'left', nav: 'A test, not a target', sources: ['iso-wr', 'watchtime-iso'],
    number: '125%', label: 'ISO 6425 test pressure',
    title: 'A rating is a test, not a target',
    body: 'A watch marked Diver’s 200m was held at the pressure of 250m of still water for two hours, among a dozen other tests. A watch that only says water resistant 200m has to survive 200m’s pressure for ten minutes. Neither tells you how deep you can take it: real water moves, gaskets age and crowns get left unscrewed.',
  },
  { id: 'myths', kind: 'component', component: 'myths', depth: 8, side: 'wide', nav: 'Myth or fact', title: 'Myth or fact?', intro: 'Tap a card to turn it over.' },
  {
    id: 'pressure-starts', kind: 'fact', depth: 10, side: 'right', nav: '10m: double pressure',
    number: '2 bar', label: 'At 10 metres',
    title: 'Pressure starts at once',
    body: 'Every 10 metres of seawater adds about one bar, the weight of the whole atmosphere again. Here the air in your lungs is squeezed to half its volume. Your watch still holds air at surface pressure, so every seal now has the ocean leaning on it.',
  },
  {
    id: 'zone-sunlight', kind: 'zone', depth: 11, side: 'wide', nav: 'Sunlight zone',
    name: 'Sunlight Zone', sci: 'Epipelagic', range: '0–200m',
    desc: 'Where most ocean life lives. Light still reaches here, feeding the phytoplankton that make roughly half the oxygen you breathe.',
    temp: '15–30°C', pressure: '1–21 bar', light: '100% → 1%',
  },

  // ─────────────── Chapter 1 · Time is air ───────────────
  {
    id: 'ch1', kind: 'chapter', depth: 13, num: 1, range: '10–60m', nav: '1 · Time is air',
    title: 'Time is air',
    problem: 'A tank holds a fixed amount of air, and the deeper you go, the faster you breathe it. Lose track of time down here and you run out of the one thing you can’t do without.',
  },
  {
    id: 'turtle', kind: 'nature', creature: 'turtle', depth: 18, side: 'right', rhyme: 'none', sources: ['turtle-breath'],
    label: 'Nature’s answer', title: 'Move less',
    body: 'A green sea turtle surfaces every few minutes when it’s busy. Resting, it can stay down for hours, up to seven in cold water, by barely moving at all. You can’t do that with a scuba tank. You need to know exactly how long you’ve been under.',
  },
  {
    id: 'bezel', kind: 'engineering', part: 'bezel', depth: 22, side: 'left', nav: 'The one-way bezel',
    title: 'The one-way bezel',
    body: 'Before a dive you line up the bezel’s zero with the minute hand, then read elapsed time straight off the bezel. It only turns one way, so a knock can only make it show more time underwater, never less. The mistake it allows is the safe one.',
    note: 'Look at the gauge: its bezel was set when you entered the water.',
  },
  { id: 'colour', kind: 'component', component: 'colour-swatch', depth: 28, side: 'wide', nav: 'The sea eats colour', title: 'The sea eats colour', intro: 'Water absorbs red light first, then orange and yellow. By 30 metres a red bezel looks brown-black. Here is what the same colours look like as you go down.' },
  {
    id: 'rec-limit', kind: 'fact', depth: 40, side: 'right', nav: '40m: recreational limit',
    number: '40m', label: 'Recreational scuba limit',
    title: 'Where most dive watches will ever go',
    body: 'Recreational diving stops here. Almost every watch sold as a diver, rated 200m or 300m, spends its working life in the top 40 metres. Or on a desk.',
  },

  // ─────────────── Chapter 2 · Read it in the murk ───────────────
  {
    id: 'ch2', kind: 'chapter', depth: 55, num: 2, range: '40–200m', nav: '2 · Legibility',
    title: 'Read it in the murk',
    problem: 'Below the first few metres the light is blue, dim and full of drifting particles. A dive watch you can’t read in a second is jewellery.',
  },
  {
    id: 'legibility', kind: 'engineering', part: 'dial', depth: 68, side: 'left', nav: 'Contrast beats colour', sources: ['watchtime-iso'],
    title: 'Contrast beats colour',
    body: 'Matte dials, big white markers, a minute hand you can’t mistake for the hour hand. The diver’s standard requires a watch to be readable at 25cm in total darkness, and to show in the dark that it is still running, usually with a luminous tip on the seconds hand.',
  },
  {
    id: 'liberty', kind: 'compare', landmark: 'liberty', height: 93, depth: 93, side: 'right', nav: '93m: Statue of Liberty',
    title: 'Deeper than Lady Liberty is tall',
    body: 'From the ground to the tip of her torch, pedestal included, she stands 93 metres. Stand her on the seabed here and her torch would just reach the surface.',
  },
  { id: 'w100', kind: 'watches', depth: 100, side: 'wide', nav: '100m watches', title: '100 metres', intro: 'Where most watches live. Good for swimming and snorkelling; none of these is meant for scuba.', ids: ['seiko-5-sports', 'oris-sixty-five-chrono', 'favre-leuba-sea-sky'] },
  {
    id: 'redshrimp', kind: 'nature', creature: 'redshrimp', depth: 140, side: 'left', rhyme: 'physics',
    label: 'Nature’s answer', title: 'Red is invisible',
    body: 'Deeper down, many shrimp and fish are bright red, because no red light reaches them. With nothing to reflect, red looks black: being red is being invisible. Dive watches learned the lesson the other way round and use the colours the sea gives back.',
  },
  {
    id: 'orange', kind: 'engineering', part: 'hands', depth: 155, side: 'right', nav: 'Why orange',
    title: 'Why some dials are orange',
    body: 'In the late 1960s Doxa chose orange for its dials because it stays readable in murky water. Its SUB 300 became the watch of the divers around Jacques Cousteau. The hands followed the same logic: a fat, luminous minute hand, because the minute hand is the one your life depends on.',
  },
  {
    id: 'computer', kind: 'fact', depth: 175, side: 'left', nav: 'Computers and watches',
    number: '1983', label: 'First popular dive computer',
    title: 'The computer does the maths. The watch is the backup.',
    body: 'Since the 1980s, divers have worn computers that track depth, time and decompression for them. Most still carry a dive watch as well. It has no battery to die, no firmware to crash and nothing to charge, and the bezel works when the screen goes blank.',
  },
  { id: 'history', kind: 'component', component: 'history', depth: 190, side: 'wide', nav: 'A century underwater', title: 'A century underwater', intro: 'From the first sealed case to a watch rated deeper than the ocean.' },
  {
    id: 'origins', kind: 'plates', depth: 199, side: 'wide', nav: 'The two that started it',
    title: 'The two that started it',
    intro: 'In 1953 Blancpain and Rolex both put a rotating bezel, a luminous dial and a sealed case on the wrist. Nearly every watch on this page descends from one of them.',
    ids: ['fifty-fathoms', 'submariner'],
  },
  { id: 'w200', kind: 'watches', depth: 200, side: 'wide', nav: '200m watches', title: '200 metres', intro: 'The classic diver’s rating, and plenty for any recreational dive.', ids: ['grand-seiko-slga015', 'tudor-black-bay-68', 'doxa-sub-200t'] },
  { id: 'same-number', kind: 'component', component: 'same-number', depth: 202, side: 'wide', nav: 'Same number, different price', title: 'Same number. 148 times the price.' },
  {
    id: 'zone-twilight', kind: 'zone', depth: 205, side: 'wide', nav: 'Twilight zone',
    name: 'Twilight Zone', sci: 'Mesopelagic', range: '200–1,000m',
    desc: 'Too dim for anything to grow, too bright to hide in. Most animals here make their own light.',
    temp: '4–15°C', pressure: '21–101 bar', light: '1% → 0',
  },
  {
    id: 'nitsch', kind: 'fact', depth: 214, side: 'right', nav: '214m: one breath',
    number: '214m', label: 'One breath',
    title: 'Herbert Nitsch came here without a tank',
    body: 'In 2007 he rode a weighted sled down on a single breath and a lift bag back up. It is still the deepest no-limits dive the sport’s governing body ever ratified.',
  },

  // ─────────────── Chapter 3 · Keep the water out ───────────────
  {
    id: 'ch3', kind: 'chapter', depth: 225, num: 3, range: '200–500m', nav: '3 · Keep the water out',
    title: 'Keep the water out',
    problem: 'A watch is a small box full of air, and every box has holes: one for the crown, one around the crystal, one for the caseback, more for any pushers. Each is a way in.',
  },
  {
    id: 'crown', kind: 'engineering', part: 'crown', depth: 250, side: 'left', nav: 'The crown is the weak point',
    title: 'The crown is where most watches fail',
    body: 'The knob you set the time with is a hole straight into the case. At 300m the sea pushes on every seal with about 30kg per square centimetre. Dive watches screw the crown down onto a gasket, then often guard it with shoulders so it can’t be knocked. One unscrewed crown and none of the rest matters.',
  },
  {
    id: 'gaskets', kind: 'engineering', part: 'gaskets', depth: 270, side: 'right',
    title: 'Rings of rubber do the real work',
    body: 'Between every two parts sits a gasket: a ring of rubber or synthetic that gets squeezed tighter as the pressure rises. Gaskets dry out, harden and crack with age and heat. That’s why a ten-year-old 200m watch can leak in a swimming pool.',
  },
  {
    id: 'caseback', kind: 'engineering', part: 'caseback', depth: 285, side: 'left',
    title: 'Screw the back down, or don’t have one',
    body: 'Dive watches screw their casebacks on, often pressing a gasket flat. A few go further: Seiko’s 1000m Tuna and Omega’s original 1970 Ploprof have one-piece cases, loaded through the front, with no back to fail.',
  },
  {
    id: 'nautilus', kind: 'nature', creature: 'nautilus', depth: 300, side: 'right', rhyme: 'physics', nav: 'Nature’s depth rating', sources: ['nautilus'],
    label: 'Nature’s answer', title: 'A watch case, 500 million years early',
    body: 'The chambered nautilus lives in a shell full of gas, sealed off from the sea, exactly like a watch case. It is most common around 300–350m and has been seen as deep as 703m. Below roughly 800m the shell implodes. That’s nature’s depth rating, with a margin of about 14%. ISO gives your watch 25%.',
  },
  { id: 'w300', kind: 'watches', depth: 305, side: 'wide', nav: '300m watches', title: '300 metres', intro: 'The modern standard for a serious diver, and the rating of both 1953 originals today.', ids: ['omega-seamaster-300-007', 'tag-aquaracer-300'] },
  {
    id: 'eiffel', kind: 'compare', landmark: 'eiffel', height: 330, depth: 330, side: 'left', nav: '330m: Eiffel Tower',
    title: 'An Eiffel Tower of water overhead',
    body: 'The tower is 330 metres to its tip. Down here, the pressure is about 34 times what you feel on the surface.',
  },
  {
    id: 'gabr', kind: 'fact', depth: 332, side: 'right', nav: '332m: scuba record', sources: ['gabr-gwr', 'gabr-afp'],
    number: '15 hrs', label: 'To come back up',
    title: 'Ahmed Gabr’s scuba record: 332 metres',
    body: 'In 2014 he reached this depth in about 12 minutes. Getting back to the surface safely, stopping every few metres to let the gas leave his body, took almost 15 hours and more than 60 tanks.',
  },
  {
    id: 'penguin', kind: 'nature', creature: 'penguin', depth: 450, side: 'left', rhyme: 'none', sources: ['penguin'],
    label: 'Field note', title: 'The deepest-diving bird',
    body: 'Emperor penguins usually feed at 100–200m, but one was recorded at 565m. The longest dive on record lasted 22 minutes, on one breath.',
  },

  // ─────────────── Chapter 4 · The human limit ───────────────
  {
    id: 'ch4', kind: 'chapter', depth: 490, num: 4, range: '500–700m', nav: '4 · The human limit',
    title: 'The human limit',
    problem: 'People do work down here, but only by living for weeks in pressurised chambers, breathing helium so their bodies can cope. That creates a problem no ocean animal has ever had.',
  },
  { id: 'w500', kind: 'watches', depth: 500, side: 'wide', nav: '500m watches', title: '500 metres', ids: ['panerai-submersible-pam01543', 'bremont-supermarine-500'] },
  {
    id: 'hydra8', kind: 'fact', depth: 534, side: 'left', nav: '534m: deepest working dive', sources: ['hydra8'],
    number: '534m', label: 'Open sea record',
    title: 'The deepest anyone has worked in the open sea',
    body: 'In 1988 divers from the French company Comex worked at 534m off Marseille, breathing a mix that included hydrogen and helium. Rolex Sea-Dwellers were standard Comex equipment.',
  },
  {
    id: 'hev', kind: 'engineering', part: 'hev', depth: 545, side: 'right', nav: 'The helium valve',
    title: 'Why some watches have a tiny extra valve',
    body: 'Saturation divers breathe helium, and helium atoms are small enough to seep past a watch’s gaskets. When the divers decompress, the gas trapped inside expands faster than it can leak out and can push the crystal off. Rolex patented a one-way valve to let it escape in 1967. Others, like Seiko, seal their cases so tightly that too little helium gets in to need one.',
  },
  { id: 'helium-line', kind: 'line', depth: 555, text: 'No animal breathes helium. This problem is ours.' },
  { id: 'w600', kind: 'watches', depth: 600, side: 'wide', nav: '600m watches', title: '600 metres', ids: ['zenith-defy-extreme-diver', 'omega-planet-ocean-600', 'unimatic-prodiver'] },
  {
    id: 'hydra10', kind: 'fact', depth: 701, side: 'left', nav: '701m: deepest human', sources: ['hydra10'],
    number: '701m', label: 'Chamber record',
    title: 'The most pressure a human has survived',
    body: 'In 1992 Comex diver Théo Mavrostomos was compressed to the equivalent of 701m in a test chamber on land. No one has been deeper outside a submarine.',
  },

  // ─────────────── Chapter 5 · Light runs out ───────────────
  {
    id: 'ch5', kind: 'chapter', depth: 720, num: 5, range: '700–1,000m', nav: '5 · Light runs out',
    title: 'Light runs out',
    problem: 'By 1,000m, no sunlight is left at all. From here down the only light is the light you bring, or the light you make.',
  },
  {
    id: 'lanternfish', kind: 'nature', creature: 'lanternfish', depth: 740, side: 'right', rhyme: 'visual',
    label: 'Nature’s answer', title: 'Make your own light',
    body: 'Most animals down here glow. Lanternfish wear rows of light organs; hatchetfish glow from below to erase their own silhouettes. In surveys of the open ocean off California, about three-quarters of the animals filmed could make light.',
  },
  {
    id: 'lume', kind: 'engineering', part: 'lume', depth: 760, side: 'left', nav: 'Lume',
    title: 'Lume: the light you bring',
    body: 'Early dive watches glowed with radium paint, which was radioactive. Tritium paint replaced it, and since the 1990s most watches use non-radioactive pigments that soak up light and give it back for hours. A few use sealed tritium gas tubes that glow for years without charging.',
    note: 'Watch the gauge’s dial now: in the dark, only the lume shows.',
  },
  {
    id: 'barreleye', kind: 'nature', creature: 'barreleye', depth: 780, side: 'right', rhyme: 'visual',
    label: 'Field note', title: 'A see-through head',
    body: 'The barreleye’s head is a clear, fluid-filled dome. The two green domes inside are its eyes, which rotate to look up through its own forehead for the silhouettes of prey.',
  },
  {
    id: 'squid', kind: 'nature', creature: 'squid', depth: 850, side: 'left', rhyme: 'none',
    label: 'Field note', title: 'Eyes the size of dinner plates',
    body: 'A giant squid’s eyes reach about 27cm across, matched only by its cousin the colossal squid. They’re thought to work best at spotting something big moving against the faint glow of everything else: like a sperm whale.',
  },
  {
    id: 'sponge', kind: 'nature', creature: 'sponge', depth: 940, side: 'right', rhyme: 'physics', sources: ['sponge'],
    label: 'Nature’s answer', title: 'Nature builds in glass too',
    body: 'The Venus’ flower basket grows a skeleton of pure silica, woven into a lattice that engineers have studied for its strength-to-weight ratio. A pair of shrimp often move in young, grow too big to leave and live there for life. In Japan the skeletons are a wedding gift.',
  },
  {
    id: 'zone-midnight', kind: 'zone', depth: 1000, side: 'wide', nav: 'Midnight zone',
    name: 'Midnight Zone', sci: 'Bathypelagic', range: '1,000–4,000m',
    desc: 'No sunlight has ever reached here. Life survives on marine snow: dead matter drifting down from above.',
    temp: '1–4°C', pressure: '101–401 bar', light: '0%',
  },

  // ─────────────── Chapter 6 · Hold the glass ───────────────
  {
    id: 'ch6', kind: 'chapter', depth: 1005, num: 6, range: '1,000–2,000m', nav: '6 · Hold the glass',
    title: 'Hold the glass',
    problem: 'At 1,000m the sea presses on a 30mm crystal with the weight of about 700kg. Glass that flexes even slightly lets water past its gasket.',
  },
  { id: 'w1000', kind: 'watches', depth: 1010, side: 'wide', nav: '1,000m watches', title: '1,000 metres', intro: 'Rated for saturation work, which tops out around 500m. Everything from here is engineering margin.', ids: ['seiko-tuna-1000', 'tag-superdiver', 'breitling-superocean-super-diver'] },
  {
    id: 'crystal', kind: 'engineering', part: 'crystal', depth: 1080, side: 'left', nav: 'Sapphire',
    title: 'Thick, hard, domed',
    body: 'Dive watches use synthetic sapphire, which only diamond-hard materials can scratch. The deeper the rating, the thicker it gets: the Rolex Deepsea Challenge’s crystal is 9.5mm thick. A dome spreads the load toward the edges, the way an arch carries a bridge.',
  },
  { id: 'w1200', kind: 'watches', depth: 1200, side: 'wide', nav: '1,200m', title: '1,200 metres', ids: ['doxa-sub-300t'] },
  {
    id: 'plates-1200', kind: 'plates', depth: 1210, side: 'wide',
    title: 'What working divers wore',
    intro: 'Before dive computers, these were tools. Both are still made.',
    ids: ['ploprof', 'sea-dweller'],
  },
  { id: 'w2000', kind: 'watches', depth: 2000, side: 'wide', nav: '2,000m', title: '2,000 metres', intro: 'Past any practical dive.', ids: ['bremont-s2000'] },

  // ─────────────── Chapter 7 · Remove the air ───────────────
  {
    id: 'whale', kind: 'nature', creature: 'whale', depth: 2150, side: 'right', rhyme: 'physics', nav: 'Sperm whale',
    label: 'Nature’s answer', title: 'Get rid of the air',
    body: 'Sperm whales hunt past 2,000m. On the way down their lungs collapse, so there’s no air left for the pressure to crush; the oxygen they need is stored in their blood and muscles. Deep-sea fish skip the swim bladder entirely.',
  },
  {
    id: 'ch7', kind: 'chapter', depth: 2300, num: 7, range: '2,000–5,000m', nav: '7 · Remove the air',
    title: 'Remove the air',
    problem: 'Pressure crushes empty space. Liquids and solids barely compress; air does. Take the air out of a watch and there’s nothing left for the ocean to squeeze.',
  },
  {
    id: 'bugatti', kind: 'fact', depth: 2500, side: 'left', nav: 'Why build for depths no one visits',
    number: '400km/h', label: 'Speed limit: 120',
    title: 'Nobody asks why a Bugatti exists',
    body: 'Extreme ratings test materials, refine machining and prove a design. What’s learned at 3,000m ends up in watches built for 30.',
  },
  {
    id: 'vent', kind: 'nature', creature: 'vent', depth: 2700, side: 'right', rhyme: 'none',
    label: 'Field note', title: 'Water too hot to boil',
    body: 'Hydrothermal vents push out water hot enough to melt lead. It doesn’t boil, because the pressure won’t let it. Whole food chains live off the chemicals in the plume.',
  },
  {
    id: 'angler', kind: 'nature', creature: 'angler', depth: 3000, side: 'left', rhyme: 'visual', nav: 'Anglerfish',
    label: 'Field note', title: 'Bring your own light',
    body: 'Female anglerfish dangle a glowing lure grown from a fin ray. In many species the tiny male bites on, fuses to her, and lives the rest of his life as part of her body. Romance in the abyss.',
  },
  {
    id: 'oil', kind: 'engineering', part: 'case', depth: 3300, side: 'right', nav: 'Oil-filled watches',
    title: 'Fill it with oil',
    body: 'Some watches stop fighting the pressure. Sinn fills the UX with oil, so there’s no air inside to compress. It has to be quartz, because oil would drag on gears. Ressence fills its Type 5 with oil for a different reason: underwater it cancels reflections, so the hands look printed on the glass.',
  },
  { id: 'ressence', kind: 'plates', depth: 3310, side: 'wide', title: 'Oil for clarity', ids: ['ressence-type-5'] },
  {
    id: 'average', kind: 'fact', depth: 3700, side: 'left', nav: 'The average ocean',
    number: '3,700m', label: 'Average ocean depth',
    title: 'This is what most of the planet looks like',
    body: 'The deep sea, everything below 200m, covers about two-thirds of the Earth. Most of it is dark, near-freezing plain at around this depth, and only about a quarter of the seafloor has been mapped in detail.',
  },
  {
    id: 'titanic', kind: 'nature', creature: 'titanic', depth: 3800, side: 'right', rhyme: 'none', nav: '3,800m: Titanic',
    label: 'Landmark', title: 'RMS Titanic',
    body: 'Sank in 1912. Found in 1985, 73 years later. Her bow still sits upright in the mud.',
  },
  { id: 'deepsea', kind: 'plates', depth: 3900, side: 'wide', nav: '3,900m: past the Titanic', title: 'Rated past the Titanic', ids: ['rolex-deepsea'] },
  {
    id: 'zone-abyss', kind: 'zone', depth: 4000, side: 'wide', nav: 'Abyssal zone',
    name: 'Abyssal Zone', sci: 'Abyssopelagic', range: '4,000–6,000m',
    desc: 'The abyss. Near freezing, completely dark, under hundreds of bar. Life is sparse, slow and strange.',
    temp: '0–3°C', pressure: '401–601 bar', light: '0%',
  },
  {
    id: 'seapig', kind: 'nature', creature: 'seapig', depth: 4400, side: 'left', rhyme: 'none',
    label: 'Field note', title: 'Pigs on the plain',
    body: 'Sea pigs are sea cucumbers that walk the mud on tube-feet, eating whatever drifts down. Tripod fish stand on three stiff fin rays, facing the current, and wait.',
  },
  { id: 'w5000', kind: 'watches', depth: 5000, side: 'wide', nav: '5,000m', title: '5,000 metres', ids: ['sinn-ux'] },

  // ─────────────── Chapter 8 · The arms race ───────────────
  {
    id: 'ch8', kind: 'chapter', depth: 5600, num: 8, range: '5,000–6,000m', nav: '8 · The arms race',
    title: 'The arms race',
    problem: 'Rolex Deepsea, 3,900m in 2008. Hublot, 4,000m in 2011. Omega, 6,000m and Rolex, 11,000m, both in 2022. Brands keep raising a number no owner will ever test.',
  },
  { id: 'w6000', kind: 'watches', depth: 6000, side: 'wide', nav: '6,000m', title: '6,000 metres', ids: ['omega-ultra-deep'] },
  {
    id: 'zone-hadal', kind: 'zone', depth: 6100, side: 'wide', nav: 'Hadal zone',
    name: 'Hadal Zone', sci: 'Hadalpelagic', range: '6,000–11,000m',
    desc: 'Named for Hades. Only the ocean’s trenches reach this deep: a sliver of the seafloor, but almost half of the ocean’s depth.',
    temp: '1–4°C', pressure: '601–1,100 bar', light: '0%',
  },

  // ─────────────── Chapter 9 · The long dark ───────────────
  {
    id: 'ch9', kind: 'chapter', depth: 6300, num: 9, range: '6,000–10,900m', nav: '9 · The long dark',
    title: 'The long dark',
    problem: 'Nothing in the next four and a half kilometres is rated, built or sold. This is what the ocean is mostly made of. Keep going.',
  },
  {
    id: 'dumbo', kind: 'nature', creature: 'dumbo', depth: 6950, side: 'right', rhyme: 'none',
    label: 'Field note', title: 'The deepest octopus',
    body: 'Dumbo octopuses have been filmed at almost 7,000m, flapping ear-like fins to get around.',
  },
  { id: 'm7000', kind: 'marker', depth: 7000 },
  { id: 'line-7500', kind: 'line', depth: 7500, text: 'Every square centimetre here carries about 750kg. Your thumbnail is about one square centimetre.' },
  { id: 'm8000', kind: 'marker', depth: 8000 },
  {
    id: 'snailfish', kind: 'nature', creature: 'snailfish', depth: 8336, side: 'left', rhyme: 'physics', nav: '8,336m: deepest fish', sources: ['snailfish-nhm'],
    label: 'Nature’s answer', title: 'Nature’s depth rating',
    body: 'A snailfish filmed at 8,336m is the deepest fish ever seen. Fish probably can’t go much further: below about 8,200–8,400m they can’t make enough of a molecule called TMAO, which stops pressure from deforming their proteins. Watches hit the same kind of wall: past some pressure, metal and glass start to deform, and the only answers are more material and better shapes.',
  },
  {
    id: 'everest', kind: 'compare', landmark: 'everest', height: 8849, depth: 8849, side: 'right', nav: '8,849m: Everest',
    title: 'Deeper than Everest is tall',
    body: 'Set Everest on the bottom of the trench below you and its summit would still be more than two kilometres under water.',
  },
  { id: 'm9000', kind: 'marker', depth: 9000 },
  { id: 'line-9500', kind: 'line', depth: 9500, text: 'Amphipods, shrimp-like scavengers, swarm down here by the thousand.' },
  { id: 'm10000', kind: 'marker', depth: 10000 },
  {
    id: 'plastic', kind: 'nature', creature: 'plastic', depth: 10898, side: 'left', rhyme: 'none', nav: '10,898m: a plastic bag', sources: ['plastic-gwr'],
    label: 'Found here', title: 'A plastic bag',
    body: 'Researchers going through three decades of deep-sea dive footage found one at 10,898m. It’s the deepest litter on record. We got here before most people did.',
  },

  // ─────────────── Chapter 10 · The bottom ───────────────
  { id: 'five', kind: 'component', component: 'five', depth: 10920, side: 'wide', nav: 'The five that came back', title: 'The five that came back', intro: 'Five watches have been to the deepest point in the ocean, on three dives, and every one of them returned working.' },
  { id: 'w11000', kind: 'watches', depth: 10930, side: 'wide', nav: 'Deepsea Challenge', title: 'Rated deeper than the ocean', ids: ['rolex-deepsea-challenge'] },
  { id: 'finale', kind: 'component', component: 'finale', depth: 10935, side: 'wide', nav: 'Challenger Deep' },
];
