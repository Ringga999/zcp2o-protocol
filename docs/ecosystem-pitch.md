# 🛡️ ZCP2O Human Proof — Sybil-Resistant Verification for Your Faucet

**Stop bot farms from draining your testnet funds. Start verifying humans — privately.**

---

## The Problem

Your faucet has a leak. Bot farms script thousands of requests, drain your
testnet treasury, and pollute your airdrop data. Existing fixes all force a
bad trade-off:

| Solution | Privacy | Bot Resistance | UX | Hidden Cost |
|----------|:---:|:---:|:---:|-------------|
| Google reCAPTCHA | ❌ tracks users | ⚠️ arms race | ⚠️ friction | user data |
| Cloudflare Turnstile | ⚠️ some tracking | ⚠️ | ✅ | vendor lock-in |
| Biometric / KYC PoH | ⚠️ collects identity | ✅ | ❌ slow onboarding | GDPR liability |
| Proof-of-Work faucet | ✅ | ⚠️ GPU farms win | ❌ minutes of mining | wasted energy |
| **ZCP2O Human Proof** | ✅ **0 bytes** | ✅ motor signals | ✅ **~3 seconds** | none |

---

## The Solution

**ZCP2O Human Proof** verifies a user is human by analyzing **natural motor
signals** (micro-jitter, timing, velocity) **on-device**. Nothing leaves the
browser — no IP, no fingerprint, no history. Bots can't fake a human hand;
and because verification is cryptographic (RSA-PSS), your server can trust
the result without trusting the client.

### How it works (3 steps)
1. **User** completes a ~3-second motoric challenge (hold, trace, or draw).
2. **Browser** analyzes motor signals locally and signs a Human Proof token.
3. **Your server** verifies the token server-side (RSA-PSS) before dripping.

---

## Integrate in One Line

```html
<script src="https://ringga999.github.io/zcp2o-protocol/implementations/zcp2o-captcha/widget/embed.js"
        data-container="#my-faucet" data-callback="onHuman"></script>
```

```js
function onHuman(token) {
  // send token to your backend; verify before dripping
}
```

Server-side verify (any language): POST the token to your verifier using our
open verification spec — RSA-PSS signature + nonce + expiry (anti-replay).

---

## Why ZCP2O

- ✅ **Privacy-first:** 0 bytes exfiltrated. No GDPR / CCPA exposure.
- ✅ **Works offline:** the only human-proof that survives Airplane Mode.
- ✅ **Open source:** AGPL-3.0. Audit every line. No vendor lock-in.
- ✅ **Battle-tested:** hardened v1.2 (SRI, challenge binding, anti-replay,
  server-side verify) — see `docs/security-hardening.md`.
- ✅ **Live now:** public API + demo already running (below).

---

## Proof It Works

- **Live demo:** https://ringga999.github.io/zcp2o-protocol/
- **Championship (real humans registering):**
  https://ringga999.github.io/zcp2o-protocol/implementations/zcp2o-captcha/examples/championship.html
- **Repo:** https://github.com/Ringga999/zcp2o-protocol
- **Public Bunker API:** https://kdewa.pythonanywhere.com

---

## Get Started

We'd love to open a **Pull Request** integrating ZCP2O into your faucet as a
sybil-resistance module. Reply to our issue, or reach out via the repo —
we'll handle the integration so your team doesn't have to.

**Born in the archipelago. Built for the unconnected world.** 🌏