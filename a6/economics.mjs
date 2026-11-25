// A6 decision: release the next tranche on the contractor's report, or commission an inspection first.
// All probabilities and costs are ASSUMED and illustrative (see brief section "From imagery to decision").
// Usage: node economics.mjs            -> prints cases and writes outputs/decision.json
//        node economics.mjs --test     -> runs arithmetic checks
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');

export const DEFAULTS = {
  currency: 'USD',
  loss_if_optimistic: { value: 300000, origin: 'assumed' },  // L: carrying cost + overrun exposure on the tranche
  inspection_cost: { value: 15000, origin: 'assumed' },      // C
  inspection_effectiveness: { value: 0.9, origin: 'assumed' }, // e: share of optimistic reports an inspection catches
  prior_p: { value: 0.10, origin: 'assumed' },              // P(report materially optimistic) with no satellite evidence
  // Mapping from progress gap (reported % minus satellite-observed %) to p. ASSUMED, editable; not learned.
  gap_to_p: { value: [[-100, 0.03], [10, 0.03], [20, 0.15], [30, 0.40], [100, 0.40]], origin: 'assumed' },
};

function check(name, v, lo, hi) {
  if (typeof v !== 'number' || Number.isNaN(v) || v < lo || v > hi) throw new Error(`${name} must be a number in [${lo}, ${hi}], got ${v}`);
}

export function expectedCosts(p, P = DEFAULTS) {
  const L = P.loss_if_optimistic.value, C = P.inspection_cost.value, e = P.inspection_effectiveness.value;
  check('p', p, 0, 1); check('e', e, 0, 1); check('L', L, 0, Infinity); check('C', C, 0, Infinity);
  if (!P.currency) throw new Error('currency required');
  const release = p * L, inspect = C + p * (1 - e) * L;
  return { p, release, inspect, action: inspect < release ? 'inspect' : 'release', break_even_p: C / (e * L) };
}

export function pFromGap(gapPct, P = DEFAULTS) {
  const pts = P.gap_to_p.value;
  if (gapPct <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    if (gapPct <= x1) return y0 + (y1 - y0) * (gapPct - x0) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
}

function runTests() {
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  const cases = [[0.10, 30000, 18000, 'inspect'], [0.03, 9000, 15900, 'release'], [0.40, 120000, 27000, 'inspect']];
  for (const [p, r, i, a] of cases) {
    const c = expectedCosts(p);
    if (!near(c.release, r) || !near(c.inspect, i) || c.action !== a) throw new Error(`case p=${p} failed: ${JSON.stringify(c)}`);
  }
  if (!near(expectedCosts(0.1).break_even_p, 15000 / 270000)) throw new Error('break-even failed');
  // decision reversal: inspection cost above e*p*L (27000 at p=0.10) flips to release
  const P2 = structuredClone(DEFAULTS); P2.inspection_cost.value = 28000;
  if (expectedCosts(0.10, P2).action !== 'release') throw new Error('reversal failed');
  for (const bad of [-0.1, 1.2, NaN]) { let threw = false; try { expectedCosts(bad); } catch { threw = true; } if (!threw) throw new Error(`accepted bad p ${bad}`); }
  const P3 = structuredClone(DEFAULTS); P3.currency = ''; let threw = false; try { expectedCosts(0.1, P3); } catch { threw = true; } if (!threw) throw new Error('accepted missing currency');
  console.log('economics tests: all passed (3 cases, break-even, reversal, input rejection)');
}

if (process.argv.includes('--test')) { runTests(); process.exit(0); }

// Real case: reported milestone vs satellite-observed land conversion
const prog = JSON.parse(fs.readFileSync(path.join(HERE, 'outputs', 'progress_baseline.json'), 'utf8')).results;
const sat = m => prog.find(r => r.month === m)?.fp_cleared_12m;
const REPORT = { date: '2025-01-28', month: '2025-01', reported_pct: 80, source: 'Business Standard, 28 Jan 2025 ("80 per cent work complete")', origin: 'reported' };
const satPct = Math.round(sat(REPORT.month) * 100);
const gap = REPORT.reported_pct - satPct;
const scenarios = [
  { name: 'No satellite evidence (prior)', p: DEFAULTS.prior_p.value },
  { name: `Satellite: ${satPct}% converted vs ${REPORT.reported_pct}% reported (gap ${gap} pts)`, p: pFromGap(gap) },
  { name: 'Counterfactual: satellite agrees with report', p: pFromGap(0) },
].map(s => ({ ...s, ...expectedCosts(s.p) }));

const out = {
  schema_version: '1.0', mode: 'historical_replay_with_assumed_economics', operational_authorisation: false,
  report: REPORT, satellite_observed_pct: satPct, satellite_metric: 'fp_cleared_12m (land conversion, not completion)',
  gap_pts: gap, parameters: DEFAULTS, scenarios,
  caveat: 'Land conversion is not construction completion; a gap raises the case for inspection, it does not prove the report false.',
};
fs.writeFileSync(path.join(HERE, 'outputs', 'decision.json'), JSON.stringify(out, null, 1));
for (const s of scenarios) console.log(`${s.name}: p=${s.p.toFixed(3)} release=${s.release.toFixed(0)} inspect=${s.inspect.toFixed(0)} -> ${s.action.toUpperCase()}`);
console.log(`break-even p* = ${scenarios[0].break_even_p.toFixed(4)}`);
