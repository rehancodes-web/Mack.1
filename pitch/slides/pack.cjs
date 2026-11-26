// Packs pitch/slides/png/NN.png into pitch/FlyWithEase_Pitch.pptx: one full-bleed image per slide, speaker notes,
// and invisible click areas from html/meta.json (jump to another slide, or open a live site page), so the pptx is interactive.
// Usage: node pitch/slides/pack.cjs   (run build.mjs and render.ps1 first)
const fs = require('fs');
const path = require('path');
const pptxgen = require(path.join(__dirname, '..', 'node_modules', 'pptxgenjs'));

const SHORT = process.argv.includes('--short'); // 5-minute cut
const PNG = path.join(__dirname, SHORT ? 'png5' : 'png');
const notes = JSON.parse(fs.readFileSync(path.join(__dirname, SHORT ? 'html5' : 'html', 'notes.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(path.join(__dirname, SHORT ? 'html5' : 'html', 'meta.json'), 'utf8'));
// 1x1 fully transparent PNG used as the clickable hotspot
const CLEAR = 'image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'FlyWithEase: Mach-A-Thon Aeromania 26';
pres.author = 'FlyWithEase team';
const files = fs.readdirSync(PNG).filter(f => /^\d+\.png$/.test(f)).sort().slice(0, meta.titles.length);
const k = 10 / 1280; // px -> inches
files.forEach((f, i) => {
  const s = pres.addSlide();
  s.background = { color: '0D1A24' };
  s.addImage({ path: path.join(PNG, f), x: 0, y: 0, w: 10, h: 5.625, altText: `Slide ${i + 1}: ${meta.titles[i] || ''}` });
  for (const h of meta.hot[i] || []) {
    const link = h.slide ? { slide: h.slide, tooltip: h.tip } : { url: h.url, tooltip: h.tip };
    s.addImage({ data: CLEAR, x: h.x * k, y: h.y * k, w: h.w * k, h: h.h * k, hyperlink: link, altText: h.tip || '' });
  }
  if (notes[i]) s.addNotes(notes[i]);
});
pres.writeFile({ fileName: path.join(__dirname, '..', SHORT ? 'FlyWithEase_5min.pptx' : 'FlyWithEase_Pitch.pptx') }).then(f => console.log('wrote', f, files.length, 'slides'));
