/* ZCP2O embed.js v2 — one-line loader + SRI integrity. */
(function(){
"use strict";
if(window.__zcp2oEmbed)return;
var BASE="https://ringga999.github.io/zcp2o-protocol/implementations/zcp2o-captcha/widget/";

/* 🔒 P1: DAFTAR SIDIK JARI (SHA-384). Paste 14 baris output PowerShell di sini. */
var HASHES={
  "zcp2o-human-proof.js": "sha384-dOpxGF4o1qla2uPyFUPpBAncD5bX8Ey3P7FZOTR+CXNrHqt5hRoUBDmkLbKr18u4",
  "zcp2o-hp1.js": "sha384-SFncoLGDS7aa45QTpz70FKM2etSPEHJzMNvE+HvaCWsb3iSCxb0YQ8Jwfvnh0zdD",
  "zcp2o-hp2.js": "sha384-N4ofmxPrifTF1OG2noIUQh7vaAncjyb1rDCl4Q5PxSL6dg71S1cKMBPR/rabUSfB",
  "zcp2o-hp3.js": "sha384-s8FicRJGqrVupg3vHYnRtZfojav1KeYFhV14KLdptSP3NatrjcYfAKcfQK/WPxyj",
  "zcp2o-hp4.js": "sha384-YY/y13HftN1EkOzXEKV/L2ORhoPUbd2JoyKizPs9OA6Ak0shnTfjcBunp/L1BH8L",
  "zcp2o-hp5.js": "sha384-5HcY9f/VGCda+IyknNy+lqo79XrbM0sGgT46w/U3YujVCsIPAbIxxQBUMQjL/FLC",
  "zcp2o-hp6.js": "sha384-LmSkDmRTZ0hYpfVkCHkDkrdMe47hK1mDOsadXLZMJ6F7757ndJcuvgWGTwW2IoO8",
  "zcp2o-hp7.js": "sha384-ULAy0Mf4swT9Wu4xOL/OqR2cGrdOKbd16mWqIuARFOkZ59wUJt00C5VBbThDnAES",
  "zcp2o-hp8.js": "sha384-M3BB9rr6HHpgCUyWPhcgRXKdIUVjv7mmn3dwFB5gy4IVpIjIpTOnlXx7llmnp8f9",
  "zcp2o-hp9.js": "sha384-sVfLJ6U3JepTz3a7neUL7vRYueQYMs+jDeXeN4OBQeidu1fyZ6M7A4rJqnWXGLwS",
  "zcp2o-hp10.js": "sha384-RJZkc1hE9RcusmJBfp/xG5B/Xip2JBfdRMeVYbfxUoL8eKGdoM3vXsTZu8UcpXlN",
  "zcp2o-hp11.js": "sha384-0zcGZ6JVxz0a/87pYKU5JQy+bi8rq1RS3r0X11gFOh0EeqDUgkvtDKJbvOryWZ6H",
  "zcp2o-hp12.js": "sha384-TQ+EpSfHSamYJlIMj4SPdNc6W1a55aBMAz3RJxU+Gxa/LOg/xFXD3CBpOZlodmbd",
  "zcp2o-hp13.js": "sha384-RAphM5o/sKeejbHjuDJgxiy92jvNjUgyme0vo6Q19B/Fsx9Zgt0jqeJpy8kfmAil",
};

var all=Array.prototype.slice.call(document.getElementsByTagName("script"));
var me=document.currentScript||all.filter(function(s){return /\/embed\.js(\?|$)/.test(s.src);})[0];
var cfg={container:(me&&me.getAttribute("data-container"))||null,
  threshold:parseInt((me&&me.getAttribute("data-threshold"))||"70",10),
  callback:(me&&me.getAttribute("data-callback"))||null};

var files=["zcp2o-human-proof.js"];for(var i=1;i<=13;i++)files.push("zcp2o-hp"+i+".js");

function load(src){return new Promise(function(res,rej){
  var s=document.createElement("script");
  s.src=BASE+src;
  if(HASHES[src]){s.integrity=HASHES[src];s.crossOrigin="anonymous";} /* 🔒 satpam SRI */
  s.onload=res;
  s.onerror=function(){console.error("🚨 ZCP2O INTEGRITY FAIL: "+src);rej(new Error("integrity "+src));};
  document.head.appendChild(s);});}

var ready=load(files[0]).then(function(){var c=Promise.resolve();files.slice(1).forEach(function(f){c=c.then(function(){return load(f);});});return c;});

function mount(sel,opts){opts=opts||{};
  return ready.then(function(){
    var target=sel||cfg.container;
    if(!target||!document.querySelector(target)){var el=document.createElement("div");el.id="zcp2o-"+Math.random().toString(36).slice(2,7);document.body.appendChild(el);target="#"+el.id;}
    window.Zcp2oHumanProof.init({container:target,threshold:opts.threshold||cfg.threshold,
      onVerified:function(token){var cb=opts.onVerified||window[opts.callback||cfg.callback];
        if(cb)cb(token);window.dispatchEvent(new CustomEvent("zcp2o:verified",{detail:{token:token}}));}});
  });}

window.__zcp2oEmbed=true;window.Zcp2oEmbed={mount:mount,ready:ready};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){mount();});else mount();
})();