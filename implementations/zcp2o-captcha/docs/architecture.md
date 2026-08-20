# ZCP2O Human Proof — Engine Architecture

> **Status:** v0.1 (Competition MVP) — August 2026
>
> **Scope:** Self-contained, on-device human verification. No backend, no
> network, no tracking.

---

## 1. Design Goals

1. **On-device** — all computation happens in the browser (Web Crypto + DOM).
2. **Offline-first** — zero network requests; works with internet off.
3. **Privacy-first** — 0 bytes exfiltrated; no cookies/fingerprinting.
4. **Free** — no server cost; hostable on GitHub Pages.
5. **Lightweight** — single JS file, no dependencies, runs on low-end phones.

---

## 2. High-Level Flow (Browser-Only)

```
┌──────────────────────────────────────────────────────────┐
│                     BROWSER (no server)                  │
│                                                          │
│  [1 Challenge] → [2 Signal Collector] → [3 Scorer]       │
│                                          │               │
│                                    humanScore ≥ 70?      │
│                                          │ yes           │
│                                          ▼               │
│                                 [4 Web Crypto Signer]    │
│                                          │               │
│                                          ▼               │
│                                 Human Proof Token        │
│                                          │               │
│                    ( 0 bytes leave the device )          │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Modules

### 3.1 Challenge Module
Renders an interactive **human-motor challenge**. v0.1 ships two:

| Challenge | What it tests | Human trait it exploits |
|-----------|---------------|--------------------------|
| `steady-hold` | Hold cursor/finger inside a target for ~3s | Humans have micro-tremor; bots are perfectly still or teleport |
| `trace-line` | Trace a smooth path through waypoints | Humans show velocity variance + sub-movements; bots are linear/perfect |

### 3.2 Signal Collector
Samples pointer events during the challenge into a signal buffer:

```json
{ "x": 132.4, "y": 88.1, "t": 1739000123456, "p": 0.5 }
```

Fields: `x`,`y` (position), `t` (timestamp ms), `p` (pressure, if available).
Sampling: on every `pointermove`/`pointerdown`/`pointerup` (passive listeners).

### 3.3 Scorer (Implicit Proof of Humanity)
Computes a **human-ness score (0–100)** from four sub-signals:

```
humanScore = 0.3*entropy + 0.3*jitter + 0.2*velocity + 0.2*timing
```

| Sub-score | Measures | Human | Bot |
|-----------|----------|-------|-----|
| `entropy` | Shannon entropy of movement direction changes | High (organic) | Low (rigid) |
| `jitter` | High-freq micro-tremor (0.5–5 Hz) residual variance | Present, natural | Absent, or perfectly periodic |
| `velocity` | Bell-shaped speed curve with accel/decel phases | Yes | Constant / instantaneous |
| `timing` | Variance of inter-event intervals | Variable | Millisecond-regular |

**Pass threshold:** `humanScore >= 70` (configurable).

### 3.4 Signer (Web Crypto)
On pass:
1. Generate an **RSA-2048** keypair via `crypto.subtle` (Light tier, fast).
2. Build payload:
   ```json
   { "v":1, "type":"zcp2o-human-proof", "challenge":"steady-hold",
     "score":87, "signals_digest":"<sha256>", "issued_at":1739000200,
     "tier":"light" }
   ```
3. Sign payload with **RSA-PSS** → `sig`.
4. Emit **Human Proof Token** = base64url(payload + sig + pubkey JWK).

### 3.5 Verifier (optional, for relying parties)
Any page can verify a token **on-device**:
- Recompute payload digest, verify `sig` against embedded `pubkey`,
- Check `issued_at` freshness and `score >= threshold`.
No server required.

---

## 4. Token Format

```json
{
  "v": 1,
  "type": "zcp2o-human-proof",
  "challenge": "steady-hold",
  "score": 87,
  "signals_digest": "9f2e8d7c...",
  "issued_at": 1739000200,
  "tier": "light",
  "pubkey": { "kty":"RSA", "n":"...", "e":"AQAB" },
  "sig": "base64_rsa_pss_signature"
}
```

---

## 5. Threat Model (Honest Limitations)

Because the key and signing are **on-device**, a determined attacker could
generate their own key and forge a token. This is inherent to *any*
client-side CAPTCHA. We are transparent about it:

| Threat | v0.1 mitigation | Roadmap (v0.2+) |
|--------|-----------------|-----------------|
| Naive bot (scripted clicks) | Motor challenge + scoring blocks it | — |
| Sophisticated spoofing | Raises cost (real-time motor noise is hard to fake) | Mesh peer co-signing |
| Forged token (own key) | Verifier checks signature integrity only | Bunker trust-weighted co-signature |

**Positioning:** v0.1 optimizes for **privacy + offline**, not maximum
adversarial hardness. Higher assurance layers (mesh / Bunker co-signing) are
the ZCP2O roadmap — this is what makes us a *protocol*, not just a widget.

---

## 6. Performance & Compatibility

- Single file, **no dependencies**, ~<20 KB.
- Uses only standard APIs: `PointerEvents`, `crypto.subtle`, `SHA-256`.
- RSA-2048 generation in-browser: fast on low-end phones (<2s).
- Works in any modern browser (Chrome, Firefox, Safari, WebView).

---

## 7. Public API

```js
Zcp2oHumanProof.init({
  container: "#zcp2o-human-proof",
  challenge: "steady-hold",   // or "trace-line"
  threshold: 70,
  onVerified: (token) => {},  // signed Human Proof Token
  onFail: (score) => {}
});
```