# Start here (for people and AI agents)

Read [README.md](README.md) first. It holds the idea: **GPS failure around an airport → diversion capacity → confirmed passenger recovery.** Then read [RULES.md](RULES.md) for what the judges require.

## Current status

| Piece | State | Where |
|---|---|---|
| Track A6: Jewar airport from Sentinel-2 (compulsory) | **Done.** Baseline curve, decision, readiness hand-off, and **Larper** (Random Forest, 71.4% agreement with WorldCover) on all 79 months. The page plots Larper converted land (built + bare); built-only is noisy | `a6/`, `data/` |
| Nemotron (NVIDIA) analyst and Larper review | Code done and deployed. **Blocked:** the Vercel variable `NEMOTRON_API_KEY` must be an `nvapi-…` key from build.nvidia.com | `api/analyst.mjs`, `a6/nemotron_review.mjs` |
| Demo site | **GitHub Pages** serves `docs/` from `main` (Vercel deploys are rate-limited for 24 h and its copy is stale; don't use it). Pages: `index.html` overview (A6, B3, C), `a6.html` Jewar (built by `a6/demo.mjs` + `a6/publish.mjs`), `globe.html` (Track B3: real satellites, all airports, before/after; embeds `earth.html`), `c.html`, `passengers.html`. The menu on every page comes from `node site_nav.mjs`. The Nav Integrity page (`b3.html`) and labelling page were removed from the site. The live Nemotron chat needs a server, so it doesn't work on Pages; the pre-built review does | [rehancodes-web.github.io/Mack.1](https://rehancodes-web.github.io/Mack.1/) |
| Track C: GNSS Watch (GPS malfunction detection) | **Presented** (team decision 06:30, 26 Nov). Done on a one-day sample: real ADS-B integrity reports (ADS-B Exchange samples, 1 Nov 2026, 72 snapshots) rated per 1° cell; hotspots on the India–Pakistan border and Myanmar; Jewar region **normal** | `c/`, [c.html](https://mackathon-three.vercel.app/c.html) |
| Track B3: LEO navigation layer | **Presented on the globe** (Nav Integrity page removed). LEO link budget (19 dB, jammer area 80× smaller), 114-sat constellation ~$445M, spoofing simulation (50 m → 8 m after correction) | `b3/`, [globe.html](https://rehancodes-web.github.io/Mack.1/globe.html) |
| Track choice | **Decided: A6 (compulsory) + C + B3**, told as one GPS chain: C detects where GPS fails → A6 shows which airport absorbs diversions → B3 hardens positioning. Risk: organisers said "choose 1" of B or C; confirm with an organiser if possible | [RULES.md](RULES.md) |
| Passenger impact | **Page done** (`docs/passengers.html`): GPS failure → delays/diversions → what passengers face → airline costs → how we recover them. Recovery flow itself is spec only | [PRODUCT_SPEC.md](PRODUCT_SPEC.md) |
| PPT (compulsory, 5 min) | **The deck: 16 slides structured on the judges' marking scheme**; every slide header names its rubric line and marks. Style follows the team's earlier SAP/CropTwin decks (off-white slides, dark cover/close, running header, stat cards with sources). Also live as an interactive deck: `docs/deck.html` (arrow keys, N for timed notes). Built from `pitch/slides/build.mjs` (numbers read from repo outputs) → `render.ps1` (headless Edge, 2x PNG) → `pack.cjs`. Rebuild: `cd pitch && npm install && node gnss_map.js && node slides/build.mjs && powershell -File slides/render.ps1 && node slides/pack.cjs`. The older `FlyWithEase_Hackathon.pptx` is superseded | `pitch/FlyWithEase_Pitch.pptx` |
| Judging material | **Moved into the deck** (site keeps only the product: Overview, Jewar, GPS map, Globe, Passengers, Deck). Tech, AI, feasibility and scorecard pages were removed | `pitch/slides/build.mjs` |
| Nemotron two-pass brief | `node decisions/brief.mjs`: Nemotron fuses Track C + A6 into a Delhi diversion brief, a second Nemotron call fact-checks it → `decisions/nemotron_brief.json` (shown in the deck) | `decisions/` |

## Next tasks, in order

1. Finish A6: `cd a6 && node classify.mjs && node economics.mjs && node readiness.mjs && node nemotron_review.mjs && node demo.mjs && node publish.mjs`, then commit `a6/outputs` and `docs/`, and push.
2. Track C improvements: more days (`cd c && node fetch.mjs 2026/10/01 20 && node analyze.mjs && node page.mjs`), a preparation-cost decision for an airline, optionally satellite GNSS data (CYGNSS) as a second source. Protective use only (R6).
3. Passenger recovery demo: a replay of a GPS-caused diversion with **synthetic, clearly labelled** passengers. Show status → options → confirmed or failed rebooking, care and bag. Follow the "Acceptance criteria" in PRODUCT_SPEC.md.
4. PPT and a recorded demo fallback.

## Rules for working in this repo

- **Node.js only.** Python is not installed on the main laptop.
- **Never commit keys.** AI keys live only in Vercel environment variables.
- Label every number as `reported`, `derived` or `assumed`. Never present illustrative economics as real savings.
- Land conversion is not construction completion.
- Larper training is pure JavaScript and slow (about 20+ min). Training samples are cached in `a6/cache/`; don't delete that folder casually.
- Sentinel-2 gotchas (scale and offset per collection, CRLF, large window fetches) are in [data/README.md](data/README.md).
- Push to `main` redeploys the live site. Check the page after pushing.
