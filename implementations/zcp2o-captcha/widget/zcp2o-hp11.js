/* ANAK 11: SIMPLE MATH "Noisy Calc". Registers to Zcp2oChallenges. */
(function(global){
"use strict";
global.Zcp2oChallenges=global.Zcp2oChallenges||{};

let currentMath={};

global.Zcp2oChallenges["simple-math"]={
  meta(){
    // Generate soal matematika sederhana
    const a = Math.floor(Math.random()*15)+5; 
    const b = Math.floor(Math.random()*10)+1; 
    const isAddition = Math.random() > 0.5;
    const ans = isAddition ? a+b : a-b;
    
    currentMath = {a, b, ans, isAddition, attempts: 0};
    
    return{
      label:"Solve the math problem.",
      instructions:[
        "Solve the crossed-out math problem above.",
        "The red strike-through lines are meant to fool OCR bots.",
        "Answer carefully!"
      ]
    };
  },

  create(api){
    const ctx=api.ctx;
    const {a, b, ans, isAddition} = currentMath;
    const operator = isAddition ? "+" : "-";
    
    // --- FIX UTAMA: Generate noise HANYA SEKALI di sini ---
    const noiseLines = [];
    
    // 1. Garis horizontal acak
    for(let i=0; i<6; i++){
      noiseLines.push({
        x1: 30 + Math.random()*40,
        y1: 25 + Math.random()*40,
        x2: 180 + Math.random()*60,
        y2: 25 + Math.random()*40,
        width: 1 + Math.random()*1.5
      });
    }
    
    // 2. Garis diagonal/acak yang memotong angka
    for(let i=0; i<4; i++){
      noiseLines.push({
        x1: 50 + Math.random()*150,
        y1: 15 + Math.random()*20,
        x2: 80 + Math.random()*150,
        y2: 40 + Math.random()*30,
        width: 1 + Math.random()*2
      });
    }

    // 3. Garis bawah (underline) yang agak bergelombang
    const underlinePoints = [];
    for(let x=40; x<=260; x+=10){
      underlinePoints.push({x: x, y: 62 + Math.random()*4});
    }

    let userInput="";
    let submitted=false;

    // Fungsi menggambar soal + noise yang sudah di-generate
    function drawNoisyMath(){
      ctx.save();
      
      // Background putih untuk area soal
      ctx.fillStyle="#fff";
      ctx.fillRect(20, 10, 260, 70);
      
      // Border kotak soal
      ctx.strokeStyle="#e0e0e0";
      ctx.lineWidth=1;
      ctx.strokeRect(20, 10, 260, 70);
      
      // Gambar angka (Merah pekat)
      ctx.fillStyle="#d32f2f"; 
      ctx.font="bold 44px 'Courier New', monospace";
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      ctx.fillText(`${a} ${operator} ${b} =`, 150, 45);
      
      // Gambar garis-garis noise (Coretan) di ATAS angka
      ctx.strokeStyle="rgba(211, 47, 47, 0.6)"; // Merah transparan
      ctx.lineCap="round";
      
      noiseLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.lineWidth = line.width;
        ctx.stroke();
      });
      
      // Gambar garis bawah (underline)
      ctx.beginPath();
      ctx.moveTo(underlinePoints[0].x, underlinePoints[0].y);
      for(let i=1; i<underlinePoints.length; i++){
        ctx.lineTo(underlinePoints[i].x, underlinePoints[i].y);
      }
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.restore();
    }

    function drawInputUI(){
      // Kotak input simulasi
      ctx.fillStyle="#fff";
      ctx.fillRect(20, 95, 260, 40);
      ctx.strokeStyle="#ccc";
      ctx.lineWidth=1;
      ctx.strokeRect(20, 95, 260, 40);
      
      // Teks input
      ctx.fillStyle = userInput ? "#333" : "#999";
      ctx.font="16px sans-serif";
      ctx.textAlign="left";
      ctx.textBaseline="middle";
      ctx.fillText(userInput || "Ketik jawaban Anda...", 30, 115);
      
      // Tombol Verify
      ctx.fillStyle="#4ade80";
      ctx.fillRect(20, 145, 125, 30);
      ctx.fillStyle="#111";
      ctx.font="bold 13px sans-serif";
      ctx.textAlign="center";
      ctx.fillText("✓ Verify", 82, 160);
      
      // Tombol New Code
      ctx.fillStyle="#f59e0b";
      ctx.fillRect(155, 145, 125, 30);
      ctx.fillStyle="#111";
      ctx.fillText("↻ New Code", 217, 160);
    }

    return{
      draw(){
        ctx.clearRect(0,0,300,160);
        ctx.fillStyle="#f8f9fa";
        ctx.fillRect(0,0,300,160);
        
        drawNoisyMath();
        drawInputUI();
      },
      
      down(p){
        if(submitted) return;
        
        // Klik Verify
        if(p.x>=20 && p.x<=145 && p.y>=145 && p.y<=175){
          checkAnswer();
        }
        // Klik New Code
        else if(p.x>=155 && p.x<=280 && p.y>=145 && p.y<=175){
          // Reload halaman atau regenerate (disini kita regenerate manual)
          const newA = Math.floor(Math.random()*15)+5;
          const newB = Math.floor(Math.random()*10)+1;
          const newIsAdd = Math.random() > 0.5;
          currentMath = {a: newA, b: newB, ans: newIsAdd ? newA+newB : newA-newB, isAddition: newIsAdd, attempts: 0};
          userInput="";
          submitted=false;
          api.setMsg("Soal baru dibuat!");
          // Note: Untuk noise baru yang benar-benar random, idealnya di-reload, 
          // tapi untuk demo ini kita biarkan noise lama atau bisa di-refactor.
        }
        // Klik area input (fokus)
        else if(p.x>=20 && p.x<=280 && p.y>=95 && p.y<=135){
          api.setMsg("Ketik angka 0-9 di keyboard Anda...");
        }
      },
      
      // Catatan: Agar input keyboard berfungsi, zcp2o-human-proof.js perlu 
      // menambahkan event listener 'keydown' yang memanggil child.key(e.key)
      key(char){
        if(submitted) return;
        if(char === 'Backspace'){
          userInput = userInput.slice(0, -1);
        }else if((char >= '0' && char <= '9') && userInput.length < 4){
          userInput += char;
        }
      },
      
      move(p){},
      up(){},
      tick(){},
      active(){return !submitted;}
    };
    
    function checkAnswer(){
      const userAns = parseInt(userInput);
      
      if(userAns === ans){
        submitted=true;
        api.finish(95, "math-correct");
      }else{
        currentMath.attempts++;
        if(currentMath.attempts >= 3){
          api.setMsg("Gagal 3x. Klik 'New Code'.");
        }else{
          api.setMsg(`Salah! Coba lagi. (${currentMath.attempts}/3)`);
        }
        userInput="";
      }
    }
  }
};
})(window);