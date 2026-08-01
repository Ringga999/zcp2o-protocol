# ZCP2O Node (Digital Bunker)

> **The Full Node Implementation for ZCP2O Protocol**
> 
> Digital Bunker is a full node that maintains the complete blockchain ledger, validates transactions, manages peer trust scores, and archives blocks for the ZCP2O offline-first network.

---

## Features

- **Full Ledger Storage**: Maintains complete blockchain history (no pruning)
- **Balance Tracking**: Prevents double-spending by tracking all account balances
- **Peer Registry**: Manages Trust Scores (0-100) for network participants
- **Transaction Validation**: Validates transfers, claims, and rewards before archiving
- **Block Archiving**: Creates and validates new blocks from pending transactions
- **Chain Integrity**: Verifies cryptographic links between blocks

---

## 📦 Installation

### Prerequisites
- Python 3.9+
- `zcp2o-core` library (sibling folder in `implementations/`)

### Setup
```bash
# Ensure zcp2o-core is in your Python path
cd implementations/zcp2o-node

# Run tests
pytest tests/ -v