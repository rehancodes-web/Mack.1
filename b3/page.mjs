// Builds ../docs/b3.html: the "Nav Integrity" module (Track B3) of the NavContinuity console.
// Inputs: outputs/b3_physics.json, outputs/b3_sim.json. Usage: node physics.mjs && node simulate.mjs && node page.mjs
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs'), DOCS = path.join(HERE, '..', 'docs');
const ph = JSON.parse(fs.readFileSync(path.join(OUT, 'b3_physics.json'), 'utf8'));
const sim = JSON.parse(fs.readFileSync(path.join(OUT, 'b3_sim.json'), 'utf8'));
const usd = n => '$' + Math.round(n / 1e6).toLocaleString('en-US') + 'M';
const pc = v => Math.round(v * 100) + '%';
const R = sim.results, full = R['GPS + NavIC + LEO'], nav = R['GPS + NavIC'], gps = R['GPS only'];
const I = ph.inputs;

// jamming circles (to scale)
const maxR = ph.jamming.gps_denial_radius_km, S = 150 / maxR;
const jam = `<svg viewBox="0 0 340 340" role="img" aria-label="Area a 10 W jammer denies: GPS ${ph.jamming.gps_denial_radius_km} km radius, LEO ${ph.jamming.leo_denial_radius_km} km radius">
<circle cx="170" cy="170" r="${150}" class="cg"/><circle cx="170" cy="170" r="${Math.max(2, ph.jamming.leo_denial_radius_km * S)}" class="cl"/>
<circle cx="170" cy="170" r="3" class="jm"/>
<text x="170" y="40" text-anchor="middle" class="tg">GPS lost within ${ph.jamming.gps_denial_radius_km} km</text>
<text x="170" y="${170 + ph.jamming.leo_denial_radius_km * S + 18}" text-anchor="middle" class="tl">LEO lost within ${ph.jamming.leo_denial_radius_km} km</text></svg>`;

const rows = Object.entries(R).map(([k, r]) => `<tr${k.includes('LEO') ? ' class="hi"' : ''}><td>${k}</td><td>${pc(r.detection_rate)}</td><td>${pc(r.raim_detection_rate)}</td><td>${r.spoofed_median_error_m_uncorrected} m</td><td><b>${r.spoofed_median_error_m_ai_corrected} m</b></td><td>${r.clean_median_error_m} m</td></tr>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>NavContinuity Nav Integrity</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap" rel="stylesheet">
<style>
:root{--bg:#E9EDEC;--panel:#FFF;--rail:#17232C;--railfg:#C9D3D8;--ink:#17232C;--mut:#5A6870;--rule:#D3DAD9;--larper:#2C55C9;--claim:#B26E12;--claimbg:#FBEFD9;--ok:#2E7D4F;--focus:#2C55C9}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0F171C;--panel:#17222A;--rail:#0B1216;--railfg:#AEBBC1;--ink:#E4EBEA;--mut:#93A2A9;--rule:#2A3840;--larper:#86A3FF;--claim:#E6A84A;--claimbg:#33270F;--ok:#6CC08F;--focus:#86A3FF}}
:root[data-theme="dark"]{--bg:#0F171C;--panel:#17222A;--rail:#0B1216;--railfg:#AEBBC1;--ink:#E4EBEA;--mut:#93A2A9;--rule:#2A3840;--larper:#86A3FF;--claim:#E6A84A;--claimbg:#33270F;--ok:#6CC08F;--focus:#86A3FF}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 Archivo,system-ui,sans-serif}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.top{display:flex;align-items:center;gap:22px;padding:0 18px;height:54px;background:var(--rail);color:var(--railfg)}
.brand{font-weight:800;font-variation-settings:"wdth" 118;color:#fff;font-size:17px;display:flex;align-items:center;gap:9px}.brand svg{width:22px;height:22px}
.mods{display:flex;gap:4px;height:100%}.mods a{display:flex;align-items:center;gap:7px;padding:0 12px;color:var(--railfg);text-decoration:none;border-bottom:2px solid transparent;font-weight:600}
.mods a[aria-current]{color:#fff;border-bottom-color:#86A3FF}.mods a.soon{opacity:.55}.mods small{font-size:11px;border:1px solid currentColor;border-radius:4px;padding:0 5px}
main{max-width:1180px;margin:0 auto;padding:20px 20px 50px}
h1{font-size:26px;margin:0;font-weight:800;font-variation-settings:"wdth" 112}.sub{color:var(--mut);margin:2px 0 16px;max-width:80ch}
.tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}
.tile{background:var(--panel);border:1px solid var(--rule);border-radius:8px;padding:12px 14px}.tile .k{color:var(--mut);font-size:12.5px}
.tile .v{font-size:30px;line-height:1.1;font-weight:800;font-variation-settings:"wdth" 75;margin:3px 0 2px;color:var(--larper)}.tile .s{font-size:12px;color:var(--mut)}
.panel{background:var(--panel);border:1px solid var(--rule);border-radius:8px;padding:14px 16px;margin-bottom:14px}
.panel h2{font-size:15px;margin:0 0 10px;font-weight:750}
.two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}
.ev{font-size:11px;font-weight:650;border:1px solid currentColor;border-radius:4px;padding:0 5px;margin-left:4px}.ev.phy{color:var(--larper)}.ev.ass{color:var(--mut)}.ev.sim{color:var(--claim)}
.tbl{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums}.tbl th,.tbl td{border-bottom:1px solid var(--rule);padding:6px;text-align:left}.tbl th{color:var(--mut);font-weight:650}.tbl tr.hi td{background:var(--claimbg)}
.wrap{overflow-x:auto}.note{color:var(--mut);font-size:12.5px;margin:8px 0 0}
svg{width:100%;max-width:360px;height:auto;display:block;margin:0 auto}
.cg{fill:color-mix(in srgb,var(--claim) 18%,transparent);stroke:var(--claim);stroke-width:2}.cl{fill:color-mix(in srgb,var(--larper) 35%,transparent);stroke:var(--larper);stroke-width:2}.jm{fill:var(--ink)}
.tg{fill:var(--claim);font-size:13px;font-weight:700}.tl{fill:var(--larper);font-size:13px;font-weight:700}
.arch{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.arch div{border:1px solid var(--rule);border-radius:8px;padding:10px 12px}.arch b{display:block}
ul{margin:6px 0 0;padding-left:18px}
@media (max-width:820px){.top{flex-wrap:wrap;height:auto;padding:10px 14px}.mods{flex-wrap:wrap}.mods a{padding:6px 8px}.tiles{grid-template-columns:1fr 1fr}.two,.arch{grid-template-columns:1fr}}
</style></head><body>
<header class="top">
 <div class="brand"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#86A3FF" stroke-width="2"/><path d="M4 15 L20 9" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="12" r="2.4" fill="#E6A84A"/></svg>NavContinuity</div>
 <nav class="mods" aria-label="Modules">
  <a href="index.html">Site Monitor <small>Track A6</small></a>
  <a href="b3.html" aria-current="page">Nav Integrity <small>Track B3</small></a>
  <a class="soon" aria-disabled="true">Passenger Recovery <small>next</small></a>
 </nav>
</header>
<main>
<h1>Keeping aircraft position trustworthy when GPS is jammed or faked</h1>
<p class="sub">A low-orbit (LEO) navigation layer over India, used together with GPS and India's NavIC, plus an onboard check that spots faked GPS and corrects the position. Architecture with back-of-envelope physics and cost, and a simulation of the AI correction.</p>

<section class="tiles" aria-label="Key figures">
 <div class="tile"><div class="k">LEO signal vs GPS <span class="ev phy">physics</span></div><div class="v">${ph.signal.leo_advantage_factor}×</div><div class="s">stronger at the same transmit power (${ph.signal.leo_advantage_db} dB)</div></div>
 <div class="tile"><div class="k">Area a 10 W jammer blocks <span class="ev phy">physics</span></div><div class="v">${ph.jamming.denial_area_reduction_factor}× smaller</div><div class="s">${ph.jamming.gps_denial_radius_km} km radius for GPS, ${ph.jamming.leo_denial_radius_km} km for LEO</div></div>
 <div class="tile"><div class="k">Spoofed fix after correction <span class="ev sim">simulation</span></div><div class="v">${full.spoofed_median_error_m_uncorrected} → ${full.spoofed_median_error_m_ai_corrected} m</div><div class="s">median error, GPS + NavIC + LEO</div></div>
 <div class="tile"><div class="k">Constellation <span class="ev ass">assumed costs</span></div><div class="v">${ph.constellation.satellites_needed} sats</div><div class="s">${usd(ph.cost.capex_usd)} to build, ${usd(ph.cost.per_year_usd)} a year</div></div>
</section>

<section class="panel" aria-labelledby="h-arch"><h2 id="h-arch">Architecture</h2>
<div class="arch">
 <div><b>1 · LEO layer</b>${ph.constellation.satellites_needed} smallsats at ${ph.constellation.altitude_km} km broadcast ranging signals plus correction and authentication messages over Indian airspace.</div>
 <div><b>2 · Receiver</b>Aircraft use GPS, NavIC and LEO together; three independent sources are hard to fake at once.</div>
 <div><b>3 · Onboard check</b>A small model compares the constellations every second; if GPS disagrees, it is dropped and the fix comes from NavIC + LEO.</div>
 <div><b>4 · Insights down</b>Satellites and aircraft report "GPS faked here" events, not raw signals, to NavContinuity's GNSS map and passenger recovery.</div>
</div></section>

<div class="two">
<section class="panel" aria-labelledby="h-jam"><h2 id="h-jam">Jamming, to scale <span class="ev phy">physics</span></h2>${jam}
<p class="note">Free-space link budget at L1 (1575.42 MHz), ${I.elev_mask_deg.v}° elevation mask. GPS arrives at ${I.gps_min_received_dbm.v} dBm (spec minimum); a LEO satellite at ${ph.constellation.altitude_km} km with the same transmit power arrives ${ph.signal.leo_advantage_db} dB stronger. Jammer: ${I.jammer_power_w.v} W, receiver loses lock above ${I.js_tolerance_db.v} dB jammer-to-signal (assumed). Line-of-sight; terrain and antennas change real ranges.</p></section>
<section class="panel" aria-labelledby="h-cost"><h2 id="h-cost">Constellation and cost <span class="ev ass">assumed</span></h2>
<table class="tbl"><tr><td>Altitude, orbit period</td><td>${ph.constellation.altitude_km} km, ${ph.constellation.orbital_period_min} min</td></tr>
<tr><td>Ground each satellite sees (10° mask)</td><td>${ph.constellation.coverage_half_angle_deg}° radius, ${ph.constellation.surface_share_per_sat_pct}% of Earth</td></tr>
<tr><td>Satellites for ~${I.mean_sats_in_view_target.v} in view on average</td><td><b>${ph.constellation.satellites_needed}</b></td></tr>
<tr><td>Satellite + launch</td><td>$${I.sat_cost_usd.v / 1e6}M + ${I.sat_mass_kg.v} kg × $${I.launch_usd_per_kg.v.toLocaleString('en-US')}/kg each</td></tr>
<tr><td>Build cost</td><td><b>${usd(ph.cost.capex_usd)}</b></td></tr>
<tr><td>Per year (${I.design_life_years.v}-year life + operations)</td><td><b>${usd(ph.cost.per_year_usd)}</b></td></tr></table>
<p class="note">Order-of-magnitude assumptions, not quotes. Walker design and inclination tuning would refine the satellite count.</p></section>
</div>

<section class="panel" aria-labelledby="h-sim"><h2 id="h-sim">Simulation: subtle GPS spoofing (${sim.params.spoof_offset_m[0]}–${sim.params.spoof_offset_m[1]} m) <span class="ev sim">simulation</span></h2>
<div class="wrap"><table class="tbl"><tr><th scope="col">Receiver hears</th><th scope="col">Spoof caught: AI check</th><th scope="col">Caught: classic chi-square test</th><th scope="col">Error if trusted</th><th scope="col">Error after correction</th><th scope="col">Normal error</th></tr>${rows}</table></div>
<ul class="note">
<li>With GPS alone, a consistent spoof is invisible: both checks catch about ${pc(gps.detection_rate)}.</li>
<li>Adding independent constellations is what makes it detectable. Adding LEO lowers the corrected error from ${nav.spoofed_median_error_m_ai_corrected} m to ${full.spoofed_median_error_m_ai_corrected} m.</li>
<li>Honest result: our simple AI check (logistic regression) catches slightly fewer spoofs than the classic chi-square test (${pc(full.detection_rate)} vs ${pc(full.raim_detection_rate)}). The gain comes from the extra signals; a stronger model is future work.</li>
</ul>
<p class="note">${sim.caveat} ${sim.params.n_test.toLocaleString('en-US')} test epochs per configuration, 1% false-alarm target.</p></section>

<section class="panel" aria-labelledby="h-pay"><h2 id="h-pay">Who pays, and what it's worth</h2>
<p style="margin:0">Buyers: the Airports Authority of India and DGCA (national resilience, as GAGAN was funded), airlines through a per-flight integrity subscription, and defence and critical-infrastructure users. Worth: India reported 2,354 GPS interference incidents from Nov 2023 to Dec 2025; one commercial diversion costs €1,000–77,200 (EUROCONTROL, 2022 prices). If the layer prevented even 1 in 10 interference events from turning into a diversion, the avoided cost would be weighed against the ${usd(ph.cost.per_year_usd)} a year (illustrative, not measured).</p>
</section>
<p class="note">Code: b3/physics.mjs, b3/simulate.mjs in github.com/rehancodes-web/Mack.1. Figures labelled physics are computed from standard formulas; assumed inputs are listed in b3/outputs/b3_physics.json.</p>
</main></body></html>`;
fs.writeFileSync(path.join(DOCS, 'b3.html'), html);
console.log('wrote docs/b3.html');
