// Packs pitch/slides/png/NN.png into pitch/NavContinuity_Hackathon.pptx (one full-bleed image per slide + speaker notes).
// Usage: node pitch/slides/pack.cjs   (run build.mjs and render.ps1 first)
const fs = require('fs');
const path = require('path');
const pptxgen = require(path.join(__dirname, '..', 'node_modules', 'pptxgenjs'));

const PNG = path.join(__dirname, 'png');
const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'html', 'notes.json'), 'utf8'));
const titles = ['NavContinuity', 'The problem', 'Who it serves', 'Track A6 objective', 'Data', 'Larper AI', 'Track A6 result', 'Accuracy', 'Decision', 'Working demo', 'Track C', 'Nemotron', 'Track B3', 'Originality', 'Feasibility', 'Roadmap'];
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'NavContinuity: Mach-A-Thon Aeromania 26';
pres.author = 'NavContinuity team';
const files = fs.readdirSync(PNG).filter(f => /^\d+\.png$/.test(f)).sort();
files.forEach((f, i) => {
  const s = pres.addSlide();
  s.background = { color: '0D1A24' };
  s.addImage({ path: path.join(PNG, f), x: 0, y: 0, w: 10, h: 5.625, altText: `Slide ${i + 1}: ${titles[i] || ''}` });
  if (notes[i]) s.addNotes(notes[i]);
});
pres.writeFile({ fileName: path.join(__dirname, '..', 'NavContinuity_Pitch.pptx') }).then(f => console.log('wrote', f, files.length, 'slides'));

