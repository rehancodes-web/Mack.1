// Quick structural check of the built deck: slide text, theme colour, chart count. Usage: node check_deck.js
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
(async () => {
  const z = await JSZip.loadAsync(fs.readFileSync(path.join(__dirname, 'NavContinuity_MachAThon.pptx')));
  const slides = Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
  for (const f of slides) {
    const x = await z.file(f).async('string');
    const t = [...x.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m => m[1]).join(' | ');
    console.log(path.basename(f), ':', t.slice(0, 260));
  }
  const th = await z.file('ppt/theme/theme1.xml').async('string');
  const m = th.match(/<a:accent1>\s*<a:srgbClr val="(\w+)"/);
  console.log('theme accent1:', m ? m[1] : 'not found');
  console.log('charts:', Object.keys(z.files).filter(f => /charts\/chart\d+\.xml$/.test(f)).length);
})();
