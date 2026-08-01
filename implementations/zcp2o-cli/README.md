# ZCP2O CLI (Command Line Interface)

> **User-Friendly Tool for Interacting with ZCP2O Network**
> 
> A simple command-line tool that allows users to create wallets, check balances, send transactions, and monitor node status without writing code.

---

## 🚀 Quick Start

### 1. Create a Wallet

python cli.py create-wallet --name mywallet

Output:
 Creating new ZCP2O wallet...
✅ Wallet saved to: /home/user/.zcp2o/wallets/mywallet.json
📍 Address: WKS-a1b2c3d4e5f6...

⚠️  IMPORTANT: Save your address! It cannot be recovered.
   Address: WKS-a1b2c3d4e5f6...

### 2. Check Balance

python cli.py balance --address WKS-a1b2c3d4e5f6...

Output:
💰 Checking balance for: WKS-a1b2c3d4e5f6...

📊 Balance: 0.0 $WEEKS
⚠️  Note: This shows local node balance. For global balance, sync with Gateway Node.

### 3. Send $WEEKS

python cli.py send --from mywallet --to WKS-xyz789... --amount 50

Output:
💸 Sending 50.0 $WEEKS to WKS-xyz789...
⚠️  Note: Wallet loading from file is simplified in this version.
 Loaded address: WKS-a1b2c3d4e5f6...

✅ Transaction created!
   From: WKS-a1b2c3d4e5f6...
   To: WKS-xyz789...
   Amount: 50.0 $WEEKS
   Hash: 7f8a9b2c3d4e5f6a...
   Signature: abc123def456...

⚠️  Note: Transaction broadcasting to node not implemented in this version.
   Transaction data saved locally.

### 4. Check Node Status

python cli.py node-status

Output:
🖥️  Initializing Digital Bunker...
[LocalBunker] Digital Bunker initialized at WKS-node123...

📊 Node Status:
   Name: LocalBunker
   Address: WKS-node123...
   Chain Length: 1 blocks
   Pending Transactions: 0
   Known Peers: 0
   Chain Valid: True

### 5. Show Help

python cli.py help

---

## 📦 Installation

### Prerequisites
- Python 3.9+
- `zcp2o-core` and `zcp2o-node` (sibling folders in `implementations/`)

### Setup
cd implementations/zcp2o-cli

# Run tests
pytest tests/ -v

---

## 🧪 Running Tests

pytest tests/ -v

Expected output: `5 passed`

---

## 📋 Available Commands

| Command | Description | Required Arguments |
|---------|-------------|-------------------|
| `create-wallet` | Create a new ZCP2O wallet | `--name` |
| `balance` | Check wallet balance | `--address` |
| `send` | Send $WEEKS to another address | `--from`, `--to`, `--amount` |
| `node-status` | Show Digital Bunker status | None |
| `help` | Show help message | None |

---

## 🔐 Security Notes

- Wallets are stored in `~/.zcp2o/wallets/` directory
- Optional password encryption available via `--password` flag
- **Never share your private key or wallet file**
- Always backup your wallet address

---

## 🛠️ Development

### Adding New Commands

1. Create a function `cmd_<command_name>(args)` in `cli.py`
2. Add parser in `main()` function
3. Set `args.func = cmd_<command_name>`
4. Update this README

### Example: Adding a "peers" command

def cmd_peers(args):
    """Show connected peers."""
    bunker = DigitalBunker(DEFAULT_NODE_NAME)
    print(f"Connected Peers: {len(bunker.peer_registry)}")
    for addr, score in bunker.peer_registry.items():
        print(f"  - {addr} (Trust: {score})")

# In main():
peers_parser = subparsers.add_parser("peers", help="Show connected peers")
peers_parser.set_defaults(func=cmd_peers)

---

*Part of the ZCP2O Protocol | Zero-Capital Play-to-Own Blockchain*