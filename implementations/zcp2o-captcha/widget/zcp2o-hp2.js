/* ANAK 2: STEADY-HOLD "Drone Hover". Registers to Zcp2oChallenges. */
(function (global) {
  "use strict";
  global.Zcp2oChallenges=global.Zcp2oChallenges||{};

  global.Zcp2oChallenges["steady-hold"]={
    meta(){return{label:"Keep your cursor on the moving drone for 3 seconds.",
      instructions:["Press and stay on the moving dot.","Follow it smoothly as it drifts.","Keep contact for 3 s until the ring completes."]};},
    create(api){
      const ctx=api.core?api.ctx:api.ctx, C=api.core, R=26;
      const a=Math.random()*6.283,b=Math.random()*6.283;
      const dpos=t=>({x:150+105*Math.sin(t*0.00045+a),y:80+52*Math.sin(t*0.0007+b)});
      let holding=false,start=0,dists=[],lastNow=performance.now(),drone=dpos(lastNow);

      return{
        draw(){
          // contact zone
          ctx.beginPath();ctx.arc(drone.x,drone.y,R,0,7);ctx.strokeStyle="rgba(42,167,119,.35)";ctx.stroke();
          // drone body
          ctx.beginPath();ctx.arc(drone.x,drone.y,8,0,7);ctx.fillStyle="#2a7";ctx.fill();
          ctx.beginPath();ctx.arc(drone.x,drone.y,3,0,7);ctx.fillStyle="#fff";ctx.fill();
          // progress ring
          if(holding){const el=C.clamp((lastNow-start)/3000,0,1);
            ctx.beginPath();ctx.arc(drone.x,drone.y,R+4,-Math.PI/2,-Math.PI/2+el*2*Math.PI);
            ctx.strokeStyle="#2a7";ctx.lineWidth=4;ctx.stroke();ctx.lineWidth=1;}
        },
        down(p){const d=dpos(lastNow);if(Math.hypot(p.x-d.x,p.y-d.y)<=R){holding=true;start=p.t;dists=[];api.clear();api.push(p);}},
        move(p){if(holding){const d=dpos(lastNow);const dist=Math.hypot(p.x-d.x,p.y-d.y);
          if(dist>R){holding=false;api.clear();api.setMsg("Lost the drone! Try again.");}
          else{dists.push(dist);api.push(p);}}},
        up(){holding=false;},
        tick(now){lastNow=now;drone=dpos(now);
          if(holding&&(now-start)>=3000){holding=false;
            const md=C.mean(dists);const bonus=Math.round(C.band(md,2,14,0,26));
            api.finish(bonus,"pursuit");}},
        active(){return holding;}
      };
    }
  };
})(window);