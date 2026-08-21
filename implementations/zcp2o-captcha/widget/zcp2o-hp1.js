/* ANAK 1: TRACE-LINE "Wire Fix" (Among Us style). Registers to Zcp2oChallenges. */
(function (global) {
  "use strict";
  global.Zcp2oChallenges=global.Zcp2oChallenges||{};
  const PAL=[{c:"#22aa77",n:"GREEN"},{c:"#ee3344",n:"RED"},{c:"#3366ff",n:"BLUE"},{c:"#ffcc00",n:"YELLOW"}];
  let wires=[],target=0;
  function roll(){const ph=[0,1.6,3.2,4.8];wires=PAL.map((p,i)=>({c:p.c,n:p.n,f:x=>80+30*Math.sin(x/50+ph[i])}));target=Math.floor(Math.random()*4);}

  global.Zcp2oChallenges["trace-line"]={
    meta(){roll();return{label:"Trace the "+wires[target].n+" wire from left to right.",
      instructions:["Press on the "+wires[target].n+" start connector (left).","Drag along that same colored wire to the right end.","Ignore the other wires — stay on your color."]};},
    create(api){
      const ctx=api.ctx,HALF=16;let tracing=false,misses=0;
      const corr=x=>wires[target].f(x);
      return{
        draw(){wires.forEach(w=>{ctx.beginPath();for(let x=0;x<=300;x+=4){const y=w.f(x);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=w.c;ctx.lineWidth=5;ctx.stroke();});ctx.lineWidth=1;
          wires.forEach(w=>{ctx.fillStyle=w.c;ctx.fillRect(0,w.f(0)-8,10,16);ctx.fillRect(290,w.f(300)-8,10,16);});
          const s=api.getSamples();if(s.length){ctx.beginPath();s.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle="#f80";ctx.lineWidth=2;ctx.stroke();ctx.lineWidth=1;}},
        down(p){if(p.x<30&&Math.abs(p.y-corr(p.x))<HALF+12){tracing=true;api.clear();api.push(p);misses=0;}},
        move(p){if(tracing){api.push(p);if(Math.abs(p.y-corr(p.x))>HALF)misses++;
          if(misses>40){tracing=false;api.clear();api.setMsg("Off the wire! Retry.");}
          else if(p.x>286)api.finish(100-Math.min(100,misses*3),"adherence");}},
        up(){tracing=false;},
        active(){return tracing;}
      };
    }
  };
})(window);