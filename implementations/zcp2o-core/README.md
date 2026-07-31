# ZCP2O Core Library

> **The Cryptographic Foundation of the ZCP2O Protocol**
> 
> Python library implementing RSA-4096 cryptography, wallet management, and transaction validation for the ZCP2O offline-first blockchain.

---

## 📦 Installation
```bash
pip install -r requirements.txt

from zcp2o.wallet import Wallet

# Generate new wallet
wallet = Wallet.create()

print(f"Address: {wallet.address}")
# Output: WKS-a1b2c3d4e5f6...

from zcp2o.wallet import Wallet
from zcp2o.transaction import Transaction

sender = Wallet.create()
receiver_address = "WKS-abcdef1234567890abcdef1234567890abcdef12"

# Create transaction
tx = Transaction.create(sender, receiver_address, 50.0)

print(f"Transaction: {tx}")
# Output: Transaction(WKS-... -> WKS-...: 50.0 WEEKS)

# Get transaction hash (for block inclusion)
print(f"Hash: {tx.get_hash()}")

from zcp2o.crypto import serialize_public_key

# Get sender's public key
public_key_pem = serialize_public_key(sender.public_key)

# Validate signature
is_valid = tx.validate(public_key_pem)
print(f"Valid: {is_valid}")  # True