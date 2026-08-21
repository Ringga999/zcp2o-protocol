/* ANAK 9: ROTATION "Dial Match". Registers to Zcp2oChallenges. */
(function(global){
"use strict";
global.Zcp2oChallenges=global.Zcp2oChallenges||{};

let currentTargetAngle=0;

global.Zcp2oChallenges["rotation-dial"]={
  meta(){
    // Target angle random antara 0 sampai 2*PI
    currentTargetAngle = Math.random() * Math.PI * 2;
    return{
      label:"Rotate the dial to match the target angle.",
      instructions:[
        "Press and drag around the dial to rotate it.",
        "Align the white pointer with the dashed target line.",
        "Release when perfectly aligned."
      ]
    };
  },

  create(api){
    const ctx=api.ctx, C=api.core;
    const CX=150, CY=80, R=45;
    let currentAngle = -Math.PI/2; // Mulai dari atas
    let dragging=false, dragStart=0;
    let dragPath=[];

    function drawDial(angle, isTarget=false){
      ctx.save();
      ctx.translate(CX, CY);
      ctx.beginPath();
      ctx.arc(0,0,R,0,Math.PI*2);
      
      if(isTarget){
        ctx.strokeStyle="rgba(255,255,255,0.6)";
        ctx.lineWidth=3;
        ctx.setLineDash([6,4]);
        ctx.stroke();
        
        // Target pointer
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(currentTargetAngle)*R, Math.sin(currentTargetAngle)*R);
        ctx.strokeStyle="rgba(255,255,255,0.8)";
        ctx.lineWidth=3;
        ctx.stroke();
      }else{
        ctx.fillStyle="#f0f0f0";
        ctx.shadowColor="rgba(0,0,0,0.3)";
        ctx.shadowBlur=10;
        ctx.fill();
        ctx.shadowColor="transparent";
        
        // Current pointer
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(angle)*R, Math.sin(angle)*R);
        ctx.strokeStyle="#333";
        ctx.lineWidth=4;
        ctx.stroke();
        
        // Center dot
        ctx.beginPath();
        ctx.arc(0,0,6,0,Math.PI*2);
        ctx.fillStyle="#333";
        ctx.fill();
      }
      ctx.restore();
    }

    return{
      draw(){
        ctx.clearRect(0,0,300,160);
        // Background
        ctx.fillStyle="#2c3e50";
        ctx.fillRect(0,0,300,160);
        
        drawDial(currentAngle, false);
        drawDial(0, true); // Draw target on top
        
        if(dragPath.length>1){
          ctx.beginPath();
          ctx.strokeStyle="rgba(255,255,255,0.3)";
          ctx.lineWidth=1.5;
          dragPath.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
          ctx.stroke();
        }
      },
      down(p){
        const dist=Math.hypot(p.x-CX, p.y-CY);
        if(dist < R+20){
          dragging=true;
          dragStart=p.t;
          dragPath=[];
          api.clear();
          api.push(p);
        }
      },
      move(p){
        if(dragging){
          // Hitung sudut dari pusat ke pointer mouse
          currentAngle = Math.atan2(p.y-CY, p.x-CX);
          dragPath.push({x:p.x, y:p.y, t:p.t});
          api.push(p);
        }
      },
      up(p){
        if(dragging){
          dragging=false;
          
          // Hitung selisih sudut (terpendek)
          let diff = Math.abs(currentAngle - currentTargetAngle);
          if(diff > Math.PI) diff = 2*Math.PI - diff;
          
          // Konversi ke derajat untuk scoring
          const diffDeg = (diff * 180 / Math.PI);
          
          if(diffDeg < 15){ // Toleransi 15 derajat
            const duration=p.t-dragStart;
            const accuracyBonus = Math.round(100 - diffDeg * 5);
            api.finish(Math.max(0, accuracyBonus), "rotation-match");
          }else{
            api.setMsg("Not aligned! Try again.");
            dragPath=[];
          }
        }
      },
      tick(){},
      active(){return dragging;}
    };
  }
};
})(window);