cat > verify.py << 'PYEOF'
"""
ZCP2O Token Verifier — P3 Server-Side Verification
Validates: RSA-PSS signature, expiry, nonce replay.
"""
import json, time, base64, hashlib
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend

# ---- Nonce store (in-memory, resets on reload) ----
_used_nonces = set()
MAX_NONCES = 10000  # auto-cleanup jika terlalu banyak

def _b64url_decode(s):
    """Decode base64url (tanpa padding)."""
    s = s.replace("-", "+").replace("_", "/")
    s += "=" * (4 - len(s) % 4)
    return base64.b64decode(s)

def _jwk_to_public_key(jwk):
    """Convert JWK {kty, n, e} ke RSA public key object."""
    n_bytes = _b64url_decode(jwk["n"])
    e_bytes = _b64url_decode(jwk["e"])
    n_int = int.from_bytes(n_bytes, "big")
    e_int = int.from_bytes(e_bytes, "big")
    pub_numbers = rsa.RSAPublicNumbers(e_int, n_int)
    return pub_numbers.public_key(default_backend())

def verify_token(token_b64: str) -> dict:
    """
    Verify a ZCP2O Human Proof token.
    Returns: {"valid": bool, "reason": str, "payload": dict|None}
    """
    # 1. Decode token
    try:
        raw = _b64url_decode(token_b64)
        obj = json.loads(raw)
    except Exception:
        return {"valid": False, "reason": "malformed_token", "payload": None}

    # 2. Extract signature + pubkey + payload
    sig_b64 = obj.pop("sig", None)
    pubkey_jwk = obj.pop("pubkey", None)
    payload = obj  # sisanya = payload yang di-sign

    if not sig_b64 or not pubkey_jwk:
        return {"valid": False, "reason": "missing_sig_or_pubkey", "payload": None}

    # 3. Check version
    if payload.get("v", 0) < 5:
        return {"valid": False, "reason": "token_version_too_old", "payload": payload}

    # 4. Check expiry
    now = int(time.time())
    expires_at = payload.get("expires_at", 0)
    if now > expires_at:
        return {"valid": False, "reason": "token_expired", "payload": payload}

    # 5. Check nonce replay
    nonce = payload.get("nonce", "")
    if not nonce:
        return {"valid": False, "reason": "missing_nonce", "payload": payload}
    if nonce in _used_nonces:
        return {"valid": False, "reason": "nonce_replay", "payload": payload}

    # 6. Verify RSA-PSS signature
    try:
        pub_key = _jwk_to_public_key(pubkey_jwk)
        sig_bytes = _b64url_decode(sig_b64)
        payload_bytes = json.dumps(payload, separators=(",", ":")).encode()

        # Coba format separators standar dulu
        try:
            pub_key.verify(
                sig_bytes,
                payload_bytes,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=32
                ),
                hashes.SHA256()
            )
        except Exception:
            # Fallback: coba dengan spasi (format JS default)
            payload_bytes2 = json.dumps(payload).encode()
            pub_key.verify(
                sig_bytes,
                payload_bytes2,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=32
                ),
                hashes.SHA256()
            )
    except Exception:
        return {"valid": False, "reason": "invalid_signature", "payload": payload}

    # 7. Mark nonce as used (anti-replay)
    if len(_used_nonces) > MAX_NONCES:
        _used_nonces.clear()  # cleanup sederhana
    _used_nonces.add(nonce)

    # 8. Check score threshold
    score = payload.get("score", 0)
    if score < 70:
        return {"valid": False, "reason": "score_below_threshold", "payload": payload}

    return {"valid": True, "reason": "verified", "payload": payload}
PYEOF