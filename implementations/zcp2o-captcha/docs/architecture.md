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

---
\## 8. Appendix A: Token Forgery & Progressive Assurance

### 8.1 Two Distinct Guarantees

A Human Proof Token provides two different guarantees that must not be
confused:

| Guarantee | Meaning | v0.1 status |
|-----------|---------|-------------|
| **Integrity** | The token was not altered after signing | ✅ Provided (RSA-PSS signature verifies) |
| **Score honesty** | The score was computed truthfully by a real interaction | ❌ NOT guaranteed on-device |

### 8.2 The Forgery Scenario (Self-Issued Key Attack)

Because the RSA keypair is generated on-device (self-issued), an attacker who
controls the execution environment can forge a token:

1. Generate their own RSA keypair.
2. Build a payload with a fabricated `"score": 100`.
3. Sign it with their own key.

The resulting token passes signature verification (integrity), but the score
is a lie. This is inherent to ANY client-side verification system without a
trusted authority — the client is in the adversary's hands.

**v0.1 position:** we accept this limitation by design. v0.1 optimizes for
privacy + offline (blocking naive automation without surveillance), not for
maximum adversarial hardness. This is an honest, deliberate trade-off.

### 8.3 Progressive Assurance (Layered Co-Signing)

Higher assurance is achieved by adding independent co-signers, so a forger
must fool many entities at once instead of one self-issued key:

```
v0.1  [Device self-signature]                 → blocks naive bots
v0.2  + [Mesh peer co-signatures]             → forger must fool N nearby devices
v1.0  + [Bunker trust-weighted co-signature]  → forger must compromise an institution
      + [User Trust Score weighting]          → fresh identities carry low weight
```

**Normative target (v1.0 token):**

```json
{
  "v": 1,
  "type": "zcp2o-human-proof",
  "score": 87,
  "assurance": "self | mesh | institutional",
  "witnesses": [
    {
      "id": "peer_or_bunker_id",
      "tier": "light | institutional",
      "sig": "co-signature over (payload_digest + device_pubkey)"
    }
  ]
}
```

**Verification rules (v1.0):**
1. `assurance: self` → low confidence (privacy demo only).
2. `assurance: mesh` → require ≥ K co-signatures from distinct peers.
3. `assurance: institutional` → require ≥ 1 co-signature from a Bunker whose
   Trust Score ≥ threshold; confidence scales with that Bunker's trust.

### 8.4 What Each Layer Blocks

| Attack | v0.1 | v0.2 (mesh) | v1.0 (Bunker) |
|--------|------|-------------|---------------|
| Naive scripted bot | ❌ blocked | ❌ blocked | ❌ blocked |
| Simulated human-like input | ⚠️ arms race | ⚠️ harder | ⚠️ harder |
| Self-issued key forgery | ✅ possible | ❌ needs N fake peers | ❌ needs compromised Bunker |
| Sybil (many fake identities) | — | ⚠️ | ❌ Trust Score gates weight |

### 8.5 Honest Positioning

ZCP2O Human Proof does NOT claim to be "unhackable". It claims:

- **Privacy-first:** 0 bytes exfiltrated, no tracking.
- **Offline-first:** works with no internet and no server.
- **Progressive assurance:** confidence scales with the number and trust of
  independent co-signers — security by distribution, not by a central oracle.