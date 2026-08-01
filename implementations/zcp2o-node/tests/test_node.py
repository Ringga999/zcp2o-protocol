"""
Unit tests for the ZCP2O Digital Bunker (Node) module.
Includes comprehensive tests for SQLite persistence and state recovery.
"""

import pytest
import sys
import os
import time
import json

# Add parent directories to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

core_dir = os.path.abspath(os.path.join(parent_dir, '../zcp2o-core'))
sys.path.insert(0, core_dir)

from node import DigitalBunker
from zcp2o.wallet import Wallet
from zcp2o.transaction import Transaction


@pytest.fixture
def bunker():
    """Creates a fresh Digital Bunker for each test using in-memory DB for speed."""
    b = DigitalBunker("TestBunker_Alpha", db_path=":memory:")
    yield b
    b.db.close()

@pytest.fixture
def wallet_alice():
    return Wallet.create()

@pytest.fixture
def wallet_bob():
    return Wallet.create()

# ==========================================
# BASIC NODE TESTS
# ==========================================

def test_node_initialization(bunker):
    assert len(bunker.blockchain.chain) == 1
    assert bunker.get_balance("WKS-unknown") == 0.0
    assert bunker.address.startswith("WKS-")

def test_register_peer(bunker):
    peer_addr = "WKS-peer123..."
    bunker.register_peer(peer_addr, 80)
    assert peer_addr in bunker.peer_registry
    assert bunker.peer_registry[peer_addr] == 80

def test_update_trust_score(bunker):
    peer_addr = "WKS-peer123..."
    bunker.register_peer(peer_addr, 50)
    assert bunker.update_trust_score(peer_addr, 10) == 60
    assert bunker.update_trust_score(peer_addr, -20) == 40
    assert bunker.update_trust_score(peer_addr, -100) == 0

def test_validate_and_add_transfer(bunker, wallet_alice, wallet_bob):
    bunker.update_balance(wallet_alice.address, 100.0)
    tx = Transaction.create(wallet_alice, wallet_bob.address, 20.0, tx_type="TRANSFER")
    assert bunker.validate_and_add_transaction(tx) is True
    assert len(bunker.blockchain.pending_transactions) == 1

def test_reject_insufficient_funds(bunker, wallet_alice, wallet_bob):
    tx = Transaction.create(wallet_alice, wallet_bob.address, 50.0, tx_type="TRANSFER")
    assert bunker.validate_and_add_transaction(tx) is False

def test_mine_block_updates_ledger(bunker, wallet_alice, wallet_bob):
    bunker.update_balance(wallet_alice.address, 100.0)
    tx = Transaction.create(wallet_alice, wallet_bob.address, 30.0, tx_type="TRANSFER")
    bunker.validate_and_add_transaction(tx)
    block = bunker.mine_block()
    
    assert block is not None
    assert bunker.get_balance(wallet_alice.address) == 70.0
    assert bunker.get_balance(wallet_bob.address) == 30.0

def test_chain_integrity(bunker, wallet_alice, wallet_bob):
    bunker.update_balance(wallet_alice.address, 50.0)
    tx = Transaction.create(wallet_alice, wallet_bob.address, 10.0, tx_type="TRANSFER")
    bunker.validate_and_add_transaction(tx)
    bunker.mine_block()
    assert bunker.is_chain_valid() is True

# ==========================================
# FORK RESOLUTION TESTS
# ==========================================

def test_calculate_cumulative_trust_weight(bunker, wallet_alice, wallet_bob):
    bunker.update_balance(wallet_alice.address, 100.0)
    tx = Transaction.create(wallet_alice, wallet_bob.address, 20.0, tx_type="TRANSFER")
    bunker.validate_and_add_transaction(tx)
    bunker.mine_block()
    weight = bunker.calculate_cumulative_trust_weight(bunker.blockchain.chain)
    assert weight > 0

def test_resolve_fork_higher_trust_wins(bunker, wallet_alice, wallet_bob):
    bunker.update_balance(wallet_alice.address, 100.0)
    tx = Transaction.create(wallet_alice, wallet_bob.address, 10.0, tx_type="TRANSFER")
    bunker.validate_and_add_transaction(tx)
    bunker.mine_block()
    local_chain = bunker.blockchain.chain.copy()
    remote_chain = local_chain.copy()
    winner = bunker.resolve_fork(local_chain, remote_chain)
    assert winner is not None

def test_resolve_fork_longer_chain_wins(bunker, wallet_alice, wallet_bob):
    bunker.update_balance(wallet_alice.address, 100.0)
    tx = Transaction.create(wallet_alice, wallet_bob.address, 10.0, tx_type="TRANSFER")
    bunker.validate_and_add_transaction(tx)
    bunker.mine_block()
    local_chain = bunker.blockchain.chain.copy()
    remote_chain = local_chain.copy()
    tx2 = Transaction.create(wallet_alice, wallet_bob.address, 5.0, tx_type="TRANSFER")
    bunker.validate_and_add_transaction(tx2)
    block2 = bunker.mine_block()
    remote_chain.append(block2)
    winner = bunker.resolve_fork(local_chain, remote_chain)
    assert winner == remote_chain

def test_apply_fork_resolution(bunker, wallet_alice, wallet_bob):
    bunker.update_balance(wallet_alice.address, 100.0)
    tx = Transaction.create(wallet_alice, wallet_bob.address, 10.0, tx_type="TRANSFER")
    bunker.validate_and_add_transaction(tx)
    bunker.mine_block()
    original_height = len(bunker.blockchain.chain)
    remote_chain = bunker.blockchain.chain.copy()
    bunker.apply_fork_resolution(remote_chain)
    assert bunker.is_chain_valid()

def test_rebuild_ledger_from_chain(bunker, wallet_alice, wallet_bob):
    bunker.ledger[wallet_alice.address] = 100.0
    tx = Transaction.create(wallet_alice, wallet_bob.address, 30.0, tx_type="TRANSFER")
    bunker.validate_and_add_transaction(tx)
    bunker.mine_block()
    assert bunker.get_balance(wallet_alice.address) == 70.0
    bunker.ledger.clear()
    bunker._rebuild_ledger_from_chain()
    assert len(bunker.ledger) > 0

def test_is_chain_structurally_valid(bunker, wallet_alice, wallet_bob):
    bunker.update_balance(wallet_alice.address, 50.0)
    tx = Transaction.create(wallet_alice, wallet_bob.address, 10.0, tx_type="TRANSFER")
    bunker.validate_and_add_transaction(tx)
    bunker.mine_block()
    assert bunker._is_chain_structurally_valid(bunker.blockchain.chain)

# ==========================================
# SQLITE PERSISTENCE & STATE RECOVERY TESTS
# ==========================================

def test_sqlite_persistence(wallet_alice, wallet_bob):
    """
    CRITICAL TEST: Proves that data survives node restart (State Recovery).
    Simulates a node shutting down and starting up again using the same database file.
    """
    db_path = "test_persistence_real.db"
    
    # Ensure clean slate
    if os.path.exists(db_path):
        os.remove(db_path)
    
    # --- PHASE 1: Node A does some work and "shuts down" ---
    node_a = DigitalBunker("Node_A", db_path=db_path)
    
    # Give Alice initial balance and process a transaction
    node_a.update_balance(wallet_alice.address, 500.0)
    tx = Transaction.create(wallet_alice, wallet_bob.address, 100.0, tx_type="TRANSFER")
    node_a.validate_and_add_transaction(tx)
    node_a.mine_block()
    
    # Register a trusted peer
    node_a.register_peer("WKS-trusted_peer_xyz", 95)
    
    # Simulate shutdown (close database connection)
    node_a.db.close()
    
    # --- PHASE 2: Node B starts up using the SAME database file ---
    node_b = DigitalBunker("Node_B", db_path=db_path)
    
    # --- PHASE 3: Verify State Recovery ---
    # 1. Blockchain must be recovered (Genesis + 1 mined block = 2 blocks)
    assert len(node_b.blockchain.chain) == 2, "Blockchain was not recovered from disk!"
    
    # 2. Ledger balances must be exact
    assert node_b.get_balance(wallet_alice.address) == 400.0, "Alice's balance was not recovered!"
    assert node_b.get_balance(wallet_bob.address) == 100.0, "Bob's balance was not recovered!"
    
    # 3. Peer registry must be recovered
    assert node_b.peer_registry.get("WKS-trusted_peer_xyz") == 95, "Peer registry was not recovered!"
    
    # Cleanup
    node_b.db.close()
    if os.path.exists(db_path):
        os.remove(db_path)