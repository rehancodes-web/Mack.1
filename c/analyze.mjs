// Track C detector: GPS interference over South Asia from real ADS-B integrity reports (ADS-B Exchange samples).
// Method (gpsjam.org-style, protective monitoring only): each aircraft broadcasts NIC, its own GPS integrity category.
// An aircraft is "degraded" in a 1-degree cell when most of its reports there have NIC < 7. A cell is rated by the share
// of degraded aircraft: low < 2%, medium 2-10%, high > 10%, and "unknown" with fewer than MIN_AIRCRAFT aircraft.
// No transmitter location, no attribution, and no individual flights in the output.
// Usage: node analyze.mjs  -> outputs/gnss_cells.json, outputs/gnss_summary.json
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const CACHE = path.join(HERE, 'cache'), OUT = path.join(HERE, 'outputs'); fs.mkdirSync(OUT, { recursive: true });
const P = { cell_deg: 1, nic_bad_below: 7, min_aircraft: 10, low_max: 0.02, medium_max: 0.10, min_version: 1, spoof_alt_gap_ft: 1500 };
const JEWAR = { name: 'Noida International Airport (Jewar)', lat: 28.1709, lon: 77.6082, radius_km: 50 };

const files = fs.readdirSync(CACHE).filter(f => f.endsWith('.json')).sort();
if (!files.length) throw new Error('no cached snapshots: run node fetch.mjs first');
const days = [...new Set(files.map(f => f.slice(0, 10)))];
const cells = new Map(); // key "lat,lon" -> Map(hex -> {n, bad, altgap})
let reports = 0, snapshots = 0;
const key = (lat, lon) => `${Math.floor(lat / P.cell_deg) * P.cell_deg},${Math.floor(lon / P.cell_deg) * P.cell_deg}`;
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(CACHE, f), 'utf8')); snapshots++;
  for (const [hex, lat, lon, nic, , altB, altG, ver] of j.rows) {
    if (nic == null || (ver ?? 0) < P.min_version) continue;
    reports++;
    const k = key(lat, lon); if (!cells.has(k)) cells.set(k, new Map());
    const m = cells.get(k); const a = m.get(hex) || { n: 0, bad: 0, altgap: 0 };
    a.n++; if (nic < P.nic_bad_below) a.bad++;
    if (altB != null && altG != null && nic >= P.nic_bad_below && Math.abs(altG - altB) > P.spoof_alt_gap_ft && altB > 10000) a.altgap++;
    m.set(hex, a);
  }
}
const rate = s => (s.aircraft < P.min_aircraft ? 'unknown' : s.share <= P.low_max ? 'low' : s.share <= P.medium_max ? 'medium' : 'high');
const out = [...cells.entries()].map(([k, m]) => {
  const [lat, lon] = k.split(',').map(Number), ac = [...m.values()];
  const degraded = ac.filter(a => a.bad / a.n > 0.5).length;
  const s = { lat, lon, aircraft: ac.length, degraded, share: ac.length ? +(degraded / ac.length).toFixed(3) : 0, alt_mismatch_aircraft: ac.filter(a => a.altgap / a.n > 0.5).length };
  return { ...s, rating: rate(s) };
}).sort((a, b) => b.lat - a.lat || a.lon - b.lon);

// distance from the Jewar region centre to each cell centre
const km = (a, b, c, d) => { const R = 6371, r = Math.PI / 180, x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const near = out.filter(c => km(JEWAR.lat, JEWAR.lon, c.lat + P.cell_deg / 2, c.lon + P.cell_deg / 2) <= JEWAR.radius_km + 80); // cells overlapping the 50 km circle
const order = ['unknown', 'low', 'medium', 'high'];
const known = near.filter(c => c.rating !== 'unknown');
const worst = known.length ? known.reduce((a, c) => (order.indexOf(c.rating) > order.indexOf(a.rating) ? c : a)) : null;
const jewar = {
  ...JEWAR, cells_considered: near.map(c => `${c.lat}N ${c.lon}E`), aircraft_seen: near.reduce((s, c) => s + c.aircraft, 0),
  status: !worst ? 'unknown' : worst.rating === 'low' ? 'normal' : 'degraded', worst_cell: worst,
  note: 'Unknown means not enough aircraft were observed, never "safe".',
};
const rated = out.filter(c => c.rating !== 'unknown');
const summary = {
  schema_version: '1.0', generated_utc: new Date().toISOString(), evidence_type: 'derived (real ADS-B integrity reports)',
  source: 'ADS-B Exchange free sample data (readsb-hist), aircraft-reported NIC', days, snapshots, reports, params: P,
  cells_rated: rated.length, cells_high: rated.filter(c => c.rating === 'high').length, cells_medium: rated.filter(c => c.rating === 'medium').length,
  hotspots: rated.filter(c => c.rating !== 'low').sort((a, b) => b.share - a.share).slice(0, 8),
  jewar_region: jewar,
  caveats: ['NIC drops can also come from avionics faults or single aircraft; ratings need several aircraft per cell.', 'Sampled snapshots, not continuous coverage.', 'Shows where GPS was degraded, not who caused it (protective use only).'],
};
fs.writeFileSync(path.join(OUT, 'gnss_cells.json'), JSON.stringify({ params: P, cells: out }, null, 0));
fs.writeFileSync(path.join(OUT, 'gnss_summary.json'), JSON.stringify(summary, null, 1));
console.log(`${snapshots} snapshots, ${reports} reports, ${rated.length} rated cells: ${summary.cells_high} high, ${summary.cells_medium} medium`);
console.log('hotspots:', summary.hotspots.map(c => `${c.lat}N${c.lon}E ${Math.round(c.share * 100)}% of ${c.aircraft}`).join(' | '));
console.log(`Jewar region: ${jewar.status} (${jewar.aircraft_seen} aircraft in nearby cells)`);
