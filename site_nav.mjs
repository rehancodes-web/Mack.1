// Writes the one site menu into every page in docs/ (and the page generators).
// Track B3 points to the 3D globe (real satellites, proposed LEO layer, all airports with before/after).
// Judging material (tech, AI, feasibility, scorecard) lives in the deck, not on the site.
// Usage: node site_nav.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const ITEMS = [['index.html', 'Overview', ''], ['a6.html', 'Jewar', 'A6'], ['c.html', 'GPS map', 'C'], ['globe.html', 'Globe', 'B3'], ['passengers.html', 'Passengers', ''], ['deck.html', 'Deck', '']];
const nav = cur => ITEMS.map(([h, t, tag]) => `  <a href="${h}"${h === cur ? ' aria-current="page"' : ''}>${t}${tag ? ` <small>${tag}</small>` : ''}</a>`).join('\n');
const FILES = { 'docs/index.html': 'index.html', 'docs/a6.html': 'a6.html', 'docs/c.html': 'c.html', 'docs/passengers.html': 'passengers.html', 'docs/globe.html': 'globe.html', 'docs/earth.html': '', 'a6/demo.mjs': 'a6.html', 'c/page.mjs': 'c.html' };
for (const [f, cur] of Object.entries(FILES)) {
  const p = path.join(ROOT, f);
  const s = fs.readFileSync(p, 'utf8');
  const out = s.replace(/(<nav class="mods"[^>]*>)[\s\S]*?(\s*<\/nav>)/, (_, a, b) => `${a}\n${nav(cur)}${b}`);
  if (out === s) { console.warn(`no nav found in ${f}`); continue; }
  fs.writeFileSync(p, out);
  console.log(`menu updated: ${f}`);
}
