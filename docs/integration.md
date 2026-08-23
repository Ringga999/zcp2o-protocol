# 🔌 Integrasi ZCP2O Human Proof

> Loader terbuka (`embed.js`), mesin terproteksi (obfuscated). Open standard, protected implementation.

## Vanilla (1 baris)
```html
<div id="my-captcha"></div>
<script src="https://ringga999.github.io/zcp2o-protocol/implementations/zcp2o-captcha/widget/embed.js"
        data-container="#my-captcha" data-callback="onHuman"></script>
<script>function onHuman(token){ /* kirim token ke backend Anda */ }</script>
```

## React
```jsx
import Zcp2oCaptcha from "./Zcp2oCaptcha";
<Zcp2oCaptcha threshold={70} onVerified={t=>setToken(t)}/>
```

## Atribut `embed.js`
| Atribut | Fungsi | Default |
|---------|--------|---------|
| `data-container` | Selector wadah widget | (auto-create) |
| `data-threshold` | Skor lolos (0-100) | 70 |
| `data-callback` | Nama fungsi global penerima token | – |

## Event
`zcp2o:verified` → `event.detail.token` (untuk framework apa pun).

## Verifikasi Backend (opsional, Phase 2)
Token = payload + signature RSA (on-device). Saat ini verifikasi dilakukan
on-device (`Zcp2oHumanProof.verify(token)`); co-signing Digital Bunker
(assurance v1.0) ada di roadmap Phase 2.