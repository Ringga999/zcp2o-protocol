# ZCP2O Node (Digital Bunker)

> **The Full Node Implementation for ZCP2O Protocol**
> 
> Digital Bunker is a full node that maintains the complete blockchain ledger, validates transactions, manages peer trust scores, and archives blocks for the ZCP2O offline-first network. Features UDP-based mesh networking, Async Sync, professional logging, and trust-weighted fork resolution for enterprise-grade security.

---

> **Two binaries:** `node.py` = offline mesh full node (UDP networking, sync, fork resolution). `api.py` = public REST Bunker (FastAPI) used for the live deployment. This README covers both; the v1.2 addendum at the bottom documents the REST API.

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
- **Fork Resolution**: Cumulative trust weight algorithm to select the legitimate chain
- **Professional Logging**: Dual-output logging (Console + File) with daily rotation
- **Audit Trail**: Complete transaction history for institutional compliance

---

## Installation

### Prerequisites
- Python 3.9+
- `zcp2o-core` library (sibling folder in `implementations/`)

### Setup
cd implementations/zcp2o-node

# Run tests
pytest tests/ -v

Expected output: 23 passed

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

## Logging System

### Overview

ZCP2O Node includes a professional logging system designed for institutional deployment. All activities are logged to both console (for real-time monitoring) and file (for audit trail).

### Log File Location

Logs are stored in the `logs/` directory:
- logs/MyBunker.log (current day)
- logs/MyBunker.log.1 (yesterday)
- logs/MyBunker.log.2 (2 days ago)
- ... up to 30 days retention

### Log Format

Each log entry follows this format:
YYYY-MM-DD HH:MM:SS | LEVEL | Message

Example:
2024-08-01 14:30:15 | INFO     | Digital Bunker initialized at WKS-a1b2c3d4...
2024-08-01 14:30:20 | INFO     | Transaction accepted: 50 WEEKS from WKS-xyz...
2024-08-01 14:30:21 | ERROR    | Reject: Insufficient funds for WKS-abc...
2024-08-01 14:30:22 | WARNING  | Block hash mismatch, attempting resolution

### Log Levels

- DEBUG: Detailed information for debugging (trust score updates, internal state)
- INFO: General information (transactions, blocks, sync events)
- WARNING: Potential issues (hash mismatches, low-trust peer conflicts)
- ERROR: Errors that prevent operations (invalid signatures, insufficient funds)
- CRITICAL: Critical failures (system crashes, data corruption)

### Configuration

Customize logging in node.py:

from logger import get_logger

# Create custom logger
logger = get_logger("MyBunker", log_dir="logs", log_level="INFO")

# Available log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL

### Log Rotation

- Rotation: Daily at midnight
- Retention: 30 days
- Encoding: UTF-8
- Max file size: Unlimited (rotates by time, not size)

### Viewing Logs

# View current day log (Linux/Mac)
tail -f logs/MyBunker.log

# View current day log (Windows PowerShell)
Get-Content logs/MyBunker.log -Wait -Tail 50

# Search for specific transaction
grep "WKS-abc123" logs/MyBunker.log

# Count transactions per day
grep "Transaction accepted" logs/MyBunker.log | wc -l

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

## Fork Resolution: Cumulative Trust Weight

### What is Fork Resolution?

Fork Resolution is the mechanism that determines which blockchain is the "true" chain when two conflicting chains exist. In Bitcoin, this is solved by "longest chain wins". In ZCP2O, we use a more sophisticated approach: **Cumulative Trust Weight**.

### Why Not Just "Longest Chain"?

In an offline-first network, a malicious actor could:
1. Create 100 fake nodes (Sybil Attack)
2. Build a longer chain with those fake nodes
3. Force honest nodes to accept the fake chain

ZCP2O prevents this by weighing each block by the **Trust Score** of its validators, not just counting blocks.

### How Cumulative Trust Weight Works

Each block is validated by one or more nodes. Each validator has a Trust Score (0-100). The Cumulative Trust Weight of a chain is the sum of all validator trust scores across all blocks.

Example:

Chain A (3 blocks):
- Block 1: Validated by Node X (Trust: 90)
- Block 2: Validated by Node Y (Trust: 85)
- Block 3: Validated by Node Z (Trust: 80)
- Cumulative Trust Weight = 90 + 85 + 80 = 255

Chain B (5 blocks, but low trust):
- Block 1-5: Each validated by new nodes (Trust: 20 each)
- Cumulative Trust Weight = 20 x 5 = 100

Result: Chain A wins, even though Chain B is longer!

### Fork Resolution Rules

1. Higher Cumulative Trust Weight wins
2. If trust weights are equal, longer chain wins
3. If both are equal, keep local chain (conservative approach)

### Implementation

# Calculate trust weight of a chain
weight = bunker.calculate_cumulative_trust_weight(chain)

# Resolve fork between local and remote chain
winning_chain = bunker.resolve_fork(local_chain, remote_chain)

# Apply fork resolution (replaces local chain if remote wins)
bunker.apply_fork_resolution(remote_chain)

### Real-World Scenario

Scenario: Double-Spend Attempt

1. Alice has 100 WEEKS
2. Alice sends 100 WEEKS to Bob (Node A validates, Trust: 90)
3. Alice tries to send same 100 WEEKS to Charlie (Node B validates, Trust: 30 - suspicious new node)
4. Node A and Node B sync, fork detected
5. Fork Resolution:
   - Chain with Bob's transaction: Trust Weight = 90
   - Chain with Charlie's transaction: Trust Weight = 30
6. Bob's transaction wins, Charlie's rejected
7. Alice's double-spend attempt fails!

### Security Benefits

- Prevents Sybil Attacks (many low-trust nodes can't override high-trust nodes)
- Prevents 51% Attacks (attacker needs high-trust nodes, not just many nodes)
- Encourages long-term participation (trust score builds over time)
- Protects against offline partition attacks

---

## Node Architecture

Digital Bunker
├── Blockchain (Full chain storage)
├── Ledger (Balance tracking)
├── Peer Registry (Trust scores 0-100)
├── Wallet (Node identity)
├── Sync Manager (Async sync state)
├── Fork Resolver (Cumulative trust weight)
├── Logger (Professional logging)
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
- **Cryptographic Verification**: All transactions must have valid RSA signatures (tiered: RSA-2048 Light / RSA-4096 Bunker, per ZWS)
- **Trust-Weighted Consensus**: Only high-trust peers (>80) can influence ledger state
- **Chain Integrity**: Automatic detection of tampered blocks via hash validation
- **Peer Cleanup**: Automatic removal of inactive peers (>5 minutes)
- **Message Validation**: All incoming messages validated before processing
- **Fork Resolution**: Cumulative trust weight algorithm prevents Sybil and 51% attacks
- **Audit Trail**: Complete logging for institutional compliance
- **No Asset Deletion**: Shadow Realm protocol (reward = 0x) instead of banning

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
    bunker.logger.info(f"Received custom message: {message}")

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
10. Forks resolved via Cumulative Trust Weight

### Implementing Custom Sync Logic

# Override sync response handler
def custom_sync_response(self, message: Dict, addr: tuple):
    """Custom sync logic with additional validation."""
    blocks = message.get('blocks', [])
    
    # Validate each block before applying
    for block_data in blocks:
        if self.validate_block_custom(block_data):
            self._apply_incoming_block(block_data)

### Custom Fork Resolution

# Implement custom trust weight calculation
def custom_trust_weight(self, chain):
    """Custom trust weight with additional factors."""
    weight = 0
    for block in chain:
        # Base trust from validators
        weight += self.calculate_cumulative_trust_weight([block])
        # Bonus for recent blocks
        if block.timestamp > time.time() - 3600:
            weight += 10
    return weight

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
[MyBunker] Resolved conflict for WKS-abc123...: 100 -> 200 (trusted peer)
Note: This is NORMAL during Async Sync. Trust-weighted resolution is working.

### Log File Not Created
Issue: No logs/ directory or log files
Solution: Check write permissions in zcp2o-node directory. Logger creates logs/ automatically.

### Log Rotation Not Working
Issue: Log file growing indefinitely
Solution: Check TimedRotatingFileHandler configuration. Ensure midnight rotation is enabled.

### Fork Detected Frequently
Issue: Many fork resolution events in logs
Solution: 
- Check network stability (frequent disconnections cause forks)
- Verify trust scores are properly configured
- Consider increasing broadcast interval to reduce conflicts

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

Expected output: 23 passed

Test coverage:
- Network initialization and peer discovery
- Transaction validation and broadcasting
- Block creation and chain integrity
- Async Sync request/response handling
- Ledger merge with conflict resolution
- Trust score management
- Fork resolution with cumulative trust weight
- Logging system functionality

---

## Performance

### Resource Usage
- Memory: ~50-200 MB (depends on blockchain size)
- Storage: ~10 MB per 1000 transactions + log files
- CPU: Low (RSA verification is main cost)
- Network: ~1 KB/s idle, ~100 KB/s during sync
- Disk I/O: Low (log writes are buffered)

### Scalability
- Max peers per node: ~100 (tested)
- Max transactions per block: ~1000
- Sync speed: ~100 blocks/second (local network)
- Log retention: 30 days (configurable)
- Fork resolution: <1 second for chains up to 1000 blocks

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
- Backup log files weekly (for compliance)
- Keep last 1000 blocks for recovery
- Store backups offline (air-gapped)

### Monitoring

# Monitor log file in real-time
tail -f logs/MyBunker.log | grep "ERROR"

# Check node health
curl http://localhost:9999/health

# Monitor disk usage
du -sh logs/

# Monitor fork resolution events
grep "Fork resolution" logs/MyBunker.log | wc -l

---

## 🆕 v1.2 Addendum — Hardened API & Sovereign Auth (Aug 30, 2026)

This addendum documents the v1.1/v1.2 security layers built **on top of**
the original Bunker API documented above.
Live instance: `https://kdewa.pythonanywhere.com`

### New Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `ZCP2O_API_KEY` | *(unset)* | Legacy shared key (migration period only) |
| `ZCP2O_RATE_LIMIT` | `30` | Max requests/minute per IP |
| `ZCP2O_CORS` | `https://ringga999.github.io` | Allowed origin |
| `ZCP2O_ENABLE_TRANSFER` | `0` | Set `1` to enable `/transfer` (scope-split) |

### Authentication (Dual-Auth)

Protected endpoints accept **either**:
1. **Legacy:** header `X-API-Key: <key>` (deprecated)
2. **Sovereign (recommended):** signed request with identity headers

| Header | Value |
|--------|-------|
| `X-ZCP2O-Identity` | your `zid-...` identity id |
| `X-ZCP2O-Timestamp` | unix seconds (±5 min window) |
| `X-ZCP2O-Nonce` | random 16-byte base64url (single-use) |
| `X-ZCP2O-Signature` | RSA-PSS signature over canonical string |

**Canonical string** (joined by `\n`):
`METHOD`, `/path`, `sha256_hex(body)`, `timestamp`, `nonce`

Dogfood demo: [`examples/sovereign-test.html`](../zcp2o-captcha/examples/sovereign-test.html)

### New Endpoints

#### `POST /identity/register` — get a sovereign identity (NO API KEY)

Onboarding is gated by **humanity**, not shared secrets.

Body: `{ "human_proof": "<token v5>", "pubkey": {"kty":"RSA","n":"...","e":"AQAB"} }`
`201` → `{ "ok": true, "identity_id": "zid-...", "trust": 50 }`
Errors: `401 human_proof_rejected` • `409 proof_already_used` • `409 identity_exists`

#### `POST /verify` — server-side token verification (dual-auth)

Body: `{ "token": "<token v5>" }`
`200` → `{ "valid": true, "reason": "verified", "payload": {...} }`
`401` → reasons: `malformed_token | nonce_replay | token_expired | invalid_signature`

#### `POST /transfer` — DISABLED by default

Returns `403 Transfer disabled (sovereign auth v2 scope-split)` unless
`ZCP2O_ENABLE_TRANSFER=1`.

### Security Features (v1.1/v1.2)

| Feature | Detail |
|---------|--------|
| Rate limiting | per-IP, configurable |
| Security headers | nosniff, DENY, no-store |
| Scope-split | `/transfer` off by default |
| Anti-replay | nonce store + 5-min expiry (P4) |
| Server-side RSA-PSS | full signature verification (P3) |
| Sovereign identity | per-identity keys, revocable (P5) |

Full threat model: [`docs/security-hardening.md`](../../docs/security-hardening.md)

### Changelog

- **v1.2** — Sovereign Auth v2 (identity registry, signed requests), scope-split
- **v1.1** — Hardening: API key, rate-limit, CORS, headers, `/verify` (P1–P4)
- **v1.0** — Initial Bunker

---

## License

AGPL-3.0 - Part of the ZCP2O Protocol | Zero-Capital Play-to-Own Blockchain