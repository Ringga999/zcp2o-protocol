# 🔐 Identity & Attestation Flow

> *From a 3-second hold to an on-chain stamp of humanity — without leaking a byte of self.*

```mermaid
flowchart TD
    classDef human fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef device fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef secret fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d
    classDef chain fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d

    A[🧑 Human holds button 3s<br/>micro-jitter sampled]:::human --> B[traceCommitment<br/>sha256 of trace]:::device
    B --> C[Root S generated<br/>128-bit, device-only]:::secret
    C --> D[12-word recovery phrase<br/>shown ONCE, paper only]:::secret
    C --> E[PIN encrypts S<br/>AES-GCM at rest]:::device
    C --> F[Merchant face<br/>H S merchant]:::device
    F --> G{Online + wallet?}
    G -- no --> H[⏳ Attestation queue<br/>offline-first]:::device
    H --> G
    G -- yes --> I[⚓ WitnessRegistry.attest<br/>face + commitment]:::chain
    I --> J[✅ Validated badge<br/>public event, public time]:::chain

    K[🔑 Returning human]:::human --> L[PIN or 30-day trust token]:::device
    L --> M[Root decrypted in memory<br/>faces re-derived]:::device
    M --> N[📊 Same zid, same history<br/>session after session]:::chain
```

---

*Spec: [`specs/witness-registry.md`](../../specs/witness-registry.md) · Doctrine: `notapeer/docs/IDENTITY.md`*