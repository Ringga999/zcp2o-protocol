# ZCP2O Wallet Standard (ZWS)

> **Status:** Research Draft — August 2026
>
> **Author:** Ringga A.K.D (ZCP2O Core Team)
>
> **Purpose:** Define the official standards for ZCP2O wallet interoperability,
> URI scheme, and offline-first communication protocols.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [URI Scheme (`zcp2o:` Protocol)](#2-uri-scheme-zcp2o-protocol)
3. [ZWS Handshake Protocol (Offline-First)](#3-zws-handshake-protocol-offline-first)
4. [Wallet Recovery Specification](#4-wallet-recovery-specification)
5. [Security Considerations](#5-security-considerations)
6. [Implementation Guidelines](#6-implementation-guidelines)
7. [Appendix: Example Payloads](#7-appendix-example-payloads)

---

## 1. Introduction

### 1.1 Background

The ZCP2O ecosystem requires a standardized way for wallets and decentralized
applications (dApps) to communicate. Existing wallet standards — such as
**WalletConnect** and **BIP-21 (Bitcoin URI)** — were designed under one
assumption that ZCP2O rejects: **constant internet connectivity**.

ZCP2O is built for the opposite reality: environments with intermittent or no
internet access. Therefore, ZCP2O needs its own wallet standard that treats
offline operation as the **default**, not an exception.

The **ZCP2O Wallet Standard (ZWS)** is that standard. It defines:

1. **URI Scheme** — how payment requests are encoded and shared (links & QR codes)
2. **Handshake Protocol** — how dApps and wallets establish secure sessions, fully offline
3. **Recovery Specification** — how users backup and restore their wallets

### 1.2 Why Not Reuse Existing Standards?

| Standard | Limitation for ZCP2O |
|----------|----------------------|
| **WalletConnect** | Requires internet + centralized relay servers |
| **BIP-21 (Bitcoin URI)** | No offline/mesh context; Bitcoin-specific fields |
| **MetaMask / EVM RPC** | Tied to Ethereum Virtual Machine; not sovereign |

ZWS is intentionally **sovereign**: it does not depend on any external chain,
relay server, or internet infrastructure. This aligns with ZCP2O's core
philosophy of institutional and individual data sovereignty.

### 1.3 Design Principles

1. **Offline-First** — All core functionality works without internet.
2. **Sovereignty** — No dependency on external chains, servers, or standards.
3. **Simplicity** — Easy to implement for developers; easy to use for end-users.
4. **Security** — Cryptographic proof of ownership without exposing private keys.
5. **Openness** — Published openly so it can become an adopted industry standard.

### 1.4 Scope

**In scope:**
- `zcp2o:` URI scheme syntax and wallet behavior
- ZWS Handshake over QR, mesh (BLE/Wi-Fi/UDP), and NFC
- Wallet recovery via BIP-39 mnemonic and encrypted file backup

**Out of scope (for future versions):**
- Smart contract interaction (ZCP2O avoids Turing-complete contracts)
- Cross-chain bridges and wrapped tokens (contrary to sovereignty principle)
- Hardware wallet integration (planned for ZWS v2)

### 1.5 Terminology Used in This Document

| Term | Meaning |
|------|---------|
| **dApp** | Decentralized application (game, web app) that requests wallet services |
| **Wallet** | Native ZCP2O application that stores keys and signs transactions |
| **Challenge** | Random value used to prove key ownership during handshake |
| **Session** | Established connection between a dApp and a wallet |
| **Mesh** | Local peer-to-peer network (BLE/Wi-Fi Direct/UDP) without internet |

---

### 2.2 Parameters

| Parameter | Required | Type | Example | Description |
|-----------|----------|------|---------|-------------|
| `address` (path) | ✅ Yes | String | `WKS-b74acadc...` | Destination ZCP2O address |
| `amount` | ❌ No | Decimal | `100.5` | Amount in $WEEKS |
| `label` | ❌ No | String | `Warung Bu Sari` | Human-readable recipient name |
| `message` | ❌ No | String | `Bayar kopi` | Transaction memo / note |
| `zone` | ❌ No | String | `kampus-01` | Mesh zone identifier (offline context) |
| `network` | ❌ No | Enum | `mainnet` | Target network (safety guard) |

**ZCP2O-specific parameters:**

- `zone` — tells the wallet which local mesh zone the payment belongs to.
  This accelerates local consensus when the device is offline.
- `network` — prevents accidental cross-network transfers (e.g., sending
  mainnet funds to a testnet request).

### 2.3 Encoding Rules

1. **Address** — must match the pattern `WKS-[0-9a-f]{40}` (lowercase hex).
2. **String values** (`label`, `message`, `zone`) — must be URL-encoded
   (space → `%20`, `&` → `%26`, etc.), per RFC 3986.
3. **Amount** — decimal notation using `.` as the separator; no thousands
   separators; up to 6 decimal places (MicroWeek precision).
4. **Zone** — alphanumeric plus hyphen (`a-z`, `0-9`, `-`), max 64 characters.
5. **Network** — must be exactly one of: `mainnet`, `testnet`, `devnet`.
   If omitted, wallets assume `mainnet`.

### 2.4 Wallet Behavior on Opening a URI

When a user opens a `zcp2o:` URI (via link tap or QR scan), a compliant
wallet MUST:

1. **Parse** the URI and extract the address and parameters.
2. **Validate** the address format; reject the request if invalid.
3. **Pre-fill** the transaction form:
   - Recipient address (locked, non-editable)
   - Amount (editable)
   - Message (editable)
4. **Display** the `label` as the recipient's display name (if present).
5. **Check `network`** — if it differs from the wallet's active network,
   show a blocking warning:
   > "This request targets `<network>`, but your wallet is on `<active>`.
   > Switch network or cancel."
6. **Check `zone`** — if present and the wallet is offline, suggest joining
   that mesh zone to complete the transaction locally.

### 2.5 QR Code Generation

For physical payment scenarios (warung, campus, clinic), the URI is encoded
as a QR code.

**QR Specifications:**

| Property | Value |
|----------|-------|
| Error correction | Level M (15%) or higher |
| Minimum size | 200×200 px (print) / 240×240 px (screen) |
| Foreground | Black or dark blue |
| Background | White or high-contrast light color |
| Quiet zone | ≥ 4 modules of blank margin |

**Display convention:** When rendering a receive QR, wallets SHOULD show the
address in short form (`WKS-b74a…d99a`) beneath the code for manual
verification.

### 2.6 Examples

**Minimal (address only):**
zcp2o:WKS-b74acadc6590ad9baf13206e92ee806252f7d99a

**Fixed amount:**
zcp2o:WKS-b74acadc6590ad9baf13206e92ee806252f7d99a?amount=50

**Full payment request:**
zcp2o:WKS-b74acadc6590ad9baf13206e92ee806252f7d99a?amount=100.5&label=Warung%20Bu%20Sari&message=Bayar%20kopi&zone=kampus-01&network=mainnet

### 2.7 URI Security Considerations

1. **Address validation** — wallets MUST reject addresses that fail the
   `WKS-[0-9a-f]{40}` pattern before pre-filling any form.
2. **Network mismatch** — a mismatched `network` parameter MUST produce a
   blocking warning, never a silent send.
3. **Phishing awareness** — wallets SHOULD visually highlight the `label`
   and full address so users can verify the true recipient (a malicious QR
   could otherwise swap the address).
4. **Amount sanity** — wallets SHOULD warn if `amount` exceeds a user-defined
   threshold, protecting against tampered QR codes.

---

## 3. ZWS Handshake Protocol (Offline-First)

The ZWS Handshake Protocol defines how a dApp (game, web app) and a wallet
establish a secure, authenticated session **without requiring internet**.
This is the feature that distinguishes ZWS from every existing wallet
standard.

### 3.1 Why Existing Protocols Fail Offline

| Protocol | Transport | Works Offline? |
|----------|-----------|----------------|
| WalletConnect | WebSocket + centralized relay | ❌ No |
| MetaMask (EVM RPC) | HTTP to node | ❌ No |
| Deep links | OS-level routing | ⚠️ Partial (no session) |
| **ZWS** | QR / mesh / NFC | ✅ **Yes, fully** |

ZWS replaces the relay server with **direct device-to-device channels** and
replaces trust in a server with **cryptographic challenge–response**.

### 3.2 Handshake Flow (Challenge–Response)
┌──────────────┐ ┌──────────────┐
│ dApp │ │ Wallet │
└─────────────┘ └─────────────┘
│ 1. Generate random 32-byte challenge │
│ 2. Encode handshake_request as QR │
│──────────────────────────────────────────────────────►│
│ (dApp shows QR; wallet scans)│
│ │
│ 3. Wallet verifies app info │
│ 4. User approves connection │
│ 5. Wallet SIGNS challenge │
│ with its private key │
│◄──────────────────────────────────────────────────────│
│ (wallet shows response QR; │
│ dApp scans it) │
│ 6. dApp verifies signature with returned public key │
│ 7. SESSION ESTABLISHED (session_id created) │
│ │
│ 8. Subsequent messages flow over mesh / QR / NFC │

**Step-by-step:**

1. **dApp** generates a random 32-byte `challenge` (single-use).
2. **dApp** encodes a `zws_handshake_request` message as a QR code.
3. **Wallet** scans the QR and displays the app's identity
   (`app_name`, `app_url`, requested `permissions`) to the user.
4. **User** explicitly approves or rejects the connection.
5. **Wallet** signs the `challenge` with its private key (RSA-4096) and
   encodes a `zws_handshake_response` QR containing its `address`,
   `public_key`, and `signature`.
6. **dApp** scans the response and verifies
   `RSA_verify(challenge, signature, public_key) == true`.
7. Both sides derive a shared `session_id` for subsequent messages.

**Key property:** the wallet proves it *owns* the private key **without ever
transmitting it**. An eavesdropper who captures the QR images learns only the
public key and a signature over a one-time challenge — useless for forging
future transactions.

### 3.3 Channel Selection

ZWS supports three physical channels, chosen by capability:

| Channel | Priority | Range | Setup | Best For |
|---------|----------|-------|-------|----------|
| **QR Code** | 1 | Visual (camera) | None | Initial handshake; one-off payments |
| **Mesh** (BLE / Wi-Fi Direct / UDP) | 2 | ~10–100 m | Discovery | Ongoing session traffic |
| **NFC** | 3 | ~4 cm (tap) | None | Tap-to-pay confirmations |

**Selection logic:**

1. Always begin with **QR** for the initial handshake (most universal).
2. If both devices advertise mesh support, **upgrade** to mesh for faster,
   continuous communication.
3. Use **NFC** only for short confirmations (e.g., approve a pending tx).

### 3.4 Message Format

Every ZWS message is a UTF-8 JSON object with a common envelope:

```json
{
  "type": "<message_type>",
  "version": "1.0",
  "timestamp": 1739000000,
  "session_id": "optional_after_handshake",
  "payload": { },
  "signature": "optional_hex"
}
### 3.4 Message Format

Every ZWS message is a UTF-8 JSON object with a common envelope:

```json
{
  "type": "<message_type>",
  "version": "1.0",
  "timestamp": 1739000000,
  "session_id": "optional_after_handshake",
  "payload": { },
  "signature": "optional_hex"
}
```

**Message types:**

| Type | Direction | Purpose |
|------|-----------|---------|
| `zws_handshake_request` | dApp → wallet | Propose connection + challenge |
| `zws_handshake_response` | wallet → dApp | Approve + prove key ownership |
| `zws_balance_request` | dApp → wallet | Ask for balance |
| `zws_balance_response` | wallet → dApp | Return balance |
| `zws_transaction_request` | dApp → wallet | Propose a transaction to sign |
| `zws_transaction_response` | wallet → dApp | Signed tx, or rejection |
| `zws_session_end` | either | Terminate session |

### 3.5 Transaction Request Flow (Post-Handshake)

Once a session exists, the dApp may propose transactions:

```json
{
  "type": "zws_transaction_request",
  "version": "1.0",
  "timestamp": 1739000100,
  "session_id": "a1b2c3d4e5f67890",
  "payload": {
    "to": "WKS-xyz789...",
    "amount": 100.5,
    "message": "Coffee payment",
    "zone": "kampus-01",
    "network": "mainnet"
  }
}
```

The wallet MUST display the full details and obtain **explicit user
approval** before signing. The response is either:

```json
{ "payload": { "status": "signed", "transaction": { "...": "..." }, "tx_hash": "0x7f3a..." } }
```

or:

```json
{ "payload": { "status": "rejected", "reason": "User cancelled transaction" } }
```

### 3.6 Offline Transport: Mesh Framing

When internet is unavailable and mesh is active, messages are sent as framed
packets over UDP broadcast (default port 8080):

```
┌───────────────────────────────────────┐
│ Header (16 bytes)                     │
│  • Magic      "ZWS"        (4 bytes)  │
│  • Version    0x01         (1 byte)   │
│  • Type       msg_type     (1 byte)   │
│  • Length     payload_len  (2 bytes)  │
│  • Checksum   CRC32        (4 bytes)  │
│  • Reserved                (4 bytes)  │
├───────────────────────────────────────┤
│ Payload (variable)                    │
│  • JSON message, UTF-8                │
└───────────────────────────────────────┘
```

- **Magic + checksum** let receivers discard foreign or corrupted packets.
- Large payloads are split into numbered fragments (flag in the reserved
  field) and reassembled by the receiver.
- Transactions queued while offline are stored locally and synced to a
  Digital Bunker when connectivity returns (Async Sync).

### 3.7 Security Model

| Property | Mechanism |
|----------|-----------|
| **Key ownership proof** | Challenge–response RSA signature |
| **Private key secrecy** | Key never leaves the wallet; only signatures cross channels |
| **Replay protection** | Single-use challenges + `timestamp` window (≤ 5 min) |
| **Session integrity** | `session_id` bound to the verified handshake |
| **Eavesdropping** | Sniffers see only public data + one-time signatures |
| **User consent** | Every connection and transaction requires explicit approval |
| **Session expiry** | Auto-terminate after 1 hour of inactivity |

**Threat note (QR substitution):** an attacker could overlay a malicious QR
over a legitimate one. Mitigation: wallets MUST always render the parsed
`app_name`, `app_url`, and target address in full for manual verification
before the user approves (see §2.7 phishing awareness).

---

## 4. Wallet Recovery Specification

ZCP2O wallets support **two complementary recovery methods**:

1. **Mnemonic Phrase (BIP-39, 24 words)** — the *primary*, long-term root of trust
2. **Encrypted File Backup** — the *secondary*, convenience restore option

Both methods restore the **same** RSA-4096 identity. This dual approach gives
users flexibility without sacrificing security.

### 4.1 Mnemonic Phrase Recovery (Primary)

#### 4.1.1 The Entropy Problem (Why "RSA → words" Is Impossible)

A 24-word BIP-39 phrase encodes only **256 bits** of entropy, while an
RSA-4096 private key contains **thousands of bits**. Therefore an RSA key
can **never** be compressed into 24 words.

**ZWS inverts the direction:** the mnemonic is the **root**, and the RSA
keypair is **deterministically derived** from it.

```
[24-word mnemonic]          ← root of trust (256-bit entropy)
        │  BIP-39 (PBKDF2-HMAC-SHA512)
        ▼
[64-byte seed]
        │  Hash-DRBG (SHAKE256), deterministic
        ▼
[RSA prime generation: p, q]
        │
        ▼
[RSA-4096 keypair]  →  [address: WKS-<SHA256(pubkey)[:20]>]
```

**Normative requirement:** the same 24 words MUST always regenerate the
*identical* RSA keypair. Implementations MUST use a deterministic,
auditable DRBG (e.g., SHAKE256-based Hash-DRBG) for prime generation, and
SHOULD be validated against a public test-vector suite.

#### 4.1.2 Setup Flow (First Run)

1. Wallet generates 256 bits of cryptographically secure entropy.
2. Entropy is converted to a 24-word mnemonic (BIP-39, English wordlist).
3. RSA keypair is derived from the mnemonic (per §4.1.1).
4. Wallet displays the 24 words and requires the user to confirm a random
   subset (e.g., "enter words #3, #11, #19") to prove they recorded it.
5. Wallet warns: *"Never store this phrase digitally. Write it on paper or
   metal and keep it offline."*

#### 4.1.3 Recovery Flow

1. User enters 24 words.
2. Wallet validates the BIP-39 checksum; rejects invalid phrases.
3. RSA keypair and address are re-derived deterministically.
4. Balance and history are restored by querying any Digital Bunker.

### 4.2 Encrypted File Backup (Secondary)

For fast device migration, wallets MAY export an encrypted backup file
(`.zcp2o-backup`) containing the RSA private key.

#### 4.2.1 File Format

```json
{
  "version": "1.0",
  "type": "zcp2o_wallet_backup",
  "created_at": 1739000000,
  "address": "WKS-b74acadc6590ad9baf13206e92ee806252f7d99a",
  "kdf": {
    "algorithm": "argon2id",
    "memory_kb": 65536,
    "iterations": 3,
    "parallelism": 4,
    "salt": "hex_16_bytes"
  },
  "cipher": {
    "algorithm": "aes-256-gcm",
    "nonce": "hex_12_bytes",
    "tag": "hex_16_bytes"
  },
  "encrypted_key": "base64_ciphertext"
}
```

#### 4.2.2 Encryption Process

1. User chooses a password.
2. Encryption key is derived with **Argon2id** (password + random salt).
3. RSA private key is encrypted with **AES-256-GCM** (authenticated).
4. File is saved locally; it is useless without the password.

**Security properties:**
- **Argon2id** — memory-hard; resists GPU/ASIC brute force.
- **AES-256-GCM** — tamper-evident; corrupted files fail authentication.
- **Random salt + nonce** — prevents precomputation and reuse attacks.

#### 4.2.3 Import Flow

1. User selects a `.zcp2o-backup` file and enters the password.
2. Wallet derives the key, decrypts, and verifies the GCM tag.
3. Wallet confirms the derived address matches `address` in the file.
4. Wallet is restored.

### 4.3 Method Comparison

| Aspect | Mnemonic (24 words) | Encrypted File |
|--------|---------------------|----------------|
| **Role** | Primary root of trust | Convenience backup |
| **Survives device loss?** | ✅ Yes (paper/metal) | ✅ If file copied |
| **Needs password?** | ❌ No | ✅ Yes |
| **Human-readable?** | ✅ Yes | ❌ No |
| **Best for** | Long-term, air-gapped storage | Quick device migration |

**Recommendation:** always create the mnemonic; treat the encrypted file as
an optional convenience layer.

### 4.4 Security Best Practices

**For users:**
- Store the mnemonic offline (paper/metal, fireproof location).
- Never photograph, screenshot, or cloud-sync the mnemonic.
- Never share it — ZCP2O support will **never** ask for it.
- Use a strong password (≥ 16 chars) for encrypted backups.

**For developers:**
- Validate the BIP-39 checksum before derivation.
- Use Argon2id with the parameters in §4.2.1 (do not weaken them).
- Zeroize mnemonic/key material from memory immediately after use.
- Warn users when password entropy is below ~60 bits.
```
---

**SIAP! INI BAB 5 — PARUH PERTAMA (5.1–5.3), SATU BLOK UTUH** 🛡️

````markdown
## 5. Security Considerations

ZWS assumes a hostile environment: untrusted dApps, eavesdropped channels,
and physically accessible devices. This chapter defines the threat model and
the mandatory defenses for every compliant implementation.

### 5.1 Threat Model Overview

| # | Threat | Attack Scenario | ZWS Mitigation | Ref |
|---|--------|-----------------|----------------|-----|
| 1 | **Man-in-the-middle (MITM)** | Attacker alters handshake messages between dApp and wallet | Challenge–response RSA signature; session bound to verified handshake | §3.2, §3.7 |
| 2 | **Replay attack** | Attacker re-sends a captured signed message | Single-use challenges + timestamp window (≤ 5 min) | §3.7 |
| 3 | **QR substitution / phishing** | Attacker overlays a malicious QR to redirect funds | Wallet renders full address, `app_name`, `app_url` for manual verification before approval | §2.7, §3.7 |
| 4 | **Mesh eavesdropping** | Sniffer captures UDP packets in physical range | Only public data + one-time signatures cross the channel; private key never transmitted | §3.6, §3.7 |
| 5 | **Mesh injection** | Attacker injects forged packets into the mesh | Magic bytes + CRC32 checksum + signature verification; invalid packets dropped | §3.6 |
| 6 | **Wallet compromise (device theft)** | Attacker gains physical/OS-level access | Platform secure storage (Keystore/Keychain); encrypted backups; mnemonic stays offline | §4 |
| 7 | **dApp compromise** | Malicious or hacked dApp requests abusive transactions | Explicit per-transaction user approval; permission model; user can reject | §3.5 |

**Design stance:** ZWS does not try to make attacks impossible — it makes
every attack either **detectable** (user sees a mismatch), **useless** (no
key material to steal), or **unprofitable** (one-time signatures, replay
windows).

### 5.2 Private Key Handling (Normative)

A compliant wallet MUST:

1. **Generate** keys only via a CSPRNG (or deterministic BIP-39 derivation, §4.1).
2. **Store** the private key in platform secure storage:
   - Android → Android Keystore
   - iOS → Keychain (Secure Enclave where available)
   - Desktop → encrypted file (Argon2id + AES-256-GCM, §4.2)
3. **Never transmit** the private key over any channel (QR, mesh, NFC, HTTP).
4. **Never log** key material, mnemonics, or passwords to console/files.
5. **Zeroize** sensitive buffers (mnemonic, decrypted keys) from memory
   immediately after use.
6. **Sign locally only** — all signatures are produced inside the wallet;
   dApps and servers receive signatures, never keys.

### 5.3 Channel Security

#### 5.3.1 QR Channel
- QR content is **public by nature**; assume it can be read by anyone.
- Therefore QR payloads MUST contain only: challenges, public keys,
  addresses, and signatures over one-time challenges.
- Wallets MUST display parsed details for manual verification (§2.7).
- dApps SHOULD refresh handshake challenges periodically (e.g., every 60 s)
  to limit the window for overlay attacks.

#### 5.3.2 Mesh Channel
- All mesh packets carry Magic + CRC32 to reject foreign/corrupt data (§3.6).
- Any packet whose `signature` fails verification MUST be dropped silently.
- Devices SHOULD rotate session keys and expire sessions after 1 h idle.
- Because mesh is broadcast by nature, treat every packet as potentially
  observed; never include secrets in mesh payloads.

#### 5.3.3 NFC Channel
- NFC's ~4 cm range is a physical proximity guarantee; still, treat it as
  unauthenticated transport.
- Use NFC only for **confirmations** (approve/reject), never for key
  exchange beyond the standard handshake payloads.

### 5.4 Session & Replay Protection

Once a handshake is complete, the dApp and wallet share a `session_id`. To
prevent session hijacking and replay attacks, the following rules apply:

1. **Session ID Generation:** MUST be a cryptographically secure random
   16-byte hex string, generated by the wallet upon approving the handshake.
2. **Session Binding:** Every subsequent message (balance requests,
   transaction proposals) MUST include this `session_id`. Messages with an
   unknown or mismatched `session_id` MUST be dropped.
3. **Session Expiry:** Sessions MUST auto-terminate after 1 hour of
   inactivity. A new handshake is required to resume operations.
4. **Timestamp Window:** Every message contains a Unix `timestamp`.
   Receivers MUST reject any message where
   `|current_time - message.timestamp| > 300 seconds` (5 minutes). This
   prevents attackers from capturing and re-broadcasting old mesh packets.
5. **Challenge Registry:** The dApp MUST maintain a short-lived cache of
   issued handshake challenges. A challenge can only be verified and consumed
   *once*. If a second response arrives with the same challenge, it MUST be
   rejected as a replay.

### 5.5 Implementation Security (Code-Level)

Developers building ZWS-compliant wallets and dApps MUST adhere to these
coding standards to prevent low-level vulnerabilities:

1. **Constant-Time Verification:**
   Signature verification (`RSA_verify`) MUST be implemented in constant
   time. Early exits on mismatched bytes allow **timing attacks**, where an
   attacker deduces the signature byte-by-byte by measuring response delays.
2. **Strict Input Validation:**
   - Addresses must be strictly regex-validated (`^WKS-[0-9a-f]{40}$`).
   - Amounts must be parsed as decimals, rejecting scientific notation or
     negative values.
   - JSON payloads must be strictly typed; unexpected fields should be
     ignored or rejected to prevent parser confusion attacks.
3. **Secure Randomness:**
   All challenges, salts, nonces, and session IDs MUST be generated using
   the platform's Cryptographically Secure Pseudo-Random Number Generator
   (CSPRNG) — e.g., `os.urandom()` in Python, `crypto.getRandomValues()` in
   JS, or `SecRandomCopyBytes` in Swift. Standard `rand()` is forbidden.
4. **Memory Management:**
   Sensitive variables (mnemonic strings, decrypted private keys, passwords)
   MUST be explicitly overwritten with zeros in memory immediately after use,
   rather than waiting for garbage collection.

### 5.6 Consent & Phishing (UX as Security)

In ZWS, the user interface is the final line of defense against social
engineering and malicious dApps.

1. **Prohibition of Blind Signing:**
   A wallet MUST NEVER sign a raw, unstructured hash. The dApp MUST provide
   the fully decoded transaction payload (to, amount, message, zone). The
   wallet MUST render this in plain text for the user to read.
2. **Visual Hierarchy for Approvals:**
   When prompting the user to approve a transaction, the wallet MUST
   prominently display:
   - **Who** is asking (App Name / URL)
   - **Where** the funds are going (Full Recipient Address + Label)
   - **How much** is leaving the wallet (Amount + Network)
3. **Network Mismatch Blocking:**
   If a dApp requests a transaction on `testnet` but the user's wallet is
   active on `mainnet`, the wallet MUST show a blocking red warning and
   disable the "Approve" button. This prevents accidental burning of real
   funds.
4. **Address Truncation Warning:**
   While UI space is limited, wallets SHOULD allow users to expand and view
   the *full* 40-character address before approving, preventing "vanity
   address" spoofing (where an attacker generates an address that matches the
   first and last 4 characters of a legitimate target).

---

## 6. Implementation Guidelines

This chapter translates the ZWS specification into actionable requirements
for developers. Requirements use RFC-2119-style keywords: **MUST** (mandatory
for compliance) and **SHOULD** (strongly recommended).

### 6.1 For Wallet Developers

**MUST (Core compliance):**
- Parse and validate `zcp2o:` URIs per §2 (including address regex and
  network-mismatch blocking).
- Support the ZWS Handshake over QR per §3.2 (challenge–response).
- Verify that every transaction request receives explicit user approval
  before signing (§3.5, §5.6).
- Store private keys in platform secure storage; never transmit or log them
  (§5.2).
- Support BIP-39 24-word recovery with checksum validation (§4.1).

**SHOULD (Full compliance):**
- Upgrade sessions to the mesh channel when both devices support it (§3.3).
- Offer encrypted file backup (`.zcp2o-backup`) as a secondary restore (§4.2).
- Provide a session manager UI (view active sessions, revoke manually).
- Support NFC confirmations for tap-to-pay flows (§3.3).
- Localize the approval UI (multi-language) for community adoption.

### 6.2 For dApp Developers

**MUST (Core compliance):**
- Generate a fresh, single-use 32-byte challenge per handshake (§3.2, §5.4).
- Verify the wallet's RSA signature over the challenge **before** trusting
  the session or displaying any balance.
- Include `session_id` and a fresh `timestamp` in every message (§5.4).
- Handle offline scenarios gracefully: queue requests and retry when the
  wallet reappears on the mesh.

**SHOULD (Full compliance):**
- Generate `zcp2o:` payment-request QR codes per §2.5 for physical payment
  scenarios.
- Display the connected wallet address and current balance clearly.
- Provide human-readable error messages for rejected or failed transactions
  (e.g., "User cancelled", "Insufficient balance", "Zone mismatch").
- Declare minimal permissions in the handshake request (least privilege).

### 6.3 Conformance Tiers

To keep adoption easy while rewarding completeness, ZWS defines two tiers:

| Capability | **ZWS Core** | **ZWS Full** |
|------------|:------------:|:------------:|
| `zcp2o:` URI parsing & QR | ✅ | ✅ |
| QR handshake (challenge–response) | ✅ | ✅ |
| Mnemonic recovery (BIP-39) | ✅ | ✅ |
| Explicit approval UX | ✅ | ✅ |
| Mesh channel upgrade | — | ✅ |
| Encrypted file backup | — | ✅ |
| NFC confirmations | — | ✅ |
| Session manager UI | — | ✅ |

Wallets and dApps may advertise their tier in the handshake payload
(`"conformance": "core" | "full"`) so peers can negotiate channels.

### 6.4 Testing Checklist

**URI Scheme (§2):**
- [ ] Parses valid URIs; rejects invalid addresses
- [ ] URL-decodes `label` / `message` / `zone` correctly
- [ ] Blocks on network mismatch with a clear warning
- [ ] Generates scannable QR codes (error correction ≥ M)

**Handshake (§3):**
- [ ] Generates unique 32-byte challenges
- [ ] Verifies wallet signatures correctly (positive & negative tests)
- [ ] Rejects reused challenges (replay)
- [ ] Rejects messages older than 5 minutes
- [ ] Establishes and expires sessions correctly (1 h idle)

**Recovery (§4):**
- [ ] Generates valid 24-word mnemonics with correct checksum
- [ ] Restores the *identical* RSA keypair from the same words (test vectors)
- [ ] Round-trips encrypted backup export/import
- [ ] Rejects wrong passwords and tampered backup files (GCM tag failure)

**Security (§5):**
- [ ] Private key never appears in logs, network traces, or QR payloads
- [ ] Signature verification uses constant-time comparison
- [ ] Approval UI shows full address and amount before signing
- [ ] Memory zeroization of mnemonic/key buffers after use

---

## 7. Appendix: Example Payloads

### 7.1 URI Scheme Examples

**Minimal (address only):**
```
zcp2o:WKS-b74acadc6590ad9baf13206e92ee806252f7d99a
```

**Fixed amount:**
```
zcp2o:WKS-b74acadc6590ad9baf13206e92ee806252f7d99a?amount=50
```

**Full payment request (offline-aware):**
```
zcp2o:WKS-b74acadc6590ad9baf13206e92ee806252f7d99a?amount=100.5&label=Warung%20Bu%20Sari&message=Bayar%20kopi&zone=kampus-01&network=mainnet
```

### 7.2 Handshake Examples

**Handshake Request (dApp → wallet, QR content):**
```json
{
  "type": "zws_handshake_request",
  "version": "1.0",
  "timestamp": 1739000000,
  "payload": {
    "challenge": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    "app_name": "Alpha Drop",
    "app_url": "https://alpha-drop.zcp2o.network",
    "permissions": ["read_balance", "send_transaction"],
    "conformance": "full"
  }
}
```

**Handshake Response (wallet → dApp, QR content):**
```json
{
  "type": "zws_handshake_response",
  "version": "1.0",
  "timestamp": 1739000010,
  "payload": {
    "address": "WKS-b74acadc6590ad9baf13206e92ee806252f7d99a",
    "public_key": "RSA_public_key_hex...",
    "signature": "RSA_signature_over_challenge_hex...",
    "session_id": "a1b2c3d4e5f67890",
    "conformance": "full"
  }
}
```

### 7.3 Transaction Examples

**Transaction Request (dApp → wallet):**
```json
{
  "type": "zws_transaction_request",
  "version": "1.0",
  "timestamp": 1739000100,
  "session_id": "a1b2c3d4e5f67890",
  "payload": {
    "to": "WKS-9f2e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6",
    "amount": 100.5,
    "message": "Coffee payment",
    "zone": "kampus-01",
    "network": "mainnet"
  }
}
```

**Transaction Response — Signed:**
```json
{
  "type": "zws_transaction_response",
  "version": "1.0",
  "timestamp": 1739000200,
  "session_id": "a1b2c3d4e5f67890",
  "payload": {
    "status": "signed",
    "transaction": {
      "from": "WKS-b74acadc6590ad9baf13206e92ee806252f7d99a",
      "to": "WKS-9f2e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6",
      "amount": 100.5,
      "message": "Coffee payment",
      "zone": "kampus-01",
      "network": "mainnet",
      "signature": "RSA_signature_hex...",
      "timestamp": 1739000150
    },
    "tx_hash": "0x7f3a9b2c4d5e6f708192a3b4c5d6e7f8"
  }
}
```

**Transaction Response — Rejected:**
```json
{
  "type": "zws_transaction_response",
  "version": "1.0",
  "timestamp": 1739000200,
  "session_id": "a1b2c3d4e5f67890",
  "payload": {
    "status": "rejected",
    "reason": "User cancelled transaction"
  }
}
```

### 7.4 Encrypted Backup Example (`.zcp2o-backup`)

```json
{
  "version": "1.0",
  "type": "zcp2o_wallet_backup",
  "created_at": 1739000000,
  "address": "WKS-b74acadc6590ad9baf13206e92ee806252f7d99a",
  "kdf": {
    "algorithm": "argon2id",
    "memory_kb": 65536,
    "iterations": 3,
    "parallelism": 4,
    "salt": "0f1e2d3c4b5a69788796a5b4c3d2e1f0"
  },
  "cipher": {
    "algorithm": "aes-256-gcm",
    "nonce": "a1b2c3d4e5f6789012345678",
    "tag": "f0e1d2c3b4a5968778695a4b3c2d1e0f"
  },
  "encrypted_key": "base64_ciphertext_of_rsa_private_key..."
}
```

---

## References

- **RFC 3986** — Uniform Resource Identifier (URI): Generic Syntax
- **RFC 2119** — Key words for use in RFCs to Indicate Requirement Levels
- **BIP-21** — Bitcoin URI Scheme
- **BIP-39** — Mnemonic code for generating deterministic keys
- **Argon2** — PHC Password Hashing Competition winner (memory-hard KDF)
- **WalletConnect Documentation** — contrast reference for relay-based standards

---

## License

This specification is released under the **MIT License**.

**Copyright (c) 2026 Ringga A.K.D & ZCP2O Contributors**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*Note: The MIT license above covers the technical content of this
specification. The names "ZCP2O", "ZWS", and associated logos remain the
trademarks of the author; implementing the standard does not grant rights to
use these marks.*