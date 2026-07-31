"""
Unit tests for the ZCP2O block module.
"""

import pytest
import time
from zcp2o.wallet import Wallet
from zcp2o.transaction import Transaction
from zcp2o.block import Block


def test_create_genesis_block():
    """Test creation of genesis block (first block)."""
    genesis = Block(index=0, previous_hash="0" * 64)
    
    assert genesis.index == 0
    assert genesis.previous_hash == "0" * 64
    assert genesis.hash is not None
    assert len(genesis.hash) == 64  # SHA-256 produces 64 hex characters

def test_block_hash_changes_with_content():
    """Test that changing block content changes the hash."""
    block1 = Block(index=1, timestamp=1000.0)
    block2 = Block(index=1, timestamp=2000.0)  # Different timestamp
    
    assert block1.hash != block2.hash

def test_block_with_transactions():
    """Test block that contains transactions."""
    sender = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx1 = Transaction.create(sender, receiver_address, 50.0)
    tx2 = Transaction.create(sender, receiver_address, 30.0)
    
    block = Block(index=1, transactions=[tx1, tx2])
    
    assert len(block.transactions) == 2
    assert block.transactions[0].amount == 50.0
    assert block.transactions[1].amount == 30.0

def test_block_hash_is_consistent():
    """Test that block hash is consistent (same content = same hash)."""
    block = Block(index=5, timestamp=1234567890.0)
    hash1 = block.hash
    hash2 = block.calculate_hash()
    
    assert hash1 == hash2

def test_block_serialization():
    """Test block can be serialized to JSON and back."""
    sender = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    tx = Transaction.create(sender, receiver_address, 100.0)
    
    original_block = Block(index=1, transactions=[tx])
    json_str = original_block.to_json()
    
    # Deserialize
    restored_block = Block.from_json(json_str)
    
    assert restored_block.index == original_block.index
    assert len(restored_block.transactions) == len(original_block.transactions)
    assert restored_block.hash == original_block.hash

def test_blockchain_linking():
    """Test that blocks are properly linked via previous_hash."""
    # Create genesis block
    genesis = Block(index=0, previous_hash="0" * 64)
    
    # Create second block
    block2 = Block(index=1, previous_hash=genesis.hash)
    
    # Create third block
    block3 = Block(index=2, previous_hash=block2.hash)
    
    # Verify linking
    assert block2.previous_hash == genesis.hash
    assert block3.previous_hash == block2.hash
    assert block3.previous_hash != genesis.hash

def test_tampered_block_detection():
    """Test that tampering with a block is detectable."""
    block = Block(index=1, timestamp=1000.0)
    original_hash = block.hash
    
    # Tamper with the block
    block.timestamp = 2000.0
    
    # The stored hash should remain the same
    assert block.hash == original_hash
    
    # But if we recalculate, it should be different
    recalculated_hash = block.calculate_hash()
    assert recalculated_hash != original_hash
    
    # This is how we detect tampering!
    assert block.is_hash_valid() == False