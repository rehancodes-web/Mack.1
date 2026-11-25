// NavContinuity A6 analyst backend: a Cloudflare Worker that proxies the demo page to Google Gemini.
// The API key lives ONLY in the Worker secret GEMINI_API_KEY (never in this repo or the page).
// Deploy: see backend/README.md
const ALLOWED_ORIGINS = ['https://rehancodes-web.github.io', 'http://localhost:8080'];
const MODEL_DEFAULT = 'gemini-2.5-flash';
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

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin);
  return { 'Access-Control-Allow-Origin': ok ? origin : ALLOWED_ORIGINS[0], 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
}
const json = (body, status, origin) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors(origin) } });

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    if (req.method !== 'POST') return json({ error: 'POST only' }, 405, origin);
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: 'origin not allowed' }, 403, origin);
    const KEY = String(env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '').replace(/^GEMINI_API_KEY=/, '');
    if (!KEY) return json({ error: 'backend has no GEMINI_API_KEY secret' }, 500, origin);

    let body; try { body = await req.json(); } catch { return json({ error: 'bad JSON' }, 400, origin); }
    const question = String(body.question || '').slice(0, MAX_Q).trim();
    const context = JSON.stringify(body.context || {}).slice(0, MAX_CTX);
    if (!question) return json({ error: 'empty question' }, 400, origin);

    // optional images (satellite photo + RF class map) for the vision cross-check
    const images = (Array.isArray(body.images) ? body.images : []).slice(0, 4)
      .filter(im => im && /^image\/(png|jpeg)$/.test(im.mime) && typeof im.data === 'string' && im.data.length < 1_500_000)
      .flatMap(im => [{ text: `IMAGE: ${String(im.label || '').slice(0, 120)}` }, { inlineData: { mimeType: im.mime, data: im.data } }]);

    const model = env.GEMINI_MODEL || MODEL_DEFAULT;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [...images, { text: `CONTEXT:\n${context}\n\nQUESTION:\n${question}` }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: `Gemini ${r.status}: ${j.error?.message || 'error'}` }, 502, origin);
    const text = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    return json({ answer: text || '(no answer)', model }, 200, origin);
  },
};
