# ZCP2O Tokenomics & Mathematical Model

> **The Economic Engine of the Zero-Capital Play-to-Own Protocol**
> 
> This document details the mathematical models, supply mechanics, and incentive structures governing the $WEEKS token.

---

## 🪙 1. Token Overview

*   **Token Name:** WEEKS
*   **Symbol:** $WEEKS
*   **Smallest Unit:** MicroWeek (1 $WEEKS = 1,000,000 MicroWeeks)
*   **Consensus Mechanism:** Proof-of-Play (PoP)
*   **Core Philosophy:** *"No Faucet, Only Play"* – Value is generated strictly through real-world human activity, not speculative minting or free giveaways.

---

## 📈 2. Supply & Emission Model

Unlike inflationary fiat or fixed-supply assets that rely solely on scarcity, $WEEKS utilizes a **Decaying Emission Curve** (similar to Bitcoin's halving, but adapted for activity-based rewards).

### The Halving Formula
The base reward for any validated activity (gaming, relaying, archiving) decreases by 50% at fixed intervals to ensure long-term scarcity and prevent hyperinflation.

$$ R_n = R_0 \times \left(\frac{1}{2}\right)^{\lfloor \frac{n}{H} \rfloor} $$

**Where:**
*   $R_n$ = Reward at current epoch $n$
*   $R_0$ = Initial Base Reward (e.g., 100 $WEEKS$ per validated activity block)
*   $n$ = Current epoch number (e.g., number of 6-month periods since genesis)
*   $H$ = Halving Interval (e.g., $H = 1$, meaning it halves every epoch)
*   $\lfloor x \rfloor$ = Floor function (rounds down to the nearest integer)

**Emission Schedule (Example):**
*   **Epoch 0 (Year 1):** 100 $WEEKS$ per valid activity
*   **Epoch 1 (Year 2):** 50 $WEEKS$
*   **Epoch 2 (Year 3):** 25 $WEEKS$
*   **Epoch 3 (Year 4):** 12.5 $WEEKS$

*Note: The exact values of $R_0$ and $H$ will be finalized and hard-coded in the Genesis Block upon Mainnet launch.*

---

## 💸 3. Transaction Fee Model

To sustain the network without relying on inflationary block rewards forever, ZCP2O implements a micro-fee system designed for high-volume, low-value local transactions.

### Fee Calculation Formula
$$ Fee = A \times r $$

**Where:**
*   $Fee$ = The transaction fee paid by the sender.
*   $A$ = The transaction Amount (in $WEEKS$).
*   $r$ = The fixed fee rate ($r = 0.01$, or **1%**).

**Example:** 
If Player A sends 50 $WEEKS$ to Player B:
*   $Fee = 50 \times 0.01 = 0.5$ $WEEKS$
*   Player B receives: $49.5$ $WEEKS$
*   The $0.5$ $WEEKS$ fee is distributed to the network validators.

### Fee Distribution (The Validator Incentive)
Unlike Ethereum where fees are partially burned (EIP-1559), ZCP2O directs **100% of the transaction fee** to the **Full Nodes (Digital Bunkers)** that validated and archived that specific local transaction. 

*   **Purpose:** This creates a sustainable, passive income stream for institutions or individuals running Full Nodes, incentivizing them to keep their hardware online and storage available, even when global internet is down.

---

## ⚖️ 4. Reward Distribution Mechanics

Rewards are not given for "finding a block" (PoW) or "locking capital" (PoS). They are distributed based on **Proof-of-Play (PoP)** roles:

1. **Activity Generator (e.g., Gamer):** Receives the Base Reward ($R_n$) minus the anti-bot diminishing return multiplier (if applicable).
2. **Proof-of-Relay Node:** Receives a micro-fraction (e.g., 5%) of the Base Reward for successfully forwarding the transaction payload through the Bluetooth/Wi-Fi mesh to a Full Node.
3. **Full Node (Archiver):** Receives the remaining Base Reward (e.g., 95%) **plus** 100% of the Transaction Fee for cryptographically signing and storing the ledger update.

---

## 🛡️ 5. Anti-Inflation Safeguards

To prevent economic collapse from bot farms or hyper-activity, the following mathematical dampeners are applied at the protocol level:

### A. Diminishing Returns (Time Penalty)
As detailed in the security specifications, isolated activity without social mesh verification is penalized:
$$ R_{final} = R_n \times \left( \frac{1}{1 + t} \right) $$
*Where $t$ is the continuous hours of isolated activity. As $t \to \infty$, $R_{final} \to 0$.*

### B. Maximum Daily Cap (Hard Limit)
To prevent a single device from draining the local liquidity pool, a hard cap is enforced per Hardware Fingerprint:
$$ \sum_{i=1}^{k} Reward_i \leq Daily\_Limit $$
*If the sum of rewards in a 24-hour period exceeds the $Daily\_Limit$, all subsequent activities yield $0$ $WEEKS$ until the timer resets.*

---

## 📊 6. Summary of Economic Flow

```text
[ Player performs Activity ] 
       │
       ├──> (Anti-Bot Check: Trust Score & Time Penalty applied)
       │
       ▼
[ Mesh Relay Nodes forward payload ] ──> Earns 5% of Base Reward
       │
       ▼
[ Full Node validates & archives ] ──> Earns 95% of Base Reward + 1% Transaction Fee
       │
       ▼
[ Ledger Updated Locally ] ──> Async Sync to Global Mainnet when Gateway is available