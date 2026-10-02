const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = path.resolve('qa', 'alignment');
fs.mkdirSync(out, { recursive:true });
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new','--no-first-run','--remote-debugging-port=9343',`--user-data-dir=${path.resolve('qa/chrome-alignment-profile')}`,'about:blank'], { windowsHide:true, stdio:'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let ws, id=0;
const pending=new Map();
const report={base, checks:[], widths:[], errors:[]};
function send(method,params={}) { return new Promise((resolve,reject) => { const key=++id; const timer=setTimeout(() => reject(new Error(method)),25000); pending.set(key,{resolve:r=>{clearTimeout(timer);resolve(r);},reject}); ws.send(JSON.stringify({id:key,method,params})); }); }
async function evaluate(expression) { const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text); return r.result?.value; }
async function until(expression) { for(let i=0;i<100;i++){if(await evaluate(expression))return;await sleep(200);}throw new Error(`Condition failed: ${expression}`); }
function check(name,passed,details) { report.checks.push({name,passed:!!passed,details}); console.log(`${passed?'PASS':'FAIL'} ${name}`); if(!passed)process.exitCode=1; }
async function shot(name) { await sleep(350);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,`${name.replace(/[^a-z0-9_-]/gi,'-')}.png`),Buffer.from(r.data,'base64')); }
async function nav(route) {await send('Page.navigate',{url:base+route});await until('document.readyState === "complete" && !!document.querySelector("#root")?.children.length');await sleep(600);}
async function size(width,height=844) { await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});await send('Emulation.setTouchEmulationEnabled',{enabled:width<768,maxTouchPoints:1}); }
async function scene(selector,name) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`);
  await sleep(300);await shot(name);
  const visual=await evaluate(`(()=>{const frame=document.querySelector('.memory-object-position'),r=frame.getBoundingClientRect();const overlaps=[...document.querySelectorAll('main input,main .motion-button,main .motion-link,main .motion-category-object')].filter(el=>{const b=el.getBoundingClientRect();return b.width&&b.height&&b.top>=75&&b.bottom<innerHeight-55&&r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top;}).map(el=>el.textContent||el.id);return {scene:frame.dataset.scene,opacity:Number(frame.style.opacity),z:Number(frame.dataset.z),width:r.width,top:r.top,bottom:r.bottom,inViewport:r.bottom>75&&r.top<innerHeight-55&&r.right>0&&r.left<innerWidth,overlaps};})()`);
  check(name+' frame remains present',visual.opacity>=.15&&visual.inViewport,visual);
  if(name.startsWith('mobile-'))check(name+' controls outside frame',visual.overlaps.length===0,visual.overlaps);
  if(selector==='footer'){
    const visible=await evaluate(`(()=>{const el=document.querySelector('.footer-infinity-name');const r=el.getBoundingClientRect();return {top:r.top,font:getComputedStyle(el).fontSize,weight:getComputedStyle(el).fontWeight,text:el.textContent,visible:el.contains(document.elementFromPoint(r.left+60,r.top+r.height/2))};})()`);
    check(name+' bold wordmark visible',visible.visible&&visible.weight==='800'&&visible.text==='INFINITY',visible);
  }
}
(async()=>{
  let pages;
  for(let i=0;i<50;i++){try{pages=await fetch('http://127.0.0.1:9343/json/list').then(r=>r.json());if(pages.length)break;}catch{}await sleep(200);}
  ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});await size(1440,900);await nav('/');await until('!!document.querySelector(".footer-infinity-name")');await evaluate('document.fonts.ready.then(()=>true)');
  for(const [width,height] of [[1280,720],[1366,768],[1440,900],[1536,864],[1728,1117],[1920,1080],[320,568],[360,800],[375,812],[390,844],[393,852],[412,915],[430,932]]){
    await size(width,height);await sleep(350);
    const guides=await evaluate(`(()=>{const selectors=['.film-hero','#infinity-ai-concierge','#collections-section','#made-around-your-story','#start-creating','footer'];return selectors.map(s=>({selector:s,padding:getComputedStyle(document.querySelector(s)).paddingLeft}));})()`);
    check(`${width} shared horizontal guides`,guides.every(g=>g.padding===guides[0].padding),guides);
    for(const [selector,label] of [['#infinity-ai-concierge','ai'],['#made-around-your-story','story']]){
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`);await sleep(250);
      const frame=await evaluate(`(()=>{const s=document.querySelector(${JSON.stringify(selector)}),a=s.querySelector('[data-memory-anchor]'),f=document.querySelector('.memory-object-position'),r=f.getBoundingClientRect(),ar=a.getBoundingClientRect(),h=s.querySelector('h2').getBoundingClientRect();return {scene:f.dataset.scene,x:r.left+r.width/2,targetX:ar.left+ar.width/2,width:r.width,top:r.top,bottom:r.bottom,headingRight:h.right,viewWidth:innerWidth};})()`);
      check(`${width} ${label} balanced frame`,frame.scene===label&&Math.abs(frame.x-frame.targetX)<24&&frame.width>(width>=768?220:65)&&frame.top>=70&&frame.bottom<=height-45,frame);
      if(width===1440||width===390)await shot(`${width}-${label}`);
    }
    await evaluate('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await sleep(300);
    const footer=await evaluate(`(()=>{const n=document.querySelector('.footer-infinity-name'),w=n.getBoundingClientRect(),sub=document.querySelector('.motion-footer-wordmark small').getBoundingClientRect(),f=document.querySelector('.memory-object-position'),r=f.getBoundingClientRect();return {font:getComputedStyle(n).fontSize,width:w.width,x:w.left,top:w.top,bottom:w.bottom,subtitleTop:sub.top,subtitleLeft:sub.left,subtitleFont:getComputedStyle(document.querySelector('.motion-footer-wordmark small')).fontSize,frame:{width:r.width,top:r.top,bottom:r.bottom,z:Number(f.dataset.z),scene:f.dataset.scene},overflow:document.documentElement.scrollWidth>innerWidth};})()`);
    check(`${width} full-width closing wordmark`,footer.width>=width*.88&&footer.width<=width*.96&&footer.top>70&&footer.bottom<height-50,footer);
    check(`${width} subtitle directly below`,footer.subtitleTop>=footer.bottom&&footer.subtitleTop-footer.bottom<36&&Math.abs(footer.subtitleLeft-footer.x)<1,footer);
    check(`${width} visible frame retreats above wordmark`,footer.frame.z<0&&footer.frame.width>85&&footer.frame.top>=70&&footer.frame.bottom<footer.top,footer);
    check(`${width} no horizontal overflow`,!footer.overflow,footer);
    report.widths.push({width,height,footer});
    if(width===1440||width===390)await shot(`${width}-footer`);
  }
  await size(390,844);await evaluate('window.scrollTo({top:0,behavior:"instant"})');await sleep(200);
  const footerStart=await evaluate(`document.querySelector('footer').getBoundingClientRect().top+scrollY`);
  const depths=[];for(const top of [footerStart-450,footerStart-250,footerStart-50,footerStart+200]){await evaluate(`window.scrollTo({top:${top},behavior:'instant'})`);await sleep(60);depths.push(await evaluate('Number(document.querySelector(".memory-object-position").dataset.z)'));}
  check('Footer depth retreats continuously',depths.every((z,i)=>!i||z<=depths[i-1]),depths);
  check('No runtime errors',report.errors.length===0,report.errors);
})().catch(error=>{report.errors.push(error.stack);console.error(error);process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));ws?.close();chrome.kill();});
