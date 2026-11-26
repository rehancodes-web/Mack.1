// Generates the dedicated judging pages from repo data: docs/tech.html, ai.html, feasibility.html, scorecard.html.
// Uses docs/site.css (navigation-display theme). Usage: node site_pages.mjs && node site_nav.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const rd = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const met = rd('a6/outputs/classifier_metrics.json'), dec = rd('a6/outputs/decision.json'), rdy = rd('a6/outputs/readiness.json');
const phys = rd('b3/outputs/b3_physics.json'), sim = rd('b3/outputs/b3_sim.json').results, gs = rd('c/outputs/gnss_summary.json');
const ND = rd('decisions/nemotron_decisions.json'), NB = rd('decisions/nemotron_brief.json'), NR = rd('a6/outputs/nemotron_review.json');
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = n => Number(n).toLocaleString('en-US');
const pc = (x, d = 0) => `${(x * 100).toFixed(d)}%`;
const mon = m => new Date(`${m}-15T00:00:00Z`).toLocaleString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

const head = (title, desc, cur) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${esc(desc)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='none' stroke='%23e05fd0' stroke-width='2.4'/%3E%3Ccircle cx='12' cy='12' r='3' fill='%23f2a93b'/%3E%3C/svg%3E">
<link rel="stylesheet" href="site.css">
<style>.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}.box{background:var(--panel-2);border:1px solid var(--rule);border-radius:var(--r-m);padding:18px 20px}.box h3{margin-bottom:8px}.box ul{margin:0;padding-left:18px}.box li{margin:5px 0}.quote{border-left:3px solid var(--route);padding:8px 14px;background:var(--panel-2);border-radius:0 var(--r-m) var(--r-m) 0;margin:10px 0;font-size:15.5px}.tag{font-family:var(--head);font-size:12px;color:var(--dim)}@media(max-width:860px){.grid3,.grid2{grid-template-columns:1fr}}</style>
</head><body>
<header class="top"><div class="wrap"><a class="brand" href="index.html"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#e05fd0" stroke-width="2.4"/><circle cx="12" cy="12" r="3" fill="#f2a93b"/></svg>NavContinuity</a>
<nav class="mods" aria-label="Sections"><a href="index.html">Overview</a></nav></div></header>
<main class="page">`;
const foot = `</main><footer><div class="wrap">Mach-A-Thon Aeromania '26 · numbers generated from the repository outputs by site_pages.mjs · labels: reported, derived, simulated, assumed. Code: <a href="https://github.com/rehancodes-web/Mack.1">github.com/rehancodes-web/Mack.1</a></div></footer></body></html>`;

// ---------------- TECH ----------------
const tech = head('Technology', 'Data, pipeline and the Larper model behind NavContinuity.', 'tech.html') + `
<h1>Technology</h1>
<p class="lead">Seven free satellite and aviation datasets, a Node.js pipeline that reads only the pixels it needs, and Larper, a Random Forest that labels every 10 m of the airport. Rubric: <b>Track A · Technical depth, AI &amp; satellite data (20)</b>.</p>

<h2>Data</h2>
<table><thead><tr><th>Dataset</th><th>Resolution</th><th>Volume</th><th>Role</th></tr></thead><tbody>
<tr><td><b>Sentinel-2 L2A</b> (ESA Copernicus, via Element 84 Earth Search)</td><td>10 m</td><td>79 monthly scenes, Jan 2020 – Nov 2026</td><td>The measurement; Larper's inputs</td></tr>
<tr><td><b>ESA WorldCover 2021</b></td><td>10 m</td><td>${fmt(met.n_train + met.n_test)} labelled pixels</td><td>Training labels, only from land around the airport</td></tr>
<tr><td><b>Esri World Imagery Wayback</b> (Maxar, Earthstar)</td><td>~2 m</td><td>13 dated versions over Jewar</td><td>Human-readable before/after; visual check</td></tr>
<tr><td><b>OpenStreetMap</b></td><td>vector</td><td>1 polygon, 1,333 ha</td><td>Airport boundary for every measurement</td></tr>
<tr><td><b>ADS-B Exchange</b> (aircraft NIC)</td><td>1° cells</td><td>${fmt(gs.reports)} reports, ${gs.snapshots} snapshots</td><td>Track C GPS malfunction map</td></tr>
<tr><td><b>CelesTrak</b> orbital elements</td><td>per satellite</td><td>GPS, Galileo, NavIC, Iridium, Xona</td><td>3D globe, Track B3 geometry</td></tr>
<tr><td><b>Landsat GLS</b> (NASA/USGS)</td><td>30 m</td><td>1975–2010</td><td>Historic before images on the globe</td></tr>
</tbody></table>

<h2>Pipeline</h2>
<ol class="plan">
<li><span class="leg">1</span><span class="what c-data">Fetch</span><span>Read only the airport window from cloud-optimised GeoTIFFs; per-month scene manifest with direct band URLs.</span><span class="trk c-dim">data/build_manifest.js</span></li>
<li><span class="leg">2</span><span class="what c-data">Clean</span><span>Per-scene scale and offset (checked against raw pixel values), cloud and shadow masking from the scene classification layer; cloudy months become gaps.</span><span class="trk c-dim">a6/progress.mjs</span></li>
<li><span class="leg">3</span><span class="what c-route">Features</span><span>6 bands + NDVI, NDBI, water index, bare-soil index: 10 features per 10 m pixel.</span><span class="trk c-dim">a6/classify.mjs</span></li>
<li><span class="leg">4</span><span class="what c-route">Classify</span><span>Larper Random Forest: built/paved, bare, vegetation, water, every month.</span><span class="trk c-dim">a6/classify.mjs</span></li>
<li><span class="leg">5</span><span class="what c-normal">Decide</span><span>12-month median of converted land vs reported milestones → release-or-inspect decision; Nemotron brief.</span><span class="trk c-dim">a6/economics.mjs</span></li>
</ol>

<h2>Larper model card</h2>
<div class="grid2">
<div class="box"><h3>Set-up</h3><ul>
<li>Random Forest, ${met.params.rf.nEstimators} trees, max depth ${met.params.rf.treeOptions.maxDepth}, ${Math.round(met.params.rf.maxFeatures * 100)}% features per split</li>
<li>Labels: ${esc(met.params.label_source)}</li>
<li>Training scenes: ${met.params.train_months.join(', ')} (three seasons, same year as labels)</li>
<li>Split: ${esc(met.split)}</li>
<li>${fmt(met.n_train)} training pixels, ${fmt(met.n_test)} test pixels</li>
</ul></div>
<div class="box"><h3>Results on unseen land</h3>
<table><thead><tr><th>Class</th><th>Pixels</th><th>Recall</th><th>Precision</th></tr></thead><tbody>
${met.per_class.map(c => `<tr><td>${c.class.replace('_', ' / ')}</td><td>${fmt(c.support)}</td><td>${pc(c.recall)}</td><td>${pc(c.precision)}</td></tr>`).join('')}
</tbody></table><p class="note">Overall agreement with WorldCover: <b>${pc(met.overall_accuracy)}</b>. ${esc(met.label_caveat)}</p></div>
</div>

<h2>Stack and engineering</h2>
<div class="grid3">
<div class="box"><h3>Stack</h3><ul><li>Node.js only (geotiff.js, proj4, ml-random-forest, pngjs)</li><li>Static site on GitHub Pages</li><li>NVIDIA Nemotron via API (key server-side only)</li></ul></div>
<div class="box"><h3>Problems solved</h3><ul><li>+1,000 DN offset differs between collections</li><li>8-month catalogue hole, filled from a second catalogue</li><li>Large window reads throttled; bands read one at a time with retries</li></ul></div>
<div class="box"><h3>Reproduce</h3><ul><li><code>node data/build_manifest.js</code></li><li><code>cd a6 && node progress.mjs && node classify.mjs</code></li><li><code>node economics.mjs && node demo.mjs && node publish.mjs</code></li></ul></div>
</div>` + foot;

// ---------------- AI ----------------
const b = NB.brief || {}, f = NB.fact_check || { issues: [] };
const ai = head('AI and Nemotron', 'Where NVIDIA Nemotron and the Larper model work inside NavContinuity, with real outputs.', 'ai.html') + `
<h1>AI and NVIDIA Nemotron</h1>
<p class="lead">Two kinds of AI: <b>Larper</b> measures the ground from satellite pixels; <b>NVIDIA Nemotron</b> reasons over those measurements and the GPS map to make decisions, then checks its own work. Every output on this page is real and saved in the repository.</p>

<h2>Where AI sits in the system</h2>
<table><thead><tr><th>Job</th><th>Model</th><th>Input</th><th>Output</th></tr></thead><tbody>
<tr><td><b>Measure the airport</b></td><td>Larper (Random Forest)</td><td>79 Sentinel-2 scenes</td><td>Built / bare / vegetation / water per 10 m pixel, monthly</td></tr>
<tr><td><b>Vision audit</b></td><td>${esc(NR.vision?.[0]?.model || 'nemotron super-vl')}</td><td>Larper map + satellite photo, ${NR.vision.length} months</td><td>What Larper got right and wrong, trust level</td></tr>
<tr><td><b>Readiness brief</b></td><td>${esc(NB.model)}</td><td>Track C cells around Delhi and Jewar + A6 readiness</td><td>Diversion decision with actions per team</td></tr>
<tr><td><b>Fact-checker</b></td><td>${esc(NB.model)}</td><td>The brief + the same data</td><td>Verdict, issues, fixes</td></tr>
<tr><td><b>Ops decisions</b></td><td>${esc(ND.model)}</td><td>Four real GPS-failure cases</td><td>Turnaround impact, options, decision, fix (human-checked)</td></tr>
<tr><td><b>Analyst on site</b></td><td>${esc(ND.model)}</td><td>Page evidence, sliders, images</td><td>Lender memos, "what changed here?"</td></tr>
</tbody></table>

<h2>Two-pass readiness brief: Delhi GPS spoofing scenario</h2>
<div class="grid2">
<div class="box"><span class="tag">Pass 1 · Nemotron writes the brief</span>
<h3 style="margin-top:6px">Jewar: <span class="c-caution">${esc(b.jewar_readiness?.verdict || '')}</span></h3>
<p>${esc(b.jewar_readiness?.why)}</p><p><b>GPS environment:</b> ${esc(b.gps_environment)}</p>
<ul>${Object.entries(b.actions || {}).map(([k, v]) => `<li><b>${esc(k.replace(/_/g, ' '))}:</b> ${esc([].concat(v).join('; '))}</li>`).join('')}</ul>
<p class="note"><b>Unknowns it named:</b> ${esc((b.unknowns || []).join(' · '))} · confidence ${esc(b.confidence)}</p></div>
<div class="box"><span class="tag">Pass 2 · Nemotron fact-checks it against the data</span>
<h3 style="margin-top:6px">Verdict: <span class="c-route">${esc((f.verdict || '').replace(/_/g, ' '))}</span></h3>
${(f.issues || []).map(i => `<div class="quote"><b>Claim:</b> ${esc(i.claim)}<br><b>Problem:</b> ${esc(i.problem)}<br><span class="c-route"><b>Fix:</b> ${esc(i.fix)}</span></div>`).join('')}
</div></div>

<h2>Vision audit of Larper</h2>
<div class="grid2">${NR.vision.map(v => `<div class="box"><span class="tag">${mon(v.month)} · ${esc(v.model)}</span><p style="white-space:pre-line;margin-top:6px">${esc(v.finding)}</p></div>`).join('')}</div>

<h2>Guardrails</h2>
<div class="grid3">
<div class="box"><h3>Grounded</h3><p>Nemotron answers only from supplied data, in structured JSON, with named unknowns.</p></div>
<div class="box"><h3>Self-checked</h3><p>A second Nemotron pass flags invented numbers and overstated certainty before a person sees the brief.</p></div>
<div class="box"><h3>Human sign-off</h3><p>Every case is checked by the team; Nemotron was corrected on Delhi (ILS was available). See <a href="passengers.html">Passenger impact</a>.</p></div>
</div>` + foot;

// ---------------- FEASIBILITY ----------------
const feas = head('Feasibility', 'What runs today, assumptions, constraints, risks and the pilot path.', 'feasibility.html') + `
<h1>Feasibility</h1>
<p class="lead">What runs today, what a pilot needs, and every assumption and constraint stated plainly. Rubric: <b>Track A · Feasibility, accuracy &amp; applicability (15)</b> and <b>Track B/C · Practical feasibility (5)</b>.</p>
<div class="stat">
<div><b class="c-normal">₹0</b><span>data cost: every source is free and public</span></div>
<div><b>1 laptop</b><span>runs the full pipeline; static hosting</span></div>
<div><b>79</b><span>real Sentinel-2 scenes processed end to end</span></div>
<div><b class="c-caution">3 months</b><span>to a shadow pilot with one airline</span></div>
</div>
<h2>Runs today, assumes, is limited by</h2>
<div class="grid3">
<div class="box"><h3 class="c-normal">Runs today</h3><ul><li>Sentinel-2 pipeline over 79 months</li><li>Larper trained and tested on unseen land</li><li>GPS malfunction map from ${fmt(gs.reports)} aircraft reports</li><li>Nemotron two-pass readiness brief</li><li>Live site with interactive decision sliders</li></ul></div>
<div class="box"><h3 class="c-caution">Assumptions</h3><ul><li>Inspection $15k, exposure $300k, 90% catch rate</li><li>Land conversion tracks real construction progress</li><li>Low NIC values mostly mean interference</li><li>B3 satellites ~$3M each</li></ul></div>
<div class="box"><h3 style="color:var(--warn)">Constraints</h3><ul><li>Sentinel-2 every 5 days; monsoon clouds</li><li>One day of ADS-B data so far</li><li>Satellites cannot confirm runway certification, ATC or slots</li><li>Rebooking needs airline systems</li></ul></div>
</div>
<h2>Decision sensitivity</h2>
<table><thead><tr><th>Evidence</th><th>P(report optimistic)</th><th>Cost if release</th><th>Cost if inspect</th><th>Decision</th></tr></thead><tbody>
${dec.scenarios.map(s => `<tr><td>${esc(s.name)}</td><td>${s.p.toFixed(2)}</td><td>$${fmt(Math.round(s.release))}</td><td>$${fmt(Math.round(s.inspect))}</td><td><b>${s.action.toUpperCase()}</b></td></tr>`).join('')}
</tbody></table>
<p class="note">Inspect whenever the probability exceeds <b>${dec.scenarios[0].break_even_p.toFixed(3)}</b>. Try other inputs with the sliders on the <a href="a6.html">Jewar page</a>.</p>
<h2>Risks and mitigations</h2>
<table><thead><tr><th>Risk</th><th>Mitigation</th></tr></thead><tbody>
<tr><td>Larper misreads bare soil (${pc(met.per_class.find(c => c.class === 'bare').recall)} recall)</td><td>Decision also uses the NDVI baseline; Nemotron vision audit; human spot-check page</td></tr>
<tr><td>AI gives a wrong operational answer</td><td>Second Nemotron pass fact-checks; a person approves every action</td></tr>
<tr><td>Data gaps (clouds, sparse aircraft)</td><td>Shown as gaps; "unknown" never reads as "safe"</td></tr>
<tr><td>Airline integration effort</td><td>Start read-only in shadow mode; recommend, never act</td></tr>
<tr><td>B3 cost (~$${Math.round(phys.cost.capex_usd / 1e6)}M)</td><td>Long-term layer with partners; not needed for the pilot</td></tr>
</tbody></table>
<h2>Pilot path</h2>
<ol class="plan">
<li><span class="leg">0</span><span class="what c-normal">Now</span><span>Working prototype on real data; live site.</span><span class="trk c-dim">done</span></li>
<li><span class="leg">3</span><span class="what c-caution">3 months</span><span>Shadow pilot, one airline at Delhi; daily GPS-integrity feed; measure time to confirmed rebooking.</span><span class="trk c-dim">months</span></li>
<li><span class="leg">6</span><span class="what c-route">6 months</span><span>More hubs; satellite GNSS as a second source; passenger recovery flow.</span><span class="trk c-dim">months</span></li>
<li><span class="leg">12</span><span class="what">12 months</span><span>Regulator dashboard (DGCA, AAI); B3 layer with partners.</span><span class="trk c-dim">months</span></li>
</ol>` + foot;

// ---------------- SCORECARD ----------------
const R = [
  ['Track A · Primary problem', 65, [
    ['Problem understanding and economic impact', 20, 'Clear problem, users, economic value', '2,354 incidents; four users with decisions and costs; €1,000–77,200 per diversion; $15k vs $112k lender case', 'index.html', 'passengers.html'],
    ['Technical depth, AI and satellite data', 20, 'Appropriate data, AI approach, implementation', '79 Sentinel-2 scenes, WorldCover labels, Wayback; Larper Random Forest; Nemotron reasoning layer', 'tech.html', 'ai.html'],
    ['Feasibility, accuracy and applicability', 15, 'Reliable results, real-world usefulness', `Per-class metrics on unseen land (${pc(met.overall_accuracy)}); two methods agree; decision with break-even`, 'feasibility.html', 'a6.html'],
    ['Working demo and objective completion', 10, 'Functional demo for the selected objective', 'Objective 6 delivered: live Jewar monitor with before/after, curves and decision sliders', 'a6.html', 'deck.html'],
  ]],
  ['Track C · Additional problem', 25, [
    ['Innovation and economic/strategic impact', 10, 'Value and originality', 'Only system linking GPS failure, verified diversion capacity and passenger recovery; self-checking AI', 'index.html', 'ai.html'],
    ['Technical depth and objective completion', 10, 'Technical justification, required objectives', `GNSS resilience: ${fmt(gs.reports)} aircraft reports, ${gs.cells_high} high zones; protects infrastructure; protective only`, 'c.html', 'globe.html'],
    ['Practical feasibility', 5, 'Realistic implementation, assumptions, constraints', 'Free data; shadow pilot path; constraints listed', 'feasibility.html', 'c.html'],
  ]],
  ['Overall presentation', 10, [
    ['Clarity and structure', 3, 'Clear, organised explanation', '16-slide deck mapped to this rubric; every slide names its criterion', 'deck.html', 'index.html'],
    ['Logical flow', 3, 'Coherent presentation of both problems', 'One chain: C detects → A6 absorbs → B3 hardens → passengers recover', 'index.html', 'deck.html'],
    ['Explanation and justification of results', 2, 'Explain outcomes, support conclusions', 'Every number labelled reported / derived / simulated / assumed; limits stated', 'feasibility.html', 'tech.html'],
    ['Effective use of time', 2, 'Within five minutes', 'Speaker notes timed to 5:00 (press N in the deck)', 'deck.html', 'deck.html'],
  ]],
];
const card = { 'index.html': 'Overview', 'passengers.html': 'Passengers', 'tech.html': 'Technology', 'ai.html': 'AI', 'feasibility.html': 'Feasibility', 'a6.html': 'Jewar (A6)', 'deck.html': 'Deck', 'c.html': 'GPS map (C)', 'globe.html': 'Globe (B3)' };
const score = head('Scorecard', 'How NavContinuity addresses each line of the Mach-A-Thon marking scheme.', 'scorecard.html') + `
<h1>Scorecard</h1>
<p class="lead">Each line of the judges' marking scheme, what they look for, and where we show it. Judging priority: Track A quality first.</p>
${R.map(([sec, marks, rows]) => `<h2>${sec} <span class="tag">${marks} marks</span></h2>
<table><thead><tr><th style="width:24%">Criterion</th><th style="width:6%">Marks</th><th style="width:20%">Judges look for</th><th>Our evidence</th><th style="width:16%">See</th></tr></thead><tbody>
${rows.map(([c, m, l, e, a, b2]) => `<tr><td><b>${c}</b></td><td>${m}</td><td class="note">${l}</td><td>${e}</td><td><a href="${a}">${card[a]}</a>${a !== b2 ? ` · <a href="${b2}">${card[b2]}</a>` : ''}</td></tr>`).join('')}
</tbody></table>`).join('')}
<p class="note">Track C protective rule observed: areas only, no weapons, targeting or tracking of individual people. Organisers asked for one additional track; Track C is ours, with B3 shown as the long-term layer.</p>` + foot;

for (const [n, h] of [['tech.html', tech], ['ai.html', ai], ['feasibility.html', feas], ['scorecard.html', score]]) fs.writeFileSync(path.join(ROOT, 'docs', n), h);
console.log('wrote docs/tech.html, ai.html, feasibility.html, scorecard.html');
