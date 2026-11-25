# A6 baseline: Jewar construction-progress curve

Track A6 (Infrastructure), baseline v2. Built from real Sentinel-2 L2A data. No Python needed: it runs on Node.js only.

## Run

```powershell
cd a6
npm install
node progress.mjs        # reads ../data/s2_monthly_manifest.csv, fetches footprint windows, writes outputs/progress_baseline.{csv,json}
node chart.mjs           # writes outputs/progress_chart.html
node quicklook.mjs 2020-03 2022-05 2024-03 2026-03   # true-colour PNGs with the footprint outline
```

The first run fetches about 79 × 4 small windows from public AWS cloud-optimised GeoTIFFs and takes about 15 minutes. Results are cached in `cache/`, so delete it to refetch. To refresh the scene list, run `node ../data/build_manifest.js`.

## Method (baseline v2)

| Step | What happens |
|---|---|
| Area | OSM airport footprint (≈ 1334 ha) on the 10 m UTM 43N grid of tile 43RGM. **Reference ring:** footprint bounding box expanded 1.5 km, minus the footprint and a 300 m buffer around its box |
| Scaling | Reflectance = DN × scale + offset, read per scene from STAC `raster:bands` (offset −0.1 on baseline ≥ 04.00) |
| Masking | Scene classification (SCL) classes 0, 1, 3, 8, 9, 10 removed per pixel. A date with < 60% clear footprint is a **gap**, not a value |
| Instant index | NDVI from B08/B04 and NDBI from B11/B08 (B11 20 m mapped to 10 m), median per area; share of clear pixels with NDVI < 0.25 |
| **Progress metric** | **Cleared-12m:** share of pixels whose **max NDVI over the trailing 12 months, July–September excluded,** stays < 0.30, needing ≥ 3 clear looks and ≥ 5 scenes in the window. Farmland greens up at least once a year, so it never counts. A cleared or paved site never greens, so it does |
| Control | The same metric on the reference ring shows what "no construction" looks like in the same weather and crop calendar |

All parameters are in `PARAMS` at the top of `progress.mjs` and are copied into the JSON output.

## Results

Run of 26 Nov 2026, baseline v2: 79 scenes, footprint 133,297 px (1333 ha), reference ring 319,333 px. Files: `outputs/progress_baseline.csv` / `.json`, `outputs/progress_chart.html` / `.png`, `outputs/quicklook_*.png`.

| Period | Footprint cleared-12m | Ring (control) | Reading |
|---|---|---|---|
| 2020 to early 2023 | 2–8% | 4–5% | Still farmland or fallow, same as the surroundings |
| Jun 2023 | 11% | 4% | **First clear departure from the control** |
| Dec 2023 | 29% | 4% | Main earthworks |
| May 2024 | 37% | 5% | |
| Dec 2024 | 52% | 6% | |
| Apr 2025 (peak) | **56%** | 7% | Around the reported "80% complete" claim (Jan 2025) and the April 2025 target |
| Mar 2026 (inauguration) | 48% | 6% | |
| Nov 2026 | 33% | 6% | Falling: unpaved airside grass and landscaping re-green after the 2026 monsoon |

**What it says (derived, with the caveats below):**
1. **Late start:** large-scale land conversion shows in the data from **mid-2023**, not from the 2021 groundbreaking. The 2021–22 "works begun" period is invisible at this scale: the site sat as fallow, scrub-covered land. Compare `quicklook_2022-05.png` with `quicklook_2024-03.png`.
2. **Peak:** conversion peaked at about 56% of the footprint in spring 2025, then levelled off. That is consistent with earthworks being done while opening targets kept slipping.
3. **Not a completion percentage:** the post-2025 fall is the metric's limit. Finished but unpaved areas grow grass. The next step, the bare/built/paved classifier, is needed to separate "graded earth" from "runway and terminal" and to stop re-greening reading as negative progress.

**Fixed during the build:** the first run applied the STAC offset (−0.1) to older-collection scenes whose files are already de-offset, which gave NDVI above 1 in mid-2022. The manifest now forces offset 0 for that collection, after checking DN levels. A first version of the metric also counted monsoon grass, so v2 excludes July–September.

## Limitations (say these on the slide)

- **What it measures:** land conversion (vegetation gone all year), **not** building completion. A finished runway and a bare graded field look the same on this metric. The classifier step (bare vs built or paved) is the next piece of work.
- **What stays "not cleared":** grass, scrub and ponds that remain inside the airport, so the plateau is below 100%.
- **Footprint:** the OSM outline is the finished boundary, applied to every date.
- **Edge pixels:** 10 m pixels on the outline are counted whole.
- **Mixed collections:** 11 months come from the older `sentinel-2-l2a` collection. Scaling is handled per scene, but small radiometric differences remain.
- **Thresholds:** 0.25 and 0.30 are judgement calls, not tuned on labels. Check sensitivity before quoting a number.
