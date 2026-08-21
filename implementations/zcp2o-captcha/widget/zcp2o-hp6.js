/* ANAK 6: CIRCLE-FIT "Ball & Target". Registers to Zcp2oChallenges. */

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

global.Zcp2oChallenges["circle-fit"]={
  meta(){
    currentPuzzle=PUZZLES[Math.floor(Math.random()*PUZZLES.length)];
    // Random slot position: 3 zona vertikal
    const zones=[40, 80, 120];
    currentSlotY=zones[Math.floor(Math.random()*zones.length)];
    
    return{
      label:"Slide the ball to the target.",
      instructions:[
        "Press and hold the white ball on the right.",
        "Drag it smoothly to the dashed target on the left.",
        "Align it carefully - natural movement is key."
      ],
      puzzle:currentPuzzle
    };
  },

  create(api){
    const ctx=api.ctx, C=api.core;
    const puzzle=currentPuzzle;
    
    // Ukuran kecil
    const RADIUS=20;
    const TOLERANCE=12;
    
    const SLOT_X=75;
    const SLOT_Y=currentSlotY;
    
    const PIECE_X=225;
    const PIECE_Y=80;
    
    let dragging=false, dragStart=0;
    let pieceX=PIECE_X, pieceY=PIECE_Y;
    let dragPath=[], lastPos=null;
    
    // Gambar Target (Slot) - Efek Bullseye
    function drawTarget(x,y,radius){
      ctx.save();
      ctx.translate(x,y);
      
      // Lingkaran luar (dashed)
      ctx.strokeStyle="rgba(255,255,255,0.8)";
      ctx.lineWidth=2;
      ctx.setLineDash([5,3]);
      ctx.beginPath();
      ctx.arc(0,0,radius,0,Math.PI*2);
      ctx.stroke();
      
      // Lingkaran dalam (dashed, lebih tipis)
      ctx.beginPath();
      ctx.arc(0,0,radius*0.5,0,Math.PI*2);
      ctx.stroke();
      
      // Titik tengah
      ctx.setLineDash([]);
      ctx.fillStyle="rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(0,0,3,0,Math.PI*2);
      ctx.fill();
      
      ctx.restore();
    }
    
    // Gambar Bola (Piece) - Efek 3D Sphere
    function drawBall(x,y,radius){
      ctx.save();
      ctx.translate(x,y);
      
      // Shadow
      ctx.shadowColor="rgba(0,0,0,0.4)";
      ctx.shadowBlur=10;
      ctx.shadowOffsetX=3;
      ctx.shadowOffsetY=3;
      
      // Radial gradient untuk efek 3D
      const grad=ctx.createRadialGradient(-radius*0.3,-radius*0.3,radius*0.1, 0,0,radius);
      grad.addColorStop(0,"#ffffff");
      grad.addColorStop(0.7,"#e0e0e0");
      grad.addColorStop(1,"#b0b0b0");
      
      ctx.fillStyle=grad;
      ctx.beginPath();
      ctx.arc(0,0,radius,0,Math.PI*2);
      ctx.fill();
      
      // Border tipis
      ctx.shadowColor="transparent";
      ctx.strokeStyle="rgba(255,255,255,0.8)";
      ctx.lineWidth=1.5;
      ctx.stroke();
      
      ctx.restore();
    }
    
    function drawBackground(){
      const grad=ctx.createLinearGradient(0,0,300,160);
      grad.addColorStop(0,puzzle.bg);
      grad.addColorStop(1,puzzle.color);
      ctx.fillStyle=grad;
      ctx.fillRect(0,0,300,160);
      
      // Pattern subtle (gelombang)
      ctx.strokeStyle="rgba(255,255,255,0.05)";
      ctx.lineWidth=2;
      for(let i=0;i<5;i++){
        ctx.beginPath();
        for(let x=0;x<=300;x+=10){
          const y=80+Math.sin((x+i*60)*0.05)*20;
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
    }
    
    return{
      draw(){
        ctx.clearRect(0,0,300,160);
        drawBackground();
        
        // Draw TARGET (slot)
        drawTarget(SLOT_X,SLOT_Y,RADIUS);
        
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
        
        // Draw BALL (piece)
        if(dragging&&lastPos){
          drawBall(lastPos.x,lastPos.y,RADIUS);
        }else{
          drawBall(pieceX,pieceY,RADIUS);
        }
      },
      
      down(p){
        const dist=Math.hypot(p.x-pieceX,p.y-pieceY);
        if(dist<RADIUS+15){
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
          pieceX=Math.max(RADIUS,Math.min(300-RADIUS,p.x));
          pieceY=Math.max(RADIUS,Math.min(160-RADIUS,p.y));
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
            api.finish(finalBonus,"circle-fit");
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