# 🧠 ZCP2O Scoring Engine v2 — Anti-Stealth-Bot Roadmap

> **Status:** 🌱 CONCEPT / ROADMAP (post-submission; Phase 2)
> **Author:** ZCP2O Foundation (with critical review input, "Pak Takim")
> **Last updated:** 2026-08-22

This document plans the upgrade of the ZCP2O Human Proof **motor scoring
engine** to defeat *stealth bots* — bots that fake human-like movement using
noise injection or Bezier curves (Puppeteer/Selenium stealth plugins).

Core principle: **human movement is governed by biology & muscle physics;
bot movement is governed by math.** We detect the difference — 100% on-device.

---

## 1. What We Already Have (v1 Baseline)

The current `scoreMotor()` already captures four signals:

| v1 Metric | What It Measures | Pak Takim's Equivalent |
|-----------|------------------|------------------------|
| Entropy (direction histogram) | Movement randomness / naturalness | — |
| Jitter (residual std-dev) | Micro-tremor proxy | #1 (tremor) |
| Velocity (speed CV) | Speed naturalness | #3 (jerk-adjacent) |
| Timing (interval CV) | Event rhythm naturalness | — |
| Sensor layer (pressure/gyro) | Device physics | #4 (fusion) |

So v2 is **not a rewrite** — it is a targeted extension of a working baseline.

---

## 2. Proposed v2 Metrics (Science → Practicality)

### 2.1 Terminal Phase Analysis (Sub-movements / Fitts) — ⭐ P0
- **Science:** Humans obey Fitts' Law and perform *sub-movements*: near the
  target they overshoot then make micro-corrections in the final ~10-20%.
- **Bot tell:** bots decelerate "mathematically perfectly" (clean bell curve).
- **Detection:** count direction reversals + velocity profile in the last 20%
  of the trajectory. Humans show small late corrections; bots do not.
- **Practicality:** ✅ cheap, works on all devices, all drag challenges.

### 2.2 Mean Jerk (Minimum-Jerk Trajectory) — P1
- **Science:** the human brain minimizes *jerk* (3rd derivative of position)
  to save muscle energy (Flash & Hogan, 1985).
- **Bot tell:** linear-interpolation / Bezier bots have a different jerk profile.
- **Detection:** compute mean jerk over the sample window.
- **Practicality:** ⚠️ derivatives amplify sampling noise → requires smoothing
  (e.g. moving average) before differentiation.

### 2.3 "Perfect Curve" Detector — P1
- **Science:** humans are never 100% smooth.
- **Bot tell:** a trajectory that fits a Bezier/mathematical curve *too well*
  (residual ≈ 0) is a red flag — over-perfection is suspicious.
- **Detection:** flag when smoothness/residual exceeds a "too perfect" band.
- **Practicality:** ✅ cheap; complements existing jitter band.

### 2.4 Pressure × Velocity Correlation (Touch) — P2
- **Science:** humans press harder when turning, lighter when gliding.
- **Bot tell:** simulated pressure is constant or linear; correlation weak/fake.
- **Detection:** correlate pointer speed with `pressure` over the drag.
- **Practicality:** ⚠️ touch devices only (desktop lacks pressure).

### 2.5 Cursor × Gyro Synchrony (Sensor Fusion) — P2
- **Science:** when a hand moves the cursor on a phone, the device tilts subtly
  in sync.
- **Bot tell:** a simulated touch screen with a *static* gyroscope is a tell.
- **Detection:** cross-correlate cursor velocity with `DeviceMotion` deltas.
- **Practicality:** ⚠️ mobile only; requires sensor permission.

### 2.6 Physiological Tremor (8–12 Hz, FFT) — P3
- **Science:** human hands exhibit a 8–12 Hz physiological tremor (cardiac/
  respiratory/motor origin).
- **Bot tell:** bot noise is white noise or over-smooth Perlin — no biological
  frequency peak.
- **Detection:** spectral analysis (simple FFT / variance) of the residual signal.
- **Practicality:** ❌ hard during active drag (voluntary motion drowns tremor);
  only viable on **steady-hold** tasks with high sample rates (≥ ~60 Hz).

---

## 3. Honest Engineering Notes

- **No magic numbers.** Claims like "detects 90% of stealth bots" are
  unmeasured. v2 raises the **attacker's cost**; it does not guarantee a rate.
  Thresholds must be calibrated with **real human data** after launch.
- **Sampling limits.** Pointer events fire at ~60–120 Hz; use
  `getCoalescedEvents()` where available to raise resolution for jerk/tremor.
- **Device heterogeneity.** Metrics 2.4/2.5 need touch+IMU; on desktop they
  degrade gracefully (scored as `n/a`, not penalized).
- **Privacy preserved.** All v2 metrics compute **on-device** from the same
  ephemeral samples; nothing new leaves the device.

---

## 4. Implementation Plan (Post-Submission)

1. **Phase 2a:** ship P0 (terminal analysis) + P1 (jerk, perfect-curve) —
   highest value / lowest risk; apply to shared `scoreMotor()`.
2. **Phase 2b:** add P2 fusion on touch devices.
3. **Phase 2c:** research P3 tremor on steady-hold with coalesced events.
4. **Calibration:** collect anonymized, on-device score distributions (opt-in)
   to tune bands — never raw movement data.

---

*© 2026 ZCP2O Foundation. Vision document; not a product commitment.
"ZCP2O" and "Human Proof" are trademarks of the ZCP2O Foundation.*