// Larper spot check, step 2: score Larper against human labels.
// Usage: node spotcheck_score.mjs <path to larper_spotcheck_labels.json>  -> outputs/spotcheck_result.json
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs');
const file = process.argv[2]; if (!file) throw new Error('give the labels file path');
const key = JSON.parse(fs.readFileSync(path.join(OUT, 'spotcheck_key.json'), 'utf8')).points;
const { labels, labelled_utc } = JSON.parse(fs.readFileSync(file, 'utf8'));
const C = ['built_paved', 'bare', 'vegetation', 'water'];
const rows = key.map(p => ({ larper: p.larper, human: labels[p.id] })).filter(r => r.human && r.human !== 'unsure');
const unsure = key.filter(p => labels[p.id] === 'unsure').length;
const cm = C.map(t => C.map(pr => rows.filter(r => r.human === t && r.larper === pr).length)); // rows: human truth, cols: Larper
const agree = rows.filter(r => r.human === r.larper).length;
const per = C.map((c, k) => { const said = rows.filter(r => r.larper === c), truth = rows.filter(r => r.human === c);
  return { class: c, larper_said: said.length, right_when_it_says_so: said.length ? +(said.filter(r => r.human === c).length / said.length).toFixed(3) : null,
    found: truth.length ? +(truth.filter(r => r.larper === c).length / truth.length).toFixed(3) : null }; });
// converted (built or bare) vs vegetation/water: the distinction the progress curve depends on
const conv = c => c === 'built_paved' || c === 'bare';
const convAgree = rows.filter(r => conv(r.human) === conv(r.larper)).length;
const res = { month: '2026-03', labelled_utc, points: key.length, scored: rows.length, unsure,
  agreement: +(agree / rows.length).toFixed(3), converted_vs_not_agreement: +(convAgree / rows.length).toFixed(3), per_class: per,
  confusion_rows_human_cols_larper: { classes: C, matrix: cm },
  note: 'Stratified by Larper class (not by area), so per-class "right when it says so" is the key figure; overall agreement is not an area-weighted accuracy.' };
fs.writeFileSync(path.join(OUT, 'spotcheck_result.json'), JSON.stringify(res, null, 1));
console.log(JSON.stringify({ scored: res.scored, unsure, agreement: res.agreement, converted_vs_not: res.converted_vs_not_agreement, per_class: per }, null, 0));
