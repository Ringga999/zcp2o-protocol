/* ANAK 12: LETTER CAPTCHA "Noisy Alpha" — tap letters in order (mobile-friendly). */
(function(global){
"use strict";
global.Zcp2oChallenges=global.Zcp2oChallenges||{};
let current={};
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function genLetters(){
  const n=4+Math.floor(Math.random()*3); // 4-6 huruf
  const A="ABCDEFGHIJKLMNOPQRSTUVWXYZ";let t="";
  for(let i=0;i<n;i++)t+=A[Math.floor(Math.random()*26)];
  const decoys=[];for(let i=0;i<4;i++)decoys.push(A[Math.floor(Math.random()*26)]);
  return{target:t,tiles:shuffle(t.split("").concat(decoys)),attempts:0};
}
global.Zcp2oChallenges["letter-captcha"]={
  meta(){current=genLetters();return{label:"Tap the letters in the correct order.",
    instructions:["Read the crossed-out letters at the top.","Tap the letter tiles below IN ORDER (or type them).","Press Verify when done."]};},
  create(api){
    const ctx=api.ctx;
    let noise=[];function genNoise(){noise=[];for(let i=0;i<8;i++)noise.push({x1:30+Math.random()*40,y1:15+Math.random()*40,x2:180+Math.random()*60,y2:15+Math.random()*40,width:1+Math.random()*2});}
    genNoise();
    let userInput="",submitted=false;

    function tileRects(){return current.tiles.map((k,i)=>({k,x:20+(i%5)*52,y:84+Math.floor(i/5)*24,w:52,h:22}));}

    function drawLetters(){
      const t=current.target,n=t.length,sp=Math.min(44,240/n);
      ctx.save();ctx.fillStyle="#fff";ctx.fillRect(20,10,260,50);ctx.strokeStyle="#e0e0e0";ctx.strokeRect(20,10,260,50);
      ctx.fillStyle="#1a56db";ctx.font="bold 32px 'Courier New', monospace";ctx.textAlign="center";ctx.textBaseline="middle";
      for(let i=0;i<n;i++)ctx.fillText(t[i],150-((n-1)*sp)/2+i*sp,35);
      ctx.strokeStyle="rgba(211,47,47,0.6)";noise.forEach(l=>{ctx.beginPath();ctx.moveTo(l.x1,l.y1);ctx.lineTo(l.x2,l.y2);ctx.lineWidth=l.width;ctx.stroke();});
      ctx.restore();
    }
    function drawUI(){
      ctx.fillStyle="#fff";ctx.fillRect(20,64,260,18);ctx.strokeStyle="#ccc";ctx.strokeRect(20,64,260,18);
      ctx.fillStyle=userInput?"#333":"#999";ctx.font="15px monospace";ctx.textAlign="left";ctx.textBaseline="middle";
      ctx.fillText(userInput||"Tap letters in order...",30,73);
      tileRects().forEach(r=>{ctx.fillStyle="#f0f0f0";ctx.fillRect(r.x+1,r.y,r.w-2,r.h);ctx.strokeStyle="#bbb";ctx.strokeRect(r.x+1,r.y,r.w-2,r.h);
        ctx.fillStyle="#111";ctx.font="bold 14px sans-serif";ctx.textAlign="center";ctx.fillText(r.k,r.x+r.w/2,r.y+r.h/2);});
      ctx.fillStyle="#4ade80";ctx.fillRect(20,134,125,22);ctx.fillStyle="#111";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("✓ Verify",82,145);
      ctx.fillStyle="#f59e0b";ctx.fillRect(155,134,125,22);ctx.fillStyle="#111";ctx.fillText("↻ New Code",217,145);
    }
    return{
      draw(){ctx.clearRect(0,0,300,160);ctx.fillStyle="#f8f9fa";ctx.fillRect(0,0,300,160);drawLetters();drawUI();},
      down(p){if(submitted)return;api.push(p);
        if(p.x>=20&&p.x<=145&&p.y>=134&&p.y<=156){check();return;}
        if(p.x>=155&&p.x<=280&&p.y>=134&&p.y<=156){regen();return;}
        const tr=tileRects().find(r=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h);
        if(tr&&userInput.length<current.target.length)userInput+=tr.k;},
      key(char){if(submitted)return;if(/^[a-zA-Z]$/.test(char)&&userInput.length<current.target.length)userInput+=char.toUpperCase();
        if(char==="Backspace")userInput=userInput.slice(0,-1);},
      move(p){if(!submitted)api.push(p);},
      up(){},tick(){},active(){return !submitted;}
    };
    function regen(){current=genLetters();genNoise();userInput="";submitted=false;api.setMsg("New code generated!");}
    function check(){
      if(userInput===current.target){submitted=true;api.finish(95,"letters-correct");}
      else{current.attempts++;if(current.attempts>=3)api.setMsg("Failed 3x. Click 'New Code'.");else api.setMsg(`Wrong! Try again. (${current.attempts}/3)`);userInput="";}
    }
  }
};
})(window);