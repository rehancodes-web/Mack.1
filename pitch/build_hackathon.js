// Builds pitch/NavContinuity_Hackathon.pptx: the hackathon pitch deck (problem, gap, solution, tech, results per track,
// AI decisions, originality, feasibility, business, rules). Usage: cd pitch && node build_hackathon.js
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require(path.join(__dirname, 'apply_theme.js'));

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'NavContinuity_Hackathon.pptx');
const rd = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const img = f => path.join(ROOT, 'a6', 'outputs', f);
const met = rd('a6/outputs/classifier_metrics.json'), dec = rd('a6/outputs/decision.json');
const phys = rd('b3/outputs/b3_physics.json'), sim = rd('b3/outputs/b3_sim.json').results;
const gsum = rd('c/outputs/gnss_summary.json'), ND = rd('decisions/nemotron_decisions.json');
const SITE = 'rehancodes-web.github.io/Mack.1';
const csv = fs.readFileSync(path.join(ROOT, 'a6/outputs/progress_ai.csv'), 'utf8').replace(/\r/g, '').trim().split('\n');
const HD = csv[0].split(','), rows = csv.slice(1).map(l => Object.fromEntries(l.split(',').map((v, i) => [HD[i], v])));
const ser = rows.filter(r => r.converted_12m !== '' && r.baseline_cleared_12m !== '');

// Navigation-display palette (same as the website): panel slate, magenta = ours, amber = caution, cyan = data, green = normal
const THEME = { name: 'NavContinuity ND', headFontFace: 'Calibri', bodyFontFace: 'Calibri',
  colors: { dk1: '12212E', lt1: 'E8EEF3', dk2: '183041', lt2: '1F3B4F', accent1: 'E05FD0', accent2: 'F2A93B', accent3: '4FD1E0', accent4: '5FD38D', accent5: '97ABBA', accent6: 'EF5A5A', hlink: '4FD1E0', folHlink: '97ABBA' } };
const K = THEME.colors;
const PANEL = K.dk1, CARD = K.dk2, CARD2 = K.lt2, INK = K.lt1, DIM = K.accent5, ROUTE = K.accent1, CAUT = K.accent2, DATA = K.accent3, OK = K.accent4, WARN = K.accent6;

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'NavContinuity: Mach-A-Thon Aeromania 26';
pres.author = 'NavContinuity team';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
pres.defineSlideMaster({ title: 'COVER', background: { color: PANEL }, objects: [] });
pres.defineSlideMaster({ title: 'MAIN', background: { color: PANEL },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.32, w: 9, h: 0.62, fontSize: 26, bold: true, color: C.background1, valign: 'middle', margin: 0 }, text: '' } },
    { text: { text: 'NavContinuity  |  Mach-A-Thon Aeromania 26', options: { x: 0.5, y: 5.28, w: 6, h: 0.22, fontSize: 8, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: 9.1, y: 5.28, w: 0.4, h: 0.22, fontSize: 8, color: C.accent5, align: 'right' } });

const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, fontFace: THEME.bodyFontFace, color: INK, ...o });
const box = (s, x, y, w, h, fill, name, line) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: line || fill, width: line ? 1.25 : 0 }, objectName: name });
const kicker = (s, text, color) => T(s, text, { x: 0.5, y: 0.08, w: 9, h: 0.26, fontSize: 11, bold: true, color });
const bl = (arr, color, size) => arr.map((t, i) => ({ text: t, options: { bullet: { indent: 14 }, color: color || INK, fontSize: size, breakLine: i < arr.length - 1 } }));
const add = (sec, title) => { const s = pres.addSlide({ masterName: 'MAIN', sectionTitle: sec }); s.addText(title, { placeholder: 'title' }); return s; };
const stat = (s, x, y, w, h, big, small, color, fill) => { box(s, x, y, w, h, fill || CARD, small); T(s, big, { x: x + 0.18, y: y + 0.1, w: w - 0.3, h: h * 0.5, fontSize: 26, bold: true, color: color || INK, valign: 'bottom' }); T(s, small, { x: x + 0.18, y: y + h * 0.58, w: w - 0.3, h: h * 0.38, fontSize: 11, color: DIM, valign: 'top' }); };
const tbl = (s, head, body, opt) => s.addTable([head.map(t => ({ text: t, options: { bold: true, color: INK, fill: { color: CARD2 } } })), ...body.map(r => r.map(c => typeof c === 'string' ? { text: c, options: { color: INK, fill: { color: CARD } } } : c))], { fontFace: THEME.bodyFontFace, border: { type: 'solid', color: PANEL, pt: 1.5 }, valign: 'middle', ...opt });

// ---------- 1. Cover ----------
pres.addSection({ title: 'Opening' });
let s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Opening' });
s.addImage({ path: img('hires_2026-05-28.jpg'), x: 4.6, y: 0, w: 5.4, h: 5.625, sizing: { type: 'cover', w: 5.4, h: 5.625 }, transparency: 20, altText: 'Noida International Airport, 2026, from orbit (Esri World Imagery Wayback)' });
s.addShape(pres.shapes.OVAL, { x: 5.2, y: 0.6, w: 4.2, h: 4.2, fill: { type: 'none' }, line: { color: INK, width: 1, transparency: 40 } });
s.addShape(pres.shapes.LINE, { x: 5.9, y: 1.35, w: 1.4, h: 1.4, line: { color: ROUTE, width: 3.5 } });
T(s, 'Delhi IGI', { x: 5.55, y: 1.05, w: 1.2, h: 0.25, fontSize: 11, bold: true });
T(s, 'Jewar', { x: 7.4, y: 2.7, w: 1, h: 0.25, fontSize: 11, bold: true });
box(s, 6.45, 0.35, 2.3, 0.36, PANEL, 'Annunciator', CAUT);
T(s, 'GPS PRIMARY LOST', { x: 6.45, y: 0.35, w: 2.3, h: 0.36, fontSize: 12, bold: true, color: CAUT, align: 'center', valign: 'middle' });
T(s, 'NavContinuity', { x: 0.5, y: 0.9, w: 4, h: 0.6, fontSize: 34, bold: true });
T(s, 'When GPS fails near an airport, find where, send the flights somewhere safe, harden positioning, and look after every passenger.', { x: 0.5, y: 1.65, w: 3.9, h: 1.2, fontSize: 15, color: DIM });
[['Track A6  Infrastructure (compulsory)', ROUTE], ['Track B3  Positioning & sensing', OK], ['Track C  GNSS resilience', DATA]].forEach(([t, c], i) => {
  s.addShape(pres.shapes.OVAL, { x: 0.5, y: 3.18 + i * 0.42, w: 0.2, h: 0.2, fill: { color: c }, line: { color: c } });
  T(s, t, { x: 0.85, y: 3.1 + i * 0.42, w: 3.6, h: 0.36, fontSize: 13, bold: true, valign: 'middle' });
});
T(s, `Mach-A-Thon Aeromania 26  |  with Boeing  |  ${SITE}`, { x: 0.5, y: 4.95, w: 4, h: 0.3, fontSize: 10, color: DIM });
s.addNotes('0:00-0:15. One line: GPS jamming is now daily around Indian airports. We built the chain from detecting it to recovering passengers, across Tracks A6, B3 and C.');

// ---------- 2. Problem ----------
pres.addSection({ title: 'Problem' });
s = add('Problem', 'GPS jamming and spoofing are now routine in Indian airspace');
kicker(s, 'The problem', CAUT);
stat(s, 0.5, 1.15, 2.85, 1.35, '2,354', 'GPS interference incidents reported to India\'s Parliament, Nov 2023 – Dec 2025', CAUT);
stat(s, 3.575, 1.15, 2.85, 1.35, '+500%', 'GPS spoofing reports, 2024 vs 2023 (IATA)', CAUT);
stat(s, 6.65, 1.15, 2.85, 1.35, '71%', 'of Indian incidents in 2025 meant total loss of GPS on board', CAUT);
box(s, 0.5, 2.75, 9, 1.0, CARD, 'Delhi', CAUT);
T(s, [{ text: 'Delhi, 2025. ', options: { bold: true, color: CAUT } }, { text: 'Flights approaching IGI Runway 10 on GPS procedures were spoofed. Crews fell back to contingency procedures and DGCA introduced real-time spoofing reporting.', options: {} }], { x: 0.72, y: 2.8, w: 8.6, h: 0.9, fontSize: 14, valign: 'middle' });
T(s, bl(['Holding and extra spacing cut airport capacity', 'Flights divert; receivers can need a ground reset before the next departure', 'Every delay lands on passengers in the terminal'], INK, 13), { x: 0.5, y: 3.95, w: 9, h: 1.1, paraSpaceAfter: 3 });
T(s, 'Sources: Lok Sabha answer 12 Mar 2026; IATA; ICAO Asia-Pacific Jan 2026 (all reported)', { x: 0.5, y: 5.05, w: 9, h: 0.2, fontSize: 8, color: DIM });
s.addNotes('0:15-0:45. Three numbers, then Delhi. The danger is not only safety: it is capacity, diversions and stranded passengers.');

// ---------- 3. Passenger pain ----------
s = add('Problem', 'What a GPS failure does to the people in the terminal');
kicker(s, 'The human cost', CAUT);
const flow = [['GPS jammed', CAUT], ['Holding', DIM], ['Delay or diversion', DIM], ['Stranded passengers', WARN]];
flow.forEach(([t, c], i) => { const x = 0.5 + i * 2.3; box(s, x, 1.15, 2.05, 0.6, CARD, t, c); T(s, t, { x, y: 1.15, w: 2.05, h: 0.6, fontSize: 13, bold: true, align: 'center', valign: 'middle', color: c === DIM ? INK : c }); if (i < 3) T(s, '>', { x: x + 2.07, y: 1.15, w: 0.2, h: 0.6, fontSize: 16, color: DIM, valign: 'middle' }); });
const pain = [['"15 more minutes", for hours', 'then a cancellation'], ['Missed connections', 'the onward flight leaves first'], ['Bad automatic rebooking', 'sent to the wrong city'], ['Hotel voucher, wrong city', 'issued where they are not'], ['Bag on another route', 'the passenger moves, the bag does not']];
pain.forEach(([h, d], i) => { const y = 2.0 + i * 0.6; T(s, [{ text: h, options: { bold: true, breakLine: true } }, { text: d, options: { color: DIM, fontSize: 11 } }], { x: 0.5, y, w: 4.9, h: 0.55, fontSize: 14, valign: 'middle' }); });
stat(s, 5.7, 2.0, 3.8, 0.9, '€1,000–77,200', 'cost of one diverted flight (EUROCONTROL, 2022 prices)', CAUT);
stat(s, 5.7, 3.0, 3.8, 0.9, '$98 per minute', 'aircraft operating cost (Airlines for America, 2025)', CAUT);
stat(s, 5.7, 4.0, 3.8, 0.9, '≈ $4,430', 'direct cost of a 45-minute delay, before hotels and rebooking', INK);
s.addNotes('0:45-1:05. Name two pains. Costs are published industry averages, not costs proven to be caused by GPS.');

// ---------- 4. The gap ----------
s = add('Problem', 'Today these are three separate tools that never talk');
kicker(s, 'What is missing', ROUTE);
const silos = [['GPS interference monitoring', 'Maps where GPS is degraded', 'Stops at the map'], ['Airport and airline operations', 'Plans diversions with known alternates', 'Does not know which alternate is ready or clean'], ['Passenger rebooking', 'Rebooks after the fact', 'Starts only once the disruption has happened']];
silos.forEach(([h, d, gap], i) => { const x = 0.5 + i * 3.05; box(s, x, 1.15, 2.85, 2.35, CARD, h); T(s, h, { x: x + 0.2, y: 1.28, w: 2.45, h: 0.6, fontSize: 15, bold: true }); T(s, d, { x: x + 0.2, y: 1.95, w: 2.45, h: 0.6, fontSize: 12, color: DIM }); T(s, gap, { x: x + 0.2, y: 2.65, w: 2.45, h: 0.7, fontSize: 12, bold: true, color: CAUT }); });
box(s, 0.5, 3.75, 9, 1.3, CARD, 'Our gap', ROUTE);
T(s, [{ text: 'The unsolved problem: ', options: { bold: true, color: ROUTE } }, { text: 'nobody connects "GPS is failing here" to "this airport can take the flights" to "this passenger is confirmed on a real seat". The warning, the capacity and the recovery live in different systems, so passengers absorb the gap.', options: {} }], { x: 0.75, y: 3.8, w: 8.5, h: 1.2, fontSize: 14, valign: 'middle' });
s.addNotes('1:05-1:25. This is the originality claim in one slide; the comparison table comes later.');

// ---------- 5. Solution ----------
pres.addSection({ title: 'Solution' });
s = add('Solution', 'NavContinuity: one chain from GPS failure to passenger outcome');
kicker(s, 'Our solution', ROUTE);
const legs = [['Detect', 'Where is GPS failing right now?', 'Track C', DATA], ['Absorb', 'Which airport can take the diverted flights?', 'Track A6', ROUTE], ['Harden', 'Positioning that is harder to jam or spoof', 'Track B3', OK], ['Recover', 'Confirmed seat, right-city hotel, tracked bag', 'Who pays', CAUT]];
legs.forEach(([h, d, tr, c], i) => { const x = 0.5 + i * 2.3; box(s, x, 1.15, 2.1, 2.45, CARD, h, c); s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: 1.32, w: 0.42, h: 0.42, fill: { color: c }, line: { color: c } }); T(s, String(i + 1), { x: x + 0.2, y: 1.32, w: 0.42, h: 0.42, fontSize: 15, bold: true, color: PANEL, align: 'center', valign: 'middle' }); T(s, h, { x: x + 0.2, y: 1.88, w: 1.8, h: 0.4, fontSize: 18, bold: true }); T(s, d, { x: x + 0.2, y: 2.3, w: 1.75, h: 0.85, fontSize: 12, color: DIM }); T(s, tr, { x: x + 0.2, y: 3.18, w: 1.75, h: 0.3, fontSize: 12, bold: true, color: c }); });
box(s, 0.5, 3.85, 9, 1.2, CARD2, 'Worked example');
T(s, [{ text: 'Delhi, worked through: ', options: { bold: true, color: ROUTE } }, { text: 'Track C flags interference on the Delhi side. Track A6 confirms Noida International (Jewar), 70 km away, is built and in clean airspace. Flights are cleared there, and rebooking starts before they land. Track B3 is how the problem goes away for good.', options: {} }], { x: 0.75, y: 3.9, w: 8.5, h: 1.1, fontSize: 13, valign: 'middle' });
s.addNotes('1:25-1:45. Each track is one leg of the same flight. Walk the Delhi example.');

// ---------- 6. Architecture ----------
pres.addSection({ title: 'Technology' });
s = add('Technology', 'Architecture: free satellite data in, decisions out');
kicker(s, 'How it works', DATA);
const colsA = [
  ['Data in', DATA, ['Sentinel-2 L2A, 79 scenes (ESA)', 'ESA WorldCover 2021 labels', 'Esri Wayback sub-metre photos', 'ADS-B aircraft integrity reports', 'CelesTrak orbits (GPS, Galileo, NavIC, Iridium, Xona)']],
  ['Processing', INK, ['Cloud-optimised GeoTIFF reads: only the airport window', 'Cloud masking, per-scene scaling checks', 'Integrity ratings per 1° cell', 'Link budget and orbit geometry']],
  ['AI', ROUTE, ['Larper: Random Forest, 10 features, every 10 m pixel', 'NVIDIA Nemotron: operations decisions on real cases', 'Human check on every AI answer']],
  ['Out', OK, ['Release-or-inspect decision', 'GPS malfunction map', '3D globe of real constellations', 'Passenger recovery plan']],
];
colsA.forEach(([h, c, items], i) => { const x = 0.5 + i * 2.3; box(s, x, 1.1, 2.1, 3.5, CARD, h); T(s, h, { x: x + 0.18, y: 1.2, w: 1.8, h: 0.35, fontSize: 15, bold: true, color: c }); T(s, bl(items, INK, 11), { x: x + 0.15, y: 1.6, w: 1.85, h: 2.9, valign: 'top', paraSpaceAfter: 5 }); if (i < 3) T(s, '>', { x: x + 2.11, y: 2.6, w: 0.18, h: 0.4, fontSize: 18, bold: true, color: DIM }); });
T(s, 'Stack: Node.js pipelines (geotiff.js, proj4, ml-random-forest) · NVIDIA Nemotron API · static site on GitHub Pages · all data sources free and public', { x: 0.5, y: 4.75, w: 9, h: 0.3, fontSize: 11, color: DIM });
s.addNotes('1:45-2:05. Everything runs on free, public data and a laptop. No paid imagery.');

// ---------- 7. Larper ----------
s = add('Technology', 'Larper: our AI that labels every 10 m of the airport');
kicker(s, 'Track A6  |  machine learning', ROUTE);
s.addImage({ path: img('classmap_2026-03.png'), x: 0.5, y: 1.1, w: 4.3, h: 2.5, sizing: { type: 'contain', w: 4.3, h: 2.5 }, altText: 'Larper class map of the airport, March 2026' });
T(s, 'Larper map, March 2026: red built or paved, sand bare, green vegetation, blue water', { x: 0.5, y: 3.65, w: 4.3, h: 0.4, fontSize: 10, color: DIM });
T(s, bl(['Random Forest, 60 trees, 10 features (6 Sentinel-2 bands + NDVI, NDBI, water and bare-soil indices)', 'Trained on ESA WorldCover 2021 labels outside the airport only', 'Tested on a separate block of land it never saw', 'Runs on all 79 months; cloudy months reported as gaps, not zero'], INK, 12), { x: 5.05, y: 1.1, w: 4.45, h: 2.2, paraSpaceAfter: 5, valign: 'top' });
const bp = met.per_class.find(c => c.class === 'built_paved'), vg = met.per_class.find(c => c.class === 'vegetation');
tbl(s, ['Test result', 'Value'], [['Agreement with WorldCover', `${Math.round(met.overall_accuracy * 100)}%`], ['Built/paved recall', `${Math.round(bp.recall * 100)}%`], ['Vegetation precision', `${Math.round(vg.precision * 100)}%`], ['Test pixels', met.n_test.toLocaleString('en-US')]], { x: 5.05, y: 3.35, w: 4.45, colW: [2.95, 1.5], fontSize: 11, rowH: 0.3 });
T(s, 'WorldCover is itself a model, so this is agreement, not ground truth. Bare-soil recall is weak (31%).', { x: 0.5, y: 4.85, w: 9, h: 0.25, fontSize: 9, color: DIM });
s.addNotes('2:05-2:20. Technical depth: honest train/test split by geography, and we report the weak class.');

// ---------- 8. A6 result ----------
pres.addSection({ title: 'Results' });
s = add('Results', 'Track A6: satellites saw half of what was reported');
kicker(s, 'Track A6  |  real data result', ROUTE);
s.addChart(pres.charts.LINE, [{ name: 'Larper: converted land', labels: ser.map(r => r.month), values: ser.map(r => Math.round(r.converted_12m * 100)) }, { name: 'Baseline: cleared all year', labels: ser.map(r => r.month), values: ser.map(r => Math.round(r.baseline_cleared_12m * 100)) }],
  { x: 0.4, y: 1.05, w: 5.7, h: 3.6, chartColors: [ROUTE, DATA], lineSize: 2, lineDataSymbol: 'none', valAxisMinVal: 0, valAxisMaxVal: 100, valAxisLabelFormatCode: '0"%"',
    valAxisLabelColor: DIM, catAxisLabelColor: DIM, valAxisLabelFontSize: 10, catAxisLabelFontSize: 9, catAxisLabelFrequency: 12, valAxisLabelFontFace: '+mn-lt', catAxisLabelFontFace: '+mn-lt',
    valGridLine: { color: CARD2, size: 0.75 }, catGridLine: { style: 'none' }, showLegend: true, legendPos: 'b', legendFontSize: 10, legendColor: DIM, legendFontFace: '+mn-lt',
    plotArea: { fill: { color: PANEL } }, showTitle: true, title: 'Share of the 1,333 ha site converted, 2020–2026', titleFontSize: 11, titleColor: INK, titleFontFace: '+mn-lt' });
stat(s, 6.35, 1.05, 3.15, 1.0, '80%', '"complete", builder\'s claim, Jan 2025 (reported)', INK);
stat(s, 6.35, 2.15, 3.15, 1.0, `${dec.satellite_observed_pct}%`, 'land converted, seen from orbit, Jan 2025 (derived)', ROUTE);
box(s, 6.35, 3.25, 3.15, 1.4, CARD, 'Decision', ROUTE);
T(s, [{ text: 'Decision: INSPECT', options: { bold: true, color: ROUTE, breakLine: true } }, { text: `A ${dec.gap_pts}-point gap raises the chance the report is optimistic; inspecting ($15k) beats releasing blind. Costs assumed.`, options: { fontSize: 11, color: DIM } }], { x: 6.52, y: 3.32, w: 2.85, h: 1.28, fontSize: 14, valign: 'top' });
T(s, 'Land conversion is not construction completion; it is the earliest physical signal.', { x: 0.5, y: 4.85, w: 9, h: 0.25, fontSize: 9, color: DIM });
s.addNotes('2:20-2:50. Key result. Nothing happens until mid-2023, peak in 2025. In January 2025, 80% claimed vs about half seen. That gap is when a lender should look.');

// ---------- 9. Track C ----------
s = add('Results', 'Track C: mapping where GPS is failing, from real aircraft data');
kicker(s, 'Track C  |  GNSS resilience', DATA);
s.addImage({ path: path.join(__dirname, 'gnss_map.png'), x: 0.5, y: 1.05, w: 4.0, h: 3.5, altText: 'GPS integrity per 1 degree cell over South Asia' });
T(s, 'Red: over 10% of aircraft degraded · amber 2–10% · green under 2% · white ring Delhi, blue dot Jewar', { x: 0.5, y: 4.6, w: 4.0, h: 0.4, fontSize: 9, color: DIM });
stat(s, 4.8, 1.05, 2.25, 1.05, gsum.reports.toLocaleString('en-US'), 'aircraft reports, one day', DATA);
stat(s, 7.25, 1.05, 2.25, 1.05, String(gsum.cells_high), 'high-interference zones', CAUT);
T(s, bl(['Method: aircraft broadcast a navigation integrity value (NIC); low values mean the aircraft distrusts its own GPS', 'Rated per 1° cell, needing 10+ aircraft per cell', 'Hotspots: India–Pakistan border and Myanmar', `Jewar region: ${gsum.jewar_region.status}, ${gsum.jewar_region.aircraft_seen.toLocaleString('en-US')} aircraft`, 'Protective only: areas, never individual aircraft or people'], INK, 12), { x: 4.8, y: 2.3, w: 4.7, h: 2.6, valign: 'top', paraSpaceAfter: 5 });
s.addNotes('2:50-3:10. Real data. One day already shows the border band. Jewar is clean, which matters for diversions.');

// ---------- 10. Track B3 ----------
const gn = sim['GPS + NavIC + LEO'], g0 = sim['GPS only'];
s = add('Results', 'Track B3: a low-orbit layer that is harder to jam or spoof');
kicker(s, 'Track B3  |  positioning & sensing', OK);
stat(s, 0.5, 1.1, 2.85, 1.3, `${phys.signal.leo_advantage_db} dB`, `stronger: 1,000 km vs 20,200 km, so a 10 W jammer\'s area shrinks ${phys.jamming.denial_area_reduction_factor}x (physics)`, OK);
stat(s, 3.575, 1.1, 2.85, 1.3, `${gn.spoofed_median_error_m_uncorrected} → ${gn.spoofed_median_error_m_ai_corrected} m`, 'spoofed position error, before and after AI cross-check (simulation)', OK);
stat(s, 6.65, 1.1, 2.85, 1.3, `~$${Math.round(phys.cost.capex_usd / 1e6)}M`, `${phys.constellation.satellites_needed} satellites at 1,000 km, ~$${Math.round(phys.cost.per_year_usd / 1e6)}M a year (assumed)`, INK);
tbl(s, ['Constellation', 'Spoofing detected', 'False alarms', 'Spoofed error'], Object.entries(sim).map(([k, v]) => [k, `${Math.round(v.detection_rate * 1000) / 10}%`, `${Math.round(v.false_alarm_rate * 1000) / 10}%`, `${v.spoofed_median_error_m_ai_corrected} m`]), { x: 0.5, y: 2.65, w: 9, colW: [3, 2, 2, 2], fontSize: 12, rowH: 0.34 });
T(s, 'Why it works: received power falls with distance squared; independent constellations disagree when one is spoofed, and the AI flags the disagreement. Builds on India\'s NavIC. Live: the 3D globe shows the real constellations.', { x: 0.5, y: 4.15, w: 9, h: 0.7, fontSize: 12, color: DIM });
s.addNotes('3:10-3:30. Physics, then simulation, then cost. GPS alone barely detects spoofing; three constellations plus a cross-check catch 92%.');

// ---------- 11. Nemotron ----------
s = add('Results', 'NVIDIA Nemotron decides four real GPS-failure cases');
kicker(s, 'AI decision support  |  human-checked', ROUTE);
const short = { delhi: 'Delhi IGI 2025, spoofed approaches', northwest: 'Amritsar / Jammu border jamming', outage: 'Full outage, GPS-only approach', tartu: 'Tartu 2024, route suspended' };
tbl(s, ['Case', 'Turnaround impact (Nemotron)', 'Final decision (after human check)'], ND.cases.map(c => [{ text: short[c.id], options: { bold: true, color: INK, fill: { color: CARD } } }, (c.nemotron?.turnaround || '').replace(/\.$/, ''), { text: c.human_review.final, options: { color: INK, fill: { color: CARD2 } } }]), { x: 0.5, y: 1.05, w: 9, colW: [2.1, 3.2, 3.7], fontSize: 10, rowH: [0.3, 0.8, 0.8, 0.8, 0.8] });
T(s, `Model ${ND.model}. Asked as the airline's operations controller. It got Delhi wrong (ILS stayed available on other runways) and we corrected it: AI proposes, people decide.`, { x: 0.5, y: 4.6, w: 9, h: 0.45, fontSize: 11, color: DIM });
s.addNotes('3:30-3:50. Common thread: late inbound, receiver reset, next rotation slips. Be upfront about the Delhi correction.');

// ---------- 12. Originality ----------
pres.addSection({ title: 'Originality' });
s = add('Originality', 'Who has done what, and the gap we fill');
kicker(s, 'Originality', ROUTE);
const Y = { text: 'Yes', options: { color: OK, bold: true, fill: { color: CARD }, align: 'center' } }, N = { text: '—', options: { color: DIM, fill: { color: CARD }, align: 'center' } }, P = { text: 'Partly', options: { color: CAUT, fill: { color: CARD }, align: 'center' } };
const US = t => ({ text: t, options: { color: PANEL, bold: true, fill: { color: ROUTE }, align: 'center' } });
tbl(s, ['Existing work', 'Detects GPS interference', 'Verifies diversion airport', 'Recovers passengers', 'Connects all three'], [
  ['Spire (satellite RF detection)', Y, N, N, N],
  ['Jeppesen (pilot interference awareness)', P, N, N, N],
  ['Boeing GPS Event Monitor (aircraft records)', Y, N, N, N],
  ['SAT-JAM (Sentinel orbit-level mapping)', Y, N, N, N],
  ['Earth-observation construction analytics', N, P, N, N],
  ['Amadeus Passenger Recovery / self-rebooking', N, N, Y, N],
  [{ text: 'NavContinuity', options: { bold: true, color: PANEL, fill: { color: ROUTE } } }, US('Yes'), US('Yes'), US('Planned'), US('Yes')],
], { x: 0.5, y: 1.05, w: 9, colW: [3.4, 1.4, 1.4, 1.4, 1.4], fontSize: 11, rowH: 0.36 });
T(s, 'Based on public product information (may be incomplete). Many players solve one piece; we found none that links GPS failure to verified diversion capacity to passenger recovery. Passenger recovery is specified, not built.', { x: 0.5, y: 4.15, w: 9, h: 0.75, fontSize: 11, color: DIM });
s.addNotes('3:50-4:10. Be precise: detection exists, rebooking exists, construction analytics exist. The link between them does not, and passengers absorb that gap.');

// ---------- 13. Feasibility ----------
pres.addSection({ title: 'Feasibility' });
s = add('Feasibility', 'Feasibility: built in 12 hours on free data, with a clear pilot path');
kicker(s, 'Feasibility', OK);
const fz = [['Built today', OK, ['Real Sentinel-2 pipeline, 79 scenes', 'Larper trained and tested', 'GPS map from real aircraft data', 'Nemotron decisions, human-checked', 'Live site on GitHub Pages']], ['Pilot in 3 months', CAUT, ['One airline, one hub (Delhi)', 'Daily GPS-integrity feed instead of one day', 'Shadow mode: recommend, never act', 'Measure time to confirmed rebooking']], ['Risks and answers', WARN, ['Data latency: Sentinel-2 every 5 days; enough for construction', 'One day of ADS-B: extend to months', 'Airline system access: start read-only', 'B3 costs ~$445M: long-term, not needed for the pilot']]];
fz.forEach(([h, c, items], i) => { const x = 0.5 + i * 3.05; box(s, x, 1.1, 2.85, 3.6, CARD, h, c); T(s, h, { x: x + 0.2, y: 1.2, w: 2.45, h: 0.36, fontSize: 15, bold: true, color: c }); T(s, bl(items, INK, 12), { x: x + 0.18, y: 1.62, w: 2.5, h: 3.0, valign: 'top', paraSpaceAfter: 5 }); });
T(s, 'Running cost today: $0 for data (all public), a laptop, static hosting.', { x: 0.5, y: 4.85, w: 9, h: 0.25, fontSize: 11, color: DIM });
s.addNotes('4:10-4:30. Feasibility is 20% of the score: everything shown runs today on free data; the pilot needs no new satellites.');

// ---------- 14. Business ----------
pres.addSection({ title: 'Business' });
s = add('Business', 'Who pays, and what it is worth');
kicker(s, 'Economic and strategic impact', CAUT);
const biz = [['Airlines', 'Fewer stranded passengers, faster confirmed rebooking, avoided wrong-city hotels', 'Per-hub subscription'], ['Lenders and project monitors', 'Release-or-inspect decisions on infrastructure tranches', 'Per-asset monitoring fee'], ['Airports and regulators (DGCA, AAI)', 'Live picture of GPS health and diversion readiness', 'Strategic: national resilience']];
tbl(s, ['Customer', 'What they get', 'How they pay'], biz, { x: 0.5, y: 1.1, w: 9, colW: [2.6, 4.4, 2.0], fontSize: 12, rowH: 0.55 });
stat(s, 0.5, 3.4, 4.4, 1.35, '€1,000–77,200', 'what one diversion costs an airline; avoiding a few a year pays for a hub subscription (illustrative)', CAUT);
stat(s, 5.1, 3.4, 4.4, 1.35, '$15k vs $112k', 'inspection cost vs expected loss in our A6 case (assumed inputs)', ROUTE);
s.addNotes('4:30-4:45. Every team must answer who pays. Airlines first, lenders second, regulators for the strategic case. Pricing is a hypothesis.');

// ---------- 15. Rules + close ----------
pres.addSection({ title: 'Close' });
s = add('Close', 'How we meet the rules, and where to try it');
kicker(s, 'Compliance', OK);
const MET = { text: 'Met', options: { color: OK, bold: true, fill: { color: CARD } } };
tbl(s, ['Rule', 'How we meet it', ''], [['Track A objective, completed, real data', 'A6: Sentinel-2 demo + economic decision', MET], ['Track B: 1 of 3 subheadings', 'B3: physics, simulation, cost', MET], ['Track C: protective use only', 'Area-level monitoring, no individuals', MET], ['Flow between tracks', 'C detects, A6 absorbs, B3 hardens', MET], ['Who pays', 'Airlines, lenders, regulators', MET]], { x: 0.5, y: 1.05, w: 5.4, colW: [2.2, 2.6, 0.6], fontSize: 10.5, rowH: 0.42 });
box(s, 6.15, 1.05, 3.35, 3.6, CARD, 'Links', ROUTE);
T(s, [{ text: 'Try it live', options: { bold: true, fontSize: 15, color: ROUTE, breakLine: true } }, ...[['Overview', ''], ['Jewar (A6)', 'a6.html'], ['Globe (B3)', 'globe.html'], ['GPS map (C)', 'c.html'], ['Passengers', 'passengers.html']].flatMap(([t, p], i, a) => [{ text: t, options: { bold: true, fontSize: 12, breakLine: true } }, { text: `${SITE}/${p}`, options: { fontSize: 10, color: DATA, breakLine: i < a.length - 1 } }])], { x: 6.35, y: 1.15, w: 3.0, h: 3.4, valign: 'top', paraSpaceAfter: 2 });
T(s, 'We present both B3 and C as one chain; organisers said "choose 1", so we flag it openly.', { x: 0.5, y: 3.35, w: 5.4, h: 0.45, fontSize: 10, color: CAUT });
T(s, 'Limits: land conversion is not completion · one day of GPS data · B3 is simulation · economics assumed', { x: 0.5, y: 4.85, w: 9, h: 0.25, fontSize: 9, color: DIM });
s.addNotes('4:45-5:00. Close on the chain and the live links. Thank the judges.');

(async () => { await pres.writeFile({ fileName: OUT }); await applyTheme(OUT, THEME); console.log('wrote', OUT); })();
