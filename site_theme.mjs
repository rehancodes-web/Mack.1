// Adds the shared navigation-display theme (docs/nd-theme.css) to every docs page and to the page generators.
// Idempotent. Usage: node site_theme.mjs   (run after any page rebuild, together with site_nav.mjs)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const TAG = '<link rel="stylesheet" href="nd-theme.css">';
const FILES = ['docs/a6.html', 'docs/c.html', 'docs/globe.html', 'docs/earth.html', 'a6/demo.mjs', 'c/page.mjs'];
for (const f of FILES) {
  const p = path.join(ROOT, f);
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('nd-theme.css')) { console.log(`already themed: ${f}`); continue; }
  const i = s.lastIndexOf('</head>');
  if (i < 0) { console.warn(`no </head> in ${f}`); continue; }
  s = s.slice(0, i) + TAG + s.slice(i);
  fs.writeFileSync(p, s);
  console.log(`themed: ${f}`);
}
