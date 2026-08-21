/* ANAK 8: STAR-FIT "Shining Star". Registers to Zcp2oChallenges. */

(function(global){
"use strict";

global.Zcp2oChallenges=global.Zcp2oChallenges||{};

const PUZZLES=[
  {name:"Forest",color:"#2d5016",bg:"#4a7c23"},
  {name:"Ocean",color:"#1e3a5f",bg:"#2e5c8a"},
  {name:"Mountain",color:"#4a4a4a",bg:"#6b6b6b"},
  {name:"Sunset",color:"#d4a574",bg:"#e8b89d"}
];

// Module-level state untuk konsistensi
let currentPuzzle=PUZZLES[0];
let currentSlotY=80;

global.Zcp2oChallenges["star-fit"]={
  meta(){
    currentPuzzle=PUZZLES[Math.floor(Math.random()*PUZZLES.length)];
    // Random slot position: 3 zona vertikal
    const zones=[40, 80, 120];
    currentSlotY=zones[Math.floor(Math.random()*zones.length)];
    
    return{
      label:"Slide the star to the matching slot.",
      instructions:[
        "Press and hold the shining star on the right.",
        "Drag it smoothly to the dashed star target on the left.",
        "Align it carefully - natural movement is key."
      ],
      puzzle:currentPuzzle
    };
  },

  create(api){
    const ctx=api.ctx, C=api.core;
    const puzzle=currentPuzzle;
    
    // Ukuran kecil (radius luar bintang)
    const OUTER_RADIUS=22;
    const INNER_RADIUS=OUTER_RADIUS * 0.4; // Rasio standar bintang 5 sudut
    const TOLERANCE=12;
    
    const SLOT_X=75;
    const SLOT_Y=currentSlotY;
    
    const PIECE_X=225;
    const PIECE_Y=80;
    
    let dragging=false, dragStart=0;
    let pieceX=PIECE_X, pieceY=PIECE_Y;
    let dragPath=[], lastPos=null;
    
    // Fungsi menggambar Bintang 5 Sudut
    function drawStar(x,y,outerR,innerR,isSlot=false){
      ctx.save();
      ctx.translate(x,y);
      ctx.beginPath();
      
      // 10 titik (5 sudut luar, 5 sudut dalam)
      for(let i=0;i<10;i++){
        const r = i%2===0 ? outerR : innerR;
        const angle = (Math.PI/5)*i - Math.PI/2; // Mulai dari atas (-90 derajat)
        const px = Math.cos(angle)*r;
        const py = Math.sin(angle)*r;
        if(i===0) ctx.moveTo(px,py);
        else ctx.lineTo(px,py);
      }
      ctx.closePath();
      
      if(isSlot){
        ctx.strokeStyle="rgba(255,255,255,0.8)";
        ctx.lineWidth=2;
        ctx.setLineDash([5,3]);
        ctx.fillStyle="rgba(255,255,255,0.1)";
        ctx.fill();
        ctx.stroke();
      }else{
        // Efek mengkilap (Shiny Star)
        const grad=ctx.createRadialGradient(0,-outerR*0.3,0, 0,0,outerR);
        grad.addColorStop(0,"#ffffff");
        grad.addColorStop(1,"#c0c0c0");
        
        ctx.fillStyle=grad;
        ctx.shadowColor="rgba(255,255,255,0.4)"; // Glow effect
        ctx.shadowBlur=10;
        ctx.fill();
        
        ctx.shadowColor="rgba(0,0,0,0.3)"; // Drop shadow
        ctx.shadowBlur=8;
        ctx.shadowOffsetX=2;
        ctx.shadowOffsetY=2;
        ctx.fill();
        
        ctx.shadowColor="transparent";
        ctx.strokeStyle="rgba(255,255,255,0.9)";
        ctx.lineWidth=1.5;
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    function drawBackground(){
      const grad=ctx.createLinearGradient(0,0,300,160);
      grad.addColorStop(0,puzzle.bg);
      grad.addColorStop(1,puzzle.color);
      ctx.fillStyle=grad;
      ctx.fillRect(0,0,300,160);
      
      // Pattern "Bintang-bintang kecil" di background
      ctx.fillStyle="rgba(255,255,255,0.15)";
      // Gunakan seed sederhana agar pattern konsisten setiap frame
      const stars=[[30,20,1.5],[80,130,1],[150,40,2],[200,110,1.5],[260,60,1],[40,90,1],[280,140,1.5]];
      stars.forEach(s=>{
        ctx.beginPath();
        ctx.arc(s[0],s[1],s[2],0,Math.PI*2);
        ctx.fill();
      });
    }
    
    return{
      draw(){
        ctx.clearRect(0,0,300,160);
        drawBackground();
        
        // Draw TARGET (slot)
        drawStar(SLOT_X,SLOT_Y,OUTER_RADIUS,INNER_RADIUS,true);
        
        // Draw drag trail
        if(dragPath.length>1){
          ctx.beginPath();
          ctx.strokeStyle="rgba(255,255,255,0.4)";
          ctx.lineWidth=1.5;
          ctx.setLineDash([4,3]);
          dragPath.forEach((p,i)=>{
            i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Draw PIECE
        if(dragging&&lastPos){
          drawStar(lastPos.x,lastPos.y,OUTER_RADIUS,INNER_RADIUS,false);
        }else{
          drawStar(pieceX,pieceY,OUTER_RADIUS,INNER_RADIUS,false);
        }
      },
      
      down(p){
        const dist=Math.hypot(p.x-pieceX,p.y-pieceY);
        if(dist<OUTER_RADIUS+15){
          dragging=true;
          dragStart=p.t;
          dragPath=[];
          api.clear();
          api.push(p);
          lastPos={x:p.x,y:p.y};
        }
      },
      
      move(p){
        if(dragging){
          lastPos={x:p.x,y:p.y};
          pieceX=Math.max(OUTER_RADIUS,Math.min(300-OUTER_RADIUS,p.x));
          pieceY=Math.max(OUTER_RADIUS,Math.min(160-OUTER_RADIUS,p.y));
          dragPath.push({x:pieceX,y:pieceY,t:p.t});
          api.push(p);
        }
      },
      
      up(p){
        if(dragging){
          dragging=false;
          
          const distX=Math.abs(pieceX-SLOT_X);
          const distY=Math.abs(pieceY-SLOT_Y);
          
          if(distX<TOLERANCE&&distY<TOLERANCE){
            const duration=p.t-dragStart;
            const pathLength=dragPath.reduce((sum,p,i)=>{
              if(i===0)return 0;
              return sum+Math.hypot(p.x-dragPath[i-1].x,p.y-dragPath[i-1].y);
            },0);
            
            const accuracyBonus=Math.round(100-(distX+distY)*3);
            const avgSpeed=pathLength/(duration||1);
            const smoothnessBonus=Math.min(100,Math.abs(avgSpeed-0.3)*80);
            
            const finalBonus=Math.round((accuracyBonus+smoothnessBonus)/2);
            api.finish(finalBonus,"star-fit");
          }else{
            api.setMsg("Missed the target! Try again.");
            pieceX=PIECE_X;
            pieceY=PIECE_Y;
            dragPath=[];
            lastPos=null;
          }
        }
      },
      
      tick(now){},
      active(){return dragging;}
    };
  }
};

})(window);