# Project and track mapping (v2.0)

**Our project: NavContinuity: aviation navigation failure → passenger recovery.**
Navigation failures (GNSS jamming, spoofing, signal loss) cause delays, diversions and cancellations. Passengers then face repeated delay extensions, missed connections, wrong rebooking, misplaced hotel vouchers and lost bags. NavContinuity connects early navigation-disruption evidence to network decisions and a confirmed recovery plan for every affected passenger.

`satellite evidence → navigation-risk forecast → flights at risk → recovery options → confirmed passenger outcome`

Research base: [aviation-navigation-failures-report.md](aviation-navigation-failures-report.md) (safety, India and global interference data, costs) and [RESEARCH.md](RESEARCH.md) (passenger experience). Product: [PRODUCT_SPEC.md](PRODUCT_SPEC.md).

## How the project covers each track

| Track | Objective we take | What NavContinuity builds for it | Status |
|---|---|---|---|
| **A: Read the Planet** (compulsory) | **A6 Infrastructure**: monitor airport construction from orbit | Sentinel-2 progress monitoring of Noida International Airport (Jewar). In NavContinuity this is the **recovery capacity** input: which airports and runways are actually ready to take diverted flights and rebooked passengers, checked against reported opening dates. It also keeps the lender inspect-or-release decision | **Working on real data**: [a6/](a6/README.md) |
| **B: Build the Orbit** | *Not taken* (rules: choose one of B or C) | Future work only: multi-constellation (GPS + NavIC + Galileo) integrity checking with AI correction of positioning errors (B3) | Backlog |
| **C: Guard the Nation** | **GNSS resilience** (detect jamming/spoofing, build on NavIC) + critical infrastructure | Satellite evidence of GNSS degradation over Indian airspace (CYGNSS / Sentinel-1 GNSS data, reported incidents such as Delhi 2025), turned into a regional navigation-risk map. Protective only: no transmitter location, no targeting, no tracking of individuals | Specified, not built |
| **Customer experience** (all tracks' "who pays?") | n/a | Passenger recovery flow: truthful status and next update time, confirmed rebooking, care at the stranding location, bag status. Airlines pay; worth = delay minutes, diversions and care costs avoided | Specified, not built |

## The flow linking them (rule R5)

1. **A6** (compulsory) says which airports and runways physically exist and can absorb diversions, and hands their region to C.
2. **C** checks whether the navigation environment in that region is degraded.
3. **NavContinuity** ranks recovery actions and walks each passenger to a confirmed outcome.

## Rule risk: read before the pitch

Track A is compulsory. The 9:36 pm update says **"Choose 1"** of Track B or C, and that **every objective of a chosen optional track must be met** (RULES R2, R3). So:
- **Present:** A6 (compulsory) + **Track C** as the one optional track.
- **B3** is a "next step" line only.
- Show Track C only if all its objectives are done; otherwise mention it as a next step.

## Economic answer (all tracks)

- **Who pays:** airlines (operations, disruption management, customer experience); airports and ANSPs for the regional risk map; lenders for A6 monitoring.
- **Worth (illustrative):** US airlines' average direct operating cost was $98.41 per block minute in 2025, and a single diversion costs €1,000–77,200 (EUROCONTROL, 2022 prices). Every avoided diversion or hour of passenger stranding is worth this much. These are reference costs, **not measured savings**.
