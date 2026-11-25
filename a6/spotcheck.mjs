// Larper spot check, step 1: pick ~200 points inside the airport on the Mar 2026 image, stratified by Larper's class,
// and build a blind labelling page (docs/label.html). Larper's answers go only to outputs/spotcheck_key.json (not published).
// Step 2 is spotcheck_score.mjs. Usage: node spotcheck.mjs
import fs from 'node:fs';
import path from 'node:path';
import proj4 from 'proj4';
import { PNG } from 'pngjs';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const OUT = path.join(HERE, 'outputs'), DOCS = path.join(HERE, '..', 'docs');
const MONTH = '2026-03', PER_CLASS = { built_paved: 60, bare: 60, vegetation: 60, water: 20 };
const CLASSES = ['vegetation', 'built_paved', 'bare', 'water'];
const COL = [[60, 140, 60], [220, 60, 60], [230, 200, 120], [60, 120, 220]];
let seed = 2026; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// both images sit on the same 10 m grid of tile 43RGM (UTM 43N); recompute each window's top-left pixel
const utm = '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs';
const gj = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'data', 'noida_airport_footprint.geojson'), 'utf8'));
const ring = gj.features[0].geometry.coordinates[0].map(([lon, lat]) => proj4('WGS84', utm, [lon, lat]));
const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]);
const OX = 699960, OY = 3200040; // tile 43RGM origin (checked from the COG headers)
const win = pad => ({ c0: Math.floor((Math.min(...xs) - pad - OX) / 10), r0: Math.floor((OY - (Math.max(...ys) + pad)) / 10) });
const q = win(800), m = win(0); // quicklook window (800 m pad) and Larper class-map window (footprint only)

const map = PNG.sync.read(fs.readFileSync(path.join(OUT, `classmap_${MONTH}.png`)));
const ql = PNG.sync.read(fs.readFileSync(path.join(OUT, `quicklook_${MONTH}.png`)));
const pools = CLASSES.map(() => []);
for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
  const i = (y * map.width + x) * 4, px = [map.data[i], map.data[i + 1], map.data[i + 2]];
  const k = COL.findIndex(c => c[0] === px[0] && c[1] === px[1] && c[2] === px[2]); if (k < 0) continue;
  const qx = x + (m.c0 - q.c0), qy = y + (m.r0 - q.r0); // same ground pixel in the quicklook
  if (qx < 12 || qy < 12 || qx >= ql.width - 12 || qy >= ql.height - 12) continue;
  pools[k].push({ qx, qy, larper: CLASSES[k] });
}
const pts = [];
CLASSES.forEach((name, k) => { const p = pools[k], n = Math.min(PER_CLASS[name], p.length);
  for (let t = 0; t < n; t++) { const j = Math.floor(rnd() * p.length); pts.push(p.splice(j, 1)[0]); } });
for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; } // shuffle: no class runs
pts.forEach((p, i) => (p.id = i + 1));
fs.writeFileSync(path.join(OUT, 'spotcheck_key.json'), JSON.stringify({ month: MONTH, points: pts }, null, 0));
console.log(`points: ${pts.length} (${CLASSES.map((c, k) => `${c} ${pts.filter(p => p.larper === c).length}`).join(', ')}); pool sizes ${pools.map(p => p.length).join('/')}`);

const pub = pts.map(p => [p.id, p.qx, p.qy]); // published: positions only, no Larper answers
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Larper Spot Check</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap" rel="stylesheet">
<style>
:root{--bg:#E9EDEC;--panel:#FFF;--ink:#17232C;--mut:#5A6870;--rule:#D3DAD9;--acc:#2C55C9;--focus:#2C55C9}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0F171C;--panel:#17222A;--ink:#E4EBEA;--mut:#93A2A9;--rule:#2A3840;--acc:#86A3FF;--focus:#86A3FF}}
:root[data-theme="dark"]{--bg:#0F171C;--panel:#17222A;--ink:#E4EBEA;--mut:#93A2A9;--rule:#2A3840;--acc:#86A3FF;--focus:#86A3FF}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 Archivo,system-ui,sans-serif}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
main{max-width:980px;margin:0 auto;padding:20px 16px 40px}
h1{font-size:24px;margin:0;font-weight:800;font-variation-settings:"wdth" 112}p{margin:4px 0 12px;color:var(--mut)}
.bar{display:flex;align-items:center;gap:12px;margin:10px 0}.prog{flex:1;height:8px;background:var(--rule);border-radius:4px;overflow:hidden}.prog i{display:block;height:100%;background:var(--acc);width:0}
.views{display:grid;grid-template-columns:1fr 1fr;gap:12px}
figure{margin:0;background:var(--panel);border:1px solid var(--rule);border-radius:8px;padding:8px}figcaption{font-size:12.5px;color:var(--mut);margin-top:4px}
canvas{width:100%;height:auto;image-rendering:pixelated;display:block;border-radius:4px}
.btns{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:14px 0}
.btns button{font:inherit;font-weight:700;padding:14px 6px;border-radius:8px;border:2px solid var(--rule);background:var(--panel);color:var(--ink);cursor:pointer}
.btns button small{display:block;font-weight:500;color:var(--mut);font-size:12px}
.btns button.on{border-color:var(--acc)}
.nav{display:flex;gap:8px;flex-wrap:wrap}.nav button{font:inherit;padding:6px 12px;border-radius:6px;border:1px solid var(--rule);background:var(--panel);color:var(--ink);cursor:pointer}
.done{background:var(--panel);border:1px solid var(--rule);border-radius:8px;padding:14px;margin-top:12px}
@media (max-width:640px){.views{grid-template-columns:1fr}.btns{grid-template-columns:repeat(2,1fr)}}
</style></head><body><main>
<h1>Larper spot check</h1>
<p>Look at the 10 m square inside the crosshair on the March 2026 satellite image and pick what it is. You will not see Larper's answer; this is a blind test. Keys 1–5 pick, ← goes back. Progress is saved in this browser.</p>
<div class="bar"><strong id="cnt"></strong><div class="prog"><i id="pg"></i></div></div>
<div class="views">
<figure><canvas id="zoom" width="420" height="420" aria-label="Zoomed view of the point"></canvas><figcaption>Close-up: 210 m across, crosshair square = 10 m</figcaption></figure>
<figure><canvas id="ctx" width="420" height="420" aria-label="Wider view around the point"></canvas><figcaption>Context: 1 km across, white box = close-up area</figcaption></figure>
</div>
<div class="btns" role="group" aria-label="What is in the crosshair?">
<button data-c="built_paved">1 · Built or paved<small>runway, road, roof, apron</small></button>
<button data-c="bare">2 · Bare earth<small>graded soil, dry field, sand</small></button>
<button data-c="vegetation">3 · Vegetation<small>crops, grass, trees</small></button>
<button data-c="water">4 · Water<small>ponds, wet pits</small></button>
<button data-c="unsure">5 · Can't tell<small>mixed or unclear</small></button>
</div>
<div class="nav"><button id="back">← Back</button><button id="skipTo">Jump to first unlabelled</button><button id="dl">Download results (JSON)</button><button id="reset">Start over</button></div>
<div class="done" id="done" hidden><strong>All points labelled.</strong> Download the results and send the file to the team (it lands in your Downloads folder as larper_spotcheck_labels.json).</div>
</main><script>
(function(){
const PTS=${JSON.stringify(pub)},KEY='larper-spotcheck-${MONTH}';
let labels={};try{labels=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(labels))}catch(e){}};
let i=Math.max(0,PTS.findIndex(p=>!labels[p[0]]));if(i<0)i=0;
const img=new Image();img.src='quicklook_${MONTH}.png';
const zc=document.getElementById('zoom').getContext('2d'),cc=document.getElementById('ctx').getContext('2d');
zc.imageSmoothingEnabled=false;cc.imageSmoothingEnabled=false;
function draw(){const [id,x,y]=PTS[i];
 zc.clearRect(0,0,420,420);zc.drawImage(img,x-10,y-10,21,21,0,0,420,420);
 zc.strokeStyle='#ffd600';zc.lineWidth=3;zc.strokeRect(200,200,20,20);zc.strokeStyle='rgba(0,0,0,.6)';zc.lineWidth=1;zc.strokeRect(197,197,26,26);
 cc.clearRect(0,0,420,420);cc.drawImage(img,x-50,y-50,101,101,0,0,420,420);
 cc.strokeStyle='#fff';cc.lineWidth=2;const s=420/101;cc.strokeRect((40)*s,(40)*s,21*s,21*s);
 const n=Object.keys(labels).length;document.getElementById('cnt').textContent='Point '+(i+1)+' of '+PTS.length+' · '+n+' labelled';
 document.getElementById('pg').style.width=(100*n/PTS.length)+'%';
 document.querySelectorAll('.btns button').forEach(b=>b.classList.toggle('on',labels[id]===b.dataset.c));
 document.getElementById('done').hidden=n<PTS.length;}
function pick(c){labels[PTS[i][0]]=c;save();const nx=PTS.findIndex((p,k)=>k>i&&!labels[p[0]]);i=nx>=0?nx:Math.min(i+1,PTS.length-1);draw();}
document.querySelectorAll('.btns button').forEach(b=>b.onclick=()=>pick(b.dataset.c));
document.addEventListener('keydown',e=>{const m={'1':'built_paved','2':'bare','3':'vegetation','4':'water','5':'unsure'};if(m[e.key])pick(m[e.key]);else if(e.key==='ArrowLeft'){i=Math.max(0,i-1);draw();}else if(e.key==='ArrowRight'){i=Math.min(PTS.length-1,i+1);draw();}});
document.getElementById('back').onclick=()=>{i=Math.max(0,i-1);draw();};
document.getElementById('skipTo').onclick=()=>{const k=PTS.findIndex(p=>!labels[p[0]]);if(k>=0){i=k;draw();}};
document.getElementById('reset').onclick=()=>{if(confirm('Clear all labels in this browser?')){labels={};save();i=0;draw();}};
document.getElementById('dl').onclick=()=>{const blob=new Blob([JSON.stringify({month:'${MONTH}',labelled_utc:new Date().toISOString(),labels},null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='larper_spotcheck_labels.json';a.click();};
img.onload=draw;
})();
</script></body></html>`;
fs.writeFileSync(path.join(DOCS, 'label.html'), html);
console.log('wrote docs/label.html');
