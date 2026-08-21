/* ANAK 5: SLIDING-PUZZLE "Jigsaw Fit". Registers to Zcp2oChallenges. */

(function(global){
"use strict";

global.Zcp2oChallenges=global.Zcp2oChallenges||{};

// Puzzle images (simple SVG patterns or canvas drawings)
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
    const SLOT_X=40, SLOT_Y=60, SLOT_W=80, SLOT_H=80;
    const PIECE_X=220, PIECE_Y=60;
    const TOLERANCE=15; // pixels for successful fit
    
    let dragging=false, dragStart=0;
    let pieceX=PIECE_X, pieceY=PIECE_Y;
    let dragPath=[], lastPos=null;
    
    // Generate puzzle piece shape (jigsaw-like)
    function drawPuzzlePiece(x,y,color,isSlot=false){
      ctx.save();
      ctx.translate(x,y);
      
      // Main body
      ctx.fillStyle=isSlot?"rgba(255,255,255,0.3)":color;
      ctx.strokeStyle=isSlot?"#999":"#fff";
      ctx.lineWidth=3;
      
      // Draw puzzle piece shape (simplified jigsaw)
      ctx.beginPath();
      ctx.moveTo(10,0);
      ctx.lineTo(70,0);
      ctx.lineTo(70,15);
      // Right tab
      ctx.arc(70,40,8,-Math.PI/2,Math.PI/2,false);
      ctx.lineTo(70,65);
      ctx.lineTo(70,80);
      ctx.lineTo(10,80);
      ctx.lineTo(10,65);
      // Left tab (negative for slot)
      ctx.arc(10,40,8,Math.PI/2,-Math.PI/2,!isSlot);
      ctx.lineTo(10,15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Inner detail
      ctx.fillStyle="rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.arc(40,40,20,0,Math.PI*2);
      ctx.fill();
      
      ctx.restore();
    }
    
    // Draw background pattern
    function drawBackground(){
      // Gradient background
      const grad=ctx.createLinearGradient(0,0,300,160);
      grad.addColorStop(0,puzzle.bg);
      grad.addColorStop(1,puzzle.color);
      ctx.fillStyle=grad;
      ctx.fillRect(0,0,300,160);
      
      // Draw decorative elements (trees/waves based on theme)
      ctx.fillStyle="rgba(255,255,255,0.1)";
      for(let i=0;i<5;i++){
        ctx.beginPath();
        ctx.moveTo(i*60,160);
        ctx.lineTo(i*60+30,40);
        ctx.lineTo(i*60+60,160);
        ctx.fill();
      }
    }
    
    return{
      draw(){
        // Clear and draw background
        ctx.clearRect(0,0,300,160);
        drawBackground();
        
        // Draw slot (target position)
        drawPuzzlePiece(SLOT_X,SLOT_Y,puzzle.color,true);
        
        // Draw draggable piece
        if(!dragging||dragPath.length===0){
          drawPuzzlePiece(pieceX,pieceY,"#e0e0e0",false);
        }
        
        // Draw drag trail
        if(dragPath.length>1){
          ctx.beginPath();
          ctx.strokeStyle="rgba(255,255,255,0.6)";
          ctx.lineWidth=2;
          ctx.setLineDash([5,3]);
          dragPath.forEach((p,i)=>{
            i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Draw current piece position while dragging
        if(dragging&&lastPos){
          drawPuzzlePiece(lastPos.x-30,lastPos.y-30,"#f0f0f0",false);
        }
      },
      
      down(p){
        // Check if clicking on the puzzle piece
        const dist=Math.hypot(p.x-pieceX-40,p.y-pieceY-40);
        if(dist<50){
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
          pieceX=Math.max(0,Math.min(260,p.x-40));
          pieceY=Math.max(0,Math.min(120,p.y-40));
          dragPath.push({x:pieceX+40,y:pieceY+40,t:p.t});
          api.push(p);
        }
      },
      
      up(p){
        if(dragging){
          dragging=false;
          
          // Check if piece is aligned with slot
          const distX=Math.abs(pieceX-SLOT_X);
          const distY=Math.abs(pieceY-SLOT_Y);
          
          if(distX<TOLERANCE&&distY<TOLERANCE){
            // Success! Calculate score
            const duration=p.t-dragStart;
            const pathLength=dragPath.reduce((sum,p,i)=>{
              if(i===0)return 0;
              return sum+Math.hypot(p.x-dragPath[i-1].x,p.y-dragPath[i-1].y);
            },0);
            
            // Score based on accuracy + movement quality
            const accuracyBonus=Math.round(100-(distX+distY)*2);
            const motorScore=api.core.scoreMotor(api.getSamples());
            
            // Bonus for smooth, human-like drag
            const avgSpeed=pathLength/(duration||1);
            const smoothnessBonus=Math.min(100,Math.abs(avgSpeed-0.5)*100);
            
            const finalBonus=Math.round((accuracyBonus+smoothnessBonus)/2);
            api.finish(finalBonus,"puzzle-fit");
          }else{
            // Not aligned - snap back or retry
            api.setMsg("Not aligned! Try again.");
            pieceX=PIECE_X;
            pieceY=PIECE_Y;
            dragPath=[];
            lastPos=null;
          }
        }
      },
      
      tick(now){
        // Optional: add subtle animation or hint
      },
      
      active(){return dragging;}
    };
  }
};

})(window);