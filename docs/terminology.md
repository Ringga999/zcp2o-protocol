# ZCP2O Terminology & Glossary

> **The Bridge Between Traditional Blockchain and ZCP2O**
> 
> This document serves as a conversion dictionary for developers and researchers familiar with traditional blockchain (Bitcoin/Ethereum) to quickly understand ZCP2O.

---

##  Bitcoin/Traditional Blockchain → ZCP2O Mapping

| **Traditional Blockchain Term** | **ZCP2O Protocol Term** | **Key Differences** |
|------------------------------|--------------------|--------------------------|
| **Proof of Work (PoW)** | **Proof-of-Play (PoP)** | Bitcoin requires intensive, energy-wasting computation (mining). ZCP2O requires real-world productive activity (gaming, message relaying, learning). |
| **Miner** | **Validator / Full Node** | Miners burn electricity to find blocks. Validators store & validate transactions (earning fees). |
| **Mining** | **Validation / Archiving** | No energy-burning "mining". It's about network maintenance through data storage. |
| **Block** | **Local Ledger / Zone Block** | In ZCP2O, blocks can be local (per zone/mesh) before syncing to the global network. |
| **Gas Fee** | **Transaction Fee (1%)** | Fixed/percentage fee, distributed to Validators. No complex "gas limit" concepts. |
| **Satoshi** | **Week / MicroWeek** | Smallest unit of $WEEKS. (1 $WEEKS = 1,000,000 MicroWeeks). |
| **Wallet Address** | **Public Key ID (RSA)** | Wallet address derived from RSA 4096-bit Public Key. |
| **Private Key** | **Private Key (RSA)** | Same concept, but uses RSA 4096-bit (more secure against certain attacks than ECC). |
| **Recovery Phrase** | **Seed Phrase / Recovery Key** | Standard 12-24 words, or RSA key file backup. |
| **Node (Full Node)** | **Full Node / Archiver** | Stores entire ledger history. Requires large storage, earns higher fees. |
| **Light Node (SPV)** | **Light Node / Mobile Node** | Stores only own balance + block headers. Very lightweight (MBs), perfect for mobile. |
| **Mempool** | **Local Queue / Mesh Buffer** | Unvalidated transactions stored temporarily in local/mesh buffer. |
| **51% Attack** | **Mesh Takeover / Sybil Attack** | Attack by controlling majority of local nodes. Prevented by Web of Trust. |
| **Difficulty Adjustment** | **Dynamic Quorum** | Not math difficulty, but adjusting the required number of validators based on local network activity. |
| **UTXO** | **Account Model (Balance)** | Bitcoin uses UTXO (like physical coins). ZCP2O uses Account Model (like a bank account, simpler). |
| **Smart Contract** | **Activity Script / Game Logic** | ZCP2O lacks Turing-complete smart contracts. Logic is tied to activities (games, chat, validation). |
| **Orphan Block** | **Divergent Ledger / Fork** | Block not in main chain. Happens in ZCP2O during network partitions (async sync). |
| **SegWit** | **Data Pruning / State Separation** | Not separating signatures, but separating permanent data (finance) and temporary data (chat). |
| **Cold Storage** | **Offline Wallet / Air-Gapped** | Wallet whose private key never touches the network (via USB/paper). |
| **Hot Wallet** | **Active Node / Light Node** | Wallet connected to the network for fast transactions. |
| **Blockchain** | **Distributed Ledger / Mesh Chain** | Not always a linear "chain", can be a DAG or more complex mesh structure. |
| **Consensus** | **Local Consensus / Zone Agreement** | Consensus reached locally (mesh) first, then globally upon synchronization. |
| **Block Reward** | **Activity Reward / Play Reward** | No reward for "mining blocks". Rewards given for activities (claiming coins, relaying, validating). |
| **Halving** | **Halving (Supply Cap)** | Still exists! Rewards halve at specific intervals to control inflation. |
| **P2P Network** | **Mesh Network / Bluetooth Mesh** | Not P2P via internet, but P2P via Bluetooth/Wi-Fi Direct/LoRa (short-range). |
| **Broadcast** | **Flood / Mesh Propagation** | Transactions spread to neighbors, neighbors spread to their neighbors (flood algorithm). |
| **Timestamp** | **Logical Clock (Lamport)** | Not server time, but logical time to order events in a distributed system. |

---

## 🆕 ZCP2O Exclusive Terms

*These terms DO NOT EXIST in traditional blockchain, as they are ZCP2O innovations.*

| **ZCP2O Term** | **Explanation** | **Why it doesn't exist in Bitcoin?** |
|-------------------|----------------|-----------------------------------|
| **Proof-of-Relay** | Earning rewards for relaying other people's messages/transactions through the mesh network. | Bitcoin has no concept of incentivized "relaying". |
| **Digital Bunker** | Local Full Node running offline at institutions (hospitals, schools) for data sovereignty. | Bitcoin nodes must be online continuously for global validation. |
| **Async Sync** | Mechanism to sync local ledger to global network after internet becomes available (store-and-forward). | Bitcoin requires real-time online status; no "offline first, sync later" mode. |
| **Zone / Mesh Partition** | Network geographically split but still valid and functional locally (autonomous). | Bitcoin requires global consensus; no "autonomous local zone" concept. |
| **Zero-Capital Entry** | Users can start participating without needing to buy tokens first. | Bitcoin requires buying BTC first to transact (pay fees). |
| **Activity Proof** | Cryptographic proof that a user is performing real activity (not a bot). | Bitcoin doesn't care who you are, only that you have hash power. |
| **Local Mesh Consensus** | Consensus reached locally (few meters/km) via Bluetooth/Wi-Fi Direct. | Bitcoin consensus must be global via the internet. |
| **State Snapshot** | "Photo" of all account balances at a specific block for pruning old data. | Bitcoin has no snapshots; all history must be stored forever. |
| **Quantum-Like Efficiency** | Architecture achieving high efficiency through smart coordination, not brute force. | Traditional blockchains focus on raw computational power. |
| **Web of Trust** | Node reputation system based on history of correct validations to prevent Sybil attacks. | Bitcoin prevents Sybil via PoW (electricity cost). |

---

## 🧮 Mathematical & Cryptographic Concepts

| **Concept** | **Bitcoin** | **ZCP2O** | **Notes** |
|------------|-------------|-----------|-------------|
| **Asymmetric Encryption** | ECC (secp256k1) | RSA 4096-bit | RSA is currently more resistant to certain quantum attacks. |
| **Hash Function** | SHA-256 | SHA-256 / SHA-512 | Uses industry standards. |
| **Signature Scheme** | ECDSA | RSA-PSS | Probabilistic Signature Scheme. |
| **Address Format** | Base58Check (1ABC...) | Base64 / Hex (WKS-...) | Human-readable format. |
| **Merkle Tree** | Binary Merkle Tree | Merkle Patricia Trie | More efficient for Account Model. |
| **Logical Clock** | N/A | Lamport Timestamp | For ordering in distributed systems. |

---

## 🌐 Network Architecture Terms

| **Concept** | **Bitcoin** | **ZCP2O** | **Explanation** |
|------------|-------------|-----------|----------------|
| **Network Layer** | TCP/IP (Internet) | Bluetooth LE, Wi-Fi Direct, LoRa | Short-range, offline-first. |
| **Topology** | Flat P2P (random peers) | Geographic Mesh (nearby peers) | Based on physical proximity. |
| **Propagation** | Gossip Protocol | Flood Algorithm | Spread to all neighbors. |
| **Discovery** | DNS Seeders, Hardcoded Seeds | Bluetooth Scanning, Wi-Fi Scan | Auto-discovery via radio. |
| **Connectivity** | Always Online | Intermittent / Offline-First | Can be offline for days. |
| **Bandwidth** | High (Internet broadband) | Low (BLE: ~1 Mbps, Wi-Fi Direct: ~100 Mbps) | Optimized for small data. |
| **Latency** | Low (ms) | Variable (ms - hours) | Depends on connectivity. |

---

## ⚡ Quick Reference Card

### For Bitcoin Developers: