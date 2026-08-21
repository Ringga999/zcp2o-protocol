/* ANAK 7: TRIANGLE-FIT "Pyramid Slide". Registers to Zcp2oChallenges. */

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

global.Zcp2oChallenges["triangle-fit"]={
  meta(){
    currentPuzzle=PUZZLES[Math.floor(Math.random()*PUZZLES.length)];
    // Random slot position: 3 zona vertikal
    const zones=[40, 80, 120];
    currentSlotY=zones[Math.floor(Math.random()*zones.length)];
    
    return{
      label:"Slide the triangle to the matching slot.",
      instructions:[
        "Press and hold the white triangle on the right.",
        "Drag it smoothly to the dashed target on the left.",
        "Align it carefully - natural movement is key."
      ],
      puzzle:currentPuzzle
    };
  },

  create(api){
    const ctx=api.ctx, C=api.core;
    const puzzle=currentPuzzle;
    
    // Ukuran kecil (radius dari pusat ke titik sudut)
    const SIZE=22; 
    const TOLERANCE=12;
    
    const SLOT_X=75;
    const SLOT_Y=currentSlotY;
    
    const PIECE_X=225;
    const PIECE_Y=80;
    
    let dragging=false, dragStart=0;
    let pieceX=PIECE_X, pieceY=PIECE_Y;
    let dragPath=[], lastPos=null;
    
    // Gambar Segitiga (Piece & Slot)
    function drawTriangle(x,y,size,isSlot=false){
      ctx.save();
      ctx.translate(x,y);
      
      ctx.beginPath();
      // Segitiga sama sisi menghadap ke atas
      ctx.moveTo(0, -size); // Titik atas
      ctx.lineTo(size * 0.866, size * 0.5); // Kanan bawah
      ctx.lineTo(-size * 0.866, size * 0.5); // Kiri bawah
      ctx.closePath();
      
      if(isSlot){
        // Slot: dashed outline
        ctx.strokeStyle="rgba(255,255,255,0.8)";
        ctx.lineWidth=2;
        ctx.setLineDash([5,3]);
        ctx.fillStyle="rgba(255,255,255,0.1)";
        ctx.fill();
        ctx.stroke();
      }else{
        // Piece: gradien linear (efek piramida) + shadow
        const grad=ctx.createLinearGradient(0,-size,0,size);
        grad.addColorStop(0,"#ffffff");
        grad.addColorStop(1,"#cccccc");
        
        ctx.fillStyle=grad;
        ctx.shadowColor="rgba(0,0,0,0.3)";
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
      
      // Pattern diagonal lines
      ctx.strokeStyle="rgba(255,255,255,0.06)";
      ctx.lineWidth=1.5;
      for(let i=-160; i<460; i+=25){
        ctx.beginPath();
        ctx.moveTo(i,0);
        ctx.lineTo(i-160,160);
        ctx.stroke();
      }
    }
    
    return{
      draw(){
        ctx.clearRect(0,0,300,160);
        drawBackground();
        
        // Draw TARGET (slot)
        drawTriangle(SLOT_X,SLOT_Y,SIZE,true);
        
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
          drawTriangle(lastPos.x,lastPos.y,SIZE,false);
        }else{
          drawTriangle(pieceX,pieceY,SIZE,false);
        }
      },
      
      down(p){
        // Hit detection menggunakan jarak ke pusat (cukup akurat untuk bentuk ini)
        const dist=Math.hypot(p.x-pieceX,p.y-pieceY);
        if(dist<SIZE+15){
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
          pieceX=Math.max(SIZE,Math.min(300-SIZE,p.x));
          pieceY=Math.max(SIZE,Math.min(160-SIZE,p.y));
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
            api.finish(finalBonus,"triangle-fit");
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