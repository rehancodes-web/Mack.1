// Finds Esri World Imagery Wayback releases whose imagery over the Jewar site actually changed,
// by hashing one zoom-15 tile at the footprint centre for every release.
// Usage: node wayback_dates.mjs  -> outputs/wayback_jewar.json (+ outputs/wayback_tiles/<release>.jpg for each distinct one)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const TD = path.join(HERE, 'outputs', 'wayback_tiles'); fs.mkdirSync(TD, { recursive: true });
const PT = { lon: 77.6082, lat: 28.1709 }, Z = 15;
const x = Math.floor((PT.lon + 180) / 360 * 2 ** Z);
const y = Math.floor((1 - Math.log(Math.tan(PT.lat * Math.PI / 180) + 1 / Math.cos(PT.lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** Z);
const cfg = await (await fetch('https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json')).json();
const rel = Object.entries(cfg).map(([id, v]) => ({ id: Number(id), date: (v.itemTitle.match(/\d{4}-\d{2}-\d{2}/) || [])[0] }))
  .filter(r => r.date).sort((a, b) => a.date.localeCompare(b.date));

const out = []; let last = null;
for (let i = 0; i < rel.length; i += 6) {
  const batch = rel.slice(i, i + 6);
  const res = await Promise.all(batch.map(async r => {
    const u = `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/${r.id}/${Z}/${y}/${x}`;
    try { const b = Buffer.from(await (await fetch(u)).arrayBuffer()); return { r, b, h: crypto.createHash('md5').update(b).digest('hex') }; } catch { return { r, b: null, h: 'err' }; }
  }));
  for (const { r, b, h } of res) {
    if (h !== last && b && b.length > 2000) { out.push({ release: r.date, release_id: r.id, tile_bytes: b.length }); fs.writeFileSync(path.join(TD, `${r.date}.jpg`), b); console.log(r.date, r.id, b.length); last = h; }
  }
}
fs.writeFileSync(path.join(HERE, 'outputs', 'wayback_jewar.json'), JSON.stringify({ point: PT, zoom: Z, tile: { x, y }, note: 'First release in which the imagery over this tile changed; actual capture date is on or before the release date', distinct: out }, null, 1));
console.log(`distinct imagery versions: ${out.length}`);
