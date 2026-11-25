# Plan of action: Mach-A-Thon, 26 Nov 2026

**Now:** 00:30 · **Judging:** 08:00, 5 minutes per team, Boeing judges · **Time left:** about 7.5 h
**Rules recap:** Track A objective compulsory with a real-data demo (ours is **A6**, done at baseline). Optional track: one of B or C, and **all its objectives must be met if shown**. Every team answers "who pays, how much is it worth?" and brings a small PPT. See [RULES.md](RULES.md).

## Where we stand

| Piece | Status |
|---|---|
| Rules consolidated | ✅ `RULES.md` |
| Asset chosen (Jewar airport), footprint, 79-month Sentinel-2 manifest | ✅ `data/` |
| A6 baseline progress curve on real data + chart + before/after images | ✅ `a6/` |
| A6 **AI model** compared with the baseline | 🟡 **code done, results pending**: `a6/classify.mjs` (Random Forest, WorldCover 2021 weak labels, spatial holdout). Was mid-run at the last commit; outputs not committed yet |
| A6 **economic decision** (release vs inspect) wired to the curve | ✅ `a6/economics.mjs`: tests pass (`node economics.mjs --test`); real case gives 80% reported vs 51% satellite → gap 29 pts → **INSPECT** → `outputs/decision.json` |
| One offline demo page | 🟡 **code done**: `a6/demo.mjs` builds `outputs/demo.html`. Needs classifier outputs first |
| Track C module (GNSS evidence + preparation decision) | ❌ optional; only show it if fully done |
| PPT | ❌ **compulsory** |
| Demo rehearsal, offline fallback | ❌ |

## Handoff: read this first (updated ~01:15)

**Next steps, in order:**
1. `cd a6 && npm install` (adds `ml-random-forest`).
2. `node classify.mjs`
   - **What it does:** trains on 3 scenes from 2021, then classifies all 79 months.
   - **Time:** about 20–30 min. Per-month results cache in `a6/cache/`, so a rerun resumes.
   - **Writes:** `outputs/classifier_metrics.json`, `outputs/progress_ai.{csv,json}`, `outputs/classmap_{2020-03,2022-05,2024-03,2026-03}.png`.
   - **Check:** overall accuracy and per-class recall in the metrics file. If "bare" has tiny support, say so on the slide.
   - **Check:** does the AI built/paved curve avoid the baseline's post-2025 dip? Report honestly either way.
3. `node economics.mjs` (already run once; rerun if `progress_baseline.json` changes).
4. `node demo.mjs` → open `outputs/demo.html`. This is the 5-minute demo page: images → curves → AI metrics → decision with sliders → who pays.
5. Commit the outputs, then go to P1 (PPT) below.

**Pitfalls already hit (don't repeat):**
- **Scale and offset:** reflectance = DN × `scale` + `offset` from the manifest. The older `sentinel-2-l2a` collection is already de-offset, so the manifest forces offset 0 for it. See `data/README.md`.
- **Line endings:** CRLF checkouts broke CSV parsing; scripts now strip `\r`, and `.gitattributes` pins LF.
- **Network:** large COG windows fail when fetched in parallel; `classify.mjs` reads bands one at a time with retries.
- **Shell:** in Git Bash on this machine, long `sed`/`node -e` one-liners in the repo folder sometimes hang; prefer files or PowerShell.
- **Python:** not installed on the main laptop; everything runs on Node.js.

**Key numbers for the pitch** (baseline, derived):
- Land conversion starts **mid-2023**.
- It peaks at **56% (Apr 2025)**.
- It was **51% in Jan 2025** against the reported **80%**.
- It is down to **33% (Nov 2026)** as grass regrows.

## Priorities (do in this order; stop lower items if time runs short)

### P0: must have (A6 complete), target 04:00

1. **AI classifier (bare / built-paved / vegetation)**, owner: data person, about 2 h
   - Train a Random Forest on per-pixel features (B02–B12 reflectance, NDVI, NDBI, a bare-soil index), using ESA WorldCover 2021 (built-up / bare / cropland) as weak labels, from **outside** the footprint.
   - Predict per month inside the footprint → "built/paved %" and "bare %" curves.
   - Validate: held-out area and dates; hand-label about 200 pixels on the 2026-03 quick-look (runway, terminal, bare, grass); report agreement.
   - Compare against the NDVI baseline (does it fix the post-2025 re-greening dip?). Report honestly either way.
   - Python isn't installed on the main laptop: use a teammate's Python (scikit-learn), or Node (`ml-random-forest`). The manifest gives direct band URLs either way.
2. **Economic decision module**, owner: business person, about 1 h, can start now
   - `a6/economics.mjs`: expected cost with and without inspection, break-even p*, and the three cases from the brief (no data → inspect; agrees → skip; lags → inspect). Unit-test 30000/18000, 9000/15900, 120000/27000, p* = 0.0556.
   - Feed it the real gap: reported "80%" (Jan 2025) vs satellite ≈ 51% → "lags" → inspect. Label every probability and cost as **assumed**.
   - One slider/table showing the decision flip at break-even.
3. **One demo page**, owner: integration person, about 1 h
   - A single local HTML page: before/after images → progress chart (baseline + AI) → reported milestones → decision panel. Works offline from `a6/outputs/`.

### P1: should have, target 06:00

4. **Who pays / how much slide content**, about 30 min: buyer = lenders, infrastructure funds, government project-monitoring cells (and the airport owner); price as a per-asset monitoring fee; worth = inspections avoided plus losses caught (illustrative). State that pricing is unvalidated.
5. **PPT, about 6 slides**, about 1 h. It is compulsory:
   1. Title: "Primary: Track A6 Infrastructure · Optional: Track C GNSS resilience" + team
   2. Problem + buyer (tranches released on contractor reports)
   3. Real data: Jewar, Sentinel-2, before/after images
   4. Results: progress curve, baseline vs AI, "80% claimed vs about 51% observed"
   5. Decision + economics: inspect vs release, break-even, who pays
   6. Flow to Track C + limitations + what we achieved tonight

### P2: only if P0 and P1 are done by 06:00

6. **Track C module.** All objectives must be met if shown (RULES R3), so the realistic minimum is: parse one real CYGNSS or Sentinel-1 GNSS sample for the Jewar region (CYGNSS covers ±38°, India included) → coverage + simple anomaly baseline → preparation-cost scenario linked to the airport. **If it isn't complete by 06:30, drop it from the pitch** and show it as a one-line "next step" on the flow slide.

### Final: 06:30–08:00

7. Clean-launch run of the demo; screenshots and screen recording as a fallback (label it "recorded").
8. Rehearse to **≤ 5 minutes**, with timed speakers. Prepare answers: "why satellites?", "what does AI add?", "who pays?", "is this already solved?"
9. Freeze. Only critical fixes after 07:30.

## Owners (fill in)

| Role | Person | Items |
|---|---|---|
| Data / AI | | 1 |
| Business / economics | | 2, 4 |
| Integration / demo | | 3, 7 |
| Pitch / PPT | | 5, 8 |
| Track C (if time) | | 6 |

## Open items to confirm with organisers

- That A6 primary plus Track C optional (or A6 alone) is acceptable.
- PPT format or submission deadline before 08:00.

## Claims we can make, and ones we can't

- ✅ "We processed 79 Sentinel-2 scenes (2020–2026) over the 1333 ha Jewar footprint; land conversion starts mid-2023 and peaks at about 56% in April 2025."
- ✅ "Around the reported '80% complete' date, satellite-observed land conversion was about 51%: a gap that, under our assumed costs, makes inspection worthwhile."
- ❌ "The contractor lied" / "the project was 51% complete." The metric measures land clearing, not completion.
- ❌ Any savings figure presented as real. All economics are illustrative.
