# Aviation Navigation Failures: Safety Risks, Economic Impact and an AI-Based Monitoring Proposal

**Project:** AeroNav Shield — AI-powered satellite-navigation integrity and aviation risk monitoring
**Document type:** Research report / background study
**Scope:** Types of navigation failure, real-world data (global and India), fatal accident case studies, economic costs, Boeing's response, technical improvements, and the proposed system design.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Key Definitions](#2-key-definitions)
3. [Types of Aviation Navigation Failure](#3-types-of-aviation-navigation-failure)
4. [Major Setbacks Caused by Navigation Failures](#4-major-setbacks-caused-by-navigation-failures)
5. [Safety Risk to Passengers and Crew](#5-safety-risk-to-passengers-and-crew)
6. [Fatal Accident Case Studies](#6-fatal-accident-case-studies)
7. [Global GNSS Interference Data](#7-global-gnss-interference-data)
8. [India-Specific Data](#8-india-specific-data)
9. [International Incident Examples](#9-international-incident-examples)
10. [Economic Impact](#10-economic-impact)
11. [Boeing and Navigation Failures](#11-boeing-and-navigation-failures)
12. [How the Satellite-Navigation System Can Be Improved](#12-how-the-satellite-navigation-system-can-be-improved)
13. [Proposed System: AeroNav Shield](#13-proposed-system-aeronav-shield)
14. [Reducing Error Toward Zero](#14-reducing-error-toward-zero)
15. [Differentiation from Boeing's Existing System](#15-differentiation-from-boeings-existing-system)
16. [Problem Statement and Research Question](#16-problem-statement-and-research-question)
17. [Project Direction Comparison: Runway Icing vs Navigation Interference](#17-project-direction-comparison-runway-icing-vs-navigation-interference)
18. [Summary of Key Numbers](#18-summary-of-key-numbers)
19. [Limitations and Important Distinctions](#19-limitations-and-important-distinctions)
20. [Sources and Data References](#20-sources-and-data-references)

---

## 1. Executive Summary

Navigation failures in aviation have consequences far beyond a delayed flight. They can affect passenger safety, crew workload, airline finances, airport operations and the wider aviation network.

Two broad outcomes are documented:

- **Navigation disruption** usually results in extra precautions, delays, rerouting or diversions.
- **A serious navigation-related accident** can result in injuries, fatalities and the complete loss of an aircraft.

Key evidence gathered in this report:

- **159 fatalities** in American Airlines Flight 965 (1995) and **228 fatalities** in Korean Air Flight 801 (1997), both navigation-related accidents.
- IATA reported a **175% increase** in reported GNSS interference and a **500% increase** in GPS spoofing incidents in 2024 compared with 2023.
- IATA's 2024–2025 reporting period recorded **71,000+ interference cases**, **2.1 million GPS signal-loss events**, **31.8 million abnormal satellite-navigation events** and **1,171 NOTAMs**.
- India reported **2,354 GPS interference incidents** (November 2023 – December 2025) and **623 more** (January – February 2026).
- A single commercial diversion can cost **€1,000 – €77,200** (2022 prices).
- US passenger airlines' average direct operating cost was **$98.41 per block minute** in 2025.
- Boeing has reported that GNSS interference has been experienced across **all Boeing aircraft models**.

**Core conclusion:** Navigation failures are not simply a technical inconvenience. They can become a serious aviation safety issue, cause substantial financial losses and disrupt the wider transport economy. The proposed project focuses on **early detection of GNSS interference, prediction of navigation-risk areas and reduction of operational disruption**, rather than claiming that AI can prevent every navigation-related accident.

---

## 2. Key Definitions

| Term | Meaning |
| --- | --- |
| **Navigation-system failure** | Equipment such as GPS/GNSS, an inertial navigation system, a radio navigation aid or an onboard navigation computer stops working or provides unreliable information. |
| **Navigation error** | The equipment may be functioning, but the aircraft receives, interprets or follows incorrect navigation information, or the crew makes an error. |
| **Air traffic navigation issue** | Incorrect position information, communication problems or coordination failures that affect aircraft separation and routing. |
| **GNSS** | Global Navigation Satellite System — the general term for satellite navigation constellations (GPS, Galileo, GLONASS, BeiDou). |
| **Jamming** | Satellite signals are overwhelmed or blocked, so the receiver loses its signal. |
| **Spoofing** | False satellite-like signals cause a receiver to calculate an incorrect position or time. The wrong information can appear valid. |
| **IRS / INS** | Inertial Reference System / Inertial Navigation System — estimates aircraft movement using onboard sensors. |
| **FMC / FMS** | Flight Management Computer / System — combines navigation information and route data. |
| **VOR, DME, ILS** | Ground-based radio navigation aids (VHF Omnidirectional Range, Distance Measuring Equipment, Instrument Landing System). |
| **ADS-B / ADS** | Automatic Dependent Surveillance(-Broadcast) — aircraft broadcast their position for surveillance by ATC. |
| **EGPWS** | Enhanced Ground Proximity Warning System — terrain-warning system. |
| **PBN** | Performance-Based Navigation. |
| **NOTAM** | Notice to Air Missions — an official aviation alert. |
| **CFIT** | Controlled Flight Into Terrain. |
| **CRPA** | Controlled Reception Pattern Antenna. |
| **GEM** | Boeing's GPS Event Monitor. |

Not every navigation failure causes a crash. Many are detected and managed through backup systems and established procedures.

---

## 3. Types of Aviation Navigation Failure

### 3.1 GPS/GNSS signal failure
Aircraft use satellite navigation to determine their position. Signals can be disrupted, blocked or become unavailable. This is commonly called **jamming** when signals are overwhelmed.

### 3.2 GPS spoofing
False satellite-like signals can cause a receiver to calculate an incorrect position or time. Unlike jamming, spoofing can make incorrect information appear believable.

### 3.3 Radio navigation aid failure
Systems such as VOR, DME and ILS help aircraft determine their position or follow an approach path. Equipment faults, signal interference or ground-station problems can make these aids unreliable.

### 3.4 Inertial navigation or flight-management errors
Inertial systems estimate aircraft movement, while flight-management systems combine navigation information and route data. Sensor faults, incorrect data or database errors can produce navigation discrepancies.

### 3.5 Consequences by type of problem

| Navigation problem | Possible consequence |
| --- | --- |
| GPS signal loss | Aircraft may need to rely on alternative navigation systems |
| GPS spoofing | Incorrect position information may be displayed |
| Inertial navigation discrepancy | Aircraft position estimates may become inconsistent |
| ILS or radio navigation aid failure | Instrument approach may become unavailable |
| Incorrect navigation data | Aircraft may follow an unintended route |
| Navigation and surveillance degradation | Air traffic controllers may have difficulty maintaining an accurate picture of aircraft positions |

EASA has warned that GNSS interference can cause **false terrain-warning alerts, time shifts and discrepancies between navigation systems**, and that spoofing can be harder to detect than jamming.

---

## 4. Major Setbacks Caused by Navigation Failures

The biggest setbacks are not limited to crashes. They fall into seven categories:

1. **Loss of accurate aircraft positioning** — When GPS signals are disrupted or spoofed, aircraft may receive incorrect or unreliable position information, affecting navigation displays and other GNSS-dependent systems.
2. **Flight delays and cancellations** — Aircraft may need to wait, change routes, use alternative procedures or divert, which also affects connecting flights.
3. **Air traffic management disruption** — Degraded information can increase controller workload and reduce the capacity of affected airspace.
4. **Increased risk of terrain and obstacle hazards** — Incorrect navigation information can contribute to route deviations or misleading warnings, especially near mountainous terrain and during approaches.
5. **Disruption to aircraft landing procedures** — If an instrument landing or navigation aid becomes unavailable, an aircraft may need to use an alternative approach, hold, or divert.
6. **Increased pilot workload and human error risk** — Pilots may have to cross-check several instruments, identify unreliable information and switch to alternative navigation methods during demanding flight phases.
7. **Economic losses and passenger inconvenience** — Diversions, extra fuel consumption, crew scheduling problems, missed connections and airport congestion.

### 4.1 Most serious real-world consequences

| Setback | Why it is serious |
| --- | --- |
| **Controlled Flight Into Terrain (CFIT)** | Incorrect or unreliable navigation information can contribute to an aircraft unintentionally approaching terrain. |
| **Loss of aircraft surveillance** | Air traffic control may lose some GNSS-dependent aircraft position information. |
| **Mid-air collision risk** | Degraded position and surveillance information can make aircraft separation more difficult. |
| **Runway excursion risk** | Navigation and approach disruptions can contribute to unstable or disrupted landing operations. |
| **Loss of landing capability** | An aircraft may be unable to use a planned satellite-based approach. |

ICAO and EUROCONTROL identify these as potential safety consequences of GNSS interference. They are **risks**, not evidence that every interference event leads to an accident.

### 4.2 Possible operational and safety impacts

1. Flight diversions to alternative airports.
2. Delays while crews and air traffic control assess navigation reliability.
3. Increased workload for pilots and controllers.
4. Loss of reliable aircraft-position information.
5. Reduced airspace capacity in affected regions.
6. Increased risk of route deviations or loss of aircraft separation if the problem is not properly managed.

---

## 5. Safety Risk to Passengers and Crew

**Overall rating: potentially high safety risk.** The risk depends on when the failure happens, how severe it is, whether the information is incorrect or simply unavailable, and whether backup systems work correctly.

| Flight phase | Possible risk |
| --- | --- |
| Cruising | Route deviation, increased workload or difficulty maintaining accurate position information |
| Approaching an airport | Incorrect position estimates, missed approaches or diversions |
| Landing | Loss of access to a particular instrument approach and increased operational complexity |
| Flying near mountainous terrain | Greater concern if the aircraft's position is misunderstood |
| Air traffic management | Reduced surveillance reliability and increased difficulty maintaining safe aircraft separation |

### 5.1 Why spoofing is especially concerning
- With ordinary signal loss (jamming), the system may indicate that navigation information is **unavailable**.
- With spoofing, it may instead provide **misleading information that appears valid**.

EUROCONTROL's **2025** report identifies potential effects on aircraft navigation, terrain-warning systems, surveillance and air traffic management, and safety-relevant scenarios ranging from **airspace deviations to controlled flight into terrain**.

This does not mean every GPS interference incident puts passengers in immediate danger. Aircraft have alternative navigation systems, trained crews and established contingency procedures.

---

## 6. Fatal Accident Case Studies

There have been fatal accidents involving navigation errors and loss of situational awareness. Not every one should be described as a GPS failure — some involved flight-management systems, approach-navigation procedures and human factors.

### 6.1 Case 1: American Airlines Flight 965 — Colombia, 1995

| Field | Detail |
| --- | --- |
| Year | 1995 |
| Aircraft | Boeing 757 |
| Location | Near Cali, Colombia |
| People aboard | 163 |
| Fatalities | 159 |
| Survivors | 4 |
| Aircraft outcome | Destroyed |

**What happened:**
- The aircraft was approaching Cali airport.
- The crew experienced confusion about the intended navigation route and the waypoint to follow.
- The flight-management system commanded a turn in an unintended direction.
- The aircraft descended into mountainous terrain.

**Aircraft and company impact:** Complete loss of the aircraft asset, alongside the consequences of fatalities, investigation, legal proceedings and operational disruption.

**Investigation finding:** The FAA identifies navigation and crew-coordination errors as central factors.

### 6.2 Case 2: Korean Air Flight 801 — Guam, 1997

| Field | Detail |
| --- | --- |
| Year | 1997 (6 August 1997) |
| Aircraft | Boeing 747 |
| Location | Nimitz Hill, Guam |
| People aboard | 254 |
| Fatalities | 228 |
| Survivors | 26 (passengers and crew; serious injuries reported among survivors) |
| Aircraft outcome | Destroyed |

**What happened:**
- The aircraft was carrying out an approach to Guam International Airport.
- The crew was dealing with issues concerning the approach and glideslope indications.
- The approach was not correctly executed.
- The aircraft descended prematurely and crashed into high terrain.

**Aircraft and company impact:** The Boeing 747 was destroyed. The accident exposed major shortcomings in approach training, crew monitoring and operational procedures.

**Investigation finding:** The NTSB identified the captain's failure to adequately brief and execute the approach, together with inadequate monitoring by the other flight crew members, as key factors.

### 6.3 Combined figures (derived from the two cases above)

| Metric | AA965 | KE801 | Total |
| --- | --- | --- | --- |
| People aboard | 163 | 254 | 417 |
| Fatalities | 159 | 228 | 387 |
| Survivors | 4 | 26 | 30 |
| Aircraft destroyed | 1 | 1 | 2 |

> **Important distinction:** These are navigation-related accidents, **not** examples of modern GPS spoofing directly causing a crash. Their figures should not be combined with GNSS-interference statistics as though they describe the same type of failure.

---

## 7. Global GNSS Interference Data

### 7.1 IATA 2024 Annual Safety Report

| Indicator | Change (2024 vs 2023) |
| --- | --- |
| Reported GNSS interference | **+175%** |
| GPS spoofing incidents | **+500%** |

These are increases in **reported events**, not increases in aircraft crashes.

### 7.2 IATA 2026 safety briefing (AGM 2026) — 2024–2025 reporting period

| Reported indicator | Number |
| --- | --- |
| Interference cases | **71,000+** |
| GPS signal-loss events | **2.1 million** |
| Abnormal satellite-navigation events | **31.8 million** |
| Official aviation alerts (NOTAMs) | **1,171** |

These are different event categories — not 71,000 aircraft accidents or 31.8 million separate flights. Aircraft have backup navigation methods and established procedures for dealing with unreliable signals.

### 7.3 EUROCONTROL 2025 report
Identifies potential effects on aircraft navigation, terrain-warning systems, surveillance and air traffic management, with safety-relevant scenarios from airspace deviations to CFIT.

---

## 8. India-Specific Data

### 8.1 Government of India — Lok Sabha answer, 12 March 2026

| Period | Reported GPS interference incidents |
| --- | --- |
| November 2023 – December 2025 | **2,354** |
| January – February 2026 | **623** |
| **Total, November 2023 – February 2026** (derived) | **2,977** |

These are reported interference incidents, not confirmed aircraft accidents.

### 8.2 Regional breakdown of reported incidents in 2025 (ICAO Asia-Pacific document)

Source: *India's preparedness for mitigation of GNSS radio-frequency interference*, presented to ICAO in January 2026.

| Rank | Reported area | Incidents |
| --- | --- | --- |
| 1 | Southeast Asia / Bay of Bengal | 319 |
| 2 | Northwestern India — Jammu, Amritsar, Rajasthan | 276 |
| 3 | Kolkata region | 93 |
| 4 | Middle East | 85 |
| 5 | Delhi vicinity | 64 |
| 6 | Chennai vicinity | 40 |
| 7 | Mumbai region | 19 |
| 8 | Hyderabad vicinity | 18 |
| 9 | Arabian Sea region | 13 |
| | **Sum of listed areas (derived)** | **927** |

The document notes that some locations were estimated from incomplete location information.

### 8.3 Reported system impacts of GNSS interference in India (2025 dataset)

| System impact | Share of reported incidents |
| --- | --- |
| Loss of GPS | **71%** |
| Loss of ADS (Automatic Dependent Surveillance) | **54%** |
| EGPWS alerts (Enhanced Ground Proximity Warning System) | **19%** |
| Complete outage | **10%** |
| Loss of GNSS-based landing capability | **6%** |
| Loss of integrity | Reported category (percentage not stated in source material) |
| Map shift | Reported category (percentage not stated in source material) |
| Degraded PBN | Reported category (percentage not stated in source material) |
| Time shift | Reported category (percentage not stated in source material) |

Categories can overlap (so percentages do not sum to 100%), and some incident reports did not contain complete system-impact information.

### 8.4 Delhi airport GPS spoofing (reported to Parliament, 1 December 2025)

- Some flights approaching **Indira Gandhi International Airport** experienced GPS spoofing.
- The affected flights were using GPS-based landing procedures while approaching **Runway 10**.
- Contingency procedures were used.
- Conventional navigation aids remained available for other runway directions, and the government reported **no effect on flight movements**.
- The **DGCA** introduced a procedure for real-time reporting of GPS spoofing and interference around the airport.

This shows how navigation interference can disrupt normal operations even when it does not result in an accident.

**Key finding:** GPS interference is not just an international problem. Indian aviation authorities have reported incidents affecting or being reported by airlines operating around several Indian regions.

---

## 9. International Incident Examples

| Location | Year | What happened | Source |
| --- | --- | --- | --- |
| Denver International Airport, USA | 2022 | An unauthorised transmitter disrupted GNSS reception around the airport. Multiple aircraft reported unreliable GPS; aviation and other navigation-dependent systems were affected. | FAA GNSS Interference Resource Guide |
| Dallas area, USA | 2022 | GNSS interference affected aircraft operating around Dallas. Some flights had to be rerouted. | FAA GNSS Interference Resource Guide |
| Delhi (IGI Airport), India | 2025 | GPS spoofing on approaches to Runway 10; contingency procedures used (see §8.4). | Lok Sabha / Digital Sansad |

---

## 10. Economic Impact

Navigation failures create costs even when no accident occurs.

### 10.1 Cost categories

**A. Direct operational costs**
- Additional fuel from rerouting, holding or diversions.
- Extra crew working hours.
- Maintenance and inspection costs.
- Airport landing, handling and parking charges.
- Additional air traffic management and operational coordination.

**B. Passenger-related costs**
- Rebooking and accommodation.
- Meals and passenger assistance.
- Compensation where applicable.
- Missed connecting flights and associated disruption.
- Loss of customer confidence.

**C. Long-term company costs**
- Aircraft replacement or repair.
- Insurance claims and possible premium increases.
- Legal costs and liability claims.
- Regulatory investigations and compliance expenses.
- Reputational damage and reduced customer confidence.

### 10.2 EUROCONTROL — estimated commercial flight diversion costs (2022 prices)

**Overall range: €1,000 – €77,200** depending on the type and distance of the diverted flight.

| Flight type | Estimated diversion cost |
| --- | --- |
| Regional | €1,000 – €7,000 |
| Continental | €1,400 – €10,500 |
| Intercontinental | €7,000 – €77,200 |

These are general diversion estimates, not costs specifically attributed to GPS failures.

### 10.3 Airlines for America — 2025 direct aircraft operating costs

**Average: $98.41 per block minute** (US passenger airlines).

| Cost component | Per block minute | Share of total (derived) |
| --- | --- | --- |
| Crew | $37.01 | 37.6% |
| Fuel | $29.34 | 29.8% |
| Maintenance | $18.35 | 18.6% |
| Aircraft ownership | $9.76 | 9.9% |
| Other | $3.95 | 4.0% |
| **Total** | **$98.41** | **100%** |

#### Illustrative calculation: 45-minute operational delay

```
45 minutes × $98.41 per minute = $4,428.45
```

This uses average direct aircraft operating costs. It is **not** the confirmed incremental loss caused by a navigation failure; actual costs depend on the airline, aircraft, delay circumstances and other expenses.

### 10.4 Economic loss from a major accident

When an aircraft is destroyed, the company may face:

1. Loss of the aircraft's remaining economic value.
2. Passenger and crew injury or fatality liability.
3. Insurance and legal costs.
4. Operational disruption and replacement capacity costs.
5. Long-term reputational consequences.

For AA965 and KE801 the aircraft were destroyed, but no precise total financial loss is given here: publicly available accident reports do not provide a complete consolidated bill for all these categories.

### 10.5 Economic impact beyond the airline

| Sector | Economic consequence |
| --- | --- |
| Airports | Congestion, additional ground operations and reduced capacity |
| Cargo and logistics | Delayed deliveries and supply-chain disruption |
| Tourism | Missed connections, disrupted travel and accommodation costs |
| Businesses | Employees and business travellers losing productive time |
| Passengers | Additional travel expenses and lost time |
| Air traffic management | Higher workload and reduced airspace capacity |

### 10.6 Hong Kong International Airport — modelled GNSS-error scenario (AGU journal)

A research paper modelled an intense **geomagnetic-storm** scenario causing satellite-navigation positioning errors around Hong Kong International Airport and estimated:

| Cost type | Modelled estimate |
| --- | --- |
| Airline-related costs | **More than €2 million** |
| Passenger-related costs | **Up to €3 million** |

These are modelled estimates for a particular scenario, not recorded losses from an actual accident. They show that navigation reliability can have a substantial economic impact even without an aircraft being destroyed.

### 10.7 Formulas for quantifying economic benefit

```
Estimated disruption cost = Affected flights × Average cost per flight

Potential savings = Cost without warning − Cost with warning
```

The second figure must be based on validated assumptions about how many disruptions the warning system could actually prevent or reduce.

---

## 11. Boeing and Navigation Failures

Boeing aircraft have been involved in accidents and operational disruptions involving navigation-related problems (both case studies in §6 were Boeing aircraft — a 757 and a 747). However, not every incident involving a Boeing aircraft was caused by a defect in Boeing's navigation equipment.

Navigation depends on several interconnected systems:
- Satellite navigation (GPS/GNSS).
- Inertial Reference Systems (IRS).
- Flight Management Computers (FMC).
- Radio navigation aids such as VOR, DME and ILS.
- Ground-based air traffic surveillance and navigation infrastructure.

Boeing manufactures aircraft and their onboard systems but does not control the satellite-navigation network. Solutions require cooperation between manufacturers, satellite operators, airports and aviation authorities.

### 11.1 Boeing's acknowledgement to ICAO (September 2024, paper IP/04)

Boeing reported that GNSS interference had been experienced across **all Boeing aircraft models**. Effects identified:

- Differences between GPS and flight-management-system position estimates.
- Incorrect date and time information.
- Unexpected terrain-warning alerts.
- Loss of satellite communication on certain aircraft.
- Loss of ADS-B information or transmission of incorrect position information.

Boeing also acknowledged that the effects **might not be immediately obvious to flight crews**.

**Technical limitation identified:** Operators could sometimes deselect GNSS input to the flight-management system in known interference areas, but they **could not completely isolate the GPS receiver** from other aircraft systems such as the terrain-warning system and the clock.

### 11.2 Boeing's GNSS protection strategy (Inside GNSS, 4 August 2026)

| Phase | Goal | Actions | Status |
| --- | --- | --- | --- |
| **1. Containment** | Detect and understand the problem | GPS Event Monitor (GEM) records interference symptoms and locations; reports sent to airline maintenance systems and Boeing | Implemented on supported configurations |
| **2. Improvement** | Strengthen existing equipment | Software updates with suppliers for multi-mode receivers and enhanced ground-proximity warning systems, to stop unreliable GPS data affecting other onboard systems | Updates and certification work |
| **3. Resilience** | Stronger future navigation | Dual-frequency multi-constellation receivers; satellite-signal authentication; Controlled Reception Pattern Antennas (CRPAs); alternative and complementary positioning, navigation and timing systems | Future development |

### 11.3 What is GEM?

GEM acts as an aircraft's **navigation-event recorder**. It helps answer three questions:

1. Where did the interference occur?
2. What symptoms did the aircraft experience?
3. Which aircraft systems or receiver configurations were affected?

Boeing uses these reports to identify recurring geographical patterns and investigate equipment improvements — showing that a manufacturer is already using data collection and analysis to understand navigation interference.

---

## 12. How the Satellite-Navigation System Can Be Improved

GPS is not one satellite; it is a constellation of satellites transmitting timing and navigation signals that receivers use to calculate position. The project should therefore improve **navigation-data reliability and interference detection**, not satellite imagery.

### Improvement 1: Multi-constellation navigation

| Constellation | Operator |
| --- | --- |
| GPS | United States |
| Galileo | European Union |
| GLONASS | Russia |
| BeiDou | China |

- **How it helps:** If one constellation becomes unavailable or unreliable, the receiver may still use others.
- **Proposed improvement:** Monitor the consistency of navigation information across constellations and flag discrepancies.
- **Caveat:** Multiple constellations do not automatically eliminate interference; they may share vulnerabilities in the same area.

### Improvement 2: Multi-frequency navigation

Satellites transmit on different radio frequencies; a multi-frequency receiver can make more reliable measurements and identify certain signal errors.

**Proposed navigation-quality monitoring layer evaluating:**
- Signal availability.
- Position consistency.
- Navigation integrity indicators.
- Agreement between independent measurements.

This helps distinguish ordinary uncertainty from abnormal signal behaviour.

### Improvement 3: AI-based anomaly detection (strongest project opportunity)

Instead of waiting for a pilot report, an AI model analyses navigation-related data and identifies abnormal patterns.

**Inputs:**
- Historical GNSS interference reports.
- Position-quality indicators.
- Aircraft tracking information.
- Satellite signal availability.
- Time and location.
- Differences between independent navigation sources.

**Illustrative dashboard indicators** (illustrative only — not real measurements or validated thresholds):

| Indicator | Example state |
| --- | --- |
| Navigation consistency | Normal |
| Signal availability | Degraded |
| Independent position agreement | Mismatch detected |

**Output classification:**

| Classification | Meaning |
| --- | --- |
| Normal | Navigation indicators are consistent |
| Warning | Unusual signal behaviour detected |
| High risk | Multiple independent indicators suggest unreliable navigation |
| Unknown | Insufficient data to make a reliable assessment |

**Design principle:** The AI must be able to say *"I don't have enough reliable information"* instead of always making a prediction.

### Improvement 4: Independent backup navigation

| System | Purpose |
| --- | --- |
| GNSS | Satellite-based positioning |
| IRS/INS | Position estimation using onboard inertial sensors |
| DME/DME | Position determination using ground-based distance measurements |
| VOR | Radio-based navigation |
| ILS | Precision guidance during suitable instrument approaches |

**Proposed improvement:** A monitoring layer that compares independent navigation sources and flags disagreements. The key word is *independent* — systems relying on the same compromised source may all be wrong together.

### Improvement 5: Satellite-signal authentication and integrity checking

A receiver should not only ask *"Can I receive a satellite signal?"* but also *"Can I trust the information being received?"*

Approaches:
- Authentication of supported navigation messages.
- Monitoring signal integrity.
- Comparing expected and observed navigation behaviour.
- Detecting inconsistencies between independent sources.
- Rejecting or flagging information that fails integrity checks.

Authentication makes certain spoofing harder but does not eliminate all interference or navigation errors.

### Improvement 6: Geographical risk prediction

A geographical risk map showing:
- Areas with repeatedly reported GNSS interference.
- Areas with recent navigation-quality anomalies.
- Time periods in which interference has been reported.
- Airports and air routes potentially affected.
- Confidence and freshness of the underlying observations.

A historical hotspot should **not** automatically be treated as currently dangerous; risk maps need fresh observations and clearly displayed uncertainty.

---

## 13. Proposed System: AeroNav Shield

**AeroNav Shield — AI-powered satellite-navigation integrity and aviation risk monitoring.**
(An earlier version of this concept was called *AeroNav AI*.)

The system acts as an **early-warning and navigation-risk monitoring layer**. It does not control an aircraft's navigation system.

### 13.1 Three core innovations
1. Multi-source navigation verification.
2. AI-based anomaly detection.
3. Geographical risk prediction.

### 13.2 Three measurable outcomes

| Outcome | Description |
| --- | --- |
| **Safety** | Identify geographical areas experiencing abnormal navigation signals and alert relevant aviation authorities |
| **Operational efficiency** | Help airlines and airports anticipate disruptions and plan alternative procedures |
| **Economic protection** | Estimate potential losses from delays, diversions and cancellations, and compare with a scenario where warnings are available earlier |

### 13.3 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ 1. DATA COLLECTION                                           │
│    GNSS reports · Aircraft tracking · Satellite data ·       │
│    Navigation quality indicators                             │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. DATA VALIDATION                                           │
│    Missing data · Source consistency · Timestamp checks ·    │
│    Reliability assessment                                    │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. AI ANOMALY DETECTION                                      │
│    Identify unusual navigation patterns and geographical     │
│    interference trends                                       │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. RISK ASSESSMENT                                           │
│    Risk category · Confidence · Affected region ·            │
│    Data freshness                                            │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. ALERT AND MONITORING DASHBOARD                            │
│    Geographical risk map · Alerts · Historical trends ·      │
│    Operational impact estimates                              │
└──────────────────────────────────────────────────────────────┘
```

### 13.4 Workflow
1. **Collect satellite and navigation data** — GNSS interference reports, satellite-navigation quality indicators and relevant satellite observations.
2. **Monitor aircraft movements** — analyse position reports and flight-track data for unusual discrepancies.
3. **Identify suspicious patterns** — AI identifies areas and time periods where navigation reliability may be degraded.
4. **Generate risk predictions** — estimate which areas may have elevated interference risk.
5. **Alert aviation authorities** — display risk areas and warnings to support ATM and airline planning.

### 13.5 Data requirements

| Data | Why it is useful |
| --- | --- |
| GNSS interference reports | Historical examples of affected locations |
| ADS-B aircraft tracking data | Identify unusual aircraft-position patterns |
| Satellite-navigation quality indicators | Understand signal reliability |
| NOTAM information | Identify officially reported navigation hazards |
| Weather data | Account for weather-related operational disruptions |
| Airport and airspace locations | Identify geographical risk patterns |
| Time and date | Identify recurring patterns and risk periods |

**Technical note:** Satellite imagery alone cannot reliably identify GPS spoofing. The model needs navigation-quality information and aircraft tracking data alongside satellite-related observations.

### 13.6 Potential data sources
- ICAO — aviation safety and navigation standards.
- DGCA India — Indian aviation regulations and advisories.
- Airports Authority of India — Indian airport and navigation information.
- Aviation Weather Center — aviation weather information.
- EASA GNSS interference monitoring — affected airspace and interference information.

### 13.7 Project priorities
1. **Early identification of GNSS interference** — identify areas with unusual navigation-signal disruptions.
2. **Detection of suspicious aircraft-position discrepancies** — find inconsistencies between tracking and navigation information.
3. **Prediction of high-risk regions** — analyse historical patterns to find where disruptions are more likely.

---

## 14. Reducing Error Toward Zero

**Zero error cannot be guaranteed** in a real-world satellite-navigation system — satellites, receivers, software, networks and environmental conditions all have limitations. The system can, however, significantly reduce the chance of an *undetected* error.

| Potential source of error | Proposed protection |
| --- | --- |
| Faulty satellite information | Cross-check multiple navigation sources |
| GPS interference | GNSS anomaly monitoring |
| Misleading position information | Independent position-consistency checks |
| AI makes an incorrect prediction | Confidence estimation and uncertainty reporting |
| Missing or outdated data | Data freshness checks |
| Sensor malfunction | Independent sensor validation |
| Model learns incorrect patterns | Testing on unseen airports and time periods |
| AI fails to recognise an unfamiliar event | Unknown/anomaly category and human review |

### 14.1 Fail-safe uncertainty (most important technical feature)

The model must never announce that navigation is safe just because it has not detected a problem. It distinguishes four states:

1. No anomaly detected.
2. Anomaly detected.
3. Navigation information unreliable.
4. **Insufficient data to assess reliability** — prevents missing information from being mistaken for safe conditions.

For real aircraft, certified avionics, approved navigation procedures and aviation authorities remain responsible for safety decisions. The prototype is an **additional monitoring and decision-support layer**.

---

## 15. Differentiation from Boeing's Existing System

Boeing already has GEM, so another GPS-interference dashboard alone would not be original.

| Existing Boeing approach | AeroNav Shield extension |
| --- | --- |
| Records interference symptoms experienced by aircraft | Combines several independent sources of navigation-quality information |
| Analyses geographical interference patterns | Predicts potential risk patterns using historical and recent data |
| Shares information with operators | Creates a consolidated risk-monitoring dashboard |
| Works with aircraft maintenance and operational systems | Explores satellite, aircraft-tracking and external reporting data together |
| Improves aircraft equipment resilience | Provides an additional independent monitoring and early-warning layer |

The project does not claim to replace Boeing's technology; it proposes an additional layer to detect problems earlier and independently verify navigation reliability.

---

## 16. Problem Statement and Research Question

### 16.1 Problem statement: AI-Based Aviation Navigation Risk Detection

Modern aviation increasingly depends on satellite-based navigation systems such as GPS/GNSS for accurate aircraft positioning and route guidance. However, rising incidents of GNSS interference, including signal disruption and spoofing, are creating challenges for aviation safety and operational reliability.

In India, the Government reported **2,354** GPS interference incidents between November 2023 and December 2025, followed by another **623** incidents during January and February 2026.

Existing navigation and reporting systems help aviation authorities respond to these events, but there is an opportunity to improve early identification of geographical risk patterns.

We propose an AI-powered aviation monitoring system that integrates satellite-navigation indicators, aircraft tracking information and historical interference reports to identify unusual navigation patterns, estimate potential risk areas and provide early warnings to aviation authorities.

### 16.2 Central question
> Can AI identify unusual aviation navigation patterns early enough to warn aviation authorities about potentially affected airspace?

### 16.3 Main research question
> Can combining satellite-navigation quality indicators, aircraft tracking information and AI-based anomaly detection identify potentially unreliable navigation areas earlier and more reliably than historical interference reporting alone?

### 16.4 Experimental design

Compare three approaches:
1. Historical-report-only detection.
2. Navigation-indicator-only detection.
3. Combined AI detection.

**Evaluation metrics:**
- False alarms.
- Missed anomalies.
- Detection delay.
- Geographical accuracy.
- Confidence calibration.

### 16.5 Biggest unresolved problem
Detecting when navigation information is **incorrect rather than simply unavailable**:
- With GPS jamming, the system may lose its signal.
- With GPS spoofing, the system may receive misleading information and calculate an incorrect position.

EASA has specifically highlighted this distinction.

---

## 17. Project Direction Comparison: Runway Icing vs Navigation Interference

| Area | Runway icing prediction | Navigation interference detection |
| --- | --- | --- |
| Main problem | Ice, snow and runway contamination | GPS/GNSS disruption and spoofing |
| AI objective | Predict runway icing risk | Detect unusual navigation patterns |
| Satellite role | Snow and weather monitoring | Satellite-navigation and related data |
| Ground data | Runway sensors and condition reports | Aircraft tracking and navigation reports |
| Indian relevance | Cold-weather airports | Documented incidents across Indian regions |
| Main challenge | Access to runway-condition labels | Access to detailed GNSS and aircraft data |

**Assessment:**
- Navigation interference detection has particularly strong India-specific evidence, but access to detailed aircraft navigation data may be difficult.
- Runway icing is technically challenging because satellite imagery cannot confirm thin ice on a runway.
- The two should **not** be combined into one AI prediction model — they are distinct problems requiring different training datasets.

---

## 18. Summary of Key Numbers

| # | Figure | Context | Source |
| --- | --- | --- | --- |
| 1 | 163 aboard / 159 fatalities / 4 survivors | American Airlines Flight 965, Boeing 757, Cali, Colombia, 1995 | FAA |
| 2 | 254 aboard / 228 fatalities / 26 survivors | Korean Air Flight 801, Boeing 747, Nimitz Hill, Guam, 1997 | NTSB / FAA |
| 3 | +175% | Increase in reported GNSS interference, 2024 vs 2023 | IATA 2024 Annual Safety Report |
| 4 | +500% | Increase in GPS spoofing incidents, 2024 vs 2023 | IATA 2024 Annual Safety Report |
| 5 | 71,000+ | Interference cases, 2024–2025 | IATA AGM 2026 briefing |
| 6 | 2.1 million | GPS signal-loss events, 2024–2025 | IATA AGM 2026 briefing |
| 7 | 31.8 million | Abnormal satellite-navigation events, 2024–2025 | IATA AGM 2026 briefing |
| 8 | 1,171 | NOTAMs, 2024–2025 | IATA AGM 2026 briefing |
| 9 | 2,354 | India GPS interference incidents, Nov 2023 – Dec 2025 | Lok Sabha, 12 March 2026 |
| 10 | 623 | India GPS interference incidents, Jan – Feb 2026 | Lok Sabha, 12 March 2026 |
| 11 | 319 / 276 / 93 / 85 / 64 / 40 / 19 / 18 / 13 | 2025 incidents by region (SE Asia–Bay of Bengal / NW India / Kolkata / Middle East / Delhi / Chennai / Mumbai / Hyderabad / Arabian Sea) | ICAO, January 2026 |
| 12 | 71% / 54% / 19% / 10% / 6% | India 2025 impacts: loss of GPS / loss of ADS / EGPWS alerts / complete outage / loss of GNSS landing | ICAO, January 2026 |
| 13 | Runway 10, 1 December 2025 | Delhi IGI GPS spoofing on GPS-based approaches | Lok Sabha / Digital Sansad |
| 14 | €1,000 – €77,200 | Commercial diversion cost range (2022 prices) | EUROCONTROL |
| 15 | €1,000–€7,000 / €1,400–€10,500 / €7,000–€77,200 | Regional / continental / intercontinental diversion cost | EUROCONTROL |
| 16 | $98.41 per block minute | US passenger airline direct operating cost, 2025 | Airlines for America |
| 17 | $37.01 / $29.34 / $18.35 / $9.76 / $3.95 | Crew / fuel / maintenance / ownership / other per minute | Airlines for America |
| 18 | $4,428.45 | Illustrative 45-minute delay cost (45 × $98.41) | Derived |
| 19 | > €2 million | Modelled airline costs, Hong Kong geomagnetic-storm GNSS scenario | AGU Journals |
| 20 | Up to €3 million | Modelled passenger costs, same scenario | AGU Journals |
| 21 | All Boeing models | Experienced GNSS interference (ICAO paper IP/04, September 2024) | Boeing / ICAO |
| 22 | 2022 | Denver and Dallas GNSS interference events | FAA GNSS Interference Resource Guide |
| 23 | 4 August 2026 | Boeing three-phase GNSS strategy article | Inside GNSS |

---

## 19. Limitations and Important Distinctions

- **Navigation errors vs GNSS interference:** AA965 and KE801 were navigation-related accidents (FMS, approach procedures, human factors), not GPS spoofing. Their figures must not be combined with interference statistics.
- **Reported events vs accidents:** IATA and Indian figures are reported interference events, not crashes.
- **Overlapping categories:** India's system-impact percentages overlap and do not sum to 100%; some reports lacked complete impact data.
- **Estimated locations:** Some regional incident locations were estimated from incomplete information.
- **Cost estimates:** EUROCONTROL diversion costs are general (not GPS-specific); the $4,428.45 figure is illustrative; Hong Kong figures are modelled, not recorded.
- **No consolidated accident cost:** Public accident reports do not give a complete financial total for AA965 or KE801.
- **Prediction limits:** Predicting exactly when deliberate interference will occur is difficult. A realistic prototype should detect and map reported or observed anomalies rather than claim to predict every future event.
- **Satellite imagery:** Cannot by itself identify GPS spoofing.
- **Zero error:** Cannot be guaranteed; the aim is to minimise undetected errors.
- **Safety authority:** Certified avionics, approved procedures and aviation authorities remain responsible for safety decisions.
- **Derived values:** Totals marked "derived" in this report (e.g. 2,977; 927; 387 fatalities; cost shares) were calculated from the source figures and are not stated in the original sources.
- **Verification:** Figures were compiled from secondary research summaries; verify each against its primary source before formal publication.

---

## 20. Sources and Data References

**Primary sources cited**
1. EUROCONTROL — 2025 GNSS interference report; diversion cost estimates (Standard Inputs for Economic Analyses, 2022 prices). https://www.eurocontrol.int
2. Federal Aviation Administration — AA965 and KE801 accident information; GNSS Interference Resource Guide (Denver and Dallas 2022). https://www.faa.gov
3. NTSB — Korean Air Flight 801 accident report.
4. IATA — 2024 Annual Safety Report; AGM 2026 safety briefing. https://www.iata.org
5. Government of India, Digital Sansad — Lok Sabha answers of 1 December 2025 and 12 March 2026. https://sansad.in
6. ICAO — *India's preparedness for mitigation of GNSS radio-frequency interference* (January 2026). https://www.icao.int
7. ICAO — *Mitigating GNSS Jamming and Spoofing*, IP/04 (September 2024). https://www.icao.int/NACC/Documents/Meetings/2024/NACCWG9/IP04-NACCWG9.pdf
8. Inside GNSS — *Boeing's Approach to Mitigating the Impacts of GNSS RFI* (4 August 2026). https://insidegnss.com/boeings-approach-to-mitigating-the-impacts-of-gnss-rfi/
9. EASA — GNSS interference Safety Information Bulletin. https://www.easa.europa.eu/en/newsroom-and-events/news/easa-updates-safety-information-bulletin-global-navigation-satellite
10. EASA — GNSS outages and alterations. https://www.easa.europa.eu/en/domains/air-operations/global-navigation-satellite-system-outages-and-alterations
11. Transport Canada — GPS/GNSS Interference Civil Aviation Safety Alert (CASA No. 2024-10). https://tc.canada.ca/en/aviation/reference-centre/civil-aviation-safety-alerts/reported-incidents-gps-gnss-interference-civil-aviation-safety-alert-casa-no-2024-10
12. Airlines for America — 2025 U.S. passenger airline direct operating costs. https://www.airlines.org
13. AGU Journals — economic effects of satellite-navigation positioning errors at Hong Kong International Airport (geomagnetic-storm scenario). https://agupubs.onlinelibrary.wiley.com

**Potential data sources for the prototype**
- ICAO — https://www.icao.int
- DGCA India — https://www.dgca.gov.in
- Airports Authority of India — https://www.aai.aero
- Aviation Weather Center — https://www.aviationweather.gov
- EASA GNSS interference monitoring — see source 10

---

*Final recommendation:* Build AeroNav Shield around multi-source navigation verification, AI-based anomaly detection and geographical risk prediction. This is more defensible and technically meaningful than claiming to create a completely error-free GPS system, and it positions the project as a complementary early-warning layer rather than a replacement for existing manufacturer technology.
