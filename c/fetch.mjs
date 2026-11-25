// Track C data: downloads ADS-B Exchange free "readsb-hist" global snapshots (1st of each month, every 5 s available)
// and keeps only aircraft over South Asia with their GPS integrity fields. Raw files are deleted after extraction.
// Usage: node fetch.mjs [YYYY/MM/DD] [step_minutes]   -> cache/<date>_<HHMMSS>.json (compact rows)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const RAW = path.join(HERE, 'raw'), CACHE = path.join(HERE, 'cache');
fs.mkdirSync(RAW, { recursive: true }); fs.mkdirSync(CACHE, { recursive: true });
const day = process.argv[2] || '2026/11/01', step = Number(process.argv[3] || 20);
const BOX = { latMin: 5, latMax: 38, lonMin: 60, lonMax: 98 }; // India and neighbouring airspace
const CONCURRENCY = 4;

const times = [];
for (let m = 0; m < 24 * 60; m += step) times.push(`${String(Math.floor(m / 60)).padStart(2, '0')}${String(m % 60).padStart(2, '0')}00`);

async function one(t) {
  const tag = `${day.replace(/\//g, '-')}_${t}`, out = path.join(CACHE, `${tag}.json`);
  if (fs.existsSync(out)) return 'cached';
  for (let a = 1; a <= 4; a++) {
    try {
      const r = await fetch(`https://samples.adsbexchange.com/readsb-hist/${day}/${t}Z.json.gz`);
      if (r.status === 404) return 'missing';
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      let buf = Buffer.from(await r.arrayBuffer());
      if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf); // some files arrive already decompressed
      const j = JSON.parse(buf.toString('utf8'));
      const rows = j.aircraft.filter(x => x.lat >= BOX.latMin && x.lat <= BOX.latMax && x.lon >= BOX.lonMin && x.lon <= BOX.lonMax && x.type === 'adsb_icao')
        .map(x => [x.hex, +x.lat.toFixed(3), +x.lon.toFixed(3), x.nic ?? null, x.nac_p ?? null, typeof x.alt_baro === 'number' ? x.alt_baro : null, x.alt_geom ?? null, x.version ?? null]);
      fs.writeFileSync(out, JSON.stringify({ now: j.now, cols: ['hex', 'lat', 'lon', 'nic', 'nac_p', 'alt_baro', 'alt_geom', 'version'], rows }));
      return rows.length;
    } catch (e) { if (a === 4) return `error ${e.message}`; await new Promise(res => setTimeout(res, 2000 * a)); }
  }
}
const q = [...times]; let done = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => { while (q.length) { const t = q.shift(); const r = await one(t); done++; process.stdout.write(`${t}:${r} `); } }));
console.log(`\n${done} snapshots for ${day}`);
