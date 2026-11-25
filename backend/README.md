# AI analyst backend (Gemini)

The demo page on GitHub Pages is public, so it never holds the API key. It calls this small Cloudflare Worker, and only the Worker holds the key, as a secret.

## What it does

The page's **Ask the analyst** panel sends a question and a compact JSON of the page's own results: progress, AI metrics, the decision with current slider values, and readiness. The Worker forwards these to Gemini with a system prompt that:
- answers only from that data
- keeps the reported / derived / assumed labels
- refuses claims like "the contractor lied" or "51% complete"

## Deploy (about 5 minutes, free tier)

```powershell
npm install -g wrangler
```

```powershell
cd backend
```

```powershell
wrangler login
```

```powershell
wrangler secret put GEMINI_API_KEY
```

Paste your Google AI Studio key when prompted. It is stored in Cloudflare, not in git.

```powershell
wrangler deploy
```

Wrangler prints a URL like `https://navcontinuity-analyst.<you>.workers.dev`. Then build the page with that URL:

```powershell
cd ..\a6; $env:AI_ENDPOINT="https://navcontinuity-analyst.<you>.workers.dev"; node demo.mjs; node publish.mjs
```

Commit `docs/` and push.

Optional: run `wrangler secret put GEMINI_MODEL` to change the model (default `gemini-2.5-flash`).

## Safety

- Only `https://rehancodes-web.github.io` and `http://localhost:8080` may call the Worker (`ALLOWED_ORIGINS` in `worker.js`).
- Questions are capped at 600 characters and context at 12 kB.
- Never commit a key. If a key is ever pasted into a file or chat, rotate it in Google AI Studio.
