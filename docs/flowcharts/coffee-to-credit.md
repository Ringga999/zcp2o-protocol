# ☕ From Coffee to Credit

> *A Rp 15,000 coffee sale unlocks a Rp 50,000,000 loan. Here's how.*

```mermaid
flowchart TD
    %% Styling
    classDef warung fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef local fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef crypto fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#581c87
    classDef chain fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    classDef score fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d
    classDef outcome fill:#fef9c3,stroke:#ca8a04,stroke-width:3px,color:#713f12

    %% Flow
    A[🛒 Kopi terjual<br/>Rp 15.000]:::warung --> B[📓 Dicatat di NotaPeer<br/>Offline-first, di perangkat]:::local
    B --> C[🌳 Akhir bulan<br/>Merkle tree terbentuk]:::crypto
    C --> D[⚓ Anchor on-chain<br/>Merkle root → Sepolia]:::chain
    D --> E[📊 Credit score lahir<br/>Data terverifikasi publik]:::score
    E --> F[💰 Pinjaman Rp 50 JUTA<br/>Tanpa agunan]:::outcome

    %% Side notes
    D -.->|Merkle root saja<br/>bukan data mentah| G[🔒 Privasi terjaga]:::chain
    E -.->|Bisa diaudit siapa pun<br/>di Etherscan| H[👁️ Transparansi penuh]:::score
```

---

## 📖 The Journey (6 Steps)

| # | Step | Layer |
|---|------|-------|
| 1 | Kopi terjual Rp 15.000 | 🏪 Dunia nyata |
| 2 | Dicatat di NotaPeer (offline) | 📱 Layer 1: Local Ledger |
| 3 | Merkle tree terbentuk akhir bulan | 🔐 Layer 2: Cryptography |
| 4 | Merkle root di-anchor ke blockchain | ⛓️ Layer 3: On-chain |
| 5 | Credit score lahir dari data terverifikasi | 📈 Layer 4: Reputation |
| 6 | Pinjaman Rp 50 juta tanpa agunan | 💵 Layer 5: Financial access |

---

## 🎯 Why This Matters

- **2.6 miliar** orang dewasa di dunia tidak memiliki akses perbankan
- **Rp 0** agunan yang mereka punya — tapi punya **rekam jejak nyata**
- NotaPeer mengubah **transaksi warung** menjadi **aset kriptografis** yang bisa diaudit
- Lender bisa memberi pinjaman **tanpa takut** karena data sudah terverifikasi on-chain

---

## 📚 Related Documentation

- [Ecosystem Flow](./ecosystem.md) — the full protocol architecture
- [Circle Launcher Game Loop](./circle-launcher.md) — Proof-of-Play in action
- [WHITEPAPER.md](../../WHITEPAPER.md) — the full ZCP2O vision

---

*Built in public · Solo founder · Rp 0 modal · 23 September 2026*