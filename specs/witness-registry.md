# SPEC — WitnessRegistry v1 (Sepolia)

> *The chain remembers that a face proved it was human — nothing more.*

**Status:** Spec locked 26 Sep 2026 · First consumer: NotaPeer
**Companion:** flowchart `docs/flowcharts/identity-attestation.md`

## Purpose

Public, append-only registry binding a **pseudonymous face** (bytes32) to a
**captcha trace commitment** (bytes32) at a block timestamp. It does not store
identities, traces, or personal data — only commitments and time.

## Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract WitnessRegistry {
    mapping(bytes32 => uint256) public firstAttestedAt;
    mapping(bytes32 => uint256) public attestationCount;

    event Attested(bytes32 indexed face, bytes32 indexed commitment, uint256 at);

    function attest(bytes32 face, bytes32 commitment) external {
        require(commitment != bytes32(0), "empty commitment");
        if (firstAttestedAt[face] == 0) firstAttestedAt[face] = block.timestamp;
        attestationCount[face] += 1;
        emit Attested(face, commitment, block.timestamp);
    }

    function isAttested(bytes32 face) external view returns (bool) {
        return firstAttestedAt[face] > 0;
    }
}
```

## Invariants

1. **No root, no trace, no PII on-chain.** Only face + commitment hashes.
2. **Permissionless attest** — sybil resistance is *transparency-based* in v1:
   every event exposes `msg.sender`, so clusters (one EOA attesting many
   faces) are publicly detectable and reputationally poisonable.
3. **Append-only.** No burn, no blacklist, no owner keys.
4. **UMKMAnchor untouched.** The genesis anchor contract (23 Sep 2026) remains
   immutable history; identity and books are separate registries forever.

## Known Limitations → v2 Path

- v1 cannot cryptographically reject a fake attest (transparency only).
- v2 (ZCP2O mainnet): witness-signed attestations under trust-weighted
  consensus — the registry becomes a *view* of consensus, not a mailbox.
- Migration: NotaPeer swaps one address constant and re-attests live faces.

## Deployment Plan

1. Remix → Sepolia (MetaMask deployer account, faucet-funded)
2. Verify source on explorer
3. Address published to `notapeer-app/lib/attestation.ts` constant
4. Genesis attest event = NotaPeer founder's merchant face (ceremonial)