# SPEC (RESERVED) — Employment Binding v1

> *A face attests it is human. A binding attests it works here.*

**Status:** RESERVED — v1 local-only (NotaPeer Roles Wave); on-chain path documented for v2.
**Companions:** notapeer/docs/ROLES.md (doctrine) · notapeer-app/docs/SPEC-ROLES.md (technical)
**Home contract (v2):** EmploymentRegistry — TERPISAH dari WitnessRegistry (satu urusan, satu kontrak).

---

## 1. Purpose & Scope

Bind a worker face to a merchant face with owner consent, so that:
- attendance and sales accountability survive device loss, staff turnover, and disputes;
- a warung's book can prove WHO acted, without revealing WHO THEY ARE beyond their face;
- leaving a job remains a RIGHT, not a permission (unbind callable by either party).

Out of scope now: wages, contracts, legal employment status. This is a
cryptographic consent record, nothing more.

## 2. v1 (NOW) — Local Binding

Storage: notapeer.identities.v1 profiles carry boundTo (merchantFace bytes32)
plus status (active | suspended) and createdAt.

Consent flow (device-local):
1. Owner session creates profile (role=cashier).
2. Employee sets own PIN + sees recovery words ONCE (sovereign root born).
3. Binding written: boundTo = merchantFace of the owner profile on this device.
4. Suspension flips status; every live session of that profile dies on next guard check.
5. Removal deletes keys; attendance & actor history PRESERVED by face
   (history belongs to the book; identity belongs to the human).

No chain involvement. No network required. Doctrine Hukum 2 (offline-first) intact.

## 3. v2 (RESERVED) — On-chain EmploymentRegistry

Proposed interface (mainnet era, Sepolia candidate):

    contract EmploymentRegistry {
        event Bound(bytes32 indexed workerFace, bytes32 indexed merchantFace, uint256 since);
        event Unbound(bytes32 indexed workerFace, bytes32 indexed merchantFace, uint256 at);

        function bind(bytes32 workerFace, bytes32 merchantFace) external;
        function unbind(bytes32 workerFace, bytes32 merchantFace) external;
        function boundSince(bytes32 workerFace, bytes32 merchantFace) external view returns (uint256);
    }

Invariants:
- bind callable ONLY by the wallet that attested merchantFace in WitnessRegistry
  (owner consent is cryptographic, not clerical).
- unbind callable by EITHER party's attester wallet — leaving is a right.
- Faces only. No names, no salaries, no notes. Transparency without surveillance.
- Append-only history: rebind after unbind creates a NEW since-stamp, never rewrites.

## 4. Doctrine Lines

1. A binding without consent is a leash — forbidden.
2. A binding without exit is a cage — forbidden (unbind is unilateral).
3. The chain sees faces and timestamps; the warung keeps names and trust.
4. Suspension is local and instant; binding is public and patient.

## 5. Migration Path v1 → v2

Mirror the attestation-queue pattern:
- Local bindings accumulate offline (status: unflushed).
- When EmploymentRegistry ships and wallet is online: one-time flush emits
  Bound for every active binding; Unbound for every removal since last flush.
- Conflicts (worker bound to two merchants across devices) resolve by
  earliest since-stamp; multiple concurrent bindings are LEGAL (a cashier may
  work two warungs) and must render as such in UI.

## 6. Build Triggers (when v2 stops being reserved)

- Multi-device sync ships (Wave 4) and staff roam beyond the shop tablet; OR
- A pilot warung demands cross-device accountability evidence; OR
- ZCP2O mainnet consensus can witness bindings trust-weighted (superseding transparency-only).

Until a trigger fires: v1 local binding is the whole truth, and the book stays honest.