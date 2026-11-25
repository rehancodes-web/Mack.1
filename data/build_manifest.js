// Builds a monthly Sentinel-2 L2A scene manifest over the Noida airport footprint
// from Element 84 Earth Search (collection sentinel-2-c1-l2a, no account needed).
// Usage: node build_manifest.js [start=2020-01-01] [end=today] [maxCloud=40]
const fs = require('fs');
const [start = '2020-01-01', end = new Date().toISOString().slice(0, 10), maxCloud = '40'] = process.argv.slice(2);
const API = 'https://earth-search.aws.element84.com/v1/search';
const fp = JSON.parse(fs.readFileSync(__dirname + '/noida_airport_footprint.geojson', 'utf8')).features[0].geometry;

async function searchAll(collection) {
  let body = {
    collections: [collection],
    intersects: fp,
    datetime: `${start}T00:00:00Z/${end}T23:59:59Z`,
    query: { 'eo:cloud_cover': { lt: Number(maxCloud) } },
    limit: 100,
  };
  const items = [];
  for (let page = 0; page < 50; page++) {
    const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
    const j = await r.json();
    items.push(...j.features);
    const next = (j.links || []).find(l => l.rel === 'next');
    if (!next) break;
    body = next.body ? { ...body, ...next.body } : body;
  }
  return items;
}

(async () => {
  // Collection 1 (sentinel-2-c1-l2a) is reprocessed to baseline 05.xx but has holes (e.g. Apr-Nov 2022
  // over this tile). Missing months are filled from the older sentinel-2-l2a collection.
  // Reflectance = DN * scale + offset, with scale/offset read from each item's raster:bands metadata
  // C1: offset -0.1 on every scene (checked against DN levels). Old collection: metadata says -0.1 from
  // baseline 04.00, but the COG values are already de-offset (Aug 2022 red DN ~240-580), so offset is forced to 0.
  const c1 = await searchAll('sentinel-2-c1-l2a');
  const old = await searchAll('sentinel-2-l2a');
  const pick = (items, collection) => {
    const best = {};
    for (const f of items) {
      if (!f.id.includes('43RGM')) continue; // whole footprint sits in tile 43RGM
      const month = f.properties.datetime.slice(0, 7);
      if (!best[month] || f.properties['eo:cloud_cover'] < best[month].properties['eo:cloud_cover']) best[month] = { ...f, collection };
    }
    return best;
  };
  const best = { ...pick(old, 'sentinel-2-l2a'), ...pick(c1, 'sentinel-2-c1-l2a') }; // C1 wins where both exist
  const rows = [['month', 'collection', 'scene_id', 'datetime_utc', 'tile_cloud_pct', 'processing_baseline', 'scale', 'offset', 'red_B04', 'nir_B08', 'swir16_B11', 'swir22_B12', 'green_B03', 'blue_B02', 'scl']];
  for (const m of Object.keys(best).sort()) {
    const f = best[m], a = f.assets, p = f.properties;
    const pb = p['s2:processing_baseline'] || '';
    const rb = (a.red['raster:bands'] || [{}])[0];
    for (const k of ['nir', 'swir16']) {
      const o = (a[k]['raster:bands'] || [{}])[0];
      if (o.scale !== rb.scale || o.offset !== rb.offset) throw new Error('band scaling differs in ' + f.id);
    }
    rows.push([m, f.collection, f.id, p.datetime, p['eo:cloud_cover'].toFixed(1), pb, rb.scale ?? 0.0001, f.collection === 'sentinel-2-l2a' ? 0 : (rb.offset ?? 0),
      a.red.href, a.nir.href, a.swir16.href, a.swir22.href, a.green.href, a.blue.href, a.scl.href]);
  }
  fs.writeFileSync(__dirname + '/s2_monthly_manifest.csv', rows.map(r => r.join(',')).join('\n') + '\n');
  console.log(`C1 items: ${c1.length}; old-collection items: ${old.length}; months with a scene: ${rows.length - 1}`);
  console.log(rows.slice(1).map(r => `${r[0]} ${r[4]}%${r[1] === 'sentinel-2-l2a' ? '*' : ''} off=${r[7]}`).join('  '));
  console.log('* = filled from sentinel-2-l2a');
})().catch(e => { console.error(e.message); process.exit(1); });
