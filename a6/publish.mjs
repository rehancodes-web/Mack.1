// Copies the built demo and the images it references into ../docs/ for GitHub Pages.
// Usage: node demo.mjs && node publish.mjs
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs'), DOCS = path.join(HERE, '..', 'docs');
fs.mkdirSync(DOCS, { recursive: true });
const html = fs.readFileSync(path.join(OUT, 'demo.html'), 'utf8');
const imgs = [...new Set([...html.matchAll(/src="([^"]+\.png)"/g)].map(m => m[1]))];
for (const f of imgs) fs.copyFileSync(path.join(OUT, f), path.join(DOCS, f));
fs.writeFileSync(path.join(DOCS, 'index.html'), html);
fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');
console.log(`docs/index.html + ${imgs.length} images`);
