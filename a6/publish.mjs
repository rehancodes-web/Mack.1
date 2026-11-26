// Copies the built demo and the images it references into ../docs/ for GitHub Pages.
// Usage: node demo.mjs && node publish.mjs
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs'), DOCS = path.join(HERE, '..', 'docs');
fs.mkdirSync(DOCS, { recursive: true });
const html = fs.readFileSync(path.join(OUT, 'demo.html'), 'utf8');
const imgs = fs.readdirSync(OUT).filter(f => /^(quicklook|classmap)_\d{4}-\d{2}\.png$/.test(f) || /^hires_\d{4}-\d{2}-\d{2}\.jpg$/.test(f)); // date pickers load any of these
for (const f of imgs) fs.copyFileSync(path.join(OUT, f), path.join(DOCS, f));
// Track B3 is shown on the 3D globe (docs/globe.html); the separate Nav Integrity page was removed from the site.
fs.writeFileSync(path.join(DOCS, 'a6.html'), html); // index.html is the hand-written overview
fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');
console.log(`docs/a6.html + ${imgs.length} images`);
