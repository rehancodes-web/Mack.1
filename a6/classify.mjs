// Track A6 AI model: per-pixel Random Forest (vegetation / built-paved / bare / water) trained on
// ESA WorldCover 2021 weak labels OUTSIDE the airport footprint, then applied to every month inside it.
// Usage: node classify.mjs        -> outputs/classifier_metrics.json, outputs/progress_ai.csv/json, outputs/classmap_*.png
import fs from 'node:fs';
import path from 'node:path';
import { fromUrl } from 'geotiff';
import proj4 from 'proj4';
import { PNG } from 'pngjs';
import { RandomForestClassifier } from 'ml-random-forest';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const DATA = path.join(HERE, '..', 'data'), OUT = path.join(HERE, 'outputs'), CACHE = path.join(HERE, 'cache');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(CACHE, { recursive: true });

const P = {
  version: 'rf-v1',
  label_source: 'ESA WorldCover 10m 2021 v200 (tile N27E075)',
  label_url: 'https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_N27E075_Map.tif',
  train_months: ['2021-02', '2021-04', '2021-11'], // same year as the labels, three seasons
  train_pad_m: 6000, footprint_gap_m: 300,
  per_class_per_scene: 2500, seed: 42,
  rf: { nEstimators: 60, maxFeatures: 0.7, replacement: true, seed: 42, treeOptions: { maxDepth: 14 } },
  invalid_scl: [0, 1, 3, 8, 9, 10], min_clear_frac: 0.6,
};
const CLASSES = ['vegetation', 'built_paved', 'bare', 'water'];
const wcToClass = v => ({ 10: 0, 20: 0, 30: 0, 40: 0, 90: 0, 95: 0, 100: 0, 50: 1, 60: 2, 80: 3 })[v] ?? -1;

// deterministic RNG
let seed = P.seed; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const utm = '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs';
const gj = JSON.parse(fs.readFileSync(path.join(DATA, 'noida_airport_footprint.geojson'), 'utf8'));
const ring = gj.features[0].geometry.coordinates[0].map(([lon, lat]) => proj4('WGS84', utm, [lon, lat]));
const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]);
const fb = { minx: Math.min(...xs), maxx: Math.max(...xs), miny: Math.min(...ys), maxy: Math.max(...ys) };
const inPoly = (x, y) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };

const lines = fs.readFileSync(path.join(DATA, 's2_monthly_manifest.csv'), 'utf8').replace(/\r/g, '').trim().split('\n');
const hdr = lines[0].split(',');
const scenes = lines.slice(1).map(l => Object.fromEntries(l.split(',').map((v, i) => [hdr[i], v])));

async function readBand(url, res, bb) {
  for (let a = 1; ; a++) {
    try {
      const img = await (await fromUrl(url)).getImage();
      const [ox, oy] = img.getOrigin();
      const c0 = Math.floor((bb.minx - ox) / res), c1 = Math.ceil((bb.maxx - ox) / res);
      const r0 = Math.floor((oy - bb.maxy) / res), r1 = Math.ceil((oy - bb.miny) / res);
      const [band] = await img.readRasters({ window: [c0, r0, c1, r1] });
      return { band, ox, oy, c0, r0, w: c1 - c0, h: r1 - r0 };
    } catch (e) { if (a >= 6) throw e; console.warn(`  retry ${a} ${url.split('/').pop()}: ${e.message}`); await new Promise(r => setTimeout(r, 2000 * a)); }
  }
}

// Reads all bands for a scene over bb; returns per-10m-pixel feature getter.
async function loadScene(s, bb) {
  const spec = [[s.blue_B02, 10], [s.green_B03, 10], [s.red_B04, 10], [s.nir_B08, 10], [s.swir16_B11, 20], [s.swir22_B12, 20], [s.scl, 20]];
  const out = [];
  for (const [u, res] of spec) out.push(await readBand(u, res, bb)); // sequential: large windows fail when fetched all at once
  const [b2, b3, b4, b8, b11, b12, scl] = out;
  const sc = Number(s.scale), off = Number(s.offset);
  const g = b4; // reference 10 m grid
  const feat = (r, c) => {
    const i = r * g.w + c;
    const j = (Math.floor((g.r0 + r) / 2) - b11.r0) * b11.w + (Math.floor((g.c0 + c) / 2) - b11.c0);
    if (P.invalid_scl.includes(scl.band[j])) return null;
    const raw = [b2.band[i], b3.band[i], b4.band[i], b8.band[i], b11.band[j], b12.band[j]];
    if (raw.some(v => !v)) return null;
    const [B, G, R, N, S1, S2] = raw.map(v => v * sc + off);
    const nd = (a, b) => (a + b) === 0 ? 0 : (a - b) / (a + b);
    return [B, G, R, N, S1, S2, nd(N, R), nd(S1, N), nd(G, S1), ((S1 + R) - (N + B)) / ((S1 + R) + (N + B) || 1)];
  };
  return { g, feat };
}

// ---------- labels ----------
async function loadWorldCover(bb) {
  const corners = [[bb.minx, bb.miny], [bb.maxx, bb.maxy], [bb.minx, bb.maxy], [bb.maxx, bb.miny]].map(p => proj4(utm, 'WGS84', p));
  const lons = corners.map(p => p[0]), lats = corners.map(p => p[1]);
  const img = await (await fromUrl(P.label_url)).getImage();
  const [ox, oy] = img.getOrigin(); const [rx, ry] = img.getResolution();
  const c0 = Math.floor((Math.min(...lons) - ox) / rx) - 2, c1 = Math.ceil((Math.max(...lons) - ox) / rx) + 2;
  const r0 = Math.floor((Math.max(...lats) - oy) / ry) - 2, r1 = Math.ceil((Math.min(...lats) - oy) / ry) + 2;
  const [band] = await img.readRasters({ window: [c0, r0, c1, r1] });
  const w = c1 - c0;
  return (x, y) => { const [lon, lat] = proj4(utm, 'WGS84', [x, y]); const c = Math.floor((lon - ox) / rx) - c0, r = Math.floor((lat - oy) / ry) - r0; return band[r * w + c]; };
}

// ---------- training ----------
const tb = { minx: fb.minx - P.train_pad_m, maxx: fb.maxx + P.train_pad_m, miny: fb.miny - P.train_pad_m, maxy: fb.maxy + P.train_pad_m };
const splitX = (fb.minx + fb.maxx) / 2; // spatial block split: west of the footprint centre = train, east = test
console.log('loading WorldCover labels...');
const wc = await loadWorldCover(tb);
const X = [], Y = [], isTest = [];
for (const m of P.train_months) {
  const s = scenes.find(x => x.month === m);
  console.log(`training scene ${m} ${s.scene_id}`);
  const { g, feat } = await loadScene(s, tb);
  const pools = CLASSES.map(() => []);
  for (let r = 0; r < g.h; r += 2) for (let c = 0; c < g.w; c += 2) {
    const x = g.ox + (g.c0 + c + 0.5) * 10, y = g.oy - (g.r0 + r + 0.5) * 10;
    if (x > fb.minx - P.footprint_gap_m && x < fb.maxx + P.footprint_gap_m && y > fb.miny - P.footprint_gap_m && y < fb.maxy + P.footprint_gap_m) continue;
    const k = wcToClass(wc(x, y)); if (k < 0) continue;
    pools[k].push([r, c, x]);
  }
  pools.forEach((pool, k) => {
    for (let n = 0; n < Math.min(P.per_class_per_scene, pool.length); n++) {
      const [r, c, x] = pool[Math.floor(rnd() * pool.length)];
      const f = feat(r, c); if (!f) continue;
      X.push(f); Y.push(k); isTest.push(x > splitX);
    }
  });
  console.log('  available per class:', pools.map((p, k) => `${CLASSES[k]}=${p.length}`).join(' '));
}
const idxTr = [...Y.keys()].filter(i => !isTest[i]), idxTe = [...Y.keys()].filter(i => isTest[i]);
const rf = new RandomForestClassifier(P.rf);
rf.train(idxTr.map(i => X[i]), idxTr.map(i => Y[i]));
const pred = rf.predict(idxTe.map(i => X[i]));
const cm = CLASSES.map(() => CLASSES.map(() => 0));
idxTe.forEach((i, n) => cm[Y[i]][pred[n]]++);
const total = idxTe.length, correct = cm.reduce((a, row, k) => a + row[k], 0);
const perClass = CLASSES.map((name, k) => {
  const tp = cm[k][k], fn = cm[k].reduce((a, b) => a + b, 0) - tp, fp = cm.reduce((a, row) => a + row[k], 0) - tp;
  return { class: name, support: tp + fn, recall: tp + fn ? +(tp / (tp + fn)).toFixed(3) : null, precision: tp + fp ? +(tp / (tp + fp)).toFixed(3) : null };
});
const metrics = { params: P, classes: CLASSES, n_train: idxTr.length, n_test: total, split: 'spatial: train west of footprint centre line, test east; footprint and 300 m buffer excluded', overall_accuracy: +(correct / total).toFixed(3), per_class: perClass, confusion_rows_true_cols_pred: cm, label_caveat: 'WorldCover is itself a model product (~75-80% global accuracy); this measures agreement with it, not ground truth' };
console.log(JSON.stringify({ acc: metrics.overall_accuracy, perClass }, null, 0));

// final model on all labelled samples
const rfAll = new RandomForestClassifier(P.rf);
rfAll.train(X, Y);
fs.writeFileSync(path.join(OUT, 'classifier_metrics.json'), JSON.stringify(metrics, null, 1));

// ---------- predict every month inside the footprint ----------
const base = JSON.parse(fs.readFileSync(path.join(OUT, 'progress_baseline.json'), 'utf8')).results;
const results = [];
let mask = null;
const mapMonths = new Set(['2020-03', '2022-05', '2024-03', '2026-03']);
for (const s of scenes) {
  const cf = path.join(CACHE, `ai_${P.version}_${s.month}_${s.scene_id}.json`);
  if (fs.existsSync(cf) && !mapMonths.has(s.month)) { results.push(JSON.parse(fs.readFileSync(cf, 'utf8'))); process.stdout.write(`${s.month}c `); continue; }
  const { g, feat } = await loadScene(s, fb);
  if (!mask) { mask = new Uint8Array(g.w * g.h); for (let r = 0; r < g.h; r++) for (let c = 0; c < g.w; c++) mask[r * g.w + c] = inPoly(g.ox + (g.c0 + c + 0.5) * 10, g.oy - (g.r0 + r + 0.5) * 10) ? 1 : 0; }
  const F = [], pos = []; let tot = 0;
  for (let r = 0; r < g.h; r++) for (let c = 0; c < g.w; c++) { if (!mask[r * g.w + c]) continue; tot++; const f = feat(r, c); if (f) { F.push(f); pos.push(r * g.w + c); } }
  const yp = F.length ? rfAll.predict(F) : [];
  const counts = [0, 0, 0, 0]; yp.forEach(k => counts[k]++);
  const clear = F.length / tot, gap = clear < P.min_clear_frac;
  const row = { month: s.month, date: s.datetime_utc.slice(0, 10), clear_frac: +clear.toFixed(3), gap };
  CLASSES.forEach((n, k) => row[`${n}_frac`] = gap ? null : +(counts[k] / F.length).toFixed(3));
  row.built_or_bare_frac = gap ? null : +((counts[1] + counts[2]) / F.length).toFixed(3);
  results.push(row); fs.writeFileSync(cf, JSON.stringify(row));
  if (mapMonths.has(s.month)) {
    const png = new PNG({ width: g.w, height: g.h });
    const col = [[60, 140, 60], [220, 60, 60], [230, 200, 120], [60, 120, 220]];
    for (let i = 0; i < g.w * g.h; i++) { png.data[i * 4 + 3] = 255; png.data[i * 4] = png.data[i * 4 + 1] = png.data[i * 4 + 2] = mask[i] ? 30 : 245; }
    pos.forEach((p, n) => { const cc = col[yp[n]]; png.data[p * 4] = cc[0]; png.data[p * 4 + 1] = cc[1]; png.data[p * 4 + 2] = cc[2]; });
    fs.writeFileSync(path.join(OUT, `classmap_${s.month}.png`), PNG.sync.write(png));
  }
  process.stdout.write(`${s.month} `);
}
console.log();
// join with baseline for the comparison
for (const r of results) { const b = base.find(x => x.month === r.month); r.baseline_cleared_12m = b?.fp_cleared_12m ?? null; }
const cols = Object.keys(results[0]);
fs.writeFileSync(path.join(OUT, 'progress_ai.csv'), [cols.join(','), ...results.map(r => cols.map(c => r[c] ?? '').join(','))].join('\n') + '\n');
fs.writeFileSync(path.join(OUT, 'progress_ai.json'), JSON.stringify({ schema_version: '1.0', model: P.version, evidence_type: 'derived', metrics_file: 'classifier_metrics.json', results }, null, 1));
for (const r of results) console.log(`${r.month} built=${r.built_paved_frac} bare=${r.bare_frac} veg=${r.vegetation_frac} water=${r.water_frac} | baseline=${r.baseline_cleared_12m}${r.gap ? ' GAP' : ''}`);
