// Adds human-check notes to decisions/nemotron_decisions.json and renders the decisions into
// docs/passengers.html (between the NEMOTRON markers). Usage: node decisions/page.mjs
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const F = path.join(HERE, 'nemotron_decisions.json');
const D = JSON.parse(fs.readFileSync(F, 'utf8'));

// Human review against the reported facts (team check, 26 Nov 2026)
const REVIEW = {
  delhi: { verdict: 'corrected', note: 'Facts say ILS stayed available on other runway directions and movements were unaffected. First move: switch arrivals to an ILS runway at IGI; divert to Jewar only if that runway is saturated.', final: 'Move arrivals to an ILS runway at IGI; Jewar is the fallback, confirmed by Track A6.' },
  northwest: { verdict: 'agreed, with a correction', note: 'Diverting away from the jamming band is sound. "CAT III" at Jewar is not in our data, so check Jewar\'s approach aids before dispatch. B3 is a future system, not available today.', final: 'Divert away from the jamming band (Jewar or Delhi), after checking approach aids; use Track C to warn every flight in the sector.' },
  outage: { verdict: 'agreed, with a correction', note: 'Diversion is right. Jewar must have a non-GPS approach (ILS) for this to work; check before naming it as the alternate.', final: 'Divert to the nearest alternate with a non-GPS approach (Delhi IGI ILS, or Jewar if confirmed); start passenger rebooking before landing.' },
  tartu: { verdict: 'agreed', note: 'Matches what actually happened: flights stopped at Tartu and passengers went via Tallinn. Our addition: start the rebooking and coach transfer before departure, not after.', final: 'Operate to Tallinn and pre-book the road transfer and rebookings before departure.' },
};
for (const c of D.cases) { c.human_review = REVIEW[c.id]; if (c.nemotron?.confidence) c.nemotron.confidence = String(c.nemotron.confidence).replace(/6-week[^,;.]*/i, '').trim(); }
D.review_note = 'Each Nemotron decision was checked by the team against the reported facts; corrections are shown next to the AI output.';
fs.writeFileSync(F, JSON.stringify(D, null, 1));

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cards = D.cases.map(c => {
  const n = c.nemotron || {}, r = c.human_review;
  return `<section class="dcase">
 <h3>${esc(c.title)}</h3>
 <p class="note"><b>Reported facts:</b> ${esc(c.facts)}</p>
 <table><tbody>
  <tr><th>What fails</th><td>${esc(n.fails)}</td></tr>
  <tr><th>Turnaround impact</th><td>${esc(n.turnaround)}</td></tr>
  <tr><th>Passengers</th><td>${esc(n.passengers)}</td></tr>
  <tr><th>Nemotron decision</th><td>${esc(n.decision)}</td></tr>
  <tr><th>Fix</th><td><ol>${(n.fix || []).map(x => `<li>${esc(x)}</li>`).join('')}</ol></td></tr>
  <tr><th>Human check <span class="ev">${esc(r.verdict)}</span></th><td>${esc(r.note)}<br><b>Final call:</b> ${esc(r.final)}</td></tr>
 </tbody></table>
</section>`;
}).join('\n');

const block = `<!-- NEMOTRON:START -->
<h2>Nemotron decisions: four real GPS-failure cases</h2>
<p class="lead">For each reported case, NVIDIA Nemotron (${esc(D.model)}) was asked as the airline's operations decision-maker: what fails, how it hits the aircraft turnaround, what passengers face, which option to take and how to fix it. The team then checked every answer against the facts.</p>
<style>.dcase{background:var(--card);border:1px solid var(--ln);border-radius:12px;padding:16px;margin:14px 0}.dcase h3{margin:0 0 6px}.dcase th{width:190px}.dcase ol{margin:0;padding-left:18px}</style>
${cards}
<p class="note">AI decision support on reported cases, not an operational instruction. Generated ${esc(D.generated_utc.slice(0, 16).replace('T', ' '))} UTC by decisions/run.mjs; review notes in decisions/page.mjs.</p>
<!-- NEMOTRON:END -->`;

const P = path.join(HERE, '..', 'docs', 'passengers.html');
let html = fs.readFileSync(P, 'utf8');
html = html.includes('<!-- NEMOTRON:START -->')
  ? html.replace(/<!-- NEMOTRON:START -->[\s\S]*<!-- NEMOTRON:END -->/, block)
  : html.replace('<h2>How NavContinuity recovers each passenger</h2>', `${block}\n\n<h2>How NavContinuity recovers each passenger</h2>`);
fs.writeFileSync(P, html);
console.log('rendered', D.cases.length, 'cases into docs/passengers.html');
