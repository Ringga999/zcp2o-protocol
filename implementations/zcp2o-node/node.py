"""
ZCP2O Node Module (Digital Bunker).
Represents a Full Node that manages the blockchain, peer trust scores, and ledger state.
Features professional logging, UDP mesh networking, Async Sync, Fork Resolution, and SQLite Persistence.
"""

from typing import Dict, List, Optional, Tuple
import time
import sys
import os
import json

# Setup path agar bisa mengimpor modul dari zcp2o-core dan folder yang sama
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from zcp2o.blockchain import Blockchain
from zcp2o.transaction import Transaction
from zcp2o.wallet import Wallet
from network import NetworkManager
from logger import get_logger
from database import DatabaseManager


class DigitalBunker:
    """
    Represents a Full Node (Digital Bunker) in the ZCP2O network.
    """

    def __init__(self, node_name: str, enable_networking: bool = False, port: int = 9999, db_path: str = "zcp2o_node.db"):
        self.node_name = node_name
        
        # Initialize Professional Logger
        self.logger = get_logger(node_name)
        
        # Initialize Database for Persistence (The "Long-term Memory")
        self.db = DatabaseManager(db_path)
        
        # Initialize In-Memory State (The "Working Memory")
        self.blockchain = Blockchain()
        self.ledger: Dict[str, float] = {}
        self.peer_registry: Dict[str, int] = {}
        self.syncing_peers: Dict[str, bool] = {}
        
        # STATE RECOVERY: Check if database has existing data
        db_blocks = self.db.load_all_blocks()
        
        if db_blocks:
            # Database has data - load it
            self.blockchain.chain = db_blocks
            self.logger.info(f"Loaded {len(db_blocks)} blocks from database.")
        else:
            # Fresh database - save Genesis Block
            self.db.save_block(self.blockchain.chain[0])
            self.logger.info("Genesis Block saved to database.")
        
        # Load Ledger and Peers
        self.ledger = self.db.load_all_ledger()
        self.peer_registry = self.db.load_all_peers()
        
        # Initialize the node's own wallet
        self.wallet = Wallet.create()
        self.address = self.wallet.address
        
        # Networking (optional)
        self.network = None
        if enable_networking:
            self.network = NetworkManager(self.address, port=port)
            self._setup_network_handlers()
        
        self.logger.info(f"Digital Bunker initialized at {self.address}")
        self.logger.info(f"Node Name: {node_name} | Networking: {enable_networking} | DB: {db_path}")
        self.logger.info(f"State Recovery: Loaded {len(self.blockchain.chain)} blocks, {len(self.ledger)} accounts, {len(self.peer_registry)} peers.")

    def _setup_network_handlers(self):
        """Setup network message handlers."""
        if self.network:
            self.network.register_handler("TRANSACTION", self._handle_transaction)
            self.network.register_handler("BLOCK", self._handle_block)
            self.network.register_handler("SYNC_REQUEST", self._handle_sync_request)
            self.network.register_handler("SYNC_RESPONSE", self._handle_sync_response)
            self.network.register_handler("PRESENCE", self._handle_presence)
    
    def start_networking(self):
        """Start the networking layer."""
        if self.network:
            self.network.start()
            self.logger.info(f"Networking started on port {self.network.port}")
    
    def stop_networking(self):
        """Stop the networking layer."""
        if self.network:
            self.network.stop()
            self.logger.info("Networking stopped")
    
    def get_active_peers(self) -> List[str]:
        """Get list of active network peers."""
        if self.network:
            return self.network.get_active_peers()
        return []
    
    def register_peer(self, peer_address: str, initial_trust_score: int = 50):
        """Adds a new node to the trusted peer registry."""
        if peer_address not in self.peer_registry:
            self.peer_registry[peer_address] = initial_trust_score
            self.db.update_peer(peer_address, initial_trust_score) # PERSIST TO DISK
            self.logger.info(f"Peer registered: {peer_address} (Trust: {initial_trust_score})")

    def update_trust_score(self, peer_address: str, delta: int):
        """Increases or decreases a peer's trust score based on behavior."""
        if peer_address in self.peer_registry:
            new_score = max(0, min(100, self.peer_registry[peer_address] + delta))
            self.peer_registry[peer_address] = new_score
            self.db.update_peer(peer_address, new_score) # PERSIST TO DISK
            self.logger.debug(f"Trust score updated for {peer_address}: {new_score}")
            return new_score
        return None

    def get_balance(self, address: str) -> float:
        """Returns the current balance of an address."""
        return self.ledger.get(address, 0.0)

    def update_balance(self, address: str, amount: float):
        """Updates the balance of an address in the local ledger and database."""
        current = self.ledger.get(address, 0.0)
        new_balance = current + amount
        self.ledger[address] = new_balance
        self.db.update_ledger(address, new_balance) # PERSIST TO DISK

    def validate_and_add_transaction(self, transaction: Transaction) -> bool:
        """
        Validates a transaction against the ledger (checks double spend & balance)
        and adds it to the blockchain's pending list.
        """
        if not transaction.signature:
            self.logger.warning(f"Reject: Unsigned transaction from {transaction.sender}")
            return False

        sender_balance = self.get_balance(transaction.sender)
        
        if transaction.tx_type == "TRANSFER":
            if sender_balance < transaction.amount:
                self.logger.error(f"Reject: Insufficient funds for {transaction.sender} (Balance: {sender_balance}, Required: {transaction.amount})")
                return False

        try:
            self.blockchain.add_transaction(transaction)
            self.logger.info(f"Transaction accepted: {transaction.amount} WEEKS from {transaction.sender[:16]}...")
            
            if self.network:
                self.network.broadcast_transaction(transaction.to_dict())
            
            return True
        except ValueError as e:
            self.logger.error(f"Reject: {e}")
            return False

    def mine_block(self, validator_trust_score: int = 100):
        """
        Creates a new block from pending transactions and updates the ledger state.
        """
        if not self.blockchain.pending_transactions:
            return None

        new_block = self.blockchain.create_block()
        
        # PERSIST THE NEW BLOCK TO DISK IMMEDIATELY
        self.db.save_block(new_block)
        
        for tx in new_block.transactions:
            if tx.tx_type == "TRANSFER":
                self.update_balance(tx.sender, -tx.amount) # update_balance handles persistence
            self.update_balance(tx.receiver, tx.amount)    # update_balance handles persistence
            
        self.logger.info(f"Block #{new_block.index} validated and archived. Transactions: {len(new_block.transactions)}")
        
        if self.network:
            self.network.broadcast_block(new_block.to_dict())
        
        return new_block

    def is_chain_valid(self) -> bool:
        """Checks the integrity of the entire blockchain."""
        return self.blockchain.is_chain_valid(self.blockchain.chain)
    
    def _is_chain_structurally_valid(self, chain: List) -> bool:
        """Check if a chain has valid structural links (hash chaining)."""
        if not chain:
            return False
        
        # Check genesis block
        if chain[0].index != 0 or chain[0].previous_hash != "0" * 64:
            return False
        
        # Check all subsequent blocks
        for i in range(1, len(chain)):
            current_block = chain[i]
            previous_block = chain[i - 1]
            
            if current_block.previous_hash != previous_block.hash:
                return False
            
            if not current_block.is_hash_valid():
                return False
        
        return True
    
    # ============================================
    # FORK RESOLUTION IMPLEMENTATION
    # ============================================
    
    def calculate_cumulative_trust_weight(self, chain: List) -> int:
        """Calculate the cumulative trust weight of a blockchain."""
        cumulative_weight = 0
        for block in chain:
            validator_sigs = block.to_dict().get('validator_signatures', [])
            if validator_sigs:
                for sig in validator_sigs:
                    validator_address = sig.get('node_pk', '')
                    trust_score = self.peer_registry.get(validator_address, 50)
                    cumulative_weight += trust_score
            else:
                cumulative_weight += 50
        return cumulative_weight
    
    def resolve_fork(self, local_chain: List, remote_chain: List) -> List:
        """Resolve a fork between local and remote chains."""
        local_weight = self.calculate_cumulative_trust_weight(local_chain)
        remote_weight = self.calculate_cumulative_trust_weight(remote_chain)
        
        self.logger.info(f"Fork resolution: Local weight={local_weight}, Remote weight={remote_weight}")
        
        if remote_weight > local_weight:
            return remote_chain
        elif local_weight > remote_weight:
            return local_chain
        
        if len(remote_chain) > len(local_chain):
            return remote_chain
        elif len(local_chain) > len(remote_chain):
            return local_chain
        
        return local_chain
    
    def apply_fork_resolution(self, remote_chain: List):
        """Apply fork resolution with a remote chain."""
        winning_chain = self.resolve_fork(self.blockchain.chain, remote_chain)
        
        if winning_chain is remote_chain:
            self.logger.warning("Fork resolution: Replacing local chain with remote chain")
            self.blockchain.chain = remote_chain
            self._rebuild_ledger_from_chain()
            self.logger.info(f"Fork resolution: Chain replaced. New height: {len(remote_chain) - 1}")
        else:
            self.logger.info("Fork resolution: Keeping local chain")
    
    def _rebuild_ledger_from_chain(self):
        """Rebuild the ledger state from the current blockchain."""
        self.ledger.clear()
        for block in self.blockchain.chain:
            for tx in block.transactions:
                if tx.tx_type == "TRANSFER":
                    self.update_balance(tx.sender, -tx.amount)
                self.update_balance(tx.receiver, tx.amount)
        self.logger.info(f"Ledger rebuilt from chain. Accounts: {len(self.ledger)}")
    
    # ============================================
    # ASYNC SYNC IMPLEMENTATION
    # ============================================
    
    def request_sync(self, target_peer: str):
        """Request blockchain sync from a specific peer."""
        if target_peer in self.syncing_peers and self.syncing_peers[target_peer]:
            self.logger.warning(f"Already syncing with {target_peer}")
            return
        
        self.syncing_peers[target_peer] = True
        
        sync_request = {
            "type": "SYNC_REQUEST",
            "current_height": len(self.blockchain.chain) - 1,
            "last_block_hash": self.blockchain.last_block.hash if self.blockchain.chain else "0" * 64
        }
        
        if self.network:
            self.network.send_direct(target_peer, sync_request)
            self.logger.info(f"Sent sync request to {target_peer} (height: {sync_request['current_height']})")
    
    def _handle_sync_request(self, message: Dict, addr: tuple):
        """Handle incoming sync request from peer."""
        peer_address = message.get('from')
        their_height = message.get('current_height', 0)
        our_height = len(self.blockchain.chain) - 1
        
        self.logger.info(f"Sync request from {peer_address} (their height: {their_height}, our height: {our_height})")
        
        if their_height >= our_height:
            response = {
                "type": "SYNC_RESPONSE",
                "status": "up_to_date",
                "our_height": our_height,
                "blocks": []
            }
        else:
            blocks_to_send = []
            for i in range(their_height + 1, our_height + 1):
                if i < len(self.blockchain.chain):
                    blocks_to_send.append(self.blockchain.chain[i].to_dict())
            
            response = {
                "type": "SYNC_RESPONSE",
                "status": "syncing",
                "our_height": our_height,
                "blocks": blocks_to_send,
                "ledger_snapshot": self.ledger
            }
            self.logger.info(f"Sending {len(blocks_to_send)} blocks to {peer_address}")
        
        if self.network and peer_address:
            self.network.send_direct(peer_address, response)
    
    def _handle_sync_response(self, message: Dict, addr: tuple):
        """Handle sync response from peer."""
        peer_address = message.get('from')
        status = message.get('status')
        
        if status == "up_to_date":
            self.logger.info(f"Already synced with {peer_address}")
            if peer_address in self.syncing_peers:
                self.syncing_peers[peer_address] = False
            return
        
        if status == "syncing":
            blocks = message.get('blocks', [])
            ledger_snapshot = message.get('ledger_snapshot', {})
            
            self.logger.info(f"Receiving {len(blocks)} blocks from {peer_address}")
            
            for block_data in blocks:
                self._apply_incoming_block(block_data)
            
            self._merge_ledger(ledger_snapshot, peer_address)
            
            self.logger.info(f"Sync completed with {peer_address}. Chain height: {len(self.blockchain.chain) - 1}")
            
            if peer_address in self.syncing_peers:
                self.syncing_peers[peer_address] = False
            
            self.update_trust_score(peer_address, +5)
    
    def _apply_incoming_block(self, block_data: Dict):
        """Apply a received block to our chain."""
        from zcp2o.block import Block
        
        new_block = Block.from_json(json.dumps(block_data))
        
        if not new_block.is_hash_valid():
            self.logger.error(f"Reject: Invalid block hash from peer")
            return False
        
        self.blockchain.chain.append(new_block)
        self.db.save_block(new_block) # PERSIST INCOMING BLOCK TO DISK
        
        for tx_data in block_data.get('transactions', []):
            tx = Transaction(
                sender=tx_data['sender'],
                receiver=tx_data['receiver'],
                amount=tx_data['amount'],
                timestamp=tx_data.get('timestamp'),
                signature=tx_data.get('signature'),
                tx_type=tx_data.get('tx_type', 'transfer')
            )
            
            if tx.tx_type == "TRANSFER":
                self.update_balance(tx.sender, -tx.amount)
            self.update_balance(tx.receiver, tx.amount)
        
        self.logger.info(f"Applied block #{new_block.index} from peer")
        return True
    
    def _merge_ledger(self, remote_ledger: Dict[str, float], peer_address: str):
        """Merge remote ledger state with our local state."""
        peer_trust = self.peer_registry.get(peer_address, 50)
        conflicts_resolved = 0
        
        for address, remote_balance in remote_ledger.items():
            local_balance = self.ledger.get(address, 0.0)
            
            if local_balance != remote_balance:
                conflicts_resolved += 1
                if peer_trust > 70:
                    self.ledger[address] = remote_balance
                    self.db.update_ledger(address, remote_balance) # PERSIST RESOLVED CONFLICT
                    self.logger.info(f"Resolved conflict for {address[:16]}...: {local_balance} -> {remote_balance} (trusted peer)")
                else:
                    self.logger.warning(f"Ignored conflict for {address[:16]}... from low-trust peer ({peer_trust})")
        
        if conflicts_resolved > 0:
            self.logger.info(f"Ledger merge complete: {conflicts_resolved} conflicts resolved")
    
    # Network message handlers
    def _handle_transaction(self, message: Dict, addr: tuple):
        self.logger.info(f"Received transaction from network")
    
    def _handle_block(self, message: Dict, addr: tuple):
        self.logger.info(f"Received block from network")
    
    def _handle_presence(self, message: Dict, addr: tuple):
        peer_addr = message.get('node_address')
        if peer_addr and peer_addr != self.address:
            self.logger.info(f"Peer discovered: {peer_addr}")
            if peer_addr not in self.peer_registry:
                self.register_peer(peer_addr, initial_trust_score=50)
                self.request_sync(peer_addr)