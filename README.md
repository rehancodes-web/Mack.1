# NavContinuity

**Airline disruption intelligence and passenger recovery.**

NavContinuity is a proposed airline software product. It connects early disruption evidence to network decisions and a confirmed recovery plan for each affected passenger. Its initial focus is navigation disruption: satellite-derived observations can help assess GNSS degradation, while airline systems establish what happened to flights, bookings, and bags.

> **Status:** Product and research specification. This repository does not yet contain a working application, airline integration, trained model, or measured savings.

## Why build it?

Passengers report repeated short delay extensions, missed connections, poor rebooking options, long support queues, misplaced care vouchers, and unclear baggage status. Airlines must resolve these while managing aircraft, crew, gates, seats, and downstream disruption. The central measure is **time to a confirmed, workable resolution for each affected passenger**.

## The product

`evidence → forecast → network impact → recovery options → approved action → verified passenger outcome`

- **Operations console:** evidence and uncertainty, flights and connections at risk, feasible actions, cost ranges, and passenger impact.
- **Passenger recovery flow:** truthful status and next update time, bookable alternatives, confirmed rebooking, appropriate care, baggage events, and human support.
- **Shared case record:** aligned facts and action state across operations, airport agents, contact centres, and passenger channels.

The first pilot targets navigation disruption. Other delay causes can enter the same recovery workflow once their evidence and rules are validated separately.

## What is already in market?

Airline disruption management and self-rebooking products exist, including [Amadeus Self Re-accommodation](https://amadeus.com/en/airlines/products/self-re-accommodation) and [Passenger Recovery](https://amadeus.com/en/airlines/products/passenger-recovery). The product hypothesis is that *earlier, satellite-informed disruption assessment*, a shared flight-to-passenger impact graph, and verification that recovery completed will add value to existing workflows. This needs customer testing.

## Read the documents

- [Product specification](PRODUCT_SPEC.md): users, workflow, data, build sequence, acceptance criteria, and economics.
- [Research and evidence](RESEARCH.md): passenger complaints, existing products, rights references, and validation questions.
- [Original team brief](NavContinuity_Team_Brief.md) ([PDF](NavContinuity_Team_Brief.pdf)): historical hackathon research. Its Track A/C requirements and illustrative cases do **not** define the standalone product scope.

## Proposed first build

Replay one historical navigation disruption with traceable observations and flight data. Show flights, connections, and simulated passenger journeys at risk; compare feasible recovery actions; then show the passenger timeline and whether booking, care, and baggage actions were confirmed or failed. Benchmark against a transparent baseline. Label synthetic records and assumed costs.

A live pilot requires airline-approved access to operations, reservations, seat inventory, ticketing, baggage, care suppliers, and policies. Without those integrations, a prototype cannot complete a real rebooking or issue a usable voucher.

## Product rules

- Distinguish **observed**, **predicted**, **proposed**, **requested**, **confirmed**, and **failed** states.
- Never say a passenger is rebooked until the authoritative airline system confirms it.
- Show the last confirmed bag scan; do not present an inferred location as fact.
- Apply airline-approved safety, operational, privacy, and passenger-care rules with human override.
- Measure total recovery cost and passenger outcomes, including false alarms and costs shifted to other travellers.
