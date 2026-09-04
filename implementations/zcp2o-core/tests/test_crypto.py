"""
Unit tests for the ZCP2O crypto module.
Run these tests using: pytest tests/test_crypto.py
"""

import pytest
from zcp2o.crypto import generate_key_pair, sign_message, verify_signature, hash_data

def test_generate_key_pair():
    """Test if key pair generation works and has the correct size."""
    private_key, public_key = generate_key_pair()
    
    # Check key sizes
    assert private_key.key_size == 4096
    assert public_key.key_size == 4096

def test_sign_and_verify():
    """Test if a message can be signed and successfully verified."""
    private_key, public_key = generate_key_pair()
    message = b"ZCP2O Genesis Block Transaction"
    
    signature = sign_message(private_key, message)
    is_valid = verify_signature(public_key, signature, message)
    
    assert is_valid is True

def test_tampered_message_fails():
    """Test security: Verify should fail if the message is altered."""
    private_key, public_key = generate_key_pair()
    original_message = b"Send 50 ZPRO to Alice"
    tampered_message = b"Send 5000 ZPRO to Alice"
    
    signature = sign_message(private_key, original_message)
    
    # Verify with the tampered message should fail
    is_valid = verify_signature(public_key, signature, tampered_message)
    assert is_valid is False

def test_hash_data():
    """Test if SHA-256 hashing produces a consistent 32-byte output."""
    data = b"Test data for hashing"
    hashed = hash_data(data)
    
    # SHA-256 always produces 32 bytes
    assert len(hashed) == 32
    
    # Hashing the same data again should produce the exact same hash
    assert hash_data(data) == hashed