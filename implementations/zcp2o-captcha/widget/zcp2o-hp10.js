/* ANAK 10: NUMBER SEQUENCE "Connect the Dots". Registers to Zcp2oChallenges. */
(function(global){
"use strict";
global.Zcp2oChallenges=global.Zcp2oChallenges||{};

let currentSequence=[];

global.Zcp2oChallenges["number-sequence"]={
  meta(){
    // Generate 5 posisi random yang tidak tumpang tindih
    currentSequence=[];
    const usedPos=[];
    for(let i=1; i<=5; i++){
      let x,y, overlap=true;
      while(overlap){
        x = 30 + Math.random()*240;
        y = 20 + Math.random()*120;
        overlap = usedPos.some(p => Math.hypot(p.x-x, p.y-y) < 40);
      }
      currentSequence.push({x, y, val: i, clicked: false});
      usedPos.push({x,y});
    }
    return{
      label:"Click the numbers in order: 1 to 5.",
      instructions:[
        "Find the number 1 and click it first.",
        "Then click 2, 3, 4, and 5 in sequence.",
        "Move naturally - your path is being analyzed."
      ]
    };
  },

  create(api){
    const ctx=api.ctx;
    let nextExpected=1;
    let clickedPath=[];

    function drawNumber(num, x, y, isClicked){
      ctx.save();
      ctx.translate(x,y);
      ctx.beginPath();
      ctx.arc(0,0,18,0,Math.PI*2);
      ctx.fillStyle = isClicked ? "#2ecc71" : "#f0f0f0";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth=2;
      ctx.stroke();
      
      ctx.fillStyle = isClicked ? "#fff" : "#333";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(num, 0, 1);
      ctx.restore();
    }

    return{
      draw(){
        ctx.clearRect(0,0,300,160);
        ctx.fillStyle="#34495e";
        ctx.fillRect(0,0,300,160);
        
        // Draw path lines
        if(clickedPath.length>1){
          ctx.beginPath();
          ctx.strokeStyle="rgba(46,204,113,0.6)";
          ctx.lineWidth=3;
          clickedPath.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
          ctx.stroke();
        }
        
        // Draw numbers
        currentSequence.forEach(n => drawNumber(n.val, n.x, n.y, n.clicked));
      },
      down(p){
        // Cek apakah klik mengenai angka yang diharapkan
        const target = currentSequence.find(n => n.val === nextExpected);
        if(target){
          const dist = Math.hypot(p.x-target.x, p.y-target.y);
          if(dist < 25){
            target.clicked = true;
            clickedPath.push({x:target.x, y:target.y});
            api.push(p);
            nextExpected++;
            
            if(nextExpected > 5){
              // Selesai — bonus dari EFISIENSI JALUR (bukan angka tetap).
              // Manusia: cukup efisien tapi ada wobble (eff ~0.5-0.8) → tinggi.
              // Bot sempurna: eff ≈ 1.0 → dipenalti. Terlalu acak: eff rendah → dipenalti.
              const s=api.getSamples();
              let actual=0;for(let i=1;i<s.length;i++)actual+=Math.hypot(s[i].x-s[i-1].x,s[i].y-s[i-1].y);
              let ideal=0;for(let i=1;i<clickedPath.length;i++)ideal+=Math.hypot(clickedPath[i].x-clickedPath[i-1].x,clickedPath[i].y-clickedPath[i-1].y);
              const eff=actual>0?Math.min(1,ideal/actual):0;
              const bonus=Math.round(api.core.band(eff,0.4,0.85,0.1,1.05));
              api.finish(bonus,"sequence-complete");
            }
          }
        }
      },
      move(p){ if(api.active()) api.push(p); },
      up(){},
      tick(){},
      active(){return nextExpected <= 5;}
    };
  }
};
})(window);