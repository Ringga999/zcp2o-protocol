# ==========================================
# ZCP2O Node REST API Module
# Exposes Digital Bunker functions via HTTP using FastAPI.
# v1.1 — Hardening: auth, rate-limit, CORS, security headers
# ==========================================

import sys
import os
import time
import hmac
import uvicorn
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
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
    version="1.1.0"
)

# ==========================================
# 🔒 HARDENING v1 — ENV CONFIG
# ==========================================
ZCP2O_API_KEY    = os.environ.get("ZCP2O_API_KEY", "")           # kosong = mode dev
ZCP2O_RATE_LIMIT = int(os.environ.get("ZCP2O_RATE_LIMIT", "30")) # req/menit per IP
ZCP2O_CORS       = os.environ.get(
    "ZCP2O_CORS",
    "https://ringga999.github.io"
).split(",")
_rate = defaultdict(list)  # in-memory rate-limit store

# CORS: izinkan hanya origin yang kita set
app.add_middleware(
    CORSMiddleware,
    allow_origins=ZCP2O_CORS,
    allow_methods=["GET", "POST"],
    allow_headers=["X-API-Key", "Content-Type"],
)

@app.middleware("http")
async def zcp2o_harden(request: Request, call_next):
    """Rate-limit per IP + security response headers."""
    ip = request.client.host if request.client else "?"
    now = time.time()
    hits = [t for t in _rate[ip] if now - t < 60]
    hits.append(now)
    _rate[ip] = hits
    if len(hits) > ZCP2O_RATE_LIMIT:
        return JSONResponse({"detail": "Rate limit exceeded"}, status_code=429)

    resp = await call_next(request)
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Cache-Control"] = "no-store"
    return resp

def require_api_key(request: Request):
    """Wajibkan header X-API-Key jika ZCP2O_API_KEY diset."""
    if ZCP2O_API_KEY and not hmac.compare_digest(
        request.headers.get("X-API-Key", ""), ZCP2O_API_KEY
    ):
        raise HTTPException(status_code=401, detail="Invalid API key")

# ==========================================
# Global variable to hold the running node instance
bunker: Optional[DigitalBunker] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the Digital Bunker when the API server starts."""
    global bunker
    print("🚀 Starting ZCP2O Digital Bunker API (v1.1 hardened)...")
    bunker = DigitalBunker("API_Bunker", enable_networking=False, db_path="zcp2o_node.db")
    print(f"✅ Node initialized at {bunker.address}")
    print(f"🔒 Hardening: API_KEY={'set' if ZCP2O_API_KEY else 'off'}, "
          f"Rate={ZCP2O_RATE_LIMIT}/min, CORS={ZCP2O_CORS}")

# ==========================================
# 2. DATA MODELS (Pydantic)
# ==========================================

class TransferRequest(BaseModel):
    sender_address: str
    receiver_address: str
    amount: float
    # TODO (v2): signature: str — ditutup di hardening v1.1 signature-verify

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
        "active_peers": len(bunker.peer_registry),
        "version": "1.1.0-hardened"
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
async def create_transfer(request: TransferRequest, req: Request):
    """
    Create and validate a new transfer transaction.
    Hardened: requires X-API-Key if ZCP2O_API_KEY diset.
    """
    import os as _os
    if _os.environ.get("ZCP2O_ENABLE_TRANSFER", "0") != "1":
        raise HTTPException(status_code=403, detail="Transfer disabled (sovereign auth v2 scope-split)")
    require_api_key(req)  # 🔒 auth gate

    if not bunker:
        raise HTTPException(status_code=503, detail="Node is not initialized yet.")

    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive.")

    sender_balance = bunker.get_balance(request.sender_address)
    if sender_balance < request.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient funds. Balance: {sender_balance}, Required: {request.amount}"
        )

    # TODO (v2): bunker.validate_and_add_transaction(tx) dengan signature verification
    return {
        "status": "accepted",
        "message": f"Transaction of {request.amount} $WEEKS from "
                   f"{request.sender_address[:16]}... to "
                   f"{request.receiver_address[:16]}... is being processed.",
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
    uvicorn.run(app, host="127.0.0.1", port=8000)

# ---- P3: Server-Side Token Verification (hardening v1.2) ----
from fastapi import Request as _Req
from fastapi.responses import JSONResponse as _JSON
from verify import verify_token as _vt

@app.post("/verify")
async def verify_token_endpoint(request: _Req):
    """Hakim terakhir: validasi signature RSA-PSS + expiry + anti-replay."""
    require_api_key(request)
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, "invalid JSON body")
    token = body.get("token", "")
    if not token:
        raise HTTPException(400, "missing 'token' field")
    result = _vt(token)
    return _JSON(content=result, status_code=200 if result["valid"] else 401)