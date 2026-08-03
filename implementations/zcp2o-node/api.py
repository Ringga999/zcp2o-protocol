"""
ZCP2O Node REST API Module.
Exposes Digital Bunker functions via HTTP using FastAPI.
"""

import sys
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

# ==========================================
# FIX PATH SETUP FOR API
# ==========================================
# Get the directory of the current file (zcp2o-node)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Add current directory to path so we can import 'node'
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
# ==========================================

from node import DigitalBunker

# ==========================================
# 1. INITIALIZATION & STATE MANAGEMENT
# ==========================================

app = FastAPI(
    title="ZCP2O Digital Bunker API",
    description="REST API for interacting with the ZCP2O offline-first blockchain node.",
    version="1.0.0"
)

# Global variable to hold the running node instance
bunker: Optional[DigitalBunker] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the Digital Bunker when the API server starts."""
    global bunker
    print("🚀 Starting ZCP2O Digital Bunker API...")
    # Initialize node with networking disabled for this API demo, using default DB
    bunker = DigitalBunker("API_Bunker", enable_networking=False, db_path="zcp2o_node.db")
    print(f"✅ Node initialized at {bunker.address}")

# ==========================================
# 2. DATA MODELS (Pydantic)
# ==========================================

class TransferRequest(BaseModel):
    """Model for incoming transfer requests."""
    sender_address: str
    receiver_address: str
    amount: float
    # In a real production API, we would also require a cryptographic signature here
    # signature: str 

class PeerResponse(BaseModel):
    address: str
    trust_score: int

# ==========================================
# 3. API ENDPOINTS
# ==========================================

@app.get("/")
async def root():
    """Health check and basic node info."""
    if not bunker:
        raise HTTPException(status_code=503, detail="Node is not initialized yet.")
    
    return {
        "status": "online",
        "node_address": bunker.address,
        "chain_height": len(bunker.blockchain.chain) - 1,
        "active_peers": len(bunker.peer_registry)
    }

@app.get("/balance/{address}")
async def get_balance(address: str):
    """Check the $WEEKS balance of a specific address."""
    if not bunker:
        raise HTTPException(status_code=503, detail="Node is not initialized yet.")
        
    balance = bunker.get_balance(address)
    return {
        "address": address,
        "balance": balance,
        "currency": "$WEEKS"
    }

@app.post("/transfer")
async def create_transfer(request: TransferRequest):
    """
    Create and validate a new transfer transaction.
    Note: This is a simplified endpoint. Production requires signature verification.
    """
    if not bunker:
        raise HTTPException(status_code=503, detail="Node is not initialized yet.")

    # Basic validation
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive.")

    # Create a mock transaction object (In production, we'd deserialize from JSON/Signature)
    # For this API demo, we simulate the validation logic
    sender_balance = bunker.get_balance(request.sender_address)
    
    if sender_balance < request.amount:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient funds. Balance: {sender_balance}, Required: {request.amount}"
        )

    # In a real scenario, we would create a Transaction object, sign it, and call:
    # bunker.validate_and_add_transaction(tx)
    
    # Simulating success for the API structure demo
    return {
        "status": "accepted",
        "message": f"Transaction of {request.amount} $WEEKS from {request.sender_address[:16]}... to {request.receiver_address[:16]}... is being processed.",
        "new_sender_balance": sender_balance - request.amount
    }

@app.get("/chain/height")
async def get_chain_height():
    """Get the current height of the blockchain."""
    if not bunker:
        raise HTTPException(status_code=503, detail="Node is not initialized yet.")
        
    return {
        "height": len(bunker.blockchain.chain) - 1,
        "total_blocks": len(bunker.blockchain.chain)
    }

@app.get("/peers")
async def get_peers():
    """List all known peers and their trust scores."""
    if not bunker:
        raise HTTPException(status_code=503, detail="Node is not initialized yet.")
        
    peers = [
        {"address": addr, "trust_score": score} 
        for addr, score in bunker.peer_registry.items()
    ]
    return {"peers": peers, "total": len(peers)}

# ==========================================
# 4. RUN SERVER
# ==========================================

if __name__ == "__main__":
    # Run the API server on port 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)