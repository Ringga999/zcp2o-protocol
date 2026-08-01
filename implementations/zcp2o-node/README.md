# ZCP2O Node (Digital Bunker)

> **The Full Node Implementation for ZCP2O Protocol**
> 
> Digital Bunker is a full node that maintains the complete blockchain ledger, validates transactions, manages peer trust scores, and archives blocks for the ZCP2O offline-first network. Features UDP-based mesh networking and Async Sync for offline resilience.

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
- **Async Sync**: Synchronizes blockchain when nodes reconnect after offline period
- **Conflict Resolution**: Trust-weighted ledger merge for double-spend resolution
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

Expected output: 17 passed

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

### 7. Async Sync - Request Sync from Peer

# When discovering a new peer, auto-request sync
bunker.request_sync("WKS-peer123...")

Output:
[MyBunker] Sent sync request to WKS-peer123... (height: 5)
[WKS-peer123...] Sync request from MyBunker (their height: 5, our height: 10)
[WKS-peer123...] Sending 5 blocks to MyBunker
[MyBunker] Receiving 5 blocks from WKS-peer123...
[MyBunker] Applied block #6 from peer
[MyBunker] Applied block #7 from peer
...
[MyBunker] Sync completed with WKS-peer123.... Chain height: 10

### 8. Broadcast Transaction to Network

# Create and broadcast transaction
tx = Transaction.create(alice, bob.address, 50.0, tx_type="TRANSFER")
bunker.validate_and_add_transaction(tx)

# Transaction is automatically broadcasted to all peers

### 9. Stop Networking

bunker.stop_networking()
print("Networking stopped")

---

## Async Sync: How It Works

### What is Async Sync?

Async Sync (Asynchronous Synchronization) is ZCP2O's solution for offline-first blockchain. Unlike Bitcoin/Ethereum that require constant internet, ZCP2O nodes can operate offline for days/weeks and sync when they reconnect.

### Scenario Example

Day 1 (Offline):
- Node A at Campus X processes 10 transactions
- Node B at Campus Y processes 15 transactions
- Both nodes offline (no internet)

Day 4 (Reconnection):
- Gateway Node connects Campus X and Campus Y
- Node A and Node B discover each other
- They exchange missing blocks via Async Sync
- Conflicts (double-spends) resolved via Trust Score

### Sync Flow

1. Peer Discovery: Node A broadcasts presence
2. Sync Request: Node B sends "I'm at height 5, you?"
3. Sync Response: Node A replies "I'm at height 10, here are blocks 6-10"
4. Block Application: Node B applies received blocks
5. Ledger Merge: Node B merges balance state, resolves conflicts
6. Trust Update: Both nodes increase trust score (+5)

### Conflict Resolution

If double-spend detected:
- Compare Trust Scores of validating nodes
- Higher trust score wins
- Lower trust transaction rejected
- Prevents malicious forks

---

## Node Architecture

Digital Bunker
├── Blockchain (Full chain storage)
├── Ledger (Balance tracking)
├── Peer Registry (Trust scores 0-100)
├── Wallet (Node identity)
├── Sync Manager (Async sync state)
└── Network Manager (UDP mesh networking)
    ├── Broadcast Loop (30s interval)
    ├── Listen Loop (incoming messages)
    └── Message Handlers
        ├── PRESENCE (peer discovery)
        ├── TRANSACTION (broadcast tx)
        ├── BLOCK (broadcast block)
        ├── SYNC_REQUEST (request sync)
        └── SYNC_RESPONSE (send blocks)

---

## Security Features

- **Double-Spend Prevention**: Ledger validation + Async Sync conflict resolution
- **Cryptographic Verification**: All transactions must have valid RSA-4096 signatures
- **Trust-Weighted Consensus**: Only high-trust peers (>80) can influence ledger state
- **Chain Integrity**: Automatic detection of tampered blocks via hash validation
- **Peer Cleanup**: Automatic removal of inactive peers (>5 minutes)
- **Message Validation**: All incoming messages validated before processing
- **Fork Resolution**: Longest chain with highest cumulative trust weight wins

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
- PRESENCE: Node broadcasts presence every 30 seconds
- TRANSACTION: Broadcasts new transactions to all peers
- BLOCK: Broadcasts new blocks to all peers
- SYNC_REQUEST: Requests blockchain sync from peer
- SYNC_RESPONSE: Sends missing blocks to peer

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
2. Node A validates locally (check balance, signature)
3. Node A broadcasts to mesh (UDP broadcast)
4. Nodes B, C, D receive transaction
5. Each node validates transaction
6. Nodes add to pending pool
7. Next block includes transaction
8. Block broadcasted to mesh
9. All nodes sync blockchain via Async Sync

### Implementing Custom Sync Logic

# Override sync response handler
def custom_sync_response(self, message: Dict, addr: tuple):
    """Custom sync logic with additional validation."""
    blocks = message.get('blocks', [])
    
    # Validate each block before applying
    for block_data in blocks:
        if self.validate_block_custom(block_data):
            self._apply_incoming_block(block_data)

---

## Troubleshooting

### Port Already in Use
Error: [Errno 10048] Only one usage of each socket address
Solution: Change port number or stop other node using that port.

### No Peers Discovered
Active peers: []
Solutions:
- Ensure nodes are on same network (same subnet)
- Check firewall allows UDP port 9999
- Wait for broadcast interval (30s)
- Check if nodes are in different VLANs

### Broadcast Failed
[Network] Broadcast error: [Errno 10049]
Solution: Check network connectivity and broadcast permissions.

### Sync Stuck
[MyBunker] Already syncing with WKS-peer123...
Solution: Wait for sync to complete or restart node to reset sync state.

### Ledger Conflict
[MyBunker] Resolved conflict for WKS-abc123...: 100 → 200 (trusted peer)
Note: This is NORMAL during Async Sync. Trust-weighted resolution is working.

---

## Integration with ZCP2O Core

This module depends on `zcp2o-core` for:
- Cryptographic operations (RSA-4096, SHA-256)
- Wallet creation and management
- Transaction formatting and validation
- Block structure and chaining

---

## Testing

Run comprehensive test suite:

pytest tests/ -v

Expected output: 17 passed

Test coverage:
- Network initialization and peer discovery
- Transaction validation and broadcasting
- Block creation and chain integrity
- Async Sync request/response handling
- Ledger merge with conflict resolution
- Trust score management

---

## Performance

### Resource Usage
- Memory: ~50-200 MB (depends on blockchain size)
- Storage: ~10 MB per 1000 transactions
- CPU: Low (RSA verification is main cost)
- Network: ~1 KB/s idle, ~100 KB/s during sync

### Scalability
- Max peers per node: ~100 (tested)
- Max transactions per block: ~1000
- Sync speed: ~100 blocks/second (local network)

---

## Production Deployment

### Running as Service (Linux)

Create systemd service:

[Unit]
Description=ZCP2O Digital Bunker
After=network.target

[Service]
Type=simple
User=zcp2o
WorkingDirectory=/opt/zcp2o-node
ExecStart=/usr/bin/python3 node.py
Restart=always

[Install]
WantedBy=multi-user.target

### Environment Variables

export ZCP2O_NODE_NAME="CampusX_Bunker"
export ZCP2O_PORT=9999
export ZCP2O_LOG_LEVEL=INFO

### Backup Strategy

- Backup wallet private key (CRITICAL)
- Backup ledger state daily
- Keep last 1000 blocks for recovery
- Store backups offline (air-gapped)

---

## License

MIT License - Part of the ZCP2O Protocol | Zero-Capital Play-to-Own Blockchain