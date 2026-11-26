// Builds pitch/NavContinuity_MachAThon.pptx (9 slides, ~5 min). Usage: cd pitch && node gnss_map.js && node build_deck.js
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require(process.env.PPTX_SKILL_THEME || path.join(__dirname, 'apply_theme.js'));

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'NavContinuity_MachAThon.pptx');
const img = f => path.join(ROOT, 'a6', 'outputs', f);
const rd = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));

// ---------- data (all from repo outputs) ----------
const met = rd('a6/outputs/classifier_metrics.json');
const dec = rd('a6/outputs/decision.json');
const phys = rd('b3/outputs/b3_physics.json');
const sim = rd('b3/outputs/b3_sim.json').results;
const csv = fs.readFileSync(path.join(ROOT, 'a6/outputs/progress_ai.csv'), 'utf8').replace(/\r/g, '').trim().split('\n');
const H = csv[0].split(',');
const rows = csv.slice(1).map(l => Object.fromEntries(l.split(',').map((v, i) => [H[i], v])));
const series = rows.filter(r => r.converted_12m !== '' && r.baseline_cleared_12m !== '');
const labels = series.map(r => r.month);
const larper = series.map(r => Math.round(Number(r.converted_12m) * 100));
const baseline = series.map(r => Math.round(Number(r.baseline_cleared_12m) * 100));
const jan25 = series.find(r => r.month === '2025-01');
const larperJan = Math.round(Number(jan25.converted_12m) * 100);
const baseJan = dec.satellite_observed_pct;

// ---------- theme ----------
const THEME = {
  name: 'NavContinuity Night',
  headFontFace: 'Cambria', bodyFontFace: 'Calibri',
  colors: {
    dk1: '0B1F3A', lt1: 'FFFFFF', dk2: '1B3358', lt2: 'EEF2F8',
    accent1: 'E6A84A', accent2: '86A3FF', accent3: '3FB68B', accent4: 'D9534F', accent5: '5B6B82', accent6: 'C9D4E5',
    hlink: '86A3FF', folHlink: 'C9D4E5',
  },
};
const HEX = THEME.colors;
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 in
pres.title = 'NavContinuity: Mach-A-Thon Aeromania 26';
pres.author = 'NavContinuity team';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

pres.defineSlideMaster({
  title: 'DARK', background: { color: HEX.dk1 },
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 1.5, w: 9, h: 1.2, fontSize: 40, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: 'bottom', margin: 0 }, text: '' } }],
});
pres.defineSlideMaster({
  title: 'CONTENT', background: { color: HEX.lt1 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.3, w: 9, h: 0.7, fontSize: 30, bold: true, color: C.text1, fontFace: THEME.headFontFace, valign: 'middle', margin: 0 }, text: '' } },
    { text: { text: 'NavContinuity · Mach-A-Thon Aeromania 26', options: { x: 0.5, y: 5.25, w: 6, h: 0.25, fontSize: 9, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: 9.1, y: 5.25, w: 0.4, h: 0.25, fontSize: 9, color: C.accent5, align: 'right' },
});

const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, fontFace: THEME.bodyFontFace, ...o });
const card = (s, x, y, w, h, fill, name) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill }, objectName: name });
const tag = (s, x, y, label, color) => { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 0.95, h: 0.22, rectRadius: 0.11, fill: { color: HEX.lt1 }, line: { color, width: 1 } }); T(s, label, { x, y, w: 0.95, h: 0.22, fontSize: 9, color, align: 'center', valign: 'middle', bold: true }); };

// ---------- 1. Title ----------
pres.addSection({ title: 'Opening' });
let s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Opening' });
s.addImage({ path: img('hires_2026-05-28.jpg'), x: 5.4, y: 0, w: 4.6, h: 5.625, sizing: { type: 'cover', w: 4.6, h: 5.625 }, altText: 'High-resolution satellite view of Noida International Airport, 2026 (Esri World Imagery Wayback)' });
s.addText('NavContinuity', { placeholder: 'title', x: 0.5, y: 1.2, w: 4.8, h: 1.0 });
T(s, 'When GPS fails around an airport, know which airports can take the diversions, then get every passenger to a confirmed outcome.', { x: 0.5, y: 2.3, w: 4.6, h: 1.0, fontSize: 15, color: HEX.lt2 });
card(s, 0.5, 3.5, 4.6, 1.05, HEX.dk2, 'Track card');
T(s, [{ text: 'Primary: Track A6 Infrastructure', options: { bold: true, color: HEX.accent1, breakLine: true } }, { text: 'Track C: GPS malfunction detection', options: { bold: true, color: HEX.accent3, breakLine: true } }, { text: 'Track B3: harder-to-jam positioning', options: { bold: true, color: HEX.accent2 } }], { x: 0.7, y: 3.6, w: 4.3, h: 0.85, fontSize: 14, valign: 'middle' });
T(s, 'Orbit to Economy: AI in Space · with Boeing', { x: 0.5, y: 4.85, w: 4.6, h: 0.3, fontSize: 11, color: HEX.accent6 });
s.addNotes('0:00-0:20. Name the team. One line: GPS interference is now routine around Indian airports; we use satellites to see which airports can absorb diversions, and to harden positioning itself. Primary Track A6, optional Track B3.');

// ---------- 2. Problem ----------
pres.addSection({ title: 'Problem' });
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Problem' });
s.addText('GPS interference is now routine, and India is affected', { placeholder: 'title' });
const stats = [['+175%', 'GNSS interference reports, 2024 vs 2023 (IATA)'], ['+500%', 'GPS spoofing reports, same period (IATA)'], ['2,354', 'GPS interference incidents reported to India\'s Parliament, Nov 2023 to Dec 2025']];
stats.forEach(([n, l], i) => {
  const x = 0.5 + i * 3.05;
  card(s, x, 1.25, 2.85, 1.85, HEX.lt2, `Stat ${i + 1}`);
  T(s, n, { x: x + 0.2, y: 1.35, w: 2.45, h: 0.85, fontSize: 40, bold: true, color: HEX.dk1, fontFace: THEME.headFontFace });
  T(s, l, { x: x + 0.2, y: 2.2, w: 2.45, h: 0.8, fontSize: 13, color: HEX.dk2 });
});
tag(s, 8.55, 1.0, 'REPORTED', HEX.accent5);
card(s, 0.5, 3.35, 9, 1.6, HEX.dk1, 'Chain');
T(s, [
  { text: 'Delhi, 2025: ', options: { bold: true, color: HEX.accent1 } },
  { text: 'flights approaching IGI on GPS procedures were spoofed; contingency procedures were used.', options: { color: HEX.lt1, breakLine: true } },
  { text: 'What follows: ', options: { bold: true, color: HEX.accent1 } },
  { text: 'holding, diversions to nearby airports, missed connections, rebooking and bags on the wrong route. The first question is simple: which nearby airports can actually take the traffic?', options: { color: HEX.lt1 } },
], { x: 0.75, y: 3.45, w: 8.5, h: 1.4, fontSize: 15, valign: 'middle', paraSpaceAfter: 6 });
s.addNotes('0:20-0:50. Three reported numbers, then Delhi 2025. Land on the question: when Delhi degrades, which airports can absorb diversions? Noida International (Jewar), about 70 km away, is the new one. Did it physically exist yet? Satellites answer that.');

// ---------- 2b. Evidence: real aircraft GPS-integrity reports ----------
const gsum = rd('c/outputs/gnss_summary.json');
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Problem' });
s.addText('Track C: detecting where GPS is failing', { placeholder: 'title' });
s.addImage({ path: path.join(__dirname, 'gnss_map.png'), x: 0.5, y: 1.1, w: 4.4, h: 3.85, altText: 'Map of South Asia: share of aircraft reporting degraded GPS integrity per 1-degree cell; red band along the India-Pakistan border and Myanmar; Delhi and Jewar in normal cells' });
const leg = [['High: over 10% of aircraft degraded', HEX.accent4], ['Medium: 2-10%', HEX.accent1], ['Low: under 2%', HEX.accent3]];
leg.forEach(([l, c], i) => { s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.15 + i * 0.32, w: 0.22, h: 0.22, fill: { color: c }, line: { color: c } }); T(s, l, { x: 5.52, y: 1.13 + i * 0.32, w: 4, h: 0.26, fontSize: 12, color: HEX.dk2 }); });
T(s, [{ text: 'White ring: Delhi IGI · blue dot: Jewar', options: {} }], { x: 5.2, y: 2.12, w: 4.3, h: 0.26, fontSize: 12, color: HEX.dk2 });
const ev = [[gsum.reports.toLocaleString('en-US'), 'aircraft position reports with integrity flags, one day'], [String(gsum.cells_high), 'cells rated high, clustered on the India-Pakistan border and Myanmar'], [gsum.jewar_region.status.toUpperCase(), `Jewar region (${gsum.jewar_region.aircraft_seen.toLocaleString('en-US')} aircraft): a usable diversion airport when Delhi-side GPS degrades`]];
ev.forEach(([n, l], i) => {
  const y = 2.55 + i * 0.8;
  card(s, 5.2, y, 4.3, 0.7, i === 2 ? HEX.dk1 : HEX.lt2, `Evidence ${i + 1}`);
  T(s, n, { x: 5.35, y, w: 1.4, h: 0.7, fontSize: 20, bold: true, color: i === 2 ? HEX.accent3 : HEX.dk1, valign: 'middle', fontFace: THEME.headFontFace });
  T(s, l, { x: 6.75, y, w: 2.65, h: 0.7, fontSize: 11, color: i === 2 ? HEX.lt1 : HEX.dk2, valign: 'middle' });
});
T(s, `Source: ADS-B Exchange sample data, ${gsum.days.join(', ')} (${gsum.snapshots} snapshots), aircraft-reported navigation integrity. Derived; one day only. Protective monitoring, no individual tracking.`, { x: 0.5, y: 5.0, w: 9, h: 0.22, fontSize: 9, color: HEX.accent5 });
s.addNotes('0:50-1:10. This is real data, not a model: aircraft broadcast how much they trust their own GPS. One day of reports already shows the interference band along the border. Jewar, 70 km from Delhi, sits in clean cells, which is why it matters as a diversion airport. This is Track C: protective monitoring of GPS malfunction. It feeds the chain: C says where GPS is failing, A6 says which airport can take the diversions, B3 is the long-term fix.');

// ---------- 2c. Passenger impact ----------
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Problem' });
s.addText('What GPS failure does to passengers at the airport', { placeholder: 'title' });
const flow = ['GPS jammed or spoofed', 'Backup procedures, holding', 'Delay or diversion', 'Stranded passengers'];
flow.forEach((t, i) => {
  const x = 0.5 + i * 2.3;
  card(s, x, 1.15, 2.05, 0.65, i === 3 ? HEX.accent4 : HEX.dk1, `Flow ${i + 1}`);
  T(s, t, { x: x + 0.1, y: 1.15, w: 1.85, h: 0.65, fontSize: 13, bold: true, color: HEX.lt1, align: 'center', valign: 'middle' });
});
const pax = [['Endless "15 more minutes"', 'then a cancellation'], ['Missed connections', 'the onward flight leaves first'], ['Bad auto-rebooking', 'wrong city or worse option'], ['Hotel in the wrong city', 'voucher for where they are not'], ['Bags on another route', 'rebooked, the bag is not']];
pax.forEach(([h, d], i) => {
  const y = 2.05 + i * 0.52;
  s.addShape(pres.shapes.OVAL, { x: 0.5, y: y + 0.08, w: 0.3, h: 0.3, fill: { color: HEX.accent4 }, line: { color: HEX.accent4 } });
  T(s, [{ text: h + '  ', options: { bold: true, color: HEX.dk1 } }, { text: d, options: { color: HEX.dk2 } }], { x: 0.95, y, w: 4.6, h: 0.46, fontSize: 14, valign: 'middle' });
});
tag(s, 4.55, 4.75, 'SELF-REPORTED', HEX.accent5);
const cost = [['€1,000-77,200', 'per diverted flight (EUROCONTROL)'], ['$98 / minute', 'aircraft operating cost (A4A 2025)'], ['≈ $4,430', 'direct cost of a 45-minute delay, before hotels and rebooking']];
cost.forEach(([n, l], i) => {
  const y = 2.05 + i * 0.95;
  card(s, 5.85, y, 3.65, 0.82, HEX.lt2, `Cost ${i + 1}`);
  T(s, n, { x: 6.0, y: y + 0.04, w: 3.4, h: 0.42, fontSize: 20, bold: true, color: HEX.dk1, fontFace: THEME.headFontFace });
  T(s, l, { x: 6.0, y: y + 0.44, w: 3.4, h: 0.34, fontSize: 11, color: HEX.dk2 });
});
T(s, 'Airlines pay for every diversion and stranded passenger, so they are the buyer for faster, confirmed recovery.', { x: 0.5, y: 4.75, w: 3.95, h: 0.45, fontSize: 11, color: HEX.accent5 });
s.addNotes('Passenger impact, about 25 seconds. GPS failure rarely makes the news as a crash; it shows up as holding, delays and diversions, and those land on people in the terminal. Name two of the five problems. Costs are published industry figures, not costs proven to come from GPS failures. Airlines pay for all of this, so they are the customer.');

// ---------- 3. A6 real data ----------
pres.addSection({ title: 'Track A6' });
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Track A6' });
s.addText('Track A6: watching Jewar airport get built from orbit', { placeholder: 'title' });
s.addImage({ path: img('hires_2019-10-09.jpg'), x: 0.5, y: 1.15, w: 3.2, h: 2.06, altText: 'Jewar site 2019: farmland and villages (Esri World Imagery Wayback)' });
s.addImage({ path: img('hires_2026-05-28.jpg'), x: 3.85, y: 1.15, w: 3.2, h: 2.06, altText: 'Jewar site 2026: runway, taxiways and terminal (Esri World Imagery Wayback)' });
T(s, '2019: farmland and villages', { x: 0.5, y: 3.24, w: 3.2, h: 0.22, fontSize: 11, color: HEX.accent5 });
T(s, '2026: runway, taxiways, terminal', { x: 3.85, y: 3.24, w: 3.2, h: 0.22, fontSize: 11, color: HEX.accent5 });
T(s, 'Photos: Esri World Imagery Wayback (Maxar, Earthstar), releases Oct 2019 and May 2026. Measurements: Sentinel-2.', { x: 0.5, y: 3.45, w: 6.55, h: 0.2, fontSize: 9, color: HEX.accent5 });
card(s, 7.3, 1.15, 2.2, 2.3, HEX.dk1, 'Data facts');
T(s, [
  { text: '79', options: { bold: true, fontSize: 28, color: HEX.accent1, breakLine: true } },
  { text: 'monthly Sentinel-2 scenes, 2020-2026', options: { fontSize: 12, color: HEX.lt1, breakLine: true } },
  { text: '1,333 ha', options: { bold: true, fontSize: 22, color: HEX.accent1, breakLine: true } },
  { text: 'airport footprint, 10 m pixels', options: { fontSize: 12, color: HEX.lt1 } },
], { x: 7.45, y: 1.3, w: 1.95, h: 2.0, valign: 'top', paraSpaceAfter: 2 });
const steps = [['Real data', 'Free Sentinel-2 L2A, cloud-masked, no account needed'], ['Larper (AI)', 'Random Forest labels every pixel: built, bare, vegetation, water'], ['Decision', 'Lender: release the next tranche, or inspect first?']];
steps.forEach(([h, d], i) => {
  const x = 0.5 + i * 3.05;
  s.addShape(pres.shapes.OVAL, { x, y: 3.75, w: 0.42, h: 0.42, fill: { color: HEX.accent1 }, line: { color: HEX.accent1 } });
  T(s, String(i + 1), { x, y: 3.75, w: 0.42, h: 0.42, fontSize: 15, bold: true, color: HEX.dk1, align: 'center', valign: 'middle' });
  T(s, h, { x: x + 0.55, y: 3.73, w: 2.3, h: 0.32, fontSize: 15, bold: true, color: HEX.dk1 });
  T(s, d, { x: x + 0.55, y: 4.05, w: 2.35, h: 0.75, fontSize: 12, color: HEX.dk2 });
});
s.addNotes('1:10-1:40. Show the before/after (or switch to the live Site Monitor). 79 real scenes, every one traceable to a Sentinel-2 file. Larper is our pixel classifier. The output feeds a money decision.');

// ---------- 4. A6 results ----------
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Track A6' });
s.addText('Satellites saw about half of what was reported', { placeholder: 'title' });
s.addChart(pres.charts.LINE, [
  { name: 'Larper AI: converted land (built + bare)', labels, values: larper },
  { name: 'Baseline: cleared all year (NDVI rule)', labels, values: baseline },
], {
  x: 0.4, y: 1.1, w: 6.1, h: 3.95,
  chartColors: [HEX.accent1, HEX.accent2], lineSize: 2, lineDataSymbol: 'none',
  valAxisMinVal: 0, valAxisMaxVal: 100, valAxisLabelFormatCode: '0"%"', valAxisLabelColor: HEX.accent5, catAxisLabelColor: HEX.accent5,
  valAxisLabelFontSize: 10, catAxisLabelFontSize: 9, catAxisLabelFrequency: 12, valAxisLabelFontFace: '+mn-lt', catAxisLabelFontFace: '+mn-lt',
  valGridLine: { color: HEX.lt2, size: 0.75 }, catGridLine: { style: 'none' },
  showLegend: true, legendPos: 'b', legendFontSize: 10, legendFontFace: '+mn-lt', legendColor: HEX.dk2,
  showTitle: true, title: 'Share of the 1,333 ha footprint converted, Jan 2020 - Nov 2026', titleFontSize: 12, titleColor: HEX.dk1, titleFontFace: '+mn-lt',
});
card(s, 6.75, 1.1, 2.75, 1.15, HEX.lt2, 'Reported');
T(s, [{ text: '80%', options: { bold: true, fontSize: 32, color: HEX.dk1, breakLine: true } }, { text: '"work complete", Jan 2025 (reported)', options: { fontSize: 12, color: HEX.dk2 } }], { x: 6.95, y: 1.15, w: 2.4, h: 1.05, fontFace: THEME.headFontFace });
card(s, 6.75, 2.4, 2.75, 1.15, HEX.dk1, 'Observed');
T(s, [{ text: `${Math.min(baseJan, larperJan)}-${Math.max(baseJan, larperJan)}%`, options: { bold: true, fontSize: 32, color: HEX.accent1, breakLine: true } }, { text: 'land converted, Jan 2025 (derived)', options: { fontSize: 12, color: HEX.lt1 } }], { x: 6.95, y: 2.45, w: 2.4, h: 1.05, fontFace: THEME.headFontFace });
T(s, [
  { text: `Larper agrees with ESA WorldCover on ${Math.round(met.overall_accuracy * 100)}% of held-out pixels; built/paved recall ${Math.round(met.per_class.find(c => c.class === 'built_paved').recall * 100)}%.`, options: { breakLine: true } },
  { text: 'Conversion starts mid-2023, not at the 2021 groundbreaking. Land conversion is not completion.' },
], { x: 6.75, y: 3.7, w: 2.75, h: 1.35, fontSize: 11, color: HEX.dk2, paraSpaceAfter: 4 });
s.addNotes('1:40-2:30. The key slide. Baseline and AI agree on the shape: nothing until mid-2023, peak in 2025. In January 2025 the contractor reported 80% complete; satellites saw roughly half the land converted. That gap is not proof of anything, but it is exactly when a lender should look. AI vs baseline: Larper is trained on WorldCover labels outside the airport, tested on a separate block of land.');

// ---------- 5. Decision + who pays ----------
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Track A6' });
s.addText('The decision: release the tranche, or inspect first?', { placeholder: 'title' });
const hdr = ['Evidence', 'P(report optimistic)', 'Cost if release', 'Cost if inspect', 'Action'].map(t => ({ text: t, options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk1 } } }));
const body = dec.scenarios.map(sc => {
  const hi = sc.name.startsWith('Satellite');
  const o = { color: HEX.dk1, fill: { color: hi ? 'FCEFD9' : HEX.lt1 }, bold: hi };
  return [sc.name.replace('Counterfactual: ', ''), sc.p.toFixed(2), `$${Math.round(sc.release).toLocaleString('en-US')}`, `$${Math.round(sc.inspect).toLocaleString('en-US')}`, sc.action.toUpperCase()].map(t => ({ text: t, options: o }));
});
s.addTable([hdr, ...body], { x: 0.5, y: 1.15, w: 9, colW: [3.6, 1.35, 1.35, 1.35, 1.35], fontSize: 12, fontFace: THEME.bodyFontFace, border: { type: 'solid', color: HEX.lt2, pt: 1 }, rowH: 0.42 });
tag(s, 8.55, 0.88, 'ASSUMED', HEX.accent4);
T(s, `Inspect whenever p > C / (e x L) = ${dec.scenarios[0].break_even_p.toFixed(3)}. Inputs: $300k exposure, $15k inspection, 90% catch rate, all assumed.`, { x: 0.5, y: 2.95, w: 9, h: 0.35, fontSize: 12, color: HEX.accent5 });
const pay = [['Who pays', 'Lenders, infrastructure funds and government project-monitoring cells; airlines for the diversion-capacity view.'], ['How much it is worth', 'Every inspection avoided when satellites agree, plus losses caught when they do not. A diversion costs airlines EUR 1,000-77,200 (EUROCONTROL).']];
pay.forEach(([h, d], i) => {
  const x = 0.5 + i * 4.6;
  card(s, x, 3.45, 4.4, 1.55, HEX.lt2, h);
  T(s, h, { x: x + 0.2, y: 3.55, w: 4.0, h: 0.35, fontSize: 15, bold: true, color: HEX.dk1 });
  T(s, d, { x: x + 0.2, y: 3.92, w: 4.0, h: 1.0, fontSize: 12, color: HEX.dk2 });
});
s.addNotes('2:30-3:15. Satellite evidence changes the action: with no data you inspect by default; if satellites agreed you could skip a $15k visit; here they disagree by 29 points, so inspect. All costs assumed and labelled. Who pays: lenders and monitoring cells per asset; airlines for knowing diversion capacity. Pricing is unvalidated.');

// ---------- 6. B3 ----------
pres.addSection({ title: 'Track B3' });
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Track B3' });
s.addText('Track B3: a LEO navigation layer that is harder to jam or spoof', { placeholder: 'title' });
const g = sim['GPS only'], gn = sim['GPS + NavIC + LEO'];
const b3 = [
  [`${phys.signal.leo_advantage_db} dB`, `stronger signal from 1,000 km than GPS from 20,200 km, so a 10 W jammer's denial area is ${phys.jamming.denial_area_reduction_factor}x smaller (${Math.round(phys.jamming.gps_denial_radius_km)} km to ${Math.round(phys.jamming.leo_denial_radius_km)} km radius)`, 'DERIVED · PHYSICS'],
  [`${gn.spoofed_median_error_m_uncorrected} m to ${gn.spoofed_median_error_m_ai_corrected} m`, `median spoofed position error with GPS + NavIC + LEO, before vs after the AI cross-check. Spoofing detected: ${Math.round(g.detection_rate * 1000) / 10}% with GPS alone, ${Math.round(gn.detection_rate * 1000) / 10}% with all three`, 'SIMULATION'],
  [`${phys.constellation.satellites_needed} sats`, `at 1,000 km for about 4 in view; ~$${Math.round(phys.cost.capex_usd / 1e6)}M capex, ~$${Math.round(phys.cost.per_year_usd / 1e6)}M a year to run`, 'ASSUMED COSTS'],
];
b3.forEach(([n, d, lab], i) => {
  const x = 0.5 + i * 3.05;
  card(s, x, 1.2, 2.85, 2.65, i === 1 ? HEX.dk1 : HEX.lt2, `B3 ${i + 1}`);
  T(s, lab, { x: x + 0.2, y: 1.32, w: 2.45, h: 0.25, fontSize: 9, bold: true, color: i === 1 ? HEX.accent2 : HEX.accent5 });
  T(s, n, { x: x + 0.2, y: 1.6, w: 2.45, h: 0.7, fontSize: 30, bold: true, color: i === 1 ? HEX.accent1 : HEX.dk1, fontFace: THEME.headFontFace });
  T(s, d, { x: x + 0.2, y: 2.35, w: 2.45, h: 1.4, fontSize: 12, color: i === 1 ? HEX.lt1 : HEX.dk2 });
});
card(s, 0.5, 4.05, 9, 0.95, HEX.lt2, 'B3 flow');
T(s, [{ text: 'Link to A6: ', options: { bold: true, color: HEX.dk1 } }, { text: 'A6 tells you which airports can absorb diversions when GPS degrades; B3 makes positioning around them harder to deny in the first place. Live 3D simulation: rehancodes-web.github.io/Mack.1/b3.html', options: { color: HEX.dk2 } }], { x: 0.7, y: 4.1, w: 8.6, h: 0.85, fontSize: 13, valign: 'middle' });
s.addNotes('3:15-4:15. Physics first: inverse-square law gives LEO a 19 dB edge, which shrinks a 10 W jammer\'s reach 80x in area. Simulation: GPS alone barely detects spoofing; adding NavIC and LEO with a learned cross-check catches 92% and pulls the spoofed error from 50 m to 8 m. Cost is a back-of-envelope with assumed inputs. Optionally open the 3D globe.');

// ---------- 7. Close ----------
pres.addSection({ title: 'Close' });
s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Close' });
s.addText('What we built in 12 hours', { placeholder: 'title', y: 0.35, h: 0.8 });
const done = [['C + A6, real data', 'GPS malfunction map from 24,579 aircraft reports; Jewar watched in 79 Sentinel-2 scenes with Larper AI and an inspect-or-release decision'], ['B3, simulation', 'Link budget, constellation sizing and cost, spoofing detection simulation, 3D globe'], ['Next steps', 'More days of GPS data plus satellite GNSS sources, then the passenger recovery flow with an airline pilot']];
done.forEach(([h, d], i) => {
  const y = 1.4 + i * 1.05;
  s.addShape(pres.shapes.OVAL, { x: 0.5, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: i < 2 ? HEX.accent1 : HEX.accent2 }, line: { color: i < 2 ? HEX.accent1 : HEX.accent2 } });
  T(s, i < 2 ? 'OK' : '>', { x: 0.5, y: y + 0.05, w: 0.5, h: 0.5, fontSize: 12, bold: true, color: HEX.dk1, align: 'center', valign: 'middle' });
  T(s, h, { x: 1.2, y, w: 8.2, h: 0.35, fontSize: 17, bold: true, color: HEX.lt1 });
  T(s, d, { x: 1.2, y: y + 0.35, w: 8.2, h: 0.5, fontSize: 13, color: HEX.accent6 });
});
T(s, 'Limits: land conversion is not completion · Larper is trained on WorldCover weak labels · all economics assumed · B3 is simulation, not hardware', { x: 0.5, y: 4.65, w: 9, h: 0.35, fontSize: 11, color: HEX.accent6 });
T(s, 'rehancodes-web.github.io/Mack.1', { x: 0.5, y: 5.05, w: 9, h: 0.3, fontSize: 12, bold: true, color: HEX.accent2 });
s.addNotes('4:15-5:00. Say exactly what was built and what was not. Recap the chain: C finds where GPS fails, A6 finds where diversions can go, B3 hardens positioning. End on the live site URL and thank the judges.');

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('wrote', OUT);
})();
