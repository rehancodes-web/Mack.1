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
const b3 = path.join(HERE, '..', 'spacecraft', 'b3.html');
fs.copyFileSync(b3, path.join(DOCS, 'b3.html'));
// B3 is linked from the top navigation ("Nav Integrity"); no floating button (it covered the layer switch).
fs.writeFileSync(path.join(DOCS, 'index.html'), html);
fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');
console.log(`docs/index.html + docs/b3.html + ${imgs.length} images`);
