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
import hashlib
from cryptography.hazmat.primitives.serialization import load_der_public_key
from cryptography.hazmat.backends import default_backend
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
from zcp2o.transaction import Transaction
from zcp2o.crypto import verify_signature

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

class SignedTransfer(BaseModel):
    sender_address: str       # WKS-... (derived by sender)
    sender_pubkey_pem: str    # PEM public key (used for verify + binding check)
    receiver_address: str     # WKS-...
    amount_zat: int           # amount in ZAT (integer, no float!)
    timestamp: int            # unix epoch seconds
    signature_hex: str        # hex of RSA-PSS signature of canonical JSON
    tx_type: str = "TRANSFER" # must be uppercase! (anti-inflation guard)

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
        "version": "1.2.0-sovereign",
    }

@app.get("/pioneers")
async def get_pioneers():
    """Season 0 leaderboard: first sovereign identities (pseudonymous — no pubkeys exposed)."""
    import json as _json
    candidates = ["identities.json",
                  os.path.join(os.path.dirname(os.path.abspath(__file__)), "identities.json")]
    recs = {}
    for p in candidates:
        try:
            with open(p) as f:
                data = _json.load(f)
            recs = data.get("identities", data) if isinstance(data, dict) else {}
            break
        except Exception:
            continue
    rows = []
    for zid, rec in recs.items():
        if isinstance(rec, dict) and rec.get("revoked"):
            continue
        rows.append({"zid": zid,
                     "registered_at": rec.get("created_at", 0) if isinstance(rec, dict) else 0})
    rows.sort(key=lambda r: r["registered_at"] or 0)
    top = rows[:100]
    return {"season": 0, "total": len(rows),
            "pioneers": [{"rank": i + 1, "zid": r["zid"], "registered_at": r["registered_at"]}
                         for i, r in enumerate(top)]}

@app.get("/blocks")
async def get_blocks(limit: int = 50):
    """List blocks (newest first) for the explorer."""
    if not bunker:
        raise HTTPException(status_code=503, detail="Node is not initialized yet.")
    chain = bunker.blockchain.chain
    blocks = [{
        "index": b.index,
        "hash": b.hash,
        "previous_hash": b.previous_hash,
        "timestamp": b.timestamp,
        "tx_count": len(b.transactions),
    } for b in chain[-limit:][::-1]]
    return {"height": len(chain) - 1, "count": len(blocks), "blocks": blocks}


@app.get("/block/{index}")
async def get_block(index: int):
    """Single block detail with transactions."""
    if not bunker:
        raise HTTPException(status_code=503, detail="Node is not initialized yet.")
    chain = bunker.blockchain.chain
    if index < 0 or index >= len(chain):
        raise HTTPException(status_code=404, detail="Block not found.")
    b = chain[index]
    return {
        "index": b.index,
        "hash": b.hash,
        "previous_hash": b.previous_hash,
        "timestamp": b.timestamp,
        "transactions": [t.to_dict() for t in b.transactions],
    }


@app.get("/txs")
async def get_txs(limit: int = 100):
    """Flat list of transactions (newest first)."""
    if not bunker:
        raise HTTPException(status_code=503, detail="Node is not initialized yet.")
    txs = []
    for b in reversed(bunker.blockchain.chain):
        for t in b.transactions:
            d = t.to_dict()
            d["block"] = b.index
            txs.append(d)
            if len(txs) >= limit:
                return {"count": len(txs), "txs": txs}
    return {"count": len(txs), "txs": txs}


@app.get("/balance/{address}")
async def get_balance(address: str):
    if not bunker:
        raise HTTPException(503, "Node not initialized")
    bal_zpro = bunker.get_balance(address)
    return {
        "address": address,
        "balance_zpro": bal_zpro,
        "balance_zat": int(bal_zpro * 1_000_000),
        "currency": "$ZPRO",
    }

def _canonical(sender: str, receiver: str, amount_zat: int, timestamp: int) -> bytes:
    """Canonical JSON matching exactly what the JS wallet signs.
    Python json.dumps default separators = (', ', ': ') — must match JS builder."""
    import json
    payload = {
        "amount": amount_zat,
        "receiver": receiver,
        "sender": sender,
        "timestamp": timestamp,
        "tx_type": "TRANSFER",
    }
    return json.dumps(payload, sort_keys=True).encode("utf-8")

def _address_from_pem(pem_str: str) -> str:
    """Derive WKS- address from PEM public key (matches wallet.py logic)."""
    pem = pem_str.encode("utf-8") if isinstance(pem_str, str) else pem_str
    h = hashlib.sha256(pem).digest()[:20].hex()
    return f"WKS-{h}"

@app.post("/transfer")
async def create_transfer_v2(body: SignedTransfer, req: Request):
    """
    Signed transfer v2 — no API key needed, signature IS the auth.
    Four safety checks:
      1. tx_type == "TRANSFER" (anti-inflation, see Ranjau #1)
      2. pubkey → address binding (sender can't lie about their address)
      3. RSA-PSS signature valid on canonical JSON
      4. sufficient balance
    """
    if not bunker:
        raise HTTPException(503, "Node not initialized")

    # CHECK 1: anti-inflation tx_type
    if body.tx_type != "TRANSFER":
        raise HTTPException(400, f"Invalid tx_type: {body.tx_type} (must be 'TRANSFER')")

    # CHECK 2: pubkey binding
    if _address_from_pem(body.sender_pubkey_pem) != body.sender_address:
        raise HTTPException(401, "Sender address does not match pubkey")

    # CHECK 3: signature
    canonical = _canonical(body.sender_address, body.receiver_address,
                           body.amount_zat, body.timestamp)
    try:
        from cryptography.hazmat.primitives.serialization import load_pem_public_key
        pem_bytes = body.sender_pubkey_pem.encode("utf-8")
        pub = load_pem_public_key(pem_bytes, backend=default_backend())
        from cryptography.hazmat.primitives.asymmetric import padding
        from cryptography.hazmat.primitives import hashes
        sig_bytes = bytes.fromhex(body.signature_hex)
        pub.verify(
            sig_bytes, canonical,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()),
                        salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256()
        )
    except Exception as e:
        raise HTTPException(401, f"Invalid signature: {e}")

    # CHECK 4: balance (in ZAT)
    if body.amount_zat <= 0:
        raise HTTPException(400, "Amount must be positive (in ZAT)")
    sender_zat = int(bunker.get_balance(body.sender_address) * 1_000_000)
    if sender_zat < body.amount_zat:
        raise HTTPException(400,
            f"Insufficient ZAT. Have: {sender_zat}, Need: {body.amount_zat}")

    if not bunker.validate_and_add_transaction(tx):
        raise HTTPException(400, "Transaction rejected by node")

    block = bunker.mine_block(validator_trust_score=100)
    return {
        "status": "confirmed",
        "block": block.index,
        "block_hash": block.hash,
        "tx_hash": block.hash[:16] + "-" + str(block.index),
        "new_sender_zat": sender_zat - body.amount_zat,
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
    await _dual_auth(request)
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, "invalid JSON body")
    token = body.get("token", "")
    if not token:
        raise HTTPException(400, "missing 'token' field")
    result = _vt(token)
    return _JSON(content=result, status_code=200 if result["valid"] else 401)

# ---- Sovereign Auth v2: registrasi identitas (humanity = API key) ----
from fastapi import Request as _Req2
from fastapi.responses import JSONResponse as _JSON2
import identity as _ident
from verify import verify_token as _vt2

@app.post("/identity/register")
async def identity_register(request: _Req2):
    """TANPA API key! Onboarding cukup buktikan kamu manusia."""
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, "invalid JSON body")

    proof = body.get("human_proof", "")   # token Human Proof
    pubkey = body.get("pubkey")           # kunci publik RSA klien

    if not proof or not pubkey:
        raise HTTPException(400, "missing 'human_proof' or 'pubkey'")

    # 1. Verifikasi dulu: benarkah dia manusia?
    res = _vt2(proof)
    if not res["valid"]:
        return _JSON2(content={"ok": False, "error": "human_proof_rejected", "detail": res["reason"]}, status_code=401)

    # 2. Daftarkan identitasnya
    ok, out = _ident.register(res["payload"], pubkey)
    if not ok:
        return _JSON2(content={"ok": False, "error": out["error"]}, status_code=409)

    return _JSON2(content={"ok": True, **out}, status_code=201)

# ---- Sovereign Auth v2: dual auth (legacy key ATAU signed request) ----
import sovereign as _sov

async def _dual_auth(request):
    """Migrasi mulus: key lama tetap jalan, identitas sovereign juga jalan."""
    try:
        require_api_key(request)      # jalur legacy
        return
    except Exception:
        pass
    ident_id = request.headers.get("x-zcp2o-identity", "")
    identity = _ident.get(ident_id) if ident_id else None
    if not identity or identity.get("revoked"):
        raise HTTPException(401, "Invalid API key or identity")
    body = await request.body()
    ok, reason = _sov.check(request.method, request.url.path, body,
                            dict(request.headers), identity)
    if not ok:
        raise HTTPException(401, "Sovereign auth failed: " + reason)

# ---- Sovereign Auth v2: CORS preflight untuk header signed requests ----
@app.middleware("http")
async def sovereign_cors(request, call_next):
    if request.method == "OPTIONS":
        resp = JSONResponse(content={"ok": True}, status_code=204)
    else:
        resp = await call_next(request)
    o = request.headers.get("origin", "")
    if o in ("https://ringga999.github.io", "https://zcp2o.is-a.dev"):
        resp.headers["Access-Control-Allow-Origin"] = o
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, X-ZCP2O-Identity, X-ZCP2O-Timestamp, X-ZCP2O-Nonce, X-ZCP2O-Signature"
    return resp