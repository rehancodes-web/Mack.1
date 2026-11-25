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
- When images are supplied (a Sentinel-2 true-colour photo and the class map from Larper, our Random Forest land-cover model: red built/paved, sand bare, green vegetation, blue water, dark = outside footprint), compare them: say where the class map looks right and list specific areas where it seems wrong. You are a visual cross-check of Larper, not a replacement for its numbers; label your observations "AI visual check".
- Be concise: at most 150 words unless asked for a memo. Memos: max 250 words, headings Evidence / Decision / Caveats.`;

// Collision mode: a real predicted close approach between two tracked objects (CelesTrak elements, SGP4).
const SYSTEM_COLLISION = `You are the collision-avoidance assistant in NavContinuity's orbital view (hackathon Track B).
The CONTEXT holds a close approach computed in the browser from public CelesTrak orbital elements with SGP4, plus a
physics estimate of an along-track avoidance burn for each object. Rules:
- Use ONLY the numbers in CONTEXT. Never invent distances, burns, probabilities or times.
- Debris, rocket bodies and dead satellites cannot manoeuvre. Choose an object with "can_manoeuvre": true; if neither can, say no avoidance burn is possible and recommend monitoring.
- Address the chosen satellite directly, like a short instruction to its operations team: which object, which direction (prograde or retrograde), how big a burn (from CONTEXT), when, and the expected new miss distance.
- Say it is temporary: after the encounter the satellite returns to its slot with an equal and opposite burn.
- State the limits in one line: public TLEs are accurate to roughly 1 km, so a real operator would confirm with a conjunction data message (CDM) from Space-Track before burning. This is a simulation, not a command to a real spacecraft.
- At most 130 words.`;

// Earth Viewer mode: describe change at any location from two Sentinel-2 cloudless yearly mosaics.
const SYSTEM_EARTH = `You compare two satellite images of the same place for NavContinuity's Earth Viewer.
Images: Sentinel-2 cloudless yearly mosaics (EOX), about 10 m per pixel, same area, labelled with their years.
Rules:
- Describe only what is visible: new or removed buildings, roads, runways, clearing, farmland, water, mining, flooding.
- Give rough sizes using the scale in CONTEXT when helpful. Say "unclear" rather than guess.
- Do not identify or track people, vehicles or individual private properties. No military targeting.
- These are composites of many dates: seasonal colour differences are not change.
- Sources differ: 1975-2010 are Landsat (30 m, 1975 60 m, blurry), 2014 is Esri high-resolution imagery, 2016 onward Sentinel-2 (10 m). Differences in sharpness or colour between sources are not change; only describe features large enough to see in the blurrier image.
- Reply in at most 4 short bullets, then one line "Change level: none / minor / major".`;

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
  const sys = body.mode === 'earth' ? SYSTEM_EARTH : body.mode === 'collision' ? SYSTEM_COLLISION : SYSTEM;
  // collision mode shows Nemotron's reasoning on screen, so thinking is on there (with a bigger budget); elsewhere it is off
  const think = body.mode === 'collision' && body.think !== false;
  const call = async thinking => {
    const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${NV}` },
      body: JSON.stringify({ model, temperature: thinking ? 0.6 : 0.2, max_tokens: thinking ? 4096 : 2048, chat_template_kwargs: { enable_thinking: thinking, thinking },
        messages: [{ role: 'system', content: (thinking ? '' : '/no_think\n') + sys }, { role: 'user', content }] }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { error: `Nemotron ${r.status}: ${j.detail || j.error?.message || j.title || 'error'}` };
    const m = j.choices?.[0]?.message || {}, raw = String(m.content || '');
    const inline = (raw.match(/<think>([\s\S]*?)<\/think>/) || [])[1] || '';
    const text = raw.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/^[\s\S]*<\/think>/, '').trim();
    return { text, reasoning: String(m.reasoning_content || m.reasoning || inline || '').trim(), finish: j.choices?.[0]?.finish_reason };
  };
  let out = await call(think);
  if (!out.error && !out.text && think) out = { ...(await call(false)), reasoning: out.reasoning }; // thinking used the whole budget: answer without it
  if (out.error) return res.status(502).json({ error: out.error, model });
  if (!out.text) return res.status(502).json({ error: `Nemotron returned no answer (finish: ${out.finish || 'unknown'})`, model });
  return res.status(200).json({ answer: out.text, reasoning: think ? out.reasoning.slice(0, 6000) : undefined, model });
}
