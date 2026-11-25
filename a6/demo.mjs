// Builds outputs/demo.html: the A6 demo page (served by Vercel from docs/ after `node publish.mjs`).
// Inputs: progress_baseline.json, decision.json, readiness.json, quicklook_*.png and, when Larper has run,
// progress_ai.json, classifier_metrics.json, classmap_*.png, nemotron_review.json. Missing Larper outputs are shown as "running".
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULTS } from './economics.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs');
const has = f => fs.existsSync(path.join(OUT, f));
const rd = f => JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));
const opt = f => (has(f) ? rd(f) : null);
const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
const pct = v => (v == null ? '–' : `${Math.round(v * 100)}%`);

const base = rd('progress_baseline.json').results;
const dec = rd('decision.json');
const rdy = opt('readiness.json');
const aiJ = opt('progress_ai.json'), ai = aiJ ? aiJ.results : [];
const met = opt('classifier_metrics.json');
const rev = opt('nemotron_review.json');
const AI_ENDPOINT = process.env.AI_ENDPOINT ?? '/api/analyst';
const P0 = DEFAULTS;

const SHOTS = ['2020-03', '2022-05', '2024-03', '2025-01', '2026-03'].filter(m => has(`quicklook_${m}.png`));
const MAPS = ['2020-03', '2022-05', '2024-03', '2026-03'].filter(m => has(`classmap_${m}.png`));
const monthName = m => new Date(`${m}-15T00:00:00Z`).toLocaleString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const aiAt = m => ai.find(r => r.month === m);
const jan25 = aiAt('2025-01');

// ---------- AI context (labelled; the analyst may use nothing else) ----------
const CTX = {
  asset: 'Noida International Airport (Jewar), footprint ~1333 ha, Sentinel-2 2020-2026',
  reported: [['2021-11-25', 'Foundation stone'], ['2025-01-28', '"80% work complete"'], ['2026-03-28', 'Phase 1 inaugurated']],
  derived_baseline_cleared_12m: base.filter(r => r.fp_cleared_12m != null && /-(01|04|07|10)$/.test(r.month)).map(r => [r.month, r.fp_cleared_12m]),
  derived_larper_all: ai.filter(r => r.built_paved_frac != null).map(r => [r.month, r.built_paved_frac, r.bare_frac, r.vegetation_frac]),
  larper_metrics: met ? { overall_agreement_with_worldcover: met.overall_accuracy, per_class: met.per_class, caveat: met.label_caveat } : 'Larper still running',
  decision: { report_pct: dec.report.reported_pct, satellite_pct: dec.satellite_observed_pct, gap_pts: dec.gap_pts, scenarios: dec.scenarios, assumed_parameters: dec.parameters, caveat: dec.caveat },
  readiness: rdy,
  nemotron_review: rev ? { curve: rev.curve?.finding, vision: rev.vision.map(v => [v.month, v.finding]) } : null,
  product: 'NavContinuity: GPS failure -> diversion capacity -> confirmed passenger recovery. A6 output = recovery capacity + region for Track C GNSS check.',
};

// ---------- chart (direct labels, no legend) ----------
const W = 960, H = 360, L = 44, R = 150, T = 18, B = 40;
const t0 = Date.UTC(2020, 0, 1), t1 = Date.UTC(2026, 11, 31);
const X = d => L + (Date.parse(d) - t0) / (t1 - t0) * (W - L - R), Y = v => T + (1 - v) * (H - T - B);
const line = (rows, key) => { let d = '', pen = false; for (const r of rows) { const v = r[key]; if (v == null) { pen = false; continue; } d += `${pen ? 'L' : 'M'}${X(r.date).toFixed(1)},${Y(v).toFixed(1)}`; pen = true; } return d; };
const lastOf = (rows, key) => [...rows].reverse().find(r => r[key] != null);
let grid = '';
for (const v of [0, 0.25, 0.5, 0.75, 1]) grid += `<line class="g" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${L - 8}" y="${Y(v) + 4}" text-anchor="end">${v * 100}%</text>`;
for (let y = 2020; y <= 2026; y++) grid += `<text class="ax" x="${X(`${y}-07-01`)}" y="${H - B + 22}" text-anchor="middle">${y}</text>`;
const gaps = base.filter(r => r.gap).map(r => `<rect class="gap" x="${X(r.date) - 3}" y="${T}" width="6" height="${H - T - B}"><title>${r.month}: cloud gap</title></rect>`).join('');
const endLabel = (rows, key, cls, text) => { const r = lastOf(rows, key); return r ? `<text class="el ${cls}" x="${X(r.date) + 8}" y="${Y(r[key]) + 4}">${text} ${pct(r[key])}</text>` : ''; };
const claimX = X('2025-01-28'), claimY = Y(0.8), obsY = Y(dec.satellite_observed_pct / 100);
const chart = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="chartTitle chartDesc">
<title id="chartTitle">Construction progress at Jewar airport, 2020 to 2026</title>
<desc id="chartDesc">Land cleared all year (NDVI baseline)${ai.length ? ' and Larper built or paved share' : ''}, with the reported 80% claim in January 2025.</desc>
${grid}${gaps}
<path class="ln base" d="${line(base, 'fp_cleared_12m')}"/>
${ai.length ? `<path class="ln larper" d="${line(ai, 'built_paved_frac')}"/>` : ''}
${endLabel(base, 'fp_cleared_12m', 'base', 'Cleared land')}
${ai.length ? endLabel(ai, 'built_paved_frac', 'larper', 'Larper: built') : ''}
<line class="gapline" x1="${claimX}" x2="${claimX}" y1="${claimY}" y2="${obsY}"/>
<circle class="claim" cx="${claimX}" cy="${claimY}" r="6"/><text class="el claimt" x="${claimX - 10}" y="${claimY - 12}" text-anchor="end">Reported: 80% complete</text>
<circle class="obs" cx="${claimX}" cy="${obsY}" r="5"/><text class="el base" x="${claimX + 10}" y="${obsY + 18}">Seen from orbit: ${dec.satellite_observed_pct}%</text>
</svg>`;

// ---------- pieces ----------
const swipe = SHOTS.length >= 2 ? `
<div class="swipe" id="swipe" style="--pos:50%">
  <img id="imgB" src="quicklook_${SHOTS[SHOTS.length - 1]}.png" alt="Sentinel-2 image of the site, ${monthName(SHOTS[SHOTS.length - 1])}">
  <div class="clip"><img id="imgA" src="quicklook_${SHOTS[0]}.png" alt="Sentinel-2 image of the site, ${monthName(SHOTS[0])}"></div>
  <div class="handle" aria-hidden="true"></div>
  <span class="tag left" id="tagA">${monthName(SHOTS[0])}</span><span class="tag right" id="tagB">${monthName(SHOTS[SHOTS.length - 1])}</span>
  <input type="range" id="swipeR" min="0" max="100" value="50" aria-label="Drag to compare the two dates">
</div>
<div class="pick" role="group" aria-label="Choose dates to compare">
  <label>Before <select id="selA">${SHOTS.map((m, i) => `<option value="${m}"${i === 0 ? ' selected' : ''}>${monthName(m)}</option>`).join('')}</select></label>
  <label>After <select id="selB">${SHOTS.map((m, i) => `<option value="${m}"${i === SHOTS.length - 1 ? ' selected' : ''}>${monthName(m)}</option>`).join('')}</select></label>
  <span class="note">Yellow line: airport boundary (OpenStreetMap). Sentinel-2, 10 m pixels.</span>
</div>` : '';

const larperBlock = met ? `
<p>Larper is a Random Forest that labels every 10 m square as built or paved, bare earth, vegetation or water. It learned from ESA WorldCover 2021 on land <em>around</em> the airport, then was tested on a separate block of land it never saw.</p>
<div class="figs">
  <div><b>${Math.round(met.overall_accuracy * 100)}%</b><span>agreement with WorldCover on unseen land</span></div>
  <div><b>${met.n_test.toLocaleString('en-US')}</b><span>test pixels</span></div>
  ${jan25 ? `<div><b>${pct(jan25.built_paved_frac)}</b><span>built or paved, Jan 2025</span></div>` : ''}
</div>
<table class="tbl"><caption>How Larper does per class on unseen land</caption><tr><th scope="col">Class</th><th scope="col">Test pixels</th><th scope="col">Found (recall)</th><th scope="col">Right when it says so (precision)</th></tr>
${met.per_class.map(c => `<tr><td>${c.class.replace('_', ' / ')}</td><td>${c.support.toLocaleString('en-US')}</td><td>${pct(c.recall)}</td><td>${pct(c.precision)}</td></tr>`).join('')}</table>
<p class="note">WorldCover is itself a model product, so this is agreement with it, not ground truth. Bare earth had few training examples, so Larper finds it less reliably.</p>
${MAPS.length ? `<div class="maps">${MAPS.map(m => `<figure><img src="classmap_${m}.png" alt="Larper class map, ${monthName(m)}"><figcaption>${monthName(m)}</figcaption></figure>`).join('')}</div>
<p class="note legend"><i style="--c:#dc3c3c"></i>built or paved <i style="--c:#e6c878"></i>bare <i style="--c:#3c8c3c"></i>vegetation <i style="--c:#3c78dc"></i>water</p>` : ''}`
  : `<p class="pending">Larper is still training on this run. Its curve, accuracy and maps appear here when it finishes.</p>`;

const reviewBlock = rev && (rev.curve?.finding || rev.vision.some(v => v.finding)) ? `
<p class="note">${esc(rev.caveat)}</p>
${rev.curve?.finding ? `<div class="ai-out"><h4>Larper vs the baseline curve</h4><div>${esc(rev.curve.finding)}</div></div>` : ''}
${rev.vision.filter(v => v.finding).map(v => `<div class="ai-out"><h4>Map check, ${monthName(v.month)}</h4><div>${esc(v.finding)}</div></div>`).join('')}`
  : `<p class="pending">Nemotron reviews Larper's maps against the photos once both are ready. You can run a check live below.</p>`;

const scen = dec.scenarios.map(s => `<tr${s.name.startsWith('Satellite') ? ' class="hi"' : ''}><td>${esc(s.name)}</td><td>${s.p.toFixed(2)}</td><td>$${Math.round(s.release).toLocaleString('en-US')}</td><td>$${Math.round(s.inspect).toLocaleString('en-US')}</td><td><b>${s.action === 'inspect' ? 'Inspect' : 'Release'}</b></td></tr>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jewar From Orbit</title>
<meta name="description" content="Sentinel-2 and the Larper model check Jewar airport's construction claims; NVIDIA Nemotron reviews the result.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap" rel="stylesheet">
<style>
:root{--paper:#EEF1F0;--sheet:#F8FAF9;--ink:#17232C;--mut:#56646D;--rule:#CBD3D2;--larper:#2C55C9;--veg:#4D7A3A;--claim:#B7791F;--hi:#F6EAD3;--focus:#2C55C9}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#121B21;--sheet:#18232A;--ink:#E6ECEA;--mut:#9AA8AE;--rule:#2E3B42;--larper:#7C9BFF;--veg:#8DBA6E;--claim:#E0A64A;--hi:#3A2F1A;--focus:#7C9BFF}}
:root[data-theme="dark"]{--paper:#121B21;--sheet:#18232A;--ink:#E6ECEA;--mut:#9AA8AE;--rule:#2E3B42;--larper:#7C9BFF;--veg:#8DBA6E;--claim:#E0A64A;--hi:#3A2F1A;--focus:#7C9BFF}
*{box-sizing:border-box}
html{background:var(--paper)}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 Archivo,system-ui,sans-serif;font-variation-settings:"wdth" 100}
main{max-width:1000px;margin:0 auto;padding:28px 16px 80px}
.col{max-width:68ch}
h1{font-size:clamp(34px,6vw,64px);line-height:1.02;font-weight:800;font-variation-settings:"wdth" 125;letter-spacing:-.01em;margin:8px 0 14px}
h2{font-size:clamp(22px,3vw,30px);line-height:1.15;font-weight:750;font-variation-settings:"wdth" 118;margin:64px 0 10px}
h4{margin:0 0 4px;font-size:15px;font-weight:700}
p{margin:0 0 12px}
.lede{font-size:clamp(18px,2.2vw,21px);line-height:1.45;max-width:60ch}
.claimline{font-variation-settings:"wdth" 75;font-weight:700;font-size:clamp(22px,3.4vw,34px);line-height:1.2;margin:28px 0 6px;max-width:30ch}
.claimline .c{color:var(--claim)}.claimline .o{color:var(--veg)}
.note{color:var(--mut);font-size:14px}
.ev{display:inline-block;font-size:12px;font-weight:600;padding:0 7px;border-radius:4px;border:1px solid currentColor;margin-left:6px;vertical-align:2px}
.ev.rep{color:var(--claim)}.ev.der{color:var(--veg)}.ev.ass{color:var(--mut)}.ev.ai{color:var(--larper)}
.swipe{position:relative;margin-top:22px;border-radius:6px;overflow:hidden;aspect-ratio:816/473;background:#000;user-select:none}
.swipe img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.swipe .clip{position:absolute;inset:0;clip-path:inset(0 calc(100% - var(--pos)) 0 0)}
.swipe .handle{position:absolute;top:0;bottom:0;left:var(--pos);width:2px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.35);pointer-events:none}
.swipe .handle::after{content:"";position:absolute;top:50%;left:50%;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.4)}
.swipe input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}
.swipe:focus-within{outline:3px solid var(--focus);outline-offset:3px}
.tag{position:absolute;bottom:10px;font-size:13px;font-weight:700;color:#fff;background:rgba(10,20,25,.62);padding:2px 8px;border-radius:4px;pointer-events:none}
.tag.left{left:10px}.tag.right{right:10px}
.pick{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;margin-top:10px}
select,button,input[type=text]{font:inherit;color:var(--ink);background:var(--sheet);border:1px solid var(--rule);border-radius:6px;padding:6px 10px}
button{cursor:pointer;font-weight:650}
button.primary{background:var(--larper);border-color:var(--larper);color:#fff}
button:disabled{opacity:.55;cursor:progress}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.chart{margin-top:14px}
svg{width:100%;height:auto;display:block}
.g{stroke:var(--rule)}.ax{fill:var(--mut);font-size:12px}
.gap{fill:var(--rule);opacity:.5}
.ln{fill:none;stroke-width:2.6;stroke-linejoin:round}.ln.base{stroke:var(--veg)}.ln.larper{stroke:var(--larper)}
.el{font-size:13px;font-weight:700}.el.base{fill:var(--veg)}.el.larper{fill:var(--larper)}.el.claimt{fill:var(--claim)}
.claim{fill:var(--claim)}.obs{fill:var(--veg)}.gapline{stroke:var(--claim);stroke-width:2;stroke-dasharray:3 3}
.figs{display:flex;flex-wrap:wrap;gap:12px 40px;margin:18px 0}
.figs b{display:block;font-size:34px;line-height:1;font-weight:800;font-variation-settings:"wdth" 70}
.figs span{color:var(--mut);font-size:14px}
.tbl{border-collapse:collapse;width:100%;font-size:14px;margin:8px 0 10px;font-variant-numeric:tabular-nums}
.tbl caption{text-align:left;color:var(--mut);font-size:13px;padding-bottom:4px}
.tbl th,.tbl td{border-bottom:1px solid var(--rule);padding:7px 8px;text-align:left}
.tbl th{font-weight:650}.tbl tr.hi td{background:var(--hi)}
.wrap{overflow-x:auto}
.maps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:14px}
figure{margin:0}figure img{width:100%;display:block;border-radius:4px}figcaption{font-size:13px;color:var(--mut);margin-top:3px}
.legend i{display:inline-block;width:11px;height:11px;background:var(--c);border-radius:2px;margin:0 5px 0 12px;vertical-align:-1px}.legend i:first-child{margin-left:0}
.pending{border-left:3px solid var(--rule);padding:4px 0 4px 12px;color:var(--mut)}
.decide{display:grid;grid-template-columns:1fr 1fr;gap:16px 28px;margin:16px 0}
.decide label{display:block;font-size:14px;color:var(--mut)}.decide output{font-weight:700;color:var(--ink)}
input[type=range]{width:100%;accent-color:var(--larper)}
.verdict{font-size:clamp(20px,2.6vw,26px);font-weight:750;font-variation-settings:"wdth" 90;margin:6px 0 4px}
.verdict.inspect{color:var(--claim)}.verdict.release{color:var(--veg)}
.flow{list-style:none;padding:0;margin:16px 0;display:grid;gap:0}
.flow li{display:grid;grid-template-columns:150px 1fr;gap:14px;padding:12px 0;border-top:1px solid var(--rule)}
.flow li b{font-variation-settings:"wdth" 90}
.ai-out{border-left:3px solid var(--larper);padding:2px 0 2px 14px;margin:14px 0;white-space:pre-wrap}
.ask{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.ask input{flex:1;min-width:220px}
#ans:empty{display:none}
footer{margin-top:72px;border-top:1px solid var(--rule);padding-top:14px}
@media (max-width:640px){.decide{grid-template-columns:1fr}.flow li{grid-template-columns:1fr;gap:2px}}
@media (prefers-reduced-motion:no-preference){.swipe.intro .clip{transition:clip-path .9s cubic-bezier(.3,.7,.2,1)}.swipe.intro .handle{transition:left .9s cubic-bezier(.3,.7,.2,1)}}
</style></head><body><main>

<header>
<p class="note">Mach-A-Thon Aeromania '26, Track A6: infrastructure monitoring</p>
<h1>Jewar airport, checked from orbit</h1>
<p class="lede col">Lenders release money for big projects on the builder's word. We measured Noida International Airport at Jewar from free Sentinel-2 satellite images every month from 2020 to 2026, and checked the claims against what was on the ground.</p>
${swipe}
<p class="claimline">In January 2025 the project was reported <span class="c">80% complete</span>. From orbit, <span class="o">${dec.satellite_observed_pct}%</span> of the land had been converted.</p>
<p class="note col">Land conversion is not the same as finished construction, so the gap is a reason to inspect, not proof the report was false.<span class="ev rep">reported</span><span class="ev der">derived</span></p>
</header>

<section aria-labelledby="h-progress">
<h2 id="h-progress">Progress, month by month</h2>
<p class="col">The green line counts land that stayed free of vegetation all year, so the yearly crop cycle never counts as building. ${ai.length ? 'The blue line is Larper, our AI model, counting squares it labels built or paved.' : 'Larper\'s built-or-paved line is added when its run finishes.'} Grey bars are months too cloudy to measure.</p>
<div class="chart">${chart}</div>
<p class="note col">Work shows from mid-2023, not from the 2021 groundbreaking. After 2025 the green line dips as grass grows back on finished, unpaved ground; that is the metric's limit, which Larper is built to fix.</p>
</section>

<section aria-labelledby="h-larper">
<h2 id="h-larper">Larper, our AI model <span class="ev der">derived</span></h2>
<div class="col">${larperBlock}</div>
</section>

<section aria-labelledby="h-review">
<h2 id="h-review">Nemotron checks Larper's work <span class="ev ai">AI review</span></h2>
<div class="col">${reviewBlock}</div>
</section>

<section aria-labelledby="h-decide">
<h2 id="h-decide">Release the next payment, or inspect first?</h2>
<p class="col">An inspection costs money; trusting an optimistic report can cost far more. Move the sliders to see when the satellite evidence changes the decision.<span class="ev ass">assumed costs</span></p>
<div class="decide">
<label for="c">Inspection cost: <output id="cv"></output><input id="c" type="range" min="2000" max="60000" step="1000" value="${P0.inspection_cost.value}"></label>
<label for="p">Chance the report is optimistic: <output id="pv"></output><input id="p" type="range" min="0" max="0.6" step="0.005" value="${dec.scenarios[1].p.toFixed(3)}"></label>
</div>
<p class="verdict" id="verdict" aria-live="polite"></p>
<p class="note" id="costs"></p>
<div class="wrap"><table class="tbl"><caption>Three cases, with a $300,000 tranche at risk and a 90% effective inspection (both assumed)</caption>
<tr><th scope="col">Evidence</th><th scope="col">Chance optimistic</th><th scope="col">Expected cost if released</th><th scope="col">Expected cost if inspected</th><th scope="col">Do</th></tr>${scen}</table></div>
<p class="note">Inspect when the chance is above ${dec.scenarios[0].break_even_p.toFixed(3)} (inspection cost ÷ (effectiveness × amount at risk)).</p>
</section>

<section aria-labelledby="h-next">
<h2 id="h-next">Where this goes next</h2>
<ol class="flow col">
<li><b>This airport</b><span>${rdy ? `Land conversion started ${monthName(rdy.satellite.conversion_start_month)} and levelled off ${monthName(rdy.satellite.plateau_month)}; phase 1 opened 28 Mar 2026 (reported). It counts as a possible diversion airport only once an airline confirms slots and procedures.` : 'Readiness record pending.'}</span></li>
<li><b>GPS trouble nearby</b><span>Track C checks satellite evidence of GPS jamming or spoofing within ${rdy ? rdy.region.radius_km : 50} km. No data reads "unknown", never "safe". Monitoring only.</span></li>
<li><b>Passengers</b><span>When GPS failure diverts flights, NavContinuity uses that capacity to get each passenger to a confirmed rebooking, care and their bags.</span></li>
</ol>
<p class="col"><b>Who pays:</b> lenders, infrastructure funds and government monitoring cells, as a per-asset monitoring fee; airlines for the recovery product. Worth: inspections avoided plus losses caught. Pricing is not yet validated.</p>
</section>

<section aria-labelledby="h-ask">
<h2 id="h-ask">Ask about the results <span class="ev ai">NVIDIA Nemotron</span></h2>
<p class="col">Answers use only the numbers on this page and keep their labels. AI text can be wrong; check it against the chart.</p>
<div class="ask"><input type="text" id="q" maxlength="600" placeholder="Why does the green line fall after 2025?" aria-label="Your question"><button id="ask">Ask</button><button id="memo" class="primary">Write lender memo</button></div>
${MAPS.length ? `<div class="ask"><label>Month <select id="vm">${MAPS.slice().reverse().map(m => `<option value="${m}">${monthName(m)}</option>`).join('')}</select></label><button id="vis">Check Larper's map against the photo</button></div>` : ''}
<div id="ans" class="ai-out col" aria-live="polite"></div>
</section>

<footer class="note col">
<p>Data: Sentinel-2 L2A (ESA Copernicus, via Element 84 Earth Search), ${base.length} monthly scenes; airport boundary from OpenStreetMap (ODbL); labels from ESA WorldCover 2021. Milestones from news reports. Economics are illustrative. Method and limits: a6/README.md in the GitHub repo rehancodes-web/Mack.1.</p>
</footer>
</main>
<script>
(function(){
const sw=document.getElementById('swipe');
if(sw){const r=document.getElementById('swipeR'),A=document.getElementById('imgA'),B=document.getElementById('imgB'),sa=document.getElementById('selA'),sb=document.getElementById('selB'),ta=document.getElementById('tagA'),tb=document.getElementById('tagB');
 const set=v=>sw.style.setProperty('--pos',v+'%');r.addEventListener('input',()=>{sw.classList.remove('intro');set(r.value);});
 const lbl=s=>s.options[s.selectedIndex].text;
 sa.onchange=()=>{A.src='quicklook_'+sa.value+'.png';A.alt='Sentinel-2 image of the site, '+lbl(sa);ta.textContent=lbl(sa);};
 sb.onchange=()=>{B.src='quicklook_'+sb.value+'.png';B.alt='Sentinel-2 image of the site, '+lbl(sb);tb.textContent=lbl(sb);};
 sw.classList.add('intro');set(88);requestAnimationFrame(()=>setTimeout(()=>{set(50);r.value=50;},350));}
const L=${P0.loss_if_optimistic.value},e=${P0.inspection_effectiveness.value};
const c=document.getElementById('c'),p=document.getElementById('p');
const fmt=n=>'$'+Math.round(n).toLocaleString('en-US');
function upd(){const C=+c.value,P=+p.value,rel=P*L,ins=C+P*(1-e)*L,v=document.getElementById('verdict');
 document.getElementById('cv').textContent=fmt(C);document.getElementById('pv').textContent=(P*100).toFixed(1).replace(/\.0$/,'')+'%';
 const insp=ins<rel;v.textContent=insp?'Inspect before paying':'Release the payment';v.className='verdict '+(insp?'inspect':'release');
 document.getElementById('costs').textContent='Expected cost if released '+fmt(rel)+', if inspected '+fmt(ins)+'. Break-even chance: '+(C/(e*L)*100).toFixed(1)+'%.';}
c.oninput=p.oninput=upd;upd();
const EP=${JSON.stringify(AI_ENDPOINT)},CTX=${JSON.stringify(CTX).replace(/</g, '\\u003c')};
const ans=document.getElementById('ans');let visualCheck=null;const btns=()=>document.querySelectorAll('#ask,#memo,#vis');
async function b64(url){const b=await (await fetch(url)).blob();return await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.readAsDataURL(b);});}
async function ask(question,images){
 btns().forEach(b=>b.disabled=true);ans.textContent='Nemotron is working on it…';
 const ctx={...CTX,current_sliders:{inspection_cost:+c.value,p_report_optimistic:+p.value,loss_if_optimistic:L,inspection_effectiveness:e},nemotron_live_visual_check:visualCheck};
 try{const r=await fetch(EP,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,context:ctx,images:images||[]})});
  const j=await r.json();ans.textContent=j.answer||('The analyst could not answer: '+(j.error||('HTTP '+r.status))+'.');return j.answer||null;}
 catch(err){ans.textContent='The analyst is unreachable ('+err.message+'). The numbers above still stand.';return null;}
 finally{btns().forEach(b=>b.disabled=false);}
}
document.getElementById('ask').onclick=()=>{const v=document.getElementById('q').value.trim();if(v)ask(v);else document.getElementById('q').focus();};
document.getElementById('q').onkeydown=ev=>{if(ev.key==='Enter')document.getElementById('ask').click();};
document.getElementById('memo').onclick=()=>ask('Write a short lender memo: release the next tranche on the contractor report, or commission an inspection first, using the current slider values. Headings: Evidence / Decision / Caveats.');
const vis=document.getElementById('vis');
if(vis)vis.onclick=async()=>{const m=document.getElementById('vm').value,row=(CTX.derived_larper_all||[]).find(r=>r[0]===m);
 const imgs=[{label:'Sentinel-2 true colour '+m+' (yellow line = airport boundary)',mime:'image/png',data:await b64('quicklook_'+m+'.png')},{label:'Larper class map '+m,mime:'image/png',data:await b64('classmap_'+m+'.png')}];
 const a=await ask('Cross-check the Larper class map for '+m+' against the satellite photo. Larper says '+(row?('built/paved '+Math.round(row[1]*100)+'%, bare '+Math.round(row[2]*100)+'%, vegetation '+Math.round(row[3]*100)+'%'):'(see context)')+'. Where does the map look right, where does it look wrong, and how far should we trust these numbers?',imgs);
 if(a)visualCheck={month:m,finding:a.slice(0,1500)};};
})();
</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'demo.html'), html);
console.log(`wrote outputs/demo.html (Larper ${met ? 'included' : 'pending'}, Nemotron review ${rev ? 'included' : 'pending'})`);
