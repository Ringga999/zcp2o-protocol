/* ANAK 5: SLIDING-PUZZLE "Jigsaw Fit". Registers to Zcp2oChallenges. */

(function(global){
"use strict";

global.Zcp2oChallenges=global.Zcp2oChallenges||{};

const PUZZLES=[
  {name:"Forest",color:"#2d5016",bg:"#4a7c23"},
  {name:"Ocean",color:"#1e3a5f",bg:"#2e5c8a"},
  {name:"Mountain",color:"#4a4a4a",bg:"#6b6b6b"},
  {name:"Sunset",color:"#d4a574",bg:"#e8b89d"}
];

global.Zcp2oChallenges["sliding-puzzle"]={
  meta(){
    const puzzle=PUZZLES[Math.floor(Math.random()*PUZZLES.length)];
    return{
      label:"Slide the puzzle piece to complete the image.",
      instructions:[
        "Press and hold the white puzzle piece on the right.",
        "Drag it smoothly to the empty slot on the left.",
        "Align it carefully - natural movement is key."
      ],
      puzzle:puzzle
    };
  },

  create(api){
    const ctx=api.ctx, C=api.core;
    const puzzle=api.meta?.puzzle||PUZZLES[0];
    
    // Puzzle dimensions
    const SLOT_X=30, SLOT_Y=55, SLOT_W=90, SLOT_H=90;
    const PIECE_X=210, PIECE_Y=55;
    const TOLERANCE=20;
    
    let dragging=false, dragStart=0;
    let pieceX=PIECE_X, pieceY=PIECE_Y;
    let dragPath=[], lastPos=null;
    
    // Draw jigsaw slot (the HOLE - has bump inward on RIGHT side)
    function drawSlot(x,y,color){
      ctx.save();
      ctx.translate(x,y);
      
      // Semi-transparent background showing the "hole"
      ctx.fillStyle="rgba(0,0,0,0.3)";
      ctx.strokeStyle="#fff";
      ctx.lineWidth=3;
      ctx.setLineDash([5,3]);
      
      ctx.beginPath();
      // Top edge
      ctx.moveTo(0,0);
      ctx.lineTo(90,0);
      // Right edge with INWARD bump (negative)
      ctx.lineTo(90,32);
      ctx.arc(90,45,13,Math.PI/2,-Math.PI/2,true); // inward bump
      ctx.lineTo(90,90);
      // Bottom edge
      ctx.lineTo(0,90);
      // Left edge with OUTWARD bump (positive)
      ctx.lineTo(0,58);
      ctx.arc(0,45,13,-Math.PI/2,Math.PI/2,false); // outward bump
      ctx.closePath();
      
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Inner circle hint
      ctx.fillStyle="rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.arc(45,45,25,0,Math.PI*2);
      ctx.fill();
      
      ctx.restore();
    }
    
    // Draw jigsaw piece (has bump on LEFT side to match slot)
    function drawPiece(x,y,color,isDragging=false){
      ctx.save();
      ctx.translate(x,y);
      
      ctx.fillStyle=isDragging?"#f5f5f5":"#e8e8e8";
      ctx.strokeStyle="#fff";
      ctx.lineWidth=3;
      ctx.shadowColor="rgba(0,0,0,0.3)";
      ctx.shadowBlur=8;
      ctx.shadowOffsetX=2;
      ctx.shadowOffsetY=2;
      
      ctx.beginPath();
      // Top edge
      ctx.moveTo(0,0);
      ctx.lineTo(90,0);
      // Right edge - FLAT (no bump)
      ctx.lineTo(90,90);
      // Bottom edge
      ctx.lineTo(0,90);
      // Left edge with OUTWARD bump (positive) to fit slot
      ctx.lineTo(0,58);
      ctx.arc(0,45,13,-Math.PI/2,Math.PI/2,false); // outward bump on LEFT
      ctx.closePath();
      
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor="transparent";
      
      // Inner circle
      ctx.fillStyle="rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(45,45,25,0,Math.PI*2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle="rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(35,35,15,0,Math.PI*2);
      ctx.fill();
      
      ctx.restore();
    }
    
    function drawBackground(){
      // Gradient background matching puzzle theme
      const grad=ctx.createLinearGradient(0,0,300,160);
      grad.addColorStop(0,puzzle.bg);
      grad.addColorStop(1,puzzle.color);
      ctx.fillStyle=grad;
      ctx.fillRect(0,0,300,160);
      
      // Draw subtle pattern (triangles/trees)
      ctx.fillStyle="rgba(255,255,255,0.08)";
      for(let i=0;i<6;i++){
        ctx.beginPath();
        ctx.moveTo(i*50,160);
        ctx.lineTo(i*50+25,30);
        ctx.lineTo(i*50+50,160);
        ctx.fill();
      }
      
      // Horizontal line hint
      ctx.strokeStyle="rgba(255,255,255,0.15)";
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(0,100);
      ctx.lineTo(300,100);
      ctx.stroke();
    }
    
    return{
      draw(){
        ctx.clearRect(0,0,300,160);
        drawBackground();
        
        // Draw the SLOT (target position) - always visible
        drawSlot(SLOT_X,SLOT_Y,puzzle.color);
        
        // Draw drag trail
        if(dragPath.length>1){
          ctx.beginPath();
          ctx.strokeStyle="rgba(255,255,255,0.5)";
          ctx.lineWidth=2;
          ctx.setLineDash([6,4]);
          dragPath.forEach((p,i)=>{
            i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Draw the PIECE (draggable)
        if(dragging&&lastPos){
          drawPiece(lastPos.x-45,lastPos.y-45,"#f5f5f5",true);
        }else{
          drawPiece(pieceX,pieceY,"#e8e8e8",false);
        }
      },
      
      down(p){
        // Check if clicking on the puzzle piece
        const dist=Math.hypot(p.x-pieceX-45,p.y-pieceY-45);
        if(dist<55){
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
          pieceX=Math.max(0,Math.min(255,p.x-45));
          pieceY=Math.max(0,Math.min(115,p.y-45));
          dragPath.push({x:pieceX+45,y:pieceY+45,t:p.t});
          api.push(p);
        }
      },
      
      up(p){
        if(dragging){
          dragging=false;
          
          // Check alignment with slot
          const distX=Math.abs(pieceX-SLOT_X);
          const distY=Math.abs(pieceY-SLOT_Y);
          
          if(distX<TOLERANCE&&distY<TOLERANCE){
            // Success!
            const duration=p.t-dragStart;
            const pathLength=dragPath.reduce((sum,p,i)=>{
              if(i===0)return 0;
              return sum+Math.hypot(p.x-dragPath[i-1].x,p.y-dragPath[i-1].y);
            },0);
            
            const accuracyBonus=Math.round(100-(distX+distY)*2);
            const motorScore=api.core.scoreMotor(api.getSamples());
            
            const avgSpeed=pathLength/(duration||1);
            const smoothnessBonus=Math.min(100,Math.abs(avgSpeed-0.3)*80);
            
            const finalBonus=Math.round((accuracyBonus+smoothnessBonus)/2);
            api.finish(finalBonus,"puzzle-fit");
          }else{
            api.setMsg("Not aligned! Try again.");
            pieceX=PIECE_X;
            pieceY=PIECE_Y;
            dragPath=[];
            lastPos=null;
          }
        }
      },
      
      tick(now){
        // Subtle pulse animation on slot
      },
      
      active(){return dragging;}
    };
  }
};

})(window);