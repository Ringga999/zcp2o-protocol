"""
ZCP2O Core Wallet Module.
Handles wallet creation, address generation, and transaction signing.
"""

import json
import hashlib
from zcp2o.crypto import generate_key_pair, sign_message, serialize_public_key

class Wallet:
    def __init__(self, private_key, public_key):
        self.private_key = private_key
        self.public_key = public_key
        self.address = self._generate_address()

    @classmethod
    def create(cls):
        """Factory method to create a new Wallet."""
        private_key, public_key = generate_key_pair()
        return cls(private_key, public_key)

    def _generate_address(self):
        """
        Generates a human-readable address (WKS-...) from the public key.
        Format: WKS-<first 20 bytes of SHA-256 hash of public key in hex>
        """
        pub_bytes = serialize_public_key(self.public_key)
        # SHA-256 hash of the public key
        hashed = hashlib.sha256(pub_bytes).digest()
        # Take first 20 bytes and convert to hex string
        address_hex = hashed[:20].hex()
        return f"WKS-{address_hex}"

    def sign_transaction(self, transaction_data: dict) -> dict:
        """
        Signs a transaction dictionary and returns it with the signature attached.
        """
        # Sort keys to ensure consistent hashing regardless of dict order
        tx_bytes = json.dumps(transaction_data, sort_keys=True).encode('utf-8')
        
        # Sign the data
        signature = sign_message(self.private_key, tx_bytes)

        # Attach signature and sender address to the transaction
        transaction_data['signature'] = signature.hex()
        transaction_data['sender'] = self.address
        
        return transaction_data