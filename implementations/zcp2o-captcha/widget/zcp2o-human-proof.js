/* =========================================================
   ZCP2O Human Proof — CORE (Induk / Jembatan) v0.4
   Copyright (C) 2026 ZCP2O Foundation. AGPL-3.0. Trademarks reserved.
   Memilih & memanggil anak (challenge) secara acak.
   ========================================================= */
(function (global) {
  "use strict";
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
  const stdev=a=>{const m=mean(a);return Math.sqrt(mean(a.map(v=>(v-m)*(v-m))));};
  const cv=a=>{const m=mean(a);return m?stdev(a)/m:0;};
  const rampUp=(v,lo,hi)=>clamp((v-lo)/(hi-lo),0,1)*100;
  function band(v,iMin,iMax,tMin,tMax){if(v>=iMin&&v<=iMax)return 100;if(v<iMin)return rampUp(v,tMin,iMin);return 100-rampUp(v,iMax,tMax);}
  const b64url=b=>{let s="";b.forEach(x=>s+=String.fromCharCode(x));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");};
  const strBytes=s=>new TextEncoder().encode(s);
  async function sha256hex(o){const d=await crypto.subtle.digest("SHA-256",strBytes(JSON.stringify(o)));return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,"0")).join("");}

  function scoreMotor(s){if(s.length<30)return{score:0,parts:{}};
    const dirs=[];for(let i=1;i<s.length;i++){const dx=s[i].x-s[i-1].x,dy=s[i].y-s[i-1].y;if(dx||dy)dirs.push(Math.atan2(dy,dx));}
    const bins=new Array(16).fill(0);dirs.forEach(a=>bins[clamp(Math.floor(((a+Math.PI)/(2*Math.PI))*16),0,15)]++);
    let H=0;bins.forEach(c=>{if(c){const p=c/dirs.length;H-=p*Math.log2(p);}});const entropy=rampUp((H/4)*100,20,60);
    const res=[];for(let i=1;i<s.length-1;i++){const mx=(s[i-1].x+s[i+1].x)/2,my=(s[i-1].y+s[i+1].y)/2;res.push(Math.hypot(s[i].x-mx,s[i].y-my));}const jitter=band(stdev(res),0.2,2.5,0.05,6);
    const sp=[];for(let i=1;i<s.length;i++){const dt=s[i].t-s[i-1].t||1;sp.push(Math.hypot(s[i].x-s[i-1].x,s[i].y-s[i-1].y)/dt);}const velocity=band(cv(sp),0.25,1.2,0.05,2);
    const g=[];for(let i=1;i<s.length;i++)g.push(s[i].t-s[i-1].t);const timing=band(cv(g),0.2,1.5,0.02,2.5);
    return{score:Math.round(0.3*entropy+0.3*jitter+0.2*velocity+0.2*timing),parts:{entropy,jitter,velocity,timing}};}
  function scoreSensor(sens,s){if(sens.length>20){const m=sens.map(x=>Math.hypot(x.x,x.y,x.z));const d=[];for(let i=1;i<m.length;i++)d.push(Math.abs(m[i]-m[i-1]));return{score:Math.round(band(stdev(d),0.02,0.6,0,1.5)),present:true};}
    const ps=s.map(x=>x.p).filter(p=>p!=null);if(ps.length>10){const sp=Math.max(...ps)-Math.min(...ps);if(sp>0.01)return{score:Math.round(band(stdev(ps),0.02,0.3,0,0.8)),present:true};}return{score:50,present:false};}
  async function signProof(p){const kp=await crypto.subtle.generateKey({name:"RSA-PSS",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["sign","verify"]);
    const sig=new Uint8Array(await crypto.subtle.sign({name:"RSA-PSS",saltLength:32},kp.privateKey,strBytes(JSON.stringify(p))));
    const jwk=await crypto.subtle.exportKey("jwk",kp.publicKey);return{sig:b64url(sig),pubkey:{kty:jwk.kty,n:jwk.n,e:jwk.e}};}
  async function verifyToken(t){try{const o=JSON.parse(atob(t.replace(/-/g,"+").replace(/_/g,"/")));const{sig,pubkey,...p}=o;
    const k=await crypto.subtle.importKey("jwk",pubkey,{name:"RSA-PSS",hash:"SHA-256"},false,["verify"]);
    const sb=Uint8Array.from(atob(sig.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
    return await crypto.subtle.verify({name:"RSA-PSS",saltLength:32},k,sb,strBytes(JSON.stringify(p)));}catch(e){return false;}}

  const Zcp2oCore={clamp,mean,stdev,cv,rampUp,band,scoreMotor,scoreSensor};
  global.Zcp2oCore=Zcp2oCore;
  global.Zcp2oChallenges=global.Zcp2oChallenges||{};

  const L={title:"🛡️ ZCP2O Human Proof",tip:"💡 Tip: be natural — human hands wobble. Bots are too perfect.",
    analyzing:"Analyzing motor + sensor signals...",verified:s=>"✅ <b>VERIFIED</b> score "+s,failed:s=>"⚠️ Score: <b>"+s+"</b> — below threshold. Try again.",
    proven:"You are proven human — 3 layers, no spying.",zero:"🔒 0 bytes sent • works without internet",live:"human-ness: –"};

  function init(opts){
    const box=document.querySelector(opts.container);if(!box)return;
    const TH=opts.threshold||70;
    const keys=Object.keys(global.Zcp2oChallenges);
    if(!keys.length){box.innerHTML="<div style='color:#900'>No challenges loaded. Include zcp2o-hp*.js files.</div>";return;}
    const id=opts.challenge&&global.Zcp2oChallenges[opts.challenge]?opts.challenge:keys[Math.floor(Math.random()*keys.length)];
    const ch=global.Zcp2oChallenges[id];
    const meta=ch.meta?ch.meta():{label:ch.label,instructions:ch.instructions};

    box.innerHTML='<div style="font-family:sans-serif;max-width:380px;border:1px solid #ccc;border-radius:10px;padding:14px;background:#fafafa;color:#111">'
      +'<b>'+L.title+'</b> <span id="z-net" style="float:right"></span>'
      +'<div style="font-size:11px;color:#999;margin:4px 0">Ritual: <span id="z-s1">① Motor</span> → <span id="z-s2">② Sensor</span> → <span id="z-s3">③ Signing</span> • 🎲 '+id+'</div>'
      +'<div id="z-msg" style="margin:6px 0;color:#333;font-weight:bold">'+meta.label+'</div>'
      +'<ol style="margin:0 0 6px 18px;padding:0;font-size:12px;color:#555">'+meta.instructions.map(t=>"<li>"+t+"</li>").join("")+'</ol>'
      +'<div style="font-size:11px;color:#888;margin-bottom:6px">'+L.tip+'</div>'
      +'<div style="background:#eee;border-radius:6px;height:10px;overflow:hidden"><div id="z-meter" style="height:10px;width:0%;background:#2a7;transition:width .2s"></div></div>'
      +'<div id="z-live" style="font-size:11px;color:#888;margin:2px 0">'+L.live+'</div>'
      +'<canvas id="z-cv" width="300" height="160" style="border:1px solid #ddd;border-radius:6px;background:#fff;touch-action:none;margin-top:6px"></canvas>'
      +'<div id="z-res" style="margin-top:8px;font-size:13px"></div>'
      +'<div style="margin-top:6px;font-size:11px;color:#888">'+L.zero+'</div></div>';

    const cvv=box.querySelector("#z-cv"),ctx=cvv.getContext("2d");
    const msg=box.querySelector("#z-msg"),res=box.querySelector("#z-res"),meter=box.querySelector("#z-meter"),live=box.querySelector("#z-live"),net=box.querySelector("#z-net");
    const S=[box.querySelector("#z-s1"),box.querySelector("#z-s2"),box.querySelector("#z-s3")];
    const setStep=n=>S.forEach((el,i)=>{el.style.fontWeight=(i===n)?"bold":"normal";el.style.color=(i===n)?"#0a7":"#999";});setStep(0);
    const drawNet=()=>net.textContent=navigator.onLine?"🟢 online":"🟡 offline";drawNet();addEventListener("online",drawNet);addEventListener("offline",drawNet);

    let samples=[],sens=[],done=false;
    const pos=e=>{const r=cvv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now(),p:e.pressure!=null?e.pressure:null};};

    let sensHandler=null,sensOn=false;
    const startSensors=()=>{const h=e=>{const a=e.accelerationIncludingGravity;if(a&&a.x!=null)sens.push({x:a.x,y:a.y,z:a.z});};addEventListener("devicemotion",h);sensOn=true;return h;};
    try{if(!(typeof DeviceMotionEvent!=="undefined"&&DeviceMotionEvent.requestPermission))sensHandler=startSensors();}catch(e){}
    const ensureSensors=()=>{if(!sensHandler&&typeof DeviceMotionEvent!=="undefined"&&DeviceMotionEvent.requestPermission){DeviceMotionEvent.requestPermission().then(r=>{if(r==="granted")sensHandler=startSensors();}).catch(()=>{});}if(!sensHandler&&!sensOn)sensHandler=startSensors();};

    const api={canvas:cvv,ctx,W:300,H:160,pos,core:Zcp2oCore,
      push:p=>samples.push(p), clear:()=>{samples.length=0;}, getSamples:()=>samples,
      setMsg:t=>{msg.textContent=t;}, finish:(b,l)=>finish(b,l)};
    const child=ch.create(api);
    api.active=child.active||(()=>false);

    cvv.addEventListener("pointerdown",e=>{if(done)return;ensureSensors();cvv.setPointerCapture(e.pointerId);child.down&&child.down(api.pos(e));});
    cvv.addEventListener("pointermove",e=>{if(done)return;child.move&&child.move(api.pos(e));});
    cvv.addEventListener("pointerup",e=>{if(done)return;child.up&&child.up(api.pos(e));});

    (function loop(){requestAnimationFrame(loop);ctx.clearRect(0,0,300,160);child.draw&&child.draw();child.tick&&child.tick(performance.now());
      if(api.active()&&samples.length>=10){const m=scoreMotor(samples);meter.style.width=m.score+"%";live.textContent="human-ness: "+m.score+"% (motor)";}})();

    async function finish(bonus,bonusLabel){
      if(done)return;done=true;setStep(1);msg.textContent=L.analyzing;
      if(sensHandler){removeEventListener("devicemotion",sensHandler);sensHandler=null;}
      const motor=scoreMotor(samples);const sensor=scoreSensor(sens,samples);
      const final=Math.round(0.5*motor.score+0.3*sensor.score+0.2*bonus);
      meter.style.width=final+"%";
      const sensTxt=sensor.present?("sensor "+sensor.score):"sensor n/a";
      if(samples.length<30||final<TH){res.innerHTML=L.failed(final)+" (motor "+motor.score+", "+sensTxt+", "+bonusLabel+" "+bonus+").";done=false;return;}
      setStep(2);
      const payload={v:4,type:"zcp2o-human-proof",challenge:id,score:final,
        layers:{motor:motor.score,sensor:sensor.present?sensor.score:null,[bonusLabel]:bonus},
        signals_digest:await sha256hex(samples),issued_at:Math.floor(Date.now()/1000),tier:"light",assurance:"self"};
      const{sig,pubkey}=await signProof(payload);
      const token=b64url(strBytes(JSON.stringify(Object.assign({},payload,{sig,pubkey}))));
      res.innerHTML=L.verified(final)+" (motor "+motor.score+", "+sensTxt+", "+bonusLabel+" "+bonus+").";
      msg.textContent=L.proven;
      if(opts.onVerified)opts.onVerified(token);
    }
  }

  global.Zcp2oHumanProof={init,verify:verifyToken};
})(window);