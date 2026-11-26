// Builds ../docs/c.html: the "GNSS Watch" module (Track C) of the NavContinuity console.
// Inputs: outputs/gnss_cells.json, outputs/gnss_summary.json. Country outlines: world-atlas 2.0.2 (Natural Earth, public domain).
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs'), DOCS = path.join(HERE, '..', 'docs');
const { cells, params } = JSON.parse(fs.readFileSync(path.join(OUT, 'gnss_cells.json'), 'utf8'));
const S = JSON.parse(fs.readFileSync(path.join(OUT, 'gnss_summary.json'), 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

// ---- country outlines (TopoJSON decode, cached) ----
const topoFile = path.join(OUT, 'countries-50m.json');
if (!fs.existsSync(topoFile)) fs.writeFileSync(topoFile, Buffer.from(await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json')).arrayBuffer()));
const topo = JSON.parse(fs.readFileSync(topoFile, 'utf8'));
const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => [(x += dx) * sx + tx, (y += dy) * sy + ty]); });
const ring = idx => idx.flatMap((i, k) => { const a = i >= 0 ? arcs[i] : [...arcs[~i]].reverse(); return k ? a.slice(1) : a; });

const B = { lonMin: 60, lonMax: 98, latMin: 5, latMax: 38 }, W = 760, H = Math.round(W * (B.latMax - B.latMin) / (B.lonMax - B.lonMin) * 1.05);
const X = lon => (lon - B.lonMin) / (B.lonMax - B.lonMin) * W, Y = lat => (B.latMax - lat) / (B.latMax - B.latMin) * H;
const pathOf = rings => rings.map(r => 'M' + r.map(([lon, lat]) => `${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join('L') + 'Z').join('');
const geoms = topo.objects.countries.geometries;
const outline = geoms.map(g => {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
  const rings = polys.flatMap(p => p.map(ring)).filter(r => r.some(([lon, lat]) => lon > B.lonMin - 5 && lon < B.lonMax + 5 && lat > B.latMin - 5 && lat < B.latMax + 5));
  return rings.length ? `<path class="land${g.properties?.name === 'India' ? ' in' : ''}" d="${pathOf(rings)}"/>` : '';
}).join('');

const col = { low: 'var(--low)', medium: 'var(--med)', high: 'var(--high)', unknown: 'transparent' };
const cw = X(B.lonMin + params.cell_deg) - X(B.lonMin), ch = Y(B.latMax - params.cell_deg) - Y(B.latMax);
const rects = cells.filter(c => c.rating !== 'unknown' && c.lon >= B.lonMin && c.lon < B.lonMax && c.lat >= B.latMin && c.lat < B.latMax)
  .map(c => `<rect x="${X(c.lon).toFixed(1)}" y="${Y(c.lat + params.cell_deg).toFixed(1)}" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}" fill="${col[c.rating]}" class="cell ${c.rating}"><title>${c.lat}–${c.lat + 1}°N, ${c.lon}–${c.lon + 1}°E: ${Math.round(c.share * 100)}% of ${c.aircraft} aircraft degraded (${c.rating})</title></rect>`).join('');
const J = S.jewar_region, jr = J.radius_km / 111 / (B.latMax - B.latMin) * H;
const cities = [['Delhi', 28.61, 77.21], ['Mumbai', 19.08, 72.88], ['Kolkata', 22.57, 88.36], ['Chennai', 13.08, 80.27], ['Amritsar', 31.63, 74.87], ['Bengaluru', 12.97, 77.59]];
const map = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="mt md"><title id="mt">GPS interference over South Asia, ${esc(S.days.join(', '))}</title>
<desc id="md">One-degree cells coloured by the share of aircraft reporting degraded GPS. ${S.cells_high} cells high, ${S.cells_medium} medium. Jewar region: ${J.status}.</desc>
<rect width="${W}" height="${H}" class="sea"/>${outline}${rects}
${cities.map(([n, la, lo]) => `<circle cx="${X(lo)}" cy="${Y(la)}" r="2.5" class="city"/><text x="${X(lo) + 5}" y="${Y(la) + 4}" class="cl">${n}</text>`).join('')}
<circle cx="${X(J.lon)}" cy="${Y(J.lat)}" r="${Math.max(6, jr)}" class="jw"/><text x="${X(J.lon) + 10}" y="${Y(J.lat) - 8}" class="jl">Jewar</text></svg>`;

const statusTxt = { normal: 'Normal', degraded: 'Degraded', unknown: 'Unknown' }[J.status];
const hot = S.hotspots.map(c => `<tr><td>${c.lat}–${c.lat + 1}°N, ${c.lon}–${c.lon + 1}°E</td><td>${c.aircraft}</td><td><b>${Math.round(c.share * 100)}%</b></td><td><span class="r ${c.rating}">${c.rating}</span></td></tr>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>NavContinuity GNSS Watch</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap" rel="stylesheet">
<style>
:root{--bg:#E9EDEC;--panel:#FFF;--rail:#17232C;--railfg:#C9D3D8;--ink:#17232C;--mut:#5A6870;--rule:#D3DAD9;--larper:#2C55C9;--claimbg:#FBEFD9;--focus:#2C55C9;--sea:#DCE6EA;--land:#F4F6F2;--landin:#FFFFFF;--border:#9AA7AD;--low:#7FB77E;--med:#E8B33A;--high:#D2452F;--ok:#2E7D4F}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0F171C;--panel:#17222A;--rail:#0B1216;--railfg:#AEBBC1;--ink:#E4EBEA;--mut:#93A2A9;--rule:#2A3840;--larper:#86A3FF;--claimbg:#33270F;--focus:#86A3FF;--sea:#13202A;--land:#1E2B33;--landin:#25343D;--border:#4A5B64;--low:#4E8F55;--med:#C99628;--high:#E05A43;--ok:#6CC08F}}
:root[data-theme="dark"]{--bg:#0F171C;--panel:#17222A;--rail:#0B1216;--railfg:#AEBBC1;--ink:#E4EBEA;--mut:#93A2A9;--rule:#2A3840;--larper:#86A3FF;--claimbg:#33270F;--focus:#86A3FF;--sea:#13202A;--land:#1E2B33;--landin:#25343D;--border:#4A5B64;--low:#4E8F55;--med:#C99628;--high:#E05A43;--ok:#6CC08F}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 Archivo,system-ui,sans-serif}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.top{display:flex;align-items:center;gap:22px;padding:0 18px;height:54px;background:var(--rail);color:var(--railfg)}
.brand{font-weight:800;font-variation-settings:"wdth" 118;color:#fff;font-size:17px;display:flex;align-items:center;gap:9px}.brand svg{width:22px;height:22px}
.mods{display:flex;gap:4px;height:100%}.mods a{display:flex;align-items:center;gap:7px;padding:0 12px;color:var(--railfg);text-decoration:none;border-bottom:2px solid transparent;font-weight:600}
.mods a[aria-current]{color:#fff;border-bottom-color:#86A3FF}.mods a.soon{opacity:.55}.mods small{font-size:11px;border:1px solid currentColor;border-radius:4px;padding:0 5px}
main{max-width:1180px;margin:0 auto;padding:20px 20px 50px}
h1{font-size:26px;margin:0;font-weight:800;font-variation-settings:"wdth" 112}.sub{color:var(--mut);margin:2px 0 16px;max-width:85ch}
.grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:14px}
.panel{background:var(--panel);border:1px solid var(--rule);border-radius:8px;padding:14px 16px;margin-bottom:14px}
.panel h2{font-size:15px;margin:0 0 10px;font-weight:750}
.ev{font-size:11px;font-weight:650;border:1px solid currentColor;border-radius:4px;padding:0 5px;margin-left:4px;color:var(--ok)}
svg{width:100%;height:auto;display:block;border-radius:6px}
.sea{fill:var(--sea)}.land{fill:var(--land);stroke:var(--border);stroke-width:.6}.land.in{fill:var(--landin);stroke-width:1}
.cell{opacity:.82;stroke:var(--panel);stroke-width:.4}.city{fill:var(--ink)}.cl{font-size:11px;fill:var(--ink);paint-order:stroke;stroke:var(--panel);stroke-width:3px}
.jw{fill:none;stroke:var(--larper);stroke-width:2.5}.jl{font-size:13px;font-weight:800;fill:var(--larper);paint-order:stroke;stroke:var(--panel);stroke-width:3px}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:var(--mut);margin-top:8px}.legend i{display:inline-block;width:11px;height:11px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.status{border-radius:8px;padding:12px 14px;margin-bottom:10px}.status.normal{background:color-mix(in srgb,var(--ok) 13%,transparent)}.status.degraded{background:var(--claimbg)}.status.unknown{background:var(--bg)}
.status b{display:block;font-size:24px;font-variation-settings:"wdth" 85}
.figs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}.figs div{border:1px solid var(--rule);border-radius:8px;padding:8px 10px}.figs b{display:block;font-size:22px;font-variation-settings:"wdth" 75}.figs span{font-size:12px;color:var(--mut)}
.tbl{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums}.tbl th,.tbl td{border-bottom:1px solid var(--rule);padding:5px 6px;text-align:left}.tbl th{color:var(--mut);font-weight:650}
.r{font-size:11px;font-weight:700;border-radius:4px;padding:1px 6px;color:#fff}.r.high{background:var(--high)}.r.medium{background:var(--med);color:#1d1d1d}.r.low{background:var(--low)}
.note{color:var(--mut);font-size:12.5px;margin:8px 0 0}ul.note{padding-left:18px}
@media (max-width:900px){.top{flex-wrap:wrap;height:auto;padding:10px 14px}.mods{flex-wrap:wrap}.mods a{padding:6px 8px}.grid{grid-template-columns:1fr}}
</style><link rel="stylesheet" href="nd-theme.css"></head><body>
<header class="top">
 <div class="brand"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#86A3FF" stroke-width="2"/><path d="M4 15 L20 9" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="12" r="2.4" fill="#E6A84A"/></svg>NavContinuity</div>
 <nav class="mods" aria-label="Modules">
  <a href="index.html">Overview</a>
  <a href="a6.html">Jewar airport <small>Track A6</small></a>
  <a href="globe.html">Globe &amp; satellites <small>Track B3</small></a>
  <a href="c.html" aria-current="page">GPS malfunction <small>Track C</small></a>
  <a href="passengers.html">Passenger impact</a>
 </nav>
</header>
<main>
<h1>Where GPS is being jammed or degraded over India</h1>
<p class="sub">Aircraft constantly broadcast how much they trust their own GPS position (the NIC value in ADS-B). When many aircraft in one area report low trust at once, GPS there is being jammed or degraded. Real data from ${S.snapshots} snapshots on ${esc(S.days.join(', '))}. Monitoring only: no transmitter hunting, no tracking of individual flights.</p>
<div class="grid">
<section class="panel" aria-labelledby="h-map"><h2 id="h-map">Interference map <span class="ev">real ADS-B data</span></h2>${map}
<div class="legend"><span><i style="background:var(--low)"></i>under 2% of aircraft degraded</span><span><i style="background:var(--med)"></i>2–10%</span><span><i style="background:var(--high)"></i>over 10%</span><span>No colour: fewer than ${params.min_aircraft} aircraft seen</span></div></section>
<div>
<section class="panel" aria-labelledby="h-j"><h2 id="h-j">Jewar region (from Site Monitor)</h2>
<div class="status ${J.status}"><b>${statusTxt}</b>Within ${J.radius_km} km of the airport, ${J.aircraft_seen.toLocaleString('en-US')} aircraft seen; ${J.worst_cell ? `worst nearby cell ${Math.round(J.worst_cell.share * 100)}% degraded.` : 'not enough data.'}</div>
<p class="note">${esc(J.note)} This feeds Passenger Recovery: a diversion airport inside a degraded zone is ranked lower.</p></section>
<section class="panel" aria-labelledby="h-s"><h2 id="h-s">This sample</h2>
<div class="figs"><div><b>${S.reports.toLocaleString('en-US')}</b><span>aircraft position reports</span></div><div><b>${S.cells_rated}</b><span>areas with enough traffic</span></div><div><b style="color:var(--high)">${S.cells_high}</b><span>high-interference areas</span></div><div><b style="color:var(--med)">${S.cells_medium}</b><span>medium</span></div></div>
<table class="tbl"><tr><th scope="col">Worst areas</th><th scope="col">Aircraft</th><th scope="col">Degraded</th><th scope="col"></th></tr>${hot}</table></section>
</div></div>
<section class="panel" aria-labelledby="h-m"><h2 id="h-m">Method and limits</h2>
<ul class="note"><li>Source: ${esc(S.source)}. ${S.snapshots} global snapshots, filtered to 5–38°N, 60–98°E.</li>
<li>An aircraft counts as degraded in a 1° area when most of its reports there have NIC below ${params.nic_bad_below}. Areas are rated by the share of degraded aircraft, the approach used by public maps such as gpsjam.org.</li>
${S.caveats.map(c => `<li>${esc(c)}</li>`).join('')}
<li>Who pays: airlines and airports (dispatch planning), DGCA and AAI (national monitoring), insurers. Worth: India logged 2,354 interference reports Nov 2023–Dec 2025; each avoided diversion saves €1,000–77,200 (EUROCONTROL, 2022 prices).</li></ul></section>
<p class="note">Country outlines: Natural Earth via world-atlas (public domain); borders are shown as drawn in that dataset. Code: c/fetch.mjs, c/analyze.mjs in github.com/rehancodes-web/Mack.1.</p>
</main></body></html>`;
fs.writeFileSync(path.join(DOCS, 'c.html'), html);
console.log('wrote docs/c.html');
