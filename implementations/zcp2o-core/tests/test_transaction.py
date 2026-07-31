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

def test_transaction_hash():
    """Test if transaction hash is consistent and unique."""
    sender_wallet = Wallet.create()
    receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"
    
    tx1 = Transaction.create(sender_wallet, receiver_address, 50.0)
    tx2 = Transaction.create(sender_wallet, receiver_address, 50.0)
    
    # Same transaction data should produce same hash
    assert tx1.get_hash() == tx2.get_hash()
    
    # Different amount should produce different hash
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
    assert tx.validate(public_key_pem) is True

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