# NavContinuity

**When GPS fails around an airport, get every passenger to a confirmed outcome.**

Mach-A-Thon Aeromania '26 · Orbit to Economy: AI in Space · with Boeing

## The problem

GPS jamming and spoofing are now routine in aviation, and India is affected:

- IATA: reported GNSS interference **up 175%** and GPS spoofing **up 500%** in 2024 vs 2023.
- India told Parliament it had **2,354 GPS interference incidents** (Nov 2023 – Dec 2025), plus **623** in Jan–Feb 2026.
- **Delhi, 2025:** flights approaching IGI Runway 10 on GPS-based procedures were **spoofed**. Contingency procedures were used, and DGCA introduced real-time spoofing reporting.

When navigation degrades, flights are delayed, rerouted or diverted. Passengers then face the familiar chain: repeated "15 more minutes" announcements, missed connections, bad automatic rebooking, hotel vouchers in the wrong city, and bags on a different route.

Sources and figures: [research/gps-navigation-failures.md](research/gps-navigation-failures.md). Passenger evidence: [research/passenger-experience.md](research/passenger-experience.md).

## The idea

```
satellite evidence  →  GPS-risk warning  →  which airports can absorb diversions
     →  flights and passengers at risk  →  recovery options  →  confirmed passenger outcome
```

1. **Detect:** satellite and reported evidence that GPS is degraded in a region (protective monitoring only).
2. **Absorb:** know which nearby airports and runways physically exist and can take diverted flights. Example: the new **Noida International Airport (Jewar)**, about 70 km from Delhi IGI, watched from orbit.
3. **Recover:** rank recovery actions and walk each passenger to a **confirmed** result: honest status and next-update time, a real rebooking, care at the right city, and the bag's last confirmed scan.

## How it maps to the hackathon tracks

| Track | Our part | Status |
|---|---|---|
| **A6 Infrastructure** (compulsory) | Sentinel-2 monitoring of **Jewar airport** 2020–2026, showing when it physically became a usable diversion and recovery airport. **Larper**, our Random Forest model, labels every 10 m pixel (built/paved, bare, vegetation, water). **NVIDIA Nemotron** audits Larper's maps against the photos and writes the analyst memo. Economic decision: inspect or release funding vs reported progress | **Working on real data** |
| **C GNSS resilience** (the one optional track) | GPS-degradation evidence for the Delhi/Jewar region, turned into a risk level the recovery flow can act on. Protective only: no locating transmitters, no tracking people | To build |
| **Customer experience** (who pays) | Passenger recovery flow: status, rebooking, care, bags. **Airlines pay**: a diversion costs €1,000–77,200 (EUROCONTROL), a block minute about $98 (A4A 2025) | Specified |

Rules allow only one of Track B or C, so we present A6 + C. Full rules: [RULES.md](RULES.md).

## What is built

- **Live demo:** [mackathon-three.vercel.app](https://mackathon-three.vercel.app). It has before/after satellite images, the baseline and Larper progress curves, Larper's accuracy, the decision with sliders, the hand-off to the GPS story, and the Nemotron analyst.
- **Results so far (derived, Sentinel-2):** land conversion at Jewar starts mid-2023 and peaks at about 56% in April 2025. In Jan 2025 it was about 51% against a reported "80% complete". This measures land conversion, not completion.
- **Larper:** agrees with ESA WorldCover on about 71% of held-out pixels (built/paved recall 89%, bare 28%). WorldCover is itself a model, so this is agreement, not ground truth.

## Repository

| Path | What |
|---|---|
| [a6/](a6/README.md) | Track A6 pipeline: `progress.mjs` (baseline), `classify.mjs` (Larper), `nemotron_review.mjs`, `economics.mjs`, `readiness.mjs`, `demo.mjs`, `publish.mjs` |
| [data/](data/README.md) | Jewar footprint and the 79-scene Sentinel-2 manifest |
| `api/analyst.mjs` | Vercel function for Nemotron. The key is the `NEMOTRON_API_KEY` Vercel variable, never stored in the repo |
| `docs/` | Built demo page served by Vercel |
| [PRODUCT_SPEC.md](PRODUCT_SPEC.md) | Passenger-recovery product spec |
| [research/](research/) | GPS failure evidence and passenger evidence |

Run Track A6: `cd a6 && npm install && node progress.mjs && node classify.mjs && node economics.mjs && node readiness.mjs && node nemotron_review.mjs && node demo.mjs && node publish.mjs`, then push to `main` (Vercel redeploys).

## Honesty rules

- Every number is labelled **reported**, **derived** (satellite or Larper) or **assumed** (economics).
- Land conversion is not construction completion, and a satellite image cannot prove an aircraft lost GPS.
- Never say a passenger is rebooked until the airline system confirms it.
- All cost figures are illustrative until tested with an airline.
