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
const b3 = path.join(HERE, '..', 'spacecraft', 'b3.html');
fs.copyFileSync(b3, path.join(DOCS, 'b3.html'));
const b3Link = '<a href="b3.html" style="position:fixed;z-index:99999;right:16px;top:16px;padding:10px 14px;border:1px solid #55e6c8;border-radius:10px;background:#07101a;color:#8df4df;font:600 13px system-ui;text-decoration:none">Open 3D B3 simulation ↗</a>';
const siteHtml = html.includes('Open 3D B3 simulation') ? html : html.replace(/<body([^>]*)>/i, `<body$1>${b3Link}`);
fs.writeFileSync(path.join(DOCS, 'index.html'), siteHtml);
fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');
console.log(`docs/index.html + docs/b3.html + ${imgs.length} images`);
