# Start here (for people and AI agents)

Read [README.md](README.md) first. It holds the idea: **GPS failure around an airport → diversion capacity → confirmed passenger recovery.** Then read [RULES.md](RULES.md) for what the judges require.

## Current status

| Piece | State | Where |
|---|---|---|
| Track A6: Jewar airport from Sentinel-2 (compulsory) | Baseline curve, decision and readiness hand-off **done**. **Larper** (our Random Forest) trained, monthly results being regenerated | `a6/`, `data/` |
| Nemotron (NVIDIA) analyst and Larper review | Code done and deployed. **Blocked:** the Vercel variable `NEMOTRON_API_KEY` must be an `nvapi-…` key from build.nvidia.com | `api/analyst.mjs`, `a6/nemotron_review.mjs` |
| Demo site | Vercel project `mackathon` serves `docs/`, auto-deploys on push to `main` | [mackathon-three.vercel.app](https://mackathon-three.vercel.app) |
| Track C: GNSS degradation evidence (the one optional track) | **Not started**, see plan below | (new folder `c/`) |
| Passenger recovery flow | Spec only | [PRODUCT_SPEC.md](PRODUCT_SPEC.md) |
| PPT (compulsory, 5 min, slide 1 names "Track A6 Infrastructure") | Not started | |

## Next tasks, in order

1. Finish A6: `cd a6 && node classify.mjs && node economics.mjs && node readiness.mjs && node nemotron_review.mjs && node demo.mjs && node publish.mjs`, then commit `a6/outputs` and `docs/`, and push.
2. Track C (only pitch it if *all* of it works, rule R3):
   - Get one real satellite GNSS-observation sample covering the Delhi/Jewar region. Candidates: **CYGNSS** (covers about ±38° latitude, so India is included; NASA PO.DAAC, needs a free Earthdata login) or **Sentinel-1 onboard GNSS** data. Confirm coverage from the files themselves.
   - Build a transparent signal-quality baseline and flag anomalies. Report "unknown" where there is no coverage, never "safe".
   - Turn it into a regional risk level for the region in `a6/outputs/readiness.json` (`region`), plus a preparation-cost decision for an airline.
   - Protective use only: no transmitter location, no source attribution, no tracking of people (R6). A satellite anomaly does not prove an aircraft lost GPS.
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
