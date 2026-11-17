import type { Creature } from './types';

/**
 * Field-guide entries for every creature and object drawn in the pixel ocean.
 * `range` is where the sprite appears; keep it to the animal's real habitat.
 */
export const CREATURES: Creature[] = [
  { id: 'sardines', name: 'Sardines', latin: 'Sardina pilchardus', range: [0, 60], fact: 'Schools of thousands move as one body. When a predator (or your torch) comes close, the school splits and closes again behind it.', sources: [] },
  { id: 'turtle', name: 'Green sea turtle', latin: 'Chelonia mydas', range: [0, 45], fact: 'Active turtles surface every few minutes. Resting ones can stay down for hours, up to seven in cold water, by barely moving.', trick: 'Stays still to stretch its air', sources: ['turtle-breath'] },
  { id: 'manta', name: 'Reef manta ray', latin: 'Mobula alfredi', range: [0, 120], fact: 'Mantas have the largest brain-to-body ratio of any fish and visit “cleaning stations” on reefs, where small fish pick them clean.', sources: [] },
  { id: 'moonjelly', name: 'Moon jellyfish', latin: 'Aurelia aurita', range: [0, 30], fact: 'No brain, no heart, no bones. About 95% water, which is exactly why pressure doesn’t bother it.', trick: 'Nothing inside to crush', sources: [] },
  { id: 'diver', name: 'Recreational diver', range: [5, 40], fact: 'Recreational scuba stops at 40m. Almost every dive watch sold spends its working life in this band.', sources: [] },
  { id: 'freediver', name: 'Freediver on a sled', range: [100, 214], fact: 'In 2007 Herbert Nitsch rode a weighted sled to 214m on one breath and came back up on a lift bag.', sources: [] },
  { id: 'techdiver', name: 'Technical diver', range: [300, 332], fact: 'Ahmed Gabr reached 332m on scuba in 2014. The descent took about 12 minutes; the decompression stops on the way back up took almost 15 hours.', sources: ['gabr-gwr', 'gabr-afp'] },
  { id: 'penguin', name: 'Emperor penguin', latin: 'Aptenodytes forsteri', range: [40, 565], fact: 'The deepest-diving bird. Most dives go to 100–200m; the deepest recorded reached 565m, and the longest lasted 22 minutes.', sources: ['penguin'] },
  { id: 'nautilus', name: 'Chambered nautilus', latin: 'Nautilus pompilius', range: [150, 703], fact: 'Lives in a shell full of gas, sealed from the sea. Seen as deep as 703m. Below about 800m the shell implodes.', trick: 'A sealed case with a depth limit', sources: ['nautilus'] },
  { id: 'redshrimp', name: 'Deep-sea red shrimp', range: [200, 1000], fact: 'Red light never reaches this deep, so red looks black. Being red is being invisible.', trick: 'Red is camouflage in the dark', sources: [] },
  { id: 'lanternfish', name: 'Lanternfish', latin: 'Myctophidae', range: [200, 1000], fact: 'Rows of light organs along their bellies. Lanternfish are among the most numerous vertebrates on Earth and rise toward the surface every night to feed.', trick: 'Makes its own light', sources: [] },
  { id: 'hatchetfish', name: 'Hatchetfish', latin: 'Argyropelecus', range: [200, 1000], fact: 'Glows faintly from its belly to match the dim light from above, erasing its own silhouette.', trick: 'Counter-illumination', sources: [] },
  { id: 'barreleye', name: 'Barreleye', latin: 'Macropinna microstoma', range: [600, 800], fact: 'Its head is a transparent, fluid-filled shield. The green domes inside are its eyes, which rotate to look up through its own forehead.', trick: 'A clear dome over the instruments', sources: [] },
  { id: 'squid', name: 'Giant squid', latin: 'Architeuthis dux', range: [300, 1000], fact: 'Eyes up to about 27cm across, the largest in the animal kingdom, built to catch the faintest silhouette or flash in the dark.', sources: [] },
  { id: 'vampsquid', name: 'Vampire squid', latin: 'Vampyroteuthis infernalis', range: [600, 1200], fact: 'Lives where the water has almost no oxygen. When threatened it releases a cloud of glowing mucus instead of ink.', sources: [] },
  { id: 'sponge', name: 'Venus’ flower basket', latin: 'Euplectella aspergillum', range: [100, 1000], fact: 'A skeleton of pure silica, glass, woven into a lattice that engineers study for strength. A pair of shrimp often lives inside for life.', trick: 'Builds in glass', sources: ['sponge'] },
  { id: 'whale', name: 'Sperm whale', latin: 'Physeter macrocephalus', range: [0, 2250], fact: 'Dives past 2,000m and can stay down over an hour. Its lungs collapse on the way down; oxygen is stored in blood and muscle instead.', trick: 'Gets rid of the air', sources: [] },
  { id: 'angler', name: 'Anglerfish', latin: 'Ceratioidei', range: [1000, 4000], fact: 'Females carry a glowing lure grown from a fin ray. In many species the tiny males bite on, fuse to the female and live as part of her.', trick: 'Brings its own light', sources: [] },
  { id: 'atolla', name: 'Atolla jellyfish', latin: 'Atolla wyvillei', range: [1000, 4000], fact: 'When grabbed, it flashes a spinning ring of blue light. The “burglar alarm” may summon bigger predators to eat whatever is eating it.', sources: [] },
  { id: 'vent', name: 'Hydrothermal vent', range: [2000, 4000], fact: 'Chimneys of minerals pump out water hot enough to melt lead, yet the water doesn’t boil: the pressure won’t let it. Whole ecosystems feed on the chemicals.', sources: [] },
  { id: 'titanic', name: 'RMS Titanic', range: [3800, 3800], fact: 'Sank in 1912, found in 1985. The bow section sits upright on the seabed about 3,800m down.', sources: [] },
  { id: 'seapig', name: 'Sea pig', latin: 'Scotoplanes', range: [1000, 6000], fact: 'A sea cucumber that walks the abyssal mud on tube-feet, eating the dead plankton that drifts down from above.', sources: [] },
  { id: 'tripod', name: 'Tripod fish', latin: 'Bathypterois grallator', range: [900, 4700], fact: 'Stands on three long fin rays facing into the current, waiting for food to drift into its fins.', sources: [] },
  { id: 'dumbo', name: 'Dumbo octopus', latin: 'Grimpoteuthis', range: [1000, 7000], fact: 'The deepest-living octopus, filmed at almost 7,000m. It flaps ear-like fins to swim.', sources: [] },
  { id: 'snailfish', name: 'Hadal snailfish', latin: 'Pseudoliparis', range: [6000, 8336], fact: 'The deepest fish ever filmed, at 8,336m. Scientists think fish can’t live much below about 8,200–8,400m: they can’t build up enough of the molecule (TMAO) that keeps their proteins working under pressure.', trick: 'A chemical depth rating', sources: ['snailfish-nhm'] },
  { id: 'amphipods', name: 'Hadal amphipods', latin: 'Hirondellea gigas', range: [6000, 10935], fact: 'Shrimp-like scavengers that swarm anything edible that reaches the trench floor. They thrive at the very bottom.', sources: [] },
  { id: 'plastic', name: 'A plastic bag', range: [10898, 10898], fact: 'Japanese researchers going through three decades of deep-sea dive footage found a plastic bag at 10,898m. It is the deepest litter on record.', sources: ['plastic-gwr'] },
  { id: 'trieste', name: 'Bathyscaphe Trieste', range: [10916, 10916], fact: 'Jacques Piccard and Don Walsh reached the Challenger Deep on 23 January 1960. The descent took about five hours; they spent 20 minutes on the bottom.', sources: ['trieste'] },
  { id: 'challenger', name: 'Deepsea Challenger', range: [10908, 10908], fact: 'James Cameron’s vertical one-man sub. He reached the bottom alone in March 2012.', sources: ['cd-epfl'] },
  { id: 'limitingfactor', name: 'Limiting Factor', range: [10928, 10928], fact: 'Victor Vescovo’s submersible, the first built to dive to full ocean depth again and again. It reached 10,928m in 2019.', sources: ['ud-newatlas'] },
];

export const creatureById = (id: string) => CREATURES.find((c) => c.id === id);
