/* =========================================================
   ZCP2O Human Proof v0.2 Lite — Multi-Layer Verification
   Layers: [1] Motor (3 challenges) [2] Sensor [3] Signing
   Self-contained, offline, privacy-first. 0 bytes exfiltrated.
   ========================================================= */
(function (global) {
  "use strict";

  /* ---------------- utils ---------------- */
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
  const stdev=a=>{const m=mean(a);return Math.sqrt(mean(a.map(v=>(v-m)*(v-m))));};
  const cv=a=>{const m=mean(a);return m?stdev(a)/m:0;};
  const rampUp=(v,lo,hi)=>clamp((v-lo)/(hi-lo),0,1)*100;
  function band(v,iMin,iMax,tMin,tMax){
    if(v>=iMin&&v<=iMax)return 100;
    if(v<iMin)return rampUp(v,tMin,iMin);
    return 100-rampUp(v,iMax,tMax);
  }
  const b64url=b=>{let s="";b.forEach(x=>s+=String.fromCharCode(x));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");};
  const strBytes=s=>new TextEncoder().encode(s);
  async function sha256hex(o){const d=await crypto.subtle.digest("SHA-256",strBytes(JSON.stringify(o)));return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,"0")).join("");}

  /* ---------------- Layer 1: motor scorer ---------------- */
  function scoreMotor(samples){
    if(samples.length<30)return{score:0,parts:{}};
    const dirs=[];for(let i=1;i<samples.length;i++){const dx=samples[i].x-samples[i-1].x,dy=samples[i].y-samples[i-1].y;if(dx||dy)dirs.push(Math.atan2(dy,dx));}
    const bins=new Array(16).fill(0);dirs.forEach(a=>bins[clamp(Math.floor(((a+Math.PI)/(2*Math.PI))*16),0,15)]++);
    let H=0;bins.forEach(c=>{if(c){const p=c/dirs.length;H-=p*Math.log2(p);}});
    const entropy=rampUp((H/4)*100,20,60);
    const res=[];for(let i=1;i<samples.length-1;i++){const mx=(samples[i-1].x+samples[i+1].x)/2,my=(samples[i-1].y+samples[i+1].y)/2;res.push(Math.hypot(samples[i].x-mx,samples[i].y-my));}
    const jitter=band(stdev(res),0.2,2.5,0.05,6);
    const sp=[];for(let i=1;i<samples.length;i++){const dt=samples[i].t-samples[i-1].t||1;sp.push(Math.hypot(samples[i].x-samples[i-1].x,samples[i].y-samples[i-1].y)/dt);}
    const velocity=band(cv(sp),0.25,1.2,0.05,2);
    const gaps=[];for(let i=1;i<samples.length;i++)gaps.push(samples[i].t-samples[i-1].t);
    const timing=band(cv(gaps),0.2,1.5,0.02,2.5);
    return{score:Math.round(0.3*entropy+0.3*jitter+0.2*velocity+0.2*timing),parts:{entropy,jitter,velocity,timing}};
  }

  /* ---------------- Layer 2: sensor scorer ---------------- */
  function scoreSensor(sens,samples){
    if(sens.length>20){const m=sens.map(s=>Math.hypot(s.x,s.y,s.z));const d=[];for(let i=1;i<m.length;i++)d.push(Math.abs(m[i]-m[i-1]));return{score:Math.round(band(stdev(d),0.02,0.6,0,1.5)),present:true};}
    const ps=samples.map(s=>s.p).filter(p=>p!=null&&p>0);
    if(ps.length>10)return{score:Math.round(band(stdev(ps),0.02,0.3,0,0.8)),present:true};
    return{score:50,present:false};
  }

  /* ---------------- Layer 3: signer ---------------- */
  async function signProof(p){const kp=await crypto.subtle.generateKey({name:"RSA-PSS",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["sign","verify"]);
    const sig=new Uint8Array(await crypto.subtle.sign({name:"RSA-PSS",saltLength:32},kp.privateKey,strBytes(JSON.stringify(p))));
    const jwk=await crypto.subtle.exportKey("jwk",kp.publicKey);return{sig:b64url(sig),pubkey:{kty:jwk.kty,n:jwk.n,e:jwk.e}};}
  async function verifyToken(t){try{const o=JSON.parse(atob(t.replace(/-/g,"+").replace(/_/g,"/")));const{sig,pubkey,...p}=o;
    const k=await crypto.subtle.importKey("jwk",pubkey,{name:"RSA-PSS",hash:"SHA-256"},false,["verify"]);
    const sb=Uint8Array.from(atob(sig.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
    return await crypto.subtle.verify({name:"RSA-PSS",saltLength:32},k,sb,strBytes(JSON.stringify(p)));}catch(e){return false;}}

  /* ---------------- widget ---------------- */
  function init(opts){
    const box=document.querySelector(opts.container);if(!box)return;
    const TH=opts.threshold||70;
    const MODES=["steady-hold","trace-line","hold-release"];
    const mode=opts.challenge&&MODES.includes(opts.challenge)?opts.challenge:MODES[Math.floor(Math.random()*3)];
    const LABEL={"steady-hold":"Tahan kursor di lingkaran 3 detik","trace-line":"Telusuri jalur hijau kiri→kanan","hold-release":"Tahan tombol, lepas TEPAT di 2,5 dtk"};

    box.innerHTML='<div style="font-family:sans-serif;max-width:360px;border:1px solid #ccc;border-radius:10px;padding:14px;background:#fafafa;color:#111">'
      +'<b>🛡️ ZCP2O Human Proof</b> <span id="z-net" style="float:right"></span>'
      +'<div style="font-size:11px;color:#666;margin:4px 0">Ritual: <span id="z-step">1 Motorik</span> → 2 Sensor → 3 Signing • 🎲 '+mode+'</div>'
      +'<div id="z-msg" style="margin:6px 0;color:#333">'+LABEL[mode]+'</div>'
      +'<div style="background:#eee;border-radius:6px;height:10px;overflow:hidden"><div id="z-meter" style="height:10px;width:0%;background:#2a7;transition:width .2s"></div></div>'
      +'<div id="z-live" style="font-size:11px;color:#888;margin:2px 0">human-ness: –</div>'
      +'<canvas id="z-cv" width="300" height="160" style="border:1px solid #ddd;border-radius:6px;background:#fff;touch-action:none;margin-top:6px"></canvas>'
      +'<div id="z-res" style="margin-top:8px;font-size:13px"></div>'
      +'<div style="margin-top:6px;font-size:11px;color:#888">🔒 0 byte dikirim • jalan tanpa internet</div></div>';

    const cv=box.querySelector("#z-cv"),ctx=cv.getContext("2d");
    const msg=box.querySelector("#z-msg"),res=box.querySelector("#z-res"),meter=box.querySelector("#z-meter"),live=box.querySelector("#z-live"),step=box.querySelector("#z-step"),net=box.querySelector("#z-net");
    const drawNet=()=>net.textContent=navigator.onLine?"🟢 online":"🟡 offline";drawNet();addEventListener("online",drawNet);addEventListener("offline",drawNet);

    let samples=[],sens=[],holding=false,tracing=false,start=0,done=false,misses=0,relScore=0;
    const T={x:150,y:80,r:34};
    const corr=x=>80+30*Math.sin(x/40), HALF=20;

    // sensor collector (Layer 2)
    let sensOn=false;
    function startSensors(){const h=e=>{const a=e.accelerationIncludingGravity;if(a&&a.x!=null)sens.push({x:a.x,y:a.y,z:a.z});};window.addEventListener("devicemotion",h);sensOn=true;return h;}
    let sensHandler=null;
    try{if(typeof DeviceMotionEvent!=="undefined"&&DeviceMotionEvent.requestPermission){/* iOS: request on first tap */}else sensHandler=startSensors();}catch(e){}

    const pos=e=>{const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now(),p:e.pressure||null};};
    const inside=(x,y)=>Math.hypot(x-T.x,y-T.y)<=T.r;

    function draw(){
      ctx.clearRect(0,0,300,160);
      if(mode==="steady-hold"){ctx.beginPath();ctx.arc(T.x,T.y,T.r,0,7);ctx.strokeStyle="#bbb";ctx.stroke();
        if(holding){const el=clamp((performance.now()-start)/3000,0,1);ctx.beginPath();ctx.arc(T.x,T.y,T.r,-Math.PI/2,-Math.PI/2+el*2*Math.PI);ctx.strokeStyle="#2a7";ctx.lineWidth=4;ctx.stroke();ctx.lineWidth=1;}}
      else if(mode==="trace-line"){ctx.beginPath();for(let x=0;x<=300;x+=4){const y=corr(x);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle="#cfc";ctx.lineWidth=HALF*2;ctx.stroke();ctx.lineWidth=1;
        ctx.beginPath();for(let x=0;x<=300;x+=4){const y=corr(x);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle="#2a7";ctx.stroke();
        ctx.fillStyle="#063";ctx.fillRect(0,corr(0)-HALF,14,HALF*2);ctx.fillRect(286,corr(300)-HALF,14,HALF*2);
        if(samples.length){ctx.beginPath();samples.forEach((s,i)=>i?ctx.lineTo(s.x,s.y):ctx.moveTo(s.x,s.y));ctx.strokeStyle="#f80";ctx.stroke();}}
      else{ // hold-release
        ctx.fillStyle=holding?"#fd7":"#eee";ctx.strokeStyle="#999";ctx.beginPath();ctx.roundRect?ctx.roundRect(60,50,180,60,10):ctx.rect(60,50,180,60);ctx.fill();ctx.stroke();
        ctx.fillStyle="#111";ctx.font="16px sans-serif";ctx.textAlign="center";
        ctx.fillText(holding?((performance.now()-start)/1000).toFixed(2)+" s":"TAHAN DI SINI",150,85);ctx.textAlign="left";}
    }

    cv.addEventListener("pointerdown",e=>{if(done)return;const p=pos(e);
      if(!sensHandler&&typeof DeviceMotionEvent!=="undefined"&&DeviceMotionEvent.requestPermission){DeviceMotionEvent.requestPermission().then(r=>{if(r==="granted")sensHandler=startSensors();}).catch(()=>{});}
      if(!sensHandler&&!sensOn)sensHandler=startSensors();
      cv.setPointerCapture(e.pointerId);
      if(mode==="steady-hold"){if(inside(p.x,p.y)){holding=true;start=p.t;samples=[p];}}
      else if(mode==="trace-line"){if(p.x<30&&Math.abs(p.y-corr(p.x))<HALF+10){tracing=true;samples=[p];misses=0;}}
      else{holding=true;start=p.t;samples=[p];}
    });
    cv.addEventListener("pointermove",e=>{if(done)return;const p=pos(e);
      if(mode==="steady-hold"&&holding){if(!inside(p.x,p.y)){holding=false;msg.textContent="Keluar! Coba lagi.";return;}samples.push(p);}
      else if(mode==="trace-line"&&tracing){samples.push(p);if(Math.abs(p.y-corr(p.x))>HALF)misses++;if(misses>40){tracing=false;msg.textContent="Keluar jalur! Ulangi.";samples=[];}else if(p.x>286)finish(100-Math.min(100,misses*3),"adherence");}
      else if(mode==="hold-release"&&holding)samples.push(p);
    });
    cv.addEventListener("pointerup",e=>{if(done)return;
      if(mode==="hold-release"&&holding){holding=false;const el=(performance.now()-start)/1000;const err=Math.abs(el-2.5);
        relScore=Math.round(band(err,0.05,0.5,0.0,1.0));finish(relScore,"release-timing");}
      else if(mode==="steady-hold"&&holding)holding=false;
      else tracing=false;
    });

    (function loop(){requestAnimationFrame(loop);
      draw();
      if((holding||tracing)&&samples.length>=10){const m=scoreMotor(samples);meter.style.width=m.score+"%";live.textContent="human-ness: "+m.score+"% (motor)";}
      if(mode==="steady-hold"&&holding&&(performance.now()-start)>=3000){holding=false;const j=scoreMotor(samples).parts.jitter||50;finish(j,"micro-tremor");}
    })();

    async function finish(bonus,bonusLabel){
      if(done)return;done=true;step.textContent="2 Sensor";
      msg.textContent="Menganalisis motorik + sensor...";
      if(sensHandler){window.removeEventListener("devicemotion",sensHandler);sensHandler=null;}
      const motor=scoreMotor(samples);const sensor=scoreSensor(sens,samples);
      const final=Math.round(0.5*motor.score+0.3*sensor.score+0.2*bonus);
      meter.style.width=final+"%";
      if(samples.length<30||final<TH){res.innerHTML="⚠️ Skor: <b>"+final+"</b> (motor "+motor.score+" / sensor "+sensor.score+" / "+bonusLabel+" "+bonus+"). Coba lagi.";done=false;return;}
      step.textContent="3 Signing";
      const payload={v:2,type:"zcp2o-human-proof",challenge:mode,score:final,
        layers:{motor:motor.score,sensor:sensor.score,sensorPresent:sensor.present,[bonusLabel]:bonus},
        signals_digest:await sha256hex(samples),issued_at:Math.floor(Date.now()/1000),tier:"light",assurance:"self"};
      const{sig,pubkey}=await signProof(payload);
      const token=b64url(strBytes(JSON.stringify(Object.assign({},payload,{sig,pubkey}))));
      res.innerHTML="✅ <b>VERIFIED</b> skor "+final+" (motor "+motor.score+", sensor "+sensor.score+", "+bonusLabel+" "+bonus+").";
      msg.textContent="Anda terbukti manusia — 3 lapisan, tanpa mata-mata.";
      if(opts.onVerified)opts.onVerified(token);
    }
  }

  global.Zcp2oHumanProof={init,verify:verifyToken};
})(window);