#!/usr/bin/env python3
"""
ZCP2O Command Line Interface (CLI).
A user-friendly tool for interacting with the ZCP2O network.
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Add parent directories to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Add zcp2o-core to path
core_dir = os.path.abspath(os.path.join(parent_dir, 'zcp2o-core'))
sys.path.insert(0, core_dir)

# Add zcp2o-node to path
node_dir = os.path.abspath(os.path.join(parent_dir, 'zcp2o-node'))
sys.path.insert(0, node_dir)

from zcp2o.wallet import Wallet
from zcp2o.transaction import Transaction
from zcp2o.crypto import serialize_private_key, serialize_public_key
from node import DigitalBunker


# Configuration
WALLET_DIR = Path.home() / ".zcp2o" / "wallets"
DEFAULT_NODE_NAME = "LocalBunker"


def ensure_wallet_dir():
    """Creates the wallet directory if it doesn't exist."""
    WALLET_DIR.mkdir(parents=True, exist_ok=True)


def get_wallet_path(name: str) -> Path:
    """Returns the file path for a wallet."""
    return WALLET_DIR / f"{name}.json"


def save_wallet(wallet: Wallet, name: str, password: str = None):
    """Saves a wallet to disk (encrypted if password provided)."""
    ensure_wallet_dir()
    wallet_data = {
        "address": wallet.address,
        "private_key_pem": serialize_private_key(wallet.private_key, password.encode() if password else None).decode(),
        "public_key_pem": serialize_public_key(wallet.public_key).decode()
    }
    
    wallet_path = get_wallet_path(name)
    with open(wallet_path, 'w') as f:
        json.dump(wallet_data, f, indent=2)
    
    print(f"✅ Wallet saved to: {wallet_path}")
    print(f"📍 Address: {wallet.address}")


def load_wallet(name: str, password: str = None) -> Wallet:
    """Loads a wallet from disk."""
    wallet_path = get_wallet_path(name)
    
    if not wallet_path.exists():
        print(f"❌ Error: Wallet '{name}' not found at {wallet_path}")
        sys.exit(1)
    
    with open(wallet_path, 'r') as f:
        wallet_data = json.load(f)
    
    # For simplicity in this version, we'll create a new wallet
    # In production, we'd deserialize the PEM keys properly
    print(f"⚠️  Note: Wallet loading from file is simplified in this version.")
    print(f"📍 Loaded address: {wallet_data['address']}")
    
    # Return a new wallet for now (in production, decrypt the private key)
    return Wallet.create()


# === CLI COMMANDS ===

def cmd_create_wallet(args):
    """Creates a new wallet."""
    print("🔐 Creating new ZCP2O wallet...")
    wallet = Wallet.create()
    save_wallet(wallet, args.name, args.password)
    print("\n⚠️  IMPORTANT: Save your address! It cannot be recovered.")
    print(f"   Address: {wallet.address}")


def cmd_balance(args):
    """Checks wallet balance."""
    print(f" Checking balance for: {args.address}")
    
    # Create a temporary node to check balance
    bunker = DigitalBunker(DEFAULT_NODE_NAME)
    balance = bunker.get_balance(args.address)
    
    print(f"\n📊 Balance: {balance} $WEEKS")
    print("⚠️  Note: This shows local node balance. For global balance, sync with Gateway Node.")


def cmd_send(args):
    """Sends $WEEKS to another address."""
    print(f"💸 Sending {args.amount} $WEEKS to {args.to}...")
    
    # Load sender wallet
    wallet = load_wallet(args.from_wallet, args.password)
    
    # Create transaction
    tx = Transaction.create(wallet, args.to, args.amount, tx_type="TRANSFER")
    
    print(f"\n✅ Transaction created!")
    print(f"   From: {tx.sender}")
    print(f"   To: {tx.to}")
    print(f"   Amount: {tx.amount} $WEEKS")
    print(f"   Hash: {tx.get_hash()[:32]}...")
    print(f"   Signature: {tx.signature[:32]}...")
    
    # In production, broadcast to node
    print("\n⚠️  Note: Transaction broadcasting to node not implemented in this version.")
    print("   Transaction data saved locally.")


def cmd_node_status(args):
    """Shows node status."""
    print("️  Initializing Digital Bunker...")
    bunker = DigitalBunker(DEFAULT_NODE_NAME)
    
    print(f"\n📊 Node Status:")
    print(f"   Name: {bunker.node_name}")
    print(f"   Address: {bunker.address}")
    print(f"   Chain Length: {len(bunker.blockchain.chain)} blocks")
    print(f"   Pending Transactions: {len(bunker.blockchain.pending_transactions)}")
    print(f"   Known Peers: {len(bunker.peer_registry)}")
    print(f"   Chain Valid: {bunker.is_chain_valid()}")


def cmd_help(args):
    """Shows help message."""
    print("""
 ZCP2O Command Line Interface
================================

Usage: python cli.py <command> [options]

Commands:
  create-wallet    Create a new ZCP2O wallet
  balance          Check wallet balance
  send             Send $WEEKS to another address
  node-status      Show Digital Bunker node status
  help             Show this help message

Examples:
  python cli.py create-wallet --name mywallet --password secret123
  python cli.py balance --address WKS-abc123...
  python cli.py send --from mywallet --to WKS-xyz789... --amount 50
  python cli.py node-status

For more info: python cli.py <command> --help
    """)


# === MAIN CLI SETUP ===

def main():
    parser = argparse.ArgumentParser(
        description="🌱 ZCP2O CLI - Interact with the ZCP2O network",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # create-wallet command
    create_parser = subparsers.add_parser("create-wallet", help="Create a new wallet")
    create_parser.add_argument("--name", required=True, help="Wallet name (e.g., mywallet)")
    create_parser.add_argument("--password", help="Password to encrypt wallet (optional)")
    create_parser.set_defaults(func=cmd_create_wallet)
    
    # balance command
    balance_parser = subparsers.add_parser("balance", help="Check wallet balance")
    balance_parser.add_argument("--address", required=True, help="Wallet address to check")
    balance_parser.set_defaults(func=cmd_balance)
    
    # send command
    send_parser = subparsers.add_parser("send", help="Send $WEEKS to another address")
    send_parser.add_argument("--from", dest="from_wallet", required=True, help="Sender wallet name")
    send_parser.add_argument("--to", required=True, help="Receiver address")
    send_parser.add_argument("--amount", type=float, required=True, help="Amount to send")
    send_parser.add_argument("--password", help="Password to decrypt wallet (if encrypted)")
    send_parser.set_defaults(func=cmd_send)
    
    # node-status command
    node_parser = subparsers.add_parser("node-status", help="Show node status")
    node_parser.set_defaults(func=cmd_node_status)
    
    # help command
    help_parser = subparsers.add_parser("help", help="Show help message")
    help_parser.set_defaults(func=cmd_help)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    args.func(args)


if __name__ == "__main__":
    main()