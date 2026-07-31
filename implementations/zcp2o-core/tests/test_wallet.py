"""
Unit tests for the ZCP2O wallet module.
"""

import pytest
from zcp2o.wallet import Wallet

def test_create_wallet():
    """Test if a wallet can be created and has a valid address format."""
    wallet = Wallet.create()
    
    # Address should start with "WKS-"
    assert wallet.address.startswith("WKS-")
    # Address should be "WKS-" (4 chars) + 40 hex chars = 44 chars total
    assert len(wallet.address) == 44

def test_sign_transaction():
    """Test if a wallet can sign a transaction and attach its address."""
    wallet = Wallet.create()
    
    # Create a dummy transaction
    tx = {"receiver": "WKS-abcdef1234567890", "amount": 50}
    
    # Sign it
    signed_tx = wallet.sign_transaction(tx)
    
    # Check if signature and sender are attached
    assert "signature" in signed_tx
    assert signed_tx["sender"] == wallet.address
    assert signed_tx["amount"] == 50 # Original data should remain intact

def test_different_wallets_different_addresses():
    """Test that two different wallets generate different addresses."""
    wallet1 = Wallet.create()
    wallet2 = Wallet.create()
    
    assert wallet1.address != wallet2.address