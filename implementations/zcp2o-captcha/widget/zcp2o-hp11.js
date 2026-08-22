/* ANAK 11: SIMPLE MATH "Noisy Calc" + on-screen keypad (mobile-friendly). */
(function(global){
"use strict";
global.Zcp2oChallenges=global.Zcp2oChallenges||{};

let currentMath={};

global.Zcp2oChallenges["simple-math"]={
  meta(){
    const a=Math.floor(Math.random()*15)+5;
    const b=Math.floor(Math.random()*10)+1;
    const isAddition=Math.random()>0.5;
    const ans=isAddition?a+b:a-b;
    currentMath={a,b,ans,isAddition,attempts:0};
    return{
      label:"Solve the math problem.",
      instructions:[
        "Solve the crossed-out math problem above.",
        "Type the answer on your keyboard OR tap the on-screen keypad.",
        "Press Verify when done."
      ]
    };
  },

  create(api){
    const ctx=api.ctx;
    const {a,b,ans,isAddition}=currentMath;
    const operator=isAddition?"+":"-";

    // Noise (digenerate sekali)
    const noiseLines=[];
    for(let i=0;i<6;i++)noiseLines.push({x1:30+Math.random()*40,y1:12+Math.random()*36,x2:180+Math.random()*60,y2:12+Math.random()*36,width:1+Math.random()*1.5});
    for(let i=0;i<4;i++)noiseLines.push({x1:50+Math.random()*150,y1:8+Math.random()*16,x2:80+Math.random()*150,y2:26+Math.random()*24,width:1+Math.random()*2});
    const underlinePoints=[];for(let x=40;x<=260;x+=10)underlinePoints.push({x,y:46+Math.random()*4});

    let userInput="",submitted=false;

    const R1=["1","2","3","4","5"],R2=["6","7","8","9","0","⌫"];
    function keyRects(){
      const r=[];const w1=260/5;R1.forEach((k,i)=>r.push({k,x:20+i*w1,y:84,w:w1,h:22}));
      const w2=260/6;R2.forEach((k,i)=>r.push({k,x:20+i*w2,y:108,w:w2,h:22}));
      return r;
    }
    function pressKey(k){if(submitted)return;if(k==="⌫")userInput=userInput.slice(0,-1);else if(userInput.length<4)userInput+=k;}

    function drawNoisyMath(){
      ctx.save();
      ctx.fillStyle="#fff";ctx.fillRect(20,5,260,50);
      ctx.strokeStyle="#e0e0e0";ctx.lineWidth=1;ctx.strokeRect(20,5,260,50);
      ctx.fillStyle="#d32f2f";ctx.font="bold 32px 'Courier New', monospace";
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(`${a} ${operator} ${b} =`,150,30);
      ctx.strokeStyle="rgba(211,47,47,0.6)";ctx.lineCap="round";
      noiseLines.forEach(l=>{ctx.beginPath();ctx.moveTo(l.x1,l.y1);ctx.lineTo(l.x2,l.y2);ctx.lineWidth=l.width;ctx.stroke();});
      ctx.beginPath();ctx.moveTo(underlinePoints[0].x,underlinePoints[0].y);
      for(let i=1;i<underlinePoints.length;i++)ctx.lineTo(underlinePoints[i].x,underlinePoints[i].y);
      ctx.lineWidth=2;ctx.stroke();
      ctx.restore();
    }
    function drawInputUI(){
      // display jawaban
      ctx.fillStyle="#fff";ctx.fillRect(20,58,260,22);
      ctx.strokeStyle="#ccc";ctx.strokeRect(20,58,260,22);
      ctx.fillStyle=userInput?"#333":"#999";ctx.font="16px sans-serif";
      ctx.textAlign="left";ctx.textBaseline="middle";
      ctx.fillText(userInput||"Type / tap your answer...",30,69);
      // keypad
      keyRects().forEach(r=>{
        ctx.fillStyle="#f0f0f0";ctx.fillRect(r.x+1,r.y,r.w-2,r.h);
        ctx.strokeStyle="#bbb";ctx.strokeRect(r.x+1,r.y,r.w-2,r.h);
        ctx.fillStyle="#111";ctx.font="bold 14px sans-serif";ctx.textAlign="center";
        ctx.fillText(r.k,r.x+r.w/2,r.y+r.h/2);
      });
      // tombol aksi
      ctx.fillStyle="#4ade80";ctx.fillRect(20,132,125,24);
      ctx.fillStyle="#111";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("✓ Verify",82,144);
      ctx.fillStyle="#f59e0b";ctx.fillRect(155,132,125,24);
      ctx.fillStyle="#111";ctx.fillText("↻ New Code",217,144);
    }

    return{
      draw(){ctx.clearRect(0,0,300,160);ctx.fillStyle="#f8f9fa";ctx.fillRect(0,0,300,160);drawNoisyMath();drawInputUI();},
      down(p){
        if(submitted)return;
        api.push(p); // sampel motor dari tap
        if(p.x>=20&&p.x<=145&&p.y>=132&&p.y<=156){checkAnswer();return;}
        if(p.x>=155&&p.x<=280&&p.y>=132&&p.y<=156){regen();return;}
        const kr=keyRects().find(r=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h);
        if(kr)pressKey(kr.k);
      },
      key(char){if(submitted)return;if(char==="Backspace")userInput=userInput.slice(0,-1);else if(char>="0"&&char<="9"&&userInput.length<4)userInput+=char;},
      move(p){if(!submitted)api.push(p);},
      up(){},
      tick(){},
      active(){return !submitted;}
    };

    function regen(){
      const na=Math.floor(Math.random()*15)+5,nb=Math.floor(Math.random()*10)+1,nadd=Math.random()>0.5;
      currentMath={a:na,b:nb,ans:nadd?na+nb:na-nb,isAddition:nadd,attempts:0};
      userInput="";submitted=false;api.setMsg("New problem generated!");
    }
    function checkAnswer(){
      const ua=parseInt(userInput);
      if(ua===ans){submitted=true;api.finish(95,"math-correct");}
      else{currentMath.attempts++;
        if(currentMath.attempts>=3)api.setMsg("Failed 3x. Click 'New Code'.");
        else api.setMsg(`Wrong! Try again. (${currentMath.attempts}/3)`);
        userInput="";}
    }
  }
};
})(window);