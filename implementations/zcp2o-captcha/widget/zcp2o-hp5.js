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
        "Press and hold the puzzle piece on the right.",
        "Drag it smoothly to the empty slot on the left.",
        "Match the shape - align carefully!"
      ],
      puzzle:puzzle
    };
  },

  create(api){
    const ctx=api.ctx, C=api.core;
    const puzzle=api.meta?.puzzle||PUZZLES[0];
    
    // Puzzle dimensions
    const SLOT_X=40, SLOT_Y=60, SLOT_W=70, SLOT_H=70;
    const PIECE_X=230, PIECE_Y=60;
    const TOLERANCE=20;
    
    let dragging=false, dragStart=0;
    let pieceX=PIECE_X, pieceY=PIECE_Y;
    let dragPath=[], lastPos=null;
    
    // Draw puzzle piece with tab on LEFT side only
    function drawPiece(x,y,color,isSlot=false){
      ctx.save();
      ctx.translate(x,y);
      
      if(isSlot){
        // SLOT: Empty space with NEGATIVE tab (indentation) on LEFT
        ctx.fillStyle="rgba(255,255,255,0.4)";
        ctx.strokeStyle="#fff";
        ctx.lineWidth=2;
        ctx.setLineDash([5,3]);
        
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(SLOT_W,0);
        ctx.lineTo(SLOT_W,SLOT_H);
        ctx.lineTo(0,SLOT_H);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw indentation on LEFT side
        ctx.beginPath();
        ctx.arc(0,SLOT_H/2,10,-Math.PI/2,Math.PI/2,true);
        ctx.strokeStyle="rgba(255,255,255,0.8)";
        ctx.stroke();
        
      }else{
        // PIECE: Solid piece with POSITIVE tab (protrusion) on LEFT
        ctx.fillStyle=color;
        ctx.strokeStyle="#fff";
        ctx.lineWidth=3;
        ctx.shadowColor="rgba(0,0,0,0.3)";
        ctx.shadowBlur=8;
        ctx.shadowOffsetX=2;
        ctx.shadowOffsetY=2;
        
        // Main body
        ctx.beginPath();
        ctx.moveTo(15,5);
        ctx.lineTo(SLOT_W,SLOT_H-5);
        
        // LEFT side with POSITIVE tab (protrusion)
        ctx.lineTo(15,SLOT_H);
        ctx.arc(15,SLOT_H/2,10,Math.PI/2,-Math.PI/2,false);
        ctx.lineTo(15,5);
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Inner highlight
        ctx.fillStyle="rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(35,35,15,0,Math.PI*2);
        ctx.fill();
        
        ctx.shadowColor="transparent";
      }
      
      ctx.setLineDash([]);
      ctx.restore();
    }
    
    function drawBackground(){
      const grad=ctx.createLinearGradient(0,0,300,160);
      grad.addColorStop(0,puzzle.bg);
      grad.addColorStop(1,puzzle.color);
      ctx.fillStyle=grad;
      ctx.fillRect(0,0,300,160);
      
      // Draw pattern (abstract trees/waves)
      ctx.fillStyle="rgba(255,255,255,0.15)";
      for(let i=0;i<6;i++){
        ctx.beginPath();
        ctx.moveTo(i*50,160);
        ctx.lineTo(i*50+25,60);
        ctx.lineTo(i*50+50,160);
        ctx.fill();
      }
    }
    
    return{
      draw(){
        ctx.clearRect(0,0,300,160);
        drawBackground();
        
        // Draw slot (target)
        drawPiece(SLOT_X,SLOT_Y,puzzle.color,true);
        
        // Draw draggable piece (only if not currently being dragged)
        if(!dragging||dragPath.length===0){
          drawPiece(pieceX,pieceY,"#e8e8e8",false);
        }
        
        // Draw drag trail
        if(dragPath.length>1){
          ctx.beginPath();
          ctx.strokeStyle="rgba(255,255,255,0.7)";
          ctx.lineWidth=3;
          ctx.setLineDash([6,4]);
          dragPath.forEach((p,i)=>{
            i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Draw piece while dragging
        if(dragging&&lastPos){
          drawPiece(lastPos.x-35,lastPos.y-35,"#f5f5f5",false);
        }
      },
      
      down(p){
        const dist=Math.hypot(p.x-pieceX-35,p.y-pieceY-35);
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
          pieceX=Math.max(0,Math.min(265,p.x-35));
          pieceY=Math.max(0,Math.min(125,p.y-35));
          dragPath.push({x:pieceX+35,y:pieceY+35,t:p.t});
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
            const pathLength=dragPath.reduce((sum,pt,i)=>{
              if(i===0)return 0;
              return sum+Math.hypot(pt.x-dragPath[i-1].x,pt.y-dragPath[i-1].y);
            },0);
            
            const accuracyBonus=Math.round(100-(distX+distY)*2.5);
            const motorScore=api.core.scoreMotor(api.getSamples());
            
            const avgSpeed=pathLength/(duration||1);
            const smoothnessBonus=Math.min(100,Math.abs(avgSpeed-0.3)*150);
            
            const finalBonus=Math.round((accuracyBonus+smoothnessBonus)/2);
            api.finish(Math.max(0,finalBonus),"puzzle-fit");
          }else{
            api.setMsg("Not aligned! Try again.");
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