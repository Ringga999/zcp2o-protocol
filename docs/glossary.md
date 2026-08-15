# ZCP2O GLOSSARY

> A quick, human-friendly dictionary for the ZCP2O ecosystem.
> For in-depth technical analysis, see [`terminology.md`](./terminology.md).

---

## 💰 VALUE & WALLET

**WEEKS ($WEEKS)** — The native unit of value in ZCP2O; time-based value earned through presence and participation.

**HOUR** *(proposed)* — The smallest sub-unit of WEEKS. 1 WEEKS = 168 HOURS.

**Address (WKS-…)** — A public identifier for receiving funds, derived from the hash of an RSA public key. Example: `WKS-b74acadc…`

**Light Wallet** — A lightweight application (game/mobile) that stores the user's private key and communicates with Digital Bunkers via REST API. Does not store the blockchain.

**Private Key** — The secret RSA key that proves ownership of funds. Never leaves the user's device.

**Digital Signature** — A mathematical proof that a transaction was authorized by the owner of the funds.

**Recovery Phrase** *(roadmap)* — A word-based backup of the wallet key. Currently keys are stored as files; mnemonic backup is planned.

**Transaction** — A signed instruction to move WEEKS between addresses.

**Protocol Fee (1%)** — A fixed, predictable transfer fee — not an auction-based fee market like Bitcoin.

**Balance** — The total WEEKS owned by an address on the account ledger.

---

## 🌐 NETWORK

**Digital Bunker** — A full node that stores the complete ledger, validates transactions, and serves the REST API. Operated by institutions or trusted parties.

**Light Node / Light Client** — An end-user application that uses the network without storing the chain.

**Gateway Node** — A bridge that connects an offline mesh to the internet or to other meshes.

**Mesh Network** — A local peer-to-peer network (UDP) for transacting without internet.

**Offline-First** — A design principle: the network keeps working locally while disconnected, and synchronizes later.

**Async Sync** — The mechanism that synchronizes offline transactions to a Bunker once connectivity returns.

**Ledger Merge** — The process of reconciling and combining diverged offline ledgers into one consistent history.

**Trust Score** — A node's reputation value that influences fork resolution and governance weight.

---

## ⛓️ CHAIN & CONSENSUS

**Blockchain (ZCP2O Chain)** — A chronological, hash-linked record of blocks, stored by Digital Bunkers.

**Block** — A bundle of transactions with a header hash and trust metadata.

**Genesis Block** — The first block; created when a Bunker is initialized.

**Proof of Presence (PoP)** — ZCP2O's consensus/issuance mechanism: value is claimed through verified physical presence and activity, NOT computation.

**Finality / Confirmation** — A transaction is final once accepted and appended by a Bunker; offline transactions become final after sync and merge.

**Double Spending** — Attempting to spend the same funds twice; prevented by account validation and trust-weighted fork resolution.

---

## 🎮 ECONOMY & GOVERNANCE

**Alpha Drop** — The flagship game where players claim PoP coins in the physical world.

**Fee-to-Spawn** — The mechanism by which fees fund network value creation and incentives.

**ZIP (ZCP2O Improvement Proposal)** — A formal proposal for protocol changes; activated via Trust-Score-weighted on-chain voting.