# Track B3 · LEO GPS augmentation simulation

The source browser prototype is [`b3.html`](b3.html); the A6 publish script copies it to [`docs/b3.html`](../../docs/b3.html) and adds a link from the A6 page.

## What it shows

- A full Earth centered in the 3D view, with Esri World Imagery and explicit Natural Earth country-border polylines. Globe lighting is disabled so the visible side stays bright.
- Four moving satellites with distinct orbit planes, including a deliberately timed synthetic encounter where two paths cross at a close approach.
- A synthetic noisy position estimate for each satellite and an AI-style model-aided filter that corrects the displayed estimate.
- A live nearest-pair trajectory screen over a 30-minute horizon, with time to closest approach, miss distance, and clearly labeled illustrative risk bands.
- Sixteen test receivers: two each in the USA, China, India, Russia, Brazil, Canada, Australia, and Japan.
- A “Check collision” action that jumps to five minutes before the demo encounter, follows LEO-2, changes its along-track phase using a simulated 8 m/s tangential impulse, and draws the planned orbit as a dotted line beside the adjusted solid path in the same satellite color.
- The receiver-to-LEO visibility and synthetic positioning-error example remain in the demo, using the Jewar reference site.
- Orbit traces refresh as the simulation advances so Earth-fixed paths keep up with satellite motion and Earth rotation.
- Play/pause, 1×/10×/60× speed, and 24-hour simulation-time scrubbing.

## Model and limits

The orbits use circular two-body approximations with Earth gravitational parameter 3.986004418×10¹⁴ m³/s² and mean Earth rotation 7.2921159×10⁻⁵ rad/s. The reference 550 km orbit has a period of approximately 95.4 minutes. The close pair is deliberately placed on intersecting orbit planes to create an easy-to-see synthetic encounter. No real satellite catalog is used.

All position noise is invented. The AI-style correction reduces that synthetic noise using the known orbit model; it is a demonstrator, not a trained AI model or a validated navigation filter. The 30-minute closest-approach estimate and HIGH (<1 km) / ELEVATED (<5 km) bands are simplified and are not operational collision probabilities. The 8 m/s avoidance example changes along-track phase in a simplified circular-orbit model; it is not a maneuver design. Nothing here is suitable for aircraft guidance or real collision warnings.

## Run

Open `docs/b3.html` in a browser with internet access. CesiumJS, Esri World Imagery tiles, and Natural Earth boundary data load from public services. Map attribution is displayed. No API key is required. The A6 publish script copies this source page into the Vercel output folder.
