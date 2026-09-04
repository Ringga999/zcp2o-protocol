"""
ZCP2O Core Transaction Module.
Handles transaction creation, validation, and serialization.
"""

import json
import time
import hashlib
from typing import Dict, Optional
from zcp2o.crypto import verify_signature, hash_data
from zcp2o.wallet import Wallet


class Transaction:
    """Represents a ZCP2O transaction."""
    
    def __init__(
        self,
        sender: str,
        receiver: str,
        amount: float,
        timestamp: Optional[float] = None,
        signature: Optional[str] = None,
        tx_type: str = "transfer"
    ):
        self.sender = sender
        self.receiver = receiver
        self.amount = amount
        self.timestamp = timestamp or time.time()
        self.signature = signature
        self.tx_type = tx_type  # "transfer", "reward", "fee"
    
    def to_dict(self) -> Dict:
        """Converts transaction to dictionary (for JSON serialization)."""
        return {
            "sender": self.sender,
            "receiver": self.receiver,
            "amount": self.amount,
            "timestamp": self.timestamp,
            "tx_type": self.tx_type,
            "signature": self.signature
        }
    
    def to_json(self) -> str:
        """Converts transaction to JSON string (for network transmission)."""
        return json.dumps(self.to_dict(), sort_keys=True)
    
    def _get_signing_data(self) -> bytes:
        """
        Gets the canonical byte representation for signing/validation.
        This EXCLUDES the signature to prevent circular dependency.
        """
        # Create dict WITHOUT signature
        tx_data = {
            "sender": self.sender,
            "receiver": self.receiver,
            "amount": self.amount,
            "timestamp": self.timestamp,
            "tx_type": self.tx_type
        }
        # Sort keys and encode to bytes
        return json.dumps(tx_data, sort_keys=True).encode('utf-8')
    
    def get_hash(self) -> str:
        """
        Generates SHA-256 hash of the transaction (for block inclusion).
        Hash is computed from signing data (all fields EXCEPT signature).
        """
        tx_bytes = self._get_signing_data()
        hashed = hash_data(tx_bytes)
        return hashed.hex()
    
    @classmethod
    def create(cls, wallet: Wallet, receiver: str, amount: float, tx_type: str = "transfer") -> 'Transaction':
        """
        Factory method to create and sign a new transaction.
        """
        # Validate amount
        if amount <= 0:
            raise ValueError("Transaction amount must be positive")
        
        # Create unsigned transaction
        tx = cls(
            sender=wallet.address,
            receiver=receiver,
            amount=amount,
            tx_type=tx_type
        )
        
        # Get the signing data
        signing_data = tx._get_signing_data()
        
        # Sign the data
        from zcp2o.crypto import sign_message
        signature = sign_message(wallet.private_key, signing_data)
        
        # Store signature as hex string
        tx.signature = signature.hex()
        
        return tx
    
    @classmethod
    def from_json(cls, json_str: str) -> 'Transaction':
        """Deserializes transaction from JSON string."""
        tx_dict = json.loads(json_str)
        return cls(**tx_dict)
    
    def validate(self, public_key_pem: bytes) -> bool:
        """
        Validates transaction signature using sender's public key.
        Returns True if valid, False otherwise.
        """
        if not self.signature:
            return False
        
        # Get the signing data (same as what was signed)
        signing_data = self._get_signing_data()
        
        # Convert signature from hex to bytes
        signature_bytes = bytes.fromhex(self.signature)
        
        # Verify signature
        from cryptography.hazmat.primitives.serialization import load_pem_public_key
        from cryptography.hazmat.backends import default_backend
        
        try:
            public_key = load_pem_public_key(public_key_pem, backend=default_backend())
            return verify_signature(public_key, signature_bytes, signing_data)
        except Exception:
            return False
    
    def __repr__(self):
        return f"Transaction({self.sender} -> {self.receiver}: {self.amount} ZPRO)"