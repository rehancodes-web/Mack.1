// True-colour quick-looks of the airport window for chosen months, with the footprint outline.
// Usage: node quicklook.mjs 2020-03 2022-11 2026-03
import fs from 'node:fs';
import path from 'node:path';
import { fromUrl } from 'geotiff';
import proj4 from 'proj4';
import { PNG } from 'pngjs';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const DATA = path.join(HERE, '..', 'data'), OUT = path.join(HERE, 'outputs');
fs.mkdirSync(OUT, { recursive: true });
const months = process.argv.slice(2);
const utm = '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs';
const gj = JSON.parse(fs.readFileSync(path.join(DATA, 'noida_airport_footprint.geojson'), 'utf8'));
const ring = gj.features[0].geometry.coordinates[0].map(([lon, lat]) => proj4('WGS84', utm, [lon, lat]));
const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]), PAD = 800;
const bb = { minx: Math.min(...xs) - PAD, maxx: Math.max(...xs) + PAD, miny: Math.min(...ys) - PAD, maxy: Math.max(...ys) + PAD };
const lines = fs.readFileSync(path.join(DATA, 's2_monthly_manifest.csv'), 'utf8').replace(/\r/g, '').trim().split('\n');
const hdr = lines[0].split(',');
const scenes = lines.slice(1).map(l => Object.fromEntries(l.split(',').map((v, i) => [hdr[i], v])));

async function win(url) {
  const img = await (await fromUrl(url)).getImage();
  const [ox, oy] = img.getOrigin();
  const c0 = Math.floor((bb.minx - ox) / 10), c1 = Math.ceil((bb.maxx - ox) / 10);
  const r0 = Math.floor((oy - bb.maxy) / 10), r1 = Math.ceil((oy - bb.miny) / 10);
  const [band] = await img.readRasters({ window: [c0, r0, c1, r1] });
  return { band, ox, oy, c0, r0, w: c1 - c0, h: r1 - r0 };
}

for (const m of months) {
  const s = scenes.find(x => x.month === m);
  if (!s) { console.warn(`no scene for ${m}`); continue; }
  const [r, g, b] = await Promise.all([win(s.red_B04), win(s.green_B03), win(s.blue_B02)]);
  const scale = Number(s.scale), offset = Number(s.offset);
  const png = new PNG({ width: r.w, height: r.h });
  const tone = v => Math.max(0, Math.min(255, Math.round(255 * Math.pow(Math.max(0, v * scale + offset) / 0.3, 1 / 1.6))));
  for (let i = 0; i < r.w * r.h; i++) {
    png.data[i * 4] = tone(r.band[i]); png.data[i * 4 + 1] = tone(g.band[i]); png.data[i * 4 + 2] = tone(b.band[i]); png.data[i * 4 + 3] = 255;
  }
  // footprint outline in yellow
  const toPx = ([x, y]) => [(x - r.ox) / 10 - r.c0, (r.oy - y) / 10 - r.r0];
  for (let k = 0; k < ring.length - 1; k++) {
    const [x0, y0] = toPx(ring[k]), [x1, y1] = toPx(ring[k + 1]);
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let t = 0; t <= n; t++) {
      const px = Math.round(x0 + (x1 - x0) * t / n), py = Math.round(y0 + (y1 - y0) * t / n);
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1]]) {
        const X = px + dx, Y = py + dy; if (X < 0 || Y < 0 || X >= r.w || Y >= r.h) continue;
        const o = (Y * r.w + X) * 4; png.data[o] = 255; png.data[o + 1] = 214; png.data[o + 2] = 0;
      }
    }
  }
  const f = path.join(OUT, `quicklook_${m}.png`);
  fs.writeFileSync(f, PNG.sync.write(png));
  console.log(`${f}  ${s.scene_id}  ${r.w}x${r.h}`);
}
