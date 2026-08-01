"""
ZCP2O Node Networking Module.
Implements UDP-based peer-to-peer communication for offline-first mesh network.
"""

import socket
import json
import threading
import time
from typing import Dict, List, Callable, Optional
from datetime import datetime


class NetworkManager:
    """
    Manages P2P networking for Digital Bunker nodes.
    Uses UDP broadcast for local mesh communication (offline-first).
    """
    
    def __init__(self, node_address: str, port: int = 9999, broadcast_interval: int = 30):
        self.node_address = node_address
        self.port = port
        self.broadcast_interval = broadcast_interval
        
        # Socket setup
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        self.sock.settimeout(2.0)  # 2 second timeout
        
        # Peer management
        self.active_peers: Dict[str, Dict] = {}  # {address: {last_seen, trust_score}}
        self.message_handlers: Dict[str, Callable] = {}
        
        # Threading
        self.running = False
        self.listen_thread = None
        self.broadcast_thread = None
        
        print(f"[Network] Initialized on port {port}")
    
    def start(self):
        """Start listening for incoming messages and broadcasting presence."""
        self.running = True
        
        # Bind to port
        try:
            self.sock.bind(('0.0.0.0', self.port))
            print(f"[Network] Listening on port {self.port}")
        except OSError as e:
            print(f"[Network] Warning: Could not bind to port {self.port}: {e}")
            print("[Network] Running in limited mode (broadcast only)")
        
        # Start threads
        self.listen_thread = threading.Thread(target=self._listen_loop, daemon=True)
        self.broadcast_thread = threading.Thread(target=self._broadcast_loop, daemon=True)
        
        self.listen_thread.start()
        self.broadcast_thread.start()
        
        print(f"[Network] Started. Node: {self.node_address}")
    
    def stop(self):
        """Stop networking threads."""
        self.running = False
        if self.listen_thread:
            self.listen_thread.join(timeout=3)
        if self.broadcast_thread:
            self.broadcast_thread.join(timeout=3)
        self.sock.close()
        print(f"[Network] Stopped")
    
    def register_handler(self, message_type: str, handler: Callable):
        """Register a callback function for specific message types."""
        self.message_handlers[message_type] = handler
        print(f"[Network] Registered handler for: {message_type}")
    
    def broadcast_presence(self):
        """Broadcast node presence to local network."""
        presence_msg = {
            "type": "PRESENCE",
            "node_address": self.node_address,
            "timestamp": time.time(),
            "version": "1.0.0"
        }
        
        try:
            message = json.dumps(presence_msg).encode('utf-8')
            self.sock.sendto(message, ('<broadcast>', self.port))
            print(f"[Network] Broadcasted presence")
        except Exception as e:
            print(f"[Network] Broadcast error: {e}")
    
    def send_direct(self, target_address: str, message: Dict):
        """Send a message directly to a specific peer."""
        if target_address in self.active_peers:
            peer_info = self.active_peers[target_address]
            try:
                message['from'] = self.node_address
                message['timestamp'] = time.time()
                data = json.dumps(message).encode('utf-8')
                self.sock.sendto(data, (peer_info['ip'], self.port))
                print(f"[Network] Sent {message['type']} to {target_address}")
            except Exception as e:
                print(f"[Network] Send error: {e}")
        else:
            print(f"[Network] Peer {target_address} not in active peers")
    
    def broadcast_transaction(self, transaction_data: Dict):
        """Broadcast a transaction to all peers."""
        msg = {
            "type": "TRANSACTION",
            "data": transaction_data
        }
        self._broadcast_message(msg)
    
    def broadcast_block(self, block_data: Dict):
        """Broadcast a new block to all peers."""
        msg = {
            "type": "BLOCK",
            "data": block_data
        }
        self._broadcast_message(msg)
    
    def request_sync(self, target_address: str):
        """Request blockchain sync from a specific peer."""
        msg = {
            "type": "SYNC_REQUEST",
            "current_height": 0  # Will be filled by node
        }
        self.send_direct(target_address, msg)
    
    def _broadcast_message(self, message: Dict):
        """Broadcast a message to all active peers."""
        try:
            message['from'] = self.node_address
            message['timestamp'] = time.time()
            data = json.dumps(message).encode('utf-8')
            self.sock.sendto(data, ('<broadcast>', self.port))
        except Exception as e:
            print(f"[Network] Broadcast error: {e}")
    
    def _listen_loop(self):
        """Main listening loop for incoming messages."""
        while self.running:
            try:
                data, addr = self.sock.recvfrom(4096)
                message = json.loads(data.decode('utf-8'))
                self._handle_message(message, addr)
            except socket.timeout:
                continue
            except Exception as e:
                if self.running:
                    print(f"[Network] Listen error: {e}")
    
    def _broadcast_loop(self):
        """Periodic broadcast loop."""
        while self.running:
            self.broadcast_presence()
            time.sleep(self.broadcast_interval)
    
    def _handle_message(self, message: Dict, addr: tuple):
        """Handle incoming message."""
        msg_type = message.get('type')
        from_address = message.get('from')
        
        if from_address and from_address != self.node_address:
            # Update peer info
            self.active_peers[from_address] = {
                'ip': addr[0],
                'last_seen': time.time(),
                'trust_score': self.active_peers.get(from_address, {}).get('trust_score', 50)
            }
        
        # Call registered handler
        if msg_type in self.message_handlers:
            try:
                self.message_handlers[msg_type](message, addr)
            except Exception as e:
                print(f"[Network] Handler error for {msg_type}: {e}")
        else:
            print(f"[Network] No handler for message type: {msg_type}")
    
    def get_active_peers(self) -> List[str]:
        """Get list of active peer addresses."""
        # Clean up old peers (not seen in 5 minutes)
        current_time = time.time()
        expired_peers = [
            addr for addr, info in self.active_peers.items()
            if current_time - info['last_seen'] > 300
        ]
        for addr in expired_peers:
            del self.active_peers[addr]
        
        return list(self.active_peers.keys())
    
    def get_peer_count(self) -> int:
        """Get number of active peers."""
        return len(self.get_active_peers())