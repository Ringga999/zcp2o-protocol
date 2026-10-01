# 🏪 NotaPeer — First ZCP2O Implementation

> *A protocol without a living implementation is a poem without a reader. NotaPeer is the reader — and the writer.*

**Status:** LIVE · recorded 1 October 2026
**App repo:** private (`notapeer-app`) · Doctrine repo: `notapeer` (public)
**Explorer proof:** https://sepolia.etherscan.io/address/0x9101510F79293BB2F34773589c6cF804c764b446

---

## 1. What NotaPeer Implements

NotaPeer is a sovereign bookkeeping app for micro-merchants (warung):
local-first ledger, shift-based cashier, attendance as proof-of-presence,
and merchant-owned identity. It is the first application to consume ZCP2O
primitives end-to-end, offline-first.

## 2. Contracts Consumed

| Contract | Network | Address | Role in NotaPeer |
|---|---|---|---|
| WitnessRegistry v1 | Sepolia | `0x9101510F79293BB2F34773589c6cF804c764b446` | Public attestation of pseudonymous faces (proof-of-human) |
| UMKMAnchor | Sepolia | `0xd98bC541D2eb837b40e291fa8cfE45e35E5F64Bb` | Monthly Merkle-root anchor of the ledger (genesis monument, 23 Sep 2026) |

WitnessRegistry deployed at block **11814611** (30 Sep 2026) via Remix,
creator `0x6C2CcC9E…B262ED6d`. Append-only, ownerless, burn-free — as specced
in `specs/witness-registry.md`.

## 3. Genesis Witness (first face attested on-chain)

The first `Attested` event in WitnessRegistry history:

```
block      : 11814611
tx         : 0xdb051c9f51a… (see explorer Events tab)
face       : 0xd63e90a9221a246c583bbe5aaaa34d9db054f8240347d8d6380964c279a0073
commitment : 0xdb4dba8d2299d2c42ffead1747859c9bc0964dcef19138cb590fcd17442d8d46
attester   : 0x6C2CcC9E85b407d412c1a9b564dcc90cB262ED6d
at         : 1790770740  (30 September 2026)
```

Note the transparency: the displayed zid `zd63e90a…34d9d` is the first 16 bytes
of `face` — the chain stores the full 32-byte face, the UI shows a friendly
prefix. No root, no trace, no PII ever touched the chain.

## 4. Patterns Implemented (reference for future implementers)

1. **Offline-first attestation queue.** Registration never waits for network.
   Trace commitment + face are queued locally; `flushQueue()` sends
   `attest(face, commitment)` when wallet+network exist. Badge UI is honest:
   ⏳ pending until the chain event exists, ✅ after.
2. **Sovereign identity: root + faces.** A 96-bit root secret (NRP-12: twelve
   words from a fixed 256-word list) never leaves the device; faces are
   `sha256(root ‖ context)` — merchant/worker/witness faces are unlinkable
   without the root.
3. **Proof-of-human captcha.** 3-second hold with micro-jitter sampling →
   quantized trace → `sha256` commitment. Local implicit proof now; on-chain
   witness consensus reserved (see captcha SDK roadmap).
4. **Language-neutral Merkle leaves.** Ledger categories are canonical ids
   (`kopi`, `nasi`, …); labels are display-only. Auditors in any language
   compute the same root.
5. **Attendance as proof-of-presence.** Every shift logs the acting face,
   open/close timestamps, and sales totals — the seed of trust-weighted
   reputation.

## 5. Reserved Paths Originating Here

- **Employment binding** — local `boundTo` now; on-chain `Bound/Unbound`
  reserved in `specs/employment-binding.md`.
- **Captcha SDK & public captcha app** — planned after owner-app completion
  (SDK → playground → CaptchaSiteRegistry → reCAPTCHA-style public service).

## 6. Doctrine Alignment

NotaPeer obeys the six ZCP2O laws: witness-mandatory, offline-first,
privacy-first, append-only history, doctrine-in-docs, transparency-based
sybil resistance. Its source is private by choice of its founder; its
**proofs are public by design** — every anchor and attestation lives where
anyone can verify them.

---

*Companion documents: `notapeer/docs/IDENTITY.md` · `notapeer/docs/ROLES.md` ·
`notapeer-app/docs/SPEC-IDENTITY.md` · `notapeer-app/docs/SPEC-ROLES.md`*