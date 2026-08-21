<div align="center">

# 🏛️ ZCP2O Protocol

### Zero-Capital Play-to-Own

**The offline-first, zero-capital, sovereign blockchain — for the 2.6 billion people the internet forgot.**

[🛡️ **TRY LIVE DEMO: HUMAN PROOF**](https://ringga999.github.io/zcp2o-protocol/implementations/zcp2o-captcha/demo/) •
[📖 **Full Documentation**](docs/) •
[⭐ **Star This Repo**](https://github.com/Ringga999/zcp2o-protocol)

---

[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Version](https://img.shields.io/badge/version-0.1.0-orange)]()

</div>

---

## 🌍 The Problem We Solve

Traditional blockchains (Bitcoin, Ethereum, Solana) assume three things that **aren't true for most of the world**:

| Assumption | Reality |
|------------|---------|
| **Everyone has stable internet** | 2.6 billion people don't (ITU, 2024) |
| **Everyone has capital to buy tokens** | 4 billion adults are unbanked (World Bank) |
| **Privacy is a luxury** | Google & Meta track every click, everywhere |

**ZCP2O rejects all three assumptions.**

---

## ✨ What Is ZCP2O?

ZCP2O is a **sovereign blockchain protocol** designed from the ground up for the **unconnected and under-connected world**:

| Feature | Traditional Blockchain | ZCP2O Protocol |
|---------|----------------------|----------------|
| **Connectivity** | ❌ Online 24/7 required | ✅ **Works fully offline** |
| **Entry cost** | ❌ Must buy tokens first | ✅ **Zero-capital entry** |
| **Consensus** | PoW (electricity) / PoS (wealth) | **PoP (human activity)** |
| **Privacy** | ❌ IP, fingerprint, history tracked | ✅ **0 bytes exfiltrated** |
| **Target user** | Global crypto traders | **Offline communities worldwide** |

---

## 🛡️ LIVE DEMO: Human Proof

**[👉 TRY IT NOW](https://ringga999.github.io/zcp2o-protocol/implementations/zcp2o-captcha/demo/)**

A self-contained JavaScript widget that proves you're human — **on-device, 0 bytes sent, works without internet**. Unlike Google reCAPTCHA (which surveils you) or Cloudflare Turnstile (which requires a connection).

**How it works:**
1. Hold your cursor inside a circle for 3 seconds
2. The engine analyzes natural human motor signals (micro-jitter, timing, velocity)
3. If you pass, an RSA key is generated locally and signs a **Human Proof Token**
4. **✅ VERIFIED** — no server, no tracking, no internet

**Killer demo:** Open the page, verify once, then **turn on Airplane Mode** and verify again. Traditional CAPTCHAs die. **ZCP2O Human Proof still works.** 🛩️

---

## 🚀 Implementations

### Tools & Applications

| Folder | Status | Description |
|--------|--------|-------------|
| [🛡️ **zcp2o-captcha**](implementations/zcp2o-captcha/) | 🟢 **LIVE** | Human Proof: on-device human verification. No spying, no internet. **[LIVE DEMO](https://ringga999.github.io/zcp2o-protocol/implementations/zcp2o-captcha/demo/)** |

### Core Infrastructure

| Folder | Status | Description |
|--------|--------|-------------|
| [⚙️ **zcp2o-core**](implementations/zcp2o-core/) | 🟡 Dev | Core protocol: RSA-4096/2048 cryptography, ledger, PoP consensus |
| [🏦 **zcp2o-node**](implementations/zcp2o-node/) | 🟡 Dev | Digital Bunker: offline Full Node with REST API (FastAPI + SQLite) |
| [💻 **zcp2o-cli**](implementations/zcp2o-cli/) | 🟡 Dev | Terminal wallet for command-line interaction |

### Reference Implementation

| Folder | Status | Description |
|--------|--------|-------------|
| [🎮 **alpha-drop**](implementations/alpha-drop/) | 🟡 Dev | First Proof-of-Play game: claim $WEEKS coins in physical zones |

### Future Modules (Phase 2-3)

| Folder | Status | Description |
|--------|--------|-------------|
| [📱 **zcp2o-wallet**](implementations/zcp2o-wallet/) | 🔮 Planned | Standalone wallet (Web/Mobile), ZWS-compliant |
| [🧰 **zcp2o-sdk**](implementations/zcp2o-sdk/) | 🔮 Planned | Developer toolkit for building third-party dApps |
| [🌐 **zcp2o-testnet**](implementations/zcp2o-testnet/) | 🔮 Planned | Multi-node test network via Docker Compose |

---

## 📚 Documentation & Standards

### 📖 ZCP2O Wallet Standard (ZWS) v1.0

The sovereign wallet standard — no dependency on EVM, no wrapped tokens:

- **URI Scheme** (`zcp2o:`) — payment requests with `zone` and `network` params
- **ZWS Handshake** — wallet↔dApp connection, **100% offline** (QR/mesh/NFC)
- **Wallet Recovery** — BIP-39 24-word mnemonic + encrypted file backup
- **Tiered Cryptography** — RSA-2048 (Light Node) / RSA-4096 (Bunker)

👉 **[Read the Full Specification](docs/research/zcp2o-wallet-standard.md)**

### 📖 Terminology & Glossary

A comprehensive dictionary of 60+ terms comparing ZCP2O to traditional blockchains:
- Proof-of-Play vs Proof-of-Work
- Digital Bunker vs Full Node
- Async Sync, Probationary Finality, Implicit Proof of Humanity
- Trust-Weighted Consensus vs Longest Chain

👉 **[Read the Terminology](docs/terminology.md)**

### 📁 Other Documentation

- [📄 Litepaper](docs/litepaper.md) — Vision and architecture
- [🛡️ Threat Model](docs/security/threat-model.md) — Security analysis and mitigations
- [❓ FAQ](docs/faq.md) — Common questions about ZCP2O

---

## 🏗️ Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│  LIGHT NODES (Mobile Devices)                            │
│  - Run dApps (e.g., Alpha Drop)                          │
│  - RSA-2048 keypair (Light tier)                         │
│  - Local balance + recent transactions                   │
└────────────────────┬────────────────────────────────────┘
                     │ Mesh (BLE / Wi-Fi Direct / UDP)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  DIGITAL BUNKERS (Institutions: schools, clinics, shops) │
│  - Full Node with SQLite ledger                          │
│  - RSA-4096 keypair (Institutional tier)                 │
│  - REST API (FastAPI) for dApps                          │
│  - Async Sync to mainnet when online                     │
└────────────────────┬────────────────────────────────────┘
                     │ Internet (when available)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  MAINNET (Global State)                                  │
│  - Merger of all mesh zones                              │
│  - Fork Resolution via Cumulative Trust Weight           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎮 Proof-of-Play (PoP)

Not Proof-of-Work (wasteful electricity). Not Proof-of-Stake (requires capital). **Proof-of-Play** distributes tokens based on **real human activity**:

1. **Player** moves to a physical zone (GPS/mesh proximity)
2. **Claim** $WEEKS coins in the Alpha Drop game
3. **Local Bunker** validates via mesh network
4. **1% protocol fee** auto-routed to the Bunker (infrastructure incentive)
5. **Probationary Finality** (1-4 hours) prevents double-spend

**Zero-Capital Entry:** No token purchase required. Play, claim, earn $WEEKS for free.

---

## 🔐 Security & Privacy

### Threat Model

| Threat | ZCP2O Mitigation |
|--------|------------------|
| **Bot Farms** | Implicit Proof of Humanity (sensor noise) + Shadow Realm (0x reward) |
| **Double Spend** | Vector Clocks + Trust-Weighted Consensus |
| **Sybil Attacks** | Trust Score system (requires mesh encounters) |
| **Nation-State Actors** | RSA-4096 + roadmap to Post-Quantum Crypto (2028) |
| **Surveillance Capitalism** | 0-byte tracking, on-device verification, no centralized servers |

### Privacy-First Design

- **Zero data exfiltration** — no IP, fingerprint, or history collected
- **On-device cryptography** — all signing happens locally
- **Offline-first** — local transactions don't need internet
- **Sovereign identity** — users own their keys, no custodians

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Ringga999/zcp2o-protocol.git
cd zcp2o-protocol
```

### 2. Run a Digital Bunker (Docker)

```bash
cd implementations/zcp2o-node
docker compose up -d
```

Bunker starts at `http://localhost:8000` with Swagger UI at `/docs`.

### 3. Try the Human Proof Demo

Open: https://ringga999.github.io/zcp2o-protocol/implementations/zcp2o-captcha/demo/

---

## 🤝 Contributing

ZCP2O is open-source. We welcome contributions in the form of:
- Code reviews & bug reports
- Feature implementations
- Documentation & translations
- Testing across devices and networks

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License & Intellectual Property

ZCP2O uses a **layered protection model** to balance openness with
sovereignty:

| Layer | License / Protection |
|-------|---------------------|
| **Engine & implementations** | [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.txt) — free to use, copy, and fork for community & evaluation; derivative services must remain open-source. |
| **Specifications & documentation** | Open — to encourage global standard adoption. |
| **Brand** | "ZCP2O", "Human Proof", "Digital Bunker", and "Proof-of-Play" are **trademarks of the ZCP2O Foundation**. |
| **Commercial use** | Proprietary deployment requires a separate written license from the ZCP2O Foundation. |

> **Open core, protected brand.** You may read, fork, and build upon the
> protocol freely. You may not rebrand it, close-source derivatives, or
> deploy it commercially without a license.

---

<div align="center">

**"Born in the archipelago. Built for the unconnected world."**

🌏 *A protocol for every human, on every device, in every corner of the planet.*

</div>