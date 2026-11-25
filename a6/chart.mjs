// Builds outputs/progress_chart.html (inline SVG, no external libraries) from outputs/progress_baseline.json.
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs');
const J = JSON.parse(fs.readFileSync(path.join(OUT, 'progress_baseline.json'), 'utf8'));
const R = J.results;

const W = 1100, H = 520, L = 64, Rm = 24, T = 40, B = 70;
const t0 = Date.UTC(2020, 0, 1), t1 = Date.UTC(2026, 11, 31);
const X = d => L + (Date.parse(d) - t0) / (t1 - t0) * (W - L - Rm);
const Y = v => T + (1 - v) * (H - T - B);

// reported milestones (evidence label: reported; sources in data/README.md)
const MS = [
  ['2021-08-27', 'Works reported begun'],
  ['2021-11-25', 'Foundation stone'],
  ['2024-09-30', 'First opening target'],
  ['2025-01-28', '"80% complete"'],
  ['2025-04-30', 'April 2025 target'],
  ['2025-10-30', 'Oct 2025 target'],
  ['2026-03-28', 'Phase 1 inaugurated'],
];

const path_ = (key) => {
  let d = '', pen = false;
  for (const r of R) {
    const v = r[key];
    if (v === null || v === undefined || v === '') { pen = false; continue; }
    d += `${pen ? 'L' : 'M'}${X(r.date).toFixed(1)},${Y(v).toFixed(1)} `; pen = true;
  }
  return d;
};
const dots = (key, cls) => R.filter(r => r[key] !== null).map(r => `<circle class="${cls}" cx="${X(r.date).toFixed(1)}" cy="${Y(r[key]).toFixed(1)}" r="2.6"><title>${r.date}: ${r[key]}</title></circle>`).join('');
const gaps = R.filter(r => r.gap).map(r => `<rect class="gap" x="${(X(r.date) - 4).toFixed(1)}" y="${T}" width="8" height="${H - T - B}"><title>${r.date}: cloud gap (clear ${r.fp_clear_frac})</title></rect>`).join('');

let grid = '';
for (let v = 0; v <= 1.0001; v += 0.25) grid += `<line class="grid" x1="${L}" x2="${W - Rm}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${L - 8}" y="${Y(v) + 4}" text-anchor="end">${Math.round(v * 100)}%</text>`;
for (let y = 2020; y <= 2026; y++) { const x = X(`${y}-01-01`); grid += `<line class="grid" x1="${x}" x2="${x}" y1="${T}" y2="${H - B}"/><text class="ax" x="${x + 4}" y="${H - B + 18}">${y}</text>`; }

const ms = MS.map(([d, label], i) => { const x = X(d); return `<line class="ms" x1="${x}" x2="${x}" y1="${T}" y2="${H - B}"/><text class="msl" transform="translate(${x + 3},${H - B + 30 + (i % 3) * 13})">${label}</text>`; }).join('');

const last = [...R].reverse().find(r => r.fp_cleared_12m !== null);
const svg = `<svg viewBox="0 0 ${W} ${H + 10}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Construction progress curve">
${grid}${gaps}${ms}
<path class="ring" d="${path_('ring_cleared_12m')}"/>
<path class="fp" d="${path_('fp_cleared_12m')}"/>
${dots('fp_nonveg_frac', 'inst')}
${dots('fp_cleared_12m', 'fpd')}
<text class="ttl" x="${L}" y="24">Share of airport footprint cleared of vegetation all year (trailing 12 months, Sentinel-2)</text>
</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Jewar Progress Curve</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{--bg:#fff;--fg:#1d1d1f;--mut:#6b6b70;--grid:#e6e6ea;--fp:#1f6feb;--ring:#9a9aa2;--inst:#f0a33a;--ms:#c2410c;--gap:#d9d9de}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 Segoe UI,system-ui,sans-serif}
main{max-width:1140px;margin:0 auto;padding:20px 16px}
h1{font-size:20px;margin:0 0 4px}p{margin:4px 0;color:var(--mut)}
svg{width:100%;height:auto;margin-top:8px}
.grid{stroke:var(--grid)}.ax{fill:var(--mut);font-size:12px}
.fp{fill:none;stroke:var(--fp);stroke-width:2.6}.fpd{fill:var(--fp)}
.ring{fill:none;stroke:var(--ring);stroke-width:2;stroke-dasharray:5 4}
.inst{fill:var(--inst);opacity:.75}
.ms{stroke:var(--ms);stroke-dasharray:2 3;opacity:.8}.msl{fill:var(--ms);font-size:11px}
.gap{fill:var(--gap);opacity:.6}.ttl{font-size:14px;font-weight:600;fill:var(--fg)}
.key span{display:inline-block;margin-right:16px}.sw{display:inline-block;width:18px;height:3px;vertical-align:middle;margin-right:6px}
</style></head><body><main>
<h1>Noida International Airport (Jewar): construction progress from orbit</h1>
<p>Baseline ${J.params.version.replace('baseline-', '')} · ${R.length} monthly Sentinel-2 L2A scenes, ${R[0].date} to ${R[R.length - 1].date} · footprint ${J.grid.footprint_pixels / 100 | 0} ha (OSM) · latest: <b>${Math.round(last.fp_cleared_12m * 100)}%</b> cleared (${last.date})</p>
<p class="key"><span><i class="sw" style="background:var(--fp)"></i>Footprint, cleared all year (derived)</span><span><i class="sw" style="background:var(--ring)"></i>Surrounding farmland, same measure (derived)</span><span><i class="sw" style="background:var(--inst)"></i>Footprint non-vegetated on the day (derived)</span><span><i class="sw" style="background:var(--ms)"></i>Milestones (reported)</span><span><i class="sw" style="background:var(--gap);height:10px"></i>Cloud gap</span></p>
${svg}
<p>Method: a 10 m pixel counts as cleared when its highest NDVI over the trailing 12 months (July–September monsoon scenes excluded) stays below ${J.params.cleared_ndvi}. That removes the crop cycle, so farmland never counts as cleared. Cloud and shadow are masked with the scene classification layer. Dates with under ${J.params.min_clear_frac * 100}% clear footprint are gaps. Grass, scrub and ponds left inside the airport stay "not cleared", so 100% is not expected. This measures land conversion, not completion of buildings.</p>
</main></body></html>`;
fs.writeFileSync(path.join(OUT, 'progress_chart.html'), html);
console.log('wrote outputs/progress_chart.html');
