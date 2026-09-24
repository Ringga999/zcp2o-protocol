# 🌳 From 1 Million Transactions to 1 Hash

> *How a warung's entire month of transactions becomes a single cryptographic proof — without exposing a single detail.*

```mermaid
flowchart TD
    %% Styling
    classDef leaf fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef node fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef root fill:#dcfce7,stroke:#16a34a,stroke-width:3px,color:#14532d
    classDef chain fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#581c87
    classDef privacy fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d

    %% Layer 1: Raw transactions
    subgraph DEVICE["📱 Warung's Device (30 days)"]
        direction TB
        L1["☕ Rp 15.000<br/>1 Sep 08:12"]:::leaf
        L2["🍜 Rp 25.000<br/>1 Sep 12:30"]:::leaf
        L3["🍚 Rp 12.000<br/>1 Sep 19:45"]:::leaf
        L4["🥤 Rp 8.000<br/>2 Sep 10:15"]:::leaf
        LN["... 2,847 more"]:::leaf
        L99["☕ Rp 15.000<br/>30 Sep 22:01"]:::leaf
    end

    %% Layer 2: Leaves (hashed)
    H1["hash(L1)"]:::node
    H2["hash(L2)"]:::node
    H3["hash(L3)"]:::node
    H4["hash(L4)"]:::node
    H99["hash(L99)"]:::node

    %% Layer 3: Intermediate nodes
    N1["hash(H1+H2)"]:::node
    N2["hash(H3+H4)"]:::node
    N99["hash(...)"]:::node

    %% Layer 4: Root
    ROOT["⚓ MERKLE ROOT<br/>0x7a3f...9e2b<br/>32 bytes"]:::root

    %% Layer 5: On-chain
    CHAIN["⛓️ Sepolia Blockchain<br/>1 transaction<br/>~0.0001 ETH gas"]:::chain

    %% Flow
    L1 --> H1
    L2 --> H2
    L3 --> H3
    L4 --> H4
    LN -.-> H99
    L99 --> H99

    H1 --> N1
    H2 --> N1
    H3 --> N2
    H4 --> N2
    H99 --> N99

    N1 --> ROOT
    N2 --> ROOT
    N99 --> ROOT

    ROOT -->|"Only the root<br/>goes on-chain"| CHAIN

    %% Side notes
    DEVICE -.->|"Raw data NEVER leaves<br/>the device"| PRIV["🔒 Privacy Preserved<br/>100%"]:::privacy
    CHAIN -.->|"Anyone can audit<br/>on Etherscan"| AUDIT["👁️ Fully Auditable<br/>by anyone"]:::chain
```

---

## 📖 The Merkle Magic (5 Layers)

| Layer | What | Where |
|-------|------|-------|
| 1 | Raw transactions (thousands) | 📱 Local device only |
| 2 | Each tx hashed to 32 bytes | 📱 Local device only |
| 3 | Hashes paired & re-hashed | 📱 Local device only |
| 4 | **Single Merkle Root** (32 bytes) | 📱 → ⛓️ Goes on-chain |
| 5 | Verification proof for anyone | 🌍 Public on blockchain |

---

## 🎯 Why This Is Revolutionary

### ✅ Privacy Preserved
- Raw transaction data **NEVER** leaves the warung's device
- Not a single customer name, product, or price is exposed
- Only the 32-byte Merkle root is published on-chain

### ✅ Verifiable by Anyone
- A lender can cryptographically verify ANY single transaction
- Using a "Merkle proof" (5 sibling hashes), they confirm: *"Yes, this Rp 15,000 coffee was part of the anchored month"*
- No need to download 2,851 transactions — just 5 hashes

### ✅ Cheap to Anchor
- 30 days × 100 transactions = 3,000 records
- All compressed into **1 transaction** on-chain
- Gas cost: ~0.0001 ETH (~$0.30) regardless of volume

---

## 🔍 Verification Example

> *"Did this warung really sell Rp 15,000 coffee on September 1st at 08:12?"*

**Proof needed:**
1. The transaction itself (from warung)
2. 5 sibling hashes along the path
3. The public Merkle root (from blockchain)

**Verification time:** < 1 millisecond  
**Privacy leaked:** Zero bytes  

---

## 📚 Related Documentation

- [Ecosystem Flow](./ecosystem.md) — the full protocol architecture
- [From Coffee to Credit](./coffee-to-credit.md) — the user journey
- [Circle Launcher Game Loop](./circle-launcher.md) — Proof-of-Play in action
- [WHITEPAPER.md](../../WHITEPAPER.md) — the full ZCP2O vision

---

*Built in public · Solo founder · $0 funding · 23 September 2026*