# Mach-A-Thon Aeromania '26 — Consolidated Rules

**Event:** Orbit to Economy: AI in Space · 12-hour hackathon · in collaboration with Boeing
**Sources:** event deck (`Mach-A-Thon_Aeromania_26.pptx`, 5 slides) + organiser messages at 9:15 pm and 9:36 pm.
**Precedence:** where sources conflict, the **9:36 pm "IMPORTANT UPDATE"** wins, then the 9:15 pm message, then the deck.

---

## 1. Track structure (what you must pick)

| Rule | Status | Source |
|---|---|---|
| R1. Pick **at least 1 objective from Track A**. This is your **primary problem** and it must be **completed**. | **Compulsory** | 9:15 pm, 9:36 pm |
| R2. You may additionally take **one** optional track: **Track B or Track C** ("Choose 1"). | Optional | 9:36 pm |
| R3. If you take an optional track, **all of its objectives are expected to be met** — no half-done add-ons. | Required if taken | 9:36 pm |
| R4. **Track B:** of its 3 subheadings, **at least 1 must be completed**. | Required if B taken | 9:36 pm |
| R5. Primary problem and optional track may be **merged into one product or presented separately**, but there **must be a flow** linking them. How (and whether) to integrate is the team's choice. | Required | 9:36 pm |

### Track A — Read the Planet (data + AI) · *compulsory*
Pick satellite data and turn it into an **economic decision**. Your primary objective must be one of these six:
1. **Migration & urbanization** — detect growth early so cities can plan housing, transport, services
2. **Renewable siting** — rank land for solar/wind using irradiance, slope, land use, grid distance
3. **Agriculture** — predict crop yield and stress for credit and insurance
4. **Economic activity** — estimate activity from night lights where official data is missing
5. **Disaster risk** — price risk and assess damage fast after floods, fires, cyclones
6. **Infrastructure** — monitor construction and asset progress from orbit

### Track B — Build the Orbit (systems + concepts) · *optional, no dataset needed*
Complete **≥ 1 subheading**:
- **B1. Space debris & satellite life extension** — servicing/refuel/re-boost tugs that also deorbit dead sats; in-orbit recycling; AI collision avoidance & debris tracking; low-cost deorbit kits + "debris credit" market; satellite health prediction
- **B2. Hazardous waste & environment** — satellites + HAPS to detect illegal dumping, landfill methane, toxic plumes; oil-spill/chemical discharge tracking; early warning for tailings dams & waste-site collapse; satellite → HAPS → drone evidence pipeline
- **B3. Positioning & sensing** — better GPS via LEO augmentation or AI correction of positioning errors; onboard AI that downlinks insights, not raw images

### Track C — Guard the Nation (security, law & order, sovereignty) · *optional*
Maritime awareness (dark vessels, illegal fishing, smuggling) · borders & remote areas (unusual activity, new roads/construction) · enforcement (illegal mining, sand mining, deforestation + evidence) · **GNSS resilience** (detect GPS jamming/spoofing; build on India's NavIC) · sovereign capability (Indian-built pipelines, onboard AI) · critical infrastructure (pipelines, power lines, ports) · crowds & emergencies.

> **R6. Track C hard rule:** solutions must be **protective** (monitoring, early warning, evidence, resilience). **No weapons, no targeting, no tracking of individual people.**

---

## 2. What each track must deliver (deck, slide 4)

| Track | Minimum deliverable |
|---|---|
| A | **A working demo on real data** |
| B | A **simulation, prototype, or solid architecture** with **back-of-envelope cost and physics** |
| C | Either of the above, **within the protective-use rule** |
| **All** | Answer: **who pays for this, and how much is it worth?** |

**Starter datasets** (any dataset is allowed): Sentinel-1/2 · Landsat · VIIRS night lights · NASA POWER (solar radiation) · GHSL (urbanization) · ESA WorldCover · ISRO Bhuvan · OpenStreetMap · AIS vessel data · public debris catalogues (e.g. CelesTrak).

---

## 3. Presentation and judging

- **R7.** Every team must make a **small PPT** explaining **what was actually accomplished** within the hackathon timeframe. (9:15 pm)
- **R8.** Boeing representatives arrive at **8:00 AM**; each team gets **5 minutes only**. Scoring is entirely at their discretion.

| Criterion | Weight |
|---|---|
| Economic / strategic impact | 30% |
| Technical depth & AI use | 30% |
| Feasibility | 20% |
| Demo & pitch | 20% |

"Strategic" covers Track C, where value is national security rather than revenue.

---

## 4. Submission checklist

- [ ] Named **Track A objective** (one of the six above) — written on slide 1 of the PPT
- [ ] **Working Track A demo on real satellite data** (named dataset, region, time window)
- [ ] An **economic decision** the Track A output drives
- [ ] (If taken) **One** of Track B / Track C chosen, with every objective of it met
- [ ] (If Track B) at least one subheading fully done, with cost + physics estimates
- [ ] (If Track C) protective-use rule satisfied; no tracking of individuals
- [ ] A clear **flow** from primary problem → optional track (merged or separate)
- [ ] **Who pays, and how much it's worth** — answered explicitly
- [ ] Small PPT of what was accomplished, rehearsed to **≤ 5 minutes**
- [ ] Demo runs from a clean launch before 8:00 AM, with a recorded fallback

---

## 5. Our chosen structure

> **Superseded by v2.0 ([TRACKS.md](TRACKS.md)):** the project is now navigation failure + passenger experience, with A6, B3 and C each mapped to it. The v1.1 table below is kept for history.

### v1.1 (NavContinuity brief)

Decided after the 9:36 pm update. Version 1.0 of the brief put GNSS receiver data under Track A, but GNSS isn't one of the six Track A objectives, so the plan was restructured:

| Part | Track | What it is |
|---|---|---|
| **Primary (compulsory)** | **A6 Infrastructure** | Sentinel-2 construction-progress monitoring of **Noida International Airport, Jewar** (2020–2026, see `data/README.md`); drives a lender/owner decision: release the tranche on the contractor's report or commission an inspection |
| **Optional (one only)** | **C: GNSS resilience + critical infrastructure** | The original NavContinuity work: satellite evidence of GNSS degradation in the asset's region, plus a preparation-cost decision. Protective use only |
| **Flow** | A6 → C | A6 outputs the asset, footprint, region and readiness date; C asks whether that region's navigation environment is degraded and what preparation is worth paying for |
| **Dropped** | (would be B) | Orbital task-planning extension, now post-event backlog, so only one optional track is presented |

Checkpoints: the A6 demo must run end to end on real data by **hour 5**. If any Track C objective is unmet by **hour 9**, drop Track C from the pitch rather than show it half-done (R3).

---

## 6. Open questions to confirm with organisers

- **"Choose 1"**: is it *at most one* of B/C, or is doing both allowed for extra credit?
- **R3 vs R4**: "all objectives met" vs "minimum 1 of 3 subheadings" for Track B. Our reading: complete at least one subheading fully, and don't leave any claimed objective half-done.
- Confirm that **A6 Infrastructure as primary + Track C as optional** is acceptable as framed in Section 5. We chose the stricter reading, that the primary must be one of the six listed bullets.
- PPT format: any slide limit, template, or submission deadline/location before 8:00 AM?
