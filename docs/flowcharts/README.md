# 🗺️ ZCP2O Flowcharts

> **Visual maps of the ZCP2O ecosystem — because humans understand pictures faster than paragraphs.**

This folder holds the canonical architecture diagrams of the protocol.
GitHub renders the Mermaid sources below automatically.
Raw `.mmd` files are included for PNG/SVG export via [mermaid.live](https://mermaid.live).

---

## 1️⃣ ZCP2O Ecosystem — End-to-End

```mermaid
flowchart TB
    subgraph L1["1️⃣ HUMAN LAYER — zero capital, zero spy"]
        U(["👤 Anyone with a phone"])
        CAP["🛡️ zcp2o-captcha<br/>3s motoric proof<br/>on-device, 0 bytes out"]
    end

    subgraph L2["2️⃣ APP LAYER — where humans act"]
        WAL["👛 Web Wallet v3<br/>self-custody, multi-wallet"]
        AD["🎮 Alpha Drop<br/>offline mesh PoP game"]
        CL["🎮 Circle Launcher<br/>online tick PoP game"]
    end

    subgraph L3["3️⃣ BUNKER LAYER — the institution node"]
        API["🏦 zcp2o-node API<br/>FastAPI + SQLite ledger"]
        CORE["⚙️ zcp2o-core<br/>RSA-4096/2048 + PoP consensus"]
    end

    subgraph L4["4️⃣ CHAIN LAYER — immutable truth"]
        CH[("⛓️ Blocks<br/>GENESIS · REWARD<br/>TRANSFER · TICKET")]
        PIO[("🏅 Genesis Pioneers<br/>sovereign IDs")]
    end

    subgraph L5["5️⃣ TRANSPARENCY LAYER — public audit"]
        EXP["🔭 Explorer v2<br/>blocks · txs · human proofs"]
    end

    U -->|"solve proof"| CAP
    CAP -->|"proof token"| WAL
    CAP -->|"proof token"| AD
    CAP -->|"proof token"| CL
    WAL -->|"register · claim · transfer"| API
    AD -->|"settlement tx via mesh"| API
    CL -->|"settlement tx via tick 2-3s"| API
    API --> CORE
    CORE --> CH
    CH --> PIO
    CH --> EXP
```

**How to read (5 layers):**
1. **Human** proves humanity on-device (0 bytes exfiltrated).
2. **Apps** consume the proof token (wallet, games).
3. **Bunker** validates & orders everything into the ledger.
4. **Chain** stores immutable truth (blocks + pioneer IDs).
5. **Explorer** lets anyone audit it publicly.

---

## 2️⃣ Circle Launcher — Proof-of-Play Loop

> 📂 **Raw source file:** [`implementations/zcp2o-circle/circle-launcher.mmd`](../implementations/zcp2o-circle/circle-launcher.mmd)


```mermaid
flowchart TB
    A(["👤 Player opens game"]) --> B{"🛡️ Human proof<br/>solved?"}
    B -- fail --> X["❌ Entry denied<br/>motor score logged"]
    B -- pass --> C["🌍 WORLD 1 — free entry<br/>10k px server · max 100 players"]
    C --> D["🕹️ Session 5-15 min<br/>blue vs red circles"]
    D --> E["🪙 GOLD collected<br/>off-chain game DB"]
    E --> F["📤 Settlement tx on-chain<br/>XP delta + session result"]
    F --> G{"💰 Gold >= 100<br/>+ fresh captcha?"}
    G -- no --> C
    G -- yes --> H["🌍 WORLD 2 — 100 gold entry"]
    H --> I["🕹️ Session 5-15 min"]
    I --> J["💎 $ZPRO REWARD tx on-chain"]
    J --> K["✍️ Co-sign block hash<br/>validator_signatures"]
    K --> L(["🏆 Player = contributing validator"])
    D -.- T["🔄 Tick polling 2-3s<br/>Bunker API = source of truth"]
    H -.- T
```

**How to read (6 beats):**
1. Entry is gated by human proof — bots are denied & scored.
2. World 1 is free: play, collect GOLD (off-chain, fast).
3. Every session settles on-chain (XP + result) — the chain stays alive.
4. 100 gold + fresh captcha unlocks World 2 (gold sink = anti-inflation).
5. World 2 pays $ZPRO via on-chain REWARD transactions.
6. Players co-sign block hashes → the game feeds SPEC-04 validators.

---

## 🖼️ Export for Social Media

1. Copy the contents of `ecosystem.mmd` or `circle-launcher.mmd`.
2. Paste into [mermaid.live](https://mermaid.live).
3. **Actions → Export PNG / SVG**.
4. Post — one picture, whole protocol, ten seconds.

---
*Locked by Ringga999 + Mr. Architect · ZCP2O Foundation*