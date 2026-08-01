"""
Unit tests for the ZCP2O Digital Bunker (Node) module.
"""

import pytest
import sys
import os

# Add the parent directory (zcp2o-node root) to the path
# This allows importing 'node' module from the tests folder
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Add zcp2o-core to path for importing the library
core_dir = os.path.abspath(os.path.join(parent_dir, '../zcp2o-core'))
sys.path.insert(0, core_dir)

from node import DigitalBunker
from zcp2o.wallet import Wallet
from zcp2o.transaction import Transaction


@pytest.fixture
def bunker():
    """Creates a fresh Digital Bunker for each test."""
    return DigitalBunker("TestBunker_Alpha")

@pytest.fixture
def wallet_alice():
    return Wallet.create()

@pytest.fixture
def wallet_bob():
    return Wallet.create()

def test_node_initialization(bunker):
    """Test if the node initializes with a genesis block and empty ledger."""
    assert len(bunker.blockchain.chain) == 1
    assert bunker.get_balance("WKS-unknown") == 0.0
    assert bunker.address.startswith("WKS-")

def test_register_peer(bunker):
    """Test adding a new peer to the registry."""
    peer_addr = "WKS-peer123..."
    bunker.register_peer(peer_addr, 80)
    
    assert peer_addr in bunker.peer_registry
    assert bunker.peer_registry[peer_addr] == 80

def test_update_trust_score(bunker):
    """Test increasing and decreasing trust scores."""
    peer_addr = "WKS-peer123..."
    bunker.register_peer(peer_addr, 50)
    
    # Good behavior
    new_score = bunker.update_trust_score(peer_addr, 10)
    assert new_score == 60
    
    # Bad behavior
    new_score = bunker.update_trust_score(peer_addr, -20)
    assert new_score == 40
    
    # Cannot go below 0
    new_score = bunker.update_trust_score(peer_addr, -100)
    assert new_score == 0

def test_validate_and_add_transfer(bunker, wallet_alice, wallet_bob):
    """Test adding a valid transfer transaction."""
    # Give Alice some fake balance in the ledger for testing
    bunker.update_balance(wallet_alice.address, 100.0)
    
    tx = Transaction.create(wallet_alice, wallet_bob.address, 20.0, tx_type="TRANSFER")
    
    is_valid = bunker.validate_and_add_transaction(tx)
    assert is_valid is True
    assert len(bunker.blockchain.pending_transactions) == 1

def test_reject_insufficient_funds(bunker, wallet_alice, wallet_bob):
    """Test that a transfer is rejected if the sender has no balance."""
    # Alice has 0 balance
    tx = Transaction.create(wallet_alice, wallet_bob.address, 50.0, tx_type="TRANSFER")
    
    is_valid = bunker.validate_and_add_transaction(tx)
    assert is_valid is False

def test_mine_block_updates_ledger(bunker, wallet_alice, wallet_bob):
    """Test that mining a block correctly updates the ledger balances."""
    bunker.update_balance(wallet_alice.address, 100.0)
    
    tx = Transaction.create(wallet_alice, wallet_bob.address, 30.0, tx_type="TRANSFER")
    bunker.validate_and_add_transaction(tx)
    
    # Mine the block
    block = bunker.mine_block()
    
    assert block is not None
    assert len(bunker.blockchain.pending_transactions) == 0 # Pending cleared
    
    # Check ledger updates
    assert bunker.get_balance(wallet_alice.address) == 70.0 # 100 - 30
    assert bunker.get_balance(wallet_bob.address) == 30.0   # 0 + 30

def test_chain_integrity(bunker, wallet_alice, wallet_bob):
    """Test that the node can verify its own chain integrity."""
    bunker.update_balance(wallet_alice.address, 50.0)
    tx = Transaction.create(wallet_alice, wallet_bob.address, 10.0, tx_type="TRANSFER")
    bunker.validate_and_add_transaction(tx)
    bunker.mine_block()
    
    assert bunker.is_chain_valid() is True