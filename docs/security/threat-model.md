# ZCP2O THREAT MODEL

> A living document mapping attack vectors against the ZCP2O protocol
> and the defenses designed to neutralize them.
> For core concepts, see [`../terminology.md`](../terminology.md) and [`../architecture.md`](../architecture.md).

---

## 1. ATTACKS ON PROOF OF PRESENCE (PoP)

### Threat: Bot Farms & Sensor Spoofing
Attackers do not hack the code — they fake the *human*. Emulated devices
spoof GPS coordinates and inject fake accelerometer/gyroscope data to claim
PoP rewards without physical presence.

### Defenses
| Defense | How It Works |
|---------|--------------|
| **Trust Score & Probation** | New devices/accounts start with low trust and minimal claim limits. Full access requires months of consistent behavior — economically unviable for bot farms. |
| **Implicit Proof of Humanity** | Behavioral biometrics (micro-jitters, natural sensor noise) distinguish real humans from injected data that is "too perfect" or too rigid. |
| **Cross-Validation** | Clusters of claims with identical coordinates, timestamps, and motion patterns down to the millisecond are flagged as Sybil attacks and rejected. |

---

## 2. INTELLECTUAL PROPERTY THEFT & HOSTILE FORKS

### Threat: Repository Cloning & Rebranding
A well-funded actor clones the open-source repository, strips authorship,
and claims ownership of the protocol.

### Defenses
| Defense | How It Works |
|---------|--------------|
| **Immutable History** | The public commit graph (genesis commit: July 2026) is cryptographic, timestamped proof of authorship that cannot be forged retroactively. |
| **License & Trademark** | The MIT license permits code reuse, but the names "ZCP2O" and "Alpha Drop" and the brand identity are protected intellectual property. |
| **Genesis & Network Effects** | Code can be copied; the network cannot. The original Genesis Block, community, and Bunker fleet remain the source of truth. |

---

## 3. NATION-STATE / APT ATTACKS ON LOW-SPEC ENDPOINTS

### Threat: Endpoint Compromise on Weak Hardware
Light clients run on low-spec devices without hardware security modules
(TPM/Secure Enclave). State-level actors with zero-day exploits can extract
private keys from compromised devices.

### Design Philosophy: Zero-Trust
ZCP2O assumes **every endpoint will eventually be compromised**. Security
therefore lives in the protocol and the Bunkers — not in the device.

### Defenses
| Defense | How It Works |
|---------|--------------|
| **Damage Containment** | A compromised device exposes only *that* address's funds. It cannot mint coins, rewrite history, or touch other users' balances. |
| **Velocity Checks** | Bunkers reject anomalous outflows (e.g., draining a lifetime balance in seconds) via anomaly/velocity rules. |
| **Social Recovery (Roadmap)** | Multi-signature recovery lets users reclaim identity after key theft, rendering stolen keys worthless. |

---

## 4. LOCAL MESH SECURITY

### Threat: Eavesdropping, Replay & Injection
Mesh traffic (Wi-Fi/Bluetooth/UDP) is broadcast over the air; attackers can
sniff packets, replay valid transactions, or inject garbage.

### Defenses
| Defense | How It Works |
|---------|--------------|
| **End-to-End Encryption** | Payloads are encrypted before leaving the device; sniffers see only ciphertext. |
| **Nonce & Timestamp (Anti-Replay)** | Every transaction carries a unique nonce; Bunkers reject duplicates, making recorded packets useless. |
| **Trust-Based Gossip** | Nodes only relay messages with valid cryptographic signatures; unsigned or invalid packets are dropped at the edge. |

---

## RISK SUMMARY

| Threat | Severity | Primary Defense |
|--------|----------|-----------------|
| Bot farms (PoP spoofing) | High | Trust Score, probation, Implicit Proof of Humanity |
| Repo theft / hostile fork | Medium | Immutable history, trademark, Genesis network effect |
| Nation-state endpoint hack | Critical (but contained) | Zero-Trust, damage containment, velocity checks |
| Mesh sniffing / replay | Low | E2EE, nonce, signed gossip |

> **Security Principle:** No system is unhackable. ZCP2O is designed so that
> **the cost of attacking always exceeds the attacker's expected gain**
> (economic security).