"""
Unit tests for the ZCP2O blockchain module.
"""

import pytest
from zcp2o.wallet import Wallet
from zcp2o.transaction import Transaction
from zcp2o.blockchain import Blockchain


def test_genesis_block_creation():
    """Test if the blockchain initializes with a valid genesis block."""
    bc = Blockchain()
    
    assert len(bc.chain) == 1
    assert bc.chain[0].index == 0
    assert bc.chain[0].previous_hash == "0" * 64

def test_add_transaction():
    """Test adding a signed transaction to the pending list."""
    bc = Blockchain()
    sender = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx = Transaction.create(sender, receiver_address, 50.0)
    block_index = bc.add_transaction(tx)
    
    assert block_index == 1
    assert len(bc.pending_transactions) == 1

def test_add_unsigned_transaction_raises_error():
    """Test that adding an unsigned transaction raises an error."""
    bc = Blockchain()
    
    # Create a transaction object manually without signing
    tx = Transaction(sender="WKS-123", receiver="WKS-456", amount=10.0)
    
    with pytest.raises(ValueError):
        bc.add_transaction(tx)

def test_create_block():
    """Test creating a new block from pending transactions."""
    bc = Blockchain()
    sender = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx = Transaction.create(sender, receiver_address, 50.0)
    bc.add_transaction(tx)
    
    new_block = bc.create_block()
    
    assert new_block.index == 1
    assert len(new_block.transactions) == 1
    assert len(bc.pending_transactions) == 0  # Pending list should be cleared
    assert len(bc.chain) == 2

def test_create_block_with_no_transactions_raises_error():
    """Test that creating a block with no pending transactions raises an error."""
    bc = Blockchain()
    
    with pytest.raises(ValueError):
        bc.create_block()

def test_valid_chain():
    """Test that a newly created chain is valid."""
    bc = Blockchain()
    sender = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    # Add some transactions and blocks
    for i in range(3):
        tx = Transaction.create(sender, receiver_address, float(i + 10))
        bc.add_transaction(tx)
        bc.create_block()
    
    assert bc.is_chain_valid(bc.chain) is True

def test_tampered_chain_is_invalid():
    """Test that tampering with a block's data invalidates the chain."""
    bc = Blockchain()
    sender = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx = Transaction.create(sender, receiver_address, 50.0)
    bc.add_transaction(tx)
    bc.create_block()
    
    # Tamper with the second block's data
    bc.chain[1].timestamp = 9999999999.0
    
    # The chain should now be invalid because the hash doesn't match the data
    assert bc.is_chain_valid(bc.chain) is False

def test_broken_link_is_invalid():
    """Test that breaking the link between blocks invalidates the chain."""
    bc = Blockchain()
    sender = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx = Transaction.create(sender, receiver_address, 50.0)
    bc.add_transaction(tx)
    bc.create_block()
    
    # Tamper with the previous_hash of the second block
    bc.chain[1].previous_hash = "tampered_hash_value"
    
    assert bc.is_chain_valid(bc.chain) is False