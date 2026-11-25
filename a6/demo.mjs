
// Builds outputs/demo.html: the A6 demo page.
// Served by Vercel from docs/ after `node publish.mjs`.
//
// Inputs:
// progress_baseline.json, decision.json, readiness.json,
// quicklook_*.png
//
// Optional Larper outputs:
// progress_ai.json, classifier_metrics.json, classmap_*.png,
// nemotron_review.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULTS } from './economics.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'outputs');

const has = f => fs.existsSync(path.join(OUT, f));

const rd = f =>
  JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));

const opt = f => has(f) ? rd(f) : null;

const esc = s =>
  String(s ?? '').replace(/[&<>"]/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[ch]);

const pct = v =>
  v == null ? '–' : `${Math.round(v * 100)}%`;

// --------------------------------------------------
// DATA
// --------------------------------------------------

const base = rd('progress_baseline.json').results;
const dec = rd('decision.json');
const rdy = opt('readiness.json');

const gnFile = path.join(
  HERE,
  '..',
  'c',
  'outputs',
  'gnss_summary.json'
);

const gn = fs.existsSync(gnFile)
  ? JSON.parse(fs.readFileSync(gnFile, 'utf8'))
  : null;

// Larper
const aiJ = opt('progress_ai.json');
const ai = aiJ ? aiJ.results : [];

const met = opt('classifier_metrics.json');

// NVIDIA Nemotron review
const rev = opt('nemotron_review.json');

const AI_ENDPOINT =
  process.env.AI_ENDPOINT ?? '/api/analyst';

const P0 = DEFAULTS;

// --------------------------------------------------
// AVAILABLE SATELLITE IMAGES
// --------------------------------------------------

const SHOTS = [
  '2020-03',
  '2022-05',
  '2024-03',
  '2025-01',
  '2026-03'
].filter(m => has(`quicklook_${m}.png`));

const MAPS = [
  '2020-03',
  '2022-05',
  '2024-03',
  '2026-03'
].filter(m => has(`classmap_${m}.png`));

const monthName = m =>
  new Date(`${m}-15T00:00:00Z`).toLocaleString(
    'en-GB',
    {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }
  );

const aiAt = m => ai.find(r => r.month === m);

const jan25 = aiAt('2025-01');

const lastShot = SHOTS[SHOTS.length - 1];
const firstShot = SHOTS[0];

if (!firstShot || !lastShot) {
  throw new Error(
    'No quicklook images found in outputs/. At least one quicklook image is required.'
  );
}

// --------------------------------------------------
// AI CONTEXT
// Only labelled data is provided to the analyst.
// --------------------------------------------------

const CTX = {

  asset:
    'Noida International Airport (Jewar), footprint approximately 1333 ha, Sentinel-2 2020-2026',

  reported: [
    ['2021-11-25', 'Foundation stone'],
    ['2025-01-28', '"80% work complete"'],
    ['2026-03-28', 'Phase 1 inaugurated']
  ],

  derived_baseline_cleared_12m: base
    .filter(r =>
      r.fp_cleared_12m != null &&
      /-(01|04|07|10)$/.test(r.month)
    )
    .map(r => [
      r.month,
      r.fp_cleared_12m
    ]),

  derived_larper_all: ai
    .filter(r => r.built_paved_frac != null)
    .map(r => [
      r.month,
      r.built_paved_frac,
      r.bare_frac,
      r.vegetation_frac
    ]),

  larper_metrics: met
    ? {
        overall_agreement_with_worldcover:
          met.overall_accuracy,

        per_class: met.per_class,

        caveat: met.label_caveat
      }
    : 'Larper still running',

  decision: {
    report_pct: dec.report.reported_pct,
    satellite_pct: dec.satellite_observed_pct,
    gap_pts: dec.gap_pts,
    scenarios: dec.scenarios,
    assumed_parameters: dec.parameters,
    caveat: dec.caveat
  },

  readiness: rdy,

  // NVIDIA Nemotron review integration
  nemotron_review: rev
    ? {
        curve: rev.curve?.finding ?? null,

        vision: (rev.vision ?? []).map(v => [
          v.month,
          v.finding
        ])
      }
    : null,

  // Unified NavContinuity product description
  product:
    'NavContinuity: GPS failure -> diversion capacity -> confirmed passenger recovery. A6 combines satellite-derived airport readiness with regional context for Track C GNSS monitoring.'
};

// --------------------------------------------------
// PROGRESS CHART
// --------------------------------------------------

const W = 960;
const H = 360;
const L = 44;
const R = 150;
const T = 18;
const B = 40;

const t0 = Date.UTC(2020, 0, 1);
const t1 = Date.UTC(2026, 11, 31);

const X = d =>
  L +
  (Date.parse(d) - t0) /
  (t1 - t0) *
  (W - L - R);

const Y = v =>
  T + (1 - v) * (H - T - B);

const line = (rows, key) => {

  let d = '';
  let pen = false;

  for (const r of rows) {

    const v = r[key];

    if (v == null) {
      pen = false;
      continue;
    }

    d += `${pen ? 'L' : 'M'}${X(r.date).toFixed(1)},${Y(v).toFixed(1)}`;

    pen = true;
  }

  return d;
};

const lastOf = (rows, key) =>
  [...rows].reverse().find(r => r[key] != null);

let grid = '';

for (const v of [0, 0.25, 0.5, 0.75, 1]) {

  grid += `
    <line class="g"
      x1="${L}"
      x2="${W - R}"
      y1="${Y(v)}"
      y2="${Y(v)}"/>

    <text class="ax"
      x="${L - 8}"
      y="${Y(v) + 4}"
      text-anchor="end">${v * 100}%</text>
  `;
}

for (let y = 2020; y <= 2026; y++) {

  grid += `
    <text class="ax"
      x="${X(`${y}-07-01`)}"
      y="${H - B + 22}"
      text-anchor="middle">${y}</text>
  `;
}

const gaps = base
  .filter(r => r.gap)
  .map(r => `
    <rect class="gap"
      x="${X(r.date) - 3}"
      y="${T}"
      width="6"
      height="${H - T - B}">

      <title>${esc(r.month)}: cloud gap</title>
    </rect>
  `)
  .join('');

const endLabel = (rows, key, cls, text) => {

  const r = lastOf(rows, key);

  return r
    ? `
      <text class="el ${cls}"
        x="${X(r.date) + 8}"
        y="${Y(r[key]) + 4}">
        ${text} ${pct(r[key])}
      </text>
    `
    : '';
};

const claimX = X('2025-01-28');
const claimY = Y(0.8);
const obsY = Y(dec.satellite_observed_pct / 100);

const chart = `
<svg viewBox="0 0 ${W} ${H}"
  role="img"
  aria-labelledby="chartTitle chartDesc">

  <title id="chartTitle">
    Construction progress at Jewar airport, 2020 to 2026
  </title>

  <desc id="chartDesc">
    Land cleared all year (NDVI baseline)
    ${ai.length ? 'and Larper built or paved share' : ''},
    with the reported 80% claim in January 2025.
  </desc>

  ${grid}
  ${gaps}

  <path class="ln base"
    d="${line(base, 'fp_cleared_12m')}"/>

  ${ai.length ? `
    <path class="ln larper"
      d="${line(ai, 'built_or_bare_frac')}"/>
  ` : ''}

  ${endLabel(
    base,
    'fp_cleared_12m',
    'base',
    'Cleared land'
  )}

  ${ai.length ? endLabel(
    ai,
    'built_or_bare_frac',
    'larper',
    'Larper: converted'
  ) : ''}

  <line class="gapline"
    x1="${claimX}"
    x2="${claimX}"
    y1="${claimY}"
    y2="${obsY}"/>

  <circle class="claim"
    cx="${claimX}"
    cy="${claimY}"
    r="6"/>

  <text class="el claimt"
    x="${claimX - 10}"
    y="${claimY - 12}"
    text-anchor="end">
    Reported: 80% complete
  </text>

  <circle class="obs"
    cx="${claimX}"
    cy="${obsY}"
    r="5"/>

  <text class="el base"
    x="${claimX + 10}"
    y="${obsY + 18}">
    Seen from orbit: ${dec.satellite_observed_pct}%
  </text>

</svg>
`;

// --------------------------------------------------
// APP PIECES
// --------------------------------------------------

const larperBuilt = jan25
  ? pct(jan25.built_or_bare_frac)
  : null;

// Decision scenario table
const scen = dec.scenarios.map(s => `
  <tr${s.name.startsWith('Satellite') ? ' class="hi"' : ''}>

    <td>${esc(s.name)}</td>

    <td>${s.p.toFixed(2)}</td>

    <td>
      $${Math.round(s.release).toLocaleString('en-US')}
    </td>

    <td>
      $${Math.round(s.inspect).toLocaleString('en-US')}
    </td>

    <td>
      <b>${s.action === 'inspect' ? 'Inspect' : 'Release'}</b>
    </td>

  </tr>
`).join('');

// Classifier metrics
const classRows = met
  ? met.per_class.map(c => `
      <tr>

        <td>
          <i class="dot ${esc(c.class)}"></i>
          ${esc(c.class.replace('_', ' / '))}
        </td>

        <td>${pct(c.recall)}</td>

        <td>${pct(c.precision)}</td>

      </tr>
    `).join('')
  : '';

// --------------------------------------------------
// NEMOTRON REVIEW OUTPUT
// --------------------------------------------------

const reviewItems = rev
  ? [

      ...(rev.curve?.finding
        ? [
            `
              <div class="msg bot">
                <b>Review: Larper vs baseline</b>
                ${esc(rev.curve.finding)}
              </div>
            `
          ]
        : []),

      ...(rev.vision ?? [])
        .filter(v => v.finding)
        .map(v => `
          <div class="msg bot">
            <b>Map check, ${monthName(v.month)}</b>
            ${esc(v.finding)}
          </div>
        `)

    ].join('')
  : '';

// --------------------------------------------------
// HTML DASHBOARD
// --------------------------------------------------

const html = `
<!doctype html>
<html lang="en">

<head>

<meta charset="utf-8">

<meta name="viewport"
  content="width=device-width,initial-scale=1">

<title>NavContinuity Site Monitor</title>

<meta name="description"
  content="Lender's site monitor: Sentinel-2 and the Larper model check Jewar airport's construction claims; NVIDIA Nemotron reviews the evidence.">

<link rel="preconnect"
  href="https://fonts.googleapis.com">

<link rel="preconnect"
  href="https://fonts.gstatic.com"
  crossorigin>

<link
  href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap"
  rel="stylesheet">

<style>

:root {
  --bg:#E9EDEC;
  --panel:#FFFFFF;
  --rail:#17232C;
  --railfg:#C9D3D8;
  --ink:#17232C;
  --mut:#5A6870;
  --rule:#D3DAD9;
  --larper:#2C55C9;
  --veg:#3F7A35;
  --claim:#B26E12;
  --claimbg:#FBEFD9;
  --ok:#2E7D4F;
  --focus:#2C55C9;
}

@media (prefers-color-scheme:dark) {
  :root:not([data-theme="light"]) {
    --bg:#0F171C;
    --panel:#17222A;
    --rail:#0B1216;
    --railfg:#AEBBC1;
    --ink:#E4EBEA;
    --mut:#93A2A9;
    --rule:#2A3840;
    --larper:#86A3FF;
    --veg:#8BC06B;
    --claim:#E6A84A;
    --claimbg:#33270F;
    --ok:#6CC08F;
    --focus:#86A3FF;
  }
}

:root[data-theme="dark"] {
  --bg:#0F171C;
  --panel:#17222A;
  --rail:#0B1216;
  --railfg:#AEBBC1;
  --ink:#E4EBEA;
  --mut:#93A2A9;
  --rule:#2A3840;
  --larper:#86A3FF;
  --veg:#8BC06B;
  --claim:#E6A84A;
  --claimbg:#33270F;
  --ok:#6CC08F;
  --focus:#86A3FF;
}

* {
  box-sizing:border-box;
}

html,body {
  margin:0;
  background:var(--bg);
  color:var(--ink);
  font:14px/1.5 Archivo,system-ui,sans-serif;
}

:focus-visible {
  outline:3px solid var(--focus);
  outline-offset:2px;
}

button,select,input[type=text] {
  font:inherit;
  color:var(--ink);
  background:var(--panel);
  border:1px solid var(--rule);
  border-radius:6px;
  padding:6px 10px;
}

button {
  cursor:pointer;
  font-weight:650;
}

button.primary {
  background:var(--larper);
  border-color:var(--larper);
  color:#fff;
}

button:disabled {
  opacity:.55;
  cursor:progress;
}

.app {
  display:grid;
  grid-template-columns:220px minmax(0,1fr) 340px;
  grid-template-rows:54px 1fr;
  min-height:100vh;
}

.top {
  grid-column:1/-1;
  display:flex;
  align-items:center;
  gap:22px;
  padding:0 18px;
  background:var(--rail);
  color:var(--railfg);
  border-bottom:1px solid #000;
}

.brand {
  font-weight:800;
  font-variation-settings:"wdth" 118;
  color:#fff;
  font-size:17px;
  letter-spacing:.01em;
  display:flex;
  align-items:center;
  gap:9px;
}

.brand svg {
  width:22px;
  height:22px;
}

.mods {
  display:flex;
  gap:4px;
  height:100%;
}

.mods a {
  display:flex;
  align-items:center;
  gap:7px;
  padding:0 12px;
  color:var(--railfg);
  text-decoration:none;
  border-bottom:2px solid transparent;
  font-weight:600;
}

.mods a[aria-current] {
  color:#fff;
  border-bottom-color:#86A3FF;
}

.mods a.soon {
  opacity:.55;
  cursor:default;
}

.mods small {
  font-size:11px;
  font-weight:600;
  border:1px solid currentColor;
  border-radius:4px;
  padding:0 5px;
}

.top .src {
  margin-left:auto;
  font-size:12px;
}

.side {
  background:var(--rail);
  color:var(--railfg);
  padding:16px 12px;
}

.side h2 {
  font-size:12px;
  font-weight:650;
  color:#8796A0;
  margin:6px 6px 8px;
}

.asset {
  display:block;
  width:100%;
  text-align:left;
  background:transparent;
  border:1px solid transparent;
  color:var(--railfg);
  border-radius:8px;
  padding:10px;
  margin-bottom:6px;
}

.asset[aria-current] {
  background:#22313B;
  border-color:#33454F;
  color:#fff;
}

.asset span {
  display:block;
  font-size:12px;
  color:#8796A0;
  font-weight:500;
}

.pill {
  display:inline-block;
  font-size:11px;
  font-weight:700;
  padding:1px 7px;
  border-radius:10px;
  margin-top:5px;
}

.pill.inspect {
  background:var(--claimbg);
  color:var(--claim);
}

.pill.idle {
  background:#22313B;
  color:#8796A0;
}

.side .add {
  color:#8796A0;
  border:1px dashed #33454F;
  background:transparent;
  width:100%;
  margin-top:6px;
}

.side .tracks {
  margin-top:26px;
  font-size:12px;
  line-height:1.5;
  color:#8796A0;
  padding:0 6px;
}

.main {
  padding:18px 20px 40px;
  min-width:0;
}

.head {
  display:flex;
  flex-wrap:wrap;
  align-items:flex-end;
  gap:10px 24px;
  margin-bottom:14px;
}

.head h1 {
  font-size:26px;
  line-height:1.1;
  margin:0;
  font-weight:800;
  font-variation-settings:"wdth" 112;
}

.head p {
  margin:2px 0 0;
  color:var(--mut);
}

.alert {
  margin-left:auto;
  display:flex;
  align-items:center;
  gap:12px;
  background:var(--claimbg);
  color:var(--claim);
  border-radius:8px;
  padding:9px 14px;
  font-weight:700;
}

.alert small {
  display:block;
  font-weight:500;
  color:var(--ink);
  opacity:.8;
}

.tiles {
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:10px;
  margin-bottom:14px;
}

.tile {
  background:var(--panel);
  border:1px solid var(--rule);
  border-radius:8px;
  padding:12px 14px;
}

.tile .k {
  color:var(--mut);
  font-size:12.5px;
}

.tile .v {
  font-size:30px;
  line-height:1.1;
  font-weight:800;
  font-variation-settings:"wdth" 75;
  margin:3px 0 2px;
  font-variant-numeric:tabular-nums;
}

.tile .s {
  font-size:12px;
  color:var(--mut);
}

.tile.claim .v {
  color:var(--claim);
}

.tile.orbit .v {
  color:var(--veg);
}

.tile.larp .v {
  color:var(--larper);
}

.ev {
  font-size:11px;
  font-weight:650;
  border:1px solid currentColor;
  border-radius:4px;
  padding:0 5px;
  margin-left:4px;
}

.ev.rep {color:var(--claim)}
.ev.der {color:var(--veg)}
.ev.ass {color:var(--mut)}
.ev.ai {color:var(--larper)}

.panel {
  background:var(--panel);
  border:1px solid var(--rule);
  border-radius:8px;
  padding:14px 16px;
  margin-bottom:14px;
}

.panel h2 {
  font-size:15px;
  margin:0 0 10px;
  font-weight:750;
  display:flex;
  align-items:center;
  gap:8px;
  flex-wrap:wrap;
}

.panel h2 .tools {
  margin-left:auto;
  display:flex;
  gap:6px;
  font-weight:500;
}

.seg {
  display:inline-flex;
  border:1px solid var(--rule);
  border-radius:6px;
  overflow:hidden;
}

.seg button {
  border:0;
  border-radius:0;
  padding:4px 10px;
  font-weight:600;
}

.seg button[aria-pressed="true"] {
  background:var(--ink);
  color:var(--panel);
}

.viewer {
  position:relative;
  border-radius:6px;
  overflow:hidden;
  aspect-ratio:816/473;
  background:#000;
  user-select:none;
}

.viewer img {
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}

.viewer .clip {
  position:absolute;
  inset:0;
  clip-path:inset(0 calc(100% - var(--pos)) 0 0);
}

.viewer .handle {
  position:absolute;
  top:0;
  bottom:0;
  left:var(--pos);
  width:2px;
  background:#fff;
  box-shadow:0 0 0 1px rgba(0,0,0,.35);
  pointer-events:none;
}

.viewer .handle::after {
  content:"";
  position:absolute;
  top:50%;
  left:50%;
  width:26px;
  height:26px;
  margin:-13px 0 0 -13px;
  border-radius:50%;
  background:#fff;
  box-shadow:0 1px 4px rgba(0,0,0,.4);
}

.viewer input {
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  opacity:0;
  cursor:ew-resize;
  margin:0;
}

.viewer:focus-within {
  outline:3px solid var(--focus);
  outline-offset:2px;
}

.tag {
  position:absolute;
  top:10px;
  font-size:12px;
  font-weight:700;
  color:#fff;
  background:rgba(10,20,25,.66);
  padding:2px 8px;
  border-radius:4px;
  pointer-events:none;
}

.tag.l {left:10px}
.tag.r {right:10px}

.scrub {
  display:flex;
  flex-wrap:wrap;
  gap:8px 16px;
  align-items:center;
  margin-top:10px;
  font-size:13px;
  color:var(--mut);
}

.legend i,.dot {
  display:inline-block;
  width:10px;
  height:10px;
  border-radius:2px;
  margin-right:5px;
  vertical-align:-1px;
}

.dot.built_paved,.legend .b {background:#dc3c3c}
.dot.bare,.legend .a {background:#e6c878}
.dot.vegetation,.legend .g {background:#3c8c3c}
.dot.water,.legend .w {background:#3c78dc}

.legend {
  display:flex;
  gap:12px;
  flex-wrap:wrap;
}

.legend[hidden] {
  display:none;
}

.two {
  display:grid;
  grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);
  gap:14px;
}

svg {
  width:100%;
  height:auto;
  display:block;
}

.g {stroke:var(--rule)}
.ax {fill:var(--mut);font-size:12px}
.gap {fill:var(--rule);opacity:.55}

.ln {
  fill:none;
  stroke-width:2.6;
  stroke-linejoin:round;
}

.ln.base {stroke:var(--veg)}
.ln.larper {stroke:var(--larper)}

.el {
  font-size:13px;
  font-weight:700;
}

.el.base {fill:var(--veg)}
.el.larper {fill:var(--larper)}
.el.claimt {fill:var(--claim)}

.claim {fill:var(--claim)}
.obs {fill:var(--veg)}

.gapline {
  stroke:var(--claim);
  stroke-width:2;
  stroke-dasharray:3 3;
}

.tbl {
  border-collapse:collapse;
  width:100%;
  font-size:13px;
  font-variant-numeric:tabular-nums;
}

.tbl th,.tbl td {
  border-bottom:1px solid var(--rule);
  padding:6px 6px;
  text-align:left;
}

.tbl th {
  font-weight:650;
  color:var(--mut);
}

.tbl tr.hi td {
  background:var(--claimbg);
}

.wrap {
  overflow-x:auto;
}

.big {
  font-size:34px;
  font-weight:800;
  font-variation-settings:"wdth" 75;
  line-height:1;
}

.note {
  color:var(--mut);
  font-size:12.5px;
  margin:8px 0 0;
}

.wait {
  color:var(--mut);
  border-left:3px solid var(--rule);
  padding:4px 0 4px 10px;
  margin:0;
}

.ctl {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px 22px;
  margin-bottom:10px;
}

.ctl label {
  font-size:13px;
  color:var(--mut);
}

.ctl output {
  font-weight:700;
  color:var(--ink);
}

input[type=range] {
  width:100%;
  accent-color:var(--larper);
}

.verdict {
  display:flex;
  align-items:center;
  gap:14px;
  border-radius:8px;
  padding:10px 14px;
  margin:4px 0 10px;
}

.verdict.inspect {
  background:var(--claimbg);
  color:var(--claim);
}

.verdict.release {
  background:color-mix(in srgb,var(--ok) 14%,transparent);
  color:var(--ok);
}

.verdict b {
  font-size:19px;
  font-variation-settings:"wdth" 92;
}

.verdict span {
  color:var(--ink);
  font-size:13px;
}

.flow {
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
}

.flow div {
  border:1px solid var(--rule);
  border-radius:8px;
  padding:10px 12px;
}

.flow b {
  display:block;
  margin-bottom:2px;
}

.flow .live {
  border-color:var(--larper);
}

.flow small {
  font-size:11px;
  font-weight:700;
  color:var(--larper);
}

.flow .nx small {
  color:var(--mut);
}

.co {
  background:var(--panel);
  border-left:1px solid var(--rule);
  display:flex;
  flex-direction:column;
  min-height:0;
  position:sticky;
  top:0;
  height:100vh;
}

.co header {
  padding:14px 16px 10px;
  border-bottom:1px solid var(--rule);
}

.co header h2 {
  margin:0;
  font-size:15px;
  font-weight:750;
}

.co header p {
  margin:2px 0 0;
  font-size:12px;
  color:var(--mut);
}

.feed {
  flex:1;
  overflow-y:auto;
  padding:12px 14px;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.msg {
  border-radius:8px;
  padding:9px 11px;
  white-space:pre-wrap;
  font-size:13px;
  line-height:1.5;
}

.msg b {
  display:block;
  margin-bottom:3px;
}

.msg.bot {
  background:color-mix(in srgb,var(--larper) 9%,var(--panel));
  border:1px solid color-mix(in srgb,var(--larper) 22%,var(--rule));
}

.msg.me {
  background:var(--bg);
  align-self:flex-end;
  max-width:88%;
}

.msg.err {
  border:1px solid var(--claim);
  color:var(--ink);
}

.chips {
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  padding:0 14px 8px;
}

.chips button {
  font-size:12px;
  padding:4px 9px;
  border-radius:14px;
  font-weight:600;
}

.composer {
  display:flex;
  gap:6px;
  padding:10px 14px 14px;
  border-top:1px solid var(--rule);
}

.composer input {
  flex:1;
  min-width:0;
}

@media (max-width:1180px) {

  .app {
    grid-template-columns:200px minmax(0,1fr);
  }

  .co {
    grid-column:1/-1;
    position:static;
    height:auto;
    border-left:0;
    border-top:1px solid var(--rule);
  }

  .feed {
    max-height:420px;
  }
}

@media (max-width:820px) {

  .app {
    grid-template-columns:1fr;
    grid-template-rows:auto;
  }

  .top {
    flex-wrap:wrap;
    padding:10px 14px;
    height:auto;
  }

  .mods {
    height:auto;
    flex-wrap:wrap;
  }

  .mods a {
    padding:6px 8px;
  }

  .top .src {
    margin-left:0;
  }

  .side {
    display:flex;
    gap:8px;
    overflow-x:auto;
    padding:10px;
  }

  .side h2,
  .side .tracks,
  .side .add {
    display:none;
  }

  .asset {
    min-width:200px;
    margin:0;
  }

  .tiles {
    grid-template-columns:1fr 1fr;
  }

  .two,.ctl,.flow {
    grid-template-columns:1fr;
  }

  .alert {
    margin-left:0;
  }
}

@media (prefers-reduced-motion:no-preference) {

  .viewer.intro .clip {
    transition:clip-path .9s cubic-bezier(.3,.7,.2,1);
  }

  .viewer.intro .handle {
    transition:left .9s cubic-bezier(.3,.7,.2,1);
  }
}

</style>
</head>

<body>

<div class="app">

<!-- ==========================================
     TOP NAVIGATION
=========================================== -->

<header class="top">

  <div class="brand">

    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10"
        fill="none"
        stroke="#86A3FF"
        stroke-width="2"/>

      <path d="M4 15 L20 9"
        stroke="#fff"
        stroke-width="2.4"
        stroke-linecap="round"/>

      <circle cx="12" cy="12" r="2.4"
        fill="#E6A84A"/>
    </svg>

    NavContinuity

  </div>

  <nav class="mods" aria-label="Modules">

    <a href="index.html" aria-current="page">
      Site Monitor
      <small>Track A6</small>
    </a>

    <a href="c.html">
      GNSS Watch
      <small>Track C</small>
    </a>

    <a href="b3.html">
      Nav Integrity
      <small>Track B3</small>
    </a>

    <a class="soon" aria-disabled="true">
      Passenger Recovery
      <small>next</small>
    </a>

  </nav>

  <div class="src">
    Sentinel-2 · ${base.length} monthly scenes · latest
    ${monthName(base[base.length - 1].month)}
  </div>

</header>

<!-- ==========================================
     LEFT SIDEBAR
=========================================== -->

<aside class="side" aria-label="Monitored assets">

  <h2>Assets</h2>

  <button class="asset" aria-current="true">

    Noida International Airport

    <span>
      Jewar, Uttar Pradesh · 1,333 ha
    </span>

    <em class="pill inspect">
      Inspect before paying
    </em>

  </button>

  <button class="asset" disabled>

    Navi Mumbai International

    <span>
      Backup site · not yet monitored
    </span>

    <em class="pill idle">
      Add to monitor
    </em>

  </button>

  <p class="tracks">
    Site Monitor tells lenders whether a project's
    progress claims match what satellites see, and
    tells NavContinuity which airports are ready to
    take diverted flights.
  </p>

</aside>

<!-- ==========================================
     MAIN DASHBOARD
=========================================== -->

<main class="main" id="main">

  <div class="head">

    <div>

      <h1>Noida International Airport, Jewar</h1>

      <p>
        Greenfield airport · foundation stone 25 Nov 2021 ·
        phase 1 opened 28 Mar 2026 (reported)
      </p>

    </div>

    <div class="alert" role="status">

      Satellite progress lags the builder's claim by
      ${dec.gap_pts} points

      <small>
        Recommended: inspect before releasing the next tranche
      </small>

    </div>

  </div>

  <!-- KEY FIGURES -->

  <section class="tiles" aria-label="Key figures for January 2025">

    <div class="tile claim">

      <div class="k">
        Builder's claim, Jan 2025
        <span class="ev rep">reported</span>
      </div>

      <div class="v">80%</div>

      <div class="s">
        "work complete" (Business Standard)
      </div>

    </div>

    <div class="tile orbit">

      <div class="k">
        Seen from orbit, Jan 2025
        <span class="ev der">derived</span>
      </div>

      <div class="v">
        ${dec.satellite_observed_pct}%
      </div>

      <div class="s">
        land converted, Sentinel-2
      </div>

    </div>

    <div class="tile larp">

      <div class="k">
        Larper: converted land
        <span class="ev ai">AI</span>
      </div>

      <div class="v">
        ${larperBuilt ?? '…'}
      </div>

      <div class="s">
        ${larperBuilt
          ? 'of the site, Jan 2025'
          : 'model run in progress'}
      </div>

    </div>

    <div class="tile">

      <div class="k">
        Larper accuracy
        <span class="ev ai">AI</span>
      </div>

      <div class="v">
        ${met
          ? Math.round(met.overall_accuracy * 100) + '%'
          : '…'}
      </div>

      <div class="s">
        ${met
          ? 'agreement with ESA WorldCover on unseen land'
          : 'model run in progress'}
      </div>

    </div>

  </section>

  <!-- SATELLITE IMAGE VIEWER -->

  <section class="panel" aria-labelledby="h-view">

    <h2 id="h-view">

      Site imagery

      <span class="tools">

        <span class="seg" role="group" aria-label="Layer">

          <button id="lyPhoto" aria-pressed="true">
            Satellite photo
          </button>

          <button
            id="lyLarper"
            aria-pressed="false"
            ${MAPS.length
              ? ''
              : 'disabled title="Available when Larper finishes"'}>

            Larper layer

          </button>

        </span>

      </span>

    </h2>

    <div class="viewer"
      id="viewer"
      style="--pos:50%">

      <img
        id="imgB"
        src="quicklook_${lastShot}.png"
        alt="Site, ${monthName(lastShot)}">

      <div class="clip">

        <img
          id="imgA"
          src="quicklook_${firstShot}.png"
          alt="Site, ${monthName(firstShot)}">

      </div>

      <div class="handle" aria-hidden="true"></div>

      <span class="tag l" id="tagA">
        ${monthName(firstShot)}
      </span>

      <span class="tag r" id="tagB">
        ${monthName(lastShot)}
      </span>

      <input
        type="range"
        id="swipeR"
        min="0"
        max="100"
        value="50"
        aria-label="Drag to compare the two dates">

    </div>

    <div class="scrub">

      <label>
        Left

        <select id="selA">

          ${SHOTS.map(m => `
            <option value="${m}"
              ${m === firstShot ? 'selected' : ''}>
              ${monthName(m)}
            </option>
          `).join('')}

        </select>
      </label>

      <label>
        Right

        <select id="selB">

          ${SHOTS.map(m => `
            <option value="${m}"
              ${m === lastShot ? 'selected' : ''}>
              ${monthName(m)}
            </option>
          `).join('')}

        </select>
      </label>

      <span>
        Yellow: airport boundary (OSM)
      </span>

      <span class="legend" id="legend" hidden>

        <span><i class="b"></i>built / paved</span>
        <span><i class="a"></i>bare</span>
        <span><i class="g"></i>vegetation</span>
        <span><i class="w"></i>water</span>

      </span>

    </div>

  </section>

  <!-- PROGRESS CHART -->

  <section class="panel" aria-labelledby="h-prog">

    <h2 id="h-prog">

      Progress over time

      <span class="ev der">derived</span>

    </h2>

    ${chart}

    <p class="note">

      Green: land free of vegetation all year
      (crop cycles never count).

      ${ai.length
        ? 'Blue: Larper converted land (built or paved plus bare earth). The built-only share is noisy (it reads some dry 2020 fields as paved), so we do not quote it alone.'
        : "Larper's built/paved line is added when its run finishes."}

      Grey: too cloudy to measure.

      After 2025 the green line dips as grass regrows
      on unpaved ground; Larper is built to separate
      that from real change.

    </p>

  </section>

  <!-- DECISION + MODEL -->

  <div class="two">

    <section class="panel" aria-labelledby="h-dec">

      <h2 id="h-dec">

        Tranche decision

        <span class="ev ass">assumed costs</span>

      </h2>

      <div class="ctl">

        <label for="c">

          Inspection cost

          <output id="cv"></output>

          <input
            id="c"
            type="range"
            min="2000"
            max="60000"
            step="1000"
            value="${P0.inspection_cost.value}">

        </label>

        <label for="p">

          Chance report is optimistic

          <output id="pv"></output>

          <input
            id="p"
            type="range"
            min="0"
            max="0.6"
            step="0.005"
            value="${dec.scenarios[1].p.toFixed(3)}">

        </label>

      </div>

      <div class="verdict"
        id="verdict"
        aria-live="polite">
      </div>

      <div class="wrap">

        <table class="tbl">

          <tr>
            <th scope="col">Evidence</th>
            <th scope="col">Chance</th>
            <th scope="col">If released</th>
            <th scope="col">If inspected</th>
            <th scope="col">Do</th>
          </tr>

          ${scen}

        </table>

      </div>

      <p class="note">

        $300,000 at risk, inspection 90% effective
        (assumed).

        Inspect when the chance exceeds
        ${(dec.scenarios[0].break_even_p * 100).toFixed(1)}%.

      </p>

    </section>

    <section class="panel" aria-labelledby="h-model">

      <h2 id="h-model">

        Larper model

        <span class="ev ai">AI</span>

      </h2>

      ${met
        ? `

          <p style="margin:0 0 8px">

            Random Forest,
            ${met.params.rf.nEstimators} trees,
            10 spectral features.

            Trained on ESA WorldCover labels around the
            airport, tested on a separate block of land
            (${met.n_test.toLocaleString('en-US')} pixels).

          </p>

          <table class="tbl">

            <tr>
              <th scope="col">Class</th>
              <th scope="col">Found</th>
              <th scope="col">Right when it says so</th>
            </tr>

            ${classRows}

          </table>

          <p class="note">

            Measured against WorldCover, itself a model;
            bare earth had few training examples.

          </p>

        `
        : `

          <p class="wait">

            Larper is training on this run.

            Its accuracy table and the map layer appear
            here when it finishes.

          </p>

        `
      }

    </section>

  </div>

  <!-- NAVCONTINUITY INTEGRATION -->

  <section class="panel" aria-labelledby="h-flow">

    <h2 id="h-flow">
      How this feeds NavContinuity
    </h2>

    <div class="flow">

      <div class="live">

        <small>Live · Track A6</small>

        <b>Is the airport real?</b>

        ${rdy
          ? `Land conversion from
             ${monthName(rdy.satellite.conversion_start_month)},
             levelled off
             ${monthName(rdy.satellite.plateau_month)}.`
          : 'Satellite-derived land conversion is being monitored.'}

        Counts as diversion capacity only once
        an airline confirms slots.

      </div>

      <div class="live">

        <small>Live · Track C</small>

        <b>Is GPS degraded nearby?</b>

        ${gn
          ? `
            Within ${gn.jewar_region.radius_km} km:

            <b style="display:inline">
              ${esc(gn.jewar_region.status)}
            </b>

            (${gn.jewar_region.aircraft_seen.toLocaleString('en-US')}
            aircraft, ${gn.days.map(esc).join(', ')}).

            Hotspots sit on the India–Pakistan border.

            <a href="c.html">Open GNSS Watch</a>
          `
          : `
            Aircraft GPS-integrity reports within 50 km.
            No data reads "unknown", never "safe".
          `
        }

      </div>

      <div class="nx">

        <small>Next</small>

        <b>Are passengers recovered?</b>

        Diverted travellers get a confirmed rebooking,
        care at the right airport, and their bags tracked.

      </div>

    </div>

    <p class="note">

      Who pays: lenders and project-monitoring cells
      (per-asset fee); airlines for passenger recovery.

      Pricing not yet validated.

    </p>

  </section>

  <p class="note">

    Sentinel-2 L2A (ESA Copernicus via Element 84) ·
    boundary © OpenStreetMap (ODbL) ·
    labels ESA WorldCover 2021 ·
    milestones from news reports ·
    economics illustrative ·
    code: github.com/rehancodes-web/Mack.1

  </p>

</main>

<!-- ==========================================
     NEMOTRON ANALYST SIDEBAR
=========================================== -->

<aside class="co" aria-label="Nemotron analyst">

  <header>

    <h2>
      Analyst

      <span class="ev ai">
        NVIDIA Nemotron
      </span>
    </h2>

    <p>
      Answers from this site's evidence only.
      It can be wrong: check against the panels.
    </p>

  </header>

  <div class="feed" id="feed" aria-live="polite">

    <div class="msg bot">

      <b>Ready</b>

      I can explain the progress gap, write a lender
      memo from the current slider values, or check
      Larper's map against the satellite photo.

    </div>

    ${reviewItems}

  </div>

  <div class="chips">

    <button data-q="memo" class="primary">
      Write lender memo
    </button>

    ${MAPS.length
      ? '<button data-q="verify">Check Larper\\'s map</button>'
      : ''
    }

    <button data-q="Why does the green line fall after 2025?">
      Why the dip after 2025?
    </button>

    <button data-q="Can this airport take diverted flights today?">
      Diversion-ready?
    </button>

  </div>

  <form class="composer" id="composer">

    <input
      type="text"
      id="q"
      maxlength="600"
      placeholder="Ask about this site…"
      aria-label="Your question">

    <button type="submit">Ask</button>

  </form>

</aside>

</div>

<!-- ==========================================
     JAVASCRIPT
=========================================== -->

<script>

(function () {

  // ------------------------------------------
  // SATELLITE IMAGE COMPARISON
  // ------------------------------------------

  const MAPS = ${JSON.stringify(MAPS)};

  const v = document.getElementById('viewer');
  const r = document.getElementById('swipeR');

  const A = document.getElementById('imgA');
  const B = document.getElementById('imgB');

  const sa = document.getElementById('selA');
  const sb = document.getElementById('selB');

  const ta = document.getElementById('tagA');
  const tb = document.getElementById('tagB');

  let layer = 'quicklook';

  const pos = x =>
    v.style.setProperty('--pos', x + '%');

  r.addEventListener('input', () => {

    v.classList.remove('intro');

    pos(r.value);

  });

  const lbl = s =>
    s.options[s.selectedIndex].text;

  function src(m) {

    return (
      layer === 'classmap' && MAPS.includes(m)
        ? 'classmap_'
        : 'quicklook_'
    ) + m + '.png';

  }

  function paint() {

    A.src = src(sa.value);
    B.src = src(sb.value);

    A.alt =
      'Site, ' +
      lbl(sa) +
      (layer === 'classmap' ? ' (Larper layer)' : '');

    B.alt =
      'Site, ' +
      lbl(sb) +
      (layer === 'classmap' ? ' (Larper layer)' : '');

    ta.textContent = lbl(sa);
    tb.textContent = lbl(sb);

  }

  sa.onchange = sb.onchange = paint;

  const bP = document.getElementById('lyPhoto');
  const bL = document.getElementById('lyLarper');

  const lg = document.getElementById('legend');

  function setLayer(l) {

    layer = l;

    bP.setAttribute(
      'aria-pressed',
      l === 'quicklook'
    );

    bL.setAttribute(
      'aria-pressed',
      l === 'classmap'
    );

    lg.hidden = l !== 'classmap';

    if (l === 'classmap') {

      for (const s of [sa, sb]) {

        for (const o of s.options) {

          o.disabled = !MAPS.includes(o.value);

        }

      }

      if (!MAPS.includes(sa.value)) {
        sa.value = MAPS[0];
      }

      if (!MAPS.includes(sb.value)) {
        sb.value = MAPS[MAPS.length - 1];
      }

    } else {

      for (const s of [sa, sb]) {

        for (const o of s.options) {
          o.disabled = false;
        }

      }

    }

    paint();

  }

  bP.onclick = () => setLayer('quicklook');

  bL.onclick = () => {

    if (MAPS.length) {
      setLayer('classmap');
    }

  };

  v.classList.add('intro');

  pos(86);

  setTimeout(() => {

    pos(50);
    r.value = 50;

  }, 400);

  // ------------------------------------------
  // FINANCIAL DECISION MODEL
  // ------------------------------------------

  const L = ${P0.loss_if_optimistic.value};
  const e = ${P0.inspection_effectiveness.value};

  const c = document.getElementById('c');
  const p = document.getElementById('p');

  const fmt = n =>
    '$' + Math.round(n).toLocaleString('en-US');

  function upd() {

    const C = +c.value;
    const P = +p.value;

    const rel = P * L;

    const ins = C + P * (1 - e) * L;

    const insp = ins < rel;

    const vd = document.getElementById('verdict');

    document.getElementById('cv').textContent =
      fmt(C);

    document.getElementById('pv').textContent =
      (P * 100)
        .toFixed(1)
        .replace(/\\.0$/, '') + '%';

    vd.className =
      'verdict ' + (insp ? 'inspect' : 'release');

    vd.innerHTML = `
      <b>
        ${insp
          ? 'Inspect before paying'
          : 'Release the payment'}
      </b>

      <span>
        Expected cost: release ${fmt(rel)},
        inspect ${fmt(ins)}
      </span>
    `;

  }

  c.oninput = p.oninput = upd;

  upd();

  // ------------------------------------------
  // NEMOTRON AI ANALYST
  // ------------------------------------------

  const EP = ${JSON.stringify(AI_ENDPOINT)};

  const CTX = ${JSON.stringify(CTX).replace(/</g, '\\u003c')};

  const feed = document.getElementById('feed');

  let visualCheck = null;

  const btns = () =>
    document.querySelectorAll(
      '.chips button,.composer button'
    );

  // ------------------------------------------
  // CHAT MESSAGE HELPER
  // ------------------------------------------

  function add(cls, title, text) {

    const d = document.createElement('div');

    d.className = 'msg ' + cls;

    if (title) {

      const b = document.createElement('b');

      b.textContent = title;

      d.appendChild(b);

    }

    d.appendChild(
      document.createTextNode(text)
    );

    feed.appendChild(d);

    feed.scrollTop = feed.scrollHeight;

    return d;

  }

  // ------------------------------------------
  // IMAGE BASE64 CONVERSION
  // ------------------------------------------

  async function b64(url) {

    const b = await (
      await fetch(url)
    ).blob();

    return await new Promise(res => {

      const fr = new FileReader();

      fr.onload = () =>
        res(String(fr.result).split(',')[1]);

      fr.readAsDataURL(b);

    });

  }

  // ------------------------------------------
  // SEND REQUEST TO AI ENDPOINT
  // ------------------------------------------

  async function ask(shown, question, images) {

    add('me', '', shown);

    const w = add(
      'bot',
      'Nemotron',
      'Working on it…'
    );

    btns().forEach(b => b.disabled = true);

    const ctx = {

      ...CTX,

      current_sliders: {

        inspection_cost: +c.value,

        p_report_optimistic: +p.value,

        loss_if_optimistic: L,

        inspection_effectiveness: e

      },

      nemotron_live_visual_check: visualCheck

    };

    try {

      const res = await fetch(EP, {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          question,

          context: ctx,

          images: images || []

        })

      });

      const j = await res.json();

      if (j.answer) {

        w.lastChild.textContent = j.answer;

        return j.answer;

      }

      w.className = 'msg err';

      w.lastChild.textContent =
        'The analyst could not answer: ' +
        (j.error || ('HTTP ' + res.status)) +
        '. The panels on the left are unaffected.';

      return null;

    } catch (err) {

      w.className = 'msg err';

      w.lastChild.textContent =
        'The analyst is unreachable (' +
        err.message +
        '). The panels on the left are unaffected.';

      return null;

    } finally {

      btns().forEach(b => b.disabled = false);

      feed.scrollTop = feed.scrollHeight;

    }

  }

  // ------------------------------------------
  // NEMOTRON QUICK ACTIONS
  // ------------------------------------------

  document.querySelectorAll('.chips button')
    .forEach(b => {

      b.onclick = async () => {

        const q = b.dataset.q;

        // LENDER MEMO
        if (q === 'memo') {

          return ask(

            'Write lender memo',

            'Write a short lender memo: release the next tranche on the contractor report, or commission an inspection first, using the current slider values. Headings: Evidence / Decision / Caveats.'

          );

        }

        // LARPER VISUAL VERIFICATION
        if (q === 'verify') {

          const m = MAPS.includes(sb.value)
            ? sb.value
            : MAPS[MAPS.length - 1];

          const row = (
            CTX.derived_larper_all || []
          ).find(x => x[0] === m);

          const imgs = [

            {
              label:
                'Sentinel-2 true colour ' +
                m +
                ' (yellow = airport boundary)',

              mime: 'image/png',

              data: await b64(
                'quicklook_' + m + '.png'
              )
            },

            {
              label:
                'Larper class map ' + m,

              mime: 'image/png',

              data: await b64(
                'classmap_' + m + '.png'
              )
            }

          ];

          const a = await ask(

            "Check Larper's map for " + m,

            'Cross-check the Larper class map for ' +
            m +
            ' against the satellite photo. Larper says ' +
            (
              row
                ? (
                    'built/paved ' +
                    Math.round(row[1] * 100) +
                    '%, bare ' +
                    Math.round(row[2] * 100) +
                    '%, vegetation ' +
                    Math.round(row[3] * 100) +
                    '%'
                  )
                : '(see context)'
            ) +
            '. Where does the map look right, where does it look wrong, and how far should we trust these numbers?',

            imgs

          );

          if (a) {

            visualCheck = {

              month: m,

              finding: a.slice(0, 1500)

            };

          }

          return;

        }

        // NORMAL QUESTIONS
        ask(
          b.textContent,
          q
        );

      };

    });

  // ------------------------------------------
  // USER CHAT INPUT
  // ------------------------------------------

  document.getElementById('composer')
    .onsubmit = ev => {

      ev.preventDefault();

      const i = document.getElementById('q');

      const t = i.value.trim();

      if (!t) {

        i.focus();

        return;

      }

      i.value = '';

      ask(t, t);

    };

})();

</script>

</body>
</html>
`;

fs.writeFileSync(
  path.join(OUT, 'demo.html'),
  html
);

console.log(
  `wrote outputs/demo.html (Larper ${
    met ? 'included' : 'pending'
  }, Nemotron review ${
    rev ? 'included' : 'pending'
  })`
);
