# 🛡️ ZCP2O Human Proof — Security Hardening v1.2 (P1–P4)

Dokumen ini mencatat lapisan pertahanan ZCP2O Human Proof beserta
bukti pengujian serangan (28 Agustus 2026).

## Lapisan Pertahanan

| # | Lapis | Lokasi | Fungsi |
|---|-------|--------|--------|
| P1 | Subresource Integrity (SRI) | Browser | Menolak menjalankan file widget yang hash SHA-384-nya tidak cocok (anti-tamper). |
| P2 | Challenge Binding | Token | Token terikat pada `challenge` + `signals_digest` (SHA-256 sinyal motorik asli). |
| P4 | Nonce + Expiry | Token v5 | `nonce` 16-byte acak (anti-replay) + `expires_at` (5 menit). |
| P3 | Server-Side Verification | Bunker `/verify` | Validasi signature RSA-PSS, expiry, nonce, skor ≥ 70. |

## Format Token v5

```json
{ "v": 5, "type": "zcp2o-human-proof", "challenge": "circle-fit",
  "score": 72, "nonce": "<16-byte b64url>",
  "layers": { "motor": 91, "sensor": null, "circle-fit": 55 },
  "signals_digest": "<sha256>", "issued_at": 1787919308,
  "expires_at": 1787919608, "tier": "light", "assurance": "self",
  "sig": "<RSA-PSS b64url>", "pubkey": { "kty":"RSA","n":"...","e":"..." } }
```

## Bukti Pengujian Serangan

| Serangan | Hasil |
|----------|-------|
| File widget diganti/ditambah | 🚨 BLOCKED oleh browser (SRI) |
| Token sampah | `401 malformed_token` |
| Token asli | `200 verified` |
| Token direplay | `401 nonce_replay` / `token_expired` |

## Ritual Regenerasi SRI

Hash dihitung dari **file ter-deploy** (bukan lokal):

```powershell
$base="https://ringga999.github.io/zcp2o-protocol/implementations/zcp2o-captcha/widget"
$names=@("zcp2o-human-proof.js")+(1..13|%{"zcp2o-hp$_.js"})
foreach($n in $names){$t=Join-Path $env:TEMP $n;curl.exe -s -o $t "$base/$n";
$h=[Convert]::ToBase64String([System.Security.Cryptography.SHA384]::Create().ComputeHash([IO.File]::ReadAllBytes($t)));
Write-Output "  `"$n`": `"sha384-$h`","}
```

## Batasan yang Diketahui (Roadmap)

- `assurance: "self"` → roadmap **assurance v1.0**: co-signature Bunker.
- Nonce store in-memory (reset saat reload) → roadmap: nonce store SQLite.
- Bot canggih → terus diperkuat via analisis motorik (Terminal Phase v0.4.2).