"""
ZCP2O Node Module (Digital Bunker).
Represents a Full Node that manages the blockchain, peer trust scores, and ledger state.
"""

from typing import Dict, List, Optional
import time

# Note: In a real deployment, 'zcp2o' library from zcp2o-core would be installed via pip.
# For local development in PyCharm, ensure 'zcp2o-core' is marked as Sources Root 
# or added to your Python interpreter paths.
from zcp2o.blockchain import Blockchain
from zcp2o.transaction import Transaction
from zcp2o.wallet import Wallet


class DigitalBunker:
    """
    Represents a Full Node (Digital Bunker) in the ZCP2O network.
    It maintains the full blockchain, a ledger of balances, and a registry of trusted peers.
    """

    def __init__(self, node_name: str):
        self.node_name = node_name
        self.blockchain = Blockchain()
        
        # Ledger State: Tracks balances to prevent double spending
        # Format: { "WKS-address...": balance_float }
        self.ledger: Dict[str, float] = {}
        
        # Peer Registry: Tracks Trust Scores of other nodes
        # Format: { "WKS-address...": trust_score_int (0-100) }
        self.peer_registry: Dict[str, int] = {}
        
        # Initialize the node's own wallet (for signing blocks/transactions)
        self.wallet = Wallet.create()
        self.address = self.wallet.address
        
        print(f"[{self.node_name}] Digital Bunker initialized at {self.address}")

    def register_peer(self, peer_address: str, initial_trust_score: int = 50):
        """Adds a new node to the trusted peer registry."""
        if peer_address not in self.peer_registry:
            self.peer_registry[peer_address] = initial_trust_score
            print(f"[{self.node_name}] Peer registered: {peer_address} (Trust: {initial_trust_score})")

    def update_trust_score(self, peer_address: str, delta: int):
        """Increases or decreases a peer's trust score based on behavior."""
        if peer_address in self.peer_registry:
            new_score = max(0, min(100, self.peer_registry[peer_address] + delta))
            self.peer_registry[peer_address] = new_score
            return new_score
        return None

    def get_balance(self, address: str) -> float:
        """Returns the current balance of an address."""
        return self.ledger.get(address, 0.0)

    def update_balance(self, address: str, amount: float):
        """Updates the balance of an address in the local ledger."""
        current = self.ledger.get(address, 0.0)
        self.ledger[address] = current + amount

    def validate_and_add_transaction(self, transaction: Transaction) -> bool:
        """
        Validates a transaction against the ledger (checks double spend & balance)
        and adds it to the blockchain's pending list.
        """
        # 1. Basic structural validation
        if not transaction.signature:
            print(f"[{self.node_name}] Reject: Unsigned transaction.")
            return False

        # 2. Ledger validation (Prevent Double Spend)
        sender_balance = self.get_balance(transaction.sender)
        
        # Note: For 'CLAIM' or 'REWARD' transactions, sender balance might be 0, which is fine.
        # For 'TRANSFER', we must check if they have enough funds.
        if transaction.tx_type == "TRANSFER":
            if sender_balance < transaction.amount:
                print(f"[{self.node_name}] Reject: Insufficient funds for {transaction.sender}")
                return False

        # 3. Add to blockchain pending pool
        try:
            self.blockchain.add_transaction(transaction)
            return True
        except ValueError as e:
            print(f"[{self.node_name}] Reject: {e}")
            return False

    def mine_block(self, validator_trust_score: int = 100):
        """
        Creates a new block from pending transactions and updates the ledger state.
        In ZCP2O, 'mining' is actually 'validating and archiving'.
        """
        if not self.blockchain.pending_transactions:
            return None

        # Create the block
        new_block = self.blockchain.create_block()
        
        # Update Ledger State based on the new block's transactions
        for tx in new_block.transactions:
            # Deduct from sender (if transfer)
            if tx.tx_type == "TRANSFER":
                self.update_balance(tx.sender, -tx.amount)
            
            # Add to receiver
            self.update_balance(tx.receiver, tx.amount)
            
            # Reward the validator (Digital Bunker) - simplified for this phase
            # In production, this would be the 1% fee + block reward logic
            
        print(f"[{self.node_name}] Block #{new_block.index} validated and archived. "
              f"Transactions: {len(new_block.transactions)}")
        
        return new_block

    def is_chain_valid(self) -> bool:
        """Checks the integrity of the entire blockchain."""
        return self.blockchain.is_chain_valid(self.blockchain.chain)