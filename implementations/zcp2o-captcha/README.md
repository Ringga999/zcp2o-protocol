
# ZCP2O Human Proof

> **Status:** Active Development — Building Indonesia 2026
>
> **Author:** Ringga A.K.D (ZCP2O Core Team)
>
> **Tagline:** *Prove you're human — without being spied on, without the internet.*

---

## 🎯 Why This Exists

Indonesia has **17,000 islands** and internet coverage that is far from even.
Yet every "human verification" tool on the market (Google reCAPTCHA, Cloudflare
Turnstile, etc.) assumes two things that fail in the real world:

1. **Constant internet** — they break the moment connectivity drops.
2. **Mass surveillance** — they harvest IP addresses, mouse trajectories,
   browser fingerprints, and browsing history to "score" you.

**ZCP2O Human Proof rejects both assumptions.** It proves a user is human
**on the device itself**, sends **zero bytes to any server**, and keeps
working **with the internet turned off**.

It is not a CAPTCHA that watches you. It is a **sovereign proof of humanity**.

---

## ✨ What It Is

A **self-contained JavaScript widget** that verifies a user is human using:

- **Implicit Proof of Humanity** — analyzes natural human motor signals
  (micro-jitter, timing, movement entropy). Bots are "too perfect"; humans
  have natural noise.
- **On-device verification** — all analysis happens in the browser. No server.
- **Web Crypto signing** — the result is signed with an RSA key generated
  locally via the browser's native Web Crypto API (free, no backend).
- **Offline-first** — works with no internet connection at all.

---

## 🆚 Head-to-Head

| Aspect | Google reCAPTCHA | ZCP2O Human Proof |
|--------|------------------|-------------------|
| **Needs internet?** | ✅ Yes (fails offline) | ❌ **No — works offline** |
| **Data collected** | IP, mouse, fingerprint, history | **0 bytes** |
| **Backend / server cost** | Yes (their cloud) | **None (on-device)** |
| **Works in remote areas?** | ❌ Poor | ✅ **Yes** |
| **Privacy** | Surveillance-based | **Sovereign (on-device)** |

---

## ⚙️ How It Works

1. Widget renders an interactive **human-motor challenge** (e.g., hold the
   cursor steady, or trace a smooth line).
2. It samples **movement + timing signals** during the interaction.
3. A local heuristic scores **human-ness** (bots are too fast / too perfect).
4. If the score passes, the browser generates an **RSA key** (Web Crypto) and
   signs a **Human Proof Token** — entirely on-device.
5. The page receives the signed token. **Nothing is uploaded.**

**The killer demo:** open the demo, verify once, then **turn off the internet**
and verify again. reCAPTCHA-style tools die. **ZCP2O Human Proof still works.**

---

## 🚀 Quick Start (for website owners)

```html
<!-- 1. Load the engine (self-contained, no backend) -->
<script src="widget/zcp2o-human-proof.js"></script>

<!-- 2. Place the widget -->
<div id="zcp2o-human-proof"></div>

<!-- 3. Initialize -->
<script>
  Zcp2oHumanProof.init({
    container: "#zcp2o-human-proof",
    onVerified: function (token) {
      console.log("Human Proof Token:", token); // signed, on-device
    }
  });
</script>
```

---

## 📁 Repository Structure

```
zcp2o-captcha/
├─ README.md                  ← You are here
├─ widget/
│  └─ zcp2o-human-proof.js    ← The engine (self-contained, offline)
├─ demo/
│  └─ index.html              ← Live demo (host free on GitHub Pages)
└─ docs/
   └─ architecture.md         ← Technical spec of the engine
```

---

## 🗺️ Roadmap

- **v0.1 (Competition MVP):** on-device motor challenge + human-ness scoring
  + Web Crypto token + offline demo.
- **v0.2:** mesh-based peer verification (device-to-device, no server).
- **v1.0:** integration with ZCP2O Digital Bunkers for trust-weighted
  verification + `zcp2o:` URI deep-linking.

---

## 🛡️ Privacy & Sovereignty

- **Zero data exfiltration** — no network requests are made by the widget.
- **No tracking** — no cookies, no fingerprinting, no analytics.
- **Sovereign** — the proof lives on the user's device, not in a foreign cloud.

---

## License

MIT License — see the ZCP2O Protocol repository.

*The names "ZCP2O" and "ZCP2O Human Proof" remain trademarks of the author.
Implementing the widget does not grant rights to use these marks.*