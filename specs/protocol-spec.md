# ZCP2O Protocol Specification (v0.2.0)

> **Technical Rules and Data Structures for the ZCP2O Network**
> 
> This document defines the core technical specifications for developers building nodes, wallets, or applications (like Alpha Drop) on the ZCP2O protocol. It serves as the "RFC" (Request for Comments) standard for our ecosystem.

---

##  1. Network Topology & Transport

ZCP2O does not rely on a flat global internet topology. It uses a **Tiered Local Mesh Topology** with offline-first priority.

### 1.1 Transport Layers (Offline-First Priority)
ZCP2O prioritizes local, serverless communication. Global internet is only used as a fallback or for asynchronous syncing.
*   **Primary (Short-Range, True Offline):** Bluetooth Low Energy (BLE) 5.0+ for ultra-low power, short-range messaging.
*   **Secondary (Mid-Range, Local Network):** Local UDP Broadcast & Wi-Fi Direct / Wi-Fi Aware for higher bandwidth payloads within a local LAN/mesh (no internet required).
*   **Tertiary (Online Fallback):** WebRTC (via STUN/TURN) *only* when devices have active internet access and need to bridge distant peers, but never relied upon for core local mesh consensus.
*   **Quaternary (Long-Range - Future):** LoRa (Long Range) radio for kilometers-range mesh in rural areas.

### 1.2 Node Discovery
Nodes do not use DNS seeders. Instead, they use **Active Radio Scanning**:
1.  Nodes broadcast a `HELLO_ZCP2O` beacon every 30 seconds.
2.  Nearby nodes receive the beacon, extract the `Public Key ID` and `Node Type` (Light/Full).
3.  A secure, encrypted handshake (RSA-4096) is established if the nodes are not already connected.

---

##  2. Message Propagation: The Flood Algorithm

When a transaction or message is created, it must reach the local validators without central servers.

### 2.1 Flooding Rules
1.  **Origin:** Node A creates a payload.
2.  **Broadcast:** Node A sends the payload to all currently connected mesh neighbors.
3.  **Relay:** Upon receiving a payload, a neighbor checks its local `Seen_Hash_Set`. 
    *   If the hash is *new*, it adds it to the set and forwards the payload to its own neighbors.
    *   If the hash is *already seen*, it drops the payload to prevent infinite loops.
4.  **TTL (Time-To-Live):** Every payload has a `max_hops` integer (default: 5). If `hops >= max_hops`, the payload is dropped.

### 2.2 Broadcast Storm Prevention
To prevent network flooding when many nodes broadcast simultaneously:
*   **Exponential Backoff:** Nodes wait a random delay (100-500ms) before rebroadcasting.
*   **Priority Queue:** Transactions with higher Trust Score senders get priority in the relay queue.
*   **Zone Throttling:** Maximum 50 broadcasts per second per zone.

---

## 📦 3. Data Structures (JSON Format)

All data exchanged over the mesh is formatted in compact JSON.

### 3.1 Transaction Object
```json
{
  "tx_id": "a1b2c3d4...",
  "type": "activity_claim",
  "sender_pk": "WKS-9f8a7b...",
  "receiver_pk": "WKS-1c2d3e...",
  "amount": 50.00,
  "currency": "WEEKS",
  "timestamp": 1698765432,
  "logical_clock": 458,
  "payload_hash": "sha256_abc...",
  "signature": "rsa_pss_sig..."
}