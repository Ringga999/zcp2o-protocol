/* =========================================================
   ZCP2O Human Proof — self-contained, offline, privacy-first
   v0.1 | No backend. No tracking. 0 bytes exfiltrated.
   Requires secure context (https / localhost) for Web Crypto.
   ========================================================= */
(function (global) {
  "use strict";

  /* ---------------- utils ---------------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
  const stdev = a => { const m = mean(a); return Math.sqrt(mean(a.map(v => (v - m) * (v - m)))); };
  const cv = a => { const m = mean(a); return m ? stdev(a) / m : 0; };
  const rampUp = (v, lo, hi) => clamp((v - lo) / (hi - lo), 0, 1) * 100;

  // score 100 inside [idealMin,idealMax], ramps down toward [tolMin,tolMax]
  function band(v, idealMin, idealMax, tolMin, tolMax) {
    if (v >= idealMin && v <= idealMax) return 100;
    if (v < idealMin) return rampUp(v, tolMin, idealMin);
    return 100 - rampUp(v, idealMax, tolMax);
  }

  const b64url = bytes => {
    let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const strBytes = s => new TextEncoder().encode(s);
  async function sha256hex(obj) {
    const d = await crypto.subtle.digest("SHA-256", strBytes(JSON.stringify(obj)));
    return Array.from(new Uint8Array(d)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  /* ---------------- scorer (Implicit Proof of Humanity) ---------------- */
  function scoreSignals(samples) {
    if (samples.length < 30) return { score: 0, reason: "not-enough-data" };

    // direction entropy
    const dirs = [];
    for (let i = 1; i < samples.length; i++) {
      const dx = samples[i].x - samples[i - 1].x, dy = samples[i].y - samples[i - 1].y;
      if (dx || dy) dirs.push(Math.atan2(dy, dx));
    }
    const bins = new Array(16).fill(0);
    dirs.forEach(a => bins[clamp(Math.floor(((a + Math.PI) / (2 * Math.PI)) * 16), 0, 15)]++);
    let H = 0; bins.forEach(c => { if (c) { const p = c / dirs.length; H -= p * Math.log2(p); } });
    const entropy = rampUp((H / 4) * 100, 20, 60);

    // micro-jitter: residual std after smoothing
    const res = [];
    for (let i = 1; i < samples.length - 1; i++) {
      const mx = (samples[i - 1].x + samples[i + 1].x) / 2, my = (samples[i - 1].y + samples[i + 1].y) / 2;
      res.push(Math.hypot(samples[i].x - mx, samples[i].y - my));
    }
    const jitter = band(stdev(res), 0.2, 2.5, 0.05, 6);

    // velocity profile (coefficient of variation)
    const speeds = [];
    for (let i = 1; i < samples.length; i++) {
      const dt = samples[i].t - samples[i - 1].t || 1;
      speeds.push(Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y) / dt);
    }
    const velocity = band(cv(speeds), 0.25, 1.2, 0.05, 2);

    // timing naturalness
    const gaps = [];
    for (let i = 1; i < samples.length; i++) gaps.push(samples[i].t - samples[i - 1].t);
    const timing = band(cv(gaps), 0.2, 1.5, 0.02, 2.5);

    const score = Math.round(0.3 * entropy + 0.3 * jitter + 0.2 * velocity + 0.2 * timing);
    return { score, parts: { entropy, jitter, velocity, timing } };
  }

  /* ---------------- signer (Web Crypto) ---------------- */
  async function signProof(payload) {
    const kp = await crypto.subtle.generateKey(
      { name: "RSA-PSS", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
      true, ["sign", "verify"]);
    const data = strBytes(JSON.stringify(payload));
    const sig = new Uint8Array(await crypto.subtle.sign({ name: "RSA-PSS", saltLength: 32 }, kp.privateKey, data));
    const jwk = await crypto.subtle.exportKey("jwk", kp.publicKey);
    return { sig: b64url(sig), pubkey: { kty: jwk.kty, n: jwk.n, e: jwk.e } };
  }

  async function verifyToken(token) {
    try {
      const t = JSON.parse(atob(token.replace(/-/g, "+").replace(/_/g, "/")));
      const { sig, pubkey, ...payload } = t;
      const key = await crypto.subtle.importKey("jwk", pubkey, { name: "RSA-PSS", hash: "SHA-256" }, false, ["verify"]);
      const sigBytes = Uint8Array.from(atob(sig.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      return await crypto.subtle.verify({ name: "RSA-PSS", saltLength: 32 }, key, sigBytes, strBytes(JSON.stringify(payload)));
    } catch (e) { return false; }
  }

  /* ---------------- widget UI + challenges ---------------- */
  function init(opts) {
    const container = document.querySelector(opts.container);
    if (!container) return;
    const threshold = opts.threshold || 70;

    container.innerHTML =
      '<div style="font-family:sans-serif;max-width:340px;border:1px solid #ccc;border-radius:10px;padding:14px;background:#fafafa">' +
      '<b>🛡️ ZCP2O Human Proof</b> <span id="z-net" style="float:right"></span>' +
      '<div id="z-msg" style="margin:8px 0;color:#444">Tahan kursor di dalam lingkaran selama 3 detik.</div>' +
      '<canvas id="z-cv" width="300" height="160" style="border:1px solid #ddd;border-radius:6px;background:#fff;touch-action:none"></canvas>' +
      '<div id="z-res" style="margin-top:8px;font-size:13px"></div>' +
      '<div style="margin-top:6px;font-size:11px;color:#888">🔒 0 byte dikirim • jalan tanpa internet</div></div>';

    const cv = container.querySelector("#z-cv"), ctx = cv.getContext("2d");
    const msg = container.querySelector("#z-msg"), res = container.querySelector("#z-res");
    const net = container.querySelector("#z-net");
    const drawNet = () => net.textContent = navigator.onLine ? "🟢 online" : "🟡 offline";
    drawNet(); addEventListener("online", drawNet); addEventListener("offline", drawNet);

    const T = { x: 150, y: 80, r: 34 };
    let samples = [], holding = false, start = 0, done = false;

    function draw(progress) {
      ctx.clearRect(0, 0, 300, 160);
      ctx.beginPath(); ctx.arc(T.x, T.y, T.r, 0, 7); ctx.strokeStyle = "#bbb"; ctx.stroke();
      ctx.beginPath(); ctx.arc(T.x, T.y, T.r, -Math.PI / 2, -Math.PI / 2 + progress * 2 * Math.PI);
      ctx.strokeStyle = "#2a7"; ctx.lineWidth = 4; ctx.stroke(); ctx.lineWidth = 1;
    }
    draw(0);

    const inside = (x, y) => Math.hypot(x - T.x, y - T.y) <= T.r;
    const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };

    cv.addEventListener("pointerdown", e => {
      if (done) return; const p = pos(e);
      if (inside(p.x, p.y)) { holding = true; start = p.t; samples = [p]; cv.setPointerCapture(e.pointerId); }
    });
    cv.addEventListener("pointermove", e => {
      if (!holding || done) return; const p = pos(e);
      if (!inside(p.x, p.y)) { holding = false; draw(0); msg.textContent = "Kursor keluar! Coba lagi."; return; }
      samples.push(p);
    });
    cv.addEventListener("pointerup", () => { holding = false; if (!done) draw(0); });

    (function loop() {
      requestAnimationFrame(loop);
      if (!holding || done) return;
      const el = (performance.now() - start) / 1000;
      draw(clamp(el / 3, 0, 1));
      if (el >= 3) { done = true; holding = false; finish(); }
    })();

    async function finish() {
      msg.textContent = "Menganalisis sinyal kemanusiaan...";
      const { score, parts, reason } = scoreSignals(samples);
      if (reason || score < threshold) {
        res.innerHTML = "⚠️ Skor kemanusiaan: <b>" + score + "</b> (di bawah " + threshold + "). Coba lagi.";
        done = false; draw(0); if (opts.onFail) opts.onFail(score); return;
      }
      const payload = {
        v: 1, type: "zcp2o-human-proof", challenge: "steady-hold", score,
        signals_digest: await sha256hex(samples), issued_at: Math.floor(Date.now() / 1000), tier: "light"
      };
      const { sig, pubkey } = await signProof(payload);
      const token = b64url(strBytes(JSON.stringify(Object.assign({}, payload, { sig, pubkey }))));
      res.innerHTML = "✅ <b>VERIFIED</b> (skor " + score + "). Token ditandatangani on-device.";
      msg.textContent = "Anda terbukti manusia — tanpa mata-mata, tanpa internet.";
      if (opts.onVerified) opts.onVerified(token);
    }
  }

  global.Zcp2oHumanProof = { init, verify: verifyToken };
})(window);