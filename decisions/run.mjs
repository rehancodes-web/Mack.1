// Asks NVIDIA Nemotron (via the deployed /api/analyst proxy, key held in Vercel) to make an operational
// decision for real GPS-failure cases: what fails, turnaround impact, passenger impact, options, decision, fix.
// Usage: node decisions/run.mjs  -> decisions/nemotron_decisions.json
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const EP = 'https://mackathon-three.vercel.app/api/analyst';
const ORIGIN = 'https://mackathon-three.vercel.app';
const R = f => JSON.parse(fs.readFileSync(path.join(HERE, '..', f), 'utf8'));
const gn = R('c/outputs/gnss_summary.json');

const CONTEXT = {
  product: 'FlyWithEase: Track C detects where GPS is failing from aircraft integrity reports; Track A6 confirms which nearby airport can absorb diversions (Noida International Airport, Jewar, ~70 km from Delhi IGI, phase 1 inaugurated 28 Mar 2026, one runway); Track B3 proposes a LEO navigation layer (19 dB stronger, simulated spoofed error 50 m -> 8 m); passenger recovery flow rebooks, books care at the right city and tracks bags.',
  track_c_today: { day: gn.days[0], reports: gn.reports, high_cells: gn.cells_high, hotspots: 'India-Pakistan border (Amritsar/Jammu) and Myanmar', jewar_region: gn.jewar_region.status },
  india_reported: { incidents_nov2023_dec2025: 2354, impacts_2025: { loss_of_gps: '71%', loss_of_ads: '54%', egpws_alerts: '19%', complete_outage: '10%', loss_of_gnss_landing: '6%' }, northwest_india_2025: 276, delhi_vicinity_2025: 64 },
  costs_reported: { diversion_eur: '1,000-77,200 (EUROCONTROL 2022)', block_minute_usd: 98.41, note: 'general costs, not proven GPS-caused' },
  airline_finding_reported: 'ICAO-hosted airline presentation: some receivers need a ground maintenance reset after interference; IATA: receiver recovery can exceed 30 minutes in a significant number of cases.',
};

const CASES = [
  { id: 'delhi', title: 'Delhi IGI: GPS spoofing on Runway 10 approaches (2025)', facts: 'Flights on GPS-based (RNP) approaches to Runway 10 were spoofed. Contingency procedures were used; conventional aids (ILS) remained available for other runway directions; government reported no effect on movements; DGCA introduced real-time spoofing reporting.' },
  { id: 'northwest', title: 'Amritsar / Jammu: persistent jamming near the border', facts: '276 reported incidents in north-western India in 2025; Track C shows a band of high-interference cells along the India-Pakistan border. Aircraft lose GPS en route and on approach; some arrive with receivers that do not recover before the next departure.' },
  { id: 'outage', title: 'Complete GPS outage at an airport with GPS-only approaches', facts: '10% of reported Indian incidents were complete outages and 6% lost GNSS-based landing capability. Scenario: an evening bank of arrivals into an airport whose only instrument approach is GPS-based, poor visibility, nearest alternates Delhi IGI and Jewar.' },
  { id: 'tartu', title: 'Tartu, Estonia: route suspended (Apr-May 2024)', facts: 'Finnair suspended Helsinki-Tartu flights from 29 April to 31 May 2024 because GPS interference made the GPS-based approach unusable; Tallinn Airport was unaffected. Passengers had to reroute via Tallinn by road.' },
];

const Q = c => `CASE: ${c.title}
FACTS (reported): ${c.facts}

You are the airline operations decision-maker. Using ONLY the case facts and CONTEXT, return STRICT JSON (no markdown, no prose outside JSON) with keys:
"fails": one sentence, what navigation capability fails and why it matters on the aircraft and at the airport;
"turnaround": one sentence, how this hits the aircraft turnaround (late inbound, receiver reset/maintenance check, crew duty, next rotation);
"passengers": one sentence, what passengers at the airport experience;
"options": array of exactly 3 objects {"action": short, "pro": short, "con": short} the airline could take;
"decision": one sentence naming the option you choose and why;
"fix": array of exactly 3 short concrete steps that solve it, at least one using FlyWithEase (Track C warning, A6 diversion airport, B3 LEO backup, or passenger recovery);
"confidence": "high" | "medium" | "low" with a 6-word reason.
Keep every string under 30 words. Do not invent numbers that are not in the facts or context.`;

const out = { schema_version: '1.0', generated_utc: new Date().toISOString(), model: null, evidence_type: 'AI decision support (Nemotron) on reported cases; not an operational instruction', context: CONTEXT, cases: [] };
for (const c of CASES) {
  let parsed = null, raw = '', model = null;
  for (let a = 1; a <= 3 && !parsed; a++) {
    // the proxy truncates `question` at 600 chars, so the case and the output contract travel in `context`
    const r = await fetch(EP, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: JSON.stringify({ question: `Make the decision for this case. Follow TASK in the context exactly and return only the JSON object with all 7 keys: fails, turnaround, passengers, options, decision, fix, confidence.`, context: { ...CONTEXT, TASK: Q(c) } }) });
    const j = await r.json();
    raw = j.answer || JSON.stringify(j); model = j.model || model;
    const m = raw.match(/\{[\s\S]*\}/);
    try { parsed = JSON.parse(m ? m[0] : raw); } catch { console.warn(`  retry ${c.id}: unparseable`); }
  }
  out.model = model;
  out.cases.push({ id: c.id, title: c.title, facts: c.facts, nemotron: parsed, raw_if_unparsed: parsed ? undefined : raw });
  console.log(`${c.id}: ${parsed ? parsed.decision : 'FAILED'}`);
}
fs.writeFileSync(path.join(HERE, 'nemotron_decisions.json'), JSON.stringify(out, null, 1));
console.log('wrote decisions/nemotron_decisions.json');
