"""
ZCP2O Node Database Module.
Handles persistent storage of Blockchain, Ledger, and Peer Registry using SQLite.
"""

import sqlite3
import json
import os
import sys

# Setup path agar bisa mengimpor modul dari zcp2o-core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from zcp2o.block import Block
from zcp2o.transaction import Transaction


class DatabaseManager:
    """
    Manages SQLite database operations for the Digital Bunker.
    Ensures data persistence across node restarts.
    """

    def __init__(self, db_path="zcp2o_node.db"):
        """
        Initializes the database connection.
        Use db_path=':memory:' for testing (data will vanish when script ends).
        """
        self.db_path = db_path
        # check_same_thread=False allows sharing connection across threads if needed
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
        
        # Automatically create tables if they don't exist yet
        self.initialize_tables()

    def initialize_tables(self):
        """Creates necessary tables if they don't exist."""
        # 1. Blocks Table: Stores the blockchain history
        # NOTE: "index" is wrapped in quotes because it's a reserved SQL keyword
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS blocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                "index" INTEGER UNIQUE NOT NULL,
                hash TEXT NOT NULL,
                previous_hash TEXT NOT NULL,
                timestamp REAL NOT NULL,
                transactions_json TEXT NOT NULL
            )
        ''')

        # 2. Ledger Table: Stores current balances of all addresses
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS ledger (
                address TEXT PRIMARY KEY,
                balance REAL NOT NULL
            )
        ''')

        # 3. Peers Table: Stores known nodes and their trust scores
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS peers (
                address TEXT PRIMARY KEY,
                trust_score INTEGER NOT NULL
            )
        ''')
        
        self.conn.commit()

    # ==========================================
    # BLOCK OPERATIONS
    # ==========================================

    def save_block(self, block: Block):
        """Saves a new block to the database."""
        # Serialize transactions list into a JSON string to store in a single column
        tx_json = json.dumps([tx.to_dict() for tx in block.transactions])
        
        self.cursor.execute('''
            INSERT OR REPLACE INTO blocks ("index", hash, previous_hash, timestamp, transactions_json)
            VALUES (?, ?, ?, ?, ?)
        ''', (block.index, block.hash, block.previous_hash, block.timestamp, tx_json))
        self.conn.commit()

    def load_all_blocks(self) -> list:
        """Loads all blocks from the database and reconstructs Block objects."""
        self.cursor.execute('SELECT * FROM blocks ORDER BY "index" ASC')
        rows = self.cursor.fetchall()
        
        blocks = []
        for row in rows:
            # Deserialize JSON string back into a list of dictionaries
            tx_list = json.loads(row['transactions_json'])
            
            # Reconstruct Transaction objects from dictionaries
            transactions = [
                Transaction(
                    sender=tx['sender'],
                    receiver=tx['receiver'],
                    amount=tx['amount'],
                    timestamp=tx.get('timestamp'),
                    signature=tx.get('signature'),
                    tx_type=tx.get('tx_type', 'transfer')
                ) for tx in tx_list
            ]
            
            # Reconstruct Block object
            block = Block(
                index=row['index'],
                transactions=transactions,
                previous_hash=row['previous_hash']
            )
            # Override calculated hash/timestamp with stored ones to ensure exact integrity
            block.hash = row['hash']
            block.timestamp = row['timestamp']
            
            blocks.append(block)
            
        return blocks

    # ==========================================
    # LEDGER OPERATIONS
    # ==========================================

    def update_ledger(self, address: str, balance: float):
        """Inserts or updates a balance in the ledger."""
        self.cursor.execute('''
            INSERT INTO ledger (address, balance)
            VALUES (?, ?)
            ON CONFLICT(address) DO UPDATE SET balance=excluded.balance
        ''', (address, balance))
        self.conn.commit()

    def load_all_ledger(self) -> dict:
        """Loads the entire ledger state into a dictionary."""
        self.cursor.execute('SELECT * FROM ledger')
        return {row['address']: row['balance'] for row in self.cursor.fetchall()}

    # ==========================================
    # PEER OPERATIONS
    # ==========================================

    def update_peer(self, address: str, trust_score: int):
        """Inserts or updates a peer's trust score."""
        self.cursor.execute('''
            INSERT INTO peers (address, trust_score)
            VALUES (?, ?)
            ON CONFLICT(address) DO UPDATE SET trust_score=excluded.trust_score
        ''', (address, trust_score))
        self.conn.commit()

    def load_all_peers(self) -> dict:
        """Loads the entire peer registry into a dictionary."""
        self.cursor.execute('SELECT * FROM peers')
        return {row['address']: row['trust_score'] for row in self.cursor.fetchall()}

    def close(self):
        """Closes the database connection safely."""
        self.conn.close()