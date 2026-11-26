// Designs the pitch as 1280x720 HTML slides (pitch/slides/html/NN.html) from repo data.
// Then: render.ps1 screenshots them with headless Edge, and pack.cjs assembles the .pptx.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const ROOT = path.join(HERE, '..', '..');
const OUT = path.join(HERE, 'html'); fs.mkdirSync(OUT, { recursive: true });
const rd = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const url = f => pathToFileURL(path.join(ROOT, f)).href;
const met = rd('a6/outputs/classifier_metrics.json'), dec = rd('a6/outputs/decision.json');
const phys = rd('b3/outputs/b3_physics.json'), sim = rd('b3/outputs/b3_sim.json').results;
const gsum = rd('c/outputs/gnss_summary.json'), ND = rd('decisions/nemotron_decisions.json');
const csv = fs.readFileSync(path.join(ROOT, 'a6/outputs/progress_ai.csv'), 'utf8').replace(/\r/g, '').trim().split('\n');
const HD = csv[0].split(','), rows = csv.slice(1).map(l => Object.fromEntries(l.split(',').map((v, i) => [HD[i], v])));
const SITE = 'rehancodes-web.github.io/Mack.1';
const fmt = n => Number(n).toLocaleString('en-US');

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=B612:wght@400;700&family=Source+Sans+3:wght@400;600;700&display=swap');
:root{--bg:#0d1a24;--panel:#132634;--panel2:#1a3344;--rule:#2b475a;--ink:#eef3f7;--dim:#93a8b8;--route:#e05fd0;--caut:#f2a93b;--data:#4fd1e0;--ok:#5fd38d;--warn:#ef5a5a;--H:'B612',sans-serif;--B:'Source Sans 3',sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1280px;height:720px;overflow:hidden;background:var(--bg);color:var(--ink);font-family:var(--B)}
.s{position:relative;width:1280px;height:720px;padding:64px 80px 56px;overflow:hidden}
h1,h2,.H{font-family:var(--H);font-weight:700;letter-spacing:-.01em}
h2{font-size:44px;line-height:1.08;max-width:1120px}
.sub{font-size:22px;color:var(--dim);margin-top:14px;max-width:860px;line-height:1.4}
.foot{position:absolute;left:80px;right:80px;bottom:26px;display:flex;justify-content:space-between;font-family:var(--H);font-size:12px;color:#5f7a8c}
.trk{display:inline-flex;align-items:center;gap:8px;font-family:var(--H);font-size:14px;font-weight:700;margin-bottom:18px}
.trk i{width:10px;height:10px;border-radius:50%;display:inline-block}
.route{color:var(--route)}.caut{color:var(--caut)}.data{color:var(--data)}.ok{color:var(--ok)}.dim{color:var(--dim)}.warn{color:var(--warn)}
.big{font-family:var(--H);font-weight:700;line-height:1}
.src{position:absolute;left:80px;bottom:46px;font-size:12px;color:#5f7a8c;max-width:1000px}
`;
const page = (n, body, extra = '') => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}${extra}</style></head><body>${body}</body></html>`;
const foot = n => `<div class="foot"><span>NavContinuity</span><span>${String(n).padStart(2, '0')}</span></div>`;
const slides = [];
const add = (notes, html, extra) => slides.push({ notes, html: page(slides.length + 1, html.replace('%FOOT%', foot(slides.length + 1)), extra) });

// 1 COVER
add('0:00–0:15. GPS jamming is now daily around Indian airports. NavContinuity connects detecting it, diverting flights somewhere safe, hardening positioning and recovering passengers: Tracks A6, B3 and C.', `
<div class="s" style="padding:0">
 <img src="${url('a6/outputs/hires_2026-05-28.jpg')}" style="position:absolute;right:-120px;top:-60px;width:980px;height:840px;object-fit:cover;opacity:.75">
 <div style="position:absolute;inset:0;background:linear-gradient(90deg,#0d1a24 38%,rgba(13,26,36,.55) 62%,rgba(13,26,36,.1))"></div>
 <svg style="position:absolute;right:40px;top:60px;overflow:visible" width="600" height="600" viewBox="0 0 600 600">
  <circle cx="300" cy="300" r="280" fill="none" stroke="#eef3f7" stroke-opacity=".35" stroke-width="1.5"/>
  <circle cx="300" cy="300" r="170" fill="none" stroke="#4fd1e0" stroke-opacity=".4" stroke-dasharray="4 8"/>
  ${Array.from({ length: 36 }, (_, i) => { const a = i * 10 * Math.PI / 180, r1 = 280, r2 = i % 3 ? 268 : 256; return `<line x1="${300 + r1 * Math.sin(a)}" y1="${300 - r1 * Math.cos(a)}" x2="${300 + r2 * Math.sin(a)}" y2="${300 - r2 * Math.cos(a)}" stroke="#eef3f7" stroke-opacity=".45"/>`; }).join('')}
  <ellipse cx="62" cy="70" rx="110" ry="80" fill="#f2a93b" fill-opacity=".16" stroke="#f2a93b" stroke-dasharray="7 5" stroke-width="2"/>
  <path d="M62 70 Q 190 120 296 292" fill="none" stroke="#e05fd0" stroke-width="5" stroke-linecap="round"/>
  <circle cx="62" cy="70" r="10" fill="#0d1a24" stroke="#eef3f7" stroke-width="3"/>
  <text x="-6" y="40" fill="#eef3f7" font-family="B612" font-weight="700" font-size="17">Delhi IGI · 70 km</text>
  <path d="M296 278 l12 16 -12 16 -12 -16z" fill="#e05fd0"/>
  <text x="318" y="292" fill="#eef3f7" font-family="B612" font-weight="700" font-size="17">Jewar</text>
  <text x="318" y="314" fill="#5fd38d" font-family="B612" font-size="14">GPS normal</text>
  <text x="20" y="176" fill="#f2a93b" font-family="B612" font-size="14">GPS degraded</text>
 </svg>
 <div style="position:absolute;right:236px;top:40px;font-family:var(--H);font-weight:700;font-size:17px;color:var(--caut);border:2px solid var(--caut);padding:6px 16px;border-radius:5px;background:#0d1a24">GPS PRIMARY LOST</div>
 <div style="position:absolute;left:80px;top:150px;width:560px">
  <h1 style="font-size:76px;line-height:1">NavContinuity</h1>
  <p style="font-size:27px;line-height:1.35;margin-top:26px;color:#c9d6e0">When GPS fails near an airport: find where, send the flights somewhere safe, harden positioning and look after every passenger.</p>
  <div style="margin-top:46px;display:grid;gap:14px;font-family:var(--H);font-size:17px;font-weight:700">
   <span><i style="display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--route);margin-right:12px"></i>Track A6 · Infrastructure</span>
   <span><i style="display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--ok);margin-right:12px"></i>Track B3 · Positioning &amp; sensing</span>
   <span><i style="display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--data);margin-right:12px"></i>Track C · GNSS resilience</span>
  </div>
 </div>
 <div style="position:absolute;left:80px;bottom:40px;font-family:var(--H);font-size:14px;color:var(--dim)">Mach-A-Thon Aeromania '26 · Orbit to Economy: AI in Space · with Boeing</div>
</div>`);

// 2 PROBLEM
add('0:15–0:40. Three reported numbers, then Delhi. The real cost is capacity, diversions and stranded passengers.', `
<div class="s">
 <div class="trk caut"><i style="background:var(--caut)"></i>The problem</div>
 <h2>GPS jamming is now routine over India</h2>
 <div style="display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:28px;margin-top:56px;align-items:end">
  <div><div class="big caut" style="font-size:132px">2,354</div><p style="font-size:20px;color:var(--dim);margin-top:12px">GPS interference incidents reported to India's Parliament, Nov 2023 – Dec 2025</p></div>
  <div><div class="big" style="font-size:72px">+500%</div><p style="font-size:18px;color:var(--dim);margin-top:12px">GPS spoofing reports, 2024 vs 2023 (IATA)</p></div>
  <div><div class="big" style="font-size:72px">71%</div><p style="font-size:18px;color:var(--dim);margin-top:12px">of India's 2025 incidents meant total loss of GPS on board</p></div>
 </div>
 <div style="margin-top:52px;border-left:4px solid var(--caut);padding:6px 0 6px 24px;font-size:24px;line-height:1.4;max-width:1040px"><b class="H caut">Delhi, 2025.</b> Flights approaching IGI Runway 10 on GPS procedures were spoofed. Crews fell back to contingency procedures; DGCA introduced real-time spoofing reports.</div>
 <div class="src">Reported: Lok Sabha answer, 12 Mar 2026 · IATA · ICAO Asia-Pacific, Jan 2026</div>%FOOT%
</div>`);

// 3 PASSENGERS
add('0:40–1:00. A GPS failure rarely makes news as a crash; it shows up as holding, delays, diversions. Name two pains. Costs are industry averages, not proven GPS costs.', `
<div class="s">
 <div class="trk caut"><i style="background:var(--caut)"></i>The human cost</div>
 <h2>Every GPS failure ends in a crowded terminal</h2>
 <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:64px;margin-top:44px">
  <ol style="list-style:none;display:grid;gap:20px">
   ${[['“15 more minutes”, for hours', 'then a cancellation'], ['Missed connections', 'the onward flight leaves first'], ['Rebooked to the wrong city', 'by an automatic system'], ['Hotel voucher in the wrong city', 'issued where they are not'], ['Bag on another route', 'the passenger moves, the bag does not']].map(([a, b]) => `<li style="display:flex;gap:18px;align-items:baseline"><span style="width:12px;height:12px;border-radius:50%;background:var(--warn);flex:none;transform:translateY(-2px)"></span><span style="font-size:25px;font-weight:600;line-height:1.2">${a}<br><span style="color:var(--dim);font-weight:400;font-size:19px">${b}</span></span></li>`).join('')}
  </ol>
  <div style="display:grid;gap:22px;align-content:start">
   <div style="background:var(--panel);border-radius:14px;padding:26px 30px"><div class="big caut" style="font-size:56px">€1,000–77,200</div><p style="font-size:18px;color:var(--dim);margin-top:10px">cost of one diverted flight (EUROCONTROL)</p></div>
   <div style="background:var(--panel);border-radius:14px;padding:26px 30px"><div class="big" style="font-size:56px">$98 / minute</div><p style="font-size:18px;color:var(--dim);margin-top:10px">aircraft operating cost (Airlines for America, 2025)</p></div>
  </div>
 </div>%FOOT%
</div>`);

// 4 GAP
add('1:00–1:20. Three kinds of tools exist; none connects. Passengers absorb the gap. This is our originality in one picture.', `
<div class="s">
 <div class="trk route"><i style="background:var(--route)"></i>What nobody has solved</div>
 <h2>Three systems. Nothing connects them.</h2>
 <svg width="1120" height="420" viewBox="0 0 1120 420" style="margin-top:28px">
  ${[['GPS interference', 'monitoring', 'knows where GPS fails', 40], ['Airline & airport', 'operations', 'picks the diversion', 420], ['Passenger', 'rebooking', 'fixes it afterwards', 800]].map(([a, b, c, x]) => `
   <rect x="${x}" y="40" width="280" height="170" rx="16" fill="#132634" stroke="#2b475a"/>
   <text x="${x + 28}" y="96" fill="#eef3f7" font-family="B612" font-weight="700" font-size="24">${a}</text>
   <text x="${x + 28}" y="128" fill="#eef3f7" font-family="B612" font-weight="700" font-size="24">${b}</text>
   <text x="${x + 28}" y="176" fill="#93a8b8" font-family="Source Sans 3" font-size="20">${c}</text>`).join('')}
  ${[320, 700].map(x => `<line x1="${x + 8}" y1="125" x2="${x + 92}" y2="125" stroke="#ef5a5a" stroke-width="3" stroke-dasharray="8 8"/><text x="${x + 50}" y="112" fill="#ef5a5a" font-family="B612" font-size="26" text-anchor="middle">×</text>`).join('')}
  ${[180, 560, 940].map(x => `<line x1="${x}" y1="210" x2="${x}" y2="300" stroke="#e05fd0" stroke-width="4"/><circle cx="${x}" cy="210" r="7" fill="#e05fd0"/>`).join('')}
  <line x1="180" y1="300" x2="940" y2="300" stroke="#e05fd0" stroke-width="5" stroke-linecap="round"/>
  <rect x="330" y="328" width="460" height="64" rx="12" fill="#e05fd0"/>
  <text x="560" y="369" fill="#0d1a24" font-family="B612" font-weight="700" font-size="24" text-anchor="middle">NavContinuity links all three</text>
 </svg>%FOOT%
</div>`);

// 5 SOLUTION
const legs = [['Detect', 'Where is GPS failing?', 'Track C', 'data'], ['Absorb', 'Which airport can take the flights?', 'Track A6', 'route'], ['Harden', 'Positioning that resists jamming', 'Track B3', 'ok'], ['Recover', 'Confirmed seat, right hotel, tracked bag', 'Passengers', 'caut']];
add('1:20–1:40. Each track is one leg of the same flight. Walk the Delhi example.', `
<div class="s">
 <div class="trk route"><i style="background:var(--route)"></i>Our solution</div>
 <h2>From GPS failure to passenger, in four legs</h2>
 <div style="position:relative;margin-top:44px;height:250px">
  <div style="position:absolute;left:60px;right:60px;top:38px;height:5px;background:var(--route);border-radius:3px"></div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;position:relative">
   ${legs.map(([h, d, t, c], i) => `<div><div style="width:80px;height:80px;border-radius:50%;background:#0d1a24;border:5px solid var(--${c});display:grid;place-items:center;font-family:var(--H);font-weight:700;font-size:30px;margin-left:20px">${i + 1}</div>
    <div class="H" style="font-size:32px;margin-top:22px">${h}</div><p style="font-size:20px;color:var(--dim);margin-top:8px;line-height:1.35">${d}</p><div class="H ${c}" style="font-size:16px;margin-top:12px">${t}</div></div>`).join('')}
  </div>
 </div>
 <div style="margin-top:22px;background:var(--panel);border-radius:14px;padding:18px 26px;font-size:19px;line-height:1.42"><b class="H route">Delhi, worked through:</b> Track C flags interference on the Delhi side. Track A6 confirms Noida International (Jewar), 70 km away, is built and in clean airspace. Flights go there, rebooking starts before they land, and Track B3 is how the problem goes away for good.</div>%FOOT%
</div>`);

// 6 ARCHITECTURE
const arch = [['Data', 'data', ['Sentinel-2 L2A · 79 scenes', 'ESA WorldCover 2021', 'Esri Wayback sub-metre photos', 'ADS-B aircraft integrity', 'CelesTrak orbits']], ['Processing', 'ink', ['Cloud-optimised GeoTIFF reads', 'Cloud masking & scaling checks', 'Integrity per 1° cell', 'Link budget & orbit geometry']], ['AI', 'route', ['Larper · Random Forest, every 10 m pixel', 'NVIDIA Nemotron · ops decisions', 'Human check on every answer']], ['Outputs', 'ok', ['Release-or-inspect decision', 'GPS malfunction map', '3D globe of real satellites', 'Passenger recovery plan']]];
add('1:40–2:00. Free public data, Node.js pipelines, two AI components, static site. Runs on a laptop.', `
<div class="s">
 <div class="trk data"><i style="background:var(--data)"></i>Technology</div>
 <h2>Free satellite data in, decisions out</h2>
 <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:22px;margin-top:46px;position:relative">
  ${arch.map(([h, c, items], i) => `<div style="background:var(--panel);border-radius:14px;padding:24px 22px;height:310px;border-top:0">
   <div class="H ${c === 'ink' ? '' : c}" style="font-size:24px">${h}</div>
   <ul style="list-style:none;margin-top:20px;display:grid;gap:14px">${items.map(t => `<li style="font-size:18px;line-height:1.3;padding-left:16px;position:relative"><span style="position:absolute;left:0;top:9px;width:6px;height:6px;border-radius:50%;background:${c === 'ink' ? '#93a8b8' : `var(--${c})`}"></span>${t}</li>`).join('')}</ul></div>${i < 3 ? `<div style="position:absolute;top:143px;left:${(i + 1) * 25 - 1.6}%;width:24px;height:24px;border-top:4px solid var(--dim);border-right:4px solid var(--dim);transform:rotate(45deg);"></div>` : ''}`).join('')}
 </div>
 <p style="margin-top:22px;font-size:17px;color:var(--dim)">Node.js (geotiff.js, proj4, ml-random-forest) · NVIDIA Nemotron API · GitHub Pages · every data source is free and public</p>%FOOT%
</div>`);

// 7 LARPER
const bp = met.per_class.find(c => c.class === 'built_paved'), bare = met.per_class.find(c => c.class === 'bare');
add('2:00–2:15. Technical depth: trained outside the airport, tested on a separate block of land. We report the weak class too.', `
<div class="s">
 <div class="trk route"><i style="background:var(--route)"></i>Technology · Track A6</div>
 <h2>Larper: AI that labels every 10 m of the airport</h2>
 <div style="display:grid;grid-template-columns:640px 1fr;gap:44px;margin-top:36px">
  <div style="background:#f5f5f5;border-radius:14px;overflow:hidden;align-self:start"><img src="${url('a6/outputs/classmap_2026-03.png')}" style="width:100%;display:block"></div>
  <div>
   <div class="big route" style="font-size:96px">${Math.round(met.overall_accuracy * 100)}%</div>
   <p style="font-size:19px;color:var(--dim);margin-top:8px">agreement with ESA WorldCover on land it never saw</p>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:30px">
    <div><div class="big" style="font-size:44px">${Math.round(bp.recall * 100)}%</div><p style="font-size:16px;color:var(--dim)">built/paved recall</p></div>
    <div><div class="big" style="font-size:44px">${fmt(met.n_test)}</div><p style="font-size:16px;color:var(--dim)">test pixels</p></div>
   </div>
   <p style="font-size:17px;line-height:1.45;margin-top:28px">Random Forest · 60 trees · 6 Sentinel-2 bands + 4 indices. Trained on WorldCover labels outside the airport, tested on a separate block of land. Weak spot: bare soil (${Math.round(bare.recall * 100)}% recall).</p>
  </div>
 </div>
 <div style="position:absolute;left:80px;top:512px;display:flex;gap:22px;font-size:15px;color:var(--dim)"><span><b style="color:#dc3c3c">■</b> built / paved</span><span><b style="color:#e6c878">■</b> bare</span><span><b style="color:#3c8c3c">■</b> vegetation</span><span><b style="color:#3c78dc">■</b> water</span></div>%FOOT%
</div>`);

// 8 A6 RESULT
const ser = rows.filter(r => r.converted_12m !== '' && r.baseline_cleared_12m !== '');
const t0 = Date.UTC(2020, 0, 1), t1 = Date.UTC(2026, 11, 31), W = 560, Hh = 300;
const X = m => (Date.parse(m + '-15') - t0) / (t1 - t0) * W, Yv = v => Hh - v * Hh;
const line = k => ser.map((r, i) => `${i ? 'L' : 'M'}${X(r.month).toFixed(1)},${Yv(Number(r[k])).toFixed(1)}`).join(' ');
add('2:15–2:45. Key result. Nothing changes until mid-2023, peak in 2025. In January 2025 the builder claimed 80%; satellites saw about half the land converted. That gap is exactly when a lender should inspect. Costs are assumed.', `
<div class="s">
 <div class="trk route"><i style="background:var(--route)"></i>Track A6 · result on real data</div>
 <h2>The builder said 80%. Orbit saw half.</h2>
 <div style="display:grid;grid-template-columns:600px 1fr;gap:40px;margin-top:34px">
  <div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;border-radius:12px;overflow:hidden;height:190px">
    <div style="position:relative"><img src="${url('a6/outputs/hires_2019-10-09.jpg')}" style="width:100%;height:100%;object-fit:cover"><span class="H" style="position:absolute;left:10px;bottom:8px;font-size:14px;background:#0d1a24cc;padding:2px 8px;border-radius:4px">2019</span></div>
    <div style="position:relative"><img src="${url('a6/outputs/hires_2026-05-28.jpg')}" style="width:100%;height:100%;object-fit:cover"><span class="H" style="position:absolute;left:10px;bottom:8px;font-size:14px;background:#0d1a24cc;padding:2px 8px;border-radius:4px">2026</span></div>
   </div>
   <svg width="600" height="250" viewBox="-46 -10 640 350" style="margin-top:14px">
    ${[0, .25, .5, .75, 1].map(v => `<line x1="0" x2="${W}" y1="${Yv(v)}" y2="${Yv(v)}" stroke="#2b475a"/><text x="-8" y="${Yv(v) + 5}" fill="#93a8b8" font-size="14" text-anchor="end" font-family="B612">${v * 100}%</text>`).join('')}
    ${[2020, 2022, 2024, 2026].map(y => `<text x="${X(y + '-01')}" y="${Hh + 24}" fill="#93a8b8" font-size="14" font-family="B612">${y}</text>`).join('')}
    <path d="${line('baseline_cleared_12m')}" fill="none" stroke="#4fd1e0" stroke-width="3" opacity=".8"/>
    <path d="${line('converted_12m')}" fill="none" stroke="#e05fd0" stroke-width="4"/>
    <circle cx="${X('2025-01')}" cy="${Yv(.8)}" r="9" fill="none" stroke="#f2a93b" stroke-width="3"/>
    <text x="${X('2025-01') - 14}" y="${Yv(.8) + 6}" fill="#f2a93b" font-size="15" text-anchor="end" font-family="B612">reported 80%</text>
   </svg>
   <div style="display:flex;gap:22px;font-size:15px;color:var(--dim)"><span><b class="route">━</b> Larper: converted land</span><span><b class="data">━</b> NDVI baseline</span></div>
  </div>
  <div style="display:grid;gap:18px;align-content:start">
   <div style="background:var(--panel);border-radius:14px;padding:22px 26px"><div class="big" style="font-size:64px">80%</div><p style="font-size:17px;color:var(--dim);margin-top:6px">"work complete", builder, Jan 2025 · reported</p></div>
   <div style="background:var(--panel);border-radius:14px;padding:22px 26px;outline:2px solid var(--route)"><div class="big route" style="font-size:64px">${dec.satellite_observed_pct}%</div><p style="font-size:17px;color:var(--dim);margin-top:6px">land converted, Sentinel-2, Jan 2025 · derived</p></div>
   <div style="font-size:20px;line-height:1.4"><b class="H route">Decision: inspect</b> before releasing the next tranche. Inspection $15k vs $112k expected loss · assumed costs</div>
  </div>
 </div>%FOOT%
</div>`);

// 9 TRACK C
add('2:45–3:05. Real data: aircraft broadcast how far they trust their own GPS. One day shows the border band. Jewar is clean, which matters for diversions. Protective only.', `
<div class="s">
 <div class="trk data"><i style="background:var(--data)"></i>Track C · result on real data</div>
 <h2>A live map of where GPS is failing</h2>
 <div style="display:grid;grid-template-columns:500px 1fr;gap:48px;margin-top:30px">
  <div style="border-radius:14px;overflow:hidden;height:440px"><img src="${url('pitch/gnss_map.png')}" style="width:100%;height:100%;object-fit:cover;object-position:30% 30%"></div>
  <div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:26px">
    <div><div class="big data" style="font-size:66px">${fmt(gsum.reports)}</div><p style="font-size:17px;color:var(--dim);margin-top:6px">aircraft reports in one day</p></div>
    <div><div class="big caut" style="font-size:66px">${gsum.cells_high}</div><p style="font-size:17px;color:var(--dim);margin-top:6px">high-interference zones</p></div>
   </div>
   <p style="font-size:21px;line-height:1.45;margin-top:32px">Aircraft broadcast how far they trust their own position. We rate every 1° square: the red band runs along the India–Pakistan border and over Myanmar.</p>
   <div style="margin-top:26px;background:var(--panel);border-radius:12px;padding:18px 22px;font-size:20px"><b class="H ok">Jewar region: ${gsum.jewar_region.status}</b> · ${fmt(gsum.jewar_region.aircraft_seen)} aircraft, a safe place to divert to</div>
   <p style="font-size:15px;color:var(--dim);margin-top:18px">Protective monitoring of areas only. No individual aircraft or people are tracked.</p>
  </div>
 </div>%FOOT%
</div>`);

// 10 TRACK B3
const gn = sim['GPS + NavIC + LEO'], g0 = sim['GPS only'];
add('3:05–3:25. Physics first: received power falls with distance squared, so LEO is 19 dB stronger and a jammer covers 80x less area. Simulation: three constellations plus an AI cross-check catch 92% of spoofing and cut error from 50 to 8 m. Costs are assumptions.', `
<div class="s">
 <div class="trk ok"><i style="background:var(--ok)"></i>Track B3 · physics and simulation</div>
 <h2>Closer satellites, weaker jammers</h2>
 <div style="display:grid;grid-template-columns:520px 1fr;gap:50px;margin-top:30px">
  <div style="background:var(--panel);border-radius:14px;padding:22px 24px">
   <div class="H" style="font-size:18px">Where one 10 W jammer blinds a receiver</div>
   <svg width="472" height="330" viewBox="0 0 472 330" style="margin-top:6px">
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 59}" y1="0" x2="${i * 59}" y2="330" stroke="#22394b"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${i * 66}" x2="472" y2="${i * 66}" stroke="#22394b"/>`).join('')}
    <circle cx="236" cy="165" r="150" fill="#ef5a5a" fill-opacity=".12" stroke="#ef5a5a" stroke-width="2" stroke-dasharray="7 6"/>
    <circle cx="236" cy="165" r="${Math.max(6, 150 * phys.jamming.leo_denial_radius_km / phys.jamming.gps_denial_radius_km)}" fill="#5fd38d" stroke="#0d1a24" stroke-width="2"/>
    <circle cx="236" cy="165" r="4" fill="#0d1a24"/>
    <text x="236" y="40" fill="#ef5a5a" font-family="B612" font-size="16" font-weight="700" text-anchor="middle">GPS: ${Math.round(phys.jamming.gps_denial_radius_km)} km radius</text>
    <line x1="256" y1="160" x2="330" y2="118" stroke="#5fd38d" stroke-width="2"/>
    <text x="336" y="114" fill="#5fd38d" font-family="B612" font-size="16" font-weight="700">LEO: ${Math.round(phys.jamming.leo_denial_radius_km)} km</text>
   </svg>
   <p style="font-size:15px;color:var(--dim);margin-top:6px">Same jammer, drawn to scale. GPS orbits at 20,200 km; the low-orbit layer at 1,000 km.</p>
  </div>
  <div style="display:grid;gap:22px;align-content:start">
   <div><div class="big ok" style="font-size:84px">${phys.signal.leo_advantage_db} dB</div><p style="font-size:18px;color:var(--dim);margin-top:6px">stronger signal, so a jammer covers ${phys.jamming.denial_area_reduction_factor}× less area · physics</p></div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px">
    <div><div class="big" style="font-size:48px">${gn.spoofed_median_error_m_uncorrected}→${gn.spoofed_median_error_m_ai_corrected} m</div><p style="font-size:16px;color:var(--dim);margin-top:6px">spoofed error with AI cross-check · simulation</p></div>
    <div><div class="big" style="font-size:48px">${Math.round(g0.detection_rate * 100)}→${Math.round(gn.detection_rate * 100)}%</div><p style="font-size:16px;color:var(--dim);margin-top:6px">spoofing detected: GPS alone vs GPS + NavIC + LEO</p></div>
   </div>
   <div style="background:var(--panel);border-radius:12px;padding:16px 22px;font-size:19px">${phys.constellation.satellites_needed} satellites · ~$${Math.round(phys.cost.capex_usd / 1e6)}M to build · ~$${Math.round(phys.cost.per_year_usd / 1e6)}M a year <span class="dim">· assumed costs</span></div>
  </div>
 </div>%FOOT%
</div>`);

// 11 NEMOTRON
const short = { delhi: 'Delhi IGI, 2025', northwest: 'Amritsar / Jammu', outage: 'Full GPS outage', tartu: 'Tartu, 2024' };
const what = { delhi: 'Spoofed GPS approaches', northwest: 'Border jamming', outage: 'GPS-only approach lost', tartu: 'Route suspended' };
add('3:25–3:45. We gave NVIDIA Nemotron four real cases and asked it to act as the airline operations controller. Common thread: late inbound, receiver reset, next rotation slips. It got Delhi wrong and we corrected it: AI proposes, people decide.', `
<div class="s">
 <div class="trk route"><i style="background:var(--route)"></i>AI decision support · NVIDIA Nemotron</div>
 <h2>Nemotron decides four real GPS failures</h2>
 <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:36px">
  ${ND.cases.map(c => `<div style="background:var(--panel);border-radius:14px;padding:22px 20px;height:390px;display:flex;flex-direction:column">
   <div class="H" style="font-size:21px">${short[c.id]}</div><div class="caut" style="font-size:16px;margin-top:4px">${what[c.id]}</div>
   <p style="font-size:15px;color:var(--dim);margin-top:16px;line-height:1.4">${(c.nemotron?.turnaround || '').replace(/\.$/, '')}</p>
   <div style="margin-top:auto;border-top:1px solid var(--rule);padding-top:14px"><div class="H route" style="font-size:13px">Decision${c.human_review.verdict === 'corrected' ? ' · corrected by us' : ''}</div><p style="font-size:16px;line-height:1.35;margin-top:6px">${c.human_review.final}</p></div></div>`).join('')}
 </div>
 <p style="margin-top:18px;font-size:16px;color:var(--dim)">Model ${ND.model} · asked as the airline's operations controller · every answer checked against the reported facts</p>%FOOT%
</div>`);

// 12 ORIGINALITY
const players = [['Spire', 'satellite RF interference detection', [1, 0, 0]], ['Jeppesen', 'interference awareness for pilots', [.5, 0, 0]], ['Boeing GPS Event Monitor', 'on-aircraft GPS event records', [1, 0, 0]], ['SAT-JAM', 'Sentinel orbit-level interference maps', [1, 0, 0]], ['EO construction analytics', 'satellite progress monitoring', [0, .5, 0]], ['Amadeus Passenger Recovery', 'rebooking after disruption', [0, 0, 1]]];
const dot = v => v === 1 ? '<span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:var(--ok)"></span>' : v === .5 ? '<span style="display:inline-block;width:20px;height:20px;border-radius:50%;border:3px solid var(--caut)"></span>' : '<span style="display:inline-block;width:20px;height:3px;background:#3d5a6d;vertical-align:middle"></span>';
add('3:45–4:05. Detection exists, rebooking exists, construction analytics exist. Nobody links them, so passengers absorb the gap. Based on public product information.', `
<div class="s">
 <div class="trk route"><i style="background:var(--route)"></i>Originality</div>
 <h2>Many solve one piece. Nobody connects them.</h2>
 <table style="width:100%;margin-top:30px;border-collapse:collapse;font-size:18px">
  <thead><tr style="color:var(--dim);font-family:var(--H);font-size:14px"><th style="text-align:left;padding:8px 0;font-weight:400">Who</th><th style="font-weight:400">Detects GPS failure</th><th style="font-weight:400">Verifies diversion airport</th><th style="font-weight:400">Recovers passengers</th><th style="font-weight:400">Connects all three</th></tr></thead>
  <tbody>${players.map(([n, d, v]) => `<tr style="border-top:1px solid var(--rule)"><td style="padding:11px 0"><b>${n}</b> <span style="color:var(--dim)">· ${d}</span></td>${v.map(x => `<td style="text-align:center">${dot(x)}</td>`).join('')}<td style="text-align:center">${dot(0)}</td></tr>`).join('')}
  <tr style="background:rgba(224,95,208,.14)"><td style="padding:14px 12px"><b class="H route" style="font-size:20px">NavContinuity</b></td><td style="text-align:center">${dot(1)}</td><td style="text-align:center">${dot(1)}</td><td style="text-align:center">${dot(.5)}</td><td style="text-align:center"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:var(--route)"></span></td></tr></tbody>
 </table>
 <div style="display:flex;gap:26px;margin-top:16px;font-size:15px;color:var(--dim)"><span>${dot(1)} does it</span><span>${dot(.5)} partly / planned</span><span>${dot(0)} no</span><span>· based on public product information; passenger recovery is specified, not built</span></div>%FOOT%
</div>`);

// 13 FEASIBILITY
add('4:05–4:25. Everything shown runs today on free data. The pilot needs no new satellites, only a daily feed and read-only airline access. B3 is the long-term layer.', `
<div class="s">
 <div class="trk ok"><i style="background:var(--ok)"></i>Feasibility</div>
 <h2>Built in 12 hours. Pilot-ready in 3 months.</h2>
 <div style="position:relative;margin-top:46px">
  <div style="position:absolute;left:0;right:0;top:22px;height:4px;background:linear-gradient(90deg,var(--ok),var(--caut) 55%,var(--dim))"></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:36px;position:relative">
   ${[['Today', 'ok', ['Real Sentinel-2 pipeline, 79 scenes', 'Larper trained and tested', 'GPS map from real aircraft data', 'Nemotron decisions, human-checked', 'Live site, $0 data cost']], ['3 months · pilot', 'caut', ['One airline at one hub: Delhi', 'Daily GPS-integrity feed', 'Shadow mode: recommends, never acts', 'Measure time to a confirmed rebooking']], ['Later · scale', 'dim', ['More hubs and airlines', 'Satellite GNSS data as a second source', 'B3 low-orbit layer, with partners', 'Regulator dashboard (DGCA, AAI)']]].map(([h, c, items]) => `<div><div style="width:48px;height:48px;border-radius:50%;background:#0d1a24;border:5px solid var(--${c})"></div><div class="H ${c}" style="font-size:26px;margin-top:20px">${h}</div><ul style="list-style:none;margin-top:14px;display:grid;gap:10px">${items.map(t => `<li style="font-size:19px">${t}</li>`).join('')}</ul></div>`).join('')}
  </div>
 </div>
 <div style="margin-top:34px;font-size:17px;color:var(--dim)">Risks we know: one day of aircraft data (extend to months) · Sentinel-2 revisits every 5 days (enough for construction) · airline systems access (start read-only)</div>%FOOT%
</div>`);

// 14 BUSINESS
add('4:25–4:45. Every team must answer who pays. Airlines first, lenders second, regulators for the national case. Pricing is a hypothesis.', `
<div class="s">
 <div class="trk caut"><i style="background:var(--caut)"></i>Who pays</div>
 <h2>Three customers, one data backbone</h2>
 <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:40px">
  ${[['Airlines', 'Per-hub subscription', 'Fewer stranded passengers, faster confirmed rebooking, no wrong-city hotels', 'One avoided diversion is worth up to €77,200'], ['Lenders & project monitors', 'Per-asset fee', 'Release-or-inspect decisions on infrastructure money', 'Our A6 case: $15k inspection vs $112k expected loss'], ['Regulators & airports', 'Strategic', 'Live view of GPS health and which airports can take diversions', 'National resilience, building on NavIC']].map(([h, p, d, v], i) => `<div style="background:var(--panel);border-radius:14px;padding:26px 24px;height:330px;display:flex;flex-direction:column">
   <div class="H" style="font-size:25px">${h}</div><div class="caut H" style="font-size:15px;margin-top:6px">${p}</div><p style="font-size:19px;line-height:1.4;margin-top:20px">${d}</p>
   <div style="margin-top:auto;border-top:1px solid var(--rule);padding-top:16px;font-size:17px;color:var(--dim)">${v}</div></div>`).join('')}
 </div>
 <p style="margin-top:16px;font-size:14px;color:var(--dim)">Costs: EUROCONTROL diversion range (reported) · A6 figures use assumed inputs · prices not validated</p>%FOOT%
</div>`);

// 15 CLOSE
add('4:45–5:00. Close on the chain and the live site. Thank the judges.', `
<div class="s" style="padding:0">
 <img src="${url('a6/outputs/hires_2019-10-09.jpg')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.28">
 <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,26,36,.4),#0d1a24 85%)"></div>
 <div style="position:absolute;left:80px;top:90px;right:80px">
  <h2 style="font-size:58px;max-width:900px">GPS will keep failing. Passengers shouldn't pay for it.</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:56px">
   ${[['Track C', 'data', 'detects', 'c.html'], ['Track A6', 'route', 'absorbs', 'a6.html'], ['Track B3', 'ok', 'hardens', 'globe.html'], ['Passengers', 'caut', 'recover', 'passengers.html']].map(([h, c, v, p]) => `<div style="border:2px solid var(--${c});border-radius:12px;padding:18px 20px;background:#0d1a24cc"><div class="H ${c}" style="font-size:22px">${h}</div><div style="font-size:18px;margin-top:4px">${v}</div><div class="H dim" style="font-size:12px;margin-top:12px">/${p}</div></div>`).join('')}
  </div>
  <div class="H" style="font-size:26px;margin-top:60px">${SITE}</div>
  <p style="font-size:17px;color:var(--dim);margin-top:10px">Limits: land conversion is not completion · one day of GPS data · B3 is simulation · economics assumed · organisers said choose one of B or C: we show both as one chain</p>
 </div>
</div>`);

fs.writeFileSync(path.join(OUT, 'notes.json'), JSON.stringify(slides.map(s => s.notes), null, 1));
slides.forEach((s, i) => fs.writeFileSync(path.join(OUT, `${String(i + 1).padStart(2, '0')}.html`), s.html));
console.log(`wrote ${slides.length} slides to pitch/slides/html`);
