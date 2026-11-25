// Builds outputs/demo.html: one offline page for the 5-minute A6 demo.
// Inputs: outputs/progress_baseline.json, progress_ai.json, classifier_metrics.json, decision.json, quicklook_*.png, classmap_*.png
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULTS, expectedCosts } from './economics.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs');
const rd = f => JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));
const base = rd('progress_baseline.json').results;
const ai = rd('progress_ai.json').results;
const met = rd('classifier_metrics.json');
const dec = rd('decision.json');
const rdy = fs.existsSync(path.join(OUT, 'readiness.json')) ? rd('readiness.json') : null;
const rev = fs.existsSync(path.join(OUT, 'nemotron_review.json')) ? rd('nemotron_review.json') : null;
const MODEL_NAME = 'Larper'; // our Random Forest land-cover model
const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
const AI_ENDPOINT = process.env.AI_ENDPOINT ?? '/api/analyst'; // same Vercel project serves page + API
// compact, labelled context the AI analyst may use (nothing else)
const CTX = {
  asset: 'Noida International Airport (Jewar), footprint ~1333 ha, Sentinel-2 2020-2026',
  reported: [['2021-11-25', 'Foundation stone'], ['2025-01-28', '"80% work complete"'], ['2026-03-28', 'Phase 1 inaugurated']],
  derived_baseline_cleared_12m: base.filter(r => r.fp_cleared_12m != null && /-(01|04|07|10)$/.test(r.month)).map(r => [r.month, r.fp_cleared_12m]),
  derived_ai_built_paved: ai.filter(r => r.built_paved_frac != null && /-(01|04|07|10)$/.test(r.month)).map(r => [r.month, r.built_paved_frac, r.bare_frac]),
  derived_ai_all: ai.filter(r => r.built_paved_frac != null).map(r => [r.month, r.built_paved_frac, r.bare_frac, r.vegetation_frac]),
  ai_metrics: { overall_agreement_with_worldcover: met.overall_accuracy, per_class: met.per_class, caveat: met.label_caveat },
  decision: { report_pct: dec.report.reported_pct, satellite_pct: dec.satellite_observed_pct, gap_pts: dec.gap_pts, scenarios: dec.scenarios, assumed_parameters: dec.parameters, caveat: dec.caveat },
  readiness: rdy,
  product: 'NavContinuity: navigation failure -> passenger recovery. A6 output = recovery capacity + region for Track C GNSS check.',
};

const W = 1000, H = 380, L = 56, R = 20, T = 20, B = 46;
const t0 = Date.UTC(2020, 0, 1), t1 = Date.UTC(2026, 11, 31);
const X = d => L + (Date.parse(d) - t0) / (t1 - t0) * (W - L - R), Y = v => T + (1 - v) * (H - T - B);
const line = (rows, key) => { let d = '', pen = false; for (const r of rows) { const v = r[key]; if (v == null) { pen = false; continue; } d += `${pen ? 'L' : 'M'}${X(r.date).toFixed(1)},${Y(v).toFixed(1)} `; pen = true; } return d; };
let grid = '';
for (let v = 0; v <= 1.0001; v += 0.25) grid += `<line class="g" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${Math.round(v * 100)}%</text>`;
for (let y = 2020; y <= 2026; y++) grid += `<text class="ax" x="${X(`${y}-01-01`) + 3}" y="${H - B + 16}">${y}</text><line class="g" x1="${X(`${y}-01-01`)}" x2="${X(`${y}-01-01`)}" y1="${T}" y2="${H - B}"/>`;
const MS = [['2021-11-25', 'Foundation stone'], ['2025-01-28', '"80% complete" (reported)'], ['2026-03-28', 'Inaugurated']];
const ms = MS.map(([d, l], i) => `<line class="ms" x1="${X(d)}" x2="${X(d)}" y1="${T}" y2="${H - B}"/><text class="msl" x="${X(d) + 3}" y="${H - B + 30 + (i % 2) * 12}">${l}</text>`).join('');
const rep = `<circle cx="${X('2025-01-28')}" cy="${Y(0.8)}" r="6" class="rep"><title>Reported 80% (Jan 2025)</title></circle>`;
const chart = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Progress curves">${grid}${ms}
<path class="base" d="${line(base, 'fp_cleared_12m')}"/><path class="aiB" d="${line(ai, 'built_paved_frac')}"/><path class="aiX" d="${line(ai, 'built_or_bare_frac')}"/>${rep}</svg>`;

const pc = met.per_class.map(c => `<tr><td>${c.class.replace('_', '/')}</td><td>${c.support}</td><td>${c.recall ?? '–'}</td><td>${c.precision ?? '–'}</td></tr>`).join('');
const scen = dec.scenarios.map(s => `<tr${s.name.startsWith('Satellite') ? ' class="hi"' : ''}><td>${s.name}</td><td>${s.p.toFixed(2)}</td><td>$${Math.round(s.release).toLocaleString()}</td><td>$${Math.round(s.inspect).toLocaleString()}</td><td><b>${s.action.toUpperCase()}</b></td></tr>`).join('');
const imgs = ['2020-03', '2022-05', '2024-03', '2026-03'].map(m => `<figure><img src="quicklook_${m}.png" alt="Sentinel-2 true colour ${m}"><figcaption>${m}</figcaption></figure>`).join('');
const maps = ['2020-03', '2024-03', '2026-03'].filter(m => fs.existsSync(path.join(OUT, `classmap_${m}.png`))).map(m => `<figure><img src="classmap_${m}.png" alt="AI class map ${m}"><figcaption>${m}</figcaption></figure>`).join('');
const P0 = DEFAULTS;
const last = [...ai].reverse().find(r => r.built_paved_frac != null);

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jewar From Orbit</title><style>
:root{--bg:#fbfbfd;--card:#fff;--fg:#1d1d1f;--mut:#6b6b70;--ln:#e4e4ea;--base:#1f6feb;--ai:#d63b3b;--aix:#e8a33a;--ms:#c2410c;--hi:#fff4e0}
@media (prefers-color-scheme:dark){:root{--bg:#121214;--card:#1c1c1f;--fg:#ececf0;--mut:#9a9aa3;--ln:#333338;--hi:#3a2e14}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 Segoe UI,system-ui,sans-serif}
main{max-width:1060px;margin:0 auto;padding:20px 16px 60px}h1{font-size:26px;margin:0}h2{font-size:18px;margin:28px 0 8px}
.sub{color:var(--mut);margin:4px 0 16px}.card{background:var(--card);border:1px solid var(--ln);border-radius:10px;padding:14px 16px;margin:10px 0}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
@media (max-width:700px){.grid4,.grid3{grid-template-columns:1fr 1fr}}
figure{margin:0}img{width:100%;border-radius:6px;display:block}figcaption{font-size:12px;color:var(--mut);text-align:center}
svg{width:100%;height:auto}.g{stroke:var(--ln)}.ax{fill:var(--mut);font-size:11px}.ms{stroke:var(--ms);stroke-dasharray:2 3}.msl{fill:var(--ms);font-size:11px}
.base{fill:none;stroke:var(--base);stroke-width:2.4}.aiB{fill:none;stroke:var(--ai);stroke-width:2.4}.aiX{fill:none;stroke:var(--aix);stroke-width:2;stroke-dasharray:5 3}.rep{fill:none;stroke:var(--ms);stroke-width:2.5}
.key span{margin-right:14px;font-size:13px}.sw{display:inline-block;width:16px;height:3px;vertical-align:middle;margin-right:5px}
table{border-collapse:collapse;width:100%;font-size:14px}td,th{border-bottom:1px solid var(--ln);padding:6px 8px;text-align:left}tr.hi td{background:var(--hi)}
.kpi{display:flex;gap:12px;flex-wrap:wrap}.kpi div{flex:1;min-width:150px}.kpi b{display:block;font-size:26px}
.lab{font-size:11px;padding:1px 6px;border-radius:9px;border:1px solid var(--ln);color:var(--mut)}
input[type=range]{width:100%}.note{color:var(--mut);font-size:13px}
</style></head><body><main>
<h1>Jewar airport, watched from orbit</h1>
<p class="sub">Track A6 Infrastructure · Sentinel-2 L2A, ${base.length} monthly scenes 2020–2026 · Noida International Airport footprint ≈ 1333 ha · historical replay, economics assumed</p>

<div class="card kpi">
<div><span class="lab">reported</span><b>80%</b>"work complete", Jan 2025</div>
<div><span class="lab">derived</span><b>${dec.satellite_observed_pct}%</b>land converted (satellite), Jan 2025</div>
<div><span class="lab">derived</span><b>${Math.round((ai.find(r => r.month === '2025-01')?.built_paved_frac ?? 0) * 100)}%</b>built/paved (Larper AI), Jan 2025</div>
<div><span class="lab">assumed economics</span><b>${dec.scenarios[1].action.toUpperCase()}</b>before releasing the tranche</div>
</div>

<h2>1 · What the satellite saw</h2>
<div class="grid4">${imgs}</div>

<h2>2 · Progress: baseline vs Larper (our AI model)</h2>
<div class="card"><p class="key"><span><i class="sw" style="background:var(--base)"></i>Baseline: cleared all year (NDVI rule)</span><span><i class="sw" style="background:var(--ai)"></i>Larper: built/paved share</span><span><i class="sw" style="background:var(--aix)"></i>Larper: built + bare share</span><span><i class="sw" style="background:var(--ms)"></i>Reported milestones</span></p>${chart}
<p class="note">Latest Larper built/paved: ${Math.round(last.built_paved_frac * 100)}% (${last.date}). Grass and scrub left inside the airport boundary stay vegetation, so 100% is not expected.</p></div>
${maps ? `<div class="grid3">${maps}</div><p class="note">Larper class maps inside the footprint: <span style="color:#dc3c3c">■</span> built/paved <span style="color:#e6c878">■</span> bare <span style="color:#3c8c3c">■</span> vegetation <span style="color:#3c78dc">■</span> water.</p>` : ''}
<div class="card"><b>Larper</b>, our AI model: a Random Forest, ${met.params.rf.nEstimators} trees, 10 features (6 bands + 4 indices), trained on ${met.n_train.toLocaleString()} pixels labelled by ESA WorldCover 2021 <i>outside</i> the airport, tested on ${met.n_test.toLocaleString()} pixels from a separate block of land. Agreement with WorldCover: <b>${Math.round(met.overall_accuracy * 100)}%</b>.
<table><tr><th>Class</th><th>Test pixels</th><th>Recall</th><th>Precision</th></tr>${pc}</table>
<p class="note">WorldCover is itself a model product, so this is agreement with it, not ground truth.</p></div>

<h2>3 · The decision: release the tranche, or inspect first?</h2>
<div class="card"><table><tr><th>Evidence</th><th>P(report optimistic)</th><th>Expected cost: release</th><th>Expected cost: inspect</th><th>Action</th></tr>${scen}</table>
<p class="note">Inspect when p &gt; C ÷ (e × L) = <b>${dec.scenarios[0].break_even_p.toFixed(3)}</b>. All probabilities and costs are assumed for illustration.</p>
<p><label>Inspection cost: <b id="cv"></b><input id="c" type="range" min="2000" max="60000" step="1000" value="${P0.inspection_cost.value}"></label></p>
<p><label>P(report optimistic): <b id="pv"></b><input id="p" type="range" min="0" max="0.6" step="0.01" value="${dec.scenarios[1].p.toFixed(2)}"></label></p>
<p id="out" style="font-size:17px"></p></div>

<h2>4 · Who pays, and what it's worth</h2>
<div class="card">Lenders, infrastructure funds and government project-monitoring cells releasing money against contractor milestones. Price: per-asset monitoring fee. Worth: inspections avoided when the satellite agrees with the report, plus losses caught when it doesn't. <span class="lab">proposed · pricing unvalidated</span></div>

${rdy ? `<h2>5 · Hand-off to NavContinuity: recovery capacity</h2>
<div class="card"><table>
<tr><td>Land conversion started</td><td><b>${rdy.satellite.conversion_start_month}</b> <span class="lab">derived</span></td></tr>
<tr><td>Plateau reached</td><td><b>${rdy.satellite.plateau_month}</b> <span class="lab">derived</span></td></tr>
<tr><td>Phase 1 inaugurated</td><td><b>2026-03-28</b> <span class="lab">reported</span></td></tr>
<tr><td>Usable as diversion / rebooking airport</td><td>${rdy.recovery_capacity.usable_for_navcontinuity}</td></tr>
<tr><td>Region passed to Track C</td><td>${rdy.region.radius_km} km around ${rdy.region.centre.lat}°N, ${rdy.region.centre.lon}°E <span class="lab">assumed</span></td></tr>
</table><p class="note">Track C then asks whether GNSS is degraded inside this region; no coverage reads "unknown", never "safe".</p></div>` : ''}
${rev ? `<h2>6 · Nemotron reviews Larper <span class="lab">AI review · NVIDIA Nemotron</span></h2>
<div class="card"><p class="note">${esc(rev.caveat)}</p>
${rev.curve?.finding ? `<p><b>Curves:</b></p><div style="white-space:pre-wrap">${esc(rev.curve.finding)}</div>` : ''}
${rev.vision.filter(v => v.finding).map(v => `<p><b>Map check ${v.month}:</b></p><div style="white-space:pre-wrap">${esc(v.finding)}</div>`).join('')}
<p class="note">Generated ${esc(rev.generated_utc.slice(0, 16).replace('T', ' '))} UTC with ${esc(rev.curve?.model || rev.vision.find(v => v.model)?.model || 'Nemotron')}.</p></div>` : ''}
<h2>7 · Ask the analyst <span class="lab">AI · NVIDIA Nemotron</span></h2>
<div class="card"><p class="note">Answers come only from this page's data, with reported / derived / assumed labels kept. AI text can be wrong: check it against the charts above.</p>
<p style="display:flex;gap:8px;flex-wrap:wrap"><input id="q" maxlength="600" placeholder="e.g. Why does the baseline fall after 2025?" style="flex:1;min-width:220px;padding:8px;border:1px solid var(--ln);border-radius:6px;background:var(--card);color:var(--fg)">
<button id="ask">Ask</button><button id="memo">Write lender memo</button></p>
<p style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><b>Model + Nemotron vision cross-check:</b>
<select id="vm">${['2026-03', '2024-03', '2020-03'].filter(m => fs.existsSync(path.join(OUT, `classmap_${m}.png`))).map(m => `<option>${m}</option>`).join('')}</select>
<button id="vis">Check Larper map against the satellite photo</button></p>
<div id="ans" style="white-space:pre-wrap"></div></div>
<p class="note">Limits: land conversion ≠ completion. The OSM boundary is the finished airport. Larper is trained on WorldCover weak labels; Nemotron reviews are model opinions. 11 months come from an older collection. Sources and method are in a6/README.md and data/README.md.</p>
</main><script>
const L=${P0.loss_if_optimistic.value},e=${P0.inspection_effectiveness.value};
const c=document.getElementById('c'),p=document.getElementById('p');
function upd(){const C=+c.value,P=+p.value,rel=P*L,ins=C+P*(1-e)*L;document.getElementById('cv').textContent='$'+C.toLocaleString();document.getElementById('pv').textContent=P.toFixed(2);
document.getElementById('out').innerHTML='Release: <b>$'+Math.round(rel).toLocaleString()+'</b> · Inspect: <b>$'+Math.round(ins).toLocaleString()+'</b> → <b>'+(ins<rel?'INSPECT':'RELEASE')+'</b> (break-even p = '+(C/(e*L)).toFixed(3)+')';}
c.oninput=p.oninput=upd;upd();
const EP=${JSON.stringify(AI_ENDPOINT)},CTX=${JSON.stringify(CTX).replace(/</g, '\\u003c')};
const ans=document.getElementById('ans');
let visualCheck=null; // Nemotron's last cross-check of the RF map, fed into later answers and the memo
async function b64(url){const b=await (await fetch(url)).blob();return await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.readAsDataURL(b);});}
async function ask(question,images){
 if(!EP){ans.textContent='AI backend not connected yet (set NEMOTRON_API_KEY in Vercel).';return null;}
 ans.textContent='Thinking…';
 const ctx={...CTX,current_sliders:{inspection_cost:+c.value,p_report_optimistic:+p.value,loss_if_optimistic:L,inspection_effectiveness:e},nemotron_visual_check_of_rf:visualCheck};
 try{const r=await fetch(EP,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,context:ctx,images:images||[]})});
  const j=await r.json();ans.textContent=j.answer||('Error: '+(j.error||r.status));return j.answer||null;}
 catch(err){ans.textContent='Could not reach the AI backend: '+err.message;return null;}
}
const vis=document.getElementById('vis');
if(vis)vis.onclick=async()=>{
 const m=document.getElementById('vm').value;
 const row=(CTX.derived_ai_all||[]).find(r=>r[0]===m);
 const imgs=[{label:'Sentinel-2 true colour '+m+' (yellow line = airport footprint)',mime:'image/png',data:await b64('quicklook_'+m+'.png')},
  {label:'Larper (Random Forest) class map '+m,mime:'image/png',data:await b64('classmap_'+m+'.png')}];
 const a=await ask('Cross-check the Larper (Random Forest) class map for '+m+' against the satellite photo. RF says: '+(row?('built/paved '+Math.round(row[1]*100)+'%, bare '+Math.round(row[2]*100)+'%, vegetation '+Math.round(row[3]*100)+'%'):'see context')+'. Where does the map look right, where does it look wrong, and should we trust the RF numbers for this month?',imgs);
 if(a)visualCheck={month:m,finding:a.slice(0,1500)};
};
document.getElementById('ask').onclick=()=>{const v=document.getElementById('q').value.trim();if(v)ask(v);};
document.getElementById('q').onkeydown=ev=>{if(ev.key==='Enter')document.getElementById('ask').click();};
document.getElementById('memo').onclick=()=>ask('Write a short lender memo: should the next tranche be released on the contractor report or should an inspection be commissioned first, using the current slider values. Headings: Evidence / Decision / Caveats.');
</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'demo.html'), html);
console.log('wrote outputs/demo.html');
