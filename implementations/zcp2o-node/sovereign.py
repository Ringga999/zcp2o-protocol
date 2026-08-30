"""
ZCP2O Sovereign Auth v2 — verifier request tertandatangani.
Canonical string: METHOD\npath\nsha256(body)\ntimestamp\nnonce
"""
import time, hashlib, base64, threading
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

_used = set()
_lock = threading.Lock()

def _b64url_decode(s):
    s = s.replace("-", "+").replace("_", "/")
    s += "=" * (4 - len(s) % 4)
    return base64.b64decode(s)

def _pubkey_from_jwk(jwk):
    n = int.from_bytes(_b64url_decode(jwk["n"]), "big")
    e = int.from_bytes(_b64url_decode(jwk["e"]), "big")
    return rsa.RSAPublicNumbers(e, n).public_key(default_backend())

def check(method, path, body_bytes, headers, identity):
    """Returns (ok, reason). headers harus lowercase keys."""
    ts = headers.get("x-zcp2o-timestamp", "")
    nonce = headers.get("x-zcp2o-nonce", "")
    sig = headers.get("x-zcp2o-signature", "")
    if not (ts and nonce and sig):
        return False, "missing_headers"
    try:
        t = int(ts)
    except Exception:
        return False, "bad_timestamp"
    if abs(int(time.time()) - t) > 300:
        return False, "timestamp_expired"
    with _lock:
        if nonce in _used:
            return False, "nonce_replay"
        _used.add(nonce)
        if len(_used) > 10000:
            _used.clear()
    body_hash = hashlib.sha256(body_bytes or b"").hexdigest()
    canonical = "\n".join([method.upper(), path, body_hash, ts, nonce])
    try:
        key = _pubkey_from_jwk(identity["pubkey"])
        key.verify(_b64url_decode(sig), canonical.encode(),
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=32),
            hashes.SHA256())
    except Exception:
        return False, "invalid_signature"
    return True, "sovereign_ok"