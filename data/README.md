# Track A6 asset and Sentinel-2 access

Checked live on 25 Nov 2026. Everything below was tested from this machine unless marked *untested*.

## Chosen asset: Noida International Airport (Jewar), Uttar Pradesh

| Field | Value | Evidence label |
|---|---|---|
| Asset | Noida International Airport, Jewar, Gautam Buddha Nagar (phase 1: one runway, one terminal, ~12 M passengers/yr) | verified (news) |
| Footprint | `noida_airport_footprint.geojson`: OSM way 1089989191, 70 vertices, **≈ 1334 ha** | observed (OSM, ODbL) |
| Bounding box | lon 77.5750 to 77.6414, lat 28.1565 to 28.1854 | observed |
| Sentinel-2 tile | **43RGM** (relative orbit 105), which covers the whole footprint | observed |
| Before state | Farmland (strong vegetation signal), good for a clean change curve | proposed, check in first images |
| Works began | Site works reported from Aug 2021; foundation stone laid **25 Nov 2021** | verified (news) |
| Reported milestones (store as `reported`, never as truth) | Opening first targeted for Sep 2024 → "80% complete, April 2025 launch" (Jan 2025) → inauguration announced for 30 Oct 2025 → **phase 1 inaugurated 28 Mar 2026** → commercial flights reported for mid-2026 (sources disagree on the exact date) | reported |

**Why Jewar and not Navi Mumbai:**
- **Change signal:** Jewar went from farmland to runway, which is easy to see in the images. Navi Mumbai involved hill cutting and land reclamation, which is harder to read.
- **Clouds:** the Delhi region has far fewer cloudy months than Mumbai's monsoon.
- **Built-in story:** the repeatedly missed opening dates are the exact "contractor report vs satellite" gap the A6 decision is about.

Navi Mumbai (commercial operations from 25 Dec 2025) stays as a backup site.

Footprint caveat: the OSM outline is the **finished** airport boundary. Use it as the evaluation area for every date, and say so on the slide.

## Sentinel-2 access: three working routes

| Route | Account? | Tested | Use it for |
|---|---|---|---|
| **Element 84 Earth Search** `https://earth-search.aws.element84.com/v1` | **No** | Search ✔, anonymous COG download ✔ (HTTP 200) | **Primary.** Cloud-optimised GeoTIFFs, so you can read just the footprint window without downloading whole tiles |
| **Microsoft Planetary Computer** `https://planetarycomputer.microsoft.com/api/stac/v1` | No (free SAS token, auto-issued) | Search ✔, token endpoint ✔ | Backup, has 2022 scenes. Needs `planetary_computer.sign()` on asset URLs |
| **Copernicus Data Space (CDSE)** `https://stac.dataspace.copernicus.eu/v1` | **Yes** for downloads (free account) | Search ✔ | Official source, reprocessed baseline N0500. The forum reported STAC gaps and 500 errors in mid-2026, so don't depend on it on the night |

Collections: `sentinel-2-c1-l2a` (Earth Search Collection 1: reprocessed to one processing baseline, **preferred**), `sentinel-2-l2a` (older; same id on Planetary Computer and CDSE).

### Two gotchas found while testing

1. **Earth Search Collection 1 has holes over this tile: Apr to Nov 2022 is missing,** which is the middle of construction. The script fills those months from `sentinel-2-l2a`. Planetary Computer and CDSE both have those months too.
2. **Offset (checked against pixel values, 26 Nov):** reflectance = DN × `scale` + `offset`, using the manifest columns.
   - **Collection 1 (`sentinel-2-c1-l2a`):** every scene has offset −0.1, which means subtracting 1000 DN.
   - **Older `sentinel-2-l2a`:** the metadata *claims* −0.1 from baseline 04.00, but its files are already de-offset. August 2022 red values sit around 240–580 DN, whereas Collection 1 values for the same kind of ground run 1500–2300. So the manifest forces offset 0 for this collection. Applying the metadata offset produced NDVI above 1 in the first run.
   - Don't trust `raster:bands` blindly: check a scene's DN levels.

`eo:cloud_cover` is for the whole tile, not the footprint. Still apply the SCL mask per pixel (classes 3 shadow, 8/9 cloud, 10 cirrus) and record the clear fraction of the footprint per date.

## Files here

| File | What it is |
|---|---|
| `noida_airport_footprint.geojson` | Footprint polygon, with source and licence in its properties |
| `nominatim_noida_airport.json` | Raw OSM lookup response (provenance) |
| `build_manifest.js` | Rebuilds the manifest: `node build_manifest.js 2020-01-01 2026-11-25 40` |
| `s2_monthly_manifest.csv` | **79 monthly scenes, Jan 2020 to Nov 2026**, the lowest-cloud scene per month (≤ 40% tile cloud), with direct COG URLs for B02, B03, B04, B08, B11, B12 and SCL. 68 from C1, 11 gap-filled from the older collection (marked by collection column). Missing months are monsoon gaps (e.g. 2021-07, 2025-07/08): show them as gaps |

## Dashboard imagery

The five [Sentinel-2 quick-looks](../a6/outputs/imagery_index.json) share a 10 m grid in EPSG:32643. The index records each PNG, scene ID, UTC acquisition time, dimensions, and projected bounds for alignment on a map. The yellow footprint outline comes from OpenStreetMap. The [January 2025 crop](../a6/outputs/quicklook_2025-01.png) uses the acquisition on 28 January 2025 and pairs with the January funding scenario. Source band URLs and scene classification layers are in the monthly manifest.

Sentinel-2 and the OSM footprint cover the site-scale historical replay. ESA WorldCover 2021 is an input to the optional classifier, not a dated airport milestone map. Work-package boundaries, dated milestone plans, and inspection records would need to come from the project owner for milestone-level verification.

## Sources

- Opening timeline: [Business Standard, Jan 2025 "80% complete"](https://www.business-standard.com/india-news/noida-s-jewar-airport-on-track-for-april-launch-80-per-cent-work-complete-nc-125012800369_1.html) · [Business Today, Sep 2025 (30 Oct target)](https://www.businesstoday.in/india/story/noida-international-airport-at-jewar-to-open-on-october-30-with-commercial-flights-starting-soon-494534-2025-09-18) · [Business Today, 27 Mar 2026](https://www.businesstoday.in/india/story/jewar-airport-opening-on-march-28-what-makes-noida-international-airport-special-522692-2026-03-27) · [All India Radio, 28 Mar 2026 inauguration](https://www.newsonair.gov.in/pm-modi-inaugurates-noida-international-airport-phase-i-at-jewar/) · [Outlook Traveller, commercial flights](https://www.outlooktraveller.com/amp/story/News/noida-international-airport-to-begin-commercial-flights-on-june-15)
- Foundation stone and area: [PIB, Nov 2021](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2021/nov/doc2021112381.pdf) · [Tribune, 25 Nov 2021](https://www.tribuneindia.com/news/nation/modi-lays-foundation-stone-of-noida-international-airport-342638) · [Hindustan Times, Aug 2021 works begin](https://www.pressreader.com/india/hindustan-times-patiala/20210827/281805697021051) · [Airport Technology](https://www.airport-technology.com/?p=61746)
- Navi Mumbai backup: [Business Standard, 25 Dec 2025](https://www.business-standard.com/industry/aviation/navi-mumbai-airport-adani-flight-operations-indigo-aviation-125122500119_1.html)
- Data access: [Planetary Computer S2 L2A](https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-2-l2a) · [CDSE STAC docs](https://documentation.dataspace.copernicus.eu/APIs/STAC.html) · [CDSE STAC L2A gap thread](https://forum.dataspace.copernicus.eu/t/stac-catalogue-missing-sentinel-2-l2a-data-since-2026-06-11/5216) · [AWS registry, Sentinel-2](https://registry.opendata.aws/sentinel-2/)
