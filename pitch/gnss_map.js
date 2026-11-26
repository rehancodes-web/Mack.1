// Renders pitch/gnss_map.png: GPS-integrity rating per 1° cell over South Asia from c/outputs/gnss_cells.json
// (real ADS-B integrity reports, ADS-B Exchange sample day), with country borders and Delhi/Jewar marked.
// Usage: cd pitch && node gnss_map.js
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const topo = require('topojson-client');

const ROOT = path.join(__dirname, '..');
const cells = JSON.parse(fs.readFileSync(path.join(ROOT, 'c/outputs/gnss_cells.json'), 'utf8')).cells;
const world = JSON.parse(fs.readFileSync(path.join(ROOT, 'c/outputs/countries-50m.json'), 'utf8'));
const BB = { w: 60, e: 100, s: 5, n: 40 }, S = 40; // 40 px per degree
const W = (BB.e - BB.w) * S, H = (BB.n - BB.s) * S;
const X = lon => (lon - BB.w) * S, Y = lat => (BB.n - lat) * S;
const png = new PNG({ width: W, height: H });
const put = (x, y, c, a = 1) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const o = (y * W + x) * 4; for (let k = 0; k < 3; k++) png.data[o + k] = Math.round(png.data[o + k] * (1 - a) + c[k] * a); png.data[o + 3] = 255; };
for (let i = 0; i < W * H; i++) { png.data[i * 4] = 11; png.data[i * 4 + 1] = 31; png.data[i * 4 + 2] = 58; png.data[i * 4 + 3] = 255; } // navy

// cells (cell lat/lon = south-west corner, 1°)
const COL = { high: [217, 83, 79], medium: [230, 168, 74], low: [63, 182, 139] };
for (const c of cells) {
  const col = COL[c.rating]; if (!col) continue;
  const a = c.rating === 'low' ? 0.35 : 0.85;
  for (let y = Y(c.lat + 1) + 1; y < Y(c.lat) - 1; y++) for (let x = X(c.lon) + 1; x < X(c.lon + 1) - 1; x++) put(x, y, col, a);
}
// borders
const line = (a, b, col, w = 1) => { const [x0, y0] = [X(a[0]), Y(a[1])], [x1, y1] = [X(b[0]), Y(b[1])]; const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5) + 1; for (let t = 0; t <= n; t++) for (let d = 0; d < w; d++) put(x0 + (x1 - x0) * t / n + d, y0 + (y1 - y0) * t / n, col, 0.9); };
const mesh = topo.mesh(world, world.objects.countries);
for (const arc of mesh.coordinates) for (let i = 1; i < arc.length; i++) line(arc[i - 1], arc[i], [201, 212, 229], 2);
// markers
const dot = (lon, lat, col, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) put(X(lon) + dx, Y(lat) + dy, col); };
dot(77.10, 28.56, [255, 255, 255], 9); dot(77.10, 28.56, [11, 31, 58], 4); // Delhi IGI
dot(77.61, 28.17, [134, 163, 255], 9); // Jewar
fs.writeFileSync(path.join(__dirname, 'gnss_map.png'), PNG.sync.write(png));
console.log(`gnss_map.png ${W}x${H}; cells high=${cells.filter(c => c.rating === 'high').length} medium=${cells.filter(c => c.rating === 'medium').length} low=${cells.filter(c => c.rating === 'low').length}`);
