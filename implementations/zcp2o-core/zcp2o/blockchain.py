"""
ZCP2O Core Blockchain Module.
Manages the chain of blocks, pending transactions, and chain validation.
"""

import json
from typing import List, Dict, Optional
from zcp2o.block import Block
from zcp2o.transaction import Transaction


class Blockchain:
    """
    The core Blockchain class that manages the ledger.
    It handles adding transactions, creating new blocks, and validating the chain integrity.
    """
    
    def __init__(self):
        self.chain: List[Block] = []
        self.pending_transactions: List[Transaction] = []
        
        # Create the Genesis Block (Block 0)
        self.create_genesis_block()
    
    def create_genesis_block(self):
        """Creates the first block in the chain (Genesis Block)."""
        genesis = Block(index=0, previous_hash="0" * 64)
        self.chain.append(genesis)
    
    @property
    def last_block(self) -> Block:
        """Returns the last block in the chain."""
        return self.chain[-1]
    
    def add_transaction(self, transaction: Transaction) -> int:
        """
        Adds a new transaction to the pending list.
        Returns the index of the block that will hold this transaction.
        """
        # Basic validation before adding to pending
        if not transaction.signature:
            raise ValueError("Transaction must be signed before adding to blockchain.")
        
        self.pending_transactions.append(transaction)
        return self.last_block.index + 1
    
    def create_block(self) -> Block:
        """
        Creates a new block with all pending transactions and adds it to the chain.
        In a real PoP system, this would also include validator signatures.
        """
        if not self.pending_transactions:
            raise ValueError("Cannot create block: No pending transactions.")
        
        transactions = self.pending_transactions
        self.pending_transactions = []  # Reset pending list
        
        previous_hash = self.last_block.hash
        index = self.last_block.index + 1
        
        new_block = Block(
            index=index,
            transactions=transactions,
            previous_hash=previous_hash
        )
        
        self.chain.append(new_block)
        return new_block
    
    def is_chain_valid(self, chain: List[Block]) -> bool:
        """
        Validates the entire blockchain.
        Checks hash links, block integrity, and transaction signatures.
        """
        # 1. Check Genesis Block
        if chain[0].index != 0 or chain[0].previous_hash != "0" * 64:
            return False
        
        # 2. Check all subsequent blocks
        for i in range(1, len(chain)):
            current_block = chain[i]
            previous_block = chain[i - 1]
            
            # Check if the block links to the previous one correctly
            if current_block.previous_hash != previous_block.hash:
                return False
            
            # Check if the block's hash is valid (not tampered)
            if not current_block.is_hash_valid():
                return False
            
            # Check if all transactions in the block are valid
            for tx in current_block.transactions:
                if not tx.signature:
                    return False
                # Note: Full transaction signature validation requires a registry 
                # of public keys, which will be handled by the Node class later.
                # Here we ensure the structure is intact.
        
        return True
    
    def get_chain_data(self) -> List[Dict]:
        """Returns the entire chain as a list of dictionaries (for API/JSON export)."""
        return [block.to_dict() for block in self.chain]