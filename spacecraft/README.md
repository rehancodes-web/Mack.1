# Track B3 · LEO GPS augmentation simulation

The source browser prototype is [`b3.html`](b3.html); the A6 publish script copies it to [`docs/b3.html`](../../docs/b3.html) and adds a link from the A6 page.

## What it shows

- A full Earth centered in the 3D view, with Esri World Imagery and explicit Natural Earth country-border polylines. Globe lighting is disabled so the visible side stays bright. The Jewar test receiver is marked on the globe (28.1709° N, 77.6082° E).
- One simulated circular LEO orbit at 550 km altitude and 53° inclination.
- A moving satellite, orbit path, and receiver line of sight that changes as the Earth rotates.
- A synthetic unaided position error and a simple visibility/elevation-based illustrative correction, updated with simulation time.
- Play/pause, 1×/10×/60× speed, and orbit-time scrubbing.

## Model and limits

The orbit uses a circular two-body approximation with Earth gravitational parameter 3.986004418×10¹⁴ m³/s² and mean Earth rotation 7.2921159×10⁻⁵ rad/s. The period is approximately 95.4 minutes. The displayed error is a deterministic invented signal for explaining the concept. The correction is an illustrative gain that only applies while the LEO satellite is above the local horizon. It is not real receiver data, an AI model, a validated GNSS algorithm, or suitable for aircraft guidance.

## Run

Open `docs/b3.html` in a browser with internet access. CesiumJS, Esri World Imagery tiles, and Natural Earth boundary data load from public services. Map attribution is displayed. No API key is required. The A6 publish script copies this source page into the Vercel output folder.
