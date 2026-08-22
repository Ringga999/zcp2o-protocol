/* ANAK 11: SIMPLE MATH "Noisy Calc". Registers to Zcp2oChallenges. */
(function(global){
"use strict";
global.Zcp2oChallenges=global.Zcp2oChallenges||{};

let currentMath={};

global.Zcp2oChallenges["simple-math"]={
  meta(){
    // Generate soal matematika sederhana (penjumlahan/pengurangan)
    const a = Math.floor(Math.random()*15)+5; // 5-20
    const b = Math.floor(Math.random()*10)+1; // 1-10
    const isAddition = Math.random() > 0.5;
    const ans = isAddition ? a+b : a-b;
    
    currentMath = {a, b, ans, isAddition, attempts: 0};
    
    return{
      label:"Solve the math problem.",
      instructions:[
        "Calculate the noisy math problem shown above.",
        "Type your answer in the input box.",
        "Press Enter or click Verify to submit."
      ]
    };
  },

  create(api){
    const ctx=api.ctx;
    const {a, b, ans, isAddition} = currentMath;
    const operator = isAddition ? "+" : "-";
    
    let userInput="";
    let submitted=false;
    let startTime=performance.now();
    let keyPressTimes=[];

    // Fungsi untuk menggambar soal dengan noise lines
    function drawNoisyMath(){
      ctx.save();
      
      // Background putih untuk area soal
      ctx.fillStyle="#fff";
      ctx.fillRect(20, 10, 260, 70);
      
      // Border
      ctx.strokeStyle="#ddd";
      ctx.lineWidth=1;
      ctx.strokeRect(20, 10, 260, 70);
      
      // Gambar angka dengan font besar
      ctx.fillStyle="#d32f2f"; // Merah seperti di contoh
      ctx.font="bold 42px 'Courier New', monospace";
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      ctx.fillText(`${a} ${operator} ${b} =`, 150, 45);
      
      // Tambahkan garis-garis noise (horizontal & diagonal)
      ctx.strokeStyle="rgba(211, 47, 47, 0.4)"; // Merah transparan
      ctx.lineWidth=1.5;
      
      // Garis horizontal acak
      for(let i=0; i<5; i++){
        const y = 20 + Math.random()*50;
        const x1 = 30 + Math.random()*50;
        const x2 = 200 + Math.random()*70;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      }
      
      // Garis diagonal acak
      for(let i=0; i<3; i++){
        const x1 = 40 + Math.random()*200;
        const y1 = 15 + Math.random()*20;
        const x2 = x1 + 30 + Math.random()*40;
        const y2 = y1 + 10 + Math.random()*30;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      
      // Garis bawah (underline) di angka
      ctx.strokeStyle="rgba(211, 47, 47, 0.6)";
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(40, 65);
      ctx.lineTo(260, 65);
      ctx.stroke();
      
      ctx.restore();
    }

    // Fungsi untuk menggambar UI input
    function drawInputUI(){
      // Input box
      ctx.fillStyle="#fff";
      ctx.fillRect(20, 90, 260, 40);
      ctx.strokeStyle="#ccc";
      ctx.lineWidth=1;
      ctx.strokeRect(20, 90, 260, 40);
      
      // Teks placeholder atau input
      ctx.fillStyle = userInput ? "#333" : "#999";
      ctx.font="16px sans-serif";
      ctx.textAlign="left";
      ctx.textBaseline="middle";
      ctx.fillText(userInput || "Ketik jawaban di sini...", 30, 110);
      
      // Tombol Verify
      ctx.fillStyle="#4ade80";
      ctx.fillRect(20, 140, 120, 30);
      ctx.fillStyle="#111";
      ctx.font="bold 13px sans-serif";
      ctx.textAlign="center";
      ctx.fillText("✓ Verify", 80, 155);
      
      // Tombol Refresh
      ctx.fillStyle="#f59e0b";
      ctx.fillRect(160, 140, 120, 30);
      ctx.fillStyle="#111";
      ctx.fillText(" New Code", 220, 155);
    }

    return{
      draw(){
        ctx.clearRect(0,0,300,160);
        ctx.fillStyle="#f5f5f5";
        ctx.fillRect(0,0,300,160);
        
        drawNoisyMath();
        drawInputUI();
        
        // Status message
        if(submitted){
          ctx.fillStyle="#2ecc71";
          ctx.font="bold 14px sans-serif";
          ctx.textAlign="center";
          ctx.fillText("✓ Correct!", 150, 155);
        }
      },
      
      down(p){
        if(submitted) return;
        
        // Cek klik pada input box (fokus ke input)
        if(p.x>=20 && p.x<=280 && p.y>=90 && p.y<=130){
          // Simulasi fokus input (dalam implementasi nyata, ini akan trigger native input)
          api.setMsg("Type your answer...");
        }
        
        // Cek klik tombol Verify
        if(p.x>=20 && p.x<=140 && p.y>=140 && p.y<=170){
          checkAnswer();
        }
        
        // Cek klik tombol New Code
        if(p.x>=160 && p.x<=280 && p.y>=140 && p.y<=170){
          // Regenerate soal
          const newA = Math.floor(Math.random()*15)+5;
          const newB = Math.floor(Math.random()*10)+1;
          const newIsAdd = Math.random() > 0.5;
          currentMath = {a: newA, b: newB, ans: newIsAdd ? newA+newB : newA-newB, isAddition: newIsAdd, attempts: 0};
          userInput="";
          submitted=false;
          startTime=performance.now();
          keyPressTimes=[];
          api.setMsg("New problem generated.");
        }
      },
      
      // Simulasi keyboard input (dalam implementasi nyata, ini akan pakai event listener)
      key(char){
        if(submitted) return;
        if(char === 'Backspace'){
          userInput = userInput.slice(0, -1);
        }else if(char >= '0' && char <= '9' && userInput.length < 5){
          userInput += char;
          keyPressTimes.push(performance.now());
        }
      },
      
      move(p){},
      up(){},
      tick(){},
      active(){return !submitted;}
    };
    
    function checkAnswer(){
      const userAns = parseInt(userInput);
      const duration = performance.now() - startTime;
      
      if(userAns === ans){
        submitted=true;
        // Scoring berdasarkan waktu + akurasi
        const timeBonus = Math.max(0, 100 - Math.floor(duration/100));
        api.finish(timeBonus, "math-correct");
      }else{
        currentMath.attempts++;
        if(currentMath.attempts >= 3){
          api.setMsg("Too many attempts. Try new code.");
        }else{
          api.setMsg(`Wrong! Try again. (${currentMath.attempts}/3)`);
        }
        userInput="";
      }
    }
  }
};
})(window);