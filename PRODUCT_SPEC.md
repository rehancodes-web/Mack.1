# FlyWithEase product specification

Version 0.1 · 26 November 2026 · Concept and pilot design

## Outcome and buyer

Reduce the time and cost between a developing airline disruption and a **confirmed, workable journey plan** for each affected passenger. The buyer is an airline's operations, disruption management, and customer experience organisation. Delivery surfaces are an operations console, agent workflow, and airline-owned passenger channels. A standalone consumer app cannot fulfil the core promise without airline inventory and ticketing access.

## Users

| User | Job |
| --- | --- |
| Operations control | Choose a feasible flight and network response. |
| Recovery desk | Allocate scarce seats and care resources. |
| Airport/contact-centre agent | Complete or correct an action with full case context. |
| Passenger | Understand what is known, what is confirmed, and what they can do next. |
| Finance/analytics | Compare actual cost and customer outcomes with baseline handling. |

## Initial wedge and expansion

Start with navigation degradation because space-derived GNSS observations may add evidence before or during an operational problem. Candidate sources include suitable satellite receiver observations, public interference-related data where available, weather, NOTAMs, flight tracks, and airport and aircraft capability. Record coverage, latency, quality, and geographic interpretation. A satellite observation alone cannot prove that an individual aircraft lost navigation capability.

The recovery engine can later accept weather, crew, maintenance, ATC, airport, and IT disruption events through a common contract. Each cause needs its own evidence, causal validation, and operational rules. Do not treat all cancellations as one prediction problem.

## End-to-end workflow

1. **Observe:** ingest timestamped evidence with provenance, coverage, freshness, and quality.
2. **Assess:** estimate disruption probability, location, time horizon, and uncertainty.
3. **Trace:** connect affected flights with aircraft, crew, connections, bookings, passenger needs, bags, and care rules.
4. **Generate options:** compare continuing, rerouting, swapping, delaying, cancelling, protecting connections, and rebooking where feasible.
5. **Approve:** present constraints, cost ranges, passenger impact, and human approval.
6. **Execute:** request changes through airline systems and receive authoritative success/failure events.
7. **Communicate:** give passengers truthful status, next update time, choices, and escalation.
8. **Verify:** confirm ticket, seat, voucher, transport, and baggage state; open exception cases when an action fails.
9. **Learn:** compare predictions, choices, costs, and customer outcomes against baseline.

## Passenger failures to handle

| Failure | Required behaviour |
| --- | --- |
| Repeated short delays | Give a range and next decision time; surface permitted alternatives early without inventing a precise departure. |
| Missed connection risk | Detect it early and protect a feasible onward option, respecting connection minima. |
| Cancellation | Show confirmed alternatives and the applicable refund path. |
| Bad automatic rebooking | Check origin, destination, nearby airports, groups, accessibility, visa/transit constraints, and live inventory. Escalate if unresolved. |
| No seat | Say that no option is confirmed; watch for inventory changes and route to staff. |
| Hotel/meal confusion | Apply approved rules, reserve real inventory at the **stranding** location, and verify voucher delivery and usability. |
| Bag divergence | Show last confirmed scan, compare bag and passenger routes, and create a tracking task. |
| Conflicting channels | Use one versioned case with sources and timestamps for every update. |
| Additional needs | Flag mobility, medical, minor, language, and family seating needs with appropriate privacy and human review. |
| Supplier/system failure | Expose failure, retry safely, prevent duplicate actions, and hand off the full case. |

## Data and architecture

Minimum entities: `EvidenceEvent`, `DisruptionEvent`, `FlightLeg`, `AircraftAssignment`, `CrewConstraint`, `AirportCapability`, `Journey`, `PassengerNeed`, `SeatOffer`, `RecoveryAction`, `CareEntitlement`, `CareReservation`, `BagEvent`, and `CaseAudit`. Each record needs a stable ID, source, event and ingestion time, validity window, quality/confidence where relevant, and access classification. The passenger read model must distinguish `observed`, `predicted`, `proposed`, `requested`, `confirmed`, and `failed`.

Production integrations: operations data; PSS/PNR; seat inventory; ticketing; departure control; baggage tracking; airline policies; notifications; and hotel, meal, and transport supply. The prototype may use synthetic passenger records if clearly labelled. Keep personal data minimal and permissioned.

## Decision engine

Rank feasible actions using an airline-approved objective with explicit terms for operating cost, delay, missed connections, passenger care, rebooking, scarce inventory, and downstream disruption. Hard constraints include safety, aircraft and crew legality, airport capability, ticketing, passenger needs, and applicable rights. An AI model cannot waive a hard constraint. Show why each option is feasible and whether each cost is observed or estimated. Allow sensitivity analysis on uncertain probabilities and costs.

## Build sequence

**Phase 1 — replayable proof:** one region and historical navigation event; traceable observations; basic disruption score; flight graph and synthetic journeys; rule-based baseline; ranked scenarios; passenger timeline; audit log.

**Phase 2 — shadow pilot:** use airline feeds without automatic execution; compare recommendations with actual decisions and outcomes; measure false alarms, missing data, and latency.

**Phase 3 — controlled execution:** airline-approved rebooking and care actions, confirmations, reversals, agent override, and customer communication. Add other disruption causes only after this workflow is reliable.

## Acceptance criteria for Phase 1

- Every observation and prediction links to its source and timestamp; missing coverage reads `unknown`.
- A replay produces reproducible affected flights and synthetic journeys.
- At least two feasible actions and one rejected action show constraints and estimated costs.
- The passenger view never confuses a suggested seat with a confirmed ticket.
- Wrong-city hotel, unavailable room, impossible connection, separated bag, and failed booking request create explicit exceptions.
- Notifications show the next update time and human escalation route.
- Synthetic passenger data and assumed economics are visibly labelled.
- Baseline comparison reports time to confirmed resolution and total recovery cost without claiming simulated savings as real.

## Economic test

Primary metric: **time to confirmed, workable resolution per affected passenger**, including median and 90th percentile. Supporting metrics: missed connections, stranded passenger nights, confirmed rebookings, care and support cost, bag separation, operating recovery cost, false alerts, and complaints. Test whether earlier decisions preserve seats and other recovery options before they disappear. Count intervention costs, inventory displacement, and inconvenience shifted to other passengers. Validate with historical replay and a matched airline pilot; do not convert an industry-wide delay estimate into this product's addressable market.

## Competitive and validation questions

Recovery and self-rebooking already exist. [Amadeus Self Re-accommodation](https://amadeus.com/en/airlines/products/self-re-accommodation) and [Passenger Recovery](https://amadeus.com/en/airlines/products/passenger-recovery) are examples. We must test whether earlier satellite-informed risk, a shared flight-to-passenger impact graph, and completion verification add value beyond an airline's current stack.

Open questions: Which space-derived data have useful coverage and lead time? Which airline can supply historical cases and outcomes? What is the smallest live integration set for confirmed recovery? Which actions lower *total* cost without worsening passenger outcomes? How will jurisdiction-specific care and refund rules be governed?
