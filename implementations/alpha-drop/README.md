# 🎮 Alpha Drop: ZCP2O Reference Implementation

> **The First Offline-First, Play-to-Own Game Built on ZCP2O Protocol**
> 
> Alpha Drop is a top-down 2D action game developed in Godot Engine. It serves as the primary proof-of-concept for the ZCP2O "Proof-of-Play" consensus mechanism, demonstrating how players can earn $WEEKS tokens through real gameplay in an offline/local mesh environment.

---

## 🌟 Key Features

*   **Zero-Capital Entry:** Players can start playing and earning $WEEKS without buying any initial tokens.
*   **Offline-First Gameplay:** The game runs entirely on local networks (LAN, Wi-Fi Direct, Bluetooth Mesh). No global internet connection is required to play or earn.
*   **Proof-of-Play (PoP) Integration:** In-game actions (defeating enemies, collecting resources) are cryptographically logged and validated by local ZCP2O Full Nodes (Digital Bunkers).
*   **Implicit Anti-Bot System:** Integrated behavioral biometrics and diminishing returns to ensure fair distribution of $WEEKS to real human players.
*   **Character Selection:** Multiple playable characters (Alphabot, Bluesky, Bluex, etc.) with unique visual styles, all sharing the same core movement and boundary logic.

---

## 🛠️ Tech Stack

*   **Game Engine:** Godot Engine 4.x
*   **Language:** GDScript
*   **Networking:** Local Mesh / LAN (via ZCP2O SDK - *Coming Soon*)
*   **Architecture:** Script-based boundaries, dynamic animation states, and modular character selection via Autoload.

---

## 🚀 How to Run (Local Development)

1. Download and install [Godot Engine 4.x](https://godotengine.org/download).
2. Clone this repository:
   ```bash
   git clone https://github.com/Ringga999/zcp2o-protocol.git