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
:root{--paper:#F7F6F3;--card:#FFFFFF;--line:#E4E1DA;--ink:#111318;--sub:#5D6270;--faint:#9A9EA8;--night:#0F1117;--night2:#1E2230;--acc:#4338CA;--tint:#EEF0FB;--mint:#8EE9D9;
 --a6:var(--acc);--c:var(--acc);--b3:var(--acc);--amber:var(--acc);--red:var(--acc);--H:'Bahnschrift','Archivo',sans-serif;--B:'Segoe UI','Source Sans 3',sans-serif;--N:'Bahnschrift','B612',sans-serif;--G:Georgia,'Times New Roman',serif}
*{box-sizing:border-box;margin:0;padding:0}
.slide{position:relative;width:1280px;height:720px;overflow:hidden;background:var(--paper);color:var(--ink);font-family:var(--B);padding:86px 72px 54px}
.slide.dark{background:var(--night);color:#EEF2F5}
.run{position:absolute;left:72px;right:72px;top:30px;display:flex;justify-content:space-between;align-items:center;font-family:var(--B);font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
.run .rub{letter-spacing:.02em;text-transform:none;font-weight:600;color:var(--sub);background:var(--card);border:1px solid var(--line);border-radius:20px;padding:4px 12px}
.dark .run .rub{background:var(--night2);border-color:#2A2F3D;color:#A9B4BE}
.run .sec{color:var(--acc)}.dark .run .sec{color:var(--mint)}
h1,h2{font-family:var(--H);font-weight:600}h3{font-family:var(--G);font-weight:700}
.slide:not(.dark){display:flex;flex-direction:column;justify-content:center;padding:92px 72px 60px}
h2{font-size:40px;line-height:1.1;font-weight:600;letter-spacing:-.01em;max-width:1120px}
h2 .s{display:block;color:var(--sub);font-weight:400}
h3{font-size:20px;font-weight:700;line-height:1.2}
p,li{font-size:17px;line-height:1.42}
.small{font-size:14.5px;color:var(--sub);line-height:1.4}
.src{position:absolute;left:72px;right:72px;bottom:24px;font-size:11.5px;color:var(--faint)}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px}
.dark .card{background:var(--night2);border-color:#2A2F3D}
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
.so{margin-top:16px;background:var(--tint);border:1px solid #D9DCF5;border-left:5px solid var(--acc);border-radius:10px;padding:10px 16px;font-size:15.5px;line-height:1.4;color:var(--ink)}
.so b{font-family:var(--H);font-weight:600;color:var(--acc)}
.case{display:inline-block;font-family:var(--H);font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;background:var(--ink);color:#fff;border-radius:6px;padding:3px 8px;margin-bottom:10px;align-self:flex-start}
.tl{display:grid;gap:0;border-left:3px solid var(--k,var(--ink));margin-left:6px}
.tl>div{position:relative;padding:0 0 12px 20px}
.tl>div::before{content:'';position:absolute;left:-8.5px;top:4px;width:14px;height:14px;border-radius:50%;background:var(--paper);border:3px solid var(--k,var(--ink))}
.tl b{font-family:var(--H)}
.live{position:absolute;top:54px;right:72px;width:250px;height:26px;display:flex;align-items:center;justify-content:center;gap:4px;font-family:var(--H);font-weight:700;font-size:12.5px;color:var(--k,var(--ink));background:var(--card);border:1.5px solid var(--k,var(--ink));border-radius:20px;text-decoration:none}
.slide.abs{display:block}
.bars{display:grid;gap:6px}.bars>div{display:grid;grid-template-columns:var(--lw,170px) 1fr 44px;gap:10px;align-items:center;font-size:13.5px}
.bars i{display:block;height:14px;border-radius:3px;background:#B9BEEA}.bars b{font-family:var(--N);font-size:13px;text-align:right}
ol.steps{list-style:none;counter-reset:s;display:grid;gap:12px}
ol.steps li{counter-increment:s;position:relative;padding-left:38px}
.slide.top{justify-content:flex-start;padding-top:96px}.top h2{font-size:35px}.top h2 .s{font-size:24px}
ol.steps li::before{content:counter(s);position:absolute;left:0;top:0;width:26px;height:26px;border-radius:50%;background:var(--k,var(--ink));color:#fff;font-family:var(--N);font-weight:700;font-size:13px;display:grid;place-items:center}
`;
const slides = [];
const add = (o) => slides.push(o);
// HOT: clickable areas per slide (1280x720 px), turned into pptx hyperlinks by pack.cjs and real links in the web deck
const HOT = {};
const hot = (n, o) => { (HOT[n] ||= []).push(o); };
const MAPN = () => pos(23); // slide number of the marking map
const run = (sec, rub, n, k = '') => { hot(n, { x: 440, y: 22, w: 400, h: 32, slide: MAPN(), tip: 'Back to the marking map' }); return `<div class="run ${k}"><span class="sec">${sec}</span><a class="rub" href="#${MAPN()}" data-go="${MAPN()}" title="Back to the marking map" style="text-decoration:none">${rub}</a><span>FlyWithEase&nbsp;&nbsp;${String(n).padStart(2, '0')} / %TOTAL%</span></div>`; };
const PAGE = 'https://' + 'rehancodes-web.github.io/Mack.1/';
const live = (n, page, label) => { hot(n, { x: 1280 - 72 - 250, y: 54, w: 250, h: 26, url: PAGE + page, tip: label }); return `<a class="live" href="${PAGE + page}" target="_blank" rel="noopener">${label} ↗</a>`; };
const S = (n, cls, inner) => `<section class="slide ${cls}" aria-label="Slide ${n}">${inner}</section>`;

// ---------- 1 COVER ----------
add({ notes: '0:00–0:15. GPS jamming hits Indian airspace daily. FlyWithEase finds where GPS is failing, confirms from orbit which airport can take the diverted flights, hardens positioning and protects passengers. Primary Track A6, additional Track C, with B3 as the long-term layer.', html: n => S(n, 'dark', `
 <img src="${img('after')}" alt="" style="position:absolute;right:0;top:0;width:640px;height:720px;object-fit:cover;opacity:.85">
 <div style="position:absolute;right:0;top:0;width:640px;height:720px;background:linear-gradient(90deg,#0F1117 0%,rgba(15,20,25,.35) 40%,rgba(15,20,25,.1))"></div>
 <div style="position:absolute;right:250px;top:46px;font-family:var(--N);font-weight:700;font-size:15px;color:#8EE9D9;border:2px solid #8EE9D9;padding:5px 14px;border-radius:5px;background:#0F1117">GPS PRIMARY LOST</div>
 <div class="run" style="color:#7E8A95"><span>Mach-A-Thon Aeromania '26 · Orbit to Economy: AI in Space</span><span></span><span>with Boeing</span></div>
 <div style="position:absolute;left:72px;top:150px;width:600px">
  <h1 style="font-size:84px;font-weight:800;letter-spacing:-.03em;line-height:.95;font-variation-settings:'wdth' 110">FlyWithEase</h1>
  <p style="font-size:26px;line-height:1.3;margin-top:22px;color:#C9D3DB;font-family:var(--H);font-weight:600">When GPS fails near an airport, flights divert. We make sure there is somewhere ready to go, and that no passenger is stranded.</p>
  <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:12px;margin-top:40px">
   ${[['Track A6', 'Infrastructure from orbit', '#8EE9D9', 'Primary · 65 marks'], ['Track C', 'GPS malfunction detection', '#8EE9D9', 'Additional · 25 marks'], ['Track B3', 'Harder-to-jam positioning', '#8EE9D9', 'Long-term layer']].map(([a, b, c, d]) => `<div style="border-top:3px solid ${c};padding-top:10px"><div style="font-family:var(--H);font-weight:800;font-size:18px;color:${c}">${a}</div><div style="font-size:14.5px;margin-top:4px">${b}</div><div style="font-size:12px;color:#7E8A95;margin-top:6px">${d}</div></div>`).join('')}
  </div>
 </div>
 <div style="position:absolute;left:72px;bottom:34px;font-size:13px;color:#7E8A95">Live demo: ${SITE}</div>`) });

// ---------- 2 PROBLEM ----------
add({ so: "GPS failure is now an everyday operational problem in India, and nothing today links the warning to the diversion to the passenger.", notes: '0:15–0:35. The problem, with sources. GPS interference is routine over India; most incidents mean total loss of GPS. Delhi was spoofed in 2025. Today the warning, the diversion and the passenger recovery are disconnected, so everyone loses.', html: n => S(n, 'k-am', `${run('The problem', 'Track A · Problem understanding & economic impact · 20', n)}
 <h2>GPS fails over India every day.<span class="s">The flights divert. The passengers pay.</span></h2>
 <div class="grid" style="grid-template-columns:repeat(4,1fr);margin-top:26px">
  ${[['2,354', 'GPS interference incidents reported to Parliament, Nov 2023 – Dec 2025', 'var(--amber)'], ['623', 'more in just Jan–Feb 2026: the rate is rising', 'var(--red)'], ['71%', 'of India\'s 2025 incidents meant total loss of GPS on board', 'var(--a6)'], ['+500%', 'GPS spoofing reports, 2024 vs 2023 (IATA)', 'var(--c)']].map(([a, b, c]) => `<div class="card"><div class="num" style="font-size:44px;color:${c}">${a}</div><p class="small" style="margin-top:10px">${b}</p></div>`).join('')}
 </div>
 <div class="black" style="margin-top:20px;display:grid;grid-template-columns:1fr 1.6fr;gap:26px;align-items:center">
  <div><div style="font-family:var(--H);font-weight:800;font-size:24px">Delhi, 2025</div><p style="color:#B8C2CB;margin-top:6px;font-size:15px">Approaches to IGI Runway 10 were spoofed. Crews switched to contingency procedures; DGCA introduced real-time spoofing reports.</p></div>
  <ul style="list-style:none;display:grid;gap:9px">
   ${['Interference monitors know where GPS fails, but stop at the map.', 'Airline ops pick a diversion airport without knowing whether it is built, ready, or in clean airspace.', 'Passengers get "15 more minutes", missed connections and wrong-city hotels, because recovery starts after the fact.'].map(t => `<li style="font-size:15.5px;color:#E6ECF0"><span class="dot" style="background:#8EE9D9"></span>${t}</li>`).join('')}
  </ul>
 </div>
 <div class="src">Sources: Lok Sabha answer, 12 Mar 2026; ICAO Asia-Pacific paper, Jan 2026 (impact shares); IATA; Digital Sansad, 1 Dec 2025. All reported.</div>`) });

// ---------- 2b BASICS ----------
add({ so: "These are the only terms you need to follow the rest of the deck.", notes: 'Optional in the 5-minute talk (skip or 10 s). Written for judges reading the deck: the eight terms used on every later slide, each in one plain sentence.', html: n => S(n, 'k-am', `${run('The basics', 'Presentation · Clarity of explanation · 2', n)}
 <h2>The basics in one minute.<span class="s">Eight terms, each used later in the deck.</span></h2>
 <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:12px;margin-top:22px">
  ${[['GPS / GNSS', 'Satellites 20,200 km up send timing signals. By the time they reach a plane they are weaker than background radio noise, which makes them easy to drown out.', 'var(--ink)'],
     ['Jamming', 'A transmitter on the ground drowns the signal in noise. The aircraft simply loses GPS. 71% of India\'s 2025 incidents were total loss.', 'var(--amber)'],
     ['Spoofing', 'A transmitter sends fake GPS signals, so the aircraft thinks it is somewhere else. This hit approaches to Delhi IGI in 2025.', 'var(--red)'],
     ['What happens next', 'Crews switch to backup procedures, hold, or divert to another airport. On the ground receivers may need a reset before the next flight.', 'var(--sub)'],
     ['NIC (integrity)', 'Every aircraft broadcasts how much it trusts its own position. When many aircraft in one area report low trust, GPS there is being interfered with.', 'var(--c)'],
     ['Sentinel-2', 'A free European satellite pair that photographs every place on Earth every ~5 days at 10 m per pixel, in 13 colour bands.', 'var(--a6)'],
     ['NDVI + Random Forest', 'NDVI measures how green a pixel is; concrete and bare soil score low. A Random Forest is a vote of 20 decision trees. Together they form Larper, our classifier.', 'var(--a6)'],
     ['Nemotron', 'NVIDIA\'s open reasoning model. We give it our measurements; it drafts a decision, a second pass fact-checks it, and a person signs it off.', 'var(--b3)']]
    .map(([a, b, c]) => `<div class="card" style="border-top:4px solid ${c};padding:14px 16px"><h3 style="font-size:17.5px;color:${c}">${a}</h3><p style="font-size:14.5px;line-height:1.38;margin-top:6px;color:var(--sub)">${b}</p></div>`).join('')}
 </div>
 <div class="src">GPS orbit and signal: US GPS.gov; incident shares: ICAO Asia-Pacific paper, Jan 2026; Sentinel-2: ESA Copernicus.</div>`) });

// ---------- 3 USERS & VALUE ----------
add({ so: "Each of these four users already pays for GPS failures; FlyWithEase gives each one a decision backed by satellite evidence.", notes: '0:35–0:55. Intended users and economic value. Four users, each with a decision and a cost. Airlines pay for diversions, lenders for infrastructure risk, regulators for national resilience.', html: n => S(n, 'k-am', `${run('Who it serves', 'Track A · Problem understanding & economic impact · 20', n)}
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

// ---------- 3b HOW IT WORKS ----------
add({ so: "Each step hands a concrete output to the next: a warning becomes a diversion choice, which becomes a rebooking before the plane lands.", notes: 'Optional in the 5-minute talk (15 s). The whole system on one slide: four steps, each with its input, what we compute, what comes out and who acts on it.', html: n => S(n, 'k-c', `${run('How it works', 'Track A · Technical depth, AI & satellite data · 20', n, 'k-c')}
 <h2>How FlyWithEase works, step by step.</h2>
 <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:12px;margin-top:20px">
  ${[['1 · Detect', 'Track C', 'var(--c)', 'Aircraft integrity (NIC) from ADS-B, ' + fmt(gsum.reports) + ' reports', 'Share of degraded aircraft in each 1° grid cell; rate low / medium / high', 'Map of where GPS is failing; status of each airport region', 'Airline ops, DGCA'],
     ['2 · Absorb', 'Track A6', 'var(--a6)', '79 Sentinel-2 scenes + WorldCover labels + airport boundary', 'Larper classifies each 10 m pixel; % of site built or cleared per month', 'Is the diversion airport physically there? Claim vs orbit gap', 'Airline ops, lenders'],
     ['3 · Harden', 'Track B3', 'var(--b3)', 'Orbital geometry, jammer power, link budget', 'Signal strength, jammer reach and spoofing detection with a low-orbit layer', 'Design numbers for a harder-to-jam service (simulated)', 'Regulators, ISRO / AAI'],
     ['4 · Recover', 'Passengers', 'var(--amber)', 'Outputs of steps 1–3 + flight and booking status', 'Nemotron drafts the decision; a second pass fact-checks; a person signs off', 'Diversion choice, rebooking, hotel and bag plan before landing', 'Passenger desk, airline']]
    .map(([t, tr, c, i, p, o, w]) => `<div class="card" style="border-top:4px solid ${c};padding:14px 16px;display:grid;gap:8px;align-content:start">
      <div><h3 style="color:${c}">${t}</h3><div style="font-size:12.5px;color:var(--faint);font-family:var(--H);font-weight:700">${tr}</div></div>
      ${[['In', i], ['We compute', p], ['Out', o], ['Who acts', w]].map(([k, v]) => `<div><div style="font-family:var(--H);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)">${k}</div><div style="font-size:14px;line-height:1.35">${v}</div></div>`).join('')}
     </div>`).join('')}
 </div>
 <div style="margin-top:14px;display:flex;align-items:center;gap:10px;font-family:var(--H);font-weight:700;font-size:14px;color:var(--sub)">
  <span style="color:var(--c)">GPS warning</span><span>→</span><span style="color:var(--a6)">ready diversion airport</span><span>→</span><span style="color:var(--b3)">harder-to-jam signal (long term)</span><span>→</span><span style="color:var(--amber)">passenger rebooked before landing</span>
 </div>`) });

// ---------- 4 A6 OBJECTIVE ----------
add({ so: "If Delhi's GPS fails, Jewar is the backup, so we must know from orbit whether it is really built, not just announced.", notes: '0:55–1:10. Track A objective 6: monitor construction and asset progress from orbit. We chose Noida International Airport at Jewar: 70 km from Delhi, the obvious diversion airport, and a project whose opening was promised three times.', html: n => S(n, 'k-a6', `${run('Track A6 · objective', 'Track A · Working demo & objective completion · 10', n, 'k-a6')}${live(n, 'a6.html', "Open the Jewar monitor")}
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
add({ so: "Every input is free, public and traceable, so anyone (judges or customers) can reproduce every number we show.", notes: '1:10–1:25. Technical depth: appropriate satellite data. Seven sources, all free. Sentinel-2 is the measurement; WorldCover trains the AI; Wayback is for the eye; ADS-B powers Track C; CelesTrak the globe. We fixed real data problems along the way.', html: n => S(n, 'k-c', `${run('Technology · data', 'Track A · Technical depth, AI & satellite data · 20', n, 'k-c')}${live(n, 'a6.html', "Open the Jewar monitor")}
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
add({ so: "Larper turns raw satellite pixels into one answer: how much of the airport site is built or cleared, month by month.", notes: '1:25–1:45. AI approach and implementation. Larper is a Random Forest labelling every 10 m pixel into built, bare, vegetation or water. Trained on WorldCover around the airport, tested on a separate block of land. Five-step pipeline, all in Node.js.', html: n => S(n, 'k-a6', `${run('Technology · AI', 'Track A · Technical depth, AI & satellite data · 20', n, 'k-a6')}
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
add({ so: "When the builder claimed 80%, orbit showed about half the land converted: an independent check lenders and airlines do not have today.", notes: '1:45–2:15. The result. Both the AI and the baseline agree: nothing happens until mid-2023, peak in spring 2025. In January 2025 the builder claimed 80%; orbit saw 41 to 51 percent of the land converted. That gap is exactly when a lender should look.', html: n => S(n, 'k-a6', `${run('Track A6 · result', 'Track A · Working demo & objective completion · 10', n, 'k-a6')}
 <h2>The builder said 80%. Orbit saw half.</h2>
 <div style="display:grid;grid-template-columns:680px 1fr;gap:26px;margin-top:18px">
  <div class="card" style="padding:16px 18px">
   <svg width="640" height="320" viewBox="-44 -14 690 330">
    ${[0, .25, .5, .75, 1].map(v => `<line x1="0" x2="${CW}" y1="${Yv(v)}" y2="${Yv(v)}" stroke="#ECE9E2"/><text x="-8" y="${Yv(v) + 4}" font-size="12" fill="#8B909A" text-anchor="end" font-family="B612">${v * 100}%</text>`).join('')}
    ${[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => `<text x="${X(y + '-01')}" y="${CH + 22}" font-size="12" fill="#8B909A" font-family="B612">${y}</text>`).join('')}
    <rect x="${X('2023-06')}" y="0" width="${X('2025-04') - X('2023-06')}" height="${CH}" fill="#4338CA" opacity=".06"/>
    <text x="${X('2023-06') + 6}" y="16" font-size="12" fill="#4338CA" font-family="B612">construction visible</text>
    <path d="${ln('baseline_cleared_12m')}" fill="none" stroke="#9A9EA8" stroke-width="2.5"/>
    <path d="${ln('converted_12m')}" fill="none" stroke="#4338CA" stroke-width="3.5"/>
    <line x1="${X('2025-01')}" x2="${X('2025-01')}" y1="${Yv(.8)}" y2="${Yv(Number(jan.converted_12m))}" stroke="#4338CA" stroke-width="2" stroke-dasharray="4 4"/>
    <circle cx="${X('2025-01')}" cy="${Yv(.8)}" r="8" fill="#fff" stroke="#4338CA" stroke-width="3"/>
    <text x="${X('2025-01') - 14}" y="${Yv(.8) + 5}" font-size="13" fill="#4338CA" text-anchor="end" font-family="B612" font-weight="700">80% claimed, Jan 2025</text>
   </svg>
   <div style="display:flex;gap:20px;font-size:13px;color:var(--sub)"><span><span class="dot" style="background:#4338CA"></span>Larper AI: converted land</span><span><span class="dot" style="background:#9A9EA8"></span>NDVI baseline: cleared all year</span></div>
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
add({ so: "The result does not hinge on one model: two methods agree, the AI is tested on land it never saw, and we say where it is weak.", notes: '2:15–2:35. Feasibility, accuracy and applicability. We report every class, including the weak one. Two independent methods agree on the timeline. Nemotron audits Larper maps against photos, and a human blind spot-check page exists. Limits are stated.', html: n => S(n, 'k-a6', `${run('Accuracy & reliability', 'Track A · Feasibility, accuracy & applicability · 15', n, 'k-a6')}
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

// ---------- 9 CASE 1: LENDER ----------
add({ so: "A free satellite check told the lender to inspect before paying: about $86k of expected loss avoided on one decision (assumed inputs).", notes: '2:35–2:50. Case 1, applicability. A lender must release or hold the next construction tranche for Jewar. The builder says 80%; orbit says about half. With a 29-point gap, inspecting first is clearly worth it, and the decision flips at a known break-even probability.', html: n => S(n, 'k-a6', `${run('Case 1 · Jewar lender', 'Track A · Feasibility, accuracy & applicability · 15', n, 'k-a6')}${live(n, 'a6.html', "Try the decision sliders")}
 <span class="case">Case 1 · real project, assumed money</span>
 <h2>Release the next tranche, or inspect first?</h2>
 <div style="display:grid;grid-template-columns:.75fr 1.7fr;gap:24px;margin-top:18px;align-items:start">
  <div class="tl k-a6">
   <div><b>Nov 2021</b><p class="small">Foundation stone laid</p></div>
   <div><b>Sep 2024</b><p class="small">First opening target missed</p></div>
   <div><b>Jan 2025</b><p class="small">Builder reports <b>80% complete</b></p></div>
   <div><b>Jan 2025, orbit</b><p class="small">Sentinel-2 shows <b style="color:var(--a6)">${dec.satellite_observed_pct}%</b> converted (baseline), 41% (Larper)</p></div>
   <div style="padding-bottom:0"><b>Decision</b><p class="small">Gap of ${dec.gap_pts} points → <b style="color:var(--a6)">inspect</b></p></div>
  </div>
  <div>
 <table>
  <thead><tr><th style="width:42%">Evidence</th><th>P(report optimistic)</th><th>Cost if release</th><th>Cost if inspect</th><th>Decision</th></tr></thead>
  <tbody>${dec.scenarios.map(s => `<tr${s.name.startsWith('Satellite') ? ' style="background:#EEF0FB"' : ''}><td>${s.name.startsWith('Satellite') ? '<b>' + s.name + '</b>' : s.name}</td><td>${s.p.toFixed(2)}</td><td>$${fmt(Math.round(s.release))}</td><td>$${fmt(Math.round(s.inspect))}</td><td><b style="color:${s.action === 'inspect' ? 'var(--a6)' : 'var(--b3)'}">${s.action.toUpperCase()}</b></td></tr>`).join('')}</tbody>
 </table>
 <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px">
  <div class="card" style="padding:12px 16px"><div class="num" style="font-size:26px">${dec.scenarios[0].break_even_p.toFixed(3)}</div><p class="small">break-even: inspect whenever the chance of an optimistic report is above this</p></div>
  <div class="card" style="padding:12px 16px"><div class="num" style="font-size:26px;color:var(--a6)">$86,250</div><p class="small">expected cost avoided: $112,500 if released vs $26,250 if inspected</p></div>
  <div class="card" style="padding:12px 16px"><div class="num" style="font-size:26px;color:var(--b3)">$0</div><p class="small">data cost of the satellite check; the inspection itself is $15k</p></div>
 </div>
 ${WEB ? `<div class="calc" style="margin-top:10px;display:grid;grid-template-columns:auto 1fr auto 1fr;gap:6px 14px;align-items:center;background:#EEF0FB;border:1px solid #D9DCF5;border-radius:12px;padding:8px 14px;font-size:13.5px">
  <label for="cP"><b>Try it:</b> chance report is optimistic</label><input id="cP" type="range" min="0" max="0.6" step="0.01" value="0.38">
  <label for="cI">inspection cost</label><input id="cI" type="range" min="5000" max="60000" step="1000" value="15000">
  <div id="cOut" style="grid-column:1/-1;font-family:var(--H);font-weight:700" aria-live="polite"></div></div>` : ''}
  </div>
 </div>
 <div class="src">Dates reported (press, AAI). Orbit % derived from Sentinel-2. Money assumed for illustration: $300k exposure, $15k inspection, 90% of optimistic reports caught. Sliders on the live Jewar page.</div>`) });

// ---------- 10 DEMO ----------
add({ so: "Judges can try everything themselves on the live site; nothing on these slides is a mock-up.", notes: '2:50–3:05. Working demo: everything shown is live on the site. If time allows, open the Jewar page and drag the before/after slider.', html: n => S(n, '', `${run('Working demo', 'Track A · Working demo & objective completion · 10', n)}${live(n, 'index.html', "Open the live site")}
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
add({ so: "From real aircraft data we can show where GPS is failing, and confirm Jewar sits in clean airspace before flights are sent there.", notes: '3:05–3:30. Additional track C, GNSS resilience. Objectives covered: detect jamming and spoofing, protect critical infrastructure, protective use only. Real aircraft data, rated per cell, linked directly to the A6 diversion decision.', html: n => S(n, 'k-c', `${run('Track C · additional', 'Track B/C · Technical depth & objective completion · 10', n, 'k-c')}${live(n, 'c.html', "Open the GPS map")}
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

// ---------- CASES 2-5 ----------
const CASE = id => ND.cases.find(c => c.id === id);
const dl = CASE('delhi'), nw = CASE('northwest'), ta = CASE('tartu');
const bcell = c => NB.data.track_c_cells_around_delhi_and_jewar.find(x => x.cell === c);

add({ so: "FlyWithEase would not have sent flights to Jewar first: the evidence says switch runways at Delhi, and keep Jewar as a confirmed fallback.", notes: 'Optional in the 5-minute talk; for judges reading the deck. Case 2 runs the full pipeline on the reported Delhi spoofing pattern: Track C, Track A6, Nemotron brief, fact-check, then a human decision. The AI first said divert to Jewar; the review corrected it because ILS was available on other runways.', html: n => S(n, 'k-c', `${run('Case 2 · Delhi IGI spoofing', 'Track C · Technical implementation & objectives · 10', n, 'k-c')}${live(n, 'passengers.html', "Read Nemotron's decisions")}
 <span class="case">Case 2 · reported event, 2025</span>
 <h2>Delhi IGI: GPS approaches to Runway 10 were spoofed.</h2>
 <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:10px;margin-top:18px">
  ${[['1 · Reported', 'var(--ink)', 'RNP (GPS) approaches to Runway 10 spoofed; crews used contingency procedures; ILS stayed available on other runways.'],
     ['2 · Track C', 'var(--c)', `Cells north of Delhi: ${pc(bcell('29N 77E').degraded_share, 1)}–${pc(bcell('29N 78E').degraded_share, 1)} degraded (medium). Jewar region: ${fmt(NB.data.track_c_jewar_region.aircraft_seen)} aircraft, 0–1.5%, normal.`],
     ['3 · Track A6', 'var(--a6)', 'Jewar physically built (conversion plateaued Dec 2024). Verdict: <b>conditional</b>, since orbit cannot see certification or ATC.'],
     ['4 · Nemotron', 'var(--b3)', `Drafted actions for airline ops, ATC, passenger desk and lender. First suggestion: divert to Jewar.`],
     ['5 · Fact-check', 'var(--amber)', `Second pass: <b>${NB.fact_check.verdict.replace(/_/g, ' ')}</b>, ${NB.fact_check.issues.length} issues, e.g. GPS-denied procedures claimed that are not in our data.`]]
    .map(([t, c, b]) => `<div class="card" style="border-top:4px solid ${c};padding:12px 14px"><h3 style="font-size:16px;color:${c}">${t}</h3><p style="font-size:13.5px;line-height:1.36;margin-top:6px">${b}</p></div>`).join('')}
 </div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
  <div class="card"><h3 style="color:var(--sub)">Today</h3><ul style="margin-top:6px;padding-left:18px;display:grid;gap:3px"><li style="font-size:15px">Crews find out on the approach; ops learn from crew reports</li><li style="font-size:15px">Diversion airport picked without knowing it is built or in clean airspace</li><li style="font-size:15px">Passengers told after landing</li></ul></div>
  <div class="black"><h3 style="color:#8EE9D9">Human final decision</h3><p style="margin-top:6px;font-size:16px;color:#E6ECF0">${dl.human_review.final}</p><p style="font-size:13.5px;color:#9AA8B4;margin-top:6px">Nemotron said "divert to Jewar"; the reviewer <b>corrected</b> it: ${dl.human_review.note.split('. ')[0]}.</p></div>
 </div>
 <div class="src">Event: Lok Sabha answer, Dec 2025 (reported). Track C: one day of ADS-B integrity data, 1 Nov 2026 (derived). Nemotron output: decisions/nemotron_brief.json and nemotron_decisions.json.</div>`) });

add({ so: "Nemotron weighed three options and picked a sound one; the human check removed two claims our data cannot support before anyone acted on it.", notes: 'Optional in the 5-minute talk; for judges reading the deck. Case 3: persistent jamming along the north-western border. Shows the options Nemotron weighed with pros and cons, its decision, and the human correction (CAT III at Jewar not in our data; B3 is future).', html: n => S(n, 'k-c', `${run('Case 3 · Border jamming', 'Track C · Technical implementation & objectives · 10', n, 'k-c')}${live(n, 'c.html', "Open the GPS map")}
 <span class="case">Case 3 · reported pattern, 2025</span>
 <h2>Amritsar and Jammu: aircraft lose GPS near the border.</h2>
 <div style="display:grid;grid-template-columns:.85fr 1.6fr;gap:22px;margin-top:16px;align-items:start">
  <div>
   <div style="border-radius:12px;overflow:hidden;height:250px;border:1px solid var(--line)"><img src="${img('gnss')}" alt="Track C map of GPS interference cells" style="width:100%;height:100%;object-fit:cover;object-position:28% 18%"></div>
   <p class="small" style="margin-top:8px">276 incidents in north-western India in 2025 (reported). Track C shows a band of high-interference cells along the border (derived).</p>
  </div>
  <div>
   <table>
    <thead><tr><th style="width:30%">Option Nemotron weighed</th><th>For</th><th>Against</th></tr></thead>
    <tbody>${nw.nemotron.options.map(o => `<tr><td><b>${o.action}</b></td><td>${o.pro}</td><td>${o.con}</td></tr>`).join('')}</tbody>
   </table>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
    <div class="card" style="padding:12px 16px"><h3 style="font-size:16px;color:var(--b3)">Nemotron decided</h3><p style="font-size:14px;margin-top:4px">Divert to Jewar, outside the jamming band; warn every aircraft in the sector.</p></div>
    <div class="black" style="padding:12px 16px"><h3 style="font-size:16px;color:#8EE9D9">Human final</h3><p style="font-size:14px;margin-top:4px;color:#E6ECF0">${nw.human_review.final}</p></div>
   </div>
   <p class="small" style="margin-top:8px">Corrected: "CAT III at Jewar" is not in our data, and B3 is a future system, not available today.</p>
  </div>
 </div>
 <div class="src">Incident count: Lok Sabha 2026 (reported). Map: ADS-B NIC, 1 Nov 2026 (derived). Track C is protective: it warns, never locates or targets a jammer.</div>`) });

add({ so: "The diversion itself is unavoidable; the misery around it is not. Starting recovery at the moment of the GPS warning saves the passenger hours and the airline money.", notes: 'Optional in the 5-minute talk; for judges reading the deck. Case 4 is illustrative, based on our passenger-experience research: one passenger on a Delhi arrival that diverts. Today vs with FlyWithEase, stage by stage. Passenger recovery is specified, not yet built.', html: n => S(n, 'k-am', `${run('Case 4 · One passenger', 'Track A · Problem understanding & economic impact · 20', n)}${live(n, 'passengers.html', "Open the passenger page")}
 <span class="case">Case 4 · illustrative journey</span>
 <h2>Priya's evening flight to Delhi diverts.<span class="s">The same night, with and without FlyWithEase.</span></h2>
 <table style="margin-top:16px">
  <thead><tr><th style="width:17%">Stage</th><th style="width:41%">Today</th><th>With FlyWithEase</th></tr></thead>
  <tbody>
   <tr><td><b>Holding</b></td><td>"15 more minutes", repeated for 45 minutes</td><td>Ops see the GPS warning (Track C) and start planning before the hold</td></tr>
   <tr><td><b>Diversion</b></td><td>Lands wherever there is space, sometimes another state</td><td>Diverts to a confirmed-built airport in clean airspace (Track A6, conditional)</td></tr>
   <tr><td><b>On the ground</b></td><td>Waits on board for news; no one knows the next step</td><td>Honest status and options pushed to her phone on landing</td></tr>
   <tr><td><b>Connection</b></td><td>Misses it; queues at a transfer desk</td><td>Rebooked while still in the air, seat confirmed</td></tr>
   <tr><td><b>Night and bag</b></td><td>Hotel in the wrong city; bag goes to Delhi without her</td><td>Hotel and bag routed to where she actually is</td></tr>
  </tbody>
 </table>
 <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px">
  <div class="card" style="padding:10px 16px"><div class="num" style="font-size:24px;color:var(--amber)">≈ $4,430</div><p class="small">cost of a 45-minute hold at $98.41 per block minute</p></div>
  <div class="card" style="padding:10px 16px"><div class="num" style="font-size:24px;color:var(--red)">up to €77,200</div><p class="small">cost of one diversion, before passenger care</p></div>
  <div class="card" style="padding:10px 16px"><div class="num" style="font-size:24px;color:var(--sub)">Specified</div><p class="small">passenger recovery is designed, not yet built</p></div>
 </div>
 <div class="src">Priya is illustrative, based on research/passenger-experience.md. Costs reported: Airlines for America 2025; EUROCONTROL (2022 prices). The $4,430 figure is derived.</div>`) });

add({ so: "This already happened in Europe: a GPS-only approach made a whole route stop for a month. FlyWithEase would have warned earlier and moved passengers before departure.", notes: 'Optional in the 5-minute talk; for judges reading the deck. Case 5: Tartu, Estonia, 2024, a real route suspension caused by GPS interference. Nemotron reached the same decision the airline did; the human review adds starting the transfer before departure.', html: n => S(n, 'k-c', `${run('Case 5 · Tartu, Estonia', 'Track C · Innovation & originality · 10', n, 'k-c')}${live(n, 'passengers.html', "Read Nemotron's decisions")}
 <span class="case">Case 5 · reported event, 2024</span>
 <h2>Tartu: GPS interference stopped a route for a month.</h2>
 <div style="display:grid;grid-template-columns:.9fr 1.5fr;gap:24px;margin-top:18px;align-items:start">
  <div class="tl k-c">
   <div><b>Spring 2024</b><p class="small">GPS interference over the Baltic intensifies</p></div>
   <div><b>29 Apr 2024</b><p class="small">Finnair suspends Helsinki–Tartu: the GPS-based approach is unusable</p></div>
   <div><b>Meanwhile</b><p class="small">Tallinn Airport is unaffected; passengers rerouted via Tallinn by road</p></div>
   <div style="padding-bottom:0"><b>31 May 2024</b><p class="small">Suspension ends; Helsinki–Tartu flights resume</p></div>
  </div>
  <div class="grid" style="gap:12px">
   <div class="card" style="padding:12px 16px"><h3 style="font-size:16px;color:var(--b3)">Nemotron, given only the facts</h3><p style="font-size:14.5px;margin-top:4px">${ta.nemotron.decision}</p></div>
   <div class="black" style="padding:12px 16px"><h3 style="font-size:16px;color:#8EE9D9">Human final (verdict: ${ta.human_review.verdict})</h3><p style="font-size:14.5px;margin-top:4px;color:#E6ECF0">${ta.human_review.final}</p></div>
   <div class="card" style="padding:12px 16px"><h3 style="font-size:16px">What FlyWithEase would have added</h3>
    <ul style="margin-top:4px;padding-left:18px;display:grid;gap:2px"><li style="font-size:14.5px">Track C: the interference trend visible in aircraft data before the suspension</li><li style="font-size:14.5px">Track A6-style check that the alternate (Tallinn) can absorb the traffic</li><li style="font-size:14.5px">Coach transfers and rebookings booked before departure, not at arrival</li></ul></div>
  </div>
 </div>
 <div class="src">Event: Finnair and ERR News, Apr–May 2024 (reported). Nemotron and review: decisions/nemotron_decisions.json. India has GPS-only approaches too; the same failure can happen here.</div>`) });

// ---------- 12 NEMOTRON ----------
const fc = NB.fact_check || { issues: [] };
add({ so: "Nemotron is the reasoning layer: it turns our measurements into decisions, and a second pass catches mistakes before a person sees them.", notes: '3:30–3:55. Where NVIDIA Nemotron sits in the system: five jobs, two models. Most important: the two-pass readiness brief, where one Nemotron call writes the decision and a second fact-checks it against the data. AI proposes, the data and people decide.', html: n => S(n, 'k-a6', `${run('AI integration · NVIDIA Nemotron', 'Track A · Technical depth, AI · 20 · Track B/C · Innovation · 10', n, 'k-a6')}${live(n, 'passengers.html', "Read Nemotron's decisions")}
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
   <div class="black" style="padding:18px 20px"><div class="small" style="color:#9AA6B0">Nemotron fact-checker, on the brief</div><p style="margin-top:6px;font-size:15px;color:#EEF2F5">"${(fc.issues?.[3]?.problem || fc.issues?.[0]?.problem || '').slice(0, 150)}"</p><p style="margin-top:8px;font-size:13.5px;color:#8EE9D9">Fix: ${(fc.issues?.[3]?.fix || fc.issues?.[0]?.fix || '').slice(0, 110)}</p></div>
   <div class="card"><h3>Guardrails</h3><p class="small" style="margin-top:6px;font-size:14px">Answers only from supplied data · structured JSON outputs · every number labelled reported, derived or assumed · human check on every case (we corrected Nemotron on Delhi: ILS was available).</p></div>
  </div>
 </div>`) });

// ---------- 13 B3 ----------
const gn = sim['GPS + NavIC + LEO'], g0 = sim['GPS only'];
add({ so: "The long-term fix: navigation satellites much closer to Earth make GPS far harder to jam or spoof.", notes: '3:55–4:05. Track B3 as the long-term layer, briefly: physics, simulation, cost. Shown on the 3D globe.', html: n => S(n, 'k-b3', `${run('Track B3 · long-term layer', 'Track B/C · Technical depth · 10', n, 'k-b3')}${live(n, 'globe.html', "Open the 3D globe")}
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
add({ so: "The pieces exist separately; FlyWithEase is the first to join the GPS warning, the diversion airport and the passenger in one decision.", notes: '4:05–4:20. Innovation and originality. Detection exists, rebooking exists, construction analytics exist. Nobody links GPS failure to verified diversion capacity to passenger recovery. That link is our contribution.', html: n => S(n, '', `${run('Innovation & originality', 'Track B/C · Innovation & economic/strategic impact · 10', n)}
 <h2>Others solve parts of this.<span class="s">Nobody closes the loop.</span></h2>
 <table style="margin-top:18px"><thead><tr><th style="width:44%">Who</th><th style="text-align:center">Detects GPS failure</th><th style="text-align:center">Verifies diversion airport</th><th style="text-align:center">Recovers passengers</th><th style="text-align:center">Connects all three</th></tr></thead>
  <tbody>${players.map(([a, b, v]) => `<tr><td><b>${a}</b> <span class="small">· ${b}</span></td>${v.map(x => `<td style="text-align:center">${D(x)}</td>`).join('')}<td style="text-align:center">${D(0)}</td></tr>`).join('')}
  <tr style="background:#EEF0FB"><td><b style="color:var(--a6);font-family:var(--H);font-size:17px">FlyWithEase</b></td><td style="text-align:center">${D(1)}</td><td style="text-align:center">${D(1)}</td><td style="text-align:center">${D(.5)}</td><td style="text-align:center"><span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:var(--a6)"></span></td></tr></tbody></table>
 <div class="black" style="margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px">
  ${[['Satellite-verified capacity', 'Nobody checks from orbit that the diversion airport is actually built.'], ['Interference + capacity in one decision', 'GPS health and airport readiness feed one Nemotron brief.'], ['Self-checking AI', 'A second Nemotron pass fact-checks every brief before a person sees it.']].map(([a, b]) => `<div><div style="font-family:var(--H);font-weight:800;color:#8EE9D9;font-size:16px">${a}</div><p style="color:#C3CCD4;font-size:14px;margin-top:4px">${b}</p></div>`).join('')}
 </div>
 <div class="src">Based on public product information, which may be incomplete. Passenger recovery is specified, not built.</div>`) });

// ---------- 15 FEASIBILITY ----------
add({ so: "Everything shown runs today on free data; the next step is a read-only pilot with one airline at Delhi, with no new satellites.", notes: '4:20–4:40. Practical feasibility: what runs today, what a pilot needs, assumptions and constraints stated plainly. No new satellites needed for the pilot.', html: n => S(n, 'k-b3', `${run('Feasibility', 'Track A · Feasibility · 15 · Track B/C · Practical feasibility · 5', n, 'k-b3')}${live(n, 'a6.html', "Try the decision sliders")}
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
  <div style="position:absolute;left:0;right:0;top:14px;height:3px;background:#8EE9D9"></div>
  <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:22px;position:relative">
   ${[['Now', '#8EE9D9', 'Working prototype: A6 on real data, Track C map, Nemotron briefs, live site'], ['3 months', '#8EE9D9', 'Shadow pilot with one airline at Delhi; daily GPS-integrity feed'], ['6 months', '#8EE9D9', 'More hubs; satellite GNSS data as a second source; passenger recovery flow'], ['12 months', '#8EE9D9', 'Regulator dashboard (DGCA, AAI); B3 low-orbit layer with partners']].map(([a, c, b]) => `<div><div style="width:30px;height:30px;border-radius:50%;background:#0F1117;border:4px solid ${c}"></div><div style="font-family:var(--H);font-weight:800;font-size:22px;color:${c};margin-top:14px">${a}</div><p style="color:#C3CCD4;font-size:15.5px;margin-top:6px">${b}</p></div>`).join('')}
  </div>
 </div>
 <div style="margin-top:34px;font-family:var(--H);font-weight:700;font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#7E8A95">How the pilot is judged</div>
 <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:14px;margin-top:10px">
  ${[['Time to confirmed rebooking', 'per diverted passenger, vs today'], ['Diversions to ready airports', 'share sent to built, clean-airspace alternates'], ['Inspections avoided or justified', 'lender decisions backed by orbit'], ['AI answers passing fact-check', 'Nemotron two-pass, then human sign-off']].map(([a, b]) => `<div class="card" style="padding:14px 16px"><div style="font-family:var(--H);font-weight:700;font-size:16px;color:#EEF2F5">${a}</div><p style="color:#9AA6B0;font-size:13.5px;margin-top:4px">${b}</p></div>`).join('')}
 </div>
 <div style="position:absolute;left:72px;right:72px;bottom:46px;display:flex;justify-content:space-between;align-items:end">
  <div><div style="font-family:var(--H);font-weight:800;font-size:24px">${SITE}</div><p style="color:#9AA6B0;font-size:14px;margin-top:4px">Overview · Jewar (A6) · GPS map (C) · Globe (B3) · Passengers · Deck</p></div>
  <div style="color:#7E8A95;font-size:12.5px;text-align:right;max-width:420px">Every number is labelled reported, derived, simulated or assumed. Code: github.com/rehancodes-web/Mack.1</div>
 </div>`) });

// ---------- 23 MARKING MAP ----------
// Rows of the judges' scheme -> slides (original insertion numbers, mapped to final positions by pos()).
const RUBRIC = [
  ['Track A', 'var(--a6)', 'Problem understanding & economic impact', 20, [2, 24, 25, 26, 27, 4, 16]],
  ['Track A', 'var(--a6)', 'Technical depth, AI & satellite data', 20, [5, 7, 32, 39, 8, 35, 18, 33]],
  ['Track A', 'var(--a6)', 'Feasibility, accuracy & applicability', 15, [9, 10, 11, 36, 29, 43]],
  ['Track A', 'var(--a6)', 'Working demo & objective completion', 10, [28, 6, 12]],
  ['Track C', 'var(--c)', 'Innovation & strategic impact', 10, [30, 20, 26, 31]],
  ['Track C', 'var(--c)', 'Technical implementation & objectives', 10, [13, 37, 14, 15, 17, 19, 38]],
  ['Track C', 'var(--c)', 'Practical feasibility', 5, [21, 40, 41, 42]],
  ['Presentation', 'var(--amber)', 'Clarity, flow, explanation, timing', 10, [3, 5, 34, 22]],
];
add({ notes: 'Optional, 5 s: "Our deck follows your marking scheme; every slide carries the criterion it answers in the pill at the top." In the web deck and the pptx, every number on this slide is a link to that slide, and every pill links back here.', html: n => {
  const y0 = 236, rh = 50, cx = 720;
  const rows = RUBRIC.map(([tr, c, crit, m, list], r) => {
    const y = y0 + r * rh;
    const chips = list.map((o, j) => { const t = pos(o), x = cx + j * 54; hot(n, { x, y: y + 10, w: 46, h: 30, slide: t, tip: TITLES[o - 1] }); return `<a href="#${t}" data-go="${t}" title="${TITLES[o - 1]}" style="position:absolute;left:${x}px;top:${y + 10}px;width:46px;height:30px;display:grid;place-items:center;border-radius:8px;background:${c};color:#fff;font-family:var(--N);font-weight:700;font-size:14px;text-decoration:none">${String(t).padStart(2, '0')}</a>`; }).join('');
    return `<div style="position:absolute;left:72px;right:72px;top:${y}px;height:${rh}px;border-bottom:1px solid var(--line)"></div>
     <div style="position:absolute;left:72px;top:${y + 15}px;font-family:var(--H);font-weight:800;font-size:13px;color:${c}">${tr}</div>
     <div style="position:absolute;left:200px;top:${y + 13}px;font-size:17px;font-weight:600">${crit}</div>
     <div style="position:absolute;left:620px;top:${y + 11}px;font-family:var(--N);font-weight:700;font-size:20px;color:${c}">${m}</div>${chips}`;
  }).join('');
  return S(n, 'abs', `${run('Marking map', 'How this deck is scored · tap any number', n)}
  <h2 style="position:absolute;left:72px;top:96px">Built on your marking scheme.<span class="s">Each criterion, and the slides that answer it.</span></h2>
  <div style="position:absolute;left:72px;right:72px;top:208px;display:flex;font-family:var(--H);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)"><span style="width:128px">Track</span><span style="width:420px">Criterion</span><span style="width:100px">Marks</span><span>Slides (tap to jump)</span></div>
  ${rows}
  <div style="position:absolute;left:72px;right:72px;top:${y0 + RUBRIC.length * rh + 16}px;font-size:14.5px;color:var(--sub)">Track A (65 marks) comes first because it carries the most weight. Every slide ends with a <b style="color:#4338CA">What this means</b> line in plain English, and every number is labelled reported, derived, simulated or assumed.</div>`);
} });

// ---------- 24 RESEARCH: GLOBAL + INDIA ----------
const REG = [['SE Asia / Bay of Bengal', 319], ['North-west India (Jammu, Amritsar, Rajasthan)', 276], ['Kolkata region', 93], ['Middle East', 85], ['Delhi vicinity', 64], ['Chennai vicinity', 40], ['Mumbai region', 19], ['Hyderabad vicinity', 18], ['Arabian Sea', 13]];
const IMP = [['Loss of GPS', 71], ['Loss of ADS (aircraft position to ATC)', 54], ['False terrain warnings (EGPWS)', 19], ['Complete outage', 10], ['Loss of GPS-based landing', 6]];
add({ so: "Interference is now counted in millions of events worldwide, and in India it clusters on the north-west border and around Delhi: exactly where a diversion to Jewar would be needed.", notes: 'Track A problem understanding. Our research, condensed: global scale from IATA, and India broken down by region and by what actually fails on the aircraft. Key point: 71% total GPS loss, 54% loss of position reporting to ATC, 19% false terrain warnings.', html: n => S(n, 'k-am', `${run('Research · the scale', 'Track A · Problem understanding & economic impact · 20', n)}
 <h2>What our research found.</h2>
 <div style="display:grid;grid-template-columns:.8fr 1.25fr 1fr;gap:20px;margin-top:18px;align-items:start">
  <div class="grid" style="gap:10px">
   <div style="font-family:var(--H);font-weight:800;font-size:15px">World (IATA)</div>
   ${[['+175%', 'reported GNSS interference, 2024 vs 2023'], ['+500%', 'GPS spoofing, 2024 vs 2023'], ['71,000+', 'interference cases, 2024–25'], ['2.1 M', 'GPS signal-loss events, 2024–25'], ['1,171', 'official alerts (NOTAMs), 2024–25']].map(([a, b]) => `<div class="card" style="padding:8px 14px"><div class="num" style="font-size:22px;color:var(--amber)">${a}</div><div class="small" style="font-size:13px">${b}</div></div>`).join('')}
  </div>
  <div class="card" style="padding:14px 16px"><div style="font-family:var(--H);font-weight:800;font-size:15px">India 2025: where incidents were reported</div>
   <div class="bars k-am" style="--lw:205px;margin-top:10px">${REG.map(([a, v]) => `<div><span>${a}</span><i style="width:${v / 319 * 100}%;${/Delhi|North-west/.test(a) ? 'background:var(--red)' : ''}"></i><b>${v}</b></div>`).join('')}</div>
   <p class="small" style="margin-top:8px;font-size:12.5px">Red: the two regions FlyWithEase covers first. Some locations were estimated by ICAO from incomplete reports.</p></div>
  <div class="card" style="padding:14px 16px"><div style="font-family:var(--H);font-weight:800;font-size:15px">What failed on the aircraft</div>
   <div class="bars k-c" style="--lw:130px;margin-top:10px;gap:10px">${IMP.map(([a, v]) => `<div><span style="font-size:12.5px;line-height:1.2">${a}</span><i style="width:${v}%"></i><b>${v}%</b></div>`).join('')}</div>
   <p class="small" style="margin-top:8px;font-size:12.5px">Share of India's 2025 reports; categories overlap.</p>
   <div style="margin-top:10px;border-top:1px solid var(--line);padding-top:8px"><div class="num" style="font-size:22px;color:var(--red)">2,977</div><div class="small" style="font-size:13px">Indian incidents, Nov 2023 – Feb 2026 (2,354 + 623)</div></div></div>
 </div>
 <div class="src">Reported: IATA Annual Safety Report 2024 and AGM 2026 briefing; ICAO Asia-Pacific paper, Jan 2026; Lok Sabha, 12 Mar 2026. The 2,977 total is derived. Full write-up: research/gps-navigation-failures.md.</div>`) });

// ---------- 25 BOEING: WHAT BOEING HAS SAID ----------
add({ so: "We do not replace Boeing's on-board fixes. We add the network view a single aircraft cannot see: where GPS is failing, which airport can take the flight, and what happens to the passengers.", notes: 'Track A problem understanding and Track C strategic fit, aimed at Boeing judges. Boeing told ICAO in 2024 that every Boeing model has seen GNSS interference, and set out a three-phase plan. FlyWithEase plugs into phase 1 (network-level detection) and phase 3 (alternative positioning via B3), and adds the airport and passenger layers that sit outside the aircraft.', html: n => S(n, 'k-c', `${run('Boeing · the manufacturer view', 'Track A · Problem understanding · 20 · Track C · Strategic impact · 10', n, 'k-c')}
 <h2>Boeing: interference has hit every model it builds.</h2>
 <div style="display:grid;grid-template-columns:.85fr 1.55fr;gap:22px;margin-top:18px;align-items:start">
  <div class="black" style="padding:18px 20px"><div style="font-family:var(--H);font-weight:800;color:#8EE9D9;font-size:16px">Boeing to ICAO, Sep 2024 (paper IP/04)</div>
   <ul style="list-style:none;display:grid;gap:7px;margin-top:10px">${['GPS and flight-computer positions disagree', 'Wrong date and time on board', 'Unexpected terrain-warning alerts', 'Loss of satellite communication on some aircraft', 'ADS-B lost, or broadcasting a wrong position'].map(t => `<li style="font-size:14.5px;color:#E6ECF0"><span class="dot" style="background:#8EE9D9"></span>${t}</li>`).join('')}</ul>
   <p style="font-size:13.5px;color:#9AA8B4;margin-top:10px">Effects "might not be immediately obvious" to crews, and the GPS receiver cannot be fully isolated from the terrain-warning system and clock.</p></div>
  <table>
   <thead><tr><th style="width:21%">Boeing's plan</th><th style="width:38%">What Boeing is doing</th><th>Where FlyWithEase fits</th></tr></thead>
   <tbody>
    <tr><td><b>1 · Containment</b></td><td>GPS Event Monitor (GEM) records symptoms and location on each aircraft; reports go to the airline and Boeing</td><td><b class="kc">Track C</b> turns many aircraft's integrity broadcasts into one regional map, live, for aircraft without GEM too</td></tr>
    <tr><td><b>2 · Improvement</b></td><td>Software updates to receivers and terrain-warning systems so bad GPS cannot spread</td><td>Outside our scope; our map shows where crews should expect false terrain warnings</td></tr>
    <tr><td><b>3 · Resilience</b></td><td>Dual-frequency, multi-constellation receivers, signal authentication, smart antennas, alternative positioning</td><td><b style="color:var(--b3)">Track B3</b>: a low-orbit layer and NavIC cross-check; <b style="color:var(--a6)">Track A6</b> and passenger recovery sit outside the aircraft entirely</td></tr>
   </tbody>
  </table>
 </div>
 <div class="src">Reported: ICAO NACC WG/9 IP/04 (Sep 2024); Inside GNSS, "Boeing's approach to mitigating the impacts of GNSS RFI" (Aug 2026). Fit column is our proposal.</div>`) });

// ---------- 26 BOEING FLEET CASES ----------
const BC = [
  ['Boeing 777', 'Sep 2023 · Iraq–Iran border', 'Spoofed on airway UM688. Navigation showed ~80 nm off track; the aircraft nearly entered Iranian airspace without clearance and the crew had to ask Baghdad ATC for its position.', 'Track C flags the spoofing band; dispatch reroutes and briefs crews before departure.', 'var(--c)'],
  ['United Boeing 777', 'Aug 2024 · Delhi → Newark', 'Spoofed over the Black Sea; the GPS position drifted from the real one and stayed affected for the rest of the flight.', 'An India-origin flight: the warning reaches the dispatcher at Delhi, and a receiver check is booked before the next rotation.', 'var(--c)'],
  ['Ryanair Boeing 737', 'Jan 2025 · Vilnius, Lithuania', 'Interference on final approach: the crew abandoned the landing at about 850 ft and diverted to Warsaw, in another country.', 'A pre-checked alternate (the A6 idea) and passenger recovery started at the go-around, not at the gate.', 'var(--a6)'],
  ['Boeing 787', '2025 · NASA ASRS safety report', 'After a jamming event only one of two GPS receivers came back; the crew flew the rest of the flight on other navigation sources.', 'Nemotron\'s turnaround check: flag the tail for maintenance so the next departure is not delayed.', 'var(--b3)'],
];
add({ so: "These are Boeing aircraft, in service, in the last three years. Each one shows a gap FlyWithEase fills: earlier warning, a ready alternate, a planned turnaround, a protected passenger.", notes: 'Track A problem understanding, for Boeing judges: four reported events on Boeing aircraft, each with what FlyWithEase would have changed. The bottom strip is history: navigation errors (not GPS interference) on Boeing aircraft that show why trusted position matters.', html: n => S(n, 'k-c', `${run('Boeing fleet cases', 'Track A · Problem understanding & economic impact · 20', n, 'k-c')}
 <span class="case">Cases 6–9 · reported events on Boeing aircraft</span>
 <h2>It is already happening to Boeing fleets.</h2>
 <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px;margin-top:16px">
  ${BC.map(([a, w, h, f, c]) => `<div class="card" style="padding:12px 16px;border-left:5px solid ${c}">
    <div style="display:flex;justify-content:space-between;align-items:baseline"><h3 style="font-size:17px">${a}</h3><span class="small" style="font-size:13px">${w}</span></div>
    <p style="font-size:14px;line-height:1.36;margin-top:4px">${h}</p>
    <p style="font-size:14px;line-height:1.36;margin-top:6px;color:${c}"><b style="font-family:var(--H)">FlyWithEase:</b> ${f}</p></div>`).join('')}
 </div>
 <div style="margin-top:10px;display:flex;gap:14px;align-items:center;font-size:13.5px;color:var(--sub);border-top:1px solid var(--line);padding-top:8px"><b style="font-family:var(--H);color:var(--ink)">Why trusted position matters</b><span>American 965, Boeing 757, Cali 1995: 159 killed · Korean Air 801, Boeing 747, Guam 1997: 228 killed. Navigation errors, not GPS interference; shown for context only.</span></div>
 <div class="src">Reported: OPSGROUP and AIN (Sep 2023); Wall Street Journal (Sep 2024); Lithuanian air navigation authority via press (Jan 2025); NASA ASRS report on a B787; FAA and NTSB accident records.</div>`) });

// ---------- 27 ECONOMICS ----------
const BM = [['Crew', 37.01], ['Fuel', 29.34], ['Maintenance', 18.35], ['Aircraft ownership', 9.76], ['Other', 3.95]];
add({ so: "Every minute of holding costs about $98 and a single diversion up to €77,200, before passengers are cared for. Warning earlier is where the money is saved.", notes: 'Track A economic impact. Direct operating cost per block minute, diversion costs by flight type, and a modelled airport-wide scenario. Our savings formula is honest: savings equal cost without warning minus cost with warning, and the pilot will measure the second number.', html: n => S(n, 'k-am', `${run('Economic impact', 'Track A · Problem understanding & economic impact · 20', n)}
 <h2>What a GPS failure costs.</h2>
 <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:18px;align-items:start">
  <div class="card"><h3>Every minute in the air</h3><div class="num" style="font-size:34px;color:var(--amber);margin-top:6px">$98.41</div><p class="small">per block minute, US airlines, 2025</p>
   <div class="bars k-am" style="--lw:110px;margin-top:10px">${BM.map(([a, v]) => `<div><span>${a}</span><i style="width:${v / 37.01 * 100}%"></i><b>$${v.toFixed(0)}</b></div>`).join('')}</div>
   <p class="small" style="margin-top:8px">45-minute hold ≈ <b>$4,428</b> (derived)</p></div>
  <div class="card"><h3>Every diversion</h3>
   <table style="margin-top:6px"><tbody>
    <tr><td>Regional</td><td style="text-align:right"><b>€1,000–7,000</b></td></tr>
    <tr><td>Continental</td><td style="text-align:right"><b>€1,400–10,500</b></td></tr>
    <tr><td>Intercontinental</td><td style="text-align:right"><b>€7,000–77,200</b></td></tr>
   </tbody></table>
   <p class="small" style="margin-top:8px">Before hotels, meals, rebooking, compensation and the next rotation's delay.</p></div>
  <div class="card"><h3>One airport, one bad day</h3><p class="small" style="margin-top:6px">Modelled GNSS-error scenario at Hong Kong International:</p>
   <div class="num" style="font-size:26px;color:var(--red);margin-top:8px">&gt; €2 M</div><p class="small">airline costs</p>
   <div class="num" style="font-size:26px;color:var(--red);margin-top:8px">up to €3 M</div><p class="small">passenger costs</p></div>
 </div>
 <div class="black" style="margin-top:14px;padding:12px 20px;display:flex;gap:18px;align-items:center"><span style="font-family:var(--N);font-weight:700;color:#8EE9D9;font-size:16px">Savings = cost without warning − cost with warning</span><span style="color:#B8C2CB;font-size:14px">We do not claim the second number yet; the Delhi pilot is designed to measure it.</span></div>
 <div class="src">Reported: Airlines for America 2025; EUROCONTROL Standard Inputs (2022 prices); AGU journal (modelled Hong Kong scenario). $4,428 = 45 × $98.41 (derived).</div>`) });

// ---------- TRACK EXPLAINERS, BOEING CASE, UNDER THE HOOD, NEMOTRON IN FULL, SCORECARD (28-34) ----------
// jump chips: absolute row under the running header, turned into slide links in pptx and web
const jumps = (n, list) => list.map(([o, label], j) => { const x = 72 + j * 172, t = pos(o); hot(n, { x, y: 54, w: 164, h: 26, slide: t, tip: label }); return `<a href="#${t}" data-go="${t}" style="position:absolute;left:${x}px;top:54px;width:164px;height:26px;display:flex;align-items:center;gap:6px;padding:0 10px;border-radius:20px;background:var(--acc);color:#fff;font-family:var(--H);font-weight:600;font-size:12px;text-decoration:none;white-space:nowrap;overflow:hidden"><span style="font-family:var(--N)">${String(t).padStart(2, '0')}</span>${label}</a>`; }).join('');
const col = (h, c, body) => `<div class="card" style="padding:14px 16px;border-top:4px solid ${c}"><div style="font-family:var(--H);font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:${c};font-weight:800">${h}</div>${body}</div>`;
const boeing = (title, items, foot = '') => `<div class="black" style="padding:16px 18px"><div style="display:flex;align-items:center;gap:8px"><span style="font-family:var(--H);font-weight:800;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;background:#8EE9D9;color:#0F1117;border-radius:5px;padding:2px 7px">Boeing angle</span></div><h3 style="color:#fff;margin-top:8px;font-size:18px">${title}</h3><ul style="list-style:none;display:grid;gap:7px;margin-top:8px">${items.map(t => `<li style="font-size:14px;line-height:1.36;color:#DCE3E8"><span class="dot" style="background:#8EE9D9"></span>${t}</li>`).join('')}</ul>${foot ? `<p style="font-size:12.5px;color:#8E9BA6;margin-top:8px">${foot}</p>` : ''}</div>`;
const li = a => `<ul style="margin:8px 0 0 18px;display:grid;gap:5px">${a.map(t => `<li style="font-size:14.5px;line-height:1.36">${t}</li>`).join('')}</ul>`;

// 28 TRACK A EXPLAINED
add({ so: "Track A asks for one satellite objective, a working demo on real data, and a money decision. Ours: watch Jewar airport being built from orbit, so airlines (flying Boeing jets India is buying by the hundred) and lenders know if the backup airport is real.", notes: 'Track A explained, for anyone reading without us. What the organisers asked, what we chose and why, where each requirement is answered (tap the chips), and why this matters to Boeing: India is one of the fastest-growing Boeing markets, and the jets it buys need airports that are actually ready.', html: n => S(n, 'k-a6 top', `${run('Track A explained', 'Track A · all four criteria · 65', n, 'k-a6')}${jumps(n, [[6, 'Objective'], [9, 'Result'], [10, 'Accuracy'], [11, 'Lender case']])}${live(n, 'a6.html', 'Open the Jewar monitor')}
 <h2>Track A, "Read the Planet", in plain words.<span class="s">Compulsory: one satellite objective, a working demo on real data, an economic decision.</span></h2>
 <div style="display:grid;grid-template-columns:1fr 1fr 1.1fr;gap:14px;margin-top:18px;align-items:start">
  ${col('What the organisers ask', 'var(--sub)', li(['Pick <b>one of six</b> objectives (urbanisation, renewables, agriculture, night lights, disaster, <b>infrastructure</b>)', 'A <b>working demo on real satellite data</b>', 'Turn it into an <b>economic decision</b>: who pays, and how much is it worth?']))}
  ${col('What we did · objective 6', 'var(--a6)', li(['Infrastructure: <b>monitor construction from orbit</b>', 'Site: Noida International Airport, <b>Jewar</b>, 70 km from Delhi IGI, its natural diversion airport', '79 Sentinel-2 scenes, 2020–2026; Larper AI labels every 10 m pixel', `Result: builder said <b>80%</b>, orbit saw <b>${dec.satellite_observed_pct}%</b> → a lender should <b>inspect</b>`]))}
  ${boeing('India is buying Boeing jets faster than it builds airports', ['Air India ordered <b>220 Boeing aircraft</b> in 2023 (737 MAX, 787, 777X); Akasa Air flies an all-<b>737 MAX</b> fleet', 'Boeing\'s market outlook expects South Asia to need <b>≈2,800 new jets</b> over 20 years', 'Every one of those jets needs a runway and a diversion airport that really exist; Jewar is Delhi\'s', 'FlyWithEase checks that from orbit, for free, every 5 days'], 'Reported: Air India / Boeing press release (Feb 2023); Boeing Commercial Market Outlook 2024.')}
 </div>
 <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px">
  ${[['Problem & economic impact', 20, 'Slides on research, Boeing, costs, users'], ['Technical depth, AI & data', 20, 'Data, Larper, Nemotron, under the hood'], ['Feasibility & accuracy', 15, 'Result, accuracy, lender and 787 cases'], ['Working demo', 10, 'Live Jewar page + this objective']].map(([a, m, b]) => `<div class="card" style="padding:9px 14px"><div style="display:flex;justify-content:space-between"><b style="font-family:var(--H);font-size:14px">${a}</b><span class="num kc" style="font-size:16px">${m}</span></div><p class="small" style="font-size:12.5px;margin-top:2px">${b}</p></div>`).join('')}
 </div>`) });

// 29 CASE: BOEING 787 DIVERSION
add({ so: "When an Air India 787 cannot land at Delhi, FlyWithEase answers the two questions satellites can answer (is Jewar built, is its GPS clean) and lists the ones a person must still check.", notes: 'Case 6, illustrative, Boeing aircraft. A Boeing 787 inbound to Delhi meets GPS spoofing on approach. We walk through exactly what each part of FlyWithEase contributes and, just as important, what satellites cannot tell us. Numbers are our real Track C and A6 outputs; the flight is illustrative.', html: n => S(n, 'k-a6 top', `${run('Case 6 · Boeing 787 diversion', 'Track A · Feasibility, accuracy & applicability · 15', n, 'k-a6')}${jumps(n, [[13, 'GPS map'], [9, 'Jewar result'], [14, 'Delhi spoofing']])}
 <span class="case">Case 6 · illustrative flight, real data</span>
 <h2>A Boeing 787 can't use GPS into Delhi.<span class="s">Can Jewar take it? What orbit can and cannot answer.</span></h2>
 <div style="display:grid;grid-template-columns:.8fr 1.6fr;gap:22px;margin-top:16px;align-items:start">
  <div class="tl k-a6">
   <div><b>T – 40 min</b><p class="small">Crews on Delhi approaches report spoofing; our GPS map shows cells north of Delhi at <b>medium</b> degradation</p></div>
   <div><b>T – 35 min</b><p class="small">Ops open FlyWithEase: candidate alternate <b>Jewar</b>, 70 km away</p></div>
   <div><b>T – 30 min</b><p class="small">Nemotron drafts the brief; the fact-check pass removes unsupported claims</p></div>
   <div style="padding-bottom:0"><b>T – 25 min</b><p class="small">Duty manager decides, with the checklist below. Passenger rebooking starts now, not at the gate</p></div>
  </div>
  <div>
   <table>
    <thead><tr><th style="width:36%">Question</th><th style="width:16%">Who answers</th><th>Answer</th></tr></thead>
    <tbody>
     <tr><td>Is GPS clean around Jewar?</td><td class="kc" style="color:var(--c)"><b>Track C</b></td><td><b>Yes</b>: ${fmt(gsum.jewar_region.aircraft_seen)} aircraft seen, region normal (derived, one day)</td></tr>
     <tr><td>Is the airport physically built?</td><td class="kc"><b>Track A6</b></td><td><b>Yes</b>: land conversion plateaued Dec 2024; runway and apron visible (derived)</td></tr>
     <tr><td>Is the runway long enough for a 787?</td><td><b>Public record</b></td><td>Phase 1 runway ~3,900 m (reported), more than a 787 typically needs to land</td></tr>
     <tr style="background:#EEF0FB"><td>Certified for wide-bodies, ILS working, stands and fuel free?</td><td><b>A person</b></td><td><b>Orbit cannot see this.</b> FlyWithEase lists it as an open check, never as "safe"</td></tr>
    </tbody>
   </table>
   <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
    <div class="card" style="padding:10px 16px"><div class="num" style="font-size:24px;color:var(--amber)">≈ $4,430</div><p class="small">saved for every 45 minutes of holding avoided ($98.41 per block minute)</p></div>
    <div class="card" style="padding:10px 16px"><div class="num" style="font-size:24px;color:var(--a6)">~250 seats</div><p class="small">a 787-8 carries roughly this many people whose rebooking can start in the air</p></div>
   </div>
  </div>
 </div>
 <div class="src">Flight is illustrative. Track C and A6 values are our outputs. Runway length and 787 capacity are public figures, rounded (reported). Holding cost: Airlines for America 2025.</div>`) });

// 30 TRACK C EXPLAINED
add({ so: "Track C asks for protective security from space. Ours turns the position-trust number every aircraft already broadcasts into a national GPS-health map, the network view that Boeing's on-board monitor cannot give on its own.", notes: 'Track C explained. The track, the hard rule (protective only), which objective we chose (GNSS resilience), how we meet each part, and the Boeing angle: Boeing records GPS events on each aircraft; we aggregate across all aircraft, including non-Boeing ones, into a live regional picture.', html: n => S(n, 'k-c top', `${run('Track C explained', 'Track C · all three criteria · 25', n, 'k-c')}${jumps(n, [[13, 'GPS map'], [14, 'Delhi case'], [15, 'Border case'], [17, 'Tartu case']])}${live(n, 'c.html', 'Open the GPS map')}
 <h2>Track C, "Guard the Nation", in plain words.<span class="s">Optional: security and sovereignty from space, protective use only.</span></h2>
 <div style="display:grid;grid-template-columns:1fr 1fr 1.1fr;gap:14px;margin-top:18px;align-items:start">
  ${col('What the organisers ask', 'var(--sub)', li(['Areas: maritime, borders, enforcement, <b>GNSS resilience</b>, sovereign capability, critical infrastructure', '<b>Hard rule:</b> protective only. No weapons, no targeting, no tracking of individual people', 'Deliverable: a demo or a solid architecture']))}
  ${col('What we did · GNSS resilience', 'var(--c)', li([`Read <b>${fmt(gsum.reports)}</b> real aircraft reports (ADS-B, 1 Nov 2026)`, 'Each aircraft says how much it trusts its own position (NIC). Many low values in one 1° cell = GPS is being jammed or spoofed there', `Result: <b>${gsum.cells_high}</b> high-interference zones; Jewar region normal`, '<b>Protective:</b> we map areas only. We never locate a jammer or follow a flight']))}
  ${boeing('Boeing sees one aircraft. We see the sky.', ['Boeing told ICAO (2024) that GNSS interference has affected <b>every Boeing model</b>', 'Its <b>GPS Event Monitor</b> logs what happened on each aircraft, after the fact, for that airline', 'A Boeing 777 was spoofed ~80 nm off track near the Iraq–Iran border (2023)', 'FlyWithEase combines <b>all aircraft</b> in a region, live, so dispatch can warn a crew <b>before</b> departure'], 'Reported: ICAO NACC WG/9 IP/04 (Sep 2024); OPSGROUP (Sep 2023).')}
 </div>
 <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px">
  ${[['Innovation & strategic impact', 10, 'Links GPS health to a ready diversion airport'], ['Technical implementation & objectives', 10, 'Real ADS-B data, per-cell rating, four cases'], ['Practical feasibility', 5, 'Free data, read-only pilot, rule respected']].map(([a, m, b]) => `<div class="card" style="padding:9px 14px"><div style="display:flex;justify-content:space-between"><b style="font-family:var(--H);font-size:14px">${a}</b><span class="num kc" style="font-size:16px">${m}</span></div><p class="small" style="font-size:12.5px;margin-top:2px">${b}</p></div>`).join('')}
 </div>`) });

// 31 TRACK B3 EXPLAINED
add({ so: "B3 is the long-term fix: navigation satellites closer to Earth give a signal about 19 dB stronger, which shrinks a jammer's reach. Boeing already builds both GPS satellites and small low-orbit satellites, so this is buildable, not science fiction.", notes: 'Track B3 explained. The physics in one line (closer satellite, stronger signal, smaller jamming area), what we simulated and costed, and the Boeing angle: Boeing built the GPS IIF satellites and owns Millennium Space Systems, which builds small low-orbit satellites. Honest note: organisers said choose one of B or C; we show B3 as the long-term layer of the same chain, not as a scored extra.', html: n => S(n, 'k-b3 top', `${run('Track B3 explained', 'Track B · Positioning & sensing · long-term layer', n, 'k-b3')}${jumps(n, [[19, 'B3 numbers'], [20, 'Originality'], [21, 'Feasibility']])}${live(n, 'globe.html', 'Open the 3D globe')}
 <h2>Track B3, "Positioning & sensing", in plain words.<span class="s">Better GPS from low-orbit satellites, with back-of-envelope physics and cost.</span></h2>
 <div style="display:grid;grid-template-columns:1fr 1fr 1.1fr;gap:14px;margin-top:18px;align-items:start">
  ${col('The physics in one line', 'var(--sub)', li(['GPS satellites are <b>20,200 km</b> up, so their signal arrives weaker than radio noise', 'A satellite at <b>1,000 km</b> is ~20× closer; signal strength falls with distance squared', `So the signal is <b>${phys.signal.leo_advantage_db} dB</b> stronger and a 10 W jammer's reach shrinks from ${Math.round(phys.jamming.gps_denial_radius_km)} km to ${Math.round(phys.jamming.leo_denial_radius_km)} km`]))}
  ${col('What we built · simulation + cost', 'var(--b3)', li([`${phys.constellation.satellites_needed} satellites at 1,000 km keep ~4 in view over India`, `Spoofing detected: <b>${Math.round(g0.detection_rate * 100)}% → ${Math.round(gn.detection_rate * 100)}%</b> with GPS + NavIC + LEO and an AI cross-check`, `Spoofed error <b>${gn.spoofed_median_error_m_uncorrected} → ${gn.spoofed_median_error_m_ai_corrected} m</b> after correction (simulated)`, `~$${Math.round(phys.cost.capex_usd / 1e6)}M to build, ~$${Math.round(phys.cost.per_year_usd / 1e6)}M a year (assumed); builds on India's NavIC`]))}
  ${boeing('Boeing already builds both halves', ['Boeing built the <b>12 GPS Block IIF</b> satellites that still serve every GPS user', 'Boeing\'s <b>Millennium Space Systems</b> builds small satellites for low-orbit constellations', 'Boeing\'s own plan to ICAO (phase 3) calls for <b>multi-constellation receivers and alternative positioning</b>, exactly what B3 supplies', 'A 737 MAX or 787 with a multi-constellation receiver could use a LEO layer with no new antenna class'], 'Reported: Boeing / US Space Force (GPS IIF); Boeing (Millennium); ICAO IP/04. Last bullet is our proposal.')}
 </div>
 <div class="card" style="margin-top:14px;padding:10px 16px;font-size:14px"><b style="font-family:var(--H)">Honest scope:</b> the organisers allow one optional track (B or C). Track C is our scored optional track; B3 is shown as the long-term layer of the same GPS chain, with physics, simulation and cost, and is not needed for the pilot.</div>`) });

// 32 UNDER THE HOOD (from the old tech page)
add({ so: "Anyone can rerun this: free data, one laptop, Node.js, and five commands. We list the real data problems we hit and how we fixed them.", notes: 'Technical depth, moved here from the website. The full stack, the pipeline with the file that does each step, the Larper model card and how to reproduce every number.', html: n => S(n, 'k-c top', `${run('Under the hood', 'Track A · Technical depth, AI & satellite data · 20', n, 'k-c')}${jumps(n, [[7, 'Data'], [8, 'Larper AI'], [10, 'Accuracy']])}
 <h2>Under the hood: pipeline, model, stack.</h2>
 <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:20px;margin-top:16px;align-items:start">
  <table><thead><tr><th style="width:15%">Step</th><th>What happens</th><th style="width:27%">File</th></tr></thead><tbody>
   ${[['Fetch', 'Read only the airport window from cloud-optimised Sentinel-2 files; monthly scene list with direct band links', 'data/build_manifest.js'], ['Clean', 'Scale and offset per scene (checked on raw pixels); cloud and shadow mask; cloudy months become gaps', 'a6/progress.mjs'], ['Features', '6 bands + NDVI, NDBI, water and bare-soil indices = 10 numbers per 10 m pixel', 'a6/classify.mjs'], ['Classify', `Larper Random Forest: ${met.params.rf.nEstimators} trees, depth ${met.params.rf.treeOptions.maxDepth}, 4 classes, every month`, 'a6/classify.mjs'], ['Decide', '12-month median of converted land vs reported milestones → release or inspect', 'a6/economics.mjs'], ['Reason', 'Nemotron brief + fact-check over Track C and A6 outputs', 'decisions/brief.mjs']].map(([a, b, c]) => `<tr><td><b>${a}</b></td><td style="font-size:14px">${b}</td><td class="small" style="font-family:var(--N);font-size:12px">${c}</td></tr>`).join('')}
  </tbody></table>
  <div class="grid" style="gap:12px">
   <div class="card" style="padding:12px 16px"><h3 style="font-size:16px">Larper model card</h3><p class="small" style="font-size:13.5px;margin-top:4px">${fmt(met.n_train)} training / ${fmt(met.n_test)} test pixels · labels: ESA WorldCover 2021 · trained west of the airport, tested on separate land to the east · ${pc(met.overall_accuracy)} agreement on unseen land</p></div>
   <div class="card" style="padding:12px 16px"><h3 style="font-size:16px">Stack</h3><p class="small" style="font-size:13.5px;margin-top:4px">Node.js only (geotiff.js, proj4, ml-random-forest) · static site on GitHub Pages · NVIDIA Nemotron by API, key kept server-side</p></div>
   <div class="card" style="padding:12px 16px"><h3 style="font-size:16px;color:var(--amber)">Real problems we fixed</h3><p class="small" style="font-size:13.5px;margin-top:4px">+1,000 DN offset that differs between collections · 8-month catalogue hole filled from a second catalogue · throttled large reads, so bands are read one at a time with retries</p></div>
   <div class="black" style="padding:12px 16px;font-family:var(--N);font-size:12.5px;line-height:1.6;color:#CFE3D8">node data/build_manifest.js<br>cd a6 &amp;&amp; node progress.mjs &amp;&amp; node classify.mjs<br>node economics.mjs &amp;&amp; node demo.mjs</div>
  </div>
 </div>`) });

// 33 NEMOTRON IN FULL (from the old AI page)
const vis = NR.vision.map(v => { const g = (k) => ((v.finding.split('\n').find(l => l.includes(k)) || '').replace(/^- *Looks (right|wrong): */, '')); const cut = s => s.length > 150 ? s.slice(0, 147).replace(/\s+\S*$/, '') + '…' : s; return { m: mon(v.month), ok: cut(g('Looks right')), bad: cut(g('Looks wrong')) }; });
add({ so: "Nemotron does not get the last word. Pass 1 writes the decision, pass 2 attacks it against the data, a vision model audits Larper's maps, and a person signs off.", notes: 'AI depth, moved here from the website. The actual two-pass brief for the Delhi spoofing scenario: what Nemotron wrote, what its own fact-check found wrong, and what the vision model said about Larper maps in four different years.', html: n => S(n, 'k-a6 top', `${run('Nemotron in full', 'Track A · Technical depth, AI · 20', n, 'k-a6')}${jumps(n, [[18, 'Nemotron overview'], [14, 'Delhi case']])}${live(n, 'passengers.html', "Read Nemotron's decisions")}
 <h2>Inside the two-pass brief, word for word.</h2>
 <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:16px;align-items:start">
  ${col('Pass 1 · Nemotron writes', 'var(--b3)', `<h3 style="margin-top:6px;font-size:17px">Jewar: <span style="color:var(--amber)">${NB.brief.jewar_readiness.verdict}</span></h3><p style="font-size:13.5px;margin-top:4px">${NB.brief.jewar_readiness.why}</p><p class="small" style="font-size:13px;margin-top:6px"><b>Unknowns it named:</b> ${NB.brief.unknowns.join(' · ')} · confidence ${NB.brief.confidence}</p><p class="small" style="font-size:12px;margin-top:6px;font-family:var(--N)">${NB.model.replace('nvidia/', '')}</p>`)}
  ${col(`Pass 2 · fact-check: ${fc.verdict.replace(/_/g, ' ')}`, 'var(--red)', fc.issues.slice(0, 3).map(i => `<div style="margin-top:8px;font-size:13px;line-height:1.35"><b>Claim:</b> ${i.claim.slice(0, 80)}${i.claim.length > 80 ? '…' : ''}<br><span style="color:var(--sub)">${i.problem.slice(0, 115)}${i.problem.length > 115 ? '…' : ''}</span></div>`).join('') + `<p class="small" style="font-size:12px;margin-top:6px">${fc.issues.length} issues in total, each with a fix</p>`)}
  ${col('Vision audit of Larper', 'var(--a6)', vis.filter((_, k) => k === 0 || k === vis.length - 1).map(v => `<div style="margin-top:8px;font-size:13px;line-height:1.35"><b>${v.m}</b> <span style="color:var(--b3)">✓</span> ${v.ok}<br><span style="color:var(--red)">✗</span> ${v.bad}</div>`).join('') + `<p class="small" style="font-size:12px;margin-top:6px">${NR.vision.length} months audited · ${NR.vision[0].model.replace('nvidia/', '')}</p>`)}
 </div>
 <div class="black" style="margin-top:14px;padding:12px 20px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px">${[['Grounded', 'Answers only from the data we pass in, as structured JSON, with unknowns named'], ['Self-checked', 'Pass 2 flags invented numbers and overstated certainty'], ['Human sign-off', 'We corrected Nemotron on Delhi: ILS was available on other runways']].map(([a, b]) => `<div><b style="font-family:var(--H);color:#8EE9D9">${a}</b><p style="font-size:13.5px;color:#C3CCD4;margin-top:2px">${b}</p></div>`).join('')}</div>`) });

// 34 SCORECARD (from the old scorecard page)
add({ notes: 'The marking scheme with our evidence on each line, moved here from the website. Tap a slide number to jump.', html: n => {
  const SC = [
    ['A', 'Problem understanding & economic impact', 20, '2,977 Indian incidents; 4 Boeing fleet cases; €1,000–77,200 per diversion; four paying users', [24, 26, 27]],
    ['A', 'Technical depth, AI & satellite data', 20, `79 Sentinel-2 scenes; Larper RF ${pc(met.overall_accuracy)} on unseen land; Nemotron two-pass + vision audit`, [7, 35, 39]],
    ['A', 'Feasibility, accuracy & applicability', 15, 'Two methods agree; limits stated; lender case ($86k avoided, assumed); Boeing 787 case; sensitivity grid', [10, 36, 43]],
    ['A', 'Working demo & objective completion', 10, 'Objective 6 complete; live Jewar monitor with sliders', [28, 9, 12]],
    ['C', 'Innovation & strategic impact', 10, 'Only system joining GPS health, ready alternate and passenger recovery', [30, 20, 25]],
    ['C', 'Technical implementation & objectives', 10, `${fmt(gsum.reports)} aircraft reports, ${gsum.cells_high} high zones; Delhi, border, Tartu cases; method in full`, [13, 37, 15]],
    ['C', 'Practical feasibility', 5, 'Free data; read-only shadow pilot; costed pilot; risk register; protective-use rule met', [40, 41, 42]],
    ['P', 'Clarity, flow, explanation, timing', 10, 'Basics slide; track explainers; "What this means" on every slide; notes timed to 5:00', [3, 5, 23]],
  ];
  const y0 = 196, rh = 52;
  const rws = SC.map(([t, crit, m, ev, list], r) => { const y = y0 + r * rh, c = t === 'A' ? 'var(--a6)' : t === 'C' ? 'var(--c)' : 'var(--amber)';
    const chips = list.map((o, j) => { const x = 1040 + j * 56, tg = pos(o); hot(n, { x, y: y + 11, w: 48, h: 30, slide: tg, tip: TITLES[o - 1] }); return `<a href="#${tg}" data-go="${tg}" style="position:absolute;left:${x}px;top:${y + 11}px;width:48px;height:30px;display:grid;place-items:center;border-radius:8px;background:${c};color:#fff;font-family:var(--N);font-weight:700;font-size:14px;text-decoration:none">${String(tg).padStart(2, '0')}</a>`; }).join('');
    return `<div style="position:absolute;left:72px;right:72px;top:${y}px;height:${rh}px;border-bottom:1px solid var(--line)"></div><div style="position:absolute;left:72px;top:${y + 8}px;width:330px;font-size:15px;font-weight:700;line-height:1.2"><span style="color:${c};font-family:var(--H)">${t === 'P' ? 'Pres.' : 'Track ' + t}</span> · ${crit}</div><div style="position:absolute;left:410px;top:${y + 13}px;font-family:var(--N);font-weight:700;font-size:18px;color:${c}">${m}</div><div style="position:absolute;left:460px;top:${y + 7}px;width:560px;font-size:13.5px;line-height:1.3;color:var(--sub)">${ev}</div>${chips}`; }).join('');
  return S(n, 'abs', `${run('Scorecard', 'Every marking line, with evidence', n)}<h2 style="position:absolute;left:72px;top:96px">Scorecard: the evidence for every mark.</h2><div style="position:absolute;left:72px;right:72px;top:170px;display:flex;font-family:var(--H);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)"><span style="width:338px">Criterion</span><span style="width:50px">Marks</span><span style="width:580px">Evidence</span><span>Proof (tap)</span></div>${rws}`); } });

// ---------- DETAILED TECHNICAL (35-39) AND FEASIBILITY (40-43) ----------
const th = a => `<thead><tr>${a.map(([t, w]) => `<th${w ? ` style="width:${w}"` : ''}>${t}</th>`).join('')}</tr></thead>`;
const T = (head, body, fs = 13.5) => `<table>${th(head)}<tbody>${body.map(r => `<tr>${r.map((c, j) => `<td style="font-size:${fs}px;padding:6px 9px">${j === 0 ? `<b>${c}</b>` : c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const mono = t => `<span style="font-family:Consolas,'Courier New',monospace;font-size:.92em;background:#EEF0FB;border-radius:4px;padding:0 4px">${t}</span>`;
const PB = rdy.satellite;
const CMX = met.confusion_rows_true_cols_pred, CL = ['vegetation', 'built / paved', 'bare', 'water'];

// 35 LARPER NUMBER BY NUMBER
add({ so: "Larper is a small, inspectable model: ten numbers per pixel, twenty decision trees, tested on land it never saw. The confusion matrix shows exactly where it is strong (vegetation, built) and weak (bare soil).", notes: 'Technical depth, detailed. Every input feature with its formula, the full training design and hyperparameters, and the raw confusion matrix on the held-out east block. Read the matrix row by row: of real bare-soil pixels, 694 were called built, which is why bare recall is 31% and why the decision also uses the NDVI baseline.', html: n => S(n, 'top', `${run('Technical deep-dive 1 · Larper', 'Track A · Technical depth, AI & satellite data · 20', n)}${jumps(n, [[8, 'Larper overview'], [10, 'Accuracy']])}
 <h2>Larper, number by number.<span class="s">Features, training design and the full confusion matrix.</span></h2>
 <div style="display:grid;grid-template-columns:1.05fr 1fr;gap:20px;margin-top:14px;align-items:start">
  <div>${T([['Feature', '22%'], ['Formula (Sentinel-2 bands)'], ['Picks up', '27%']], [
    ['B2 B3 B4 B8', 'blue, green, red, near-infrared reflectance (10 m)', 'colour, brightness'],
    ['B11, B12', 'short-wave infrared (20 m, resampled to 10 m)', 'concrete, dry soil'],
    ['NDVI', mono('(B8 − B4) / (B8 + B4)'), 'living vegetation'],
    ['NDBI', mono('(B11 − B8) / (B11 + B8)'), 'built-up surfaces'],
    ['MNDWI', mono('(B3 − B11) / (B3 + B11)'), 'open water'],
    ['BSI', mono('((B11+B4)−(B8+B2)) / ((B11+B4)+(B8+B2))'), 'bare soil'],
  ], 13)}
  <div class="card" style="margin-top:10px;padding:10px 14px;font-size:13.5px;line-height:1.45"><b style="font-family:var(--G)">Training design.</b> Labels: ESA WorldCover 2021 (10 m). Training scenes: ${met.params.train_months.join(', ')} (three seasons). ${fmt(met.params.per_class_per_scene)} pixels per class per scene from a ${met.params.train_pad_m / 1000} km ring around the airport, west half only; airport + ${met.params.footprint_gap_m} m buffer never used. Random Forest: ${met.params.rf.nEstimators} trees, max depth ${met.params.rf.treeOptions.maxDepth}, ${Math.round(met.params.rf.maxFeatures * 100)}% of features per split, bootstrap, seed ${met.params.seed}. Cloud, shadow, cirrus and saturated pixels (SCL ${met.params.invalid_scl.join(', ')}) dropped.</div></div>
  <div>
   <div style="font-family:var(--G);font-weight:700;font-size:16px">Confusion matrix, held-out east block (${fmt(met.n_test)} pixels)</div>
   <table style="margin-top:6px"><thead><tr><th>True ↓ / Pred →</th>${CL.map(c => `<th style="text-align:right">${c}</th>`).join('')}<th style="text-align:right">Recall</th></tr></thead><tbody>
    ${CMX.map((row, i) => `<tr><td style="font-size:14px"><b>${CL[i]}</b></td>${row.map((v, j) => `<td style="text-align:right;font-family:var(--N);font-size:14px;${i === j ? 'background:#EEF0FB;color:var(--acc);font-weight:700' : ''}">${fmt(v)}</td>`).join('')}<td style="text-align:right;font-family:var(--N);font-size:14px">${pc(met.per_class[i].recall)}</td></tr>`).join('')}
    <tr><td style="font-size:14px"><b>Precision</b></td>${met.per_class.map(c => `<td style="text-align:right;font-family:var(--N);font-size:14px">${pc(c.precision)}</td>`).join('')}<td style="text-align:right;font-family:var(--N);font-size:14px;color:var(--acc)"><b>${pc(met.overall_accuracy, 1)}</b></td></tr>
   </tbody></table>
   <div class="black" style="margin-top:12px;padding:12px 16px;font-size:13.5px;line-height:1.45;color:#DCE3E8"><b style="color:var(--mint);font-family:var(--H);font-weight:600">How to read it.</b> Built/paved is found ${pc(cls('built_paved').recall)} of the time but over-called (precision ${pc(cls('built_paved').precision)}): ${fmt(CMX[2][1])} bare pixels look like concrete. So progress is reported as <b>converted land</b> (built + bare) and cross-checked with the NDVI baseline, never as "built" alone.</div>
  </div>
 </div>`) });

// 36 BASELINE + DECISION MATHS
add({ so: "The progress number and the money decision are both simple formulas with every parameter written down, so a lender's analyst can check them by hand.", notes: 'Technical depth, detailed: the transparent NDVI baseline that runs beside Larper, its parameters, the outputs it produced for Jewar, and the expected-cost decision rule with the break-even probability worked out.', html: n => S(n, 'top', `${run('Technical deep-dive 2 · progress + decision', 'Track A · Technical depth · 20 · Feasibility · 15', n)}${jumps(n, [[9, 'Result'], [11, 'Lender case']])}
 <h2>From pixels to "inspect": the two formulas.</h2>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;align-items:start">
  <div class="card" style="padding:14px 18px">
   <h3>1 · Land-conversion baseline (no AI)</h3>
   <p style="font-size:14px;margin-top:6px">A pixel is <b>cleared</b> if its <b>highest</b> NDVI over the trailing 12 months stays below 0.30, so a crop that greens up once is never counted as construction.</p>
   <div style="margin:8px 0;font-size:13.5px">${mono('cleared_12m = share of clear site pixels with max NDVI(12 mo) &lt; 0.30')}</div>
   ${T([['Parameter', '46%'], ['Value']], [['Trailing window', '12 months'], ['Monsoon months excluded', 'Jul, Aug, Sep (fields green up)'], ['"Not vegetated" threshold', 'NDVI &lt; 0.25'], ['Minimum clear site', '60% of pixels, else the month is a gap'], ['Reference ring', '1.5 km around the site, 300 m gap']], 13)}
   <p style="font-size:13.5px;margin-top:8px">Jewar: conversion starts <b>${mon(PB.conversion_start_month)}</b>, plateaus <b>${mon(PB.plateau_month)}</b>, peaks at <b>${pc(PB.peak_frac, 1)}</b> in ${mon(PB.peak_month)}.</p>
  </div>
  <div class="card" style="padding:14px 18px">
   <h3>2 · Release-or-inspect rule</h3>
   <div style="display:grid;gap:5px;margin-top:8px;font-size:14px">
    <div>${mono('Cost(release) = p × E')}</div>
    <div>${mono('Cost(inspect) = I + p × E × (1 − c)')}</div>
    <div>${mono('Inspect when p &gt; I / (E × c)')} = 15,000 / (300,000 × 0.9) = <b style="color:var(--acc)">${dec.scenarios[0].break_even_p.toFixed(3)}</b></div>
   </div>
   <p class="small" style="margin-top:6px;font-size:13px">p = chance the report is optimistic · E = exposure ($300k) · I = inspection ($15k) · c = share of problems an inspection catches (0.9). All assumed.</p>
   ${T([['Gap: report − orbit', '46%'], ['p used']], [['up to 10 pts', '0.03'], ['10–20 pts', '0.03 → 0.15 (linear)'], ['20–30 pts', '0.15 → 0.40 (linear)'], ['30 pts and above', '0.40']], 13)}
   <p style="font-size:13.5px;margin-top:8px">Jewar, Jan 2025: 80% reported vs ${dec.satellite_observed_pct}% seen → gap <b>${dec.gap_pts} pts</b> → p = 0.375 → release $112,500 vs inspect $26,250 → <b style="color:var(--acc)">INSPECT</b>.</p>
  </div>
 </div>`) });

// 37 TRACK C METHOD
add({ so: "Track C is a counting method anyone can audit: per 1° square, what share of aircraft say their own position is untrustworthy. No black box is needed to see a jammer's footprint.", notes: 'Technical implementation of Track C in detail: what NIC is, every threshold, the algorithm in five steps, and the top hotspots from the one-day sample with the spoofing hint (GPS vs barometric altitude mismatch).', html: n => S(n, 'top', `${run('Technical deep-dive 3 · Track C method', 'Track C · Technical implementation & objectives · 10', n)}${jumps(n, [[13, 'GPS map'], [30, 'Track C explained']])}
 <h2>How the GPS-malfunction map is computed.</h2>
 <div style="display:grid;grid-template-columns:1fr 1.05fr;gap:20px;margin-top:16px;align-items:start">
  <div>
   <ol class="steps" style="--k:var(--acc)">
    <li style="font-size:14.5px"><b>Collect</b> ${fmt(gsum.reports)} ADS-B position reports (${gsum.snapshots} snapshots, ${gsum.days.join(', ')}); ADS-B version ≥ ${gsum.params.min_version} only.</li>
    <li style="font-size:14.5px"><b>Read NIC</b>, the integrity category (0–11) every aircraft broadcasts. NIC &lt; ${gsum.params.nic_bad_below} means the aircraft cannot vouch for its position to ~0.2 nm: <b>degraded</b>.</li>
    <li style="font-size:14.5px"><b>Grid</b> into ${gsum.params.cell_deg}° cells; count each aircraft once per cell; skip cells with fewer than ${gsum.params.min_aircraft} aircraft.</li>
    <li style="font-size:14.5px"><b>Rate</b>: degraded share ≤ ${pc(gsum.params.low_max)} low · ≤ ${pc(gsum.params.medium_max)} medium · above that <b>high</b>.</li>
    <li style="font-size:14.5px"><b>Spoofing hint</b>: GPS and barometric altitude differ by more than ${fmt(gsum.params.spoof_alt_gap_ft)} ft → flag.</li>
   </ol>
   <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px">
    ${[[gsum.cells_rated, 'cells rated'], [gsum.cells_high, 'rated high'], [gsum.cells_medium, 'rated medium']].map(([a, b]) => `<div class="card" style="padding:8px 12px"><div class="num" style="font-size:26px;color:var(--acc)">${a}</div><p class="small">${b}</p></div>`).join('')}
   </div>
  </div>
  <div>
   ${T([['Hotspot cell', '24%'], ['Aircraft'], ['Degraded'], ['Share'], ['Alt. mismatch']], gsum.hotspots.slice(0, 8).map(h => [`${h.lat}N ${h.lon}E`, h.aircraft, h.degraded, pc(h.share, 1), h.alt_mismatch_aircraft || '–']), 13)}
   <p class="small" style="margin-top:8px;font-size:13px">31–34N 70–72E: India–Pakistan border region. 13–17N 96–97E: Myanmar, where altitude mismatches point to spoofing rather than jamming. Jewar's 5 cells: ${fmt(gsum.jewar_region.aircraft_seen)} aircraft, <b>${gsum.jewar_region.status}</b>.</p>
   <div class="black" style="margin-top:10px;padding:10px 16px;font-size:13.5px;color:#DCE3E8"><b style="color:var(--mint)">Protective by construction:</b> the output is a share per square, never an aircraft identity, never a transmitter location.</div>
  </div>
 </div>`) });

// 38 B3 PHYSICS + SIMULATION
add({ so: "Every B3 number traces back to one physics input or one stated assumption; the simulation shows a receiver that also hears NavIC and a low-orbit layer can catch spoofing that GPS alone cannot.", notes: 'Track B3 in full detail: link budget arithmetic, jamming radius, constellation sizing and the spoofing simulation design (weighted least-squares positioning plus a logistic-regression detector on cross-constellation consistency, thresholded at 1% false alarms).', html: n => S(n, 'top', `${run('Technical deep-dive 4 · B3', 'Track B3 · Positioning & sensing', n)}${jumps(n, [[19, 'B3 numbers'], [31, 'B3 explained']])}
 <h2>B3: the physics and the simulation, worked out.</h2>
 <div style="display:grid;grid-template-columns:1fr 1fr 1.05fr;gap:14px;margin-top:16px;align-items:start">
  ${col('Link budget', 'var(--acc)', `<div style="font-size:13.5px;line-height:1.5;margin-top:6px">GPS L1 = 1,575.42 MHz; minimum received −128.5 dBm (IS-GPS-200)<br>Slant range at 10° elevation: GPS <b>${fmt(phys.signal.gps_slant_km_at_mask)} km</b>, LEO <b>${fmt(phys.signal.leo_slant_km_at_mask)} km</b><br>${mono('20·log10(24,713 / 2,762) ≈ 19 dB')}<br>LEO received ≈ <b>${phys.signal.leo_received_dbm} dBm</b> at equal transmit power</div>`)}
  ${col('Jamming reach + constellation', 'var(--acc)', `<div style="font-size:13.5px;line-height:1.5;margin-top:6px">Jammer 10 W, 0 dBi → EIRP <b>${phys.jamming.jammer_eirp_dbm} dBm</b>; receiver loses lock at J/S 30 dB<br>Denial radius: GPS <b>${phys.jamming.gps_denial_radius_km} km</b> → LEO <b>${phys.jamming.leo_denial_radius_km} km</b>; area ∝ r² → <b>${phys.jamming.denial_area_reduction_factor}× smaller</b></div><div style="font-size:13.5px;line-height:1.5;margin-top:8px;border-top:1px solid var(--line);padding-top:6px">1,000 km orbit, period ${phys.constellation.orbital_period_min} min, coverage half-angle ${phys.constellation.coverage_half_angle_deg}°, ${phys.constellation.surface_share_per_sat_pct}% of Earth per satellite → 4 in view needs <b>${phys.constellation.satellites_needed}</b></div>`)}
  ${col('Spoofing simulation', 'var(--acc)', `<div style="font-size:13.5px;line-height:1.5;margin-top:6px">Weighted least-squares fix each epoch: 8 GPS (σ 3 m), 6 NavIC (σ 4 m), 3 LEO (σ 1.5 m). Half the epochs spoofed by 10–150 m; every GPS range agrees with the false position, so classic RAIM cannot see it. Detector: logistic regression on cross-constellation consistency, threshold set for 1% false alarms. 4,000 train / 4,000 test epochs.</div>`)}
 </div>
 <div style="margin-top:12px">${T([['Receiver hears', '24%'], ['Spoofing detected'], ['False alarms'], ['Clean error'], ['Spoofed, trusted'], ['Spoofed, AI-corrected']], Object.entries(sim).map(([k, v]) => [k, pc(v.detection_rate, 1), pc(v.false_alarm_rate, 1), v.clean_median_error_m + ' m', v.spoofed_median_error_m_uncorrected + ' m', v.spoofed_median_error_m_ai_corrected + ' m']), 13.5)}</div>
 <div class="src">Physics: free-space, line of sight, equal transmit power (derived). Noise, geometry and spoof sizes assumed (simulated). Code: b3/physics.mjs, b3/simulate.mjs.</div>`) });

// 39 ARCHITECTURE + NEMOTRON INTEGRATION
add({ so: "The system is plain files and small scripts: each stage writes a JSON file the next one reads, so every number on every slide traces to the script and data that made it.", notes: 'Architecture in detail: data sources, the Node.js stages and their output files, how the site and this deck read those files, and how Nemotron is called (server-side proxy, key never in the browser, JSON extraction with retries, two passes).', html: n => S(n, 'top', `${run('Technical deep-dive 5 · architecture', 'Track A · Technical depth · 20 · Track C · Implementation · 10', n)}${jumps(n, [[32, 'Under the hood'], [33, 'Nemotron in full']])}
 <h2>System architecture, file by file.</h2>
 <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px">
  ${[['1 · Sources', ['Sentinel-2 L2A (Earth Search, cloud-optimised GeoTIFF)', 'ESA WorldCover 2021', 'ADS-B Exchange samples', 'CelesTrak orbital elements', 'OSM footprint, Esri Wayback']], ['2 · Pipelines (Node.js)', ['data/build_manifest.js', 'a6/progress.mjs, classify.mjs', 'a6/economics.mjs, readiness.mjs', 'c/fetch.mjs, analyze.mjs', 'b3/physics.mjs, simulate.mjs']], ['3 · Outputs', ['a6/outputs/progress_ai.csv', 'classifier_metrics.json, decision.json', 'readiness.json', 'c/outputs/gnss_summary.json', 'decisions/nemotron_*.json']], ['4 · Consumers', ['Live site (GitHub Pages)', 'This deck (build.mjs reads the same files)', 'Nemotron brief + fact-check', 'Lender, airline, DGCA views']]].map(([h, a], k) => `<div class="card" style="padding:12px 14px;${k === 3 ? 'background:var(--night);border-color:var(--night);color:#EEF2F5' : ''}"><h3 style="font-size:16px;${k === 3 ? 'color:var(--mint)' : ''}">${h}</h3><ul style="list-style:none;margin-top:6px;display:grid;gap:4px">${a.map(t => `<li style="font-size:12.5px;line-height:1.3;${k === 1 || k === 2 ? 'font-family:Consolas,monospace;font-size:11.5px' : ''}">${t}</li>`).join('')}</ul></div>`).join('')}
 </div>
 <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:16px;margin-top:14px;align-items:start">
  <div class="card" style="padding:12px 16px"><h3 style="font-size:16px">How Nemotron is called</h3>
   <ol class="steps" style="--k:var(--acc);margin-top:8px;gap:7px">
    <li style="font-size:13.5px">decisions/brief.mjs gathers Track C cells near Delhi and Jewar, A6 readiness, the lender check, reported costs and stated <b>limits</b> into one DATA object</li>
    <li style="font-size:13.5px">POST to a serverless proxy (/api/analyst); the NVIDIA key lives only on the server</li>
    <li style="font-size:13.5px">Pass 1 (${NB.model.replace('nvidia/', '')}) must answer in JSON; the script extracts the JSON and retries up to 3 times</li>
    <li style="font-size:13.5px">Pass 2 gets the brief + the same DATA and must list every unsupported claim with a fix</li>
   </ol></div>
  <div class="card" style="padding:12px 16px"><h3 style="font-size:16px">Engineering choices</h3>
   ${li(['<b>Read only the window</b>: HTTP range reads, never a full 110 km tile', '<b>Cached</b> training samples, so a rerun does not refetch', '<b>Deterministic</b>: fixed seed 42, versioned parameters in every output', '<b>Every number labelled</b> reported, derived, simulated or assumed in the JSON itself'])}</div>
 </div>`) });

// 40 FEASIBILITY: COST
const capS = phys.inputs.sat_cost_usd.v * phys.constellation.satellites_needed, capL = phys.inputs.sat_mass_kg.v * phys.inputs.launch_usd_per_kg.v * phys.constellation.satellites_needed;
add({ so: "The pilot costs almost nothing to run because the data is free and the software is small; only the long-term B3 layer needs real capital, and that is costed line by line.", notes: 'Practical feasibility, detailed: running cost of what exists today, and the B3 cost model with its arithmetic so judges can change any assumption.', html: n => S(n, 'top', `${run('Feasibility 1 · what it costs', 'Track A · Feasibility · 15 · Track C · Practical feasibility · 5', n)}${jumps(n, [[21, 'Feasibility'], [43, 'Sensitivity']])}
 <h2>What it costs to run, and to scale.</h2>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;align-items:start">
  <div>
   <h3 style="font-size:17px">Today and the pilot (A6 + Track C + Nemotron)</h3>
   <div style="margin-top:6px">${T([['Item', '26%'], ['Cost', '26%'], ['Basis']], [
     ['Satellite data', '₹0', 'Sentinel-2, WorldCover, Landsat: free and open'],
     ['Aircraft integrity', '₹0 sample; licensed feed for pilot', 'one free day used; continuous ADS-B is a commercial licence'],
     ['Compute', 'one laptop', 'full A6 rerun incl. Larper training ≈ 20–30 min'],
     ['Hosting', '₹0', 'GitHub Pages + one serverless function'],
     ['AI', 'a few calls per decision', 'Nemotron is an open model; can be self-hosted'],
     ['People (pilot)', '2 engineers × 3 months', 'assumed; read-only, no airline system changes'],
   ], 13)}</div>
  </div>
  <div>
   <h3 style="font-size:17px">B3 low-orbit layer (long term, assumed inputs)</h3>
   <div style="margin-top:6px">${T([['Line', '30%'], ['Arithmetic'], ['Result', '22%']], [
     ['Satellites', `${phys.constellation.satellites_needed} × $${phys.inputs.sat_cost_usd.v / 1e6}M`, `$${Math.round(capS / 1e6)}M`],
     ['Launch', `${phys.constellation.satellites_needed} × ${phys.inputs.sat_mass_kg.v} kg × $${fmt(phys.inputs.launch_usd_per_kg.v)}/kg`, `$${(capL / 1e6).toFixed(1)}M`],
     ['Capex', 'satellites + launch', `<b>$${(phys.cost.capex_usd / 1e6).toFixed(1)}M</b>`],
     ['Replacement', `capex ÷ ${phys.inputs.design_life_years.v}-year life`, `$${(phys.cost.capex_usd / phys.inputs.design_life_years.v / 1e6).toFixed(1)}M/yr`],
     ['Operations', 'ground segment', `$${phys.inputs.ops_usd_per_year.v / 1e6}M/yr`],
     ['Per year', 'replacement + operations', `<b>$${(phys.cost.per_year_usd / 1e6).toFixed(1)}M</b>`],
   ], 13)}</div>
   <div class="black" style="margin-top:10px;padding:10px 16px;font-size:13.5px;color:#DCE3E8"><b style="color:var(--mint)">Scale check:</b> one intercontinental diversion costs up to €77,200; B3's yearly cost is about a thousand of those, spread over every user of the layer. Not needed for the pilot.</div>
  </div>
 </div>`) });

// 41 FEASIBILITY: PILOT
add({ so: "The pilot is low-risk by design: three months, one airline, one hub, read-only, recommendations only. It ends with a clear go or no-go on measured numbers.", notes: 'Practical feasibility, detailed: the 12-week shadow pilot, what we need from the partner airline, the metrics and a go/no-go rule. Targets are our proposal, not results.', html: n => S(n, 'top', `${run('Feasibility 2 · the pilot', 'Track A · Feasibility · 15 · Track C · Practical feasibility · 5', n)}${jumps(n, [[22, 'Roadmap'], [42, 'Risks']])}
 <h2>A 12-week shadow pilot at Delhi.<span class="s">Read-only. FlyWithEase recommends, people decide, nothing in the airline changes.</span></h2>
 <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:20px;margin-top:14px;align-items:start">
  ${T([['Weeks', '12%'], ['What happens'], ['Output', '28%']], [
    ['1–2', 'Connect a continuous ADS-B integrity feed; daily Track C map for north India; Sentinel-2 refresh every 5 days for Delhi alternates (Jewar, Jaipur, Lucknow)', 'Daily GPS-health and alternate-readiness board'],
    ['3–4', 'Replay the airline\'s last 12 months of Delhi diversions against our data', 'Would we have warned earlier, and by how much?'],
    ['5–10', 'Live shadow mode: every GPS event gets a Nemotron brief + fact-check, logged next to what ops actually did', 'Side-by-side decision log'],
    ['11–12', 'Measure; review with ops and a DGCA observer', 'Go / no-go report'],
  ], 13.5)}
  <div class="grid" style="gap:10px">
   <div class="card" style="padding:12px 16px"><h3 style="font-size:16px">We need from the airline</h3>${li(['Diversion and holding log (read-only)', 'One ops-control contact', 'Agreement to compare, not to act'])}</div>
   <div class="card" style="padding:12px 16px"><h3 style="font-size:16px">Measured</h3>${li(['Minutes of warning gained before the first diversion', 'Share of diversions to a ready, clean-airspace alternate', 'Briefs passing fact-check without edits', 'Minutes from GPS event to confirmed rebooking'])}</div>
   <div class="black" style="padding:12px 16px;font-size:13.5px;color:#DCE3E8"><b style="color:var(--mint)">Go rule (proposed):</b> earlier warning than ops on most events, no unsafe recommendation, and ops say the brief saved time.</div>
  </div>
 </div>`) });

// 42 FEASIBILITY: RISK REGISTER
add({ so: "Every known way this could fail is listed with how likely it is, how bad it would be and what already limits it; nothing relies on the AI being right on its own.", notes: 'Practical feasibility, detailed: risk register across data, AI, operations, regulation and money, with likelihood, impact and mitigation. Ratings are our judgement.', html: n => S(n, 'top', `${run('Feasibility 3 · risk register', 'Track A · Feasibility · 15 · Track C · Practical feasibility · 5', n)}${jumps(n, [[10, 'Accuracy'], [21, 'Feasibility']])}
 <h2>Risk register: what could go wrong.</h2>
 <div style="margin-top:14px">${T([['Risk', '22%'], ['Likely', '8%'], ['Impact', '8%'], ['Mitigation already in place'], ['Residual', '17%']], [
   ['Larper over-calls built land', 'High', 'Med', `Progress uses converted land + NDVI baseline; vision audit; human spot-check (bare recall ${pc(cls('bare').recall)} stated)`, 'Low: two methods agree'],
   ['Clouds, monsoon gaps', 'High', 'Low', 'Months under 60% clear shown as gaps; monsoon excluded from baseline; 5-day revisit', '"Unknown", never "safe"'],
   ['NIC drop is not interference', 'Med', 'Med', 'Cell needs ≥ 10 aircraft; share threshold; altitude-mismatch check; multi-day trend in pilot', 'Low with a continuous feed'],
   ['Nemotron invents a fact', 'Med', 'High', `Grounded DATA only, JSON output, second-pass fact-check (found ${fc.issues.length} issues), human sign-off`, 'Low: AI never acts'],
   ['Orbit cannot see certification, ATC', 'Certain', 'High', 'Listed as an open check in every brief', 'Handled by a person'],
   ['Misuse for targeting (Track C rule)', 'Low', 'High', 'Only per-cell shares produced; no identities, no transmitter location', 'Rule met by design'],
   ['Airline integration effort', 'Med', 'Med', 'Shadow mode, read-only, no system changes', 'Low'],
   ['Data source discontinued', 'Low', 'Med', 'Sentinel-2C (in orbit since 2024) continues the series; Landsat as backup', 'Low'],
   ['B3 cost and timeline', 'High', 'Low for pilot', 'Long-term layer with partners; the pilot does not depend on it', 'Accepted'],
 ], 13)}</div>`) });

// 43 FEASIBILITY: SENSITIVITY GRID
const PS = [0.03, 0.05, 0.1, 0.2, 0.375, 0.5], IS = [5000, 15000, 30000, 60000, 100000], EX = dec.parameters.loss_if_optimistic.value, CE = dec.parameters.inspection_effectiveness.value;
add({ so: "The 'inspect' answer is not fragile: with orbit showing a 29-point gap, inspecting stays the cheaper choice even if an inspection costs several times our assumption.", notes: 'Feasibility and accuracy, detailed: sensitivity of the lender decision to the two numbers we assumed (inspection cost and the chance the report is optimistic). Each cell shows the better action and how much it saves.', html: n => S(n, 'top', `${run('Feasibility 4 · sensitivity', 'Track A · Feasibility, accuracy & applicability · 15', n)}${jumps(n, [[11, 'Lender case'], [36, 'Decision maths']])}${live(n, 'a6.html', 'Try the decision sliders')}
 <h2>Does the decision survive our assumptions?<span class="s">Better action and its expected saving. Exposure $${fmt(EX)}, inspection catches ${pc(CE)}.</span></h2>
 <table style="margin-top:14px"><thead><tr><th>Chance report is optimistic ↓ / Inspection cost →</th>${IS.map(i => `<th style="text-align:center">$${fmt(i)}</th>`).join('')}</tr></thead><tbody>
  ${PS.map(p => `<tr${p === 0.375 ? ' style="outline:2px solid var(--acc);outline-offset:-2px"' : ''}><td style="font-size:14px"><b>p = ${p}</b> <span class="small">${p === 0.1 ? '· no satellite (prior)' : p === 0.375 ? '· Jewar, 29-pt gap' : p === 0.03 ? '· orbit agrees with report' : ''}</span></td>${IS.map(I => { const rel = p * EX, ins = I + p * EX * (1 - CE), insp = ins < rel; return `<td style="text-align:center;padding:6px;${insp ? 'background:#EEF0FB' : ''}"><b style="font-family:var(--H);font-weight:600;font-size:14px;color:${insp ? 'var(--acc)' : 'var(--sub)'}">${insp ? 'INSPECT' : 'release'}</b><div class="small" style="font-size:12px">saves $${fmt(Math.round(Math.abs(rel - ins)))}</div></td>`; }).join('')}</tr>`).join('')}
 </tbody></table>
 <p style="font-size:14px;margin-top:10px">At p = 0.375 the break-even inspection cost is ${mono('0.375 × 300,000 × 0.9')} = <b>$${fmt(0.375 * EX * CE)}</b>, about ${Math.round(0.375 * EX * CE / 15000)}× our assumed $15,000.</p>`) });

// ---------- order slides by the marking scheme ----------
// Numbers are insertion order above; the deck is reordered so Track A (65 marks) comes first.
const TITLES = ['FlyWithEase', 'The problem', 'The basics', 'Who it serves', 'How it works', 'Track A6 objective', 'Data', 'Larper AI', 'Track A6 result', 'Accuracy', 'Case 1: Jewar lender', 'Working demo', 'Track C', 'Case 2: Delhi IGI spoofing', 'Case 3: Border jamming', 'Case 4: One passenger', 'Case 5: Tartu', 'Nemotron', 'Track B3', 'Originality', 'Feasibility', 'Roadmap', 'Marking map', 'Research findings', 'Boeing: the manufacturer view', 'Boeing fleet cases', 'Economic impact', 'Track A explained', 'Case 6: Boeing 787 diversion', 'Track C explained', 'Track B3 explained', 'Under the hood', 'Nemotron in full', 'Scorecard', 'Larper in detail', 'Progress + decision maths', 'Track C method', 'B3 physics + simulation', 'Architecture', 'Feasibility: cost', 'Feasibility: pilot', 'Feasibility: risks', 'Feasibility: sensitivity'];
const ORDER = [1, 23, 3, 2, 24, 25, 26, 27, 4, 16, 28, 6, 5, 7, 32, 39, 8, 35, 18, 33, 9, 10, 11, 36, 29, 12, 30, 13, 37, 14, 15, 17, 31, 19, 38, 20, 21, 40, 41, 42, 43, 34, 22];
const pos = o => ORDER.indexOf(o) + 1;
if (ORDER.length !== slides.length || new Set(ORDER).size !== slides.length) throw new Error('ORDER does not cover every slide');
const orig = slides.slice(); slides.length = 0; ORDER.forEach(o => slides.push({ ...orig[o - 1], title: TITLES[o - 1] }));

// ---------- write ----------
const TOTAL = slides.length;
const soBlock = t => `<div class="so"><b>What this means:</b> ${t}</div>`;
const render = () => slides.map((s, i) => { let h = s.html(i + 1).replace(/%TOTAL%/g, String(TOTAL)); if (s.so) { const k = h.lastIndexOf('</section>'); h = h.slice(0, k) + soBlock(s.so) + h.slice(k); } return h; });
WEB = false;
const fileSlides = render();
fs.writeFileSync(path.join(OUT, 'notes.json'), JSON.stringify(slides.map(s => s.notes), null, 1));
// meta.json: titles and clickable areas for pack.cjs (pptx slide-jump and web links)
fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ titles: slides.map(s => s.title), hot: slides.map((s, i) => HOT[i + 1] || []) }, null, 1));
for (const k in HOT) delete HOT[k];
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
.bar{position:fixed;left:0;bottom:0;height:3px;background:#8EE9D9;transition:width .3s}
.ctl{position:fixed;right:14px;bottom:12px;display:flex;gap:6px;font:600 13px system-ui;color:#9AA6B0;align-items:center}
.ctl button{background:#1E2230;color:#EEF2F5;border:1px solid #2A2F3D;border-radius:6px;padding:6px 10px;cursor:pointer;font:inherit}
.ctl button:focus-visible{outline:2px solid #8EE9D9}
.notes{position:fixed;left:14px;right:180px;bottom:12px;background:#1E2230ee;color:#EEF2F5;border:1px solid #2A2F3D;border-radius:8px;padding:10px 12px;font:15px/1.4 system-ui;display:none}
.notes.on{display:block}
.notes b{color:#8EE9D9;font-family:var(--H)}
.deck a[data-go]{cursor:pointer}.deck a.rub:hover{border-color:var(--k,#888);color:var(--ink)}
.deck .live:hover{background:var(--k,var(--ink));color:#fff}
.ov{position:fixed;inset:0;background:#0b0f13f2;color:#EEF2F5;display:none;overflow:auto;padding:28px 32px 70px;font:15px/1.4 'Source Sans 3',system-ui;z-index:5}
.ov.on{display:block}.ov h2{font:800 26px/1.1 Archivo,sans-serif;color:#fff;margin-bottom:4px}.ov p.t{color:#9AA6B0;margin-bottom:18px}
.ov .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
.ov .c{background:#1E2230;border:1px solid #2A2F3D;border-radius:10px;padding:12px 14px}
.ov .c h3{font:700 15px Archivo,sans-serif;display:flex;justify-content:space-between;gap:8px}.ov .c h3 span{font-family:B612,monospace}
.ov .c button{display:block;width:100%;text-align:left;background:none;border:0;color:#DCE3E8;font:inherit;padding:5px 0;cursor:pointer;border-top:1px solid #26313B}
.ov .c button:hover,.ov .c button:focus-visible{color:#fff;outline:none;text-decoration:underline}
.ov .c button i{font-style:normal;font-family:B612,monospace;color:#7E8A95;margin-right:8px}
.help{position:fixed;left:14px;bottom:14px;font:13px system-ui;color:#7E8A95}
.help kbd{background:#1E2230;border:1px solid #2A2F3D;border-radius:4px;padding:1px 5px;color:#C9D3DB}
input[type=range]{accent-color:#4338CA;width:100%}
</style></head><body>
<main class="stage" aria-roledescription="carousel" aria-label="FlyWithEase pitch deck"><div class="deck" id="deck">${webSlides.map((h, i) => h.replace('class="slide', `class="slide${i ? '' : ' on'}`)).join('')}</div></main>
<div class="bar" id="bar"></div><div class="notes" id="notes" aria-live="polite"></div>
<nav class="ctl" aria-label="Deck controls"><button id="prev" aria-label="Previous slide">‹</button><span id="idx">1 / ${TOTAL}</span><button id="next" aria-label="Next slide">›</button><button id="ob" aria-pressed="false" title="All slides by marking criterion (G)">Marking scheme</button><button id="nb" aria-pressed="false" title="Explain this slide (N)">Explain</button><a href="index.html" style="color:#9AA6B0;margin-left:6px">Site</a></nav>
<div class="help" id="help"><kbd>←</kbd> <kbd>→</kbd> move · <kbd>G</kbd> marking scheme · <kbd>N</kbd> explain · tap the pill at the top of any slide to see its criterion</div>
<section class="ov" id="ov" aria-label="Slides grouped by marking criterion"><h2>FlyWithEase, by marking criterion</h2><p class="t">Pick any slide. Track A (65 marks) first, then Track C (25), then presentation (10).</p><div class="g">${RUBRIC.map(([tr, c, crit, m, list]) => `<div class="c" style="border-top:3px solid ${c.replace('var(--a6)', '#8EE9D9').replace('var(--c)', '#8EE9D9').replace('var(--amber)', '#8EE9D9')}"><h3>${tr} · ${crit}<span>${m}</span></h3>${list.map(o => `<button data-go="${pos(o)}"><i>${String(pos(o)).padStart(2, '0')}</i>${TITLES[o - 1]}</button>`).join('')}</div>`).join('')}</div></section>
<script>
(function(){
 const NOTES=${JSON.stringify(slides.map(s => s.notes))};
 const SO=${JSON.stringify(slides.map(s => s.so || ''))};
 const deck=document.getElementById('deck'),S=[...deck.querySelectorAll('.slide')],bar=document.getElementById('bar'),idx=document.getElementById('idx'),nt=document.getElementById('notes'),nb=document.getElementById('nb');
 let i=Math.max(0,Math.min(S.length-1,(parseInt(location.hash.slice(1))||1)-1));
 function fit(){const s=Math.min(innerWidth/1280,(innerHeight-8)/720);deck.style.transform='translate(-50%,-50%) scale('+s+')';}
 function go(n){S[i].classList.remove('on');i=Math.max(0,Math.min(S.length-1,n));S[i].classList.add('on');idx.textContent=(i+1)+' / '+S.length;bar.style.width=((i+1)/S.length*100)+'%';nt.innerHTML='<b>Slide '+(i+1)+'.</b> '+NOTES[i].replace(/</g,'&lt;')+(SO[i]?'<br><b>In one line:</b> '+SO[i].replace(/</g,'&lt;'):'');history.replaceState(null,'','#'+(i+1));}
 const ov=document.getElementById('ov'),ob=document.getElementById('ob');
 function ovt(on){ov.classList.toggle('on',on);ob.setAttribute('aria-pressed',on);if(on){const b=ov.querySelector('button');b&&b.focus();}}
 ob.onclick=()=>ovt(!ov.classList.contains('on'));
 document.addEventListener('click',e=>{const a=e.target.closest('[data-go]');if(!a)return;e.preventDefault();ovt(false);go(parseInt(a.dataset.go)-1);});
 addEventListener('hashchange',()=>{const k=parseInt(location.hash.slice(1));if(k&&k-1!==i)go(k-1);});
 setTimeout(()=>{const h=document.getElementById('help');if(h)h.style.display='none';},9000);
 const cP=document.getElementById('cP'),cI=document.getElementById('cI'),cO=document.getElementById('cOut');
 if(cP){const E=300000,C=0.9,f=v=>'$'+Math.round(v).toLocaleString('en-US');const u=()=>{const p=+cP.value,I=+cI.value,r=p*E,s=I+p*E*(1-C),be=I/(E*C);cO.innerHTML='P = '+p.toFixed(2)+', inspection '+f(I)+': release '+f(r)+' vs inspect '+f(s)+' → <span style="color:'+(s<r?'#4338CA':'#1E8A4C')+'">'+(s<r?'INSPECT':'RELEASE')+'</span> · break-even '+be.toFixed(3);};cP.oninput=u;cI.oninput=u;u();
  [cP,cI].forEach(el=>el.addEventListener('keydown',e=>e.stopPropagation()));cP.closest('.calc').addEventListener('wheel',e=>e.stopPropagation(),{passive:true});}
 addEventListener('resize',fit);fit();go(i);
 addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(i+1)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(i-1)}else if(e.key==='Home')go(0);else if(e.key==='End')go(S.length-1);else if(e.key==='n'){nb.click()}else if(e.key==='g'){ob.click()}else if(e.key==='Escape'){ovt(false)}});
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
