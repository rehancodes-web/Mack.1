// Track B3: back-of-envelope physics and cost for a LEO navigation-augmentation layer over India.
// Every input is labelled: "physics" (standard constants/formulas), "published" (cited figure) or "assumed".
// Usage: node physics.mjs   -> outputs/b3_physics.json
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs'); fs.mkdirSync(OUT, { recursive: true });

const C = 299792458, RE = 6371e3, deg = Math.PI / 180;
const IN = {
  f_l1_hz: { v: 1575.42e6, o: 'physics' },
  gps_alt_m: { v: 20200e3, o: 'physics' },
  gps_min_received_dbm: { v: -128.5, o: 'published', src: 'IS-GPS-200 minimum L1 C/A received power' },
  leo_alt_m: { v: 1000e3, o: 'assumed' },
  elev_mask_deg: { v: 10, o: 'assumed' },
  leo_eirp_dbw_extra: { v: 0, o: 'assumed', note: 'LEO satellite transmits the same EIRP as a GPS satellite; any extra power adds directly' },
  jammer_power_w: { v: 10, o: 'assumed', note: 'small commercial-grade jammer' },
  jammer_gain_dbi: { v: 0, o: 'assumed' },
  js_tolerance_db: { v: 30, o: 'assumed', note: 'jammer-to-signal ratio a civil receiver tolerates before losing lock' },
  mean_sats_in_view_target: { v: 4, o: 'assumed', note: 'mean LEO satellites visible, so that >=2 are almost always in view' },
  sat_cost_usd: { v: 3e6, o: 'assumed', note: '~150 kg smallsat with navigation payload' },
  sat_mass_kg: { v: 150, o: 'assumed' },
  launch_usd_per_kg: { v: 6000, o: 'assumed', note: 'rideshare-class price' },
  ops_usd_per_year: { v: 8e6, o: 'assumed', note: 'ground segment and operations' },
  design_life_years: { v: 6, o: 'assumed' },
};
const v = k => IN[k].v;
const lambda = C / v('f_l1_hz');
const fspl = d => 20 * Math.log10(4 * Math.PI * d / lambda);
const slant = (h, eDeg) => { const e = eDeg * deg; return Math.sqrt((RE + h) ** 2 - (RE * Math.cos(e)) ** 2) - RE * Math.sin(e); };

// 1. signal strength: LEO vs GPS at the same transmit power
const gpsWorst = slant(v('gps_alt_m'), v('elev_mask_deg')), leoWorst = slant(v('leo_alt_m'), v('elev_mask_deg'));
const gainDb = fspl(gpsWorst) - fspl(leoWorst) + v('leo_eirp_dbw_extra');
const leoReceivedDbm = v('gps_min_received_dbm') + gainDb;

// 2. jamming: radius at which the jammer overwhelms the receiver, J/S > tolerance
const jamEirpDbm = 10 * Math.log10(v('jammer_power_w') * 1000) + v('jammer_gain_dbi');
const denialRadius = sigDbm => { const maxLoss = jamEirpDbm - (sigDbm + v('js_tolerance_db')); return (lambda / (4 * Math.PI)) * 10 ** (maxLoss / 20); };
const rGps = denialRadius(v('gps_min_received_dbm')), rLeo = denialRadius(leoReceivedDbm);

// 3. constellation size: coverage cap half-angle and mean satellites in view
const e = v('elev_mask_deg') * deg, h = v('leo_alt_m');
const capHalfAngle = Math.acos(RE * Math.cos(e) / (RE + h)) - e; // Earth central angle
const capFraction = (1 - Math.cos(capHalfAngle)) / 2;           // share of Earth's surface one satellite sees
const nSats = Math.ceil(v('mean_sats_in_view_target') / capFraction);
const periodMin = 2 * Math.PI * Math.sqrt((RE + h) ** 3 / 3.986004418e14) / 60;

// 4. cost
const capex = nSats * (v('sat_cost_usd') + v('sat_mass_kg') * v('launch_usd_per_kg'));
const perYear = capex / v('design_life_years') + v('ops_usd_per_year');

const r = (x, n = 1) => +x.toFixed(n);
const out = {
  schema_version: '1.0', generated_utc: new Date().toISOString(), inputs: IN,
  signal: { gps_slant_km_at_mask: r(gpsWorst / 1e3, 0), leo_slant_km_at_mask: r(leoWorst / 1e3, 0), leo_advantage_db: r(gainDb), leo_advantage_factor: r(10 ** (gainDb / 10), 0), leo_received_dbm: r(leoReceivedDbm), origin: 'derived (physics)' },
  jamming: { jammer_eirp_dbm: r(jamEirpDbm), gps_denial_radius_km: r(rGps / 1e3), leo_denial_radius_km: r(rLeo / 1e3, 2), denial_area_reduction_factor: r((rGps / rLeo) ** 2, 0), origin: 'derived (physics, free-space, line of sight)' },
  constellation: { altitude_km: h / 1e3, orbital_period_min: r(periodMin), coverage_half_angle_deg: r(capHalfAngle / deg), surface_share_per_sat_pct: r(capFraction * 100, 2), satellites_needed: nSats, note: 'mean-in-view estimate for near-global shells; Walker design and inclination tuning would refine it', origin: 'derived (geometry)' },
  cost: { capex_usd: Math.round(capex), per_year_usd: Math.round(perYear), origin: 'assumed inputs' },
  caveats: ['Free-space, line-of-sight model: terrain and aircraft antennas change real ranges.', 'Equal-EIRP comparison; real LEO PNT payloads may transmit more or less.', 'Costs are order-of-magnitude assumptions, not quotes.'],
};
fs.writeFileSync(path.join(OUT, 'b3_physics.json'), JSON.stringify(out, null, 1));
console.log(`LEO signal ${out.signal.leo_advantage_db} dB stronger (${out.signal.leo_advantage_factor}x)`);
console.log(`10 W jammer denial radius: GPS ${out.jamming.gps_denial_radius_km} km vs LEO ${out.jamming.leo_denial_radius_km} km (area ${out.jamming.denial_area_reduction_factor}x smaller)`);
console.log(`constellation: ${nSats} sats at ${h / 1e3} km, period ${out.constellation.orbital_period_min} min; capex $${(capex / 1e6).toFixed(0)}M, $${(perYear / 1e6).toFixed(0)}M/yr`);
