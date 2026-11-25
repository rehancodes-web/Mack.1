# Navigation continuity and recovery

## Team research and implementation brief

Prepared for the Mach A Thon Aeromania 26 team. Version 1.0. Research reference date 25 November 2026. Working product name NavContinuity. This document is a project specification and research handoff, not an operational navigation procedure.

The recommended project uses real satellite receiver observations to analyse navigation degradation, then demonstrates how that evidence could support a bounded economic decision. The initial commercial hypothesis is a specialist module for airline operations and maintenance teams. A separate spacecraft scenario supplies a credible orbital extension. The hackathon must distinguish measured satellite results from simulated aircraft outcomes and assumed costs.

The underlying problem is established. The proposed commercial gap is not yet established. Interference detection, aircraft recovery monitoring and airline disruption optimisation already exist. The team must show why combining evidence, equipment-dependent recovery and preparation costs adds something useful to existing workflows. Do not describe this as the world's first system, an unsolved category, a certified navigation product or a demonstrated source of airline savings.

Deliver a small, reproducible result before expanding the product. The first milestone is a successfully parsed real satellite sample. The second is an honest comparison between a baseline and an AI model. The third is a cost-sensitive operational scenario with explicit assumptions. The fourth, if time permits, is a separate orbital task-planning simulation.

## Reading guide and immediate actions

Team lead: read the event requirements, scope decision, evidence register, competition assessment and build schedule first. Data and modelling contributors: read the dataset plan, schemas, validation design and source register before coding. Application contributors: read the user journeys, service contracts and acceptance criteria. Business and pitch contributors: read the economic model, customer interviews and claims policy. Every AI agent should receive this entire document together with the role-specific handoff near the end.

Before assigning implementation work, agree on one region, one historical interval, one primary satellite dataset, one operational decision and one definition of success. Avoid allowing separate agents to choose incompatible datasets, timestamps or geographic interpretations.

Immediate actions are to verify sample access, confirm the dataset licence and product variables, create the observation schema, reproduce a simple baseline, and obtain mentor feedback on the proposed buyer. Do not begin with branding, live alerts, a complex globe, a large neural network or a multi-industry dashboard.

## Event requirements and project fit

The supplied event deck describes a 12-hour hackathon in collaboration with Boeing. Its umbrella challenge is to create economic and strategic value on Earth and in orbit using AI and space-based assets. Track A asks teams to turn satellite data into an economic decision and requires a working demonstration on real data. Track B permits simulations, prototypes or a solid architecture supported by approximate cost and physics. Track C explicitly includes GNSS resilience and requires protective applications without weapons, targeting or tracking individual people. The organiser's accompanying message makes Track A compulsory and B and C additional work as achievable. [S01]

The judging allocation in the deck is economic or strategic impact 30 percent, technical depth and AI use 30 percent, feasibility 20 percent, and demonstration and pitch 20 percent. Teams have five minutes to present. These weights support a modest working prototype with credible economics more strongly than a broad unvalidated product claim. [S01]

Our interpretation is that satellite receiver measurements qualify as satellite data under Track A's broad wording. The starter examples emphasise Earth observation, so confirm this interpretation with an event mentor if possible. GNSS interference is expressly named in Track C, but Track C relevance does not remove the compulsory Track A requirement. Show actual satellite-origin records and the economic decision they inform.

Earth value should be expressed as better preparation for operational disruption. Orbital value should be expressed as assessing navigation degradation experienced by a spacecraft and comparing mission-task options under uncertainty. The two applications share parts of the evidence pipeline but require distinct equipment and impact models. A map labelled Earth and Orbit is not by itself evidence of value in both environments.

## Recommended scope decision

Build a historical analysis and decision-support demonstrator. Its proposed user is an airline maintenance-control or operations-control analyst reviewing a navigation-related disruption and preparing the next aircraft turnaround. The proposed decision is whether to prepare maintenance support or another resource before arrival, given an uncertain chance of unresolved symptoms and subsequent delay.

The real-data component establishes satellite-observed signal anomalies and their limitations. The aircraft component uses a declared scenario unless a partner supplies suitable operational records. Do not imply that a spacecraft anomaly directly proves a particular aircraft suffered interference. Ground or airborne observations are required to validate that connection.

The primary deliverable should answer: what was observed, how reliable is that observation, which operational assumptions were applied, what preparations are being compared, and under which assumptions does each preparation become worthwhile? The software should explain when evidence is insufficient to connect an observation to an operational consequence.

The optional orbital scenario asks whether to keep or move a hypothetical position-sensitive task when navigation quality is degraded. The task value, fallback capability and rescheduling penalty are scenario inputs unless actual mission information is supplied. Do not infer collision probability, image geolocation error or loss of pointing solely from signal strength.

Explicit exclusions for the first build are live navigation commands, cockpit procedures, autonomous flight decisions, transmitter localisation, interference-source attribution, hardware design, a replacement positioning service, a complete airline recovery optimiser and claims of spoofing detection from a low-signal threshold.

## Problem explanation

Global Navigation Satellite Systems provide positioning, navigation and timing. GPS is one such system; Galileo, GLONASS and BeiDou are others. The useful concept is PNT, because a disruption can affect time as well as position. A receiver may lose trustworthy observations, compute an incorrect solution or fail to recover normally after an encounter.

Jamming generally overwhelms or degrades reception. Spoofing supplies misleading signals that can cause an incorrect position or time solution. An anomaly in signal quality does not establish which mechanism occurred. Ordinary geometry, obstruction, reflections, receiver changes, antenna behaviour and natural effects can also influence observations. Treat mechanism attribution as a separate inference requiring evidence. [S02, S13]

The first operational difficulty is recognising degraded capability. The second is determining which dependent systems and procedures remain available. The third is coordinating preparation and recovery. The fourth is preventing the first disruption from creating avoidable consequences for subsequent operations. This project concentrates on the third and fourth difficulties while using evidence from the first two.

The important distinction is between environmental recovery and equipment recovery. An aircraft may leave an affected region while some symptoms remain. Conversely, a report of interference in a region does not mean every aircraft there will suffer a significant consequence. Configuration, route, flight phase, backup capabilities and available procedures matter.

## Evidence register and reported problems

### Airline recovery findings

IATA's February 2026 GNSS interference risk assessment refers to approximately 370000 flights and reports that airborne receiver recovery can exceed 30 minutes in a significant number of cases. The statement supports the existence of recovery uncertainty; it does not give a universal probability for any aircraft arriving late. A related airline-perspective presentation hosted by ICAO states that some receivers require ground maintenance resets. Neither finding authorises us to prescribe a reset or infer which aircraft requires one. [S03, S04]

Project implication: recovery should be a distribution conditioned on equipment and symptoms when records exist. Until such records are available, use a scenario parameter and label it as assumed. Do not turn the phrase significant number into an invented percentage.

### Boeing monitoring evidence

Boeing engineers describe over 1.3 million GPS Event Monitor reports from more than 1000 unique aircraft across 52 operators. In the analysed 777 and 787 symptom groups, approximately 37 percent of flights experiencing GPS loss, position error and date or time error landed with both receivers recovered, compared with almost 81 percent in the GPS-loss-only group. These are conditional results from that dataset, not general airline recovery rates. [S05]

The same source describes an existing system that records entry, continuing symptoms and recovery and supports equipment-specific analysis. This is both evidence of need and a direct warning against claiming novelty for basic recovery monitoring. The event-report count is not a count of independent incidents or affected flights. [S05]

Project implication: the useful extension to investigate is preparation and resource economics around recovery, not rebuilding GEM. Production work would require legitimate access to appropriate airline records and a clear integration agreement.

### Finnair and Tartu service interruption

The Tallinn Airport operator announced a suspension of Helsinki to Tartu flights from 29 April to 31 May 2024 due to GPS interference while alternative arrangements were developed. This is a concrete example of a commercial route losing service availability. Estonia's transport authority separately stated that Tallinn Airport operations were unaffected. The contrast illustrates the importance of airport and procedure capability rather than implying universal closure. [S06, S07]

Project implication: an operational model needs airport-specific and aircraft-specific constraints. This incident does not prove that our proposed software could have prevented the interruption. Infrastructure and procedural changes can be the appropriate solution; decision support cannot substitute for them.

### European aviation coordination

EASA and EUROCONTROL published a joint action plan in March 2026, addressing concerns raised by 13 EU member states. EUROCONTROL's November 2026 guidance covers preparedness, coordination, response and recovery. EASA's July 2026 bulletin update includes communication, electronic flight bag, training and capacity considerations. These publications show an active institutional response and existing operational frameworks. [S08, S09, S10]

Project implication: a future product should support established reporting and coordination workflows. It should not invent incompatible alerts or automatically restore normal operations based on its own model score.

### Reports from operational communities

OPSGROUP published a GPS spoofing workgroup report in September 2024. It is useful as a source of practitioner concerns and an interview guide, rather than as evidence that every concern can be solved by software. General Reddit discussions about Tartu corroborate public attention but are not used as primary technical evidence or willingness-to-pay evidence in this specification. [S11]

Project implication: interview people who actually own the affected decision. A passenger complaint may reveal inconvenience but usually will not establish maintenance data availability, integration requirements or the purchasing process.

### Maritime and offshore operations

IMO, ICAO and ITU jointly expressed concern about increasing satellite-navigation interference in March 2025. IMCA published guidance in April 2026 addressing marine operations and dynamic positioning. The UK Maritime and Coastguard Agency issued guidance in October 2026 on navigation in GNSS-denied and degraded environments. These are distinct maritime needs with different backup systems and operating practices. [S12, S14, S15]

Project implication: maritime operations are a plausible later market, but the airline model cannot simply be relabelled. A dynamic-positioning vessel needs information about its reference systems and work constraints; a cargo ship needs a different operational model.

### Satellite navigation in orbit

SAT-JAM is a research product that maps interference-like degradation experienced by selected Sentinel spacecraft using onboard GNSS observations and orbit files. Its published limitations include delayed data and the fact that a spacecraft's location is not a transmitter location or proof of ground-level jamming. Its method provides a reproducible starting point and a competing baseline. [S16]

Project implication: the orbital extension has a direct satellite-data foundation. However, a receiver anomaly does not establish actual mission harm without mission telemetry and an orbit or task-quality model.

### Timing dependence in other industries

ESA documents GNSS-based time synchronisation applications in telecommunications, energy and finance. This establishes dependency, not a specific incident rate or a validated market for this product. Timing applications would require local clock-health measurements, backup-clock performance and different decision thresholds. [S17]

Do not promise one universal model that handles aircraft, ships, satellites and financial systems. Preserve a common evidence schema and build separate domain modules only after validating demand.

## Who experiences the problem and who might pay

Airline flight crews experience workload and capability changes, but they may not be the buyer. Operations-control managers care about continuity and the schedule. Maintenance-control managers care about preparation, approved checks and aircraft readiness. Engineering teams care about recurrent faults and configuration changes. Procurement and IT care about integration, reliability and cost. The first customer interview should identify which team owns the action our product would change.

Airports and air-navigation service providers could use historical evidence to review contingency readiness or capacity scenarios. They would require approved procedure information and a clear separation between an analytical estimate and operational authority. This is a separate sales and validation process from selling to an airline.

Maritime buyers could include fleet operations managers and offshore project managers. Their economic concerns may include waiting time, interrupted work windows and support-resource readiness. These are proposed value mechanisms, not measured benefits of our system. Satellite operators might pay for a navigation-quality assessment or task-planning input if it demonstrably improves mission decisions.

For telecom and energy, the more plausible extension is readiness of backup timing and maintenance prioritisation. The software would need equipment telemetry and must compete with existing timing assurance products. These sectors are a research backlog, not part of the hackathon customer claim.

The first commercial segment should be a fleet with repeated exposure, a costly preparation decision, enough relevant records and an accessible operations sponsor. Global relevance does not require global deployment on day one. Demonstrate one credible workflow and show which parts transfer.

## Existing solutions and competitive boundary

Spire markets satellite-based interference detection and characterisation. Jeppesen supplies interference awareness within flight-planning and cockpit-map workflows. Boeing's GEM system reports aircraft events and recovery. SAT-JAM supplies orbital degradation mapping. General airline-disruption products, including Orbit by M2P, connect aircraft, crew, maintenance and schedule decisions. These products occupy substantial portions of the proposed workflow. [S05, S16, S18, S19, S20]

The candidate product gap is an equipment-aware preparation module that takes navigation-degradation evidence, estimates recovery uncertainty where supported and quantifies the value of specific preparatory actions. Public research has not established that this gap is unserved. Internal airline systems and unpublished vendor capabilities may already address it.

The defensibility hypothesis is integration quality, validated recovery outcomes, reliable uncertainty, useful action-specific economics and adoption in an existing workflow. A generic AI layer or a new dashboard is not a defensible advantage. A future product may be sold as an API or module to an existing operations platform rather than as a standalone control centre.

Competitor validation should ask whether the product already supports equipment-specific GNSS recovery outcomes; whether it connects them to station readiness and subsequent flight risk; whether it uses direct aircraft records or inferred observations; and what users still do manually. Record answers with the product version and evidence date. Marketing silence does not prove absence.

## Product behaviour and user journeys

### Historical analyst journey

An analyst selects a historical date window and the available spacecraft observations. The application displays the sampling coverage before displaying anomaly results. The analyst can inspect measurements, source files, quality exclusions and model version. A timeline shows when observations exist and when the system has no evidence. Selecting an anomaly reveals the baseline, model score and alternative explanations that remain unresolved.

The analyst then opens a declared operational scenario. The scenario may use a manually specified aircraft fault state to avoid implying that the satellite measurements prove the aircraft's condition. The cost engine compares the available preparations and identifies assumptions to which the result is sensitive. The export contains the evidence time, model version, scenario inputs and chosen comparison.

### Future airline journey with partner data

With permission and suitable integration, an airline sends a symptom event, equipment configuration, planned arrival and next-flight schedule. The model returns a calibrated recovery estimate or abstains when the configuration is unsupported. The preparation engine checks resource availability and presents admissible options. An authorised human records whether the suggestion was accepted and why. The actual outcome is logged for evaluation.

This is a proposed future workflow. It is not available from the public satellite archive alone. A model probability must not be treated as a maintenance release or as confirmation that an approach is available.

### Orbital scenario journey

A mission analyst selects a historical spacecraft receiver anomaly. The application shows the actual receiver measurements and their orbital context. A separate scenario provides a hypothetical task, its timing flexibility, a navigation-quality constraint and a cost of delay. The demonstration compares keeping the task with moving it to another window. If no validated mapping from receiver observations to task quality exists, that mapping remains an editable simulation assumption.

The goal is to demonstrate the structure of an economic decision, not to claim a recovered mission or an accurate orbit solution from an anomaly detector.

## Functional requirements

FR01 Ingest at least one real satellite product and preserve its unmodified original or an immutable manifest with access instructions and checksums.

FR02 Record satellite identity, receiver or channel identity when available, product version, observation timestamp, ingest timestamp, source coordinates, coordinate meaning, units and quality flags.

FR03 Display coverage and missingness explicitly. No observations must be represented as unknown, not zero risk.

FR04 Implement a transparent statistical baseline before the AI model. Preserve model parameters, train interval, exclusions and random seeds where relevant.

FR05 Produce a measurement anomaly score. Do not attach a mechanism label such as spoofing unless independently validated for that label.

FR06 Permit an analyst to inspect individual observations and trace an aggregate result back to source records.

FR07 Maintain separate observations, inferred exposure, equipment symptoms, recovery estimates and economic decisions. Each transition must specify its assumptions.

FR08 Compare at least two feasible preparation options in a scenario. Use an explicit no-preparation comparator and include the cost of false positives.

FR09 Show sensitivity to the uncertain disruption probability, preparation effectiveness, delay costs and resource cost.

FR10 Label real, derived, assumed and simulated inputs visibly. Export those labels with the result.

FR11 Provide a cached historical replay that works without live data access. It must show that it is a replay and identify the observation dates.

FR12 Support a versioned result export, preferably JSON plus a readable summary. A reviewer should be able to reproduce the calculation without the interface.

## Nonfunctional requirements

The prototype should run locally on the team's available hardware using a small cached dataset. Choose a manageable subset rather than promising continuous global ingestion. Set a practical target of loading the cached demonstration within a few seconds, then measure actual performance and report it honestly.

Reproducibility requires pinned package versions after environment validation, immutable input references, deterministic feature transformations and documented commands. Availability requires clear errors when a file is absent, an API is unavailable or a model cannot process the selected configuration. The application must not silently substitute mock data.

Privacy requires minimising operational identifiers. Use pseudonymous fleet and flight identifiers in shared development data unless explicit permission allows identifiable records. Keep credentials out of notebooks, logs and browser code. Do not request private airline access merely to make a demo appear more realistic.

Human control requires reviewable recommendations and explicit boundaries. The prototype issues no commands to aircraft, vessels or spacecraft. It does not provide operational flight instructions. A future deployment would need a separate engineering and approval process appropriate to its actual role.

## Satellite dataset selection and access plan

### Sentinel onboard observations

Copernicus documentation lists Sentinel-1 GNSS auxiliary data as AUX_GNSSRD in RINEX format. Obtain the relevant product documentation, an actual observation file and a compatible orbit file. Check the RINEX version, observation types, time system, compression, file availability and applicable access conditions before writing a parser. [S21]

Useful fields may include carrier-to-noise-related observations, tracked signal identities, time and other receiver measurements. Availability depends on the product; inspect the file instead of assuming every field exists. Preserve original observables and units. A receiver observation belongs to a spacecraft and signal, not a ground airport.

Use orbit data to describe the spacecraft location at each observation. Keep coordinate frames explicit. An Earth-centred position, a latitude and longitude and a signal reflection point are not interchangeable. If interpolation is used, document the method and reject times outside the valid orbit span.

This dataset is particularly suitable for the orbital portion and for a reproducible historical analysis. It is not a live airline feed. Use latency information to decide which use cases are defensible.

### CYGNSS observations

NASA's CYGNSS Level-1 product includes reflected GNSS measurements, noise and quality information. Data access can require Earthdata authentication. The research by Shin and Son demonstrates a lightweight interference-monitoring approach using channel-wise noise-floor values and temporal or multi-satellite screening. Reproduce a documented baseline on a small interval if this product is selected. [S22, S23]

Validate the chosen region against the mission's actual coverage and the retrieved files. Do not select a northern European aviation case and assume CYGNSS provides the necessary coverage. Confirm variable names, valid ranges, scale factors, fill values and quality flags in the current product documentation and file metadata.

CYGNSS reflection geometry matters. Store the spacecraft location and specular-point location separately if both are used. An unusual noise value is not automatically a mapped jammer or proof of aircraft impairment. Use independent observations for corroboration and report the spatial and temporal tolerance of that comparison.

### Operational and context sources

Independent evidence can include published interference notices, regulator summaries, research event windows and authorised aircraft or vessel reports. Treat self-reported incidents and aggregate regional reports according to their accuracy and reporting bias. A notice of a planned test does not establish exact realised exposure at every point in its area.

Aircraft position broadcasts and vessel AIS can provide context when legitimately accessible. They may themselves be degraded or misleading during interference. Do not treat a corrupted position as independent ground truth. Public access to some records does not imply unrestricted historical access or redistribution rights.

Detailed recovery prediction needs timestamps for onset and resolution, symptom types, relevant configuration, interventions and outcomes. If these are absent, record a data gap rather than fabricate labels. A general-purpose public GNSS interference laboratory dataset is not automatically representative of airline receiver recovery.

### Access gate

Within the first 90 minutes, retrieve at least one usable real observation file, parse it, list the actual variables and produce a small plot. Log the source URL, product version, observation dates, retrieval time and checksum. If access fails, try the alternative documented satellite source within the time budget. If neither is usable, report the Track A blocker rather than substitute synthetic data under a real-data label.

The project has not yet downloaded or validated these datasets. This document identifies documented candidate sources and the checks the implementation team must perform.

## Data schema and provenance contract

Use UTC for stored timestamps and preserve the original time system when converting. Record how GPS time or other time scales are converted. Do not assume all source timestamps are UTC. Leap-second handling must be delegated to a tested library or a documented conversion, with a unit test covering the chosen data interval.

An observation record should contain the following fields. Fields unavailable in the actual product remain null with an explanation; do not populate plausible-looking values.

```json
{
  "observation_id": "unique stable identifier",
  "source_product": "actual product name",
  "source_version": "actual version",
  "source_file": "manifest reference",
  "source_sha256": "checksum",
  "satellite_id": "actual platform",
  "receiver_id": null,
  "channel_id": null,
  "observed_at_utc": "ISO 8601 timestamp",
  "original_time_system": "declared by source",
  "available_at_utc": null,
  "ingested_at_utc": "ISO 8601 timestamp",
  "location_type": "spacecraft or specular_point",
  "coordinate_frame": "declared frame",
  "latitude_deg": null,
  "longitude_deg": null,
  "altitude_m": null,
  "measurement_name": "actual observable",
  "measurement_value": null,
  "measurement_unit": "source unit",
  "quality_flags": [],
  "evidence_type": "observed"
}
```

Maintain a separate anomaly record with observation references, baseline value, score, threshold version, feature version, model version, exclusion reasons and uncertainty. A score is not a probability unless it has been calibrated for a defined event and validated accordingly.

Maintain a separate scenario record with asset configuration, symptom assumptions, time to arrival, time to next task, resource options, costs, currency, price basis, scenario version and provenance for every parameter. Each parameter needs a value, unit, origin and confidence or range where relevant.

Maintain a separate decision record with feasible options, total expected cost per option, sensitivity results, constraints checked, assumptions, recommended preparation and an abstention reason when no recommendation is justified.

The manifest should also contain dataset licence or terms, retrieval method, required account, allowed redistribution, known latency, coverage, transformations and the contributor who verified it. A cached archive must not be distributed beyond its permitted use.

## Processing pipeline

Stage 1 retrieves a bounded historical subset and validates file integrity. Stage 2 parses measurements and converts timestamps and coordinates without discarding provenance. Stage 3 applies product-specific quality checks and reports exclusion counts. Stage 4 builds features and coverage summaries. Stage 5 computes a baseline and an AI result. Stage 6 links independently supported context. Stage 7 runs an explicitly declared operational scenario. Stage 8 exports evidence and calculations.

All stages should be callable independently. A plotting function must not quietly clean or modify data differently from the model pipeline. A cost function must not reach into the raw satellite file and invent an aircraft fault state. Use versioned intermediate files so an error can be traced to the responsible stage.

Quality checks should cover duplicate timestamps, missing values, out-of-range coordinates, unexpected units, incorrect time conversion, unsupported product versions and observations with product flags that make them unsuitable. Summarise retained and excluded records before presenting model accuracy.

If aggregating observations, store the number of observations, contributing platforms, time interval, coverage fraction if definable, aggregation rule and uncertainty. Never compare a dense cell with a sparse cell as if their evidence were equivalent. Geographic smoothing can make a map look complete while hiding missing coverage; avoid it in the first demo.

## Baseline and AI design

### Baseline first

For a Sentinel-style signal-quality analysis, begin with a robust historical comparison within compatible receiver, signal and geometry groups. A median and median absolute deviation or another transparent method may be appropriate, but the grouping and thresholds must be justified for the actual observations. A simple global threshold can serve as a comparison, not as established truth.

For a CYGNSS reproduction, use the chosen paper's documented variables and screening logic after checking the product version. Credit the method. Compare any modification against it on the same held-out data. A more complicated model that performs worse is not an improvement.

The baseline output is an anomaly indicator or score. If a paper uses the term interference detection, distinguish reproduction of that experimental setup from a claim of broad operational detection capability.

### Candidate machine learning model

Start with a small model compatible with the available labels. With no reliable labels, an Isolation Forest can provide anomaly scores for comparison with the baseline. With reliable event labels and sufficient independent events, a modest supervised classifier may be considered. Feature engineering and validation are more important than model size.

Candidate features include normalised signal metrics, short-window variability, deviation from an expected pattern, persistence across observations and agreement across independently sampled channels. Geometry and receiver context should be included when supported. Do not treat highly correlated channels or adjacent observations as independent events.

Avoid training a high-capacity model on a tiny selected interval. Avoid presenting unsupervised anomaly scores as calibrated disruption probabilities. If only one interesting event is available, show a case study rather than claiming a general detector.

### Recovery modelling after partner data

When outcomes are available, define the event precisely. Time to symptom resolution, time to confirmed equipment recovery and time to operational release are different labels. Separate them. Ground interventions can change outcomes and should be recorded. Configuration changes and software versions can alter the relationship over time.

A survival model may be appropriate for time-to-recovery data because some observations end before recovery is seen. A binary classifier for unresolved-at-arrival is simpler but depends strongly on remaining flight time and data completeness. Do not assume an observation censored at landing proves the equipment never recovered.

Use equipment identity and symptoms with care to avoid memorising an individual aircraft or airline. Evaluate transfer to unseen configurations only if the data support it. Unsupported configurations should produce an abstention rather than a confident prediction.

### LLM role

An LLM is optional. If used, its role is to explain structured results and retrieve relevant passages from approved source material with citations. It must not generate the probability, change constraints, invent maintenance instructions or silently fill missing telemetry. Preserve the structured calculation as the authoritative result.

The prototype remains an AI project without an LLM if it implements and evaluates a real machine-learning component. A chatbot attached to a static map does not satisfy the technical objective.

## Validation and experiment design

Split by time and independent event or region, rather than randomly splitting adjacent observations. A random split can leak almost identical samples into training and testing. If the use case claims geographic transfer, test on a separate area where suitable observations exist. If data are too limited, narrow the claim to the observed interval.

Compare models at meaningful operating points. Useful measurements include precision and recall when labels are trustworthy, false alerts per monitored interval, detection delay, event-level detection and the proportion of observations on which the model abstains. For probabilistic outputs, examine calibration and an appropriate probabilistic score. Report denominators and uncertainty rather than a single impressive accuracy number.

Independent validation can involve an event window, regulator report or another receiver source, but each has limitations. Report temporal tolerance, spatial interpretation and whether the sources are truly independent. If no trustworthy labels exist, evaluate data handling and qualitative consistency; do not manufacture a confusion matrix.

The economic simulation needs a separate evaluation. Compare preparations under identical scenarios, include the price of unnecessary preparation and vary the most influential assumptions. A lower simulated expected cost is not a measured airline saving. Distinguish an algorithmic result from the quality of its assumed probabilities.

Required ablations are baseline versus AI, quality filtering versus no filtering, operational scenario with satellite evidence versus without it where a justified linkage exists, and preparation versus no preparation. If satellite evidence does not change any supported decision, the team must explain what its actual role is rather than claiming it drives the economics.

For a small hackathon, the most valuable outcome may be a carefully bounded finding: the model identifies a historical anomaly but cannot establish aircraft impact; the scenario shows what additional data would make that anomaly decision-relevant. This is weaker than a validated product but stronger than an unsupported demonstration.

## Economic model and decision logic

Define mutually exclusive outcomes and avoid counting the same loss twice. For each feasible preparation, estimate its direct cost plus the expected residual consequence cost. Use one currency and a clearly stated price basis. Distinguish lost revenue, lost contribution margin, extra operating cost and passenger-service expenditure. They are not interchangeable.

An initial model is expected total cost of action a equals preparation cost of a plus the sum over outcomes of probability of outcome given a multiplied by consequence cost. Safety and operational constraints determine which actions are feasible before the cost comparison. They must not be converted into a cheap penalty that allows the optimiser to choose an inadmissible action.

The preparation-effectiveness assumption is causal. It asks how much the action changes a consequence, not how strongly preparation correlates with difficult flights. Observational records may be biased because teams prepare more often for severe events. A production claim needs an appropriate study design, expert review or a controlled operational evaluation.

The following numbers are entirely illustrative. Suppose the chance of a specific downstream disruption is 0.20, its incremental consequence cost is 20000 dollars, preparation costs 800 dollars and preparation reduces that chance to 0.08. Expected cost without preparation is 4000 dollars. Expected cost with preparation is 2400 dollars. The simulated benefit is 1600 dollars per scenario. This is not an airline benchmark or a measured saving.

Break-even preparation cost in that example is (0.20 minus 0.08) times 20000, or 2400 dollars. If the assumed probability reduction is overstated, the recommendation may reverse. A sensitivity plot should show the break-even boundary rather than presenting the central estimate as certain.

Include at least three sensitivity cases: a low disruption probability, a high unnecessary-preparation cost and a weak action effect. Report when no preparation is economically preferable. A tool that always recommends intervention is not a meaningful decision system.

A future business case should estimate eligible decisions per year, marginal benefit per improved decision, adoption rate, false-positive cost, integration cost, recurring operating cost and software fee. Do not multiply a national GNSS outage estimate by an arbitrary market share. The UK government's 2023 figures of 1.42 billion pounds for a hypothetical 24-hour national outage and 7.64 billion pounds for seven days describe scenario-based economic dependence, not this product's market size. [S24]

Potential commercial structures include a paid fleet pilot, a module licence or an API contract through an existing operations platform. Prices are not established. Start with the cost of the decision and the buyer's procurement process rather than inventing a subscription fee.

## Architecture and repository contract

Use a small local architecture with explicit boundaries. A Python data pipeline is a reasonable starting choice because the work involves scientific data parsing and modelling. A simple local interface is sufficient. Select and pin actual packages only after checking availability, supported file formats and licences. Do not let framework setup consume the event.

Suggested components are an ingestion adapter, a normalisation and provenance layer, a feature builder, a baseline detector, an optional AI detector, an evidence report, a scenario engine, a cost comparator and a presentation interface. The scenario engine should accept explicit inputs rather than directly interpreting a satellite score as aircraft failure probability.

Suggested repository layout follows. This is a proposed layout, not an existing implementation.

```text
navcontinuity/
  README.md
  requirements.lock
  configs/
    data_source.yaml
    experiment.yaml
    scenario.yaml
  data/
    manifests/
    raw/
    processed/
    fixtures/
  src/
    ingest/
    normalize/
    features/
    baseline/
    models/
    evidence/
    scenarios/
    economics/
    app/
  tests/
    fixtures/
    test_units.py
    test_time_conversion.py
    test_data_quality.py
    test_scenarios.py
    test_economics.py
  reports/
    data_card.md
    model_card.md
    experiments.csv
    claim_register.csv
  outputs/
    demo_result.json
    evidence_report.html
    presentation/
```

Do not commit credentials, private airline records or large raw files without permission and a repository plan. The manifest and download instructions may be more appropriate than redistributing raw data. A fixture must identify whether it is a small authorised real sample or synthetic test data.

Every module should provide a callable function and one reproducible command or notebook entry point. Document input and output schemas. Agree on units, timestamps and missing-value representation before parallel implementation begins. Do not implement the same feature transformation independently in the interface and the model.

The team lead owns schema changes. A contributor proposing a new field must explain its meaning, provenance and downstream effects. Increment the schema version when a change is not backward compatible. Keep code readable enough that another teammate can reproduce a result without the original author.

## Service and file interface specification

HTTP endpoints are optional for the first build. The following contracts can be implemented as local functions or JSON files. Avoid adding a server merely to create an appearance of sophistication.

The observations interface accepts source selection and a time window and returns observation references plus coverage, quality and availability metadata. It rejects unsupported versions and invalid intervals. The analysis interface accepts a dataset manifest and experiment configuration and returns baseline and model outputs plus a reproducibility record.

The scenario interface accepts a scenario version, parameters and evidence references. It returns admissible actions, expected costs, assumptions and sensitivity results. The evidence interface returns a human-readable report that separates measurements from model outputs and scenario assumptions.

An illustrative decision export is shown below. Numeric values are the same invented economic example used earlier; this is not measured operational output.

```json
{
  "schema_version": "1.0",
  "run_id": "example_run",
  "mode": "historical_replay_with_simulated_operations",
  "evidence_refs": ["manifest_reference"],
  "aircraft_impact_link": "not_validated",
  "scenario_version": "example_v1",
  "currency": "USD",
  "parameters": {
    "disruption_probability_without_preparation": {
      "value": 0.20,
      "origin": "assumed"
    },
    "disruption_probability_with_preparation": {
      "value": 0.08,
      "origin": "assumed"
    },
    "disruption_incremental_cost": {
      "value": 20000,
      "origin": "assumed"
    },
    "preparation_cost": {
      "value": 800,
      "origin": "assumed"
    }
  },
  "comparisons": [
    {"action": "no_preparation", "expected_cost": 4000},
    {"action": "prepare_support", "expected_cost": 2400}
  ],
  "preferred_scenario_action": "prepare_support",
  "simulated_expected_benefit": 1600,
  "operational_authorisation": false
}
```

If a genuine partner model later supplies probabilities, attach model version, calibration interval, supported equipment population and confidence information. Do not merely replace assumed with predicted. The prediction needs an auditable origin and an applicable validation population.

Error conditions should include missing dataset, expired credentials, unavailable variable, unsupported coordinate frame, invalid time conversion, insufficient coverage, unsupported equipment configuration, missing cost input, infeasible actions and stale evidence. The interface should explain the specific problem and preserve the last valid historical result without presenting it as current.

## Interface content and demonstration flow

The landing view should state the question being answered, the historical interval and whether the operations layer is simulated. Put the dataset coverage and data age near the result. Use a measurement timeline as the main evidence view; a map can provide context but must not imply complete coverage.

A useful evidence panel includes the source product, file reference, actual measurements, exclusions, baseline threshold, AI score and a short interpretation. The interpretation might say that reception was unusual relative to the selected baseline and that the mechanism remains unconfirmed. It should not automatically declare an attack.

The scenario panel should show the asset assumptions, remaining time, preparation options and costs. Allow a reviewer to change one important assumption and see the preferred action reverse at a sensible boundary. That interaction demonstrates the economic logic more convincingly than a static savings counter.

The results panel should show all compared actions, expected costs and sensitivity. Include an explicit statement when the satellite-to-aircraft connection has not been validated. A source drawer or export can contain the full provenance, but material limitations must remain visible in the main result.

The orbital panel should use the same evidence conventions and a distinct domain model. Show real spacecraft observations alongside simulated task consequences. The user should never need to infer which side is real.

Avoid a fake live indicator, precise probabilities from an uncalibrated anomaly score, unsupported global coverage, invented customers, fabricated incident histories, automatic maintenance instructions or guaranteed savings. Do not label every green map cell safe.

## Detailed acceptance tests

AT01 Real-data provenance: a reviewer can trace at least one plotted point to a genuine source file and its documented observable. Pass only if the file reference, timestamp, unit and transformation are recoverable.

AT02 Missingness: remove a segment of observations. The interface displays a coverage gap and the detector does not generate an all-clear message for the missing interval.

AT03 Product quality: introduce a documented invalid or fill value in a test fixture. The parser excludes or flags it according to the source rules and counts the exclusion.

AT04 Units: supply a deliberately incompatible unit or coordinate frame. The pipeline rejects it rather than applying the wrong threshold.

AT05 Time: test a known timestamp conversion in the selected interval and verify that observation time, availability time and ingestion time remain distinct.

AT06 Reproducibility: run the same cached experiment twice. Outputs match within a declared numerical tolerance and identify the same inputs and model version.

AT07 Baseline comparison: the report includes both the baseline and the AI result on the same held-out evidence. It reports failure or no improvement honestly.

AT08 Leakage: inspect the split manifest and confirm that adjacent or duplicate samples from one event have not been counted as independent evidence across train and test.

AT09 Geographic meaning: spacecraft positions and reflection points cannot be confused in the schema or interface. No automatic ground-risk polygon is generated from spacecraft position alone.

AT10 Cost arithmetic: the illustrative example returns 4000, 2400 and 1600 dollars respectively. The implementation rejects negative probabilities, probabilities above one and missing currencies.

AT11 Decision reversal: increase preparation cost above the break-even value in the example. The preferred action changes to no preparation, provided both options remain feasible.

AT12 Constraint enforcement: mark an action unavailable. It cannot be recommended merely because it has a lower numerical cost.

AT13 Uncertainty: remove the recovery probability or mark the equipment unsupported. The system abstains or runs an explicitly hypothetical sensitivity analysis; it does not invent a confident estimate.

AT14 Simulation labelling: exported results retain the origin of every assumed parameter. A screenshot alone should not imply measured airline savings.

AT15 Offline replay: disconnect external access after caching permitted inputs. The demonstration still works and shows historical observation dates.

AT16 Claim traceability: every quantitative presentation claim is either tied to a source, a reproducible experiment or an explicitly illustrative calculation. Claims that fail this test are removed.

## Work packages and dependencies

WP1 Evidence and product scope owns the claim register, competitor matrix, event requirements and customer questions. It delivers a one-page scope agreement before the application is built. It can run alongside dataset exploration but must not change the scientific interpretation without discussing it with the data owner.

WP2 Data access and provenance owns retrieval, parsing, units, timestamps, quality filtering and manifests. Its first deliverable is a real sample and a data card. Modelling depends on this package. Interface work can use a clearly synthetic fixture until the schema is stable, but the final Track A demonstration requires real data.

WP3 Baseline and AI owns feature definitions, split manifests, baseline reproduction, model training and evaluation. It delivers a model card and a compact result file. It does not define business probabilities from anomaly scores without evidence.

WP4 Scenario and economics owns the action set, feasibility checks, cost calculation, sensitivity and test cases. It can begin using explicit scenario inputs while modelling proceeds. It must not imply that a satellite score has a validated causal relationship to aircraft disruption.

WP5 Application and integration owns the evidence timeline, coverage display, scenario controls, exports and offline replay. It consumes the shared schemas. It must not silently replace missing fields or reinterpret model outputs.

WP6 Validation and pitch owns reproducibility, claim checking, demonstration rehearsal and the final presentation. It should review early rather than waiting until the last hour. A team member should be able to explain every number without relying on an AI-generated narrative.

For a three-person team, combine WP1 with WP6, WP2 with WP3, and WP4 with WP5. For a four-person team, keep data and modelling separate while one person owns integration. For larger teams, keep a single schema owner and integration branch to prevent duplicated work.

## Twelve hour execution schedule

Hours 0 to 1: freeze scope, inspect the event requirements, select the primary dataset and retrieve a sample. Produce the initial manifest and schema. The lead starts the competitor and claim register. A failure to access data is escalated immediately.

Hours 1 to 2: parse real measurements, confirm units and time, create a coverage view and identify obvious data-quality issues. Select one usable historical interval. Decide whether Sentinel or CYGNSS is the primary route based on actual files, not aesthetic preference.

Hours 2 to 4: implement the baseline and produce a first reproducible result. Build cost arithmetic separately with unit tests. The interface uses the agreed schema and marks any fixture data as synthetic.

Hours 4 to 6: add a small AI model only if the baseline and data quality are understood. Freeze the evaluation split. Connect the first real result to the interface. At hour 6, remove optional features if the core replay is not working.

Hours 6 to 8: finish the bounded preparation scenario, assumptions editor and sensitivity comparison. Connect provenance and exports. Ensure the aircraft-impact link is not overstated. Begin the orbital scenario only if the primary evidence and economic workflow work end to end.

Hours 8 to 10: implement the orbital scenario if feasible, run the acceptance tests and prepare cached replay inputs. Compare the final model with the baseline. Remove unsupported labels and inspect all screenshots for misleading claims.

Hours 10 to 11: prepare the five-minute pitch, rehearse the demonstration and assign speakers. Record actual runtime, input coverage, model performance and limitations. Do not invent better numbers to improve the story.

Hours 11 to 12: run the complete demonstration from a clean launch, check exports and rehearse failure recovery. Freeze changes except critical fixes. Prepare a local screen recording or screenshots as a fallback, clearly labelled as recorded output.

## Product validation after the event

The first post-event task is customer discovery, not global scaling. Seek a small number of interviews across airline operations, maintenance control and avionics engineering. Obtain permission before sharing any company-specific information. Ask about the latest actual encounter, what information was missing, who acted, what preparation was possible and what the current tool already does.

Useful interview questions include: Which decision could have changed with earlier information? How often does the relevant decision occur in your operation? What is the cost of preparing unnecessarily? What outcome data are recorded? Which equipment differences matter? Who can approve a pilot? What would make you reject this recommendation? What data can be supplied in anonymised form? Which vendor already comes closest?

Do not ask only whether the idea sounds useful. Ask for a concrete workflow and a measurable decision. A positive reaction is not purchase intent. A strong signal is an identified owner, access to suitable historical records, a defined evaluation and a willingness to allocate time or budget to a pilot.

A partner pilot should first run retrospectively and then in shadow mode. Define the current baseline, eligible decisions, exclusion rules, false-positive cost and success metric before observing results. Shadow mode means the product is evaluated without automatically changing operations. Any later operational role needs the partner's appropriate engineering and approval process.

The commercial stop conditions are that existing tools already solve the chosen workflow adequately, no actionable preparation exists, data needed for validation cannot be obtained, false-positive costs dominate, satellite information adds no incremental value, or integration effort exceeds plausible benefit. A stop decision is a valid research outcome.

## Further domains and required additions

### Airports and air navigation

Potential use is assessing historical exposure together with available contingency procedures and infrastructure. The output might support investment or readiness reviews. Required additions are procedure status, navigation-aid availability, traffic demand and a domain-reviewed capability model. This is not a real-time airport-open or airport-closed decision based on satellite observations.

### Commercial shipping

Potential use is evidence consolidation for passage planning and equipment checks after interference. Required additions are vessel configuration, independent navigation observations, voyage context and bridge procedures. AIS data can be corrupted and must not automatically serve as ground truth. Customer discovery should focus on a fleet operator's existing workflow and the price of an avoidable interruption.

### Offshore work

Potential use is planning around GNSS-dependent work and the readiness of alternative position references. Required additions are dynamic-positioning configuration, work limits, environmental conditions, vessel status and approved operating procedures. The product must not autonomously declare a work window safe or alter a vessel's control system.

### Spacecraft missions

Potential use is prioritising analysis of navigation-quality events and assessing task flexibility. Required additions are validated navigation-quality estimates, spacecraft configuration, mission-task requirements and fallback capability. Ground review prioritisation may be a simpler initial product than automatic rescheduling. Do not infer mission damage or reduced satellite life from a signal anomaly alone.

### Timing infrastructure

Potential use is prioritising backup-clock checks and maintenance when a site may be exposed to GNSS degradation. Required additions are local timing measurements, holdover performance, independent timing references and sector-specific constraints. National GNSS dependence does not establish that a satellite-data product can detect a local timing problem.

### Manali roads and black ice

This project does not detect black ice. Its possible road-transport extension concerns navigation reliability or dispatch continuity. Detecting black ice would require a separate physical model and appropriate road or weather observations; it cannot be presented as an add-on solved by the GNSS recovery model. Keep that earlier idea outside the current pitch.

## Risk register and mitigation

R01 Dataset access fails. Mitigation: test retrieval before interface work; maintain two documented candidate sources and a permitted cached sample. Do not label synthetic records as real.

R02 Satellite anomalies are interpreted as aircraft impact. Mitigation: separate the evidence and impact layers, require independent corroboration and show unsupported links explicitly.

R03 Model learns geometry or receiver artefacts. Mitigation: include relevant context, compare compatible groups, inspect exclusions and test across independent intervals.

R04 No recovery labels exist. Mitigation: use scenario inputs, avoid a trained recovery claim and seek partner records after the event.

R05 Existing vendors already serve the gap. Mitigation: conduct a capability comparison and operator interviews; consider an integration module only if it adds measurable value.

R06 Simulated savings are mistaken for actual savings. Mitigation: retain assumed provenance in every view and export; separate model evaluation from economic simulation.

R07 Scope becomes too broad. Mitigation: keep one primary decision and one optional orbital scenario; put all other industries in the research backlog.

R08 Stale observations are presented as live. Mitigation: display observation and availability dates, use historical replay terminology and avoid a live status indicator.

R09 False alarms cause costly preparation. Mitigation: include unnecessary-action costs, allow abstention and test decision reversals.

R10 A polished demonstration hides scientific uncertainty. Mitigation: show raw measurements, baseline results, coverage and assumptions before recommendations.

R11 Operational material is treated as a command. Mitigation: use approved reference material for context only and keep the prototype outside operational control.

R12 Multi-agent work diverges. Mitigation: one schema, one scope owner, explicit interfaces, short handoff notes and a single integration checklist.

## Instructions for all receiving AI agents

The following is a reusable handoff. The team may copy it into each agent's conversation along with this document. These instructions define the intended project, not permission to access private accounts, send messages, deploy externally or operate real assets.

You are contributing to NavContinuity, a Mach A Thon prototype using real satellite receiver observations and AI to analyse navigation degradation and demonstrate a bounded economic preparation decision. Read the entire brief before changing scope. Preserve the distinction between observed satellite data, derived anomaly results, unvalidated aircraft-impact links and simulated operational outcomes.

Your work must use the shared schema and an explicit historical interval. Do not invent datasets, file fields, receiver outcomes, incident counts, savings or customer demand. Verify source access and software compatibility. Credit any reproduced research method. Anomaly scores are not calibrated probabilities. A spacecraft position is not a jammer location or a ground-risk footprint.

Deliver runnable work, a short README, relevant validation, a list of assumptions and an exact handoff to the next contributor. Explain blockers early. Do not replace missing inputs with realistic-looking mocks without visible synthetic labels. Keep credentials and private records out of outputs. Do not communicate with third parties or change external systems without separate authorisation.

At the end of your task, report files changed, commands to reproduce, inputs used, checks performed, known limitations and dependencies on other work. The team lead approves schema changes and final claims. Prefer a small functioning implementation over speculative breadth.

## Role specific AI agent prompts

### Research and product validation agent

Task: audit the commercial hypothesis and source register. Verify event requirements, distinguish actual incidents from guidance and modelled scenarios, and compare existing monitoring and recovery products. Focus on the specific workflow of preparing resources for aircraft recovery and the next turnaround. Do not claim a gap merely because a product page omits a feature.

Deliver a claim register with claim text, source URL, source date, population or geographic scope, evidence class, limitations and allowed pitch wording. Deliver a competitor matrix and five prioritised questions for operations or maintenance personnel. Identify the strongest evidence against the idea as well as evidence in favour. Do not contact organisations without authorisation. Acceptance: every numerical claim is sourced or explicitly illustrative, and no unsolved-market claim exceeds the evidence.

### Satellite data engineering agent

Task: retrieve a small permitted real sample from the chosen Sentinel or CYGNSS source, inspect its actual fields, parse it and create the normalised observation records and manifest. Verify time system, units, quality flags, coordinate meaning, coverage and latency. Preserve raw measurements and document transformations.

Deliver a retrieval script, parser, data card, sample schema output, coverage plot and relevant unit tests. Identify required credentials without exposing them. If the selected data cannot be accessed, report the blocker and evaluate the documented alternative. Acceptance: a reviewer can trace a processed observation to the original file and understand why any records were excluded.

### Scientific modelling agent

Task: implement the transparent baseline first, then one small AI model appropriate to the available labels. Reproduce the selected research method accurately where used. Define an event and an independent split before evaluating performance. Do not train a recovery predictor without actual equipment outcomes.

Deliver feature definitions, baseline and model code, split manifest, model card and experiment results. Include failure cases, calibration status and abstention behaviour. If labels are insufficient, describe a case study rather than inventing accuracy. Acceptance: baseline and model use identical evaluation evidence and the results do not rely on temporal or event leakage.

### Operations and economics agent

Task: implement a bounded scenario comparing no preparation with one or two preparation actions. Store every probability and cost with provenance. Enforce feasibility before comparing expected cost. Include false-positive costs, break-even analysis and sensitivity. Keep operational assumptions separate from satellite anomaly results unless a justified mapping is supplied.

Deliver scenario schema, cost engine, numerical tests, sensitivity output and a concise explanation of which data a partner must provide. The illustrative 4000 versus 2400 dollar example must reproduce exactly. Acceptance: the recommendation reverses when assumptions cross the break-even boundary and the output never describes simulated benefit as measured savings.

### Application and integration agent

Task: build a local historical replay showing coverage, evidence, baseline and AI comparison, scenario inputs and economic results. Consume shared schemas without silently changing them. Use clear labels for observed, derived and assumed values. Display stale or missing data explicitly.

Deliver a runnable application, configuration, export function and offline replay instructions. Avoid a fake live feed or a map that implies unsupported coverage. Acceptance: the full demonstration can be started by another teammate, each result traces to a source or assumption, and a failed data source cannot silently switch to a synthetic feed.

### Orbital extension agent

Task: use real spacecraft GNSS observations as evidence for a separate mission-task scenario. Preserve the distinction between receiver anomalies, actual orbit uncertainty and hypothetical task consequences. Add a simulated comparison of keeping versus moving a position-sensitive task only when the main workflow is stable.

Deliver a domain-specific scenario, assumptions, costs and explanation of the additional mission telemetry required for validation. Do not claim collision avoidance, precise orbit correction or recovered mission revenue. Acceptance: every real observation and simulated consequence is distinguishable, and the orbital extension does not delay the compulsory Track A core.

### Validation and pitch agent

Task: run the acceptance checklist, inspect the presentation claims and reproduce the complete demo. Build a five-minute narrative around the observed problem, existing competition, the real dataset, the experiment and the economic scenario. Be explicit about what remains unvalidated.

Deliver a test report, issue list, claim corrections, presentation outline and fallback demonstration plan. Do not improve the apparent performance by selecting only favourable examples without disclosure. Acceptance: every number shown can be explained and traced, the demo works from a clean launch, and the team can answer why a customer would choose this module over existing tools.

## Five minute presentation plan

Seconds 0 to 40: describe one concrete consequence of unresolved navigation degradation and identify the operations or maintenance decision. Use one credible reported example, with its scope and date, rather than a montage of unrelated disasters.

Seconds 40 to 80: acknowledge existing interference detection and recovery monitoring. State the preparation-cost hypothesis and the limits of current validation. Explain why the team chose this narrower workflow.

Seconds 80 to 160: demonstrate the real satellite sample, coverage, quality filtering, baseline and AI result. Show one inspectable observation. State clearly whether it is a historical case study or a validated detector.

Seconds 160 to 220: open the operational scenario, compare costs and change one assumption to demonstrate a decision reversal. State that the operational outcomes are simulated unless partner records have actually been obtained.

Seconds 220 to 260: show the orbital extension if it works. Otherwise explain the architecture and required mission data without pretending it was implemented.

Seconds 260 to 300: name the buyer, the proposed pilot, the main data dependency and the next validation gate. End with a precise statement of what the team achieved in the event.

Likely judge question: Why do you need satellite data? Answer with the actual contribution shown in the experiment. If the operational mapping remains unvalidated, state that the satellite layer supplies a complementary historical observation and that partner records are needed to validate its incremental decision value.

Likely judge question: Is this already solved? Answer that detection, monitoring and broad recovery tools exist; the team is testing a specialist integration and preparation workflow. Do not claim universal novelty.

Likely judge question: What does AI add? Show the comparison with the baseline. If it does not improve performance, report that result and explain what was learned rather than hiding it.

Likely judge question: Who pays and how much? Identify a proposed buyer and an operator-specific evaluation. Present the transparent cost example as illustrative. Pricing and willingness to pay remain customer-validation tasks.

## Claim policy and evidence labels

Use verified to mean supported by an identified source within its stated scope. Use observed to mean present in the actual data processed by this team. Use derived to mean computed from observations through a documented transformation. Use proposed to mean a design choice or product hypothesis. Use simulated to mean an outcome generated under declared assumptions. Use unknown when evidence is missing.

Allowed claim: IATA and aircraft manufacturers document persistent effects and recovery challenges. Allowed claim after implementation: this prototype processed the named satellite dataset over the stated interval and produced the shown results. Allowed claim: the scenario demonstrates a potential preparation decision under displayed assumptions.

Disallowed claim without new evidence: our system predicts which aircraft will fail to recover; our model prevents jamming; the system identifies every spoofing attack; no competitor solves this; satellite data proves this airport is unsafe; the team saved an airline a stated amount; one model serves all industries; a simulated result is a real incident outcome.

Keep the final pitch consistent with the claim register even if an AI agent generates more persuasive wording. The team is responsible for what it presents.

## Source register

The following sources underpin the brief. Source existence and the stated evidence were checked during the research conversation. Dataset downloads, end-to-end implementation and customer validation remain work for the team. URLs can change; receiving agents should verify the current page before making a new time-sensitive claim. Summaries here are intentionally short; read the originals for context and do not quote beyond applicable limits.

S01 Mach A Thon Aeromania 26 event deck and organiser screenshot. User-supplied primary event materials. Local deck: C:\Users\mubee\Downloads\Mach-A-Thon_Aeromania_26.pptx. Slides 2 and 3 define tracks; slide 4 defines deliverables; slide 5 defines judging. Share the original deck separately with teammates if available. The organiser screenshot adds compulsory Track A and a short achievement presentation.

S02 EASA Global Navigation Satellite System Outages and Alterations. Regulator description of mechanisms, effects and affected areas. https://www.easa.europa.eu/en/domains/air-operations/global-navigation-satellite-system-outages-and-alterations

S03 IATA Safety Risk Assessment GNSS Interference Version 6 February 2026. Industry assessment containing the recovery-time finding based on approximately 370000 flights. https://ic.iata.org/sites/default/files/iata_sih_document_attachment/IATA%20Safety%20Risk%20Assessment%20-%20GNSS%20Interference%20V6.pdf

S04 Airline Perspectives on GNSS RFI Challenges Impact Best Practices and Recommendations. ICAO-hosted presentation, including ground-reset concerns. https://www.icao.int/sites/default/files/APAC/Meetings/2025/2025%20ICAO%20APAC%20Radio%20Navigation%20Symposium%20%20Radio%20N/6-Addressing%20GNSS%20RFI-Challenges/SP11-Airline-Perspectives-on-GNSS-RFI-challenges-impact-best-practices-and-recommend.pdf

S05 Boeing engineers in Inside GNSS August 2026. Boeing approach, GEM system and conditional recovery analysis. This is manufacturer-authored technical reporting, not an independent evaluation of a proposed startup. https://insidegnss.com/boeings-approach-to-mitigating-the-impacts-of-gnss-rfi/

S06 Tallinn Airport operator announcement on Finnair suspension. Primary operational announcement for the 2024 Helsinki to Tartu interruption. https://airport.ee/en/finnair-temporarily-to-suspend-flights-between-helsinki-and-tartu/

S07 Estonian Transport Administration clarification. Tallinn Airport operations were unaffected; avoid extrapolating Tartu's situation to all airports. https://www.transpordiamet.ee/en/news/gps-signal-interference-estonia-does-not-affect-tallinn-airport-operations

S08 EASA and EUROCONTROL joint action plan announcement March 2026. Institutional response and coordination context. https://www.easa.europa.eu/en/newsroom-and-events/press-releases/easa-and-eurocontrol-publish-joint-action-plan-ensure-safe-operations-during-gnss-interference

S09 EUROCONTROL GUID 203 November 2026. Operational response guidance covering preparedness through recovery. https://www.eurocontrol.int/publication/eurocontrol-guidelines-guid-203-operational-response-gnss-degradations

S10 EASA July 2026 Safety Information Bulletin update announcement. Communication, electronic flight bag, training and capacity considerations. https://www.easa.europa.eu/en/newsroom-and-events/news/easa-updates-safety-information-bulletin-gnss-interference

S11 OPSGROUP GPS Spoofing Final Report September 2024. Practitioner workgroup report and starting point for operational questions. https://ops.group/blog/gps-spoofing-final-report/

S12 IMO ICAO ITU joint statement March 2025. Cross-sector concern about satellite-navigation interference. https://www.imo.org/en/mediacentre/pressbriefings/pages/joint-imo-icao-itu-statement-satellite-interference.aspx

S13 Traficom satellite navigation interference statistics and situational picture. Regulator explanation of several sources of positioning problems and monitoring context. https://tieto.traficom.fi/en/statistics/satellite-navigation-service-interferences-finland

S14 IMCA April 2026 GNSS jamming and spoofing guidance. Maritime and dynamic-positioning context. Full access may be limited; do not infer details beyond accessible material. https://www.imca-int.com/resources/technical-library/in-1730-gnss-jamming-and-spoofing-operational-impacts-and-mitigation-for-dynamic-positioning-dp/

S15 UK Maritime and Coastguard Agency MGN 719 October 2026. Guidance on GNSS-denied and degraded maritime environments. https://www.gov.uk/government/publications/mgn-719-mf-operating-in-gnss-denied-and-degraded-environments/mgn-719-mf-operating-in-gnss-denied-and-degraded-environments

S16 SAT-JAM research product. Sentinel-based orbital reception analysis, method and limitations. https://sat-jam.com/

S17 ESA time synchronisation and positioning in indoor GNSS receivers. Establishes timing applications in telecom, finance and energy; not evidence of demand for NavContinuity. https://www.esa.int/Enabling_Support/Space_Engineering_Technology/Time_Synchronization_and_Positioning_in_indoor_GNSS_receivers

S18 Spire interference detection product page. Evidence of existing commercial capability; performance claims are vendor claims. https://spire.com/space-reconnaissance/interference-detection/

S19 Jeppesen managing GPS interference during enroute operations. Existing pilot-facing awareness and route-context capability. https://news.jeppesen.com/aviator-articles/flight-deck-in-focus-managing-gps-interference-during-enroute-operations/

S20 Orbit by M2P. Existing airline decision-support and disruption optimisation category. Product marketing does not establish the exact GNSS-specific functionality. https://orbit.m2p.net/

S21 Copernicus Sentinel-1 data documentation. Lists GNSS auxiliary product and orbit-related data. https://documentation.dataspace.copernicus.eu/Data/Sentinel1.html

S22 NASA PO DAAC CYGNSS Level 1 Science Data Record Version 3.2. Product variables and access documentation. https://podaac.jpl.nasa.gov/dataset/CYGNSS_L1_V3.2

S23 Shin and Son Wide Area GNSS Interference Monitoring with CYGNSS GNSS R Delay Doppler Noise Floor Observations. 2026 research preprint. Review methods and revision history before reproduction; a preprint is not an operational certification. https://arxiv.org/abs/2603.04813

S24 UK Space Agency and Department for Science Innovation and Technology economic impact study October 2023. Hypothetical national outage modelling, not realised savings or addressable market for this project. https://www.gov.uk/government/publications/report-the-economic-impact-on-the-uk-of-a-disruption-to-gnss

S25 ICAO GNSS interference recommendations. Includes fuel and alternate planning, equipment considerations and information-sharing needs. https://www.icao.int/sites/default/files/APAC/APRAST/EB-2025-20-List-of-Recommendations-GNSS-RFI.pdf

S26 Airbus Safety First GNSS interference. Manufacturer material to consult for broader equipment context and maintenance considerations; follow the original document, not an AI paraphrase, for authorised technical work. https://safetyfirst.airbus.com/gnss-interference/

## Glossary

GNSS means Global Navigation Satellite System. GPS is a particular GNSS. PNT means positioning navigation and timing. RFI means radio-frequency interference. C N zero, often written C/N0, is a carrier-to-noise-density measure; preserve the actual source notation and units. RINEX is a receiver-independent exchange format for GNSS observations and related records. DDM means delay-Doppler map in the CYGNSS context.

GEM means GPS Event Monitor in Boeing's described system. OEM means original equipment manufacturer. OCC means operations control centre. DP means dynamic positioning in the maritime context. AIS means Automatic Identification System in maritime data; in aviation the same abbreviation can mean Aeronautical Information Services, so always state the context. ADS-B is an aircraft surveillance broadcast that may contain navigation-derived information. UTC is Coordinated Universal Time.

Calibration means that predicted probabilities correspond appropriately to observed frequencies for the evaluated population. Censoring means an outcome has not been observed before the record ends. Abstention means the system declines to make a claim because inputs or validation are insufficient. A historical replay reproduces past observations and is not a live service. A scenario is an explicitly assumed set of operating conditions.

## Completion checklist for the team lead

Confirm the event requirements and compulsory Track A interpretation. Confirm the selected real dataset can be accessed and parsed. Confirm the observation schema and coordinate semantics. Confirm the baseline and model comparison. Confirm all operational assumptions are labelled. Confirm the cost model has a no-preparation comparator and a decision-reversal test. Confirm the orbital extension uses a separate domain model. Confirm the claim register agrees with the pitch. Confirm the local demonstration runs without hidden dependencies. Confirm the final handoff lists what was built, what was tested and what remains a hypothesis.

The team should leave the event with a reproducible prototype and a precise next validation step. The strongest outcome is not the broadest list of industries; it is a credible explanation of how actual satellite observations could improve one valuable decision, what the demonstration establishes and what additional evidence is still needed.
