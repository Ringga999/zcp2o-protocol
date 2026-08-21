/* ANAK 5: SLIDING-PUZZLE "Shape Match". Registers to Zcp2oChallenges. */

(function(global){
"use strict";

global.Zcp2oChallenges=global.Zcp2oChallenges||{};

const SHAPES=["circle","square","triangle","diamond"];

const PUZZLES=[
  {name:"Forest",color:"#2d5016",bg:"#4a7c23"},
  {name:"Ocean",color:"#1e3a5f",bg:"#2e5c8a"},
  {name:"Mountain",color:"#4a4a4a",bg:"#6b6b6b"},
  {name:"Sunset",color:"#d4a574",bg:"#e8b89d"}
];

// Module-level state to keep shape/puzzle consistent between meta() and create()
let currentShape="circle";
let currentPuzzle=PUZZLES[0];

global.Zcp2oChallenges["sliding-puzzle"]={
  meta(){
    currentShape=SHAPES[Math.floor(Math.random()*SHAPES.length)];
    currentPuzzle=PUZZLES[Math.floor(Math.random()*PUZZLES.length)];
    return{
      label:"Slide the "+currentShape+" to the matching slot.",
      instructions:[
        "Press and hold the white "+currentShape+" on the right.",
        "Drag it smoothly to the dashed slot on the left.",
        "Align it carefully - natural movement is key."
      ],
      shape:currentShape,
      puzzle:currentPuzzle
    };
  },

  create(api){
    const ctx=api.ctx, C=api.core;
    const shape=currentShape;
    const puzzle=currentPuzzle;
    
    // Smaller size
    const SIZE=25;
    const TOLERANCE=15;
    
    // Random slot position (3 zones: top, middle, bottom)
    const slotZones=[45, 80, 115];
    const SLOT_X=75;
    const SLOT_Y=slotZones[Math.floor(Math.random()*slotZones.length)];
    
    const PIECE_X=225;
    const PIECE_Y=80;
    
    let dragging=false, dragStart=0;
    let pieceX=PIECE_X, pieceY=PIECE_Y;
    let dragPath=[], lastPos=null;
    
    function drawShape(x,y,size,shapeType,isSlot=false){
      ctx.save();
      ctx.translate(x,y);
      
      if(isSlot){
        ctx.strokeStyle="rgba(255,255,255,0.8)";
        ctx.lineWidth=2;
        ctx.setLineDash([6,4]);
        ctx.fillStyle="rgba(255,255,255,0.1)";
      }else{
        ctx.fillStyle="#f0f0f0";
        ctx.strokeStyle="#fff";
        ctx.lineWidth=2;
        ctx.shadowColor="rgba(0,0,0,0.3)";
        ctx.shadowBlur=8;
        ctx.shadowOffsetX=2;
        ctx.shadowOffsetY=2;
      }
      
      ctx.beginPath();
      
      switch(shapeType){
        case "circle":
          ctx.arc(0,0,size,0,Math.PI*2);
          break;
          
        case "square":
          ctx.rect(-size,-size,size*2,size*2);
          break;
          
        case "triangle":
          ctx.moveTo(0,-size);
          ctx.lineTo(size,size);
          ctx.lineTo(-size,size);
          ctx.closePath();
          break;
          
        case "diamond":
          ctx.moveTo(0,-size);
          ctx.lineTo(size,0);
          ctx.lineTo(0,size);
          ctx.lineTo(-size,0);
          ctx.closePath();
          break;
      }
      
      ctx.fill();
      ctx.stroke();
      
      if(!isSlot){
        ctx.shadowColor="transparent";
        ctx.fillStyle="rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.arc(-size*0.3,-size*0.3,size*0.3,0,Math.PI*2);
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    function drawBackground(){
      const grad=ctx.createLinearGradient(0,0,300,160);
      grad.addColorStop(0,puzzle.bg);
      grad.addColorStop(1,puzzle.color);
      ctx.fillStyle=grad;
      ctx.fillRect(0,0,300,160);
      
      ctx.fillStyle="rgba(255,255,255,0.05)";
      for(let i=0;i<8;i++){
        ctx.beginPath();
        ctx.arc(i*40+20,80,30,0,Math.PI*2);
        ctx.fill();
      }
    }
    
    return{
      draw(){
        ctx.clearRect(0,0,300,160);
        drawBackground();
        
        drawShape(SLOT_X,SLOT_Y,SIZE,shape,true);
        
        if(dragPath.length>1){
          ctx.beginPath();
          ctx.strokeStyle="rgba(255,255,255,0.4)";
          ctx.lineWidth=2;
          ctx.setLineDash([5,3]);
          dragPath.forEach((p,i)=>{
            i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        if(dragging&&lastPos){
          drawShape(lastPos.x,lastPos.y,SIZE,shape,false);
        }else{
          drawShape(pieceX,pieceY,SIZE,shape,false);
        }
      },
      
      down(p){
        const dist=Math.hypot(p.x-pieceX,p.y-pieceY);
        if(dist<SIZE+10){
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
            
            const accuracyBonus=Math.round(100-(distX+distY)*2);
            const avgSpeed=pathLength/(duration||1);
            const smoothnessBonus=Math.min(100,Math.abs(avgSpeed-0.3)*80);
            
            const finalBonus=Math.round((accuracyBonus+smoothnessBonus)/2);
            api.finish(finalBonus,"shape-match");
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