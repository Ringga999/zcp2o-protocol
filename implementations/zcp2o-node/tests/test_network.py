"""
Unit tests for the ZCP2O Network module.
"""

import pytest
import sys
import os
import time
import json

# Add parent directories to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from network import NetworkManager


@pytest.fixture
def network():
    """Creates a NetworkManager instance for testing."""
    net = NetworkManager("WKS-test_node_1", port=19999, broadcast_interval=2)
    yield net
    net.stop()


def test_network_initialization(network):
    """Test if network initializes correctly."""
    assert network.node_address == "WKS-test_node_1"
    assert network.port == 19999
    assert network.running is False


def test_register_handler(network):
    """Test registering message handlers."""
    handler_called = False
    
    def test_handler(message, addr):
        nonlocal handler_called
        handler_called = True
    
    network.register_handler("TEST_MESSAGE", test_handler)
    assert "TEST_MESSAGE" in network.message_handlers


def test_broadcast_presence(network):
    """Test broadcasting node presence."""
    network.start()
    time.sleep(0.5)
    
    # Should not raise exception
    network.broadcast_presence()
    time.sleep(0.5)
    
    network.stop()


def test_get_active_peers(network):
    """Test getting active peers list."""
    peers = network.get_active_peers()
    assert isinstance(peers, list)
    assert len(peers) == 0  # No peers initially


def test_get_peer_count(network):
    """Test getting peer count."""
    count = network.get_peer_count()
    assert count == 0


def test_message_handling(network):
    """Test handling incoming messages."""
    received_messages = []
    
    def capture_handler(message, addr):
        received_messages.append(message)
    
    network.register_handler("TEST", capture_handler)
    network.start()
    time.sleep(0.5)
    
    # Simulate incoming message
    test_message = {
        "type": "TEST",
        "from": "WKS-sender",
        "data": "test_data"
    }
    network._handle_message(test_message, ("127.0.0.1", 19999))
    
    assert len(received_messages) == 1
    assert received_messages[0]['type'] == "TEST"
    
    network.stop()


def test_peer_cleanup(network):
    """Test automatic cleanup of expired peers."""
    # Add a fake peer with old timestamp
    network.active_peers["WKS-old_peer"] = {
        'ip': '192.168.1.100',
        'last_seen': time.time() - 400,  # 400 seconds ago (> 300s threshold)
        'trust_score': 50
    }
    
    # Add a recent peer
    network.active_peers["WKS-recent_peer"] = {
        'ip': '192.168.1.101',
        'last_seen': time.time(),
        'trust_score': 80
    }
    
    # Get active peers should clean up old ones
    active = network.get_active_peers()
    
    assert "WKS-old_peer" not in active
    assert "WKS-recent_peer" in active