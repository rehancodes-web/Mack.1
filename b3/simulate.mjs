// Track B3 simulation: can a receiver that also hears NavIC and a LEO layer detect GPS spoofing and correct its position?
// Linearised pseudorange model (standard GNSS least squares). Spoofing = every GPS range is consistent with a FALSE position,
// which ordinary RAIM cannot see. An AI detector (logistic regression) uses cross-constellation consistency features.
// All noise levels, geometry and spoof sizes are ASSUMED for simulation. Usage: node simulate.mjs -> outputs/b3_sim.json
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs'); fs.mkdirSync(OUT, { recursive: true });

let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());

const P = {
  constellations: { // count of satellites in view, elevation range (deg), range noise sigma (m): ASSUMED
    GPS: { n: 8, el: [10, 85], sigma: 3.0 },
    NavIC: { n: 6, el: [35, 80], sigma: 4.0 }, // GEO/IGSO satellites sit high over India
    LEO: { n: 3, el: [10, 85], sigma: 1.5 },
  },
  spoof_offset_m: [10, 150], spoof_share: 0.5, n_train: 4000, n_test: 4000, target_false_alarm: 0.01,
};
const NAMES = Object.keys(P.constellations);

// ---------- linear algebra (small dense) ----------
const T = A => A[0].map((_, j) => A.map(r => r[j]));
const mul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, a, k) => s + a * B[k][j], 0)));
function inv(M) { const n = M.length, A = M.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => +(i === j))]);
  for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]];
    const d = A[c][c]; if (Math.abs(d) < 1e-12) return null; for (let j = 0; j < 2 * n; j++) A[c][j] /= d;
    for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c]; for (let j = 0; j < 2 * n; j++) A[r][j] -= f * A[c][j]; } }
  return A.map(r => r.slice(n)); }
// weighted least squares: returns position estimate (first 3 states) and residuals
function wls(rows) {
  const sys = [...new Set(rows.map(r => r.sys))];
  const H = rows.map(r => [...r.u.map(x => -x), ...sys.map(s => +(s === r.sys))]);
  const W = rows.map(r => 1 / r.sigma ** 2), y = rows.map(r => [r.y]);
  const HtW = T(H).map(row => row.map((x, i) => x * W[i]));
  const N = inv(mul(HtW, H)); if (!N) return null;
  const x = mul(N, mul(HtW, y));
  const res = rows.map((r, i) => r.y - H[i].reduce((s, h, k) => s + h * x[k][0], 0));
  const chi2 = res.reduce((s, e, i) => s + e * e * W[i], 0);
  return { pos: [x[0][0], x[1][0], x[2][0]], res, chi2, dof: rows.length - H[0].length };
}
const norm = v => Math.hypot(...v), sub = (a, b) => a.map((x, i) => x - b[i]);

// ---------- one epoch ----------
function epoch(useSys, spoofed) {
  const off = spoofed ? (() => { const m = P.spoof_offset_m[0] + rnd() * (P.spoof_offset_m[1] - P.spoof_offset_m[0]), a = rnd() * 2 * Math.PI; return [m * Math.cos(a), m * Math.sin(a), (rnd() - 0.5) * 0.2 * m]; })() : [0, 0, 0];
  const rows = [];
  for (const s of useSys) { const c = P.constellations[s]; for (let i = 0; i < c.n; i++) {
    const el = (c.el[0] + rnd() * (c.el[1] - c.el[0])) * Math.PI / 180, az = rnd() * 2 * Math.PI;
    const u = [Math.cos(el) * Math.sin(az), Math.cos(el) * Math.cos(az), Math.sin(el)]; // unit vector receiver -> satellite (E,N,U)
    const bias = s === 'GPS' ? -u.reduce((t, x, k) => t + x * off[k], 0) : 0; // GPS ranges agree with the false position
    rows.push({ sys: s, u, sigma: c.sigma, y: bias + c.sigma * gauss() }); } }
  const all = wls(rows);
  const gpsOnly = useSys.includes('GPS') ? wls(rows.filter(r => r.sys === 'GPS')) : null;
  const other = rows.filter(r => r.sys !== 'GPS'); const otherSol = other.length >= 3 + new Set(other.map(r => r.sys)).size ? wls(other) : null;
  const sep = gpsOnly && otherSol ? norm(sub(gpsOnly.pos, otherSol.pos)) : 0;
  const gpsRes = rows.map((r, i) => r.sys === 'GPS' ? Math.abs(all.res[i]) / r.sigma : null).filter(x => x != null);
  const feats = [Math.log1p(all.chi2 / Math.max(1, all.dof)), Math.log1p(sep), gpsRes.length ? Math.log1p(gpsRes.reduce((a, b) => a + b, 0) / gpsRes.length) : 0];
  return { spoofed, feats, err_all: norm(sub(all.pos, off.map(() => 0))), err_other: otherSol ? norm(otherSol.pos) : null, raim_chi2: all.chi2, dof: all.dof, gps_only_err: gpsOnly ? norm(gpsOnly.pos) : null };
}

// ---------- AI detector: logistic regression ----------
function trainLR(X, y, epochs = 400, lr = 0.1) {
  const d = X[0].length, mu = Array(d).fill(0), sd = Array(d).fill(0);
  X.forEach(x => x.forEach((v, j) => (mu[j] += v / X.length))); X.forEach(x => x.forEach((v, j) => (sd[j] += (v - mu[j]) ** 2 / X.length)));
  const s = sd.map(v => Math.sqrt(v) || 1), Z = X.map(x => x.map((v, j) => (v - mu[j]) / s[j]));
  let w = Array(d).fill(0), b = 0;
  for (let e = 0; e < epochs; e++) { const gw = Array(d).fill(0); let gb = 0;
    Z.forEach((z, i) => { const p = 1 / (1 + Math.exp(-(b + z.reduce((t, v, j) => t + v * w[j], 0)))); const g = p - y[i]; gb += g; z.forEach((v, j) => (gw[j] += g * v)); });
    w = w.map((v, j) => v - lr * gw[j] / Z.length); b -= lr * gb / Z.length; }
  return x => 1 / (1 + Math.exp(-(b + x.reduce((t, v, j) => t + ((v - mu[j]) / s[j]) * w[j], 0))));
}

const configs = { 'GPS only': ['GPS'], 'GPS + NavIC': ['GPS', 'NavIC'], 'GPS + NavIC + LEO': ['GPS', 'NavIC', 'LEO'] };
const results = {};
for (const [name, sys] of Object.entries(configs)) {
  const gen = n => Array.from({ length: n }, () => epoch(sys, rnd() < P.spoof_share));
  const tr = gen(P.n_train), te = gen(P.n_test);
  const model = trainLR(tr.map(e => e.feats), tr.map(e => +e.spoofed));
  // threshold set on clean training epochs for the target false-alarm rate
  const cleanScores = tr.filter(e => !e.spoofed).map(e => model(e.feats)).sort((a, b) => b - a);
  const thr = cleanScores[Math.floor(P.target_false_alarm * cleanScores.length)];
  const s = te.filter(e => e.spoofed), c = te.filter(e => !e.spoofed);
  const det = s.filter(e => model(e.feats) > thr).length / s.length, fa = c.filter(e => model(e.feats) > thr).length / c.length;
  // classic RAIM chi-square test at the same false-alarm rate, for comparison
  const raimThr = tr.filter(e => !e.spoofed).map(e => e.raim_chi2).sort((a, b) => b - a)[Math.floor(P.target_false_alarm * cleanScores.length)];
  const raimDet = s.filter(e => e.raim_chi2 > raimThr).length / s.length;
  // position error on spoofed epochs: trusting the all-in-view fix vs AI-corrected (drop GPS when flagged)
  const corrected = s.map(e => (model(e.feats) > thr && e.err_other != null ? e.err_other : e.err_all));
  const median = a => { const q = [...a].sort((x, y) => x - y); return q[Math.floor(q.length / 2)]; };
  results[name] = { detection_rate: +det.toFixed(3), false_alarm_rate: +fa.toFixed(3), raim_detection_rate: +raimDet.toFixed(3),
    spoofed_median_error_m_uncorrected: Math.round(median(s.map(e => e.err_all))), spoofed_median_error_m_ai_corrected: Math.round(median(corrected)),
    clean_median_error_m: +median(c.map(e => e.err_all)).toFixed(1) };
  console.log(name.padEnd(18), JSON.stringify(results[name]));
}
fs.writeFileSync(path.join(OUT, 'b3_sim.json'), JSON.stringify({ schema_version: '1.0', generated_utc: new Date().toISOString(), evidence_type: 'simulation', params: P, results,
  caveat: 'Simulated geometry and noise (assumed). Shows the mechanism, not certified performance.' }, null, 1));
