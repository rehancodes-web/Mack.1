// FlyWithEase hackathon deck, structured on the judges' marking scheme.
// Style follows the team's earlier decks (SAP HigherUp.AI, CropTwin): off-white slides, dark cover/close,
// running header with section + slide count, stat cards with sources, dark callouts, numbered columns.
// Outputs: pitch/slides/html/NN.html (for PNG render -> pptx) and docs/deck.html (interactive, keyboard/touch).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const ROOT = path.join(HERE, '..', '..');
const OUT = path.join(HERE, 'html'); fs.mkdirSync(OUT, { recursive: true });
const rd = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const met = rd('a6/outputs/classifier_metrics.json'), dec = rd('a6/outputs/decision.json'), rdy = rd('a6/outputs/readiness.json');
const phys = rd('b3/outputs/b3_physics.json'), sim = rd('b3/outputs/b3_sim.json').results;
const gsum = rd('c/outputs/gnss_summary.json'), ND = rd('decisions/nemotron_decisions.json'), NB = rd('decisions/nemotron_brief.json');
const NR = rd('a6/outputs/nemotron_review.json');
const csv = fs.readFileSync(path.join(ROOT, 'a6/outputs/progress_ai.csv'), 'utf8').replace(/\r/g, '').trim().split('\n');
const HD = csv[0].split(','), rows = csv.slice(1).map(l => Object.fromEntries(l.split(',').map((v, i) => [HD[i], v])));
const SITE = 'rehancodes-web.github.io/Mack.1';
const fmt = n => Number(n).toLocaleString('en-US');
const pc = (x, d = 0) => `${(x * 100).toFixed(d)}%`;
const cls = k => met.per_class.find(c => c.class === k);
const mon = m => new Date(`${m}-15T00:00:00Z`).toLocaleString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

// image paths: absolute file URLs for rendering, docs-relative names for the web deck
const IMG = {
  before: ['a6/outputs/hires_2019-10-09.jpg', 'hires_2019-10-09.jpg'], after: ['a6/outputs/hires_2026-05-28.jpg', 'hires_2026-05-28.jpg'],
  classmap: ['a6/outputs/classmap_2026-03.png', 'classmap_2026-03.png'], gnss: ['pitch/gnss_map.png', 'gnss_map.png'],
  shotA6: ['pitch/slides/shots/a6.png', 'shots/a6.png'], shotC: ['pitch/slides/shots/c.png', 'shots/c.png'], shotHome: ['pitch/slides/shots/index.png', 'shots/index.png'],
};
let WEB = false;
const img = k => WEB ? IMG[k][1] : pathToFileURL(path.join(ROOT, IMG[k][0])).href;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=B612:wght@400;700&family=Source+Sans+3:wght@400;600;700&display=swap');
:root{--paper:#F6F5F1;--card:#FFFFFF;--line:#E3E0D8;--ink:#121418;--sub:#5B616C;--faint:#8B909A;--night:#0F1419;--night2:#1A222B;
 --a6:#B8288F;--c:#0E7C86;--b3:#1E8A4C;--amber:#C26A0C;--red:#C0392B;--H:'Archivo',sans-serif;--B:'Source Sans 3',sans-serif;--N:'B612',sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
.slide{position:relative;width:1280px;height:720px;overflow:hidden;background:var(--paper);color:var(--ink);font-family:var(--B);padding:86px 72px 54px}
.slide.dark{background:var(--night);color:#EEF2F5}
.run{position:absolute;left:72px;right:72px;top:30px;display:flex;justify-content:space-between;align-items:center;font-family:var(--H);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.run .rub{letter-spacing:.02em;text-transform:none;font-weight:600;color:var(--sub);background:var(--card);border:1px solid var(--line);border-radius:20px;padding:4px 12px}
.dark .run .rub{background:var(--night2);border-color:#2A3540;color:#A9B4BE}
.run .sec{color:var(--k,var(--sub))}
h1,h2,h3{font-family:var(--H);font-variation-settings:'wdth' 100}
.slide:not(.dark){display:flex;flex-direction:column;justify-content:center;padding:92px 72px 60px}
h2{font-size:41px;line-height:1.08;font-weight:800;letter-spacing:-.015em;max-width:1100px}
h2 .s{display:block;color:var(--sub);font-weight:600}
h3{font-size:20px;font-weight:700;line-height:1.2}
p,li{font-size:17px;line-height:1.42}
.small{font-size:14.5px;color:var(--sub);line-height:1.4}
.src{position:absolute;left:72px;right:72px;bottom:24px;font-size:11.5px;color:var(--faint)}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px}
.dark .card{background:var(--night2);border-color:#2A3540}
.black{background:var(--night);color:#EEF2F5;border-radius:16px;padding:22px 26px}
.num{font-family:var(--N);font-weight:700;line-height:1}
.grid{display:grid;gap:16px}
.pill{display:inline-block;font-size:11.5px;font-weight:700;border-radius:20px;padding:2px 9px;border:1.5px solid currentColor}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:7px;vertical-align:1px}
table{width:100%;border-collapse:collapse}
th{font-family:var(--H);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);text-align:left;padding:7px 10px;border-bottom:1.5px solid var(--line)}
td{font-size:15.5px;padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top;line-height:1.35}
.k-a6{--k:var(--a6)}.k-c{--k:var(--c)}.k-b3{--k:var(--b3)}.k-am{--k:var(--amber)}
.kc{color:var(--k)}
ol.steps{list-style:none;counter-reset:s;display:grid;gap:12px}
ol.steps li{counter-increment:s;position:relative;padding-left:38px}
ol.steps li::before{content:counter(s);position:absolute;left:0;top:0;width:26px;height:26px;border-radius:50%;background:var(--k,var(--ink));color:#fff;font-family:var(--N);font-weight:700;font-size:13px;display:grid;place-items:center}
`;
const slides = [];
const add = (o) => slides.push(o);
const run = (sec, rub, n, k = '') => `<div class="run ${k}"><span class="sec">${sec}</span><span class="rub">${rub}</span><span>FlyWithEase&nbsp;&nbsp;${String(n).padStart(2, '0')} / %TOTAL%</span></div>`;
const S = (n, cls, inner) => `<section class="slide ${cls}" aria-label="Slide ${n}">${inner}</section>`;

// ---------- 1 COVER ----------
add({ notes: '0:00–0:15. GPS jamming hits Indian airspace daily. FlyWithEase finds where GPS is failing, confirms from orbit which airport can take the diverted flights, hardens positioning and protects passengers. Primary Track A6, additional Track C, with B3 as the long-term layer.', html: n => S(n, 'dark', `
 <img src="${img('after')}" alt="" style="position:absolute;right:0;top:0;width:640px;height:720px;object-fit:cover;opacity:.85">
 <div style="position:absolute;right:0;top:0;width:640px;height:720px;background:linear-gradient(90deg,#0F1419 0%,rgba(15,20,25,.35) 40%,rgba(15,20,25,.1))"></div>
 <div style="position:absolute;right:250px;top:46px;font-family:var(--N);font-weight:700;font-size:15px;color:#F2A93B;border:2px solid #F2A93B;padding:5px 14px;border-radius:5px;background:#0F1419">GPS PRIMARY LOST</div>
 <div class="run" style="color:#7E8A95"><span>Mach-A-Thon Aeromania '26 · Orbit to Economy: AI in Space</span><span></span><span>with Boeing</span></div>
 <div style="position:absolute;left:72px;top:150px;width:600px">
  <h1 style="font-size:84px;font-weight:800;letter-spacing:-.03em;line-height:.95;font-variation-settings:'wdth' 110">FlyWithEase</h1>
  <p style="font-size:26px;line-height:1.3;margin-top:22px;color:#C9D3DB;font-family:var(--H);font-weight:600">When GPS fails near an airport, flights divert. We make sure there is somewhere ready to go, and that no passenger is stranded.</p>
  <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:12px;margin-top:40px">
   ${[['Track A6', 'Infrastructure from orbit', '#E46BC5', 'Primary · 65 marks'], ['Track C', 'GPS malfunction detection', '#3FC6D1', 'Additional · 25 marks'], ['Track B3', 'Harder-to-jam positioning', '#4CC38A', 'Long-term layer']].map(([a, b, c, d]) => `<div style="border-top:3px solid ${c};padding-top:10px"><div style="font-family:var(--H);font-weight:800;font-size:18px;color:${c}">${a}</div><div style="font-size:14.5px;margin-top:4px">${b}</div><div style="font-size:12px;color:#7E8A95;margin-top:6px">${d}</div></div>`).join('')}
  </div>
 </div>
 <div style="position:absolute;left:72px;bottom:34px;font-size:13px;color:#7E8A95">Live demo: ${SITE}</div>`) });

// ---------- 2 PROBLEM ----------
add({ notes: '0:15–0:35. The problem, with sources. GPS interference is routine over India; most incidents mean total loss of GPS. Delhi was spoofed in 2025. Today the warning, the diversion and the passenger recovery are disconnected, so everyone loses.', html: n => S(n, 'k-am', `${run('The problem', 'Track A · Problem understanding & economic impact · 20', n)}
 <h2>GPS fails over India every day.<span class="s">The flights divert. The passengers pay.</span></h2>
 <div class="grid" style="grid-template-columns:repeat(4,1fr);margin-top:26px">
  ${[['2,354', 'GPS interference incidents reported to Parliament, Nov 2023 – Dec 2025', 'var(--amber)'], ['623', 'more in just Jan–Feb 2026: the rate is rising', 'var(--red)'], ['71%', 'of India\'s 2025 incidents meant total loss of GPS on board', 'var(--a6)'], ['+500%', 'GPS spoofing reports, 2024 vs 2023 (IATA)', 'var(--c)']].map(([a, b, c]) => `<div class="card"><div class="num" style="font-size:44px;color:${c}">${a}</div><p class="small" style="margin-top:10px">${b}</p></div>`).join('')}
 </div>
 <div class="black" style="margin-top:20px;display:grid;grid-template-columns:1fr 1.6fr;gap:26px;align-items:center">
  <div><div style="font-family:var(--H);font-weight:800;font-size:24px">Delhi, 2025</div><p style="color:#B8C2CB;margin-top:6px;font-size:15px">Approaches to IGI Runway 10 were spoofed. Crews switched to contingency procedures; DGCA introduced real-time spoofing reports.</p></div>
  <ul style="list-style:none;display:grid;gap:9px">
   ${['Interference monitors know where GPS fails, but stop at the map.', 'Airline ops pick a diversion airport without knowing whether it is built, ready, or in clean airspace.', 'Passengers get "15 more minutes", missed connections and wrong-city hotels, because recovery starts after the fact.'].map(t => `<li style="font-size:15.5px;color:#E6ECF0"><span class="dot" style="background:#F2A93B"></span>${t}</li>`).join('')}
  </ul>
 </div>
 <div class="src">Sources: Lok Sabha answer, 12 Mar 2026; ICAO Asia-Pacific paper, Jan 2026 (impact shares); IATA; Digital Sansad, 1 Dec 2025. All reported.</div>`) });

// ---------- 3 USERS & VALUE ----------
add({ notes: '0:35–0:55. Intended users and economic value. Four users, each with a decision and a cost. Airlines pay for diversions, lenders for infrastructure risk, regulators for national resilience.', html: n => S(n, 'k-am', `${run('Who it serves', 'Track A · Problem understanding & economic impact · 20', n)}
 <h2>Four users, four decisions, real money on each.</h2>
 <table style="margin-top:22px">
  <thead><tr><th style="width:19%">User</th><th style="width:27%">Decision they make</th><th style="width:28%">What it costs today</th><th>What FlyWithEase gives them</th></tr></thead>
  <tbody>
   <tr><td><b>Airline operations</b></td><td>Where to divert when Delhi's GPS degrades</td><td>€1,000–77,200 per diverted flight; $98 per block minute</td><td>A diversion airport that is built, in clean GPS airspace, with rebooking started early</td></tr>
   <tr><td><b>Infrastructure lenders</b></td><td>Release the next construction tranche, or inspect first</td><td>Paying against optimistic progress reports (Jewar: 80% claimed)</td><td>Independent progress from orbit: ${dec.satellite_observed_pct}% seen. Inspect for $15k instead of risking $112k</td></tr>
   <tr><td><b>Passengers</b></td><td>Wait, rebook, or find a hotel</td><td>Hours of uncertainty, missed connections, lost bags</td><td>Honest status, a confirmed seat, care at the right airport</td></tr>
   <tr><td><b>DGCA / AAI</b></td><td>Which airports and regions need protection</td><td>2,977 incidents since Nov 2023 with no shared live picture</td><td>A map of where GPS fails and which airports can absorb traffic</td></tr>
  </tbody>
 </table>
 <div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:18px">
  <div class="card"><div class="num" style="font-size:30px;color:var(--amber)">€77,200</div><p class="small">top-end cost of one intercontinental diversion</p></div>
  <div class="card"><div class="num" style="font-size:30px;color:var(--a6)">$15k vs $112k</div><p class="small">inspection cost vs expected loss, Jewar case (assumed inputs)</p></div>
  <div class="card"><div class="num" style="font-size:30px;color:var(--c)">₹0</div><p class="small">data cost: every satellite source we use is free and public</p></div>
 </div>
 <div class="src">EUROCONTROL diversion cost (2022 prices); Airlines for America 2025; Lok Sabha 2026; A6 economics use assumed probabilities and costs.</div>`) });

// ---------- 4 A6 OBJECTIVE ----------
add({ notes: '0:55–1:10. Track A objective 6: monitor construction and asset progress from orbit. We chose Noida International Airport at Jewar: 70 km from Delhi, the obvious diversion airport, and a project whose opening was promised three times.', html: n => S(n, 'k-a6', `${run('Track A6 · objective', 'Track A · Working demo & objective completion · 10', n, 'k-a6')}
 <h2>Objective 6: monitor construction from orbit.<span class="s">We watched the airport Delhi would divert to.</span></h2>
 <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:26px;margin-top:22px">
  <div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;border-radius:12px;overflow:hidden;height:250px">
    <div style="position:relative"><img src="${img('before')}" style="width:100%;height:100%;object-fit:cover"><span class="pill" style="position:absolute;left:10px;bottom:10px;background:#fff;color:var(--ink);border-color:#fff">2019 · farmland</span></div>
    <div style="position:relative"><img src="${img('after')}" style="width:100%;height:100%;object-fit:cover"><span class="pill" style="position:absolute;left:10px;bottom:10px;background:#fff;color:var(--ink);border-color:#fff">2026 · runway + terminal</span></div>
   </div>
   <p class="small" style="margin-top:8px">Esri World Imagery Wayback (Maxar, Earthstar), ~2 m. Yellow: 1,333 ha airport boundary (OpenStreetMap).</p>
  </div>
  <div class="grid" style="gap:12px;align-content:start">
   <div class="card"><h3 class="kc">Why Jewar</h3><p style="margin-top:6px">70 km from Delhi IGI, 1,333 ha greenfield site, phase 1 opened 28 Mar 2026. If Delhi's GPS fails, this is where flights go, so it must really be ready.</p></div>
   <div class="card"><h3>The promise vs. the ground</h3>
    <table style="margin-top:4px"><tbody>
     <tr><td>Nov 2021</td><td>Foundation stone</td></tr><tr><td>Sep 2024</td><td>First opening target, missed</td></tr><tr><td>Jan 2025</td><td><b>"80% complete"</b></td></tr><tr><td>Mar 2026</td><td>Phase 1 inaugurated</td></tr>
    </tbody></table></div>
  </div>
 </div>`) });

// ---------- 5 DATA ----------
add({ notes: '1:10–1:25. Technical depth: appropriate satellite data. Seven sources, all free. Sentinel-2 is the measurement; WorldCover trains the AI; Wayback is for the eye; ADS-B powers Track C; CelesTrak the globe. We fixed real data problems along the way.', html: n => S(n, 'k-c', `${run('Technology · data', 'Track A · Technical depth, AI & satellite data · 20', n, 'k-c')}
 <h2>Seven real datasets, all free and public.</h2>
 <table style="margin-top:18px">
  <thead><tr><th style="width:24%">Dataset</th><th style="width:15%">Resolution</th><th style="width:13%">Volume</th><th>What it does for us</th></tr></thead>
  <tbody>
   <tr><td><b>Sentinel-2 L2A</b> · ESA Copernicus</td><td>10 m, 13 bands</td><td>79 monthly scenes</td><td>The measurement: land conversion and Larper's inputs, Jan 2020 – Nov 2026</td></tr>
   <tr><td><b>ESA WorldCover 2021</b></td><td>10 m</td><td>${fmt(met.n_train + met.n_test)} labelled px</td><td>Training labels for Larper, taken only from land around the airport</td></tr>
   <tr><td><b>Esri World Imagery Wayback</b></td><td>~2 m</td><td>13 dated versions</td><td>Human-readable before/after; a check on what Larper should see</td></tr>
   <tr><td><b>OpenStreetMap</b></td><td>vector</td><td>1 polygon</td><td>The 1,333 ha airport boundary used for every measurement</td></tr>
   <tr><td><b>ADS-B Exchange</b> (aircraft NIC)</td><td>1° cells</td><td>${fmt(gsum.reports)} reports</td><td>Track C: where aircraft report degraded GPS</td></tr>
   <tr><td><b>CelesTrak</b> orbital elements</td><td>per satellite</td><td>GPS, Galileo, NavIC, LEO</td><td>The 3D globe and Track B3 geometry</td></tr>
   <tr><td><b>Landsat GLS</b> · NASA/USGS</td><td>30 m</td><td>1975–2010</td><td>Before images for every airport on the globe</td></tr>
  </tbody>
 </table>
 <div class="card" style="margin-top:14px;display:flex;gap:18px;align-items:center"><b style="font-family:var(--H);white-space:nowrap">Real problems we fixed:</b><span class="small" style="font-size:14px">a +1,000 DN offset that differs between Sentinel-2 collections (checked against raw pixels) · an 8-month hole in one catalogue, filled from another · cloud masking per pixel, cloudy months reported as gaps, never zero.</span></div>`) });

// ---------- 6 AI / LARPER ----------
add({ notes: '1:25–1:45. AI approach and implementation. Larper is a Random Forest labelling every 10 m pixel into built, bare, vegetation or water. Trained on WorldCover around the airport, tested on a separate block of land. Five-step pipeline, all in Node.js.', html: n => S(n, 'k-a6', `${run('Technology · AI', 'Track A · Technical depth, AI & satellite data · 20', n, 'k-a6')}
 <h2>Larper: AI that labels every 10 m of the airport.</h2>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:20px">
  <div>
   <ol class="steps" style="--k:var(--a6)">
    <li><b>Fetch</b> only the airport window from cloud-optimised Sentinel-2 files (no full-tile downloads)</li>
    <li><b>Clean</b>: per-scene scale/offset, cloud and shadow mask from the scene classification layer</li>
    <li><b>Features</b>: 6 bands + NDVI, NDBI, water index, bare-soil index = 10 per pixel</li>
    <li><b>Classify</b>: Random Forest, ${met.params.rf.nEstimators} trees, depth ${met.params.rf.treeOptions.maxDepth}, built / bare / vegetation / water</li>
    <li><b>Measure</b>: 12-month median of converted land per month, against a transparent NDVI baseline</li>
   </ol>
   <div class="card" style="margin-top:14px"><b>Honest validation:</b> trained west of the airport, tested on a separate block of land to the east (${fmt(met.n_train)} train / ${fmt(met.n_test)} test pixels). The airport itself is never in training.</div>
  </div>
  <div>
   <div style="background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden"><img src="${img('classmap')}" style="width:100%;display:block"></div>
   <div style="display:flex;gap:16px;margin-top:8px;font-size:13px;color:var(--sub)"><span><span class="dot" style="background:#dc3c3c"></span>built / paved</span><span><span class="dot" style="background:#e6c878"></span>bare</span><span><span class="dot" style="background:#3c8c3c"></span>vegetation</span><span><span class="dot" style="background:#3c78dc"></span>water</span></div>
   <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:12px">
    <div class="card"><div class="num kc" style="font-size:36px">${pc(met.overall_accuracy)}</div><p class="small">agreement with WorldCover on unseen land</p></div>
    <div class="card"><div class="num" style="font-size:36px">${pc(cls('built_paved').recall)}</div><p class="small">of built/paved pixels found (recall)</p></div>
   </div>
  </div>
 </div>`) });

// ---------- 7 RESULTS ----------
const ser = rows.filter(r => r.converted_12m !== '' && r.baseline_cleared_12m !== '');
const t0 = Date.UTC(2020, 0, 1), t1 = Date.UTC(2026, 11, 31), CW = 620, CH = 260;
const X = m => (Date.parse(m + '-15') - t0) / (t1 - t0) * CW, Yv = v => CH - v * CH;
const ln = k => ser.map((r, i) => `${i ? 'L' : 'M'}${X(r.month).toFixed(1)},${Yv(Number(r[k])).toFixed(1)}`).join(' ');
const jan = ser.find(r => r.month === '2025-01');
add({ notes: '1:45–2:15. The result. Both the AI and the baseline agree: nothing happens until mid-2023, peak in spring 2025. In January 2025 the builder claimed 80%; orbit saw 41 to 51 percent of the land converted. That gap is exactly when a lender should look.', html: n => S(n, 'k-a6', `${run('Track A6 · result', 'Track A · Working demo & objective completion · 10', n, 'k-a6')}
 <h2>The builder said 80%. Orbit saw half.</h2>
 <div style="display:grid;grid-template-columns:680px 1fr;gap:26px;margin-top:18px">
  <div class="card" style="padding:16px 18px">
   <svg width="640" height="320" viewBox="-44 -14 690 330">
    ${[0, .25, .5, .75, 1].map(v => `<line x1="0" x2="${CW}" y1="${Yv(v)}" y2="${Yv(v)}" stroke="#ECE9E2"/><text x="-8" y="${Yv(v) + 4}" font-size="12" fill="#8B909A" text-anchor="end" font-family="B612">${v * 100}%</text>`).join('')}
    ${[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => `<text x="${X(y + '-01')}" y="${CH + 22}" font-size="12" fill="#8B909A" font-family="B612">${y}</text>`).join('')}
    <rect x="${X('2023-06')}" y="0" width="${X('2025-04') - X('2023-06')}" height="${CH}" fill="#B8288F" opacity=".06"/>
    <text x="${X('2023-06') + 6}" y="16" font-size="12" fill="#B8288F" font-family="B612">construction visible</text>
    <path d="${ln('baseline_cleared_12m')}" fill="none" stroke="#0E7C86" stroke-width="2.5"/>
    <path d="${ln('converted_12m')}" fill="none" stroke="#B8288F" stroke-width="3.5"/>
    <line x1="${X('2025-01')}" x2="${X('2025-01')}" y1="${Yv(.8)}" y2="${Yv(Number(jan.converted_12m))}" stroke="#C26A0C" stroke-width="2" stroke-dasharray="4 4"/>
    <circle cx="${X('2025-01')}" cy="${Yv(.8)}" r="8" fill="#fff" stroke="#C26A0C" stroke-width="3"/>
    <text x="${X('2025-01') - 14}" y="${Yv(.8) + 5}" font-size="13" fill="#C26A0C" text-anchor="end" font-family="B612" font-weight="700">80% claimed, Jan 2025</text>
   </svg>
   <div style="display:flex;gap:20px;font-size:13px;color:var(--sub)"><span><span class="dot" style="background:#B8288F"></span>Larper AI: converted land</span><span><span class="dot" style="background:#0E7C86"></span>NDVI baseline: cleared all year</span></div>
  </div>
  <div class="grid" style="gap:12px;align-content:start">
   <div class="card"><div class="num" style="font-size:44px;color:var(--amber)">80%</div><p class="small">"work complete", builder, Jan 2025 · reported</p></div>
   <div class="card" style="outline:2px solid var(--a6)"><div class="num kc" style="font-size:44px">${Math.round(jan.converted_12m * 100)}–${dec.satellite_observed_pct}%</div><p class="small">land converted, Jan 2025 (Larper – baseline) · derived</p></div>
   <table><tbody>
    <tr><td>Conversion starts</td><td><b>${mon(rdy.satellite.conversion_start_month)}</b></td></tr>
    <tr><td>Peak</td><td><b>${pc(rdy.satellite.peak_frac)} in ${mon(rdy.satellite.peak_month)}</b></td></tr>
    <tr><td>Built/paved, Mar 2026</td><td><b>${pc(rdy.satellite.ai_classifier.built_paved_2026_03)}</b></td></tr>
   </tbody></table>
  </div>
 </div>`) });

// ---------- 8 ACCURACY ----------
add({ notes: '2:15–2:35. Feasibility, accuracy and applicability. We report every class, including the weak one. Two independent methods agree on the timeline. Nemotron audits Larper maps against photos, and a human blind spot-check page exists. Limits are stated.', html: n => S(n, 'k-a6', `${run('Accuracy & reliability', 'Track A · Feasibility, accuracy & applicability · 15', n, 'k-a6')}
 <h2>How we know the numbers hold up.</h2>
 <div style="display:grid;grid-template-columns:1.05fr 1fr;gap:24px;margin-top:18px">
  <div>
   <table>
    <thead><tr><th>Class</th><th>Test pixels</th><th>Recall</th><th>Precision</th><th>Read as</th></tr></thead>
    <tbody>${met.per_class.map(c => `<tr><td><b>${c.class.replace('_', ' / ')}</b></td><td>${fmt(c.support)}</td><td>${pc(c.recall)}</td><td>${pc(c.precision)}</td><td class="small">${{ vegetation: 'reliable', built_paved: 'finds construction; some over-calling', bare: 'weak: few training examples', water: 'small class, indicative' }[c.class]}</td></tr>`).join('')}</tbody>
   </table>
   <div class="black" style="margin-top:16px;padding:16px 20px"><b style="font-family:var(--H)">Two independent methods agree.</b> <span style="color:#B8C2CB;font-size:15px">The Larper AI and a simple NDVI rule both show no change before mid-2023 and a peak in 2025, so the timeline does not depend on one model.</span></div>
  </div>
  <div class="grid" style="gap:12px;align-content:start">
   <div class="card"><h3>Three checks on the AI</h3><ol class="steps" style="--k:var(--a6);margin-top:10px">
    <li><b>Spatial holdout</b>: tested on land never used in training</li>
    <li><b>Nemotron vision audit</b>: ${NR.vision.length} Larper maps compared with the satellite photos (trust: medium)</li>
    <li><b>Human spot-check</b>: blind labelling page; a single hazy 2021 scene was caught and smoothed out</li>
   </ol></div>
   <div class="card"><h3 style="color:var(--amber)">Limits we state</h3><p class="small" style="margin-top:6px;font-size:14px">Land conversion is not completion · WorldCover is itself a model (agreement, not ground truth) · 10 m pixels cannot see individual buildings · monsoon months are gaps.</p></div>
  </div>
 </div>`) });

// ---------- 9 DECISION ----------
add({ notes: '2:35–2:50. Applicability: the numbers drive a decision. Without satellite data a lender inspects blind; if orbit agreed they could skip a $15k visit; here a 29-point gap makes inspection clearly worth it. The decision flips at a known break-even.', html: n => S(n, 'k-a6', `${run('From data to decision', 'Track A · Feasibility, accuracy & applicability · 15', n, 'k-a6')}
 <h2>The satellite gap turns into a money decision.</h2>
 <table style="margin-top:20px">
  <thead><tr><th style="width:42%">Evidence</th><th>P(report optimistic)</th><th>Cost if release</th><th>Cost if inspect</th><th>Decision</th></tr></thead>
  <tbody>${dec.scenarios.map(s => `<tr${s.name.startsWith('Satellite') ? ' style="background:#FBEFF8"' : ''}><td>${s.name.startsWith('Satellite') ? '<b>' + s.name + '</b>' : s.name}</td><td>${s.p.toFixed(2)}</td><td>$${fmt(Math.round(s.release))}</td><td>$${fmt(Math.round(s.inspect))}</td><td><b style="color:${s.action === 'inspect' ? 'var(--a6)' : 'var(--b3)'}">${s.action.toUpperCase()}</b></td></tr>`).join('')}</tbody>
 </table>
 <div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:18px">
  <div class="card"><div class="num" style="font-size:30px">${dec.scenarios[0].break_even_p.toFixed(3)}</div><p class="small">break-even probability: inspect whenever the chance of an optimistic report is above this</p></div>
  <div class="card"><div class="num" style="font-size:30px;color:var(--a6)">${dec.gap_pts} pts</div><p class="small">gap between claim (80%) and orbit (${dec.satellite_observed_pct}%) in Jan 2025</p></div>
  <div class="card"><div class="num" style="font-size:30px;color:var(--b3)">Conditional</div><p class="small">Jewar as a diversion airport: built (orbit), but runway certification and ATC need airline confirmation</p></div>
 </div>
 <div class="src">Inputs assumed for illustration: $300k exposure, $15k inspection, 90% of optimistic reports caught. Interactive sliders on the live Jewar page.</div>`) });

// ---------- 10 DEMO ----------
add({ notes: '2:50–3:05. Working demo: everything shown is live on the site. If time allows, open the Jewar page and drag the before/after slider.', html: n => S(n, '', `${run('Working demo', 'Track A · Working demo & objective completion · 10', n)}
 <h2>Everything here runs live.<span class="s">${SITE}</span></h2>
 <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:22px;margin-top:16px">
  <div style="border-radius:12px;overflow:hidden;border:1px solid var(--line);box-shadow:0 12px 30px rgba(18,20,24,.12)"><img src="${img('shotA6')}" style="width:100%;display:block"></div>
  <div>
   <ol class="steps" style="--k:var(--ink)">
    <li><b>Jewar monitor</b>: drag 2019 vs 2026, switch to the Larper layer, read the progress curve</li>
    <li><b>Move the sliders</b>: inspection cost and probability; watch the decision flip</li>
    <li><b>GPS malfunction map</b>: 37 red zones, Jewar normal</li>
    <li><b>3D globe</b>: real GPS, Galileo, NavIC and LEO satellites; click any of 4,155 airports</li>
    <li><b>Passenger impact</b>: Nemotron's decisions on four real GPS failures</li>
   </ol>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px"><img src="${img('shotC')}" style="width:100%;border-radius:8px;border:1px solid var(--line)"><img src="${img('shotHome')}" style="width:100%;border-radius:8px;border:1px solid var(--line)"></div>
  </div>
 </div>`) });

// ---------- 11 TRACK C ----------
add({ notes: '3:05–3:30. Additional track C, GNSS resilience. Objectives covered: detect jamming and spoofing, protect critical infrastructure, protective use only. Real aircraft data, rated per cell, linked directly to the A6 diversion decision.', html: n => S(n, 'k-c', `${run('Track C · additional', 'Track B/C · Technical depth & objective completion · 10', n, 'k-c')}
 <h2>Track C: a live map of where GPS is failing.</h2>
 <div style="display:grid;grid-template-columns:430px 1fr;gap:26px;margin-top:18px">
  <div style="border-radius:12px;overflow:hidden;height:410px"><img src="${img('gnss')}" style="width:100%;height:100%;object-fit:cover;object-position:30% 30%"></div>
  <div>
   <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:12px">
    <div class="card"><div class="num kc" style="font-size:30px">${fmt(gsum.reports)}</div><p class="small">aircraft reports, one day</p></div>
    <div class="card"><div class="num" style="font-size:30px;color:var(--red)">${gsum.cells_high}</div><p class="small">high-interference zones</p></div>
    <div class="card"><div class="num" style="font-size:30px;color:var(--b3)">Normal</div><p class="small">Jewar region, ${fmt(gsum.jewar_region.aircraft_seen)} aircraft</p></div>
   </div>
   <table style="margin-top:14px"><thead><tr><th style="width:44%">Track C objective</th><th>How we meet it</th></tr></thead><tbody>
    <tr><td>Detect GPS jamming / spoofing</td><td>Aircraft broadcast trust in their own position (NIC); low values in a 1° cell = degraded GPS. Altitude mismatches flag possible spoofing.</td></tr>
    <tr><td>Protect critical infrastructure</td><td>Feeds the A6 decision: a diversion airport must sit in clean airspace</td></tr>
    <tr><td>Protective use only</td><td>Areas only; no transmitter hunting, no targeting, no tracking of individual flights</td></tr>
   </tbody></table>
   <p class="small" style="margin-top:10px">Hotspots: India–Pakistan border and Myanmar. Limit: one day (1 Nov 2026, 72 snapshots); a pilot needs a continuous feed.</p>
  </div>
 </div>`) });

// ---------- 12 NEMOTRON ----------
const fc = NB.fact_check || { issues: [] };
add({ notes: '3:30–3:55. Where NVIDIA Nemotron sits in the system: five jobs, two models. Most important: the two-pass readiness brief, where one Nemotron call writes the decision and a second fact-checks it against the data. AI proposes, the data and people decide.', html: n => S(n, 'k-a6', `${run('AI integration · NVIDIA Nemotron', 'Track A · Technical depth, AI · 20 · Track B/C · Innovation · 10', n, 'k-a6')}
 <h2>Nemotron turns satellite numbers into decisions,<span class="s">and checks its own work.</span></h2>
 <div style="display:grid;grid-template-columns:1.15fr 1fr;gap:24px;margin-top:18px">
  <table><thead><tr><th style="width:30%">Job</th><th style="width:26%">Model</th><th>What it does</th></tr></thead><tbody>
   <tr><td><b>Vision audit</b></td><td class="small">super-vl-120b</td><td>Compares ${NR.vision.length} Larper maps with satellite photos; flags over-called built land</td></tr>
   <tr><td><b>Readiness brief</b></td><td class="small">lightning-30b</td><td>Fuses Track C + A6 into a diversion decision: Jewar <b>${NB.brief?.jewar_readiness?.verdict || 'conditional'}</b></td></tr>
   <tr><td><b>Fact-checker</b></td><td class="small">lightning-30b</td><td>Second pass checks the brief against the data: <b>${(fc.verdict || '').replace(/_/g, ' ')}</b>, ${fc.issues?.length || 0} issues found</td></tr>
   <tr><td><b>Ops decisions</b></td><td class="small">lightning-30b</td><td>Four real GPS failures: turnaround impact, options, fix</td></tr>
   <tr><td><b>Analyst on site</b></td><td class="small">lightning-30b</td><td>Lender memos and "what changed here?" on any place</td></tr>
  </tbody></table>
  <div class="grid" style="gap:12px;align-content:start">
   <div class="black" style="padding:18px 20px"><div class="small" style="color:#9AA6B0">Nemotron fact-checker, on the brief</div><p style="margin-top:6px;font-size:15px;color:#EEF2F5">"${(fc.issues?.[3]?.problem || fc.issues?.[0]?.problem || '').slice(0, 150)}"</p><p style="margin-top:8px;font-size:13.5px;color:#E46BC5">Fix: ${(fc.issues?.[3]?.fix || fc.issues?.[0]?.fix || '').slice(0, 110)}</p></div>
   <div class="card"><h3>Guardrails</h3><p class="small" style="margin-top:6px;font-size:14px">Answers only from supplied data · structured JSON outputs · every number labelled reported, derived or assumed · human check on every case (we corrected Nemotron on Delhi: ILS was available).</p></div>
  </div>
 </div>`) });

// ---------- 13 B3 ----------
const gn = sim['GPS + NavIC + LEO'], g0 = sim['GPS only'];
add({ notes: '3:55–4:05. Track B3 as the long-term layer, briefly: physics, simulation, cost. Shown on the 3D globe.', html: n => S(n, 'k-b3', `${run('Track B3 · long-term layer', 'Track B/C · Technical depth · 10', n, 'k-b3')}
 <h2>Track B3: bring navigation closer and jamming weakens.</h2>
 <div class="grid" style="grid-template-columns:repeat(4,1fr);margin-top:22px">
  <div class="card"><div class="num kc" style="font-size:40px">${phys.signal.leo_advantage_db} dB</div><p class="small">stronger: 1,000 km vs 20,200 km (inverse-square law) · physics</p></div>
  <div class="card"><div class="num kc" style="font-size:40px">${phys.jamming.denial_area_reduction_factor}×</div><p class="small">smaller area a 10 W jammer can deny (${Math.round(phys.jamming.gps_denial_radius_km)} → ${Math.round(phys.jamming.leo_denial_radius_km)} km radius)</p></div>
  <div class="card"><div class="num" style="font-size:40px">${gn.spoofed_median_error_m_uncorrected}→${gn.spoofed_median_error_m_ai_corrected} m</div><p class="small">spoofed error with an AI cross-check of GPS + NavIC + LEO · simulation</p></div>
  <div class="card"><div class="num" style="font-size:40px">${Math.round(g0.detection_rate * 100)}→${Math.round(gn.detection_rate * 100)}%</div><p class="small">spoofing detected: GPS alone vs three constellations</p></div>
 </div>
 <table style="margin-top:18px"><thead><tr><th>Constellation</th><th>Spoofing detected</th><th>False alarms</th><th>Clean error</th><th>Spoofed error after AI</th></tr></thead><tbody>
  ${Object.entries(sim).map(([k, v]) => `<tr><td><b>${k}</b></td><td>${pc(v.detection_rate, 1)}</td><td>${pc(v.false_alarm_rate, 1)}</td><td>${v.clean_median_error_m} m</td><td>${v.spoofed_median_error_m_ai_corrected} m</td></tr>`).join('')}
 </tbody></table>
 <p class="small" style="margin-top:12px;font-size:14px">${phys.constellation.satellites_needed} satellites at 1,000 km for ~4 in view · ~$${Math.round(phys.cost.capex_usd / 1e6)}M to build, ~$${Math.round(phys.cost.per_year_usd / 1e6)}M a year (assumed inputs). Builds on India's NavIC. Not needed for the pilot.</p>`) });

// ---------- 14 ORIGINALITY ----------
const players = [['Spire', 'satellite RF interference detection', [1, 0, 0]], ['Jeppesen', 'interference awareness for pilots', [.5, 0, 0]], ['Boeing GPS Event Monitor', 'on-aircraft GPS event records', [1, 0, 0]], ['SAT-JAM', 'Sentinel orbit-level interference maps', [1, 0, 0]], ['EO construction analytics', 'satellite progress monitoring', [0, .5, 0]], ['Amadeus Passenger Recovery', 'rebooking after disruption', [0, 0, 1]]];
const D = v => v === 1 ? '<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:var(--b3)"></span>' : v === .5 ? '<span style="display:inline-block;width:16px;height:16px;border-radius:50%;border:2.5px solid var(--amber)"></span>' : '<span style="display:inline-block;width:16px;height:2px;background:#C9C5BC;vertical-align:middle"></span>';
add({ notes: '4:05–4:20. Innovation and originality. Detection exists, rebooking exists, construction analytics exist. Nobody links GPS failure to verified diversion capacity to passenger recovery. That link is our contribution.', html: n => S(n, '', `${run('Innovation & originality', 'Track B/C · Innovation & economic/strategic impact · 10', n)}
 <h2>Others solve parts of this.<span class="s">Nobody closes the loop.</span></h2>
 <table style="margin-top:18px"><thead><tr><th style="width:44%">Who</th><th style="text-align:center">Detects GPS failure</th><th style="text-align:center">Verifies diversion airport</th><th style="text-align:center">Recovers passengers</th><th style="text-align:center">Connects all three</th></tr></thead>
  <tbody>${players.map(([a, b, v]) => `<tr><td><b>${a}</b> <span class="small">· ${b}</span></td>${v.map(x => `<td style="text-align:center">${D(x)}</td>`).join('')}<td style="text-align:center">${D(0)}</td></tr>`).join('')}
  <tr style="background:#FBEFF8"><td><b style="color:var(--a6);font-family:var(--H);font-size:17px">FlyWithEase</b></td><td style="text-align:center">${D(1)}</td><td style="text-align:center">${D(1)}</td><td style="text-align:center">${D(.5)}</td><td style="text-align:center"><span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:var(--a6)"></span></td></tr></tbody></table>
 <div class="black" style="margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px">
  ${[['Satellite-verified capacity', 'Nobody checks from orbit that the diversion airport is actually built.'], ['Interference + capacity in one decision', 'GPS health and airport readiness feed one Nemotron brief.'], ['Self-checking AI', 'A second Nemotron pass fact-checks every brief before a person sees it.']].map(([a, b]) => `<div><div style="font-family:var(--H);font-weight:800;color:#E46BC5;font-size:16px">${a}</div><p style="color:#C3CCD4;font-size:14px;margin-top:4px">${b}</p></div>`).join('')}
 </div>
 <div class="src">Based on public product information, which may be incomplete. Passenger recovery is specified, not built.</div>`) });

// ---------- 15 FEASIBILITY ----------
add({ notes: '4:20–4:40. Practical feasibility: what runs today, what a pilot needs, assumptions and constraints stated plainly. No new satellites needed for the pilot.', html: n => S(n, 'k-b3', `${run('Feasibility', 'Track A · Feasibility · 15 · Track B/C · Practical feasibility · 5', n, 'k-b3')}
 <h2>Feasible today, with the constraints stated.</h2>
 <div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:20px">
  <div class="card"><h3 style="color:var(--b3)">Runs today</h3><ul style="margin:8px 0 0 18px;display:grid;gap:5px;font-size:14.5px"><li>79-scene Sentinel-2 pipeline</li><li>Larper trained and tested</li><li>GPS map from real aircraft data</li><li>Nemotron two-pass briefs</li><li>Live site; ₹0 data cost; one laptop</li></ul></div>
  <div class="card"><h3 style="color:var(--amber)">Assumptions</h3><ul style="margin:8px 0 0 18px;display:grid;gap:5px;font-size:14.5px"><li>Inspection $15k, exposure $300k, 90% catch rate</li><li>Land conversion tracks real progress</li><li>NIC drops mostly mean interference</li><li>B3 satellite cost $3M each</li></ul></div>
  <div class="card"><h3 style="color:var(--red)">Constraints</h3><ul style="margin:8px 0 0 18px;display:grid;gap:5px;font-size:14.5px"><li>Sentinel-2 revisits every 5 days; clouds in monsoon</li><li>One day of ADS-B so far</li><li>Satellites can't confirm ATC or certification</li><li>Airline systems needed for rebooking</li></ul></div>
 </div>
 <table style="margin-top:16px"><thead><tr><th>Risk</th><th>Mitigation</th></tr></thead><tbody>
  <tr><td>AI misreads bare soil (31% recall)</td><td>Decision uses the NDVI baseline too; Nemotron audit + human spot-check</td></tr>
  <tr><td>AI gives a wrong operational answer</td><td>Second Nemotron pass fact-checks; a person approves every action</td></tr>
  <tr><td>Data gaps</td><td>Gaps shown as gaps; "unknown" never reads as "safe"</td></tr>
 </tbody></table>`) });

// ---------- 16 ROADMAP / CLOSE ----------
add({ notes: '4:40–5:00. Roadmap and close. Now a working prototype; three months a shadow-mode pilot with one airline at Delhi; six months more hubs and a continuous GPS feed; twelve months a regulator dashboard and the B3 layer with partners. Thank the judges.', html: n => S(n, 'dark', `
 <div class="run" style="color:#7E8A95"><span>Roadmap</span><span></span><span>FlyWithEase&nbsp;&nbsp;${String(n).padStart(2, '0')} / %TOTAL%</span></div>
 <h2 style="font-size:46px;color:#EEF2F5;max-width:980px">GPS will keep failing.<span class="s" style="color:#9AA6B0">Passengers shouldn't pay for it.</span></h2>
 <div style="position:relative;margin-top:44px">
  <div style="position:absolute;left:0;right:0;top:14px;height:3px;background:linear-gradient(90deg,#4CC38A,#F2A93B 50%,#E46BC5)"></div>
  <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:22px;position:relative">
   ${[['Now', '#4CC38A', 'Working prototype: A6 on real data, Track C map, Nemotron briefs, live site'], ['3 months', '#9BCB6A', 'Shadow pilot with one airline at Delhi; daily GPS-integrity feed'], ['6 months', '#F2A93B', 'More hubs; satellite GNSS data as a second source; passenger recovery flow'], ['12 months', '#E46BC5', 'Regulator dashboard (DGCA, AAI); B3 low-orbit layer with partners']].map(([a, c, b]) => `<div><div style="width:30px;height:30px;border-radius:50%;background:#0F1419;border:4px solid ${c}"></div><div style="font-family:var(--H);font-weight:800;font-size:22px;color:${c};margin-top:14px">${a}</div><p style="color:#C3CCD4;font-size:15.5px;margin-top:6px">${b}</p></div>`).join('')}
  </div>
 </div>
 <div style="margin-top:34px;font-family:var(--H);font-weight:700;font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#7E8A95">How the pilot is judged</div>
 <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:14px;margin-top:10px">
  ${[['Time to confirmed rebooking', 'per diverted passenger, vs today'], ['Diversions to ready airports', 'share sent to built, clean-airspace alternates'], ['Inspections avoided or justified', 'lender decisions backed by orbit'], ['AI answers passing fact-check', 'Nemotron two-pass, then human sign-off']].map(([a, b]) => `<div class="card" style="padding:14px 16px"><div style="font-family:var(--H);font-weight:700;font-size:16px;color:#EEF2F5">${a}</div><p style="color:#9AA6B0;font-size:13.5px;margin-top:4px">${b}</p></div>`).join('')}
 </div>
 <div style="position:absolute;left:72px;right:72px;bottom:46px;display:flex;justify-content:space-between;align-items:end">
  <div><div style="font-family:var(--H);font-weight:800;font-size:24px">${SITE}</div><p style="color:#9AA6B0;font-size:14px;margin-top:4px">Overview · Jewar (A6) · GPS map (C) · Globe (B3) · Tech · AI · Feasibility · Passengers</p></div>
  <div style="color:#7E8A95;font-size:12.5px;text-align:right;max-width:420px">Every number is labelled reported, derived, simulated or assumed. Code: github.com/rehancodes-web/Mack.1</div>
 </div>`) });

// ---------- write ----------
const TOTAL = slides.length;
const render = () => slides.map((s, i) => s.html(i + 1).replace(/%TOTAL%/g, String(TOTAL)));
WEB = false;
const fileSlides = render();
fs.writeFileSync(path.join(OUT, 'notes.json'), JSON.stringify(slides.map(s => s.notes), null, 1));
fileSlides.forEach((h, i) => fs.writeFileSync(path.join(OUT, `${String(i + 1).padStart(2, '0')}.html`), `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}html,body{width:1280px;height:720px;overflow:hidden}</style></head><body>${h}</body></html>`));

// interactive web deck (docs/deck.html): scales 1280x720 slides to the viewport; keyboard, wheel, touch; notes toggle
WEB = true;
const webSlides = render();
const deck = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FlyWithEase Pitch Deck</title><meta name="description" content="FlyWithEase hackathon pitch, structured on the Mach-A-Thon marking scheme.">
<style>${CSS}
html,body{height:100%;margin:0;background:#0b0f13;overflow:hidden}
.stage{position:fixed;inset:0;overflow:hidden}
.deck{position:absolute;left:50%;top:50%;width:1280px;height:720px;transform-origin:center center}
.deck .slide{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity .35s ease}
.deck .slide.on{opacity:1;visibility:visible}
@media (prefers-reduced-motion:reduce){.deck .slide{transition:none}}
.bar{position:fixed;left:0;bottom:0;height:3px;background:#E46BC5;transition:width .3s}
.ctl{position:fixed;right:14px;bottom:12px;display:flex;gap:6px;font:600 13px system-ui;color:#9AA6B0;align-items:center}
.ctl button{background:#1A222B;color:#EEF2F5;border:1px solid #2A3540;border-radius:6px;padding:6px 10px;cursor:pointer;font:inherit}
.ctl button:focus-visible{outline:2px solid #F2A93B}
.notes{position:fixed;left:14px;right:180px;bottom:12px;background:#1A222Bee;color:#EEF2F5;border:1px solid #2A3540;border-radius:8px;padding:10px 12px;font:15px/1.4 system-ui;display:none}
.notes.on{display:block}
</style></head><body>
<main class="stage" aria-roledescription="carousel" aria-label="FlyWithEase pitch deck"><div class="deck" id="deck">${webSlides.map((h, i) => h.replace('class="slide', `class="slide${i ? '' : ' on'}`)).join('')}</div></main>
<div class="bar" id="bar"></div><div class="notes" id="notes" aria-live="polite"></div>
<nav class="ctl" aria-label="Deck controls"><button id="prev" aria-label="Previous slide">‹</button><span id="idx">1 / ${TOTAL}</span><button id="next" aria-label="Next slide">›</button><button id="nb" aria-pressed="false">Notes</button><a href="index.html" style="color:#9AA6B0;margin-left:6px">Site</a></nav>
<script>
(function(){
 const NOTES=${JSON.stringify(slides.map(s => s.notes))};
 const deck=document.getElementById('deck'),S=[...deck.querySelectorAll('.slide')],bar=document.getElementById('bar'),idx=document.getElementById('idx'),nt=document.getElementById('notes'),nb=document.getElementById('nb');
 let i=Math.max(0,Math.min(S.length-1,(parseInt(location.hash.slice(1))||1)-1));
 function fit(){const s=Math.min(innerWidth/1280,(innerHeight-8)/720);deck.style.transform='translate(-50%,-50%) scale('+s+')';}
 function go(n){S[i].classList.remove('on');i=Math.max(0,Math.min(S.length-1,n));S[i].classList.add('on');idx.textContent=(i+1)+' / '+S.length;bar.style.width=((i+1)/S.length*100)+'%';nt.textContent=NOTES[i];history.replaceState(null,'','#'+(i+1));}
 addEventListener('resize',fit);fit();go(i);
 addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(i+1)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(i-1)}else if(e.key==='Home')go(0);else if(e.key==='End')go(S.length-1);else if(e.key==='n'){nb.click()}});
 let lock=0;addEventListener('wheel',e=>{if(Date.now()-lock<600)return;lock=Date.now();go(i+(e.deltaY>0?1:-1));},{passive:true});
 let x0=null;addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});addEventListener('touchend',e=>{if(x0===null)return;const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>40)go(i+(d<0?1:-1));x0=null;});
 document.getElementById('prev').onclick=()=>go(i-1);document.getElementById('next').onclick=()=>go(i+1);
 nb.onclick=()=>{const on=nt.classList.toggle('on');nb.setAttribute('aria-pressed',on);};
})();
</script></body></html>`;
fs.mkdirSync(path.join(ROOT, 'docs', 'shots'), { recursive: true });
for (const k of ['shotA6', 'shotC', 'shotHome']) fs.copyFileSync(path.join(ROOT, IMG[k][0]), path.join(ROOT, 'docs', IMG[k][1]));
fs.writeFileSync(path.join(ROOT, 'docs', 'deck.html'), deck);
console.log(`wrote ${TOTAL} slides (pitch/slides/html) + docs/deck.html`);
