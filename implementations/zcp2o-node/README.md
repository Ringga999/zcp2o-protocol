# ZCP2O Node (Digital Bunker)

> **The Full Node Implementation for ZCP2O Protocol**
> 
> Digital Bunker is a full node that maintains the complete blockchain ledger, validates transactions, manages peer trust scores, and archives blocks for the ZCP2O offline-first network. Now with UDP-based mesh networking for peer-to-peer communication without internet.

---

## Features

- **Full Ledger Storage**: Maintains complete blockchain history (no pruning)
- **Balance Tracking**: Prevents double-spending by tracking all account balances
- **Peer Registry**: Manages Trust Scores (0-100) for network participants
- **Transaction Validation**: Validates transfers, claims, and rewards before archiving
- **Block Archiving**: Creates and validates new blocks from pending transactions
- **Chain Integrity**: Verifies cryptographic links between blocks
- **UDP Mesh Networking**: Peer-to-peer communication via broadcast (offline-first)
- **Auto Peer Discovery**: Automatically discovers nearby nodes on local network
- **Message Broadcasting**: Broadcasts transactions and blocks to all peers

---

## Installation

### Prerequisites
- Python 3.9+
- `zcp2o-core` library (sibling folder in `implementations/`)

### Setup
cd implementations/zcp2o-node

# Run tests
pytest tests/ -v

---

## Quick Start

### 1. Initialize a Digital Bunker

from node import DigitalBunker

# Create a new node
bunker = DigitalBunker("MyBunker")
print(f"Node address: {bunker.address}")

Output:
[MyBunker] Digital Bunker initialized at WKS-a1b2c3d4e5f6...
Node address: WKS-a1b2c3d4e5f6...

### 2. Register Peers

# Add trusted peers to the network
bunker.register_peer("WKS-peer123...", initial_trust_score=80)
bunker.register_peer("WKS-peer456...", initial_trust_score=60)

### 3. Process Transactions

from zcp2o.wallet import Wallet
from zcp2o.transaction import Transaction

# Create wallets
alice = Wallet.create()
bob = Wallet.create()

# Give Alice some balance (for testing)
bunker.update_balance(alice.address, 100.0)

# Create and validate a transfer
tx = Transaction.create(alice, bob.address, 20.0, tx_type="TRANSFER")
is_valid = bunker.validate_and_add_transaction(tx)

if is_valid:
    print("Transaction accepted!")

### 4. Mine/Archive a Block

# Archive pending transactions into a new block
block = bunker.mine_block()

if block:
    print(f"Block #{block.index} archived with {len(block.transactions)} transactions")
    print(f"Alice balance: {bunker.get_balance(alice.address)}")
    print(f"Bob balance: {bunker.get_balance(bob.address)}")

Output:
[MyBunker] Block #1 validated and archived. Transactions: 1
Alice balance: 80.0
Bob balance: 20.0

### 5. Manage Trust Scores

# Increase trust score for good behavior
bunker.update_trust_score("WKS-peer123...", +10)

# Decrease trust score for bad behavior
bunker.update_trust_score("WKS-peer456...", -20)

### 6. Start Mesh Networking (Offline-First)

from node import DigitalBunker

# Create node with networking enabled
bunker = DigitalBunker("MyBunker", enable_networking=True, port=9999)

# Start networking
bunker.start_networking()

print(f"Active peers: {bunker.get_active_peers()}")

Output:
[MyBunker] Digital Bunker initialized at WKS-a1b2c3d4e5f6...
[Network] Initialized on port 9999
[Network] Listening on port 9999
[Network] Started. Node: WKS-a1b2c3d4e5f6...
[MyBunker] Networking started on port 9999
[Network] Broadcasted presence
Active peers: ['WKS-peer123...', 'WKS-peer456...']

### 7. Broadcast Transaction to Network

# Create and broadcast transaction
tx = Transaction.create(alice, bob.address, 50.0, tx_type="TRANSFER")
bunker.validate_and_add_transaction(tx)

# Transaction is automatically broadcasted to all peers

### 8. Stop Networking

bunker.stop_networking()
print("Networking stopped")

---

## Running Tests

pytest tests/ -v

Expected output: 14 passed

---

## Node Architecture

Digital Bunker
├── Blockchain (Full chain storage)
├── Ledger (Balance tracking)
├── Peer Registry (Trust scores)
├── Wallet (Node identity)
└── Network Manager (UDP mesh networking)
    ├── Broadcast Loop (30s interval)
    ├── Listen Loop (incoming messages)
    └── Message Handlers (transaction, block, sync)

---

## Security Features

- **Double-Spend Prevention**: Ledger validation before accepting transfers
- **Cryptographic Verification**: All transactions must have valid RSA signatures
- **Trust-Weighted Consensus**: Only high-trust peers can validate transactions
- **Chain Integrity**: Automatic detection of tampered blocks
- **Peer Cleanup**: Automatic removal of inactive peers (>5 minutes)
- **Message Validation**: All incoming messages are validated before processing

---

## Network Configuration

### Port Configuration
# Default port: 9999
bunker = DigitalBunker("MyBunker", enable_networking=True, port=9999)

### Broadcast Interval
# Default: 30 seconds
from network import NetworkManager
network = NetworkManager("WKS-node", port=9999, broadcast_interval=30)

### Message Types
- PRESENCE: Node broadcasts its presence every 30 seconds
- TRANSACTION: Broadcasts new transactions to all peers
- BLOCK: Broadcasts new blocks to all peers
- SYNC_REQUEST: Requests blockchain sync from peer

---

## Integration with ZCP2O Core

This module depends on `zcp2o-core` for:
- Cryptographic operations (RSA-4096, SHA-256)
- Wallet creation and management
- Transaction formatting and validation
- Block structure and chaining

---

## Development

### Adding New Message Handlers

def handle_custom_message(message: Dict, addr: tuple):
    """Handle custom message type."""
    print(f"Received custom message: {message}")

# Register handler
if bunker.network:
    bunker.network.register_handler("CUSTOM_MSG", handle_custom_message)

### Network Message Flow

1. Node A creates transaction
2. Node A validates locally
3. Node A broadcasts to mesh (UDP broadcast)
4. Nodes B, C, D receive transaction
5. Each node validates transaction
6. Nodes add to pending pool
7. Next block includes transaction
8. Block broadcasted to mesh
9. All nodes sync blockchain

---

## Troubleshooting

### Port Already in Use
Error: [Errno 10048] Only one usage of each socket address
Solution: Change port number or stop other node using that port.

### No Peers Discovered
Active peers: []
Solutions:
- Ensure nodes are on same network
- Check firewall allows UDP port 9999
- Wait for broadcast interval (30s)

### Broadcast Failed
[Network] Broadcast error: [Errno 10049]
Solution: Check network connectivity and broadcast permissions.

---

*Part of the ZCP2O Protocol | Zero-Capital Play-to-Own Blockchain*