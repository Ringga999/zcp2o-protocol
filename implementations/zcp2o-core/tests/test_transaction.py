"""
Unit tests for the ZCP2O transaction module.
"""

import pytest
import json
from zcp2o.wallet import Wallet
from zcp2o.transaction import Transaction
from zcp2o.crypto import serialize_public_key


def test_create_transaction():
    """Test if a transaction can be created and signed."""
    sender_wallet = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx = Transaction.create(sender_wallet, receiver_address, 50.0)
    
    # Check basic fields
    assert tx.sender == sender_wallet.address
    assert tx.receiver == receiver_address
    assert tx.amount == 50.0
    assert tx.tx_type == "transfer"
    assert tx.signature is not None
    assert len(tx.signature) > 0  # Signature should not be empty

def test_transaction_to_json():
    """Test if transaction can be serialized to JSON."""
    sender_wallet = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx = Transaction.create(sender_wallet, receiver_address, 50.0)
    json_str = tx.to_json()
    
    # Should be valid JSON
    tx_dict = json.loads(json_str)
    assert tx_dict['amount'] == 50.0
    assert tx_dict['sender'] == sender_wallet.address

def test_transaction_from_json():
    """Test if transaction can be deserialized from JSON."""
    sender_wallet = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx = Transaction.create(sender_wallet, receiver_address, 50.0)
    json_str = tx.to_json()
    
    # Deserialize
    tx_restored = Transaction.from_json(json_str)
    
    assert tx_restored.sender == tx.sender
    assert tx_restored.receiver == tx.receiver
    assert tx_restored.amount == tx.amount
    assert tx_restored.signature == tx.signature

def test_transaction_hash():
    """Test if transaction hash is consistent."""
    sender_wallet = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx1 = Transaction.create(sender_wallet, receiver_address, 50.0)
    tx2 = Transaction.create(sender_wallet, receiver_address, 50.0)
    
    # IMPORTANT: Different timestamps mean different hashes
    # So we test that the same transaction object produces consistent hash
    assert tx1.get_hash() == tx1.get_hash()  # Same object, same hash
    
    # Different amounts should produce different hashes
    tx3 = Transaction.create(sender_wallet, receiver_address, 100.0)
    assert tx1.get_hash() != tx3.get_hash()

def test_transaction_validate():
    """Test if transaction signature can be validated."""
    sender_wallet = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx = Transaction.create(sender_wallet, receiver_address, 50.0)
    
    # Get sender's public key in PEM format
    public_key_pem = serialize_public_key(sender_wallet.public_key)
    
    # Validate should return True
    is_valid = tx.validate(public_key_pem)
    assert is_valid is True, f"Validation failed! Signature: {tx.signature[:20]}..."

def test_invalid_amount_raises_error():
    """Test if creating transaction with invalid amount raises error."""
    sender_wallet = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    with pytest.raises(ValueError):
        Transaction.create(sender_wallet, receiver_address, -10.0)

def test_different_senders_different_transactions():
    """Test that transactions from different wallets are different."""
    wallet1 = Wallet.create()
    wallet2 = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx1 = Transaction.create(wallet1, receiver_address, 50.0)
    tx2 = Transaction.create(wallet2, receiver_address, 50.0)
    
    assert tx1.sender != tx2.sender
    assert tx1.signature != tx2.signature

def test_tampered_transaction_fails_validation():
    """Test that tampered transactions fail validation."""
    sender_wallet = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx = Transaction.create(sender_wallet, receiver_address, 50.0)
    
    # Tamper with the transaction
    tx.amount = 100.0
    
    # Get sender's public key
    public_key_pem = serialize_public_key(sender_wallet.public_key)
    
    # Validation should fail because data was tampered
    assert tx.validate(public_key_pem) is False