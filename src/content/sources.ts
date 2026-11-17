import type { Source } from './types';

const C = '2026-11-17';

/** Every fact on the page points at one of these. Re-check prices before each update. */
export const SOURCES: Source[] = [
  // Standards and physics
  { id: 'iso-wr', title: 'Water Resistant mark and ISO 6425 test procedure (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Water_Resistant_mark', checked: C },
  { id: 'watchtime-iso', title: 'What makes a divers’ watch: ISO 6425 tests (WatchTime)', url: 'https://www.watchtime.com/?p=55782', checked: C },
  { id: 'iso-1982', title: 'ISO 6425:1982, first edition of the divers’ watch standard (ISO)', url: 'https://committee.iso.org/standard/12772.html', checked: C },
  { id: 'diving-watch', title: 'Diving watch: history from the Oyster to the Deep Sea Special (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Diving_watch', checked: C },

  // Human records
  { id: 'gabr-gwr', title: 'Deepest scuba dive: Guinness review upholds Ahmed Gabr’s 332.35 m', url: 'https://www.guinnessworldrecords.com/news/announcement/deepest-scuba-dive', checked: C },
  { id: 'gabr-afp', title: 'Egyptian diver breaks world record: 12 minutes down, almost 15 hours up (AFP/IOL)', url: 'https://www.iol.co.za/news/africa/egyptian-diver-breaks-world-record-1753718', checked: C },
  { id: 'hydra8', title: 'Comex Hydra VIII: 534 m in the open sea, 1988 (Rolex)', url: 'https://www.rolex.com/oyster-story/living-laboratory/comex-hydra-viii', checked: C },
  { id: 'hydra10', title: 'Deepest “dive” in a hyperbaric chamber (Guinness World Records)', url: 'https://guinnessworldrecords.com/world-records/119005-deepest-dive-in-a-hyperbaric-chamber', checked: C },
  { id: 'cd-people', title: 'List of people who descended to Challenger Deep (Wikipedia)', url: 'https://en.wikipedia.org/wiki/List_of_people_who_descended_to_Challenger_Deep', checked: C },
  { id: 'trieste', title: 'Challenger Deep and the Trieste’s five-hour descent (EarthDate)', url: 'https://www.earthdate.org/node/482', checked: C },
  { id: 'cd-epfl', title: 'Challenger Deep: dives 1960–2022 (EPFL Graph Search)', url: 'https://graphsearch.epfl.ch/en/concept/7786', checked: C },
  { id: 'plastic-gwr', title: 'Deepest plastic debris found in the sea: 10,898 m (Guinness World Records)', url: 'https://www.guinnessworldrecords.com/world-records/562338-deepest-plastic-debris-found-in-the-sea', checked: C },

  // Record watches
  { id: 'dsc-forbes', title: 'Rolex Deepsea Challenge tested at 13,750 m (Forbes Australia)', url: 'https://www.forbes.com.au/?p=8038', checked: C },
  { id: 'dsc-watchpro', title: 'Rolex Deepsea Challenge production model, £21,850 at launch (WatchPro)', url: 'https://www.watchpro.com/?p=84286', checked: C },
  { id: 'ud-watchtime', title: 'Omega Ultra Deep: three 2019 prototypes and the 2022 collection (WatchTime)', url: 'https://www.watchtime.com/?p=136771', checked: C },
  { id: 'ud-omega', title: 'Seamaster Planet Ocean Ultra Deep: 6,000 m, ISO 6425 (Omega)', url: 'https://omegawatches.com/watches/seamaster/planet-ocean/ultra-deep/catalog', checked: C },
  { id: 'ud-newatlas', title: 'Omega Ultra Deep reaches 10,928 m; Deep Sea Special on Trieste, 1960 (New Atlas)', url: 'https://newatlas.com/omega-ultra-deep-watch-record/60261/?amp=true', checked: C },
  { id: 'hublot-4000', title: 'Hublot Oceanographic 4000, 2011 (GPHG)', url: 'https://gphg.org/en/watches/oceanographic-4000', checked: C },

  // Watches
  { id: 'seiko5', title: 'Seiko 5 Sports SRPD53 (Seiko USA)', url: 'https://www.seikowatches.com/us-en/products/5sports/srpd53', checked: C },
  { id: 'oris65', title: 'Oris Divers Sixty-Five Chronograph (Oris USA)', url: 'https://www.oris.ch/en-US/product/watch/divers/divers-sixty-five-chronograph/01-771-7791-4051-07-8-20-18', checked: C },
  { id: 'favre', title: 'Favre Leuba relaunch and Sea Sky Chronograph (Time+Tide)', url: 'https://timeandtidewatches.com/favre-leuba-relaunch-news/', checked: C },
  { id: 'gs-slga015', title: 'Grand Seiko SLGA015 (Grand Seiko Boutique US)', url: 'https://grandseikoboutique.us/products/watch-spring-drive-5-days-slga015', checked: C },
  { id: 'tudor-bb68', title: 'Black Bay 68 M7943A1A0NU-0001 (Tudor)', url: 'https://www.tudorwatch.com/watches/black-bay-68/m7943a1a0nu-0001', checked: C },
  { id: 'doxa-200t', title: 'DOXA SUB 200T (Gear Patrol)', url: 'https://www.gearpatrol.com/watches/doxa-sub-200t', checked: C },
  { id: 'duro', title: 'Casio Duro MDV-106 review (Two Broke Watch Snobs)', url: 'https://twobrokewatchsnobs.com/casio-duro-review/', checked: C },
  { id: 'omega-007', title: 'Omega Seamaster Diver 300M 007 Edition review (Monochrome)', url: 'https://monochrome-watches.com/omega-seamaster-diver-300m-007-edition-210-90-42-20-01-001-review-price/', checked: C },
  { id: 'omega-prices', title: 'Omega price list 2026 (Watch Scanning)', url: 'https://www.watchscanning.com/guides/omega-price-guide/', checked: C },
  { id: 'tag-300', title: 'TAG Heuer Aquaracer Professional 300 WBP5116.BA0013 (Prestige Time)', url: 'https://www.prestigetime.com/Tag-Heuer-Aquaracer-Professional-300-Date-42mm-WBP5116-BA0013.html', checked: C },
  { id: 'panerai-1543', title: 'Panerai Submersible QuarantaQuattro Luna Rossa Ti-Ceramitech (Panerai)', url: 'https://panerai.com/gb/en/collections/watch-collection/submersible/pam01543-submersible-quarantaquattro-luna-rossa-ti-ceramitech.html', checked: C },
  { id: 'panerai-1543-price', title: 'PAM01543 retail price (Hour Striker)', url: 'https://hourstriker.com/database/panerai-submersible-quarantaquattro-luna-rossa-ticeramitech-pam01543-3599', checked: C },
  { id: 'bremont-500', title: 'Bremont Supermarine 500M SM43-DT-SS-BK-B (Exquisite Timepieces)', url: 'https://www.exquisitetimepieces.com/products/bremont-sm43-dt-ss-bk-b-supermarine-500m-on-bracelet', checked: C },
  { id: 'zenith-ded', title: 'Zenith Defy Extreme Diver (Prestige Time)', url: 'https://www.prestigetime.com/Zenith-Defy-Extreme-Diver-95-9601-3620-51-I301.html', checked: C },
  { id: 'zenith-sjx', title: 'Zenith Defy Extreme Diver launch (SJX)', url: 'https://watchesbysjx.com/2024/11/zenith-defy-extreme-diver.html', checked: C },
  { id: 'unimatic', title: 'Unimatic Modello Uno Prodiver (Gear Patrol)', url: 'https://www.gearpatrol.com/?p=914587', checked: C },
  { id: 'tag-superdiver', title: 'TAG Heuer Aquaracer Professional 1000 Superdiver (TAG Heuer)', url: 'https://tagheuer.com/ng/en/timepieces/collections/tag-heuer-aquaracer/45-mm-th30-00/WBP5A8A.BF0619.html', checked: C },
  { id: 'breitling-sd', title: 'Breitling Superocean Automatic 46 Super Diver E10379D31L1S1 (Prestige Time)', url: 'https://www.prestigetime.com/Breitling-Superocean-Automatic-46-Super-Diver-E10379D31L1S1.html', checked: C },
  { id: 'doxa-300t', title: 'DOXA SUB 300T Professional (Watches of Switzerland)', url: 'https://www.watchesofswitzerland.com/products/doxa-sub-300t-840-10-351-10-18800049', checked: C },
  { id: 'doxa-300t-ethos', title: 'DOXA SUB 300T Professional (Ethos)', url: 'https://www.ethoswatches.com/product-doxa-sub-300t-professional-840-10-351-10.html', checked: C },
  { id: 'bremont-s2000', title: 'Bremont S2000, retired from the catalogue (Bremont)', url: 'https://www.bremont.com/products/s2000-red', checked: C },
  { id: 'sinn-ux', title: 'Sinn UX (EZM 2B) (Sinn)', url: 'https://www.sinn.de/en/watches/ux-ezm-2b.html', checked: C },
  { id: 'rolex-prices', title: 'Rolex price guide 2026 (5D Watches)', url: 'https://5dwatches.com/blog/rolex-price-guide-2026', checked: C },
  { id: 'ff-42', title: 'Blancpain Fifty Fathoms Automatique 42mm (Gear Patrol)', url: 'https://www.gearpatrol.com/watches/blancpain-fifty-fathoms-automatique-42mm-steel', checked: C },
  { id: 'ressence', title: 'Ressence Type 5 review (Monochrome)', url: 'https://monochrome-watches.com/ressence-type-5-price-review/', checked: C },
  { id: 'fx', title: 'USD to INR exchange rate, 13 November 2026 (MarketXLS)', url: 'https://marketxls.com/indicators/usd-to-inr-exchange-rate', checked: C },

  // Animals
  { id: 'turtle-breath', title: 'How long can sea turtles hold their breath? (Olive Ridley Project)', url: 'https://oliveridleyproject.org/?p=7506', checked: C },
  { id: 'penguin', title: 'How deep can emperor penguins dive? (Australian Antarctic Division)', url: 'https://www.antarctica.gov.au/about-antarctica/animals/penguins/emperor-penguin/how-deep-can-they-dive/', checked: C },
  { id: 'nautilus', title: 'Nautilus depth range and shell implosion (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Nautilus', checked: C },
  { id: 'sponge', title: 'Venus’ flower basket (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Venus%27_flower_basket', checked: C },
  { id: 'snailfish-nhm', title: 'Deepest ever fish filmed at 8,336 m (Natural History Museum)', url: 'https://nhm.ac.uk/discover/news/2023/april/deepest-ever-fish-filmed-depth-8336-metres.html', checked: C },
];

export const sourceById = (id: string) => SOURCES.find((s) => s.id === id);
