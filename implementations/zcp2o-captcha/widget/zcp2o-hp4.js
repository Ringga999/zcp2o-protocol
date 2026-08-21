/* ANAK 4: CLASSIC PACK — mempertahankan 3 game versi lama. */
(function (global) {
  "use strict";
  global.Zcp2oChallenges=global.Zcp2oChallenges||{};

  // ⭕ CLASSIC HOLD (lingkaran diam)
  global.Zcp2oChallenges["classic-hold"]={
    meta(){return{label:"Hold your cursor inside the circle for 3 seconds.",
      instructions:["Press and hold inside the circle.","Keep your hand natural — tiny wobbles are good!","Hold for 3 s until the green ring completes."]};},
    create(api){const ctx=api.ctx,C=api.core,T={x:150,y:80,r:34};let holding=false,start=0;
      const inside=(x,y)=>Math.hypot(x-T.x,y-T.y)<=T.r;
      return{
        draw(){ctx.beginPath();ctx.arc(T.x,T.y,T.r,0,7);ctx.strokeStyle="#bbb";ctx.stroke();
          if(holding){const el=C.clamp((performance.now()-start)/3000,0,1);ctx.beginPath();ctx.arc(T.x,T.y,T.r,-Math.PI/2,-Math.PI/2+el*2*Math.PI);ctx.strokeStyle="#2a7";ctx.lineWidth=4;ctx.stroke();ctx.lineWidth=1;}},
        down(p){if(inside(p.x,p.y)){holding=true;start=p.t;api.clear();api.push(p);}},
        move(p){if(holding){if(!inside(p.x,p.y)){holding=false;api.clear();api.setMsg("Outside! Try again.");}else api.push(p);}},
        up(){holding=false;},
        tick(now){if(holding&&(now-start)>=3000){holding=false;api.finish(C.scoreMotor(api.getSamples()).parts.jitter||50,"micro-tremor");}},
        active(){return holding;}};}
  };

  // 〰️ CLASSIC TRACE (jalur hijau tunggal)
  global.Zcp2oChallenges["classic-trace"]={
    meta(){return{label:"Trace the green path from left to right.",
      instructions:["Press on the green start zone (left).","Drag along the path toward the right end.","Stay inside the corridor — natural wobble is fine."]};},
    create(api){const ctx=api.ctx,HALF=20;let tracing=false,misses=0;const corr=x=>80+30*Math.sin(x/40);
      return{
        draw(){ctx.beginPath();for(let x=0;x<=300;x+=4){const y=corr(x);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle="#cfc";ctx.lineWidth=HALF*2;ctx.stroke();ctx.lineWidth=1;
          ctx.beginPath();for(let x=0;x<=300;x+=4){const y=corr(x);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle="#2a7";ctx.stroke();
          ctx.fillStyle="#063";ctx.fillRect(0,corr(0)-HALF,14,HALF*2);ctx.fillRect(286,corr(300)-HALF,14,HALF*2);
          const s=api.getSamples();if(s.length){ctx.beginPath();s.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle="#f80";ctx.lineWidth=2;ctx.stroke();ctx.lineWidth=1;}},
        down(p){if(p.x<30&&Math.abs(p.y-corr(p.x))<HALF+10){tracing=true;api.clear();api.push(p);misses=0;}},
        move(p){if(tracing){api.push(p);if(Math.abs(p.y-corr(p.x))>HALF)misses++;
          if(misses>40){tracing=false;api.clear();api.setMsg("Off path! Retry.");}
          else if(p.x>286)api.finish(100-Math.min(100,misses*3),"adherence");}},
        up(){tracing=false;},
        active(){return tracing;}};}
  };

  // ⏱️ CLASSIC RELEASE (lepas di 2,5 detik)
  global.Zcp2oChallenges["classic-release"]={
    meta(){return{label:"Press & hold, then release at exactly 2.5 seconds.",
      instructions:["Press and hold the yellow button.","Watch the on-screen timer.","Release as close to 2.50 s as you can."]};},
    create(api){const ctx=api.ctx,C=api.core;let holding=false,start=0,lastP=null;
      return{
        draw(){ctx.fillStyle=holding?"#fd7":"#eee";ctx.strokeStyle="#999";ctx.beginPath();ctx.roundRect?ctx.roundRect(60,50,180,60,10):ctx.rect(60,50,180,60);ctx.fill();ctx.stroke();
          ctx.fillStyle="#111";ctx.font="16px sans-serif";ctx.textAlign="center";
          ctx.fillText(holding?((performance.now()-start)/1000).toFixed(2)+" s":"HOLD HERE",150,85);ctx.textAlign="left";},
        down(p){if(p.x>=60&&p.x<=240&&p.y>=50&&p.y<=110){holding=true;start=p.t;lastP=p;api.clear();api.push(p);}},
        move(p){if(holding){lastP=p;api.push(p);}},
        tick(now){if(holding&&lastP)api.push({x:lastP.x,y:lastP.y,t:now});},
        up(){if(holding){holding=false;const el=(performance.now()-start)/1000;const err=Math.abs(el-2.5);
          api.finish(Math.round(C.band(err,0.05,0.5,0,1)),"release-timing");}},
        active(){return holding;}};}
  };
})(window);