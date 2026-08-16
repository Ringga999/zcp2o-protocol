# ZCP2O FAQ

> Answers to the most frequently asked questions from the community.
> For definitions see [`glossary.md`](./glossary.md);
> for deep analysis see [`terminology.md`](./terminology.md).

---

## Q1: If a PoP activity happens at 12:00 but is only verified at 13:00 (or later), isn't that a problem — especially in the early phase with few validators?

**A: No. ZCP2O verifies cryptographic receipts, not live observation.**

When a PoP activity occurs, the device immediately creates a **PoP Attestation**:
a hash of the event data (timestamp, location, coin ID) signed with the user's
private key. This receipt needs no validator present at that moment. It can be
submitted to any Digital Bunker hours or days later; the Bunker verifies the
signature, checks for double-claims, and applies trust rules.

In the early phase, three additional safeguards apply:
1. **PoP Attestation** — a hash-bound, signed receipt verifiable at any time.
2. **Probationary Finality** — new claims remain challengeable for a defined window before becoming final.
3. **Trust-Weighted Acceptance** — low-trust participants need more attestations or longer probation; high-trust participants finalize faster.

This is similar to Bitcoin's confirmations, but based on **time + reputation**
rather than block count.

---

## Q2: How does simple human activity (PoP) become "strong cryptography" without Bitcoin's massive computational power?

**A: Bitcoin makes *hashing* expensive. ZCP2O makes the *data being hashed* expensive.**

There are two different uses of hashing:
- **Bitcoin (Proof-of-Work):** hashing is the *work* — repeated billions of times, consuming enormous energy.
- **ZCP2O (Proof-of-Presence):** hashing is a *seal/fingerprint* — computed once, in milliseconds.

ZCP2O's security does not come from expensive computation, but from the fact
that **the input to the hash cannot be mass-produced by machines**: real
physical presence and real human activity. A smartphone computes the seal
instantly; no supercomputer can fake being physically present at a real location.

---

## Q3: Does my computer need to run Docker 24/7 to keep ZCP2O alive? Does everyone who contributes need Docker? What about low-spec laptops and phones?

**A: No. Docker is packaging, not the engine — and only Bunker operators need it (even that is optional).**

- **Players / Light Nodes (phones, low-spec laptops):** never install Docker. They simply use an app that talks to a Bunker over HTTP or the local mesh — just as you browse a website without installing the website's server.
- **Bunker operators:** Docker is a recommended best practice for consistent deployment, but the node is plain Python + SQLite and can run without Docker.
- **24/7 is not mandatory:** thanks to the offline-first design, users' transactions queue and sync when the Bunker wakes. Higher uptime simply builds higher reputation (Trust Score).

> *"Docker is the shipping container, not the engine. The buyer of the goods never needs to own a container."*

---

## Q4: What happens to the first computer that runs a node? Is it profitable or a loss? Must it run 24/7?

**A: The first node is a seed investment — like Satoshi's first node. Small cost, compounding long-term rewards.**

**Costs:** negligible — it can run on hardware you already own; 24/7 is not required.

**Rewards (compounding as the network grows):**
1. **Protocol fees (1%)** — every transaction through your Bunker accrues fees.
2. **Pioneer Trust Score** — the earliest, longest-running Bunkers accumulate the highest trust → maximum governance weight and reputation once the network is busy.
3. **Genesis position** — being recorded in the early chain carries historical and strategic value.
4. **Product anchor** — your Bunker serves your own app (Alpha Drop), indirectly driving product revenue.

> *"The first kiosk in an empty market pays costs first — but owns the best spot when the market fills up."*