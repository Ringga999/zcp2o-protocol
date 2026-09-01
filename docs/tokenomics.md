# 🪙 ZCP2O Tokenomics — $WEEKS

**Version:** 1.0 (September 1, 2026)
**Status:** Canonical economic specification
**Companion docs:** `litepaper.md`, `master-plan.md`, `crypto-agility.md`,
`security-hardening.md`, `terminology.md`

---

## Principles (non-negotiable, from Litepaper)

1. **No Faucet, Only Play.** Every $WEEKS is earned through verifiable
   contribution (play, relay, validate, human-proof). There is no free money.
2. **Zero-Capital Entry.** No token purchase is ever required to participate.
3. **Utility over speculation.** Value is driven by use, not hype.
4. **Infrastructure pays for itself.** A 1% protocol fee rewards the
   Digital Bunkers that maintain the network.

---

## Supply

| Parameter | Value |
|-----------|-------|
| **Total supply cap** | **100,000,000 $WEEKS** (hard cap, never exceeded) |
| **Premine** | **0%** — fair launch, no insider allocation |
| **ICO / presale** | **None** — zero-capital philosophy |
| **Treasury** | **0%** — infrastructure earns via the 1% fee, not allocation |

---

## Emission (how coins are born)

Coins are minted **only** by the PoP Claim Portal (`zcp2o-claim`),
i.e., verified human activity:

| Parameter | Value |
|-----------|-------|
| **Base reward** | **10 $WEEKS** per verified Human Proof |
| **Quality scaling** | reward × (human-ness score / 100) |
| **Trust multiplier** | × (identity trust / 100), capped at ×1.5 |
| **Daily cap per identity** | **20 proofs/day** (anti-bot-farm) |
| **Diminishing returns** | proofs 11–20 earn 50% |

**Example:** a new identity (trust 50) with score 80 earns
10 × 0.80 × 0.50 = **4 $WEEKS** per proof, up to 20 proofs/day.

---

## Halving (scarcity schedule)

**Model:** activity-based epochs (Bitcoin-style), not calendar-based.
Emission follows real human activity, not the clock.

| Epoch | Coins minted in epoch | Base reward |
|:---:|:---:|:---:|
| 1 | first 50,000,000 | 10 |
| 2 | next 25,000,000 | 5 |
| 3 | next 12,500,000 | 2.5 |
| … | … (continues until rewards round to 0) | … |

**Guarantee:** 50M + 25M + 12.5M + … = **100,000,000** (hard cap, asymptotic).

**Elegant property:** because epoch size and reward halve together,
every epoch requires the **same amount of human work**:
50M ÷ 10 = 25M ÷ 5 = 12.5M ÷ 2.5 = **5,000,000 verified human proofs per epoch**.
Scarcity rises; the human effort per epoch never changes.

**Rationale:** slow adoption cannot waste an epoch (calendar halving would);
fast adoption cannot drain the cap early.

---

## Fees

| Parameter | Value |
|-----------|-------|
| **Transfer fee** | **1%**, fixed, routed to the validating Bunker |
| **Purpose** | passive income for infrastructure (Litepaper rule #4) |

---

## Genesis Block (Block 0)

- **Ceremony:** a single genesis block minting **0 coins to no one** —
  the chain begins empty; every coin must be earned by a human.
- **Embedded message (Satoshi-style):**

> `ZCP2O Genesis — 2026-09-01 — "For the 2.6 billion the internet forgot."
>  No premine. No ICO. No masters.`

  (The exact ceremony timestamp is embedded at execution time.)

- **Implementation:** the `zcp2o-node` genesis routine writes Block 0 to the
  SQLite ledger; Chain View displays it permanently.

---

## Anti-abuse (economic security)

- Nonce + expiry + server-side RSA-PSS (`security-hardening.md` v1.3)
- Sovereign identity with revocable trust (P5)
- Daily caps + diminishing returns (above)
- **Diversity scoring (roadmap):** trust grows with distinct domains/devices,
  not volume — bot farms earn trust slowly.

---

## Identity Equation (economic identity)

Bitcoin: `P = k·G` — identity = ownership of a secret scalar (math-only).
ZCP2O: `zid = H(p·q)`, registered **only if** a Human Proof verifies —
identity = secret RSA keypair **+ proven humanity**.
(See `terminology.md` — Identity Equation.)

---

## Summary

$WEEKS is a **proof-of-humanity asset**: scarce (100M hard cap), fairly
launched (0 premine), earned only by being human, and maintained by a
self-funded infrastructure (1% fee).