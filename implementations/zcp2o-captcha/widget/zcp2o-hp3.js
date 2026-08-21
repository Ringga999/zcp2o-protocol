/* ANAK 3: HOLD-RELEASE "Sweet Spot Meter". Registers to Zcp2oChallenges. */
(function (global) {
  "use strict";
  global.Zcp2oChallenges=global.Zcp2oChallenges||{};

  global.Zcp2oChallenges["hold-release"]={
    meta(){return{label:"Hold the button, release when the needle is in the GREEN zone.",
      instructions:["Press and hold the yellow button.","Watch the needle sweep across the bar.","Release exactly while it's inside the green zone."]};},
    create(api){
      const ctx=api.ctx,C=api.core;
      const phase=Math.random()*6.283;
      const zw=0.16, zc=0.2+Math.random()*0.6;         // zone center & width
      const za=zc-zw/2, zb=zc+zw/2;
      const X=n=>20+n*260;
      let holding=false,lastP=null,needle=0;

      return{
        draw(){
          // bar
          ctx.fillStyle="#eee";ctx.strokeStyle="#999";ctx.fillRect(20,50,260,18);ctx.strokeRect(20,50,260,18);
          // green zone
          ctx.fillStyle="rgba(42,167,119,.8)";ctx.fillRect(X(za),50,X(zb)-X(za),18);
          // needle
          ctx.strokeStyle="#111";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(needle),46);ctx.lineTo(X(needle),72);ctx.stroke();ctx.lineWidth=1;
          // button
          ctx.fillStyle=holding?"#fd7":"#eee";ctx.strokeStyle="#999";
          ctx.beginPath();ctx.roundRect?ctx.roundRect(60,95,180,50,10):ctx.rect(60,95,180,50);ctx.fill();ctx.stroke();
          ctx.fillStyle="#111";ctx.font="15px sans-serif";ctx.textAlign="center";
          ctx.fillText(holding?"RELEASE IN GREEN!":"HOLD",150,125);ctx.textAlign="left";
        },
        down(p){if(p.x>=60&&p.x<=240&&p.y>=95&&p.y<=145){holding=true;lastP=p;api.clear();api.push(p);}},
        move(p){if(holding){lastP=p;api.push(p);}},
        tick(now){needle=0.5+0.5*Math.sin(now*0.0025+phase);
          if(holding&&lastP)api.push({x:lastP.x,y:lastP.y,t:now});},
        up(p){if(holding){holding=false;
          const d=Math.abs(needle-(za+zb)/2), half=zw/2;
          let bonus; if(d<=half)bonus=Math.round(100-(d/half)*25); else bonus=Math.round(Math.max(0,70-(d-half)*400));
          api.finish(bonus,"sweet-spot");}},
        active(){return holding;}
      };
    }
  };
})(window);