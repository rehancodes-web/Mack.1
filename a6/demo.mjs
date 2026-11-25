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
<div><span class="lab">derived</span><b>${Math.round((ai.find(r => r.month === '2025-01')?.built_paved_frac ?? 0) * 100)}%</b>built/paved (AI), Jan 2025</div>
<div><span class="lab">assumed economics</span><b>${dec.scenarios[1].action.toUpperCase()}</b>before releasing the tranche</div>
</div>

<h2>1 · What the satellite saw</h2>
<div class="grid4">${imgs}</div>

<h2>2 · Progress: baseline vs AI</h2>
<div class="card"><p class="key"><span><i class="sw" style="background:var(--base)"></i>Baseline: cleared all year (NDVI rule)</span><span><i class="sw" style="background:var(--ai)"></i>AI: built/paved share</span><span><i class="sw" style="background:var(--aix)"></i>AI: built + bare share</span><span><i class="sw" style="background:var(--ms)"></i>Reported milestones</span></p>${chart}
<p class="note">Latest AI built/paved: ${Math.round(last.built_paved_frac * 100)}% (${last.date}). Grass and scrub left inside the airport boundary stay vegetation, so 100% is not expected.</p></div>
${maps ? `<div class="grid3">${maps}</div><p class="note">AI class maps inside the footprint: <span style="color:#dc3c3c">■</span> built/paved <span style="color:#e6c878">■</span> bare <span style="color:#3c8c3c">■</span> vegetation <span style="color:#3c78dc">■</span> water.</p>` : ''}
<div class="card"><b>AI model:</b> Random Forest, ${met.params.rf.nEstimators} trees, 10 features (6 bands + 4 indices), trained on ${met.n_train.toLocaleString()} pixels labelled by ESA WorldCover 2021 <i>outside</i> the airport, tested on ${met.n_test.toLocaleString()} pixels from a separate block of land. Agreement with WorldCover: <b>${Math.round(met.overall_accuracy * 100)}%</b>.
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

<p class="note">Limits: land conversion ≠ completion. The OSM boundary is the finished airport. The AI is trained on WorldCover weak labels. 11 months come from an older collection. Sources and method are in a6/README.md and data/README.md.</p>
</main><script>
const L=${P0.loss_if_optimistic.value},e=${P0.inspection_effectiveness.value};
const c=document.getElementById('c'),p=document.getElementById('p');
function upd(){const C=+c.value,P=+p.value,rel=P*L,ins=C+P*(1-e)*L;document.getElementById('cv').textContent='$'+C.toLocaleString();document.getElementById('pv').textContent=P.toFixed(2);
document.getElementById('out').innerHTML='Release: <b>$'+Math.round(rel).toLocaleString()+'</b> · Inspect: <b>$'+Math.round(ins).toLocaleString()+'</b> → <b>'+(ins<rel?'INSPECT':'RELEASE')+'</b> (break-even p = '+(C/(e*L)).toFixed(3)+')';}
c.oninput=p.oninput=upd;upd();
</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'demo.html'), html);
console.log('wrote outputs/demo.html');
