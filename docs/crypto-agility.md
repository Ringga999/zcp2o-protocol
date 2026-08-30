# 🔐 Crypto-Agility in ZCP2O Protocol

**Version:** 1.0 (August 30, 2026)  
**Status:** Planning Document  
**Author:** ZCP2O Core Team

---

## Executive Summary

ZCP2O Protocol currently uses **RSA-2048 with PSS padding** for digital signatures in Human Proof tokens and Sovereign Auth v2. This choice prioritizes **maximum browser compatibility** (100% support across Chrome, Firefox, Safari, Edge) over raw performance.

We acknowledge that **Ed25519** offers significant advantages:
- 100x faster signing
- 4x smaller signatures (64 vs 256 bytes)
- 9x smaller public keys (32 vs ~294 bytes)
- Better suited for low-power devices (mobile wallets, IoT mesh)

This document outlines our **crypto-agility architecture** — a registry-based approach that allows ZCP2O to support multiple signature algorithms without breaking changes, enabling a smooth migration path:

- **Phase 1 (current):** RSA-2048 for browser-first Human Proof
- **Phase 2 (wallet):** Ed25519 for mobile wallets and mesh P2P
- **Phase 3 (future):** Post-quantum algorithms (Dilithium, Falcon) for long-term security

---

## Current State: RSA-2048

### Why RSA?

**Primary reason:** `crypto.subtle` (WebCrypto API) support.

| Algorithm | Chrome | Firefox | Safari | Node.js | Notes |
|-----------|:---:|:---:|:---:|:---:|-------|
| **RSA-PSS** | ✅ | ✅ | ✅ | ✅ | Universal support |
| ECDSA P-256 | ✅ | ✅ | ✅ | ✅ | Universal support |
| **Ed25519** | ⚠️ | ❌ | ✅ | ✅ | Firefox requires flags/external lib |

ZCP2O Human Proof is designed to work **100% offline, 0 dependencies** across all modern browsers. RSA-PSS guarantees this.

### Performance Characteristics (RSA-2048)

| Operation | Time (typical) | Notes |
|-----------|----------------|-------|
| Key generation | ~200ms | One-time per session |
| Signing | ~10ms | Acceptable for Human Proof |
| Verification | ~1ms | Fast enough for server-side |
| Signature size | 256 bytes | Larger than Ed25519 |
| Public key size | ~294 bytes | Stored in token |

**Context:** Human Proof is generated once per CAPTCHA session. 200ms key generation is imperceptible to users. Server-side verification (Bunker) processes max 60 requests/minute per identity — RSA verification is not a bottleneck.

---

## The Case for Ed25519

### Performance Advantages

| Metric | RSA-2048 | Ed25519 | Improvement |
|--------|----------|---------|-------------|
| Key generation | ~200ms | ~1ms | **200x faster** |
| Signing | ~10ms | ~0.1ms | **100x faster** |
| Verification | ~1ms | ~0.05ms | **20x faster** |
| Signature size | 256 bytes | 64 bytes | **4x smaller** |
| Public key size | ~294 bytes | 32 bytes | **9x smaller** |

### Use Cases Where Ed25519 Excels

1. **Mobile Wallets (Phase 2):** Low-power devices, frequent transactions, bandwidth-constrained networks
2. **Mesh P2P (Phase 2):** IoT sensors, high-frequency peer handshakes, battery-operated nodes
3. **Batch Verification:** Server-side bulk signature checks (10,000+ signatures/second)

### Browser Support Challenge

Ed25519 is **not natively supported** in all browsers via `crypto.subtle`:
- **Chrome:** Requires `WebCrypto API Ed25519` flag (disabled by default)
- **Firefox:** No native support (requires external library like `tweetnacl-js`)
- **Safari:** Native support ✅
- **Node.js:** Native support ✅

**Trade-off:** Using Ed25519 today would require bundling a 50-100KB library, breaking ZCP2O's "0 dependencies, 100% browser support" promise.

---

## Crypto-Agility Architecture

### Design Principle: Registry Pattern

ZCP2O will implement a **crypto registry** that abstracts signature algorithms behind a unified interface:

```typescript
// zcp2o-core/crypto/registry.ts
interface SignatureAlgorithm {
  id: string;           // "rsa-pss-2048", "ed25519", "dilithium-3"
  keySize: number;      // bits
  signatureSize: number; // bytes
  
  generateKeyPair(): Promise<KeyPair>;
  sign(privateKey: PrivateKey, message: Uint8Array): Promise<Uint8Array>;
  verify(publicKey: PublicKey, message: Uint8Array, signature: Uint8Array): Promise<boolean>;
}

class CryptoRegistry {
  private algorithms: Map<string, SignatureAlgorithm> = new Map();
  
  register(algorithm: SignatureAlgorithm): void {
    this.algorithms.set(algorithm.id, algorithm);
  }
  
  get(id: string): SignatureAlgorithm {
    const algo = this.algorithms.get(id);
    if (!algo) throw new Error(`Algorithm ${id} not registered`);
    return algo;
  }
  
  list(): string[] {
    return Array.from(this.algorithms.keys());
  }
}

// Usage
const registry = new CryptoRegistry();
registry.register(new RSAPSS2048());      // Phase 1
registry.register(new Ed25519());         // Phase 2
registry.register(new Dilithium3());      // Phase 3

const algo = registry.get("ed25519");
const keyPair = await algo.generateKeyPair();
const signature = await algo.sign(keyPair.privateKey, message);
```

### Benefits

1. **Zero breaking changes:** Identities can upgrade algorithms without revocation
2. **Gradual migration:** New identities use Ed25519, legacy identities keep RSA
3. **Future-proof:** Post-quantum algorithms can be added without redesign
4. **Context-aware:** Browser uses RSA, mobile wallet uses Ed25519, server uses both

### Identity Registry Extension

The `identities.json` structure will be extended:

```json
{
  "identities": {
    "zid-abc123": {
      "pubkey": { "kty": "RSA", "n": "...", "e": "..." },
      "algorithm": "rsa-pss-2048",  // NEW: algorithm identifier
      "trust": 50,
      "created_at": 1787919308,
      "revoked": false
    },
    "zid-def456": {
      "pubkey": { "kty": "OKP", "crv": "Ed25519", "x": "..." },
      "algorithm": "ed25519",       // NEW: Ed25519 identity
      "trust": 60,
      "created_at": 1787919400,
      "revoked": false
    }
  }
}
```

**Backward compatibility:** Identities without `algorithm` field default to `"rsa-pss-2048"`.

---

## Roadmap

### Phase 1: RSA-2048 (Current — 2026)

**Goal:** Maximum browser compatibility for Human Proof.

**Implementation:**
- ✅ RSA-PSS in `zcp2o-core` (Human Proof tokens)
- ✅ RSA-PSS in Sovereign Auth v2 (signed API requests)
- ✅ Server-side verification in Bunker (`verify.py`, `sovereign.py`)

**Justification:** 100% browser support, no external dependencies, acceptable performance for use case.

---

### Phase 2: Ed25519 (Planned — 2027)

**Goal:** High-performance signatures for mobile wallets and mesh P2P.

**Implementation:**
- 🔮 Ed25519 via `@noble/ed25519` (pure JS, 15KB) or native where supported
- 🔮 Crypto registry in `zcp2o-core/crypto/`
- 🔮 Identity registry extension (algorithm field)
- 🔮 Mobile wallet (zcp2o-wallet) uses Ed25519 by default
- 🔮 Mesh P2P handshake uses Ed25519

**Migration path:**
1. Deploy crypto registry (backward compatible)
2. New identities default to Ed25519
3. Legacy RSA identities continue working
4. Optional: RSA → Ed25519 upgrade flow for existing identities

**Performance target:** <1ms signing on low-end Android devices.

---

### Phase 3: Post-Quantum Cryptography (Future — 2028+)

**Goal:** Long-term security against quantum computers.

**Candidate algorithms:**
- **Dilithium** (NIST standard, lattice-based)
- **Falcon** (NIST standard, lattice-based, smaller signatures)
- **SPHINCS+** (NIST standard, hash-based, conservative choice)

**Implementation:**
- 🔮 Crypto registry extension (Dilithium, Falcon, SPHINCS+)
- 🔮 Hybrid signatures (RSA + Dilithium) for transition period
- 🔮 Identity registry supports multiple algorithms per identity (hybrid mode)

**Justification:** RSA and Ed25519 are vulnerable to Shor's algorithm. Post-quantum migration must begin before quantum computers become practical (estimated 2030-2035).

---

## Performance Benchmarks (Target)

### Browser Environment (Human Proof)

| Algorithm | Key Gen | Sign | Verify | Signature Size |
|-----------|---------|------|--------|----------------|
| RSA-2048 (current) | 200ms | 10ms | 1ms | 256 bytes |
| Ed25519 (Phase 2) | 1ms | 0.1ms | 0.05ms | 64 bytes |
| Improvement | **200x** | **100x** | **20x** | **4x smaller** |

### Server Environment (Bunker)

| Algorithm | Sign | Verify | Throughput |
|-----------|------|--------|------------|
| RSA-2048 (current) | 10ms | 1ms | 1,000 req/sec |
| Ed25519 (Phase 2) | 0.1ms | 0.05ms | 20,000 req/sec |
| Improvement | **100x** | **20x** | **20x** |

### Mobile Environment (Wallet — Phase 2)

| Algorithm | Key Gen | Sign | Verify | Battery Impact |
|-----------|---------|------|--------|----------------|
| RSA-2048 | 200ms | 10ms | 1ms | High |
| Ed25519 | 1ms | 0.1ms | 0.05ms | **Low** |
| Improvement | **200x** | **100x** | **20x** | **Minimal** |

---

## Security Considerations

### RSA-2048 Security Margin

- **Current status:** Secure against classical computers (as of 2026)
- **Quantum vulnerability:** Breakable by Shor's algorithm with ~4,000 qubits
- **Estimated quantum timeline:** 2030-2035 (optimistic), 2040+ (conservative)
- **Mitigation:** Phase 3 post-quantum migration before 2030

### Ed25519 Security Margin

- **Current status:** Secure against classical computers
- **Quantum vulnerability:** Same as RSA (breakable by Shor's algorithm)
- **Advantage:** Smaller keys/signatures reduce attack surface (less data to intercept)

### Post-Quantum Security

- **Dilithium/Falcon/SPHINCS+:** Resistant to quantum attacks (lattice/hash-based)
- **Security level:** 128-bit (equivalent to AES-128, RSA-3072)
- **Standardization:** NIST finalized standards in 2024

---

## FAQ

### Q: Why not use Ed25519 from day one?

**A:** Browser compatibility. `crypto.subtle` does not support Ed25519 natively in all browsers (Firefox requires external library). ZCP2O Human Proof must work 100% offline, 0 dependencies across all browsers.

### Q: Will RSA identities break when we add Ed25519?

**A:** No. The crypto registry is backward compatible. Legacy RSA identities continue working. New identities can use Ed25519.

### Q: Can I upgrade my RSA identity to Ed25519?

**A:** Yes (Phase 2). We'll provide an upgrade flow: generate Ed25519 keypair → sign upgrade request with RSA key → registry adds Ed25519 key → optional: revoke RSA key.

### Q: What about ECDSA P-256?

**A:** ECDSA has universal browser support, but Ed25519 is faster and simpler. We chose RSA for Phase 1 (compatibility) and Ed25519 for Phase 2 (performance). ECDSA is not in our roadmap.

### Q: How do you handle hybrid signatures (RSA + post-quantum)?

**A:** Phase 3 will support hybrid mode: identity stores both RSA and Dilithium keys. Signatures include both. Verification succeeds if **either** signature is valid. This ensures security even if one algorithm is broken.

---

## Conclusion

ZCP2O Protocol is **crypto-agile by design**. We chose RSA-2048 for Phase 1 to guarantee universal browser compatibility, but our architecture supports seamless migration to Ed25519 (Phase 2) and post-quantum algorithms (Phase 3) without breaking changes.

**Key principles:**
1. **Compatibility first:** RSA ensures Human Proof works everywhere today
2. **Performance later:** Ed25519 for mobile wallets and mesh P2P
3. **Future-proof:** Post-quantum ready for 2028+
4. **Zero breaking changes:** Registry pattern allows gradual migration

We welcome feedback and performance reports from developers testing ZCP2O on low-power devices. If RSA verification feels slow on your target hardware, please open an issue — this data informs our Phase 2 Ed25519 migration timeline.

---

**References:**
- [WebCrypto API Browser Support](https://caniuse.com/cryptography)
- [Ed25519 Specification (RFC 8032)](https://tools.ietf.org/html/rfc8032)
- [NIST Post-Quantum Cryptography Standards](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [ZCP2O Security Hardening v1.2](security-hardening.md)