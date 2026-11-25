// Track A6 baseline: construction-progress curve for Noida International Airport from Sentinel-2 L2A.
// Reads only the footprint window from cloud-optimised GeoTIFFs listed in ../data/s2_monthly_manifest.csv.
// Usage: node progress.mjs            (uses cache in ./cache, fetches what is missing)
import fs from 'node:fs';
import path from 'node:path';
import { fromUrl } from 'geotiff';
import proj4 from 'proj4';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const DATA = path.join(HERE, '..', 'data');
const OUT = path.join(HERE, 'outputs');
const CACHE = path.join(HERE, 'cache');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(CACHE, { recursive: true });

// ---------- parameters (declared, versioned) ----------
const PARAMS = {
  version: 'baseline-v2',
  ring_m: 1500,             // reference ring: footprint bbox expanded by this, minus footprint
  ring_gap_m: 300,          // exclude pixels within this distance of the footprint bbox (edge works)
  nonveg_ndvi: 0.25,        // instantaneous "not vegetated" threshold
  cleared_ndvi: 0.30,       // pixel counts as cleared if its max NDVI over trailing 12 months < this
  window_months: 12,
  exclude_months: [7, 8, 9], // monsoon: airfield grass and fallow scrub green up, farmland signal is weakest
  version_note: 'v2: cleared-12m uses non-monsoon scenes only; per-scene offset checked against data',
  min_clear_frac: 0.6,      // dates with less clear footprint than this are reported as gaps
  invalid_scl: [0, 1, 3, 8, 9, 10], // nodata, saturated, cloud shadow, cloud med/high, cirrus
};

// ---------- footprint in UTM 43N ----------
const utm = '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs';
const gj = JSON.parse(fs.readFileSync(path.join(DATA, 'noida_airport_footprint.geojson'), 'utf8'));
const ring = gj.features[0].geometry.coordinates[0].map(([lon, lat]) => proj4('WGS84', utm, [lon, lat]));
const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]);
const fb = { minx: Math.min(...xs), maxx: Math.max(...xs), miny: Math.min(...ys), maxy: Math.max(...ys) };
const bb = { minx: fb.minx - PARAMS.ring_m, maxx: fb.maxx + PARAMS.ring_m, miny: fb.miny - PARAMS.ring_m, maxy: fb.maxy + PARAMS.ring_m };
const inPoly = (x, y) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };

// ---------- manifest ----------
const lines = fs.readFileSync(path.join(DATA, 's2_monthly_manifest.csv'), 'utf8').replace(/\r/g, '').trim().split('\n');
const hdr = lines[0].split(',');
const scenes = lines.slice(1).map(l => Object.fromEntries(l.split(',').map((v, i) => [hdr[i], v])));

// ---------- window reading ----------
let grid = null; // { x0, y0, w, h, mask: Uint8Array (1 footprint, 2 ring, 0 other) } on the 10 m grid
async function readWindow(url, res) {
  const tif = await fromUrl(url);
  const img = await tif.getImage();
  const [ox, oy] = img.getOrigin(); const [rx] = img.getResolution();
  if (Math.abs(rx - res) > 1e-6) throw new Error(`unexpected resolution ${rx} for ${url}`);
  const c0 = Math.floor((bb.minx - ox) / res), c1 = Math.ceil((bb.maxx - ox) / res);
  const r0 = Math.floor((oy - bb.maxy) / res), r1 = Math.ceil((oy - bb.miny) / res);
  const [band] = await img.readRasters({ window: [c0, r0, c1, r1] });
  return { band, ox, oy, c0, r0, w: c1 - c0, h: r1 - r0 };
}
function buildGrid(w10) {
  const { ox, oy, c0, r0, w, h } = w10, mask = new Uint8Array(w * h);
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
    const x = ox + (c0 + c + 0.5) * 10, y = oy - (r0 + r + 0.5) * 10;
    if (inPoly(x, y)) mask[r * w + c] = 1;
    else if (x < fb.minx - PARAMS.ring_gap_m || x > fb.maxx + PARAMS.ring_gap_m || y < fb.miny - PARAMS.ring_gap_m || y > fb.maxy + PARAMS.ring_gap_m) mask[r * w + c] = 2;
  }
  return { ox, oy, c0, r0, w, h, mask };
}

async function sceneNdvi(s) {
  const cf = path.join(CACHE, `${s.month}_${s.scene_id}.bin`);
  const [red, nir, swir, scl] = await Promise.all([
    readWindow(s.red_B04, 10), readWindow(s.nir_B08, 10), readWindow(s.swir16_B11, 20), readWindow(s.scl, 20)]);
  if (!grid) grid = buildGrid(red);
  if (red.ox !== grid.ox || red.oy !== grid.oy || red.w !== grid.w || red.h !== grid.h) throw new Error(`grid mismatch in ${s.scene_id}`);
  const scale = Number(s.scale), offset = Number(s.offset), n = grid.w * grid.h;
  const ndvi = new Float32Array(n).fill(NaN), ndbi = new Float32Array(n).fill(NaN);
  // map a 10 m pixel to the 20 m window (same tile origin, so 20 m column = floor(10 m column / 2))
  const c20 = c => Math.floor((grid.c0 + c) / 2) - swir.c0, r20 = r => Math.floor((grid.r0 + r) / 2) - swir.r0;
  if (swir.c0 !== scl.c0 || swir.r0 !== scl.r0) throw new Error('20 m window mismatch');
  for (let r = 0; r < grid.h; r++) for (let c = 0; c < grid.w; c++) {
    const i = r * grid.w + c; if (!grid.mask[i]) continue;
    const j = r20(r) * swir.w + c20(c);
    if (PARAMS.invalid_scl.includes(scl.band[j])) continue;
    if (!red.band[i] || !nir.band[i] || !swir.band[j]) continue;
    const R = red.band[i] * scale + offset, N = nir.band[i] * scale + offset, S = swir.band[j] * scale + offset;
    if (N + R <= 0 || S + N <= 0) continue;
    ndvi[i] = (N - R) / (N + R); ndbi[i] = (S - N) / (S + N);
  }
  fs.writeFileSync(cf, Buffer.concat([Buffer.from(ndvi.buffer), Buffer.from(ndbi.buffer)]));
  return { ndvi, ndbi };
}

const median = a => { if (!a.length) return NaN; const s = Float32Array.from(a).sort(); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// ---------- run ----------
const results = [];
const perScene = [];
for (const s of scenes) {
  const cf = path.join(CACHE, `${s.month}_${s.scene_id}.bin`);
  let d;
  if (fs.existsSync(cf) && grid) {
    const buf = fs.readFileSync(cf); const n = buf.length / 8;
    d = { ndvi: new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + n * 4)), ndbi: new Float32Array(buf.buffer.slice(buf.byteOffset + n * 4, buf.byteOffset + n * 8)) };
  } else {
    for (let attempt = 1; ; attempt++) {
      try { d = await sceneNdvi(s); break; } catch (e) { if (attempt >= 3) throw e; console.warn(`retry ${s.month}: ${e.message}`); }
    }
  }
  perScene.push({ s, ...d });
  process.stdout.write(`${s.month} `);
}
console.log();

const nFp = grid.mask.reduce((a, v) => a + (v === 1), 0), nRing = grid.mask.reduce((a, v) => a + (v === 2), 0);
const monthIndex = m => { const [y, mo] = m.split('-').map(Number); return y * 12 + mo - 1; };

for (let k = 0; k < perScene.length; k++) {
  const { s, ndvi, ndbi } = perScene[k];
  const stat = which => {
    const v = [], b = []; let total = 0, nonveg = 0;
    for (let i = 0; i < ndvi.length; i++) if (grid.mask[i] === which) { total++; if (!Number.isNaN(ndvi[i])) { v.push(ndvi[i]); b.push(ndbi[i]); if (ndvi[i] < PARAMS.nonveg_ndvi) nonveg++; } }
    return { clear: v.length / total, ndvi_med: median(v), ndbi_med: median(b), nonveg: v.length ? nonveg / v.length : NaN };
  };
  // trailing-window cleared fraction: pixel max NDVI over scenes within the last window_months (incl. this one)
  const mi = monthIndex(s.month);
  const win = perScene.filter(p => { const d = mi - monthIndex(p.s.month); return d >= 0 && d < PARAMS.window_months && !PARAMS.exclude_months.includes(Number(p.s.month.slice(5))); });
  const cleared = which => {
    let seen = 0, clr = 0;
    for (let i = 0; i < ndvi.length; i++) {
      if (grid.mask[i] !== which) continue;
      let mx = -Infinity, obs = 0;
      for (const p of win) { const v = p.ndvi[i]; if (!Number.isNaN(v)) { obs++; if (v > mx) mx = v; } }
      if (obs >= 3) { seen++; if (mx < PARAMS.cleared_ndvi) clr++; }
    }
    return seen ? clr / seen : NaN;
  };
  const fp = stat(1), rg = stat(2);
  const gap = fp.clear < PARAMS.min_clear_frac;
  const full = win.length >= 5; // need enough scenes in the window for a fair max
  const cf = !gap && full ? cleared(1) : NaN, cr = !gap && full ? cleared(2) : NaN;
  results.push({
    month: s.month, scene_id: s.scene_id, collection: s.collection, date: s.datetime_utc.slice(0, 10),
    fp_clear_frac: +fp.clear.toFixed(3), gap,
    fp_ndvi_median: gap ? null : +fp.ndvi_med.toFixed(3), ring_ndvi_median: +rg.ndvi_med.toFixed(3),
    fp_ndbi_median: gap ? null : +fp.ndbi_med.toFixed(3), ring_ndbi_median: +rg.ndbi_med.toFixed(3),
    fp_nonveg_frac: gap ? null : +fp.nonveg.toFixed(3), ring_nonveg_frac: +rg.nonveg.toFixed(3),
    fp_cleared_12m: Number.isNaN(cf) ? null : +cf.toFixed(3), ring_cleared_12m: Number.isNaN(cr) ? null : +cr.toFixed(3),
    excess_cleared_12m: Number.isNaN(cf) || Number.isNaN(cr) ? null : +(cf - cr).toFixed(3),
  });
}

const cols = Object.keys(results[0]);
fs.writeFileSync(path.join(OUT, 'progress_baseline.csv'), [cols.join(','), ...results.map(r => cols.map(c => r[c] ?? '').join(','))].join('\n') + '\n');
fs.writeFileSync(path.join(OUT, 'progress_baseline.json'), JSON.stringify({
  schema_version: '1.0', params: PARAMS, generated_utc: new Date().toISOString(),
  asset: gj.features[0].properties, grid: { epsg: 32643, res_m: 10, footprint_pixels: nFp, ring_pixels: nRing },
  evidence_type: 'derived', inputs: 'data/s2_monthly_manifest.csv', results,
}, null, 1));
console.log(`footprint px ${nFp} (${(nFp / 100).toFixed(0)} ha), ring px ${nRing}`);
for (const r of results) console.log(`${r.month} clear=${r.fp_clear_frac} ndvi=${r.fp_ndvi_median}/${r.ring_ndvi_median} nonveg=${r.fp_nonveg_frac}/${r.ring_nonveg_frac} cleared12=${r.fp_cleared_12m}/${r.ring_cleared_12m}${r.gap ? ' GAP' : ''}`);
