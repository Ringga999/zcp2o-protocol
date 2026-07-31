"""
ZCP2O Core Cryptography Module.
Handles RSA-4096 key generation, signing, verification, and SHA-256 hashing.
"""

from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend
from typing import Tuple

# --- 1. Key Generation ---

def generate_key_pair() -> Tuple[rsa.RSAPrivateKey, rsa.RSAPublicKey]:
    """
    Generates a secure RSA 4096-bit key pair.
    Returns: (Private Key, Public Key)
    """
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=4096,
        backend=default_backend()
    )
    public_key = private_key.public_key()
    return private_key, public_key

# --- 2. Serialization (Saving/Loading Keys) ---

def serialize_private_key(private_key: rsa.RSAPrivateKey, password: bytes = None) -> bytes:
    """Converts private key to PEM format (optionally encrypted with a password)."""
    encryption = serialization.BestAvailableEncryption(password) if password else serialization.NoEncryption()
    
    return private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=encryption
    )

def serialize_public_key(public_key: rsa.RSAPublicKey) -> bytes:
    """Converts public key to PEM format."""
    return public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

# --- 3. Signing & Verification ---

def sign_message(private_key: rsa.RSAPrivateKey, message: bytes) -> bytes:
    """
    Signs a message using RSA-PSS with SHA-256.
    """
    signature = private_key.sign(
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    return signature

def verify_signature(public_key: rsa.RSAPublicKey, signature: bytes, message: bytes) -> bool:
    """
    Verifies an RSA-PSS signature. Returns True if valid, False otherwise.
    """
    try:
        public_key.verify(
            signature,
            message,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except Exception:
        return False

# --- 4. Hashing ---

def hash_data(data: bytes) -> bytes:
    """
    Generates a SHA-256 hash of the given data.
    """
    digest = hashes.Hash(hashes.SHA256(), backend=default_backend())
    digest.update(data)
    return digest.finalize()