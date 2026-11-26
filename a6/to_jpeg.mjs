// Converts outputs/hires_*.png to JPEG (quality 85) for the deck and site. Usage: node to_jpeg.mjs
import fs from 'node:fs';
import path from 'node:path';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const OUT = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), 'outputs');
for (const f of fs.readdirSync(OUT).filter(f => /^hires_.*\.png$/.test(f))) {
  const p = PNG.sync.read(fs.readFileSync(path.join(OUT, f)));
  const j = jpeg.encode({ data: p.data, width: p.width, height: p.height }, 85);
  fs.writeFileSync(path.join(OUT, f.replace('.png', '.jpg')), j.data);
  fs.unlinkSync(path.join(OUT, f));
  console.log(f.replace('.png', '.jpg'), (j.data.length / 1e6).toFixed(1), 'MB');
}
