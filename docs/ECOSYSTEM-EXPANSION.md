# 🌍 Ecosystem Expansion — Two Reserved Visions

> *A protocol grows only as fast as the hands willing to run it. This document reserves the space for the hands to come.*

**Status:** RESERVED — not built, only documented · 3 October 2026
**Home:** zcp2o-protocol (public, because builders deserve to see the horizon)
**Companions:** `docs/architecture.md` · `docs/master-plan.md` · `specs/`
**Non-interference:** Current NotaPeer wave (FASE 3B/3C/4) proceeds independently.

---

## Vision A — Miner / Node / Validator SDK Platform

### Why
ZCP2O is a **multi-consensus** protocol: captcha proof-of-human, Proof-of-Play,
bunker mesh sync, trust-weighted consensus. Each consensus needs executors —
miners, nodes, validators — but building a separate app for each fragments the
community and multiplies maintenance burden.

### Shape (reserved)
- **Mobile app** (Android-first, then iOS): one app, many consensus modules
  users can toggle on/off. Install once, choose what your device contributes.
- **Web dashboard** (blog-style landing + status panel): network health,
  live consensus stats, earnings preview, one-click "join" for any consensus.
- **Modular SDK** inside: each consensus ships as a plugin with a uniform
  interface (`start()`, `stop()`, `stats()`, `earnings()`).
- **Identity integration**: uses the same sovereign identity primitives
  (root + faces + NRP-12) already specced for NotaPeer — validators are humans
  too, and their reputation accrues on-chain.

### What it would host (initial candidates)
1. **Captcha validator** — co-sign human proof tokens (the missing v0.2
   assurance layer referenced in architecture.md §8.3)
2. **Bunker node** — REST API for nearby light nodes, SQLite ledger shard
3. **PoP zone witness** — GPS/mesh attestation of physical-zone claims
4. **Anchor witness** — periodic Merkle-root anchoring (already live via
   WitnessRegistry + UMKMAnchor on Sepolia)

### Why this matters
Without a validator platform, ZCP2O stays a *specification with a demo*.
With it, ZCP2O becomes a **runnable economy** where anyone with a phone can
contribute consensus and earn $ZPRO — the zero-capital thesis realized.

### Build trigger (not yet fired)
- NotaPeer app reaches feature-complete status
- At least two consensus modules have stable specs in `specs/`
- SDK reference contract lands (EmploymentRegistry, CaptchaSiteRegistry, or similar)

---

## Vision B — Mobile Mining App (NiceHash-style) for Play Store

### Why
NiceHash proved that **packaging blockchain participation as a simple mobile app**
can reach millions of non-technical users. ZCP2O has a unique angle: no GPU,
no electricity waste, no capital. Mining here is **human activity + device
contribution**, not raw compute.

### Shape (reserved)
- **Play Store release**: official ZCP2O Mining app — polished UX, onboarding,
  earnings dashboard, withdrawal.
- **Behind the curtain**: it IS Vision A's mobile app, but with a curated
  "auto-optimal" mode that picks the best consensus for the user's device and
  region (battery, signal, trust score).
- **Trust-weighted rewards**: $ZPRO distributed via Proof-of-Presence, not
  raw hash rate — aligning incentives with humanity, not hardware.
- **Offline-friendly**: accumulates proof locally when signal is poor,
  flushes when online — same offline-first doctrine as NotaPeer.

### Why this matters
NiceHash onboarded retail miners to Bitcoin without them understanding
blockchain. ZCP2O Mining would onboard **the unconnected 2.6 billion** to a
sovereign protocol without them understanding cryptography. This is the
bridge from "protocol in a GitHub repo" to "protocol in the pockets of
warung owners, farmers, and students."

### Build trigger (not yet fired)
- Vision A is live and stable
- Tokenomics math for mining rewards is audited and locked
- Play Store policy review passes (Google's crypto app rules are strict)
- Legal entity or foundation ready to publish under ZCP2O brand

---

## Doctrine Lines (non-negotiable)

1. **No custodial keys.** Both apps remain self-custody — users own their
   keys, no ZCP2O Foundation server holds them.
2. **No capital required.** Mining is human-activity-based, not wealth-based.
3. **Offline-first preserved.** Apps accumulate proofs offline and flush when
   connected.
4. **Sovereign identity reused.** Same root+faces+NRP-12 primitives as
   NotaPeer — no second identity system, no fragmentation.
5. **Open source implementations.** Code stays public; brand stays protected
   (per LICENSE layered model).

---

## Integration with Current Roadmap

These two visions live **in parallel, not in sequence**, with the current
NotaPeer waves:

```
NOW (Gelombang 3, 4, 5)
  → NotaPeer app matures: reports, QR, receipts, cashier, sync
  → Proves the protocol works for a real merchant use case
  → Generates the reference patterns these platforms will reuse

RESERVED (after NotaPeer feature-complete)
  → Vision A: validator SDK platform (mobile + web)
  → Vision B: Play Store mining app (consumer-facing Vision A)
  → Both consume the same identity, captcha, anchor, and token primitives
```

Building NotaPeer first is **strategically required**: it is the dogfood,
the reference implementation, the proof that the protocol's primitives are
sound before we hand them to thousands of miners.

---

## Questions Left Open (to answer when a trigger fires)

- Validator staking model: stake $ZPRO, or stake reputation (face trust-weight)?
- Play Store entity: ZCP2O Foundation, or regional partner publishers?
- Anti-sybil for validators: transparency-based (like WitnessRegistry) or
  stake-weighted?
- Reward distribution cadence: per-proof, daily, weekly?
- Mesh-only validators: should a device with no internet still earn for
  contributing local consensus?

---

*This document is a reservation, not a promise. The ecosystem earns these
visions by proving itself in NotaPeer first.*