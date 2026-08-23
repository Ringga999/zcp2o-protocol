/* ZCP2O embed.js v1 — one-line loader. Terbuka & transparan; mesin tetap terproteksi. */
(function(){
"use strict";
if(window.__zcp2oEmbed)return;
var BASE="https://ringga999.github.io/zcp2o-protocol/implementations/zcp2o-captcha/widget/";
var all=Array.prototype.slice.call(document.getElementsByTagName("script"));
var me=document.currentScript||all.filter(function(s){return /\/embed\.js(\?|$)/.test(s.src);})[0];
var cfg={container:(me&&me.getAttribute("data-container"))||null,
  threshold:parseInt((me&&me.getAttribute("data-threshold"))||"70",10),
  callback:(me&&me.getAttribute("data-callback"))||null};
var files=["zcp2o-human-proof.js"];for(var i=1;i<=13;i++)files.push("zcp2o-hp"+i+".js");
function load(src){return new Promise(function(res,rej){var s=document.createElement("script");s.src=BASE+src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
var ready=load(files[0]).then(function(){var c=Promise.resolve();files.slice(1).forEach(function(f){c=c.then(function(){return load(f);});});return c;});
function mount(sel,opts){opts=opts||{};
  return ready.then(function(){
    var target=sel||cfg.container;
    if(!target||!document.querySelector(target)){var el=document.createElement("div");el.id="zcp2o-"+Math.random().toString(36).slice(2,7);document.body.appendChild(el);target="#"+el.id;}
    window.Zcp2oHumanProof.init({container:target,threshold:opts.threshold||cfg.threshold,
      onVerified:function(token){var cb=opts.onVerified||(opts.callback||cfg.callback)?window[opts.callback||cfg.callback]||opts.onVerified:null;
        if(cb)cb(token);window.dispatchEvent(new CustomEvent("zcp2o:verified",{detail:{token:token}}));}});
  });}
window.__zcp2oEmbed=true;window.Zcp2oEmbed={mount:mount,ready:ready};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){mount();});else mount();
})();