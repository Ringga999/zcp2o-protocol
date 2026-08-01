"""
Unit tests for the ZCP2O CLI module.
"""

import pytest
import sys
import os
import subprocess
import json
from pathlib import Path

# Add parent directories to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Add zcp2o-core to path
core_dir = os.path.abspath(os.path.join(parent_dir, '../zcp2o-core'))
sys.path.insert(0, core_dir)

# Add zcp2o-node to path
node_dir = os.path.abspath(os.path.join(parent_dir, '../zcp2o-node'))
sys.path.insert(0, node_dir)


def test_cli_help():
    """Test that CLI shows help message."""
    result = subprocess.run(
        [sys.executable, os.path.join(parent_dir, 'cli.py'), 'help'],
        capture_output=True,
        text=True
    )
    
    assert result.returncode == 0
    assert "ZCP2O Command Line Interface" in result.stdout
    assert "create-wallet" in result.stdout


def test_cli_create_wallet():
    """Test creating a wallet via CLI."""
    wallet_name = "test_wallet_cli"
    
    result = subprocess.run(
        [sys.executable, os.path.join(parent_dir, 'cli.py'), 'create-wallet', '--name', wallet_name],
        capture_output=True,
        text=True
    )
    
    assert result.returncode == 0
    assert "Wallet saved" in result.stdout
    assert "Address: WKS-" in result.stdout
    
    # Check if wallet file was created
    wallet_path = Path.home() / ".zcp2o" / "wallets" / f"{wallet_name}.json"
    assert wallet_path.exists()
    
    # Clean up
    wallet_path.unlink()


def test_cli_node_status():
    """Test showing node status via CLI."""
    result = subprocess.run(
        [sys.executable, os.path.join(parent_dir, 'cli.py'), 'node-status'],
        capture_output=True,
        text=True
    )
    
    assert result.returncode == 0
    assert "Node Status" in result.stdout
    assert "Chain Length" in result.stdout


def test_cli_balance():
    """Test checking balance via CLI."""
    result = subprocess.run(
        [sys.executable, os.path.join(parent_dir, 'cli.py'), 'balance', '--address', 'WKS-test123'],
        capture_output=True,
        text=True
    )
    
    assert result.returncode == 0
    assert "Balance:" in result.stdout


def test_cli_no_command():
    """Test that CLI shows help when no command is given."""
    result = subprocess.run(
        [sys.executable, os.path.join(parent_dir, 'cli.py')],
        capture_output=True,
        text=True
    )
    
    # Should exit with error code 1
    assert result.returncode == 1
    assert "usage:" in result.stderr.lower() or "ZCP2O" in result.stdout