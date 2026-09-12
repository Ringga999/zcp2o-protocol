# 🎮 Circle Launcher: ZCP2O Proof-of-Play Reference Implementation

> **The Second Reference Implementation — A lightweight, addictive arcade game built in Godot 4 that turns players into contributing nodes/validators via the ZCP2O Protocol.**

Circle Launcher is a server-authoritative, tick-based 2D arcade game. It serves as the primary proof-of-concept for SPEC-02, demonstrating how casual gameplay can be cryptographically tied to on-chain validator attestations and micro-rewards, while maintaining a Free-to-Play + Ads monetization model.

---

## 🌟 Key Features

*   **Zero-Capital Entry (Free + Ads):** Players can start playing immediately. Monetization is handled via non-intrusive ad placements, ensuring fair access without pay-to-win mechanics.
*   **Dual-World Economy:** 
    *   **World 1:** Captcha-gated entry. Rewards: Off-chain Gold tokens + Silver Ticket (on-chain).
    *   **World 2:** Captcha + 100 Gold entry fee. Rewards: Gold, XP, and `$ZPRO` (on-chain REWARD tx).
*   **Server-Authoritative Tick Polling:** Designed for free-tier hosting constraints. Uses 2–3 second HTTP polling instead of WebSockets, with the server acting as the single source of truth for positions and collisions.
*   **Proof-of-Play (PoP) Integration:** Session results and XP deltas are settled on-chain. High-trust players can co-sign block hashes via the `block.validator_signatures` field.
*   **Advanced Anti-Bot Telemetry:** Session length is randomized (5–15 mins). The ZCP2O captcha motor-ness score seeds player trust; bot-like behavior results in diminished reward pools.

---

## 🛠️ Tech Stack

*   **Game Engine:** Godot Engine 4.x (GDScript)
*   **Backend Integration:** ZCP2O Node API (FastAPI) via HTTP polling
*   **State Management:** 
    *   *On-chain:* `$ZPRO` balances, Silver Tickets, Session Settlement TXs.
    *   *Off-chain:* Gold tokens, ephemeral positions/enemies, leaderboard cache (managed by Bunker DB).
*   **Monetization:** Godot Ads SDK (Android/iOS) + Web Ad Networks (WebGL)

---

## 🏗️ Architecture & Asset Mapping

To prevent chain bloat and ensure scalability, assets are strictly partitioned:

| Asset / Data | Location | Reason |
| :--- | :--- | :--- |
| `$ZPRO` reward | On-chain (`tx_type="REWARD"`) | Real economic value |
| Silver Ticket | On-chain (`tx_type="TICKET"`) | Season/achievement proof |
| Session Result + XP Delta | On-chain (Settlement TX) | Auditable validator contribution |
| Gold Token | Off-chain (Game DB) | Fast transactions, no chain bloat |
| Positions / Enemies / Ticks | Off-chain (Session Memory) | Ephemeral, high-frequency data |
| Leaderboard | Off-chain cache + On-chain checkpoint | Fast view, auditable root |

---

## 🔒 Dual-Repository Strategy

To protect intellectual property, API keys, and Play Store signing credentials, this project follows a dual-repo architecture:

1. **Public Repo (`zcp2o-protocol`):** Contains this `README.md`, design specifications (`specs/SPEC-02.md`), and API integration contracts.
2. **Private Repo (`zcp2o-circle-game`):** Contains the full Godot 4.x source code (`src/`), game assets (`assets/`), build configurations (`builds/`), and environment variables (`.env`).

*Access to the private repository is restricted to core ZCP2O Foundation developers.*

---

## 🚀 How to Run (Local Development)

*Note: Requires access to the private `zcp2o-circle-game` repository.*

1. Download and install **Godot Engine 4.x**.
2. Clone the private repository:

   ```bash
   git clone https://github.com/Ringga999/zcp2o-circle-game.git
   cd zcp2o-circle-game
   ```

3. Open the `project.godot` file in Godot Engine.
4. Configure your local `.env` file with the testnet Bunker API endpoint:

   ```env
   BUNKER_API_URL=http://localhost:8000
   ```

5. Press `F5` to run the game locally.

---

## 📈 Phasing Roadmap

*   **G0 (Current):** Specification locked + offline Godot prototype (game feel & mechanics).
*   **G1:** Captcha gate integration + tick-based sessions + `$ZPRO` rewards via existing Bunker plumbing + leaderboard checkpoints.
*   **G2:** Multi block-server sharding (max 100 players/server) + full gold economy + `validator_signatures` attestation.

---
*Locked by Ringga999 + Mr. Architect · ZCP2O Foundation*