"""
ZCP2O Core Block Module.
Implements blockchain blocks with cryptographic linking.
"""

import json
import time
from typing import List, Optional
from zcp2o.crypto import hash_data
from zcp2o.transaction import Transaction


class Block:
    """Represents a block in the ZCP2O blockchain."""
    
    def __init__(
        self,
        index: int,
        timestamp: Optional[float] = None,
        transactions: Optional[List[Transaction]] = None,
        previous_hash: str = "0" * 64,  # Genesis block has 64 zeros
        nonce: int = 0
    ):
        self.index = index
        self.timestamp = timestamp or time.time()
        self.transactions = transactions or []
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """
        Calculates SHA-256 hash of the block.
        Hash is based on: index, timestamp, transactions, previous_hash, nonce
        """
        # Convert transactions to list of dicts for hashing
        tx_data = [tx.to_dict() for tx in self.transactions]
        
        block_data = {
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": tx_data,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }
        
        # Convert to JSON string and hash
        block_string = json.dumps(block_data, sort_keys=True)
        return hash_data(block_string.encode('utf-8')).hex()
    
    def add_transaction(self, transaction: Transaction) -> bool:
        """
        Adds a transaction to the block.
        Returns True if successful.
        """
        if not transaction:
            return False
        
        # NOTE: signature validation happens at the API layer (separation of concerns).
        
        self.transactions.append(transaction)
        # Recalculate hash after adding transaction
        self.hash = self.calculate_hash()
        return True
    
    def to_dict(self) -> dict:
        """Converts block to dictionary."""
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": [tx.to_dict() for tx in self.transactions],
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
            "hash": self.hash
        }
    
    def to_json(self) -> str:
        """Converts block to JSON string."""
        return json.dumps(self.to_dict(), sort_keys=True, indent=2)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'Block':
        """Creates Block from JSON string."""
        block_dict = json.loads(json_str)
        
        # Convert transaction dicts back to Transaction objects
        transactions = []
        for tx_dict in block_dict['transactions']:
            tx = Transaction(
                sender=tx_dict['sender'],
                receiver=tx_dict['receiver'],
                amount=tx_dict['amount'],
                timestamp=tx_dict.get('timestamp'),
                signature=tx_dict.get('signature'),
                tx_type=tx_dict.get('tx_type', 'transfer')
            )
            transactions.append(tx)
        
        block = cls(
            index=block_dict['index'],
            timestamp=block_dict['timestamp'],
            transactions=transactions,
            previous_hash=block_dict['previous_hash'],
            nonce=block_dict['nonce']
        )
        block.hash = block_dict['hash']  # Set the pre-calculated hash
        return block
    
    def is_hash_valid(self) -> bool:
        """Verifies that the block's hash is correct."""
        return self.hash == self.calculate_hash()
    
    def __repr__(self):
        return f"Block(index={self.index}, hash={self.hash[:16]}..., txs={len(self.transactions)})"