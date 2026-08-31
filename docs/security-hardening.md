# 🛡️ ZCP2O Human Proof — Security Hardening v1.3

**Version:** 1.3 (August 31, 2026)
**Status:** Production-Ready
**Scope:** SRI Integrity, Challenge Binding, Server-Side Verify, Anti-Replay, and Sovereign Identity.

This document details the multi-layered security architecture of ZCP2O Human Proof, including the results of self-attack tests conducted to validate each defensive layer.

---

## Layers of Defense

ZCP2O employs a defense-in-depth strategy across 5 distinct layers:

| Layer | Name | Location | Function | Attack Blocked |
|-------|------|----------|----------|----------------|
| **P1** | Subresource Integrity (SRI) | Browser | Rejects widget files with mismatched SHA-384 hashes | File tampering / CDN compromise |
| **P2** | Challenge Binding | Token | Token is cryptographically bound to the specific challenge and motoric signals | Token forgery / Challenge bypass |
| **P3** | Server-Side Verification | Bunker (`/verify`) | Validates RSA-PSS signature, expiry, and nonce | Fake tokens / Signature spoofing |
| **P4** | Nonce + Expiry | Token v5 | 16-byte unique nonce + 5-minute TTL | Token replay attacks |
| **P5** | Sovereign Identity | Bunker Auth | Identity-based auth (RSA keypair) instead of shared API keys | Master key leakage / Single point of failure |

---

## P1: Subresource Integrity (SRI)

**Mechanism:**
The `embed.js` loader fetches widget chunks (`zcp2o-hp1.js` to `zcp2o-hp13.js`) using `<script>` tags with the `integrity` attribute containing a pre-computed SHA-384 hash.

**Why it matters:**
Even if an attacker compromises GitHub Pages or a CDN, they cannot inject malicious code. The browser will block execution if the downloaded file's hash does not match the hardcoded hash.

**Hash Generation Ritual (v2):**
Hashes must be generated from the **deployed file** (GitHub Pages), not the local copy, to avoid CRLF vs LF line-ending mismatches.

---

## P2: Challenge Binding

**Mechanism:**
The generated token is not a generic "I am human" badge. It is cryptographically bound to:
1. The specific `challenge` ID (e.g., `circle-fit`)
2. The `signals_digest` (SHA-256 hash of the raw motoric sensor data)

**Why it matters:**
An attacker cannot record a token from a "click here" challenge and use it to bypass a harder "draw a circle" challenge. The server verifies that the token matches the requested challenge and the submitted signals.

---

## P3: Server-Side Verification

**Mechanism:**
The Bunker (`/verify` endpoint) performs full RSA-PSS signature verification using the public key embedded in the token. It does not trust the client's self-reported `score` or `valid` status.

**Why it matters:**
A client-side script can easily spoof a JSON object saying `{"score": 99, "valid": true}`. Server-side verification ensures the token was genuinely signed by a trusted ZCP2O widget instance.

---

## P4: Nonce + Expiry (Anti-Replay)

**Mechanism:**
- **Nonce:** A 16-byte cryptographically random value generated per token.
- **Expiry:** Token contains `expires_at` (default: 5 minutes from issuance).

The Bunker maintains a short-term nonce store (in-memory or SQLite) to reject any token with a previously seen nonce.

**Why it matters:**
Prevents "replay attacks" where an attacker captures a valid network request and re-sends it later to gain unauthorized access. Once a token is used or expires, it is dead.

---

## P5: Sovereign Identity (Auth v2)

**Mechanism:**
We eliminated the "Shared Master Key" (single point of failure).
- **Registration:** A client proves humanity (solves CAPTCHA) to register a **Sovereign Identity** (RSA keypair).
- **Authentication:** API requests are signed with the client's private key. The Bunker verifies the signature against the registered public key.

**Why it matters:**
If one identity's private key is compromised, we simply **revoke that specific identity**. The rest of the ecosystem (other identities, legacy API keys) remains secure. This aligns with ZCP2O's core philosophy of user sovereignty.

---

## Token Format (v5)

```json
{
  "v": 5,
  "type": "zcp2o-human-proof",
  "challenge": "circle-fit",
  "score": 72,
  "nonce": "<16-byte base64url>",
  "layers": { "motor": 91, "sensor": null, "circle-fit": 55 },
  "signals_digest": "<sha256>",
  "issued_at": 1787919308,
  "expires_at": 1787919608,
  "tier": "light",
  "assurance": "self",
  "sig": "<RSA-PSS base64url>",
  "pubkey": { "kty":"RSA", "n":"...", "e":"..." }
}