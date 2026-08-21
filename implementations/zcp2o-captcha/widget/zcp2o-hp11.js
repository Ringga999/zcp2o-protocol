/* ANAK 13: SIMPLE MATH "Quick Calc". Registers to Zcp2oChallenges. */
(function(global){
"use strict";
global.Zcp2oChallenges=global.Zcp2oChallenges||{};

let currentMath={};

global.Zcp2oChallenges["simple-math"]={
  meta(){
    const a = Math.floor(Math.random()*9)+1;
    const b = Math.floor(Math.random()*9)+1;
    const ans = a+b;
    
    // Generate 3 jawaban salah yang unik dan dekat dengan jawaban benar
    const options=new Set([ans]);
    while(options.size<4){
      let wrong = ans + Math.floor(Math.random()*7)-3;
      if(wrong>0 && wrong!==ans) options.add(wrong);
    }
    
    // Shuffle options
    const shuffled = Array.from(options).sort(()=>Math.random()-0.5);
    
    currentMath = {a, b, ans, options: shuffled};
    
    return{
      label:`Solve: ${a} + ${b} = ?`,
      instructions:[
        "Calculate the simple math problem above.",
        "Click the correct answer among the 4 options.",
        "Answer quickly and naturally."
      ]
    };
  },

  create(api){
    const ctx=api.ctx;
    const {a, b, ans, options} = currentMath;
    const btnW=60, btnH=40, startY=100;
    const startX = (300 - (4*btnW + 3*10))/2; // Center horizontally
    
    let answered=false;

    function drawButton(val, x, y, isCorrect, isClicked){
      ctx.save();
      ctx.translate(x,y);
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(0,0,btnW,btnH,8) : ctx.rect(0,0,btnW,btnH);
      
      if(isClicked){
        ctx.fillStyle = isCorrect ? "#2ecc71" : "#e74c3c";
      }else{
        ctx.fillStyle="#ecf0f1";
      }
      ctx.fill();
      ctx.strokeStyle="#bdc3c7";
      ctx.lineWidth=1;
      ctx.stroke();
      
      ctx.fillStyle="#2c3e50";
      ctx.font="bold 18px sans-serif";
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      ctx.fillText(val, btnW/2, btnH/2);
      ctx.restore();
    }

    return{
      draw(){
        ctx.clearRect(0,0,300,160);
        ctx.fillStyle="#2c3e50";
        ctx.fillRect(0,0,300,160);
        
        // Draw Question
        ctx.fillStyle="#fff";
        ctx.font="bold 28px sans-serif";
        ctx.textAlign="center";
        ctx.fillText(`${a} + ${b} = ?`, 150, 60);
        
        // Draw Options
        options.forEach((val, i)=>{
          drawButton(val, startX + i*(btnW+10), startY, val===ans, false);
        });
      },
      down(p){
        if(answered) return;
        
        // Cek klik pada tombol
        for(let i=0; i<options.length; i++){
          const bx = startX + i*(btnW+10);
          const by = startY;
          if(p.x>=bx && p.x<=bx+btnW && p.y>=by && p.y<=by+btnH){
            answered=true;
            api.push(p);
            if(options[i]===ans){
              api.finish(95, "math-correct");
            }else{
              api.setMsg("Wrong answer! Try again.");
              answered=false; // Reset untuk retry (atau bisa di-reject total)
            }
            break;
          }
        }
      },
      move(p){ if(api.active()) api.push(p); },
      up(){},
      tick(){},
      active(){return !answered;}
    };
  }
};
})(window);