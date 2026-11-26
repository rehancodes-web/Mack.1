// High-resolution before/after of the Jewar footprint from Esri World Imagery Wayback (sub-metre archive).
// Stitches zoom-16 tiles (~2 m/px at this latitude) and draws the OSM footprint outline.
// Usage: node wayback_mosaic.mjs 2019-10-09 2023-08-31 2026-05-28   (release dates from outputs/wayback_jewar.json)
// Imagery: Esri, Maxar, Earthstar Geographics and the GIS user community. Use with attribution.
import fs from 'node:fs';
import path from 'node:path';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs');
const Z = 16, PAD = 0.004; // degrees around the footprint
const gj = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'data', 'noida_airport_footprint.geojson'), 'utf8'));
const ring = gj.features[0].geometry.coordinates[0];
const lons = ring.map(p => p[0]), lats = ring.map(p => p[1]);
const bb = { w: Math.min(...lons) - PAD, e: Math.max(...lons) + PAD, s: Math.min(...lats) - PAD, n: Math.max(...lats) + PAD };
const fx = lon => (lon + 180) / 360 * 2 ** Z;
const fy = lat => (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** Z;
const x0 = Math.floor(fx(bb.w)), x1 = Math.floor(fx(bb.e)), y0 = Math.floor(fy(bb.n)), y1 = Math.floor(fy(bb.s));
const W = (x1 - x0 + 1) * 256, H = (y1 - y0 + 1) * 256;
const meta = JSON.parse(fs.readFileSync(path.join(OUT, 'wayback_jewar.json'), 'utf8')).distinct;

for (const date of process.argv.slice(2)) {
  const r = meta.find(m => m.release === date);
  if (!r) { console.warn(`no release ${date} in wayback_jewar.json`); continue; }
  const png = new PNG({ width: W, height: H });
  const jobs = [];
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) jobs.push([tx, ty]);
  for (let i = 0; i < jobs.length; i += 8) {
    await Promise.all(jobs.slice(i, i + 8).map(async ([tx, ty]) => {
      const u = `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/${r.release_id}/${Z}/${ty}/${tx}`;
      for (let a = 1; a <= 4; a++) {
        try {
          const img = jpeg.decode(Buffer.from(await (await fetch(u)).arrayBuffer()), { useTArray: true });
          const ox = (tx - x0) * 256, oy = (ty - y0) * 256;
          for (let yy = 0; yy < 256; yy++) for (let xx = 0; xx < 256; xx++) {
            const s = (yy * 256 + xx) * 4, d = ((oy + yy) * W + ox + xx) * 4;
            png.data[d] = img.data[s]; png.data[d + 1] = img.data[s + 1]; png.data[d + 2] = img.data[s + 2]; png.data[d + 3] = 255;
          }
          return;
        } catch { await new Promise(res => setTimeout(res, 800 * a)); }
      }
    }));
  }
  // footprint outline (yellow, 3 px)
  const px = ([lon, lat]) => [(fx(lon) - x0) * 256, (fy(lat) - y0) * 256];
  for (let k = 0; k < ring.length - 1; k++) {
    const [ax, ay] = px(ring[k]), [bx, by] = px(ring[k + 1]);
    const n = Math.ceil(Math.hypot(bx - ax, by - ay) * 2);
    for (let t = 0; t <= n; t++) {
      const cx = Math.round(ax + (bx - ax) * t / n), cy = Math.round(ay + (by - ay) * t / n);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const X = cx + dx, Y = cy + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const o = (Y * W + X) * 4; png.data[o] = 255; png.data[o + 1] = 214; png.data[o + 2] = 0;
      }
    }
  }
  const f = path.join(OUT, `hires_${date}.png`);
  fs.writeFileSync(f, PNG.sync.write(png));
  console.log(`${f} ${W}x${H} (${jobs.length} tiles, release ${date}, captured on or before)`);
}
