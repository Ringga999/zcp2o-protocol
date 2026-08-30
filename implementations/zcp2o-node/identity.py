"""
ZCP2O Sovereign Identity Registry — Auth v2
Humanity is the new API key: registrasi wajib Human Proof valid.
"""
import json, os, time, hashlib, threading

# File database identitas (disimpan di folder yang sama dengan file ini)
_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "identities.json")
_lock = threading.Lock()   # kunci agar tidak tabrakan saat banyak request

def _load():
    """Baca database identitas dari file."""
    if not os.path.exists(_PATH):
        return {"identities": {}, "used_proofs": []}
    try:
        with open(_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return {"identities": {}, "used_proofs": []}

def _save(db):
    """Simpan database identitas ke file."""
    with open(_PATH, "w") as f:
        json.dump(db, f, indent=1)

def register(human_proof_payload, pubkey_jwk):
    """
    Daftarkan identitas baru.
    - human_proof_payload: hasil verify_token (sudah terbukti manusia)
    - pubkey_jwk: kunci publik RSA milik klien
    Returns: (ok: bool, hasil: dict)
    """
    # 1. Validasi bentuk kunci publik
    if not pubkey_jwk or pubkey_jwk.get("kty") != "RSA" or "n" not in pubkey_jwk:
        return False, {"error": "invalid_pubkey"}

    # 2. Ambil sidik unik dari human proof (anti-Sybil: 1 proof = 1 identitas)
    proof_key = human_proof_payload.get("signals_digest") or human_proof_payload.get("nonce")

    with _lock:
        db = _load()

        # 3. Tolak jika proof ini sudah pernah dipakai daftar
        if proof_key in db["used_proofs"]:
            return False, {"error": "proof_already_used"}

        # 4. Buat identity_id dari hash kunci publik (unik per kunci)
        identity_id = "zid-" + hashlib.sha256(pubkey_jwk["n"].encode()).hexdigest()[:32]
        if identity_id in db["identities"]:
            return False, {"error": "identity_exists"}

        # 5. Simpan identitas baru dengan trust awal 50
        db["identities"][identity_id] = {
            "pubkey": pubkey_jwk,
            "trust": 50,
            "created_at": int(time.time()),
            "revoked": False,
            "human_score": human_proof_payload.get("score"),
        }

        # 6. Catat proof ini sebagai "sudah dipakai"
        db["used_proofs"].append(proof_key)
        if len(db["used_proofs"]) > 5000:      # bersihkan agar tidak bengkak
            db["used_proofs"] = db["used_proofs"][-2500:]

        _save(db)

    return True, {"identity_id": identity_id, "trust": 50}

def get(identity_id):
    """Ambil satu identitas (untuk verifikasi signed request nanti)."""
    with _lock:
        return _load()["identities"].get(identity_id)

def revoke(identity_id):
    """Cabut identitas (jika penyalahgunaan). Returns True/False."""
    with _lock:
        db = _load()
        if identity_id in db["identities"]:
            db["identities"][identity_id]["revoked"] = True
            _save(db)
            return True
    return False