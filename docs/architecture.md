# ZCP2O Architecture: The Offline-First Backbone

> **How ZCP2O Survives and Thrives Without the Global Internet**
> 
> This document details the core architectural components that allow ZCP2O to function as a resilient, offline-first distributed ledger.

---

## 🏗️ 1. High-Level Overview

Traditional blockchains rely on a flat, global Peer-to-Peer (P2P) network over TCP/IP (the internet). If the internet goes down, the blockchain halts.

ZCP2O introduces a **Tiered Mesh Architecture**. It operates primarily on local, short-range radio frequencies (Bluetooth LE, Wi-Fi Direct, LoRa) and only connects to the global internet when a gateway is available. 

The architecture is built on three main node types:
1. **Light Nodes (Mobile Nodes)**
2. **Full Nodes (Digital Bunkers)**
3. **Gateway Nodes**

---

## 📱 2. Node Types & Roles

### A. Light Nodes (The Masses)
*   **Hardware:** Standard smartphones, entry-level IoT devices.
*   **Storage:** Minimal (approx. 50MB - 200MB). Stores only the user's own balance, recent transaction history, and block headers.
*   **Role:** Initiate transactions, play games (Alpha Drop), relay messages, and validate local mesh consensus.
*   **Connectivity:** Intermittent. Can be offline for days.

### B. Full Nodes / Digital Bunkers (The Anchors)
*   **Hardware:** PCs, local servers, institutional hardware (schools, hospitals, internet cafes).
*   **Storage:** Large (10GB - 100GB+). Stores the complete, pruned history of the local zone's ledger.
*   **Role:** Act as local notaries. They validate transactions, archive data, and earn transaction fees. They provide the "ground truth" for the local mesh.
*   **Connectivity:** Can be entirely offline (LAN/Mesh only) or occasionally connected to the internet.

### C. Gateway Nodes (The Bridges)
*   **Hardware:** Any node (Light or Full) that temporarily gains access to the global internet (e.g., a smartphone entering a Wi-Fi zone, a truck passing a cell tower).
*   **Role:** Performs **Asynchronous Synchronization**. It uploads the local zone's accumulated ledger to the Global Mainnet and downloads global updates to bring back to the local mesh.

---

## 🕸️ 3. Local Mesh Consensus (Proof-of-Play)

When a transaction occurs (e.g., Player A claims 50 $WEEKS in Alpha Drop), it does not wait for global confirmation.

1. **Broadcast:** The transaction is broadcast via Bluetooth/Wi-Fi Direct to nearby nodes (Flood Algorithm).
2. **Validation:** Nearby Full Nodes (Digital Bunkers) and reputable Light Nodes verify the transaction against the local ledger state.
3. **Trust-Weighted Dynamic Quorum:** To prevent Sybil attacks (e.g., one person using 3 phones to validate their own fake transaction), consensus is not just a simple headcount. The required threshold must include:
   - At least **one (1) verified Full Node (Digital Bunker)**, OR
   - At least **three (3) Light Nodes** that have a **Trust Score > 80** (verified through historical valid activity and physical mesh encounters).
   - New nodes (Trust Score = 0) can broadcast transactions, but **cannot** act as validators for consensus.
4. **Reward:** The activity is logged, and $WEEKS are minted/allocated locally.

---

## 🔄 4. Asynchronous Synchronization (Async Sync)

This is the magic that prevents "State Bloat" and handles network partitions (islands).

*   **Scenario:** Village A and Village B are offline from each other and the global internet. Both process local transactions.
*   **The Sync:** When a Gateway Node from Village A travels to Village B (or gets internet access), it initiates a sync.
*   **Conflict Resolution:** Using **Lamport Timestamps** (logical clocks) and cumulative validator weight, the network automatically resolves any double-spending attempts. The ledger with the highest cumulative local validation weight takes precedence, and the losing transaction is reverted.
*   **Result:** No data is lost. The global ledger eventually converges to a single, agreed-upon truth without requiring constant connectivity.

---

##  5. Data Management: Pruning & State Separation

To ensure Light Nodes don't crash from storage bloat, ZCP2O strictly separates data types:

1. **Permanent Ledger (On-Chain):** Financial transactions ($WEEKS transfers, asset ownership). This is pruned periodically using **State Snapshots** (saving only the latest balance state, discarding old history for Light Nodes).
2. **Ephemeral Data (Off-Chain):** Chat messages, game telemetry, large files. These are transmitted via the mesh but **NOT** stored permanently on the ledger. Only a cryptographic hash (Proof-of-Delivery) is recorded. Once delivered, the payload is deleted from relay nodes to save battery and storage.

---

## 🛡️ 6. Security & Anti-Bot Architecture

*(See `docs/security/anti-bot-mitigation.md` for deep dive)*

ZCP2O employs **Implicit Proof-of-Humanity**:
*   **Hardware Binding:** Prevents multi-accounting on a single device.
*   **Behavioral Biometrics:** Analyzes input patterns (touch/mouse dynamics).
*   **Social Verification:** Trust scores increase when devices physically encounter other verified human nodes in the mesh.
*   **The Shadow Realm:** Accounts exhibiting bot-like behavior or isolated play are subjected to exponential reward decay (Diminishing Returns), making botting mathematically unprofitable.

---

## 📊 Architecture Diagram (Conceptual)

```text
[ Global Mainnet (Internet) ]
          ^
          | (Async Sync via Gateway Node)
          v
[ Digital Bunker (Full Node) ] <--- Wi-Fi Direct / LAN ---> [ Digital Bunker (Full Node) ]
          ^                                                          ^
          | (Bluetooth Mesh)                                         | (Bluetooth Mesh)
          v                                                          v
[ Light Node (Player A) ] <--- BLE ---> [ Light Node (Player B) ] <--- BLE ---> [ Light Node (Player C) ]