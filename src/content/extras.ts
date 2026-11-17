import type { Myth, HistoryItem, Model, GlossaryEntry } from './types';

export const MYTHS: Myth[] = [
  {
    id: 'thirty',
    claim: 'My watch says 30m, so I can swim with it.',
    verdict: 'myth',
    answer: '30m (3 bar) means rain, handwashing and splashes. Makers recommend at least 100m for swimming. The number is a lab test pressure, not a depth.',
  },
  {
    id: 'jump',
    claim: 'Diving into a pool can push past my watch’s rating.',
    verdict: 'myth',
    answer: 'Hitting the water from a 3m board adds roughly 0.3 bar, the pressure of 3m of water. What actually lets water in: an unscrewed crown, old gaskets and heat.',
  },
  {
    id: 'pushers',
    claim: 'It’s fine to press the chronograph pushers underwater.',
    verdict: 'depends',
    answer: 'On most watches, no: pressing a pusher opens a path past its gasket. A few are built for it and say so. If yours doesn’t say so, don’t.',
  },
  {
    id: 'shower',
    claim: 'A hot shower or sauna is no problem for a dive watch.',
    verdict: 'mostly-myth',
    answer: 'Heat makes metal and rubber expand at different rates, and steam gets into places liquid water can’t. Most makers advise against it.',
  },
  {
    id: 'forever',
    claim: 'Water resistance lasts as long as the watch does.',
    verdict: 'myth',
    answer: 'Gaskets harden and crack with age. Most makers suggest a pressure test every year or two, and new gaskets whenever the case is opened.',
  },
  {
    id: 'waterproof',
    claim: 'Some watches are waterproof.',
    verdict: 'myth',
    answer: 'The standard term is “water resistant”, because no seal lasts forever. A rating is a promise about a test, not a guarantee for life.',
  },
];

/** The real-world ladder. "use" is the deepest everyday activity each rating is generally sold for. */
export const LADDER = [
  { rating: '“Water resistant”', bar: '2 bar', use: 'Rain and splashes', note: 'No number on the dial means the minimum test: about 2 bar.' },
  { rating: '30m', bar: '3 bar', use: 'Rain, handwashing', note: 'Not for swimming.' },
  { rating: '50m', bar: '5 bar', use: 'Light swimming', note: 'No diving, no snorkelling.' },
  { rating: '100m', bar: '10 bar', use: 'Swimming, snorkelling', note: 'Not built for scuba unless it says Diver’s.' },
  { rating: 'Diver’s 100–200m', bar: 'ISO 6425', use: 'Recreational scuba', note: 'Tested at 125% of the rating, plus legibility, shock and magnetism.' },
  { rating: '300m and up', bar: 'ISO 6425', use: 'Deep and technical diving', note: 'Often with a helium valve for saturation work.' },
  { rating: '1,000m and up', bar: '—', use: 'Saturation diving, and showing off', note: 'Deeper than any human works.' },
];

/** Dial markings for the decoder. Each tap target explains one claim. */
export const DIAL_MARKS = [
  { id: 'divers', text: 'DIVER’S 200m', meaning: 'A protected term under ISO 6425. The watch passed the diver’s tests: 125% overpressure for two hours, legibility in the dark, a bezel that only turns one way, resistance to shock, salt water and magnetism.' },
  { id: 'wr', text: 'WATER RESIST 200M', meaning: 'ISO 2281 or the maker’s own test: the watch survived 200m’s pressure for ten minutes when new. Fine for swimming. It doesn’t claim to be a diving instrument.' },
  { id: 'bar', text: '20 BAR', meaning: 'The same pressure as 200m of water, written as a pressure. 10 bar is roughly 100m. Some makers prefer bar because it’s honest about being a test.' },
  { id: 'atm', text: '20 ATM', meaning: 'Atmospheres. One atmosphere is about one bar, so 20 ATM ≈ 20 bar ≈ 200m. Three ways of writing the same number.' },
  { id: 'helium', text: 'HE', meaning: 'A helium escape valve. Only matters if you live in a saturation chamber breathing helium.' },
  { id: 'mixed', text: 'FOR MIXED-GAS DIVING', meaning: 'An extra ISO 6425 test: the watch spent 15 days in pressurised gas, then was decompressed in minutes without losing its crystal.' },
];

export const HISTORY: HistoryItem[] = [
  { year: '1926', title: 'The Oyster', text: 'Rolex patents a hermetically sealed case.' },
  { year: '1932', title: 'Omega Marine', text: 'Credited as the first dive watch made for sale.' },
  { year: '1936', title: 'Panerai Radiomir', text: 'Luminous watches for Italian Navy frogmen.' },
  { year: '1953', title: 'Fifty Fathoms and Submariner', text: 'The modern dive watch arrives twice in one year.', plate: 'fifty-fathoms' },
  { year: '1960', title: 'Deep Sea Special', text: 'A Rolex prototype rides the Trieste to the Challenger Deep.', plate: 'deep-sea-special' },
  { year: '1965', title: 'Seiko 62MAS', text: 'Japan’s first professional diver.' },
  { year: '1967', title: 'Orange and helium', text: 'Doxa’s orange SUB 300; Rolex patents the helium escape valve for the Sea-Dweller.', plate: 'sea-dweller' },
  { year: '1970', title: 'Ploprof', text: 'Omega’s monobloc tool for professional divers.', plate: 'ploprof' },
  { year: '1975', title: 'The Tuna', text: 'Seiko shrouds a 600m saturation diver.' },
  { year: '1982', title: 'ISO 6425', text: 'The first international standard for divers’ watches.' },
  { year: '1983', title: 'Dive computers', text: 'Dive computers start doing the decompression maths.' },
  { year: '2011', title: '4,000m', text: 'Hublot’s Oceanographic 4000.', plate: 'hublot-oceanographic' },
  { year: '2012', title: 'Cameron’s dive', text: 'An experimental Rolex reaches the bottom again.', plate: 'dsc-2012' },
  { year: '2019', title: 'Three Omegas', text: 'Ultra Deep prototypes reach 10,928m.', plate: 'omega-ud-prototypes' },
  { year: '2022', title: '11,000m for sale', text: 'Rolex puts the Deepsea Challenge into production.' },
];

/**
 * Popular watches for "Bring your watch". Typical rating for current references;
 * individual references vary, so the picker tells readers to check the caseback.
 */
export const MODELS: Model[] = [
  { name: 'Apple Watch (Series, SE)', rating: 50, diver: false, style: 'smart', note: 'WR50 under ISO 22810' },
  { name: 'Apple Watch Ultra', rating: 100, diver: false, use: 40, style: 'smart', note: 'Apple rates it for recreational dives to 40m (EN 13319)' },
  { name: 'Garmin Fenix', rating: 100, diver: false, style: 'smart' },
  { name: 'Casio F-91W', rating: 20, diver: false, style: 'digital', note: '“Water resist”: splashes only' },
  { name: 'Casio G-Shock DW-5600', rating: 200, diver: false, style: 'digital' },
  { name: 'Casio G-Shock Frogman', rating: 200, diver: true, style: 'digital' },
  { name: 'Casio Duro MDV-106', rating: 200, diver: false, style: 'diver' },
  { name: 'Timex Weekender', rating: 30, diver: false, style: 'dress' },
  { name: 'Swatch (classic)', rating: 30, diver: false, style: 'dress' },
  { name: 'Seiko 5 Sports', rating: 100, diver: false, style: 'diver' },
  { name: 'Seiko SKX007', rating: 200, diver: true, style: 'diver' },
  { name: 'Seiko Prospex “Turtle”', rating: 200, diver: true, style: 'diver' },
  { name: 'Seiko Prospex Alpinist', rating: 200, diver: false, style: 'sport' },
  { name: 'Citizen Promaster Diver NY0040', rating: 200, diver: true, style: 'diver' },
  { name: 'Orient Kamasu', rating: 200, diver: false, style: 'diver' },
  { name: 'Tissot PRX', rating: 100, diver: false, style: 'sport' },
  { name: 'Tissot Seastar 1000', rating: 300, diver: true, style: 'diver' },
  { name: 'Hamilton Khaki Field Mechanical', rating: 50, diver: false, style: 'sport' },
  { name: 'Longines HydroConquest', rating: 300, diver: false, style: 'diver' },
  { name: 'Oris Aquis', rating: 300, diver: false, style: 'diver' },
  { name: 'Oris Divers Sixty-Five', rating: 100, diver: false, style: 'diver' },
  { name: 'Christopher Ward C60 Trident Pro 600', rating: 600, diver: true, style: 'diver' },
  { name: 'Squale 1521', rating: 500, diver: false, style: 'diver' },
  { name: 'Sinn U1', rating: 1000, diver: true, style: 'diver' },
  { name: 'DOXA SUB 300', rating: 300, diver: true, style: 'diver' },
  { name: 'Tudor Black Bay 58', rating: 200, diver: true, style: 'diver' },
  { name: 'Tudor Black Bay', rating: 200, diver: true, style: 'diver' },
  { name: 'Tudor Pelagos', rating: 500, diver: true, style: 'diver' },
  { name: 'Tudor Ranger', rating: 100, diver: false, style: 'sport' },
  { name: 'TAG Heuer Aquaracer Professional 300', rating: 300, diver: true, style: 'diver' },
  { name: 'TAG Heuer Carrera', rating: 100, diver: false, style: 'chrono' },
  { name: 'Breitling Superocean', rating: 300, diver: true, style: 'diver' },
  { name: 'Breitling Navitimer', rating: 30, diver: false, style: 'chrono' },
  { name: 'Omega Seamaster Diver 300M', rating: 300, diver: true, style: 'diver' },
  { name: 'Omega Seamaster Aqua Terra', rating: 150, diver: false, style: 'sport' },
  { name: 'Omega Speedmaster Moonwatch', rating: 50, diver: false, style: 'chrono' },
  { name: 'Omega Planet Ocean 600M', rating: 600, diver: true, style: 'diver' },
  { name: 'Rolex Submariner', rating: 300, diver: true, style: 'diver' },
  { name: 'Rolex Sea-Dweller', rating: 1220, diver: true, style: 'diver' },
  { name: 'Rolex Deepsea', rating: 3900, diver: true, style: 'diver' },
  { name: 'Rolex GMT-Master II', rating: 100, diver: false, style: 'sport' },
  { name: 'Rolex Datejust', rating: 100, diver: false, style: 'dress' },
  { name: 'Rolex Daytona', rating: 100, diver: false, style: 'chrono' },
  { name: 'Rolex Explorer', rating: 100, diver: false, style: 'sport' },
  { name: 'Rolex Oyster Perpetual', rating: 100, diver: false, style: 'dress' },
  { name: 'Grand Seiko “Snowflake”', rating: 100, diver: false, style: 'dress' },
  { name: 'Cartier Santos', rating: 100, diver: false, style: 'dress' },
  { name: 'Cartier Tank', rating: 30, diver: false, style: 'dress' },
  { name: 'Audemars Piguet Royal Oak', rating: 50, diver: false, style: 'sport' },
  { name: 'Patek Philippe Nautilus', rating: 120, diver: false, style: 'sport' },
  { name: 'Patek Philippe Calatrava', rating: 30, diver: false, style: 'dress' },
  { name: 'Panerai Luminor', rating: 300, diver: false, style: 'sport' },
  { name: 'Panerai Submersible', rating: 300, diver: true, style: 'diver' },
  { name: 'Blancpain Fifty Fathoms', rating: 300, diver: true, style: 'diver' },
  { name: 'IWC Pilot’s Watch Mark XX', rating: 100, diver: false, style: 'sport' },
  { name: 'Hublot Big Bang', rating: 100, diver: false, style: 'chrono' },
];

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'Bar / ATM', def: 'Units of pressure. One bar is roughly the air pressure at sea level; every 10m of seawater adds about one more. 1 ATM ≈ 1 bar.' },
  { term: 'ISO 6425', def: 'The international standard for divers’ watches. Only watches that pass it may say “Diver’s” on the dial.' },
  { term: 'ISO 2281', def: 'The standard for ordinary water-resistant watches: a pressure test at the rated depth, not a diving certification.' },
  { term: 'Gasket', def: 'A ring of rubber or synthetic that seals a joint in the case. Gaskets age and need replacing.' },
  { term: 'Screw-down crown', def: 'A crown that threads onto the case, compressing a gasket. It must be screwed in before you swim.' },
  { term: 'Unidirectional bezel', def: 'A rotating ring that only turns anticlockwise, so an accidental knock can only overstate your time underwater.' },
  { term: 'HEV', def: 'Helium escape valve. Lets helium that seeped in during saturation diving escape during decompression.' },
  { term: 'Monocoque', def: 'A one-piece case with no removable back; the movement goes in through the front.' },
  { term: 'Lume', def: 'Luminous material on the dial and hands. Most is a pigment that charges in light; some watches use sealed tritium tubes.' },
  { term: 'Sapphire', def: 'Synthetic corundum used for crystals. Very hard to scratch; can shatter if hit hard.' },
  { term: 'COSC', def: 'The Swiss chronometer testing office. A COSC movement was tested to keep time within −4/+6 seconds a day.' },
  { term: 'Master Chronometer', def: 'Certification by METAS, the Swiss metrology institute: tested cased, with tighter accuracy and resistance to 15,000 gauss.' },
  { term: 'Spring Drive', def: 'Grand Seiko’s hybrid: a mainspring powers it, a quartz crystal and electromagnetic brake regulate it.' },
  { term: 'Saturation diving', def: 'Living under pressure for weeks so divers decompress once, at the end, instead of after every shift.' },
  { term: 'Hadal', def: 'The ocean’s deepest zone, below 6,000m, found only in trenches.' },
];

/** Care advice for the surface. */
export const CARE = [
  { title: 'Screw the crown down', text: 'Every time. Check it before you get in the water.' },
  { title: 'Rinse after salt and chlorine', text: 'Fresh water, then dry it. Turn the bezel while you rinse to flush out salt.' },
  { title: 'Keep it out of the sauna', text: 'Heat and steam are harder on gaskets than water is.' },
  { title: 'Don’t work the crown or pushers wet', text: 'Unless the maker says you can.' },
  { title: 'Pressure-test it', text: 'Every year or two if you swim with it, and after any battery change or service.' },
  { title: 'Service on schedule', text: 'Most mechanical watches want a service every 5 to 10 years. Gaskets get replaced then.' },
];
