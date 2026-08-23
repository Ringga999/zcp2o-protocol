import { useEffect, useRef } from "react";
const EMBED="https://ringga999.github.io/zcp2o-protocol/implementations/zcp2o-captcha/widget/embed.js";

export default function Zcp2oCaptcha({threshold=70,onVerified}){
  const ref=useRef(null);
  useEffect(()=>{
    const id="zcp2o-"+Math.random().toString(36).slice(2,8);
    ref.current.id=id;
    const h=e=>onVerified&&onVerified(e.detail.token);
    window.addEventListener("zcp2o:verified",h);
    if(!document.querySelector('script[src="'+EMBED+'"]')){
      const s=document.createElement("script");s.src=EMBED;
      s.setAttribute("data-container","#"+id);
      s.setAttribute("data-threshold",String(threshold));
      document.head.appendChild(s);
    }
    return()=>window.removeEventListener("zcp2o:verified",h);
  },[]);
  return <div ref={ref}/>;
}