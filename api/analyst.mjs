// NavContinuity A6 analyst backend on Vercel: proxies the demo page to NVIDIA Nemotron (build.nvidia.com).
// The key lives ONLY in the Vercel environment variable NEMOTRON_API_KEY (never in the repo or the page).
const ALLOWED_ORIGINS = ['https://mackathon-three.vercel.app', 'http://localhost:8080'];
const NV_DEFAULT = 'nvidia/nemotron-3.5-lightning-30b-a3b';     // text: Q&A and memo (override with NEMOTRON_MODEL)
const NV_VL_DEFAULT = 'nvidia/nemotron-3.5-super-vl-120b-a12b'; // vision: RF map cross-check (override with NEMOTRON_VL_MODEL)
const MAX_Q = 600, MAX_CTX = 12000;

const SYSTEM = `You are the project-monitoring analyst inside NavContinuity's Track A6 demo.
Asset: Noida International Airport (Jewar), monitored with Sentinel-2 satellite imagery 2020-2026.
Rules:
- Answer ONLY from the CONTEXT JSON supplied. If the answer is not in it, say you don't know.
- Label every number as reported, derived (satellite/AI) or assumed (economics), as the context does.
- Land conversion is NOT construction completion. Never say the contractor lied or the project was X% complete.
- All economics are illustrative assumptions, not real savings.
- Satellite imagery cannot confirm runway certification, ATC readiness or GNSS conditions.
- When images are supplied (a Sentinel-2 true-colour photo and the Random Forest class map: red built/paved, sand bare, green vegetation, blue water, dark = outside footprint), compare them: say where the class map looks right and list specific areas where it seems wrong. You are a visual cross-check of the RF model, not a replacement for its numbers; label your observations "AI visual check".
- Be concise: at most 150 words unless asked for a memo. Memos: max 250 words, headings Evidence / Decision / Caveats.`;

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!ALLOWED_ORIGINS.includes(origin)) return res.status(403).json({ error: 'origin not allowed' });

  const NV = String(process.env.NEMOTRON_API_KEY || '').trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '');
  if (!NV) return res.status(500).json({ error: 'backend has no NEMOTRON_API_KEY' });
  if (!NV.startsWith('nvapi-')) return res.status(500).json({ error: `NEMOTRON_API_KEY does not look like an NVIDIA key (should start with nvapi-; this one has length ${NV.length})` });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const question = String(body.question || '').slice(0, MAX_Q).trim();
  const context = JSON.stringify(body.context || {}).slice(0, MAX_CTX);
  if (!question) return res.status(400).json({ error: 'empty question' });
  const imgs = (Array.isArray(body.images) ? body.images : []).slice(0, 4)
    .filter(im => im && /^image\/(png|jpeg)$/.test(im.mime) && typeof im.data === 'string' && im.data.length < 1_500_000);
  const userText = `CONTEXT:\n${context}\n\nQUESTION:\n${question}`;

  const vision = imgs.length > 0;
  const model = vision ? (process.env.NEMOTRON_VL_MODEL || NV_VL_DEFAULT) : (process.env.NEMOTRON_MODEL || NV_DEFAULT);
  const content = vision
    ? [...imgs.flatMap(im => [{ type: 'text', text: `IMAGE: ${String(im.label || '').slice(0, 120)}` }, { type: 'image_url', image_url: { url: `data:${im.mime};base64,${im.data}` } }]), { type: 'text', text: userText }]
    : userText;
  const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${NV}` },
    body: JSON.stringify({ model, temperature: 0.2, max_tokens: 700, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content }] }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return res.status(502).json({ error: `Nemotron ${r.status}: ${j.detail || j.error?.message || j.title || 'error'}`, model });
  const text = String(j.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  return res.status(200).json({ answer: text || '(no answer)', model });
}
