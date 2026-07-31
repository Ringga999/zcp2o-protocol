# ZCP2O Anti-Bot Mitigation: Implicit Proof-of-Humanity

> **Protecting the $WEEKS Ecosystem from Automation and Sybil Attacks**
> 
> In Play-to-Earn (P2E) ecosystems, bot auto-play is the number one killer of tokenomics. Bots drain the supply, cause hyperinflation, and drive away real human players. ZCP2O does not rely on annoying CAPTCHAs; instead, we make botting mathematically unprofitable.

---

## 🛡️ The 4-Layer Defense Architecture

ZCP2O employs a "Defense in Depth" strategy. We do not rely on a single mechanism. We use four overlapping layers that work simultaneously to filter out non-human actors.

### Layer 1: Behavioral Biometrics (Input Analysis)
*Bots play perfectly or with rigid random patterns. Humans have natural "flaws".*

*   **Mouse/Touch Trajectory:** Humans move cursors/fingers with slight tremors and curved paths. Bots move in perfect linear interpolations.
*   **Reaction Time Variance:** Humans take 200-300ms to react, and the time *varies*. Bots react in 0-10ms consistently.
*   **Keystroke Dynamics:** The way a human presses WASD (hold duration, delay between keys) has a unique pattern (like a fingerprint).
*   **Implementation:** The client SDK (e.g., Alpha Drop Godot plugin) records this data in the background and calculates a "Humanity Score" sent to the local mesh.

### Layer 2: Dynamic Turing Challenges (In-Game CAPTCHA)
*Do not use boring "select the traffic light" image CAPTCHAs. Integrate it into the gameplay.*

*   **Mechanism:** Randomly (e.g., every 15-30 minutes), the game spawns an "Anomaly".
*   **Example:** Suddenly, 3 objects appear, and the player must shoot the *red* one within 3 seconds. Or, the player must press buttons in a specific sequence shown briefly.
*   **Penalty:** If failed, the player is not instantly banned. Instead, their **$WEEKS reward multiplier drops to 0.1x** for the next hour.
*   **Advantage:** Simple macro bots fail this. Advanced AI bots (computer vision) can pass, but the development cost for such AI is higher than the potential reward.

### Layer 3: Hardware Binding & Rate Limiting
*Preventing one person from running 100 bot accounts on a single PC.*

*   **Hardware Fingerprinting:** Upon first launch, the ZCP2O SDK extracts a unique hash of the device's MAC Address, GPU UUID, and OS Serial Number.
*   **Rule:** Maximum 1 active $WEEKS account per Hardware Fingerprint per 24 hours.
*   **Shadow Ban:** If 5 accounts are detected logging in from the same hardware, 4 of them are silently moved to the "Shadow Realm" (farming mode with 0 rewards).

### Layer 4: The "Shadow Realm" & Diminishing Returns (Economic Defense)
*This is the most powerful weapon. Don't just ban bots; make them useless.*

*   **Diminishing Returns (Exponential Decay):** The longer a player plays *without* social interaction (without meeting other human nodes in the Mesh Network) or *without* gameplay variation, their $WEEKS reward drops exponentially.
*   **The Formula:** 
    ```text
    Final Reward = Base Reward × Trust Score × (1 / (1 + Hours_Played_Today))
    ```
*   **Social Verification (Mesh Trust):** If a player's device physically encounters (via Bluetooth Mesh) another player with a high "Verified Human" trust score, their own Trust Score increases, and their reward multiplier resets to normal.
*   **Result:** A bot left to auto-play for 24 hours will earn a lot in Hour 1, but by Hour 10, its reward approaches zero. Botting becomes **mathematically unprofitable**.

---

##  Integration in Alpha Drop (Godot Implementation)

In the game code, this is handled by a `TrustSystem` manager:

```gdscript
# Conceptual Godot GDScript for Anti-Bot Logic
var trust_score: float = 1.0 # 1.0 = Human, 0.0 = Detected Bot
var play_time_today: float = 0.0

func calculate_weeks_reward(base_amount: float) -> float:
    # Time penalty: decreases reward the longer you play without social verification
    var time_penalty = 1.0 / (1.0 + (play_time_today / 3600.0)) 
    
    # Final calculation
    var final_reward = base_amount * trust_score * time_penalty
    
    # If reward is too small, return 0 to save network bandwidth
    if final_reward < 0.01:
        return 0.0
        
    return final_reward
	
	Summary of Bot Mitigation


🌐 The Philosophy: "Implicit Proof-of-Humanity"
ZCP2O rejects the concept of "Hard CAPTCHAs" that ruin user experience. Instead, we rely on Implicit Proof-of-Humanity.
By combining behavioral biometrics, dynamic gameplay challenges, hardware binding, and an economic "Shadow Realm" for isolated actors, ZCP2O ensures that the $WEEKS ecosystem remains sustainable, fair, and dominated by real human value creation.