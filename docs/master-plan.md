# 🗂️ ZCP2O Protocol — Master Plan & Roadmap

**Version:** 1.0 (August 31, 2026)
**Status:** Living Document
**Author:** ZCP2O Core Team
**License:** AGPL-3.0 (code) / CC-BY (docs)

---

## Executive Summary

ZCP2O Protocol is a **sovereign, offline-first human verification system** —
a zero-capital, privacy-preserving alternative to surveillance-based CAPTCHAs
and capital-based consensus mechanisms.

This living document tracks **every completed implementation, strategic
concept, roadmap item, and pending task** as of August 31, 2026.

### Current Status Snapshot

| Category | Count | Status |
|----------|:---:|:---:|
| Completed & production-ready | 27 | ✅ Live |
| Strategic concepts (ready to execute) | 5 | 🟢 Waiting for trigger |
| Major roadmap items (Phase 2+) | 3 | 🔮 Planned |
| Pending hygiene tasks | 5 | 🧼 Scheduled |
| Strategic decisions (competition) | 3 | 🏆 Urgent |

### Core Principles (non-negotiable)

1. **Zero data exfiltration** — no IP, fingerprint, or history collected
2. **On-device cryptography** — all signing happens locally
3. **Offline-first** — local transactions don't need internet
4. **Sovereign identity** — users own their keys, no custodians
5. **Zero-capital entry** — no token purchase required to participate

---

## Table of Contents

1. [Completed Implementations](#a-completed-implementations)
2. [Strategic Concepts (Ready to Execute)](#b-strategic-concepts)
3. [Major Roadmap Items (Phase 2+)](#c-major-roadmap-items)
4. [Pending Tasks](#d-pending-tasks)
5. [Execution Sequence](#e-execution-sequence)
6. [Appendix: Design Decisions Log](#f-appendix-design-decisions-log)

---

## A. Completed Implementations

### Phase 1 — Product & Developer Experience

| # | Item | Location |
|---|------|----------|
| 1 | 15 Human Proof challenges (hp1–hp13) | `implementations/zcp2o-captcha/widget/` |
| 2 | `embed.js` — one-line adoption (reCAPTCHA-style), SRI-aware | `implementations/zcp2o-captcha/widget/embed.js` |
| 3 | React component + `zcp2o:verified` event | `docs/integration.md` |
| 4 | Vanilla JS integration example | `implementations/zcp2o-captcha/examples/vanilla.html` |
| 5 | Interactive demo (play all challenges) | `implementations/zcp2o-captcha/demo/` |

### Phase 2 — Public Infrastructure

| # | Item | Location |
|---|------|----------|
| 6 | Bunker hardening v1 (API key auth, rate-limit, CORS, security headers) | `implementations/zcp2o-node/api.py` |
| 7 | Secret management (`.env` + `.gitignore`) | root |
| 8 | Public Bunker deployment (PythonAnywhere, custom ASGI→WSGI adapter) | `/var/www/kdewa_pythonanywhere_com_wsgi.py` |
| 9 | Chain View Explorer (live dashboard: height, peers, trust) | `implementations/zcp2o-chainview/index.html` |
| 10 | README v2 + Landing v2 (Production Ready badge, Live Infrastructure) | root `README.md` + `index.html` |
| 11 | 5W+1H presentation material | (internal) |

### Phase 3 — Security Hardening v1.2 (P1–P4)

| # | Item | Proof |
|---|------|-------|
| 12 | **P1 SRI** — 14 SHA-384 hashes embedded in `embed.js` | `examples/sri-demo.html` (BLOCKED/ALLOWED proof) |
| 13 | **P2 Challenge Binding** — token bound to `challenge` + `signals_digest` | token v5 |
| 14 | **P4 Nonce + Expiry** — 16-byte unique nonce, 5-minute TTL | core v0.5 |
| 15 | **P3 Server-Side Verify** (`/verify`) — RSA-PSS signature validation | `implementations/zcp2o-node/verify.py` |
| 16 | `docs/security-hardening.md` — technical spec + attack test evidence | `docs/` |
| 17 | README Threat Model — 8 mitigation rows | root `README.md` |

**Attack test evidence (Aug 28, 2026):**
- Widget file tampered → browser BLOCKS (SRI)
- Garbage token → `401 malformed_token`
- Valid token → `200 verified`
- Replayed token → `401 nonce_replay` / `token_expired`

### Phase 4 — Sovereign Auth v2 (Identity-Based, No Shared Secret)

| # | Item | Location |
|---|------|----------|
| 18 | Phase B scope-split — `/transfer` disabled by default | `api.py` |
| 19 | Identity Registry — "humanity = API key", no shared secret onboarding | `identity.py` + `/identity/register` |
| 20 | Signed-request verifier (canonical string + RSA-PSS) | `sovereign.py` |
| 21 | Dual-auth (`_dual_auth`) — legacy API key OR sovereign identity | `api.py` |
| 22 | CORS preflight for sovereign headers | `api.py` |
| 23 | Dogfood test page (2 widgets: register + sign) | `examples/sovereign-test.html` |
| 24 | API key rotation (old key retired) | WSGI env |
| 25 | `.gitignore` cleanup (test artifacts excluded) | root |

**Philosophy:** *"We replaced the master key with crypto IDs — and to get
an ID, you must prove you are human. ZCP2O eats its own dogfood."*

### Phase 5 — Advanced Documentation

| # | Item | Location |
|---|------|----------|
| 26 | `docs/crypto-agility.md` — RSA→Ed25519→Post-Quantum roadmap | `docs/` |
| 27 | Crypto-Agility section in root README | root `README.md` |

---

## B. Strategic Concepts (Ready to Execute)

### B1. CAPTCHA as PoP Consensus (Proof-of-Humanity-as-Consensus-Weight)

**Concept:** People solving CAPTCHA = participating in transaction
verification. Human Proof tokens become **trust-weighted consensus votes**.

**Existing foundations (70% ready):**
- ✅ `identities.json` with per-identity trust score
- ✅ Signed requests (identities sign actions)
- ✅ Peer registry with `trust_score`
- ✅ TODO in `api.py`: `# bunker.validate_and_add_transaction(tx)`

**To build:**
1. `/attest` endpoint — identities co-sign pending transactions
2. Trust-weighted finality — transaction final when cumulative trust ≥ threshold

**Effort:** 2–3 days | **Value:** 🔥🔥🔥

---

### B2. $WEEKS Tokenomics + Genesis Block

**Concept:** Fair launch (no premine/ICO). Emission only via PoP activity.
1% protocol fee routed to Bunker (infrastructure incentive).

**Existing foundations:**
- ✅ SQLite ledger in Bunker (`/balance/{address}` returns `$WEEKS`)
- ✅ `zcp2o-core` ledger + consensus primitives
- ✅ Fair-launch principle agreed

**To build:**
1. `docs/tokenomics.md` — supply cap, emission rules, fee structure
2. Genesis ceremony — block 0 with Satoshi-style message (Indonesian
   newspaper headline + timestamp)

**Effort:** 1–2 days | **Value:** 🔥🔥

---

### B3. $WEEKS Mining (Human Activity = Work)

**Concept:** Mining in PoP is NOT hash computation — it is **verified human
activity**. The user becomes Miner #1 (like Satoshi mining genesis).

**Mining loop:**
```
Solve CAPTCHA → token v5 → signed request → Bunker verify → MINT $WEEKS
```

**Effort:** = same as B4 (Claim Portal) | **Value:** 🔥🔥

---

### B4. PoP Claim Portal (Human Mining) (Minimal Viable PoP Economy)

**Concept:** Solve CAPTCHA = earn $WEEKS. The reference implementation that
unifies B1+B2+B3.

**To build (`zcp2o-claim`):**
1. `/faucet` endpoint — requires signed request + fresh human proof
2. Faucet page (widget → identity → claim)
3. Anti-bot: per-identity daily cap, nonce/expiry

**Effort:** 3–5 days | **Value:** 🔥🔥

---

### B5. ZWS Adoption in MetaMask / Trust / Bitget

**Concept:** ZWS is EVM-independent (a feature: sovereignty), so we need
adapters to enter existing ecosystems.

**Existing foundations:**
- ✅ ZWS v1.0 spec (URI scheme, QR handshake, BIP-39 recovery)
- ✅ `docs/zws.md`

**To build:**
1. `zcp2o-wallet` web MVP (ZWS reference implementation)
2. **ZCP2O Snap** for MetaMask (most open path)
3. WalletConnect-style adapter for Trust/Bitget
4. `docs/zws-adoption.md`

**Effort:** 1–2 weeks | **Value:** 🔥

---

## C. Major Roadmap Items (Phase 2+)

### C1. ZCP2O Conclave (Multi-Agent AI Team)

**Concept:** An AI agent team for error analysis, cybersecurity, and
problem-solving. Inspired by NVIDIA's multi-agent "vibes coding."

**Mechanism:**
- Agents have **read-only** access to Bunker API (cannot edit code)
- Dedicated GitHub account: `zcp2o-conclave-implementations` (sandbox)
- Multi-agent discussion loop (runs until host presses "off")
- Mission system (host assigns tasks)

**Effort:** 2–4 weeks | **Value:** 🔥🔥🔥
**Narrative:** *"An AI team that builds ZCP2O."*
**Timing:** After competition / post-funding.

---

### C2. Offline Wallet Android (ZWS-Compliant)

**Concept:** 100% offline, sovereign wallet. No server dependency.

**Features:**
- Keypair generation (Ed25519 for mobile performance)
- URI scheme: `zcp2o://send?to=...&amount=...`
- QR code handshake (offline transfer)
- BIP-39 mnemonic recovery
- Local SQLite ledger

**Effort:** 3–5 days (MVP), 2–3 weeks (production) | **Value:** 🔥🔥
**Timing:** After competition.

---

### C3. Minecraft Implementation (PoP Mining Game)

**Concept:** Mining blocks/farming → PoP verification → exchange to $WEEKS.
The most viral demo: *"mine diamond, earn crypto."*

**Mechanism (`zcp2o-minecraft`):**
1. Minecraft server + ZCP2O addon
2. Event listeners (mine diamond → PoP challenge → token → verify → mint)
3. Exchange system (`/balance`, `/transfer`)
4. In-game dashboard

**Effort:** 2–3 days (MVP), 1–2 weeks (production) | **Value:** 🔥🔥
**Expansion:** Roblox, other games (proof-of-play as universal standard).
**Timing:** After competition.

---

## D. Pending Tasks

### D1. Hygiene & Documentation (5 items)

| # | Item | Effort |
|---|------|:---:|
| 1 | **Translation sweep** (ID→EN): `sovereign-test.html`, `sri-demo.html`, `security-hardening.md`, code comments | 1–2 days |
| 2 | **Landing `index.html`** — update "v1.1" → v1.2 + sovereign + crypto-agile | 30 min |
| 3 | **`zcp2o-node/README.md`** — document new endpoints (`/verify`, `/identity/register`, signed headers) | 1 hr |
| 4 | **is-a.dev PR #48571** (`zcp2o.is-a.dev`) — awaiting maintainer review | weekly check |
| 5 | **`security-hardening.md` v1.3** — add sovereign auth section (English) | 1 hr |

### D2. Strategic Decisions (Competition)

| # | Item | Status |
|---|------|:---:|
| 1 | **BEDAH LOMBA** — audit deadlines + requirements + IP clauses (REFACTORY UNAIR deadline **Sept 8**) | urgent |
| 2 | Decide: submit now vs build features first | pending |
| 3 | Prepare submission package (narrative + demo + docs) | arsenal ready |

---

## E. Execution Sequence

### NOW (before Sept 8)

1. **BEDAH LOMBA** (1–2 hrs) — decide submit or not
2. **Translation sweep** (1 day) — polish for submission
3. **Landing page update** (30 min) — v1.2 label
4. **SUBMIT** (if deadline allows)

### AFTER COMPETITION (Phase 2A — weeks 1–2)

5. **Genesis Block + Tokenomics** (1–2 days)
6. **PoP Claim Portal (Human Mining)** (3–5 days)
7. **Minecraft PoP** (2–3 days)

### PHASE 2B (months 1–2)

8. **Offline Wallet Android** (3–5 days MVP)
9. **ZCP2O Conclave AI** (2–4 weeks)
10. **ZWS adoption** (MetaMask Snaps + bridge)

### PHASE 3

11. **Proof-of-Humanity-as-Consensus** (`/attest`)
12. **Crypto-agility implementation** (Ed25519)
13. **Research docs** (`ai-convergence.md`, etc.)

---

## F. Appendix: Design Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Aug 24 | Deploy to PythonAnywhere (not Render/HF) | Free, no card, HTTPS |
| Aug 28 | RSA-2048 for Phase 1 | 100% browser WebCrypto support |
| Aug 28 | Hardening P1–P4 | Self-attack revealed gaps |
| Aug 30 | Scope-split `/transfer` | Cut blast radius of leaked key |
| Aug 30 | Sovereign Auth v2 | Shared secret = single point of failure |
| Aug 30 | Crypto-agility roadmap | Acknowledge RSA limits, plan Ed25519/PQC |
| Aug 31 | Master plan documented | Living document for continuity |

---

*"Born in the archipelago. Built for the unconnected world."* 🇩