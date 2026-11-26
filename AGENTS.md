# Start here (for people and AI agents)

Read [README.md](README.md) first. It holds the idea: **GPS failure around an airport → diversion capacity → confirmed passenger recovery.** Then read [RULES.md](RULES.md) for what the judges require.

## Current status

| Piece | State | Where |
|---|---|---|
| Track A6: Jewar airport from Sentinel-2 (compulsory) | **Done.** Baseline curve, decision, readiness hand-off, and **Larper** (Random Forest, 71.4% agreement with WorldCover) on all 79 months. The page plots Larper converted land (built + bare); built-only is noisy | `a6/`, `data/` |
| Nemotron (NVIDIA) analyst and Larper review | Code done and deployed. **Blocked:** the Vercel variable `NEMOTRON_API_KEY` must be an `nvapi-…` key from build.nvidia.com | `api/analyst.mjs`, `a6/nemotron_review.mjs` |
| Demo site | Vercel project `mackathon` serves `docs/`, auto-deploys on push to `main` | [mackathon-three.vercel.app](https://mackathon-three.vercel.app) |
| Track C: GNSS Watch | **Not in the pitch: shown only as "next step"** (team decision 05:30, 26 Nov). One-day sample built: Real ADS-B integrity reports (ADS-B Exchange samples, 1 Nov 2026, 72 snapshots) rated per 1° cell; hotspots on the India–Pakistan border and Myanmar; Jewar region **normal** | `c/`, [c.html](https://mackathon-three.vercel.app/c.html) |
| Track B3: Nav Integrity | **The one optional track we present. Done (architecture + simulation).** LEO link budget (19 dB, jammer area 80× smaller), 114-sat constellation ~$445M, spoofing simulation (50 m → 8 m after correction) | `b3/`, [b3.html](https://mackathon-three.vercel.app/b3.html) |
| Track choice | **Decided: A6 (compulsory) + B3 (optional).** Organisers said choose one of B or C, so C appears only as a one-line "next step" on the final slide. Don't add Track C to the demo flow or the PPT body | [RULES.md](RULES.md) |
| Passenger recovery flow | Spec only | [PRODUCT_SPEC.md](PRODUCT_SPEC.md) |
| PPT (compulsory, 5 min) | **Draft done: 7 slides with speaker notes and timings.** Slide 1 names "Primary: Track A6 Infrastructure / Optional: Track B3". Numbers are read from repo outputs. **Not visually checked** (PowerPoint automation unavailable here): open it and fix any overflow. Rebuild: `cd pitch && npm install && node build_deck.js` | `pitch/NavContinuity_MachAThon.pptx` |

## Next tasks, in order

1. Finish A6: `cd a6 && node classify.mjs && node economics.mjs && node readiness.mjs && node nemotron_review.mjs && node demo.mjs && node publish.mjs`, then commit `a6/outputs` and `docs/`, and push.
2. *(After the event; not for the pitch.)* Track C improvements: more days (`cd c && node fetch.mjs 2026/10/01 20 && node analyze.mjs && node page.mjs`), a preparation-cost decision for an airline, optionally satellite GNSS data (CYGNSS) as a second source. Protective use only (R6).
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
