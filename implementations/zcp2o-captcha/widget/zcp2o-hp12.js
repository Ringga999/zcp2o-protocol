/* ANAK 12: LETTER CAPTCHA "Noisy Alpha". Type 4-6 crossed-out letters. */
(function(global){
"use strict";
global.Zcp2oChallenges=global.Zcp2oChallenges||{};
let current={};
function genLetters(){
  const n=4+Math.floor(Math.random()*3); // 4-6 huruf
  const A="ABCDEFGHIJKLMNOPQRSTUVWXYZ";let s="";
  for(let i=0;i<n;i++)s+=A[Math.floor(Math.random()*26)];
  return{target:s,attempts:0};
}
global.Zcp2oChallenges["letter-captcha"]={
  meta(){current=genLetters();return{label:"Type the letters shown above.",
    instructions:["Read the crossed-out letters.","Type them (tap the box first on mobile to open keyboard).","Press Verify when done."]};},
  create(api){
    const ctx=api.ctx;
    let noise=[];function genNoise(){noise=[];for(let i=0;i<8;i++)noise.push({x1:30+Math.random()*40,y1:15+Math.random()*40,x2:180+Math.random()*60,y2:15+Math.random()*40,width:1+Math.random()*2});}
    genNoise();
    let userInput="",submitted=false,lastP={x:150,y:95};
    // Input tersembunyi → memancing keyboard virtual di HP
    const inp=document.createElement("input");
    inp.type="text";inp.autocapitalize="off";inp.autocomplete="off";inp.spellcheck=false;
    inp.style.cssText="position:absolute;opacity:0.02;left:0;top:0;width:2px;height:2px;font-size:16px;";
    api.canvas.parentNode.appendChild(inp);
    inp.addEventListener("input",()=>{userInput=inp.value.replace(/[^a-zA-Z]/g,"").toUpperCase().slice(0,6);inp.value=userInput;api.push({x:lastP.x,y:lastP.y,t:performance.now()});});

    function drawLetters(){
      const t=current.target,n=t.length,sp=Math.min(44,240/n);
      ctx.save();ctx.fillStyle="#fff";ctx.fillRect(20,10,260,60);ctx.strokeStyle="#e0e0e0";ctx.strokeRect(20,10,260,60);
      ctx.fillStyle="#1a56db";ctx.font="bold 34px 'Courier New', monospace";ctx.textAlign="center";ctx.textBaseline="middle";
      for(let i=0;i<n;i++)ctx.fillText(t[i],150-((n-1)*sp)/2+i*sp,40);
      ctx.strokeStyle="rgba(211,47,47,0.6)";noise.forEach(l=>{ctx.beginPath();ctx.moveTo(l.x1,l.y1);ctx.lineTo(l.x2,l.y2);ctx.lineWidth=l.width;ctx.stroke();});
      ctx.restore();
    }
    function drawUI(){
      ctx.fillStyle="#fff";ctx.fillRect(20,80,260,30);ctx.strokeStyle="#ccc";ctx.strokeRect(20,80,260,30);
      ctx.fillStyle=userInput?"#333":"#999";ctx.font="18px monospace";ctx.textAlign="left";ctx.textBaseline="middle";
      ctx.fillText(userInput||"Tap here, then type...",30,95);
      ctx.fillStyle="#4ade80";ctx.fillRect(20,120,125,30);ctx.fillStyle="#111";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("✓ Verify",82,135);
      ctx.fillStyle="#f59e0b";ctx.fillRect(155,120,125,30);ctx.fillStyle="#111";ctx.fillText("↻ New Code",217,135);
    }
    return{
      draw(){ctx.clearRect(0,0,300,160);ctx.fillStyle="#f8f9fa";ctx.fillRect(0,0,300,160);drawLetters();drawUI();},
      down(p){if(submitted)return;lastP=p;api.push(p);inp.focus({preventScroll:true});
        if(p.x>=20&&p.x<=145&&p.y>=120&&p.y<=150){check();return;}
        if(p.x>=155&&p.x<=280&&p.y>=120&&p.y<=150){regen();return;}},
      move(p){if(!submitted){lastP=p;api.push(p);}},
      up(){},tick(){},active(){return !submitted;}
    };
    function regen(){current=genLetters();genNoise();userInput="";inp.value="";submitted=false;api.setMsg("New code generated!");}
    function check(){
      if(userInput===current.target){submitted=true;inp.blur();api.finish(95,"letters-correct");}
      else{current.attempts++;if(current.attempts>=3)api.setMsg("Failed 3x. Click 'New Code'.");else api.setMsg(`Wrong! Try again. (${current.attempts}/3)`);userInput="";inp.value="";}
    }
  }
};
})(window);