// Nemotron "diversion readiness brief": fuses Track C (where GPS is failing) and Track A6 (is Jewar built and usable)
// into one structured decision for a Delhi GPS-interference event, then runs a SECOND Nemotron call that
// fact-checks the brief against the same data (AI guardrail). Usage: node decisions/brief.mjs -> decisions/nemotron_brief.json
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const R = f => JSON.parse(fs.readFileSync(path.join(HERE, '..', f), 'utf8'));
const EP = 'https://mackathon-three.vercel.app/api/analyst', ORIGIN = 'https://mackathon-three.vercel.app';
const gs = R('c/outputs/gnss_summary.json'), cells = R('c/outputs/gnss_cells.json').cells, rd = R('a6/outputs/readiness.json'), dec = R('a6/outputs/decision.json');
const near = cells.filter(c => c.lat >= 27 && c.lat <= 29 && c.lon >= 76 && c.lon <= 78).map(c => ({ cell: `${c.lat}N ${c.lon}E`, aircraft: c.aircraft, degraded_share: c.share, rating: c.rating }));

const DATA = {
  event: 'Scenario: GPS spoofing reported on Delhi IGI approaches (pattern seen in 2025, reported to Parliament). Evening arrival bank.',
  track_c_cells_around_delhi_and_jewar: near,
  track_c_jewar_region: gs.jewar_region,
  track_c_hotspots: gs.hotspots.slice(0, 5),
  track_a6_jewar: { conversion_start: rd.satellite.conversion_start_month, peak: rd.satellite.peak_month, peak_frac: rd.satellite.peak_frac, physically_present: rd.recovery_capacity.physically_present, operational_status: rd.recovery_capacity.operational_status, usable: rd.recovery_capacity.usable_for_navcontinuity },
  a6_lender_check: { reported_pct: dec.report.reported_pct, satellite_pct: dec.satellite_observed_pct, decision: dec.scenarios[1].action },
  costs_reported: { diversion_eur: '1,000-77,200 (EUROCONTROL)', block_minute_usd: 98.41 },
  limits: ['Track C is one day of ADS-B integrity data (1 Nov 2026), not live', 'Satellite cannot confirm runway certification, ATC or slots', 'No individual aircraft are tracked'],
};

async function ask(question, context) {
  for (let a = 1; a <= 3; a++) {
    const r = await fetch(EP, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: JSON.stringify({ question, context }) });
    const j = await r.json(); const m = (j.answer || '').match(/\{[\s\S]*\}/);
    try { return { model: j.model, out: JSON.parse(m ? m[0] : j.answer) }; } catch { if (a === 3) return { model: j.model, out: null, raw: j.answer }; }
  }
}

const GEN = `You are the duty operations analyst. Using ONLY DATA, return STRICT JSON with keys:
"situation": 1 sentence; "jewar_readiness": {"verdict": "ready"|"conditional"|"not ready", "why": 1 sentence citing DATA};
"gps_environment": 1 sentence on Delhi vs Jewar cells from DATA;
"actions": {"airline_ops": [2 short steps], "airport_and_atc": [2 short steps], "passenger_desk": [2 short steps], "lender": [1 short step]};
"evidence_used": array of 3-5 DATA field names you relied on; "unknowns": array of 2-3 things DATA cannot confirm; "confidence": "high"|"medium"|"low".
Every string under 25 words. No numbers that are not in DATA.`;
const gen = await ask('Write the diversion readiness brief. Follow TASK in the context exactly; return only the JSON.', { DATA, TASK: GEN });
console.log('brief:', gen.out ? 'ok' : 'FAILED');

const CHECK = `You are a strict fact-checker. Compare BRIEF against DATA. Return STRICT JSON:
{"verdict": "pass"|"pass_with_fixes"|"fail", "issues": [{"claim": short quote from BRIEF, "problem": short, "fix": short}], "unsupported_numbers": [any number in BRIEF not in DATA]}.
Flag anything that overstates certainty, invents numbers, or ignores the limits. Max 5 issues.`;
const chk = await ask('Fact-check the brief. Follow TASK in the context exactly; return only the JSON.', { DATA, BRIEF: gen.out, TASK: CHECK });
console.log('check:', chk.out ? chk.out.verdict : 'FAILED');

const out = { schema_version: '1.0', generated_utc: new Date().toISOString(), evidence_type: 'AI decision support (Nemotron), two-pass: generate then fact-check', model: gen.model, data: DATA, brief: gen.out, brief_raw: gen.raw, fact_check: chk.out, fact_check_raw: chk.raw };
fs.writeFileSync(path.join(HERE, 'nemotron_brief.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ brief: gen.out, check: chk.out }, null, 1).slice(0, 3000));
