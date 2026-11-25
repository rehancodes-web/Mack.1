// A6 -> NavContinuity hand-off: one asset record saying whether this airport can serve as recovery capacity
// (diversions, rebooked passengers), when satellite evidence says it physically took shape, and how that
// compares with reported dates. Track C reads `region` from here.
// Usage: node readiness.mjs   -> outputs/readiness.json
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs');
const base = JSON.parse(fs.readFileSync(path.join(OUT, 'progress_baseline.json'), 'utf8'));
const aiFile = path.join(OUT, 'progress_ai.json');
const ai = fs.existsSync(aiFile) ? JSON.parse(fs.readFileSync(aiFile, 'utf8')).results : null;

const P = { start_excess: 0.05, plateau_share_of_peak: 0.9, region_radius_km: 50 }; // assumed thresholds
const rows = base.results.filter(r => r.fp_cleared_12m != null);
const peak = rows.reduce((a, r) => (r.fp_cleared_12m > a.fp_cleared_12m ? r : a));
const start = rows.find(r => r.excess_cleared_12m != null && r.excess_cleared_12m >= P.start_excess);
const plateau = rows.find(r => r.fp_cleared_12m >= P.plateau_share_of_peak * peak.fp_cleared_12m);

let aiBlock = { status: 'unknown', reason: 'progress_ai.json not present' };
if (ai) {
  const ok = ai.filter(r => r.built_paved_frac != null);
  const latest = ok[ok.length - 1];
  const at = m => ok.find(r => r.month === m)?.built_paved_frac ?? null;
  aiBlock = { status: 'derived', latest_month: latest.month, latest_built_paved_frac: latest.built_paved_frac,
    built_paved_2025_01: at('2025-01'), built_paved_2026_03: at('2026-03') };
}

// region for Track C: footprint centre + radius
const lon = 77.6082, lat = 28.1709; // footprint bbox centre (data/README.md: lon 77.5750-77.6414, lat 28.1565-28.1854)

const out = {
  schema_version: '1.0', generated_utc: new Date().toISOString(),
  asset: { name: 'Noida International Airport (Jewar)', type: 'airport',footprint_ha: Math.round(base.grid.footprint_pixels / 100), footprint_source: 'OSM way 1089989191' },
  region: { centre: { lon, lat }, radius_km: P.region_radius_km, origin: 'assumed', note: 'Track C evaluates GNSS evidence inside this circle; no coverage = unknown, not safe' },
  reported: [
    { date: '2021-11-25', event: 'Foundation stone' },
    { date: '2025-01-28', event: '"80% work complete"' },
    { date: '2026-03-28', event: 'Phase 1 inaugurated' },
    { date: '2026-06-15', event: 'Commercial flights (sources disagree on date)' },
  ].map(x => ({ ...x, origin: 'reported' })),
  satellite: {
    origin: 'derived', metric: 'fp_cleared_12m (land conversion, not completion)',
    conversion_start_month: start?.month ?? null, peak_month: peak.month, peak_frac: peak.fp_cleared_12m,
    plateau_month: plateau?.month ?? null, ai_classifier: aiBlock,
  },
  recovery_capacity: {
    physically_present: plateau ? 'yes (derived: land conversion plateaued ' + plateau.month + ')' : 'unknown',
    operational_status: 'reported operational from 2026 (inauguration 28 Mar 2026); satellite cannot confirm runway certification or ATC readiness',
    usable_for_navcontinuity: 'candidate diversion / rebooking airport only after airline confirms slots, ground handling and approach procedures',
    origin: 'derived + reported',
  },
  params: P,
};
fs.writeFileSync(path.join(OUT, 'readiness.json'), JSON.stringify(out, null, 1));
console.log(`start ${out.satellite.conversion_start_month}, peak ${peak.month} (${peak.fp_cleared_12m}), plateau ${out.satellite.plateau_month}, AI ${aiBlock.status}`);
