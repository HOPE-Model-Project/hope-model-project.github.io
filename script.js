const details={hope:["00","One connected platform","Explore the modules to see how HOPE links decisions across time horizons."],gtep:["01","GTEP · Plan","Evaluate long-term generation, storage, and transmission investment pathways."],pcm:["02","PCM · Operate","Simulate chronological commitment, dispatch, prices, congestion, and emissions."],dart:["03","DART · Settle","Connect day-ahead and real-time market operations with generator-level settlements."],opf:["04","OPF · Flow","Extend HOPE toward network-constrained power-flow analysis. Under development."],ai:["05","HOPE-AI · Coordinate","Build an accessible multi-agent layer across planning, operations, policy, and data."]};
const header=document.querySelector("#header"),menu=document.querySelector(".menu"),nav=document.querySelector("#nav"),nodes=[...document.querySelectorAll(".node")],cards=[...document.querySelectorAll("[data-card]")];
const setHeader=()=>header.classList.toggle("scrolled",scrollY>24);setHeader();addEventListener("scroll",setHeader,{passive:true});
menu.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")==="true";menu.setAttribute("aria-expanded",String(!open));nav.classList.toggle("open",!open)});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{menu.setAttribute("aria-expanded","false");nav.classList.remove("open")}));
function activate(key){const d=details[key];if(!d)return;nodes.forEach(n=>n.classList.toggle("active",n.dataset.module===key));cards.forEach(c=>c.classList.toggle("active",c.dataset.card===key));document.querySelector("#readout-index").textContent=d[0];document.querySelector("#readout-title").textContent=d[1];document.querySelector("#readout-copy").textContent=d[2]}
nodes.forEach(n=>{const run=()=>activate(n.dataset.module);n.addEventListener("mouseenter",run);n.addEventListener("focus",run);n.addEventListener("click",()=>{run();document.querySelector(`[data-card="${n.dataset.module}"]`)?.scrollIntoView({behavior:"smooth",block:"center"})});n.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();n.click()}})});
cards.forEach(c=>{c.addEventListener("mouseenter",()=>activate(c.dataset.card));c.addEventListener("focusin",()=>activate(c.dataset.card))});
const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");reveal.unobserve(e.target)}}),{threshold:.12,rootMargin:"0px 0px -35px"});document.querySelectorAll(".reveal").forEach(el=>reveal.observe(el));
const sections=[...document.querySelectorAll("main section[id]")],links=[...document.querySelectorAll('nav a[href^="#"]')];const sectionWatch=new IntersectionObserver(entries=>{const hit=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(hit)links.forEach(a=>a.classList.toggle("active",a.hash===`#${hit.target.id}`))},{rootMargin:"-25% 0px -60%",threshold:[.01,.2,.5]});sections.forEach(s=>sectionWatch.observe(s));
document.querySelector("#copy").addEventListener("click",async e=>{const text='import Pkg\nPkg.add(url = "https://github.com/HOPE-Model-Project/HOPE.jl")\n\nusing HOPE\nHOPE.run_hope("/path/to/your/case")';try{await navigator.clipboard.writeText(text);e.currentTarget.textContent="Copied"}catch{e.currentTarget.textContent="Select code"}setTimeout(()=>e.currentTarget.textContent="Copy",1800)});
document.querySelector("#year").textContent=new Date().getFullYear();
const mapFrame=document.querySelector("[data-interactive-map]"),mapLaunch=document.querySelector(".map-launch");
if(mapFrame&&mapLaunch){mapLaunch.addEventListener("click",()=>{
  if(mapFrame.querySelector("iframe"))return;
  mapLaunch.classList.add("loading");
  mapLaunch.querySelector("b").textContent="Loading interactive map…";
  const frame=document.createElement("iframe");
  frame.title="HOPE GTEP interactive planning map";frame.loading="lazy";frame.allow="fullscreen";frame.src=mapLaunch.dataset.mapUrl;
  frame.addEventListener("load",()=>mapFrame.closest(".interactive-case")?.classList.add("map-active"),{once:true});
  mapFrame.append(frame);
})}
