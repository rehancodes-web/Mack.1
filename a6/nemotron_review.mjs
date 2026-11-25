// Step after classify.mjs: NVIDIA Nemotron audits Larper, our Random Forest model.
//  1. Vision check per key month: satellite photo + RF class map + RF numbers -> where the map looks right/wrong.
//  2. Curve check: RF built/paved series vs the NDVI baseline -> where they disagree and which to trust.
// Calls our Vercel API (the key stays in Vercel). Writes outputs/nemotron_review.json, shown on the demo page.
// Usage: node nemotron_review.mjs [api_url]
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs');
const API = process.argv[2] || 'https://mackathon-three.vercel.app/api/analyst';
const ORIGIN = 'https://mackathon-three.vercel.app';
const rd = f => JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));

const ai = rd('progress_ai.json').results, met = rd('classifier_metrics.json');
const base = rd('progress_baseline.json').results;
const months = ['2020-03', '2022-05', '2024-03', '2026-03'].filter(m => fs.existsSync(path.join(OUT, `classmap_${m}.png`)) && fs.existsSync(path.join(OUT, `quicklook_${m}.png`)));
const png = f => fs.readFileSync(path.join(OUT, f)).toString('base64');

async function ask(question, context, images = []) {
  const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: JSON.stringify({ question, context, images }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.answer) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

const ctxBase = { rf_metrics: { agreement_with_worldcover: met.overall_accuracy, per_class: met.per_class, caveat: met.label_caveat } };
const review = { schema_version: '1.0', generated_utc: new Date().toISOString(), evidence_type: 'ai_review',
  caveat: 'Nemotron output is a model opinion used to audit Larper; it can be wrong and does not replace the measured numbers.', vision: [], curve: null };

for (const m of months) {
  const row = ai.find(r => r.month === m) || {};
  try {
    const j = await ask(`Cross-check the Larper (Random Forest) class map for ${m} against the satellite photo. Larper says built/paved ${row.built_paved_frac}, bare ${row.bare_frac}, vegetation ${row.vegetation_frac}, water ${row.water_frac}. Reply in 3 short bullets: looks right / looks wrong / trust level (high, medium, low).`,
      { ...ctxBase, month: m, rf_row: row },
      [{ label: `Sentinel-2 true colour ${m} (yellow = airport footprint)`, mime: 'image/png', data: png(`quicklook_${m}.png`) },
       { label: `Larper class map ${m}`, mime: 'image/png', data: png(`classmap_${m}.png`) }]);
    review.vision.push({ month: m, model: j.model, finding: j.answer });
    console.log(`vision ${m}: ok (${j.model})`);
  } catch (e) { review.vision.push({ month: m, error: e.message }); console.warn(`vision ${m}: ${e.message}`); }
}

try {
  const series = ai.filter(r => r.built_paved_frac != null).map(r => [r.month, r.built_paved_frac, r.bare_frac, base.find(b => b.month === r.month)?.fp_cleared_12m ?? null]);
  const j = await ask('Compare the Larper built/paved and bare series with the NDVI baseline (columns: month, rf_built_paved, rf_bare, baseline_cleared_12m). In at most 5 bullets: when does each show construction starting, does Larper avoid the baseline dip after 2025, which months look suspicious (possible cloud or misclassification), and which curve should the lender rely on.',
    { ...ctxBase, series_columns: ['month', 'rf_built_paved', 'rf_bare', 'baseline_cleared_12m'], series });
  review.curve = { model: j.model, finding: j.answer };
  console.log(`curve: ok (${j.model})`);
} catch (e) { review.curve = { error: e.message }; console.warn(`curve: ${e.message}`); }

fs.writeFileSync(path.join(OUT, 'nemotron_review.json'), JSON.stringify(review, null, 1));
console.log('wrote outputs/nemotron_review.json');
