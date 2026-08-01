# ZCP2O & Alpha Drop: Master Design Log

> **Single Source of Truth for ZCP2O Protocol & Alpha Drop Game Mechanics**
> 
> **Version:** 2.0 (Updated with Offline-First Architecture, Trust-Weighted Consensus, and Shadow Realm Mechanics)
> **Status:** Locked for Implementation
> **Repository:** https://github.com/Ringga999/zcp2o-protocol

---

## 📋 1. DEFINISI & KATEGORI

**ZCP2O (Zero-Capital Play-to-Own)** adalah hybrid blockchain yang memvalidasi transaksi berdasarkan aktivitas pengguna nyata (*Proof-of-Play*), bukan hashrate atau staking modal. Dirancang untuk ekosistem game yang 100% gratis, aman, terdesentralisasi, dan *offline-first*.

| Lapisan | Fungsi | Contoh Aset |
| :--- | :--- | :--- |
| **Public** | Ledger terbuka, validasi oleh semua pemain terverifikasi | Coin ($WEEKS), XP, Silver Ticket |
| **Private** | Kontrol developer terbatas (Burn/Mint khusus) | Golden Ticket (Mint via Burn) |
| **Consortium** | Multi-game ecosystem | Shared ledger, cross-game transfer |

---

## 🔑 2. KARAKTERISTIK INTI & ARSITEKTUR

| Aspek | Spesifikasi Teknis |
| :--- | :--- |
| **Konsensus** | Proof-of-Play (PoP) + Trust-Weighted Dynamic Quorum |
| **Jaringan P2P** | **Offline-First:** BLE 5.0+ & Local UDP Broadcast / Wi-Fi Direct. *(WebRTC hanya fallback online)* |
| **Keamanan** | RSA 4096-bit + SHA-256 + Multi-layer Validation |
| **Biaya** | Zero Gas Fee (Biaya transaksi di-spawn kembali sebagai coin) |
| **Skalabilitas** | Zoning (500x500m), Auto-Scaling, Dynamic Spawn |
| **Platform** | Godot Engine 4.x (GDScript) + Python Core |
| **Lisensi** | MIT License (Open Source) |

---

## 🎮 3. EKOSISTEM GAME: ALPHA DROP

### World System
*   **World 2 (Free Zone):** Akses gratis. Fungsi: Farming XP.
*   **World 1 (Premium Zone):** Akses butuh Silver/Golden Ticket. Fungsi: Claim Coin ($WEEKS) & XP.

### Token System & Flow
| Token | Supply | Cara Dapat | Fungsi & Durasi |
| :--- | :--- | :--- | :--- |
| **XP** | Unlimited | Farming di World 2 | Tukar ke Silver Ticket (100 XP = 1 Ticket) |
| **Silver Ticket** | Dari XP | Exchange di World 2 | Akses World 1 (Durasi: 15 menit) |
| **Coin ($WEEKS)** | 100.000.000 (Halving) | Claim di World 1 | Mata uang utama, beli Golden Ticket |
| **Golden Ticket** | **Dynamic (via Burn)** | **Burn 5.000 $WEEKS** | Akses World 1 Premium (Durasi: 30 menit) |

**Alur Ekonomi:** 
`World 2 (Farm XP) → Exchange to Silver → World 1 (Claim $WEEKS) → Burn $WEEKS for Golden Ticket → Extended Premium Play`

---

## 🏗️ 4. MEKANISME TEKNIS GAMEPLAY

### Dynamic Spawn & Auto-Scaling
*   **Zoning:** 30-500 pemain/zone. Zone baru auto-create jika padat.
*   **Initial Spawn:** 10 coin acak saat zone dibuat.
*   **Dynamic Spawn:** `required_coins = max(5, ceil(active_players / 5.0) + 5)`
*   **Fee Spawn:** 1% dari setiap transaksi di-spawn sebagai coin baru di lokasi acak.
*   **Auto Spawn:** **HANYA** jika `active_players > 0`. Mencegah inflasi di zone kosong.

### Proses Claim Coin (Data Flow)
1. **Local Validation:** Cek signature coin, jarak player-coin (< 50px), status `claimed`, dan kesamaan zone.
2. **Create Transaction:** Generate JSON transaksi dengan `proof` (jarak & posisi).
3. **Broadcast:** Kirim ke peer via UDP/BLE mesh.
4. **Peer Validation:** Minimal 1 Full Node ATAU 3+ Light Node (Trust Score > 80) menyetujui.
5. **Update Ledger:** Saldo bertambah, coin ditandai `claimed = true`, fee coin di-spawn.

---

## 🛡️ 5. KEAMANAN & ANTI-CHEAT (UPDATED)

### Lapisan Pertahanan
1. **Kriptografi:** Setiap coin & transaksi wajib memiliki signature RSA.
2. **Jarak & Zona:** Validasi server-side/peer-side untuk mencegah teleport cheat.
3. **Rate Limiting:** Cooldown claim 2 detik per player.
4. **Trust-Weighted Consensus:** Player baru (Trust Score 0) tidak bisa memvalidasi transaksi sendiri.

### Hukuman: The Shadow Realm (No Asset Deletion)
Alih-alih menghapus aset (yang berisiko false-positive akibat lag/bug), ZCP2O menggunakan sistem **Shadow Realm**:
*   **Tahap 1:** Peringatan visual (game menjadi "berat" / slow motion).
*   **Tahap 2:** Lag + glitch effect.
*   **Tahap 3 (Shadow Realm):** **Reward Multiplier = 0.0x**. Player tetap bisa bermain, tapi **earn 0 $WEEKS**. Aset tidak dihapus, tetapi aktivitas menjadi tidak menguntungkan secara ekonomi. Trust Score dapat pulih seiring waktu dengan perilaku normal.

---

## 💰 6. EKONOMI TOKEN $WEEKS

*   **Total Supply:** 100.000.000
*   **Halving:** Setiap 1.000.000 coin di-claim. 
    *   *Formula:* `base_reward / pow(2, floor(circulating_supply / HALVING_INTERVAL))`
*   **Genesis Pool:** 1.000.000 coin khusus untuk 100 pemain pertama (Bonus 10.000 coin).
*   **Deflationary Burn:** Pembelian Golden Ticket (5.000 $WEEKS) dikirim ke `Null Address` (`WKS-000...`), mengurangi supply secara permanen.

---

## 🔐 7. SISTEM LOGIN & SAVE

*   **Primer:** ZCP2O Native Wallet (Anonim, aman, Recovery Phrase 12-24 kata).
*   **Opsional:** Gmail OAuth2 **HANYA** untuk enkripsi/cloud backup seed phrase ke IPFS. **BUKAN** sebagai identitas ledger (ledger tetap menggunakan alamat `WKS-...` untuk privasi GDPR/UU PDP).
*   **Save System:** Local (encrypted) + Auto-save setiap 60 detik + Cloud Backup (IPFS).

---

## 📦 8. STRUKTUR DATA (JSON FORMAT)

### Objek Coin (Sebelum Spawn)
```json
{
  "id": "0x7f8a3b2c9d4e5f6a",
  "token_type": "COIN",
  "owner_id": null,
  "value": 5,
  "signature": "0xabc123...", 
  "created_at": 1700000000,
  "expires_at": 0,
  "claimed": false,
  "claimer_id": null,
  "metadata": { "x": 150.5, "y": 320.0, "world": "WORLD_1", "zone": "zone_1" },
  "spawn_type": "AUTO_SPAWN",
  "source_transaction_id": null,
  "color": "#FFD700"
}

##Objek Transaction (Broadcast ke Peer)
{
  "type": "CLAIM",
  "id": "0x9e4d5f6a7b8c9d0e",
  "from": "WKS-player123...",
  "to": null,
  "amount": 5,
  "fee": 0,
  "coin_id": "0x7f8a3b2c9d4e5f6a",
  "zone_id": "zone_1",
  "timestamp": 1700000000,
  "signature": "0xdef456...",
  "proof": {
    "distance": 10.5,
    "player_position": { "x": 150.0, "y": 320.0 }
  }
}

##🎯 9. ROADMAP IMPLEMENTASI
Fase 1 (Sekarang): Core Python Library (crypto, wallet, transaction, block), Godot Prototype World 1 & 2.
Fase 2: Multiplayer P2P (UDP/BLE integration), Broadcast transaksi, Trust-Weighted Consensus.
Fase 3: Ekonomi Penuh (Halving, Burn Mechanism, Fee-to-Spawn).
Fase 4: Skalabilitas (Auto-scaling zones, Mobile Wallet App).
Fase 5: Multi-Game Ecosystem (Shared ledger, Cross-game asset registry).

##📝 10. INSTRUKSI FINAL UNTUK AI / DEVELOPER
Prioritas: 1. Keamanan > 2. Skalabilitas > 3. Performa > 4. Fitur
Prinsip Mutlak:
"Jangan percaya klien" - Semua data (jarak, saldo, signature) diverifikasi di sisi peer/node.
Semua token wajib memiliki signature kriptografis.
Tidak ada penghapusan aset paksa; gunakan Shadow Realm (Reward = 0) untuk penalti.
Auto-spawn coin hanya jika ada pemain aktif di zone tersebut.
Golden Ticket didapat via Burn, bukan supply statis developer.

Last Updated: 2024 | Maintained by: ZCP2O Core Team
