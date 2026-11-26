// Builds pitch/NavContinuity_Tracks.pptx: track-by-track deck (what each track asks, what we built, how it fits the idea).
// Usage: cd pitch && node build_tracks.js
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require(path.join(__dirname, 'apply_theme.js'));

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'NavContinuity_Tracks.pptx');
const rd = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const img = f => path.join(ROOT, 'a6', 'outputs', f);
const met = rd('a6/outputs/classifier_metrics.json'), dec = rd('a6/outputs/decision.json');
const phys = rd('b3/outputs/b3_physics.json'), sim = rd('b3/outputs/b3_sim.json').results;
const gsum = rd('c/outputs/gnss_summary.json'), ND = rd('decisions/nemotron_decisions.json');
const SITE = 'rehancodes-web.github.io/Mack.1';

const THEME = { name: 'NavContinuity Tracks', headFontFace: 'Cambria', bodyFontFace: 'Calibri',
  colors: { dk1: '0B1F3A', lt1: 'FFFFFF', dk2: '1B3358', lt2: 'EEF2F8', accent1: 'E6A84A', accent2: '86A3FF', accent3: '3FB68B', accent4: 'D9534F', accent5: '5B6B82', accent6: 'C9D4E5', hlink: '86A3FF', folHlink: 'C9D4E5' } };
const H = THEME.colors;
const TC = { A: H.accent1, B: H.accent2, C: H.accent3 };
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'NavContinuity: how our idea fits Tracks A, B and C';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
pres.defineSlideMaster({ title: 'DARK', background: { color: H.dk1 },
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 1.3, w: 9, h: 1.2, fontSize: 38, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: 'bottom', margin: 0 }, text: '' } }] });
pres.defineSlideMaster({ title: 'CONTENT', background: { color: H.lt1 },
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.3, w: 9, h: 0.7, fontSize: 28, bold: true, color: C.text1, fontFace: THEME.headFontFace, valign: 'middle', margin: 0 }, text: '' } },
    { text: { text: `NavContinuity · Mach-A-Thon Aeromania 26 · ${SITE}`, options: { x: 0.5, y: 5.25, w: 7, h: 0.25, fontSize: 9, color: C.accent5, margin: 0 } } }],
  slideNumber: { x: 9.1, y: 5.25, w: 0.4, h: 0.25, fontSize: 9, color: C.accent5, align: 'right' } });

const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, fontFace: THEME.bodyFontFace, ...o });
const card = (s, x, y, w, h, fill, name) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill }, objectName: name });
const bullets = (arr, color) => arr.map((t, i) => ({ text: t, options: { bullet: true, color, breakLine: i < arr.length - 1 } }));

// Three-column "asks / we built / fits" slide
function trackSlide(sec, key, title, asks, built, fits, deliverable, link) {
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: sec });
  s.addText(title, { placeholder: 'title' });
  const cols = [['What the track asks', asks, H.lt2, H.dk2], ['What we built', built, H.dk1, H.lt1], ['How it fits our idea', fits, H.lt2, H.dk2]];
  cols.forEach(([h, items, fill, fg], i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.1, 2.85, 3.3, fill, h);
    T(s, h, { x: x + 0.18, y: 1.2, w: 2.5, h: 0.32, fontSize: 14, bold: true, color: i === 1 ? TC[key] : H.dk1 });
    T(s, bullets(items, fg), { x: x + 0.18, y: 1.55, w: 2.52, h: 2.75, fontSize: 11.5, valign: 'top', paraSpaceAfter: 4 });
  });
  card(s, 0.5, 4.55, 9, 0.55, H.lt2, 'Deliverable');
  T(s, [{ text: 'Organisers\' deliverable: ', options: { bold: true, color: H.dk1 } }, { text: deliverable, options: { color: H.dk2 } }, { text: `   ·   Live: ${SITE}/${link}`, options: { color: H.accent5 } }], { x: 0.7, y: 4.55, w: 8.6, h: 0.55, fontSize: 11, valign: 'middle' });
  return s;
}

// 1. Title
pres.addSection({ title: 'Opening' });
let s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Opening' });
s.addImage({ path: img('hires_2026-05-28.jpg'), x: 5.4, y: 0, w: 4.6, h: 5.625, sizing: { type: 'cover', w: 4.6, h: 5.625 }, altText: 'Noida International Airport, 2026 (Esri World Imagery Wayback)' });
s.addText('NavContinuity', { placeholder: 'title', w: 4.8 });
T(s, 'How our idea fits Tracks A, B and C', { x: 0.5, y: 2.6, w: 4.7, h: 0.5, fontSize: 18, color: H.lt2 });
[['Track A6 · Infrastructure (compulsory)', 'A'], ['Track B3 · Positioning & sensing', 'B'], ['Track C · GNSS resilience', 'C']].forEach(([t, k], i) => {
  s.addShape(pres.shapes.OVAL, { x: 0.5, y: 3.35 + i * 0.45, w: 0.26, h: 0.26, fill: { color: TC[k] }, line: { color: TC[k] } });
  T(s, t, { x: 0.9, y: 3.3 + i * 0.45, w: 4.3, h: 0.36, fontSize: 14, bold: true, color: H.lt1, valign: 'middle' });
});
T(s, `Orbit to Economy: AI in Space · with Boeing · ${SITE}`, { x: 0.5, y: 4.85, w: 4.8, h: 0.3, fontSize: 11, color: H.accent6 });
s.addNotes('Open with the one-line idea: when GPS fails around an airport, we find where, know where the flights can go, harden positioning, and recover passengers. Then: here is how each track fits.');

// 2. The idea
pres.addSection({ title: 'Idea' });
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Idea' });
s.addText('One idea, one chain: GPS failure to passenger outcome', { placeholder: 'title' });
const chain = [['GPS fails', 'Jamming or spoofing near an airport (2,354 incidents in India, Nov 2023 – Dec 2025)', H.accent4, ''], ['Detect', 'Where is GPS failing right now?', TC.C, 'Track C'], ['Absorb', 'Which airport can take the diverted flights?', TC.A, 'Track A6'], ['Harden', 'Positioning that is harder to jam or spoof', TC.B, 'Track B3'], ['Recover', 'Rebooking, care, bags for every passenger', H.accent5, 'Who pays']];
chain.forEach(([h, d, col, tag], i) => {
  const x = 0.5 + i * 1.83;
  card(s, x, 1.25, 1.68, 2.3, H.lt2, h);
  s.addShape(pres.shapes.OVAL, { x: x + 0.6, y: 1.38, w: 0.48, h: 0.48, fill: { color: col }, line: { color: col } });
  T(s, String(i + 1), { x: x + 0.6, y: 1.38, w: 0.48, h: 0.48, fontSize: 15, bold: true, color: H.lt1, align: 'center', valign: 'middle' });
  T(s, h, { x: x + 0.1, y: 1.95, w: 1.48, h: 0.35, fontSize: 15, bold: true, color: H.dk1, align: 'center' });
  T(s, d, { x: x + 0.1, y: 2.3, w: 1.48, h: 0.9, fontSize: 10.5, color: H.dk2, align: 'center' });
  if (tag) T(s, tag, { x: x + 0.1, y: 3.2, w: 1.48, h: 0.28, fontSize: 10, bold: true, color: col, align: 'center' });
});
card(s, 0.5, 3.8, 9, 1.25, H.dk1, 'Example');
T(s, [{ text: 'Example: ', options: { bold: true, color: H.accent1 } }, { text: 'Delhi IGI approaches are spoofed (2025). Track C shows the interference zone; Track A6 confirms Noida International (Jewar), 70 km away, is built and usable; Track B3 is the long-term fix; passengers are rebooked to the right city with their bags tracked.', options: { color: H.lt1 } }], { x: 0.75, y: 3.85, w: 8.5, h: 1.15, fontSize: 13, valign: 'middle' });
s.addNotes('This is the spine of the talk. Every track is one step in this chain, not a separate project.');

// 3. Track A6
pres.addSection({ title: 'Track A6' });
s = trackSlide('Track A6', 'A', 'Track A6 · Infrastructure: monitor construction from orbit',
  ['Pick satellite data and turn it into an economic decision', 'Objective 6: monitor construction and asset progress from orbit', 'Compulsory for every team; working demo on real data'],
  ['79 monthly Sentinel-2 scenes of Noida International Airport (Jewar), 2020–2026', `Larper AI labels every 10 m pixel (${Math.round(met.overall_accuracy * 100)}% agreement with ESA WorldCover)`, 'Sharp 2019 vs 2026 photos (Esri Wayback)', 'Decision: release the next funding tranche or inspect first'],
  ['When Delhi\'s GPS fails, flights need somewhere to go', 'A6 proves Jewar physically exists and when it became usable', 'Lenders and airlines both act on it'],
  'working demo on real data + economic decision. Met.', 'a6.html');
s.addNotes('Track A6 is our compulsory track. Real Sentinel-2 data, a trained classifier, and a money decision.');

// 4. Track A6 result
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Track A6' });
s.addText('Track A6 result: the satellite saw half of what was reported', { placeholder: 'title' });
s.addImage({ path: img('hires_2019-10-09.jpg'), x: 0.5, y: 1.1, w: 2.9, h: 1.87, altText: 'Jewar 2019: farmland' });
s.addImage({ path: img('hires_2026-05-28.jpg'), x: 3.55, y: 1.1, w: 2.9, h: 1.87, altText: 'Jewar 2026: runway and terminal' });
T(s, '2019: farmland', { x: 0.5, y: 3.0, w: 2.9, h: 0.25, fontSize: 11, color: H.accent5 });
T(s, '2026: runway, terminal', { x: 3.55, y: 3.0, w: 2.9, h: 0.25, fontSize: 11, color: H.accent5 });
card(s, 6.7, 1.1, 2.8, 0.95, H.lt2, 'Reported');
T(s, [{ text: '80%', options: { bold: true, fontSize: 28, color: H.dk1, breakLine: true } }, { text: '"complete", Jan 2025 (reported)', options: { fontSize: 11, color: H.dk2 } }], { x: 6.85, y: 1.12, w: 2.5, h: 0.9 });
card(s, 6.7, 2.15, 2.8, 0.95, H.dk1, 'Observed');
T(s, [{ text: `${dec.satellite_observed_pct}%`, options: { bold: true, fontSize: 28, color: H.accent1, breakLine: true } }, { text: 'land converted, Jan 2025 (Sentinel-2)', options: { fontSize: 11, color: H.lt1 } }], { x: 6.85, y: 2.17, w: 2.5, h: 0.9 });
const tbl = [['Evidence', 'Cost if release', 'Cost if inspect', 'Action'].map(t => ({ text: t, options: { bold: true, color: H.lt1, fill: { color: H.dk1 } } })),
  ...dec.scenarios.map(sc => [sc.name.replace('Counterfactual: ', ''), `$${Math.round(sc.release).toLocaleString('en-US')}`, `$${Math.round(sc.inspect).toLocaleString('en-US')}`, sc.action.toUpperCase()].map(t => ({ text: t, options: { color: H.dk1, fill: { color: sc.name.startsWith('Satellite') ? 'FCEFD9' : H.lt1 } } })))];
s.addTable(tbl, { x: 0.5, y: 3.35, w: 9, colW: [4.5, 1.5, 1.5, 1.5], fontSize: 10.5, fontFace: THEME.bodyFontFace, border: { type: 'solid', color: H.lt2, pt: 1 }, rowH: 0.36 });
T(s, 'Costs and probabilities are assumed for illustration; land conversion is not completion.', { x: 0.5, y: 4.95, w: 9, h: 0.25, fontSize: 9, color: H.accent5 });

// 5. Track B3
pres.addSection({ title: 'Track B3' });
const gnav = sim['GPS + NavIC + LEO'], g0 = sim['GPS only'];
s = trackSlide('Track B3', 'B', 'Track B3 · Positioning & sensing: harder-to-jam GPS',
  ['Track B: design, simulate or prototype a space system; no dataset needed', 'Subheading B3: better GPS via LEO augmentation or AI correction of positioning errors', 'Simulation or architecture with back-of-envelope cost and physics'],
  [`Link budget: LEO at 1,000 km is ${phys.signal.leo_advantage_db} dB stronger; jammer area ${phys.jamming.denial_area_reduction_factor}x smaller (physics)`, `AI cross-check: spoofed error ${gnav.spoofed_median_error_m_uncorrected} m → ${gnav.spoofed_median_error_m_ai_corrected} m; detection ${Math.round(g0.detection_rate * 1000) / 10}% → ${Math.round(gnav.detection_rate * 1000) / 10}% (simulation)`, `${phys.constellation.satellites_needed} satellites, ~$${Math.round(phys.cost.capex_usd / 1e6)}M capex (assumed)`, '3D globe: real GPS, Galileo, NavIC, Iridium, Xona orbits'],
  ['Tracks C and A6 cope with GPS failure; B3 removes its cause', 'Stronger, cross-checked signals stop spoofing before flights divert', 'Builds on India\'s NavIC'],
  'simulation + architecture with cost and physics, at least 1 of 3 subheadings. Met (B3).', 'globe.html');
s.addNotes('Track B3: physics first (inverse-square law), then the simulation, then the cost. The globe shows the real constellations.');

// 6. Track C
pres.addSection({ title: 'Track C' });
s = trackSlide('Track C', 'C', 'Track C · GNSS resilience: where is GPS failing?',
  ['GNSS resilience: detect GPS jamming and spoofing; build on NavIC', 'Protect critical infrastructure', 'Rule: protective only; no weapons, targeting or tracking of individuals'],
  [`${gsum.reports.toLocaleString('en-US')} real aircraft GPS-integrity reports (ADS-B Exchange, ${gsum.days[0]})`, `Rated per 1° cell: ${gsum.cells_high} high-interference cells on the India–Pakistan border and Myanmar`, `Jewar region: ${gsum.jewar_region.status} (${gsum.jewar_region.aircraft_seen.toLocaleString('en-US')} aircraft)`],
  ['Step 1 of the chain: the warning', 'Tells airlines which airports to avoid and which can take diversions', 'Protective monitoring of areas, never individual aircraft or people'],
  'demo on real data within the protective-use rule. Met.', 'c.html');
s.addImage({ path: path.join(__dirname, 'gnss_map.png'), x: 7.75, y: 0.28, w: 0.85, h: 0.74, altText: 'GPS interference map thumbnail' });
s.addNotes('Track C: real data, aircraft report how much they trust their own GPS. Protective use only.');

// 7. Passengers + who pays + Nemotron
pres.addSection({ title: 'Who pays' });
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Who pays' });
s.addText('Who pays: airlines, for every stranded passenger', { placeholder: 'title' });
const pax = ['Endless "15 more minutes", then a cancellation', 'Missed connections', 'Bad auto-rebooking (wrong city)', 'Hotel voucher for the wrong city', 'Bags on a different route'];
card(s, 0.5, 1.1, 4.3, 2.55, H.lt2, 'Passengers');
T(s, 'What passengers face', { x: 0.7, y: 1.2, w: 4, h: 0.3, fontSize: 14, bold: true, color: H.dk1 });
T(s, bullets(pax, H.dk2), { x: 0.7, y: 1.55, w: 4, h: 2.0, fontSize: 12, paraSpaceAfter: 3 });
card(s, 5.0, 1.1, 4.5, 2.55, H.dk1, 'Costs');
T(s, [{ text: '€1,000–77,200', options: { bold: true, fontSize: 22, color: H.accent1, breakLine: true } }, { text: 'per diverted flight (EUROCONTROL)', options: { fontSize: 11, color: H.lt1, breakLine: true } }, { text: '$98 / minute', options: { bold: true, fontSize: 22, color: H.accent1, breakLine: true } }, { text: 'aircraft operating cost (A4A 2025)', options: { fontSize: 11, color: H.lt1 } }], { x: 5.2, y: 1.2, w: 4.1, h: 2.35, paraSpaceAfter: 4 });
T(s, [{ text: `Nemotron decisions (${ND.model.split('/').pop()}), human-checked: `, options: { bold: true, color: H.dk1 } }, { text: ND.cases.map(c => c.human_review.final).slice(0, 2).join('  ·  '), options: { color: H.dk2 } }], { x: 0.5, y: 3.85, w: 9, h: 1.2, fontSize: 11, valign: 'top' });
s.addNotes('Every team must answer who pays. Airlines pay for diversions and stranded passengers; lenders pay for the A6 inspection decision. Nemotron worked through four real GPS-failure cases; see the passenger page.');

// 8. Compliance checklist
pres.addSection({ title: 'Rules' });
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Rules' });
s.addText('How we meet the organisers\' rules', { placeholder: 'title' });
const rules = [['At least 1 Track A objective, completed (compulsory)', 'A6 Infrastructure: real Sentinel-2 demo + economic decision', 'Met'], ['Track B: at least 1 of 3 subheadings completed', 'B3 Positioning & sensing: physics, simulation, cost', 'Met'], ['Track C: protective use only', 'Area-level GPS monitoring; no individuals, no targeting', 'Met'], ['Flow between primary and optional tracks', 'One chain: C detects → A6 absorbs → B3 hardens', 'Met'], ['Every team: who pays, how much is it worth', 'Airlines (diversions, passengers); lenders (inspections)', 'Met'], ['Small PPT of what was accomplished', 'This deck + live site', 'Met'], ['"Choose 1" of B or C', 'We present both; C is the warning, B3 the fix', 'Check with organisers']];
const rh = ['Rule', 'How we meet it', 'Status'].map(t => ({ text: t, options: { bold: true, color: H.lt1, fill: { color: H.dk1 } } }));
s.addTable([rh, ...rules.map(([a, b, c]) => [a, b, c].map((t, i) => ({ text: t, options: { color: i === 2 ? (c === 'Met' ? H.accent3 : H.accent4) : H.dk1, bold: i === 2, fill: { color: H.lt1 } } })))], { x: 0.5, y: 1.05, w: 9, colW: [3.6, 4.0, 1.4], fontSize: 11, fontFace: THEME.bodyFontFace, border: { type: 'solid', color: H.lt2, pt: 1 }, rowH: 0.47 });

// 9. Close
pres.addSection({ title: 'Close' });
s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Close' });
s.addText('Try it live', { placeholder: 'title', y: 0.4, h: 0.8 });
const links = [['Overview', ''], ['Track A6 · Jewar airport', 'a6.html'], ['Track B3 · Globe & satellites', 'globe.html'], ['Track C · GPS malfunction', 'c.html'], ['Passenger impact + Nemotron decisions', 'passengers.html']];
links.forEach(([t, p], i) => {
  T(s, [{ text: t + '   ', options: { bold: true, color: H.lt1 } }, { text: `${SITE}/${p}`, options: { color: H.accent2 } }], { x: 0.5, y: 1.5 + i * 0.55, w: 9, h: 0.45, fontSize: 15, valign: 'middle' });
});
T(s, 'Limits: land conversion is not completion · Track C is one day of data · B3 is simulation · economics assumed', { x: 0.5, y: 4.75, w: 9, h: 0.35, fontSize: 11, color: H.accent6 });

(async () => { await pres.writeFile({ fileName: OUT }); await applyTheme(OUT, THEME); console.log('wrote', OUT); })();
