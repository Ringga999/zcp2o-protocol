"""
ZCP2O Node Module (Digital Bunker).
Represents a Full Node that manages the blockchain, peer trust scores, and ledger state.
"""

from typing import Dict, List, Optional, Tuple
import time
import sys
import os
import json

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from zcp2o.blockchain import Blockchain
from zcp2o.transaction import Transaction
from zcp2o.wallet import Wallet
from network import NetworkManager


class DigitalBunker:
    """
    Represents a Full Node (Digital Bunker) in the ZCP2O network.
    It maintains the full blockchain, a ledger of balances, and a registry of trusted peers.
    """

    def __init__(self, node_name: str, enable_networking: bool = False, port: int = 9999):
        self.node_name = node_name
        self.blockchain = Blockchain()
        
        # Ledger State: Tracks balances to prevent double spending
        self.ledger: Dict[str, float] = {}
        
        # Peer Registry: Tracks Trust Scores of other nodes
        self.peer_registry: Dict[str, int] = {}
        
        # Initialize the node's own wallet
        self.wallet = Wallet.create()
        self.address = self.wallet.address
        
        # Sync State: Tracks sync progress with peers
        self.syncing_peers: Dict[str, bool] = {}  # {peer_address: is_syncing}
        
        # Networking (optional)
        self.network = None
        if enable_networking:
            self.network = NetworkManager(self.address, port=port)
            self._setup_network_handlers()
        
        print(f"[{self.node_name}] Digital Bunker initialized at {self.address}")

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
            print(f"[{self.node_name}] Networking started on port {self.network.port}")
    
    def stop_networking(self):
        """Stop the networking layer."""
        if self.network:
            self.network.stop()
            print(f"[{self.node_name}] Networking stopped")
    
    def get_active_peers(self) -> List[str]:
        """Get list of active network peers."""
        if self.network:
            return self.network.get_active_peers()
        return []
    
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
        
        if transaction.tx_type == "TRANSFER":
            if sender_balance < transaction.amount:
                print(f"[{self.node_name}] Reject: Insufficient funds for {transaction.sender}")
                return False

        # 3. Add to blockchain pending pool
        try:
            self.blockchain.add_transaction(transaction)
            
            # Broadcast to network if enabled
            if self.network:
                self.network.broadcast_transaction(transaction.to_dict())
            
            return True
        except ValueError as e:
            print(f"[{self.node_name}] Reject: {e}")
            return False

    def mine_block(self, validator_trust_score: int = 100):
        """
        Creates a new block from pending transactions and updates the ledger state.
        """
        if not self.blockchain.pending_transactions:
            return None

        # Create the block
        new_block = self.blockchain.create_block()
        
        # Update Ledger State
        for tx in new_block.transactions:
            if tx.tx_type == "TRANSFER":
                self.update_balance(tx.sender, -tx.amount)
            self.update_balance(tx.receiver, tx.amount)
            
        print(f"[{self.node_name}] Block #{new_block.index} validated and archived. "
              f"Transactions: {len(new_block.transactions)}")
        
        # Broadcast block to network
        if self.network:
            self.network.broadcast_block(new_block.to_dict())
        
        return new_block

    def is_chain_valid(self) -> bool:
        """Checks the integrity of the entire blockchain."""
        return self.blockchain.is_chain_valid(self.blockchain.chain)
    
    # ============================================
    # ASYNC SYNC IMPLEMENTATION
    # ============================================
    
    def request_sync(self, target_peer: str):
        """
        Request blockchain sync from a specific peer.
        This is the ASYNC part - we sync when we meet, not continuously.
        """
        if target_peer in self.syncing_peers and self.syncing_peers[target_peer]:
            print(f"[{self.node_name}] Already syncing with {target_peer}")
            return
        
        self.syncing_peers[target_peer] = True
        
        sync_request = {
            "type": "SYNC_REQUEST",
            "current_height": len(self.blockchain.chain) - 1,
            "last_block_hash": self.blockchain.last_block.hash if self.blockchain.chain else "0" * 64
        }
        
        if self.network:
            self.network.send_direct(target_peer, sync_request)
            print(f"[{self.node_name}] Sent sync request to {target_peer} (height: {sync_request['current_height']})")
    
    def _handle_sync_request(self, message: Dict, addr: tuple):
        """
        Handle incoming sync request from peer.
        Send them our blockchain data if they're behind.
        """
        peer_address = message.get('from')
        their_height = message.get('current_height', 0)
        our_height = len(self.blockchain.chain) - 1
        
        print(f"[{self.node_name}] Sync request from {peer_address} (their height: {their_height}, our height: {our_height})")
        
        if their_height >= our_height:
            # They're up to date or ahead, nothing to send
            response = {
                "type": "SYNC_RESPONSE",
                "status": "up_to_date",
                "our_height": our_height,
                "blocks": []
            }
        else:
            # Send them missing blocks
            blocks_to_send = []
            for i in range(their_height + 1, our_height + 1):
                if i < len(self.blockchain.chain):
                    blocks_to_send.append(self.blockchain.chain[i].to_dict())
            
            response = {
                "type": "SYNC_RESPONSE",
                "status": "syncing",
                "our_height": our_height,
                "blocks": blocks_to_send,
                "ledger_snapshot": self.ledger  # Send current balance state
            }
            
            print(f"[{self.node_name}] Sending {len(blocks_to_send)} blocks to {peer_address}")
        
        if self.network and peer_address:
            self.network.send_direct(peer_address, response)
    
    def _handle_sync_response(self, message: Dict, addr: tuple):
        """
        Handle sync response from peer.
        Apply their blocks to our chain.
        """
        peer_address = message.get('from')
        status = message.get('status')
        
        if status == "up_to_date":
            print(f"[{self.node_name}] Already synced with {peer_address}")
            if peer_address in self.syncing_peers:
                self.syncing_peers[peer_address] = False
            return
        
        if status == "syncing":
            blocks = message.get('blocks', [])
            ledger_snapshot = message.get('ledger_snapshot', {})
            
            print(f"[{self.node_name}] Receiving {len(blocks)} blocks from {peer_address}")
            
            # Apply each block
            for block_data in blocks:
                self._apply_incoming_block(block_data)
            
            # Merge ledger state (resolve conflicts)
            self._merge_ledger(ledger_snapshot, peer_address)
            
            print(f"[{self.node_name}] Sync completed with {peer_address}. Chain height: {len(self.blockchain.chain) - 1}")
            
            if peer_address in self.syncing_peers:
                self.syncing_peers[peer_address] = False
            
            # Increase trust score for helpful peer
            self.update_trust_score(peer_address, +5)
    
    def _apply_incoming_block(self, block_data: Dict):
        """Apply a received block to our chain."""
        from zcp2o.block import Block
        
        # Deserialize block
        new_block = Block.from_json(json.dumps(block_data))
        
        # Validate block hash
        if not new_block.is_hash_valid():
            print(f"[{self.node_name}] Reject: Invalid block hash from peer")
            return False
        
        # Check if block links to our last block
        if self.blockchain.chain:
            last_block = self.blockchain.last_block
            if new_block.previous_hash != last_block.hash:
                print(f"[{self.node_name}] Warning: Block hash mismatch, attempting resolution")
                # In production: implement fork resolution logic
        
        # Add to chain
        self.blockchain.chain.append(new_block)
        
        # Update ledger from block transactions
        for tx_data in block_data.get('transactions', []):
            tx = Transaction(
                sender=tx_data['sender'],
                receiver=tx_data['receiver'],
                amount=tx_data['amount'],
                timestamp=tx_data.get('timestamp'),
                signature=tx_data.get('signature'),
                tx_type=tx_data.get('tx_type', 'transfer')
            )
            
            # Update balances
            if tx.tx_type == "TRANSFER":
                self.update_balance(tx.sender, -tx.amount)
            self.update_balance(tx.receiver, tx.amount)
        
        print(f"[{self.node_name}] Applied block #{new_block.index} from peer")
        return True
    
    def _merge_ledger(self, remote_ledger: Dict[str, float], peer_address: str):
        """
        Merge remote ledger state with our local state.
        Resolve conflicts using trust-weighted consensus.
        """
        peer_trust = self.peer_registry.get(peer_address, 50)
        
        conflicts_resolved = 0
        
        for address, remote_balance in remote_ledger.items():
            local_balance = self.ledger.get(address, 0.0)
            
            if local_balance != remote_balance:
                # Conflict detected!
                conflicts_resolved += 1
                
                # Trust-weighted resolution:
                # If peer has high trust score, prefer their state
                if peer_trust > 70:
                    self.ledger[address] = remote_balance
                    print(f"[{self.node_name}] Resolved conflict for {address[:16]}...: {local_balance} → {remote_balance} (trusted peer)")
                else:
                    # Keep local state for low-trust peers
                    print(f"[{self.node_name}] Ignored conflict for {address[:16]}... from low-trust peer ({peer_trust})")
        
        if conflicts_resolved > 0:
            print(f"[{self.node_name}] Ledger merge complete: {conflicts_resolved} conflicts resolved")
    
    # Network message handlers
    def _handle_transaction(self, message: Dict, addr: tuple):
        """Handle incoming transaction from network."""
        print(f"[{self.node_name}] Received transaction from network")
        # In production: validate and add to pending pool
    
    def _handle_block(self, message: Dict, addr: tuple):
        """Handle incoming block from network."""
        print(f"[{self.node_name}] Received block from network")
        # In production: validate and add to chain
    
    def _handle_presence(self, message: Dict, addr: tuple):
        """Handle presence broadcast from peer."""
        peer_addr = message.get('node_address')
        if peer_addr and peer_addr != self.address:
            print(f"[{self.node_name}] Peer discovered: {peer_addr}")
            if peer_addr not in self.peer_registry:
                self.register_peer(peer_addr, initial_trust_score=50)
                # Auto-request sync when discovering new peer
                self.request_sync(peer_addr)