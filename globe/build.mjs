// Builds ../docs/globe-data.json for the 3D globe:
//  - airports: OurAirports (public domain): every airport with scheduled passenger service, plus all large airports
//  - satellites: current orbital elements (TLE) from CelesTrak for GPS, Galileo and NavIC (IRNSS/NVS)
//  - gnss: Track C interference cells (high/medium) from c/outputs/gnss_cells.json
// Usage: node build.mjs
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const DOCS = path.join(HERE, '..', 'docs');

// --- airports ---
const csv = await (await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv')).text();
const parseLine = l => { const out = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out; };
const lines = csv.replace(/\r/g, '').split('\n'); const H = parseLine(lines[0]); const ix = k => H.indexOf(k);
const airports = [];
for (const l of lines.slice(1)) {
  if (!l) continue; const r = parseLine(l);
  const type = r[ix('type')], country = r[ix('iso_country')], sched = r[ix('scheduled_service')];
  const keep = type === 'large_airport' || (sched === 'yes' && (type === 'medium_airport' || type === 'small_airport'));
  if (!keep) continue;
  airports.push([r[ix('name')], r[ix('iata_code')] || r[ix('ident')], +(+r[ix('latitude_deg')]).toFixed(4), +(+r[ix('longitude_deg')]).toFixed(4), country, type === 'large_airport' ? 1 : 0]);
}
// Jewar (opened 2026) may not be tagged large yet: make sure it is present and marked
if (!airports.some(a => a[1] === 'DXN' || /Noida International/i.test(a[0]))) airports.push(['Noida International Airport (Jewar)', 'DXN', 28.1709, 77.6082, 'IN', 1]);

// --- satellites ---
const tle = async q => { const t = await (await fetch(`https://celestrak.org/NORAD/elements/gp.php?${q}&FORMAT=tle`)).text();
  const L = t.replace(/\r/g, '').split('\n').filter(Boolean), out = []; for (let i = 0; i + 2 < L.length + 1; i += 3) if (L[i + 1]?.startsWith('1 ') && L[i + 2]?.startsWith('2 ')) out.push([L[i].trim(), L[i + 1], L[i + 2]]); return out; };
// LEO: real low-orbit navigation satellites. Iridium NEXT carries Iridium STL (commercial positioning and timing, a GPS
// backup); Xona PULSAR-0 is a dedicated LEO navigation demonstrator. Both are what Track B3 proposes at larger scale.
const sats = { GPS: await tle('GROUP=gps-ops'), Galileo: await tle('GROUP=galileo'), NavIC: [...await tle('NAME=IRNSS'), ...await tle('NAME=NVS')],
  LEO: [...await tle('NAME=PULSAR'), ...await tle('GROUP=iridium-NEXT')] };

// --- collision screen: real tracked LEO objects. Iridium NEXT flies in the same ~780 km shell as the Iridium-33 and
// Cosmos-2251 debris clouds, so real close approaches between a manoeuvrable satellite and debris are common.
// kind: 1 = active satellite that can manoeuvre (assumed for these constellations/stations), 0 = debris / rocket body / other
const screenGroups = [['GROUP=iridium-NEXT', 1], ['GROUP=oneweb', 1], ['GROUP=stations', 1], ['GROUP=visual', 0],
  ['GROUP=cosmos-2251-debris', 0], ['GROUP=iridium-33-debris', 0], ['GROUP=fengyun-1c-debris', 0]];
const seen = new Set(), screen = [];
for (const [q, k] of screenGroups) for (const [name, l1, l2] of await tle(q)) {
  const id = l1.slice(2, 7); if (seen.has(id)) continue; seen.add(id);
  const kind = k && !/ DEB|R\/B|DEBRIS/.test(name) ? 1 : 0;
  screen.push([name, l1, l2, kind]);
}

// --- Track C interference cells ---
const cellsFile = path.join(HERE, '..', 'c', 'outputs', 'gnss_cells.json');
const gnss = fs.existsSync(cellsFile) ? JSON.parse(fs.readFileSync(cellsFile, 'utf8')).cells.filter(c => c.rating === 'high' || c.rating === 'medium').map(c => [c.lat, c.lon, c.rating === 'high' ? 2 : 1, c.share, c.aircraft]) : [];

const out = { generated_utc: new Date().toISOString(), sources: { airports: 'OurAirports (public domain)', satellites: 'CelesTrak GP elements', collision_screen: 'CelesTrak GP elements: Iridium NEXT, OneWeb, stations, visual, Cosmos-2251 / Iridium-33 / Fengyun-1C debris', gnss: 'Track C, ADS-B Exchange samples 2026-11-01' }, airports, sats, screen, gnss };
fs.writeFileSync(path.join(DOCS, 'globe-data.json'), JSON.stringify(out));
console.log(`airports ${airports.length} (India ${airports.filter(a => a[4] === 'IN').length}); sats GPS ${sats.GPS.length}, Galileo ${sats.Galileo.length}, NavIC ${sats.NavIC.length}, LEO ${sats.LEO.length}, screen ${screen.length}; gnss cells ${gnss.length}; ${(fs.statSync(path.join(DOCS, 'globe-data.json')).size / 1024).toFixed(0)} kB`);
