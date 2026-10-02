const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = path.resolve('qa', 'strict');
fs.mkdirSync(out, { recursive:true });
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new','--no-first-run','--remote-debugging-port=9343',`--user-data-dir=${path.resolve('qa/chrome-alignment-profile')}`,'about:blank'], { windowsHide:true, stdio:'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let ws, id=0;
const pending=new Map();
const report={base, checks:[], widths:[], errors:[]};
function send(method,params={}) { return new Promise((resolve,reject) => { const key=++id; const timer=setTimeout(() => reject(new Error(method)),25000); pending.set(key,{resolve:r=>{clearTimeout(timer);resolve(r);},reject}); ws.send(JSON.stringify({id:key,method,params})); }); }
async function evaluate(expression) { const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text); return r.result?.value; }
async function until(expression) { for(let i=0;i<100;i++){if(await evaluate(expression))return;await sleep(200);}throw new Error(`Condition failed: ${expression}`); }
function check(name,passed,details) { report.checks.push({name,passed:!!passed,details}); console.log(`${passed?'PASS':'FAIL'} ${name}`);if(!passed)console.log(JSON.stringify(details)); if(!passed)process.exitCode=1; }
async function shot(name) { await sleep(350);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,`${name.replace(/[^a-z0-9_-]/gi,'-')}.png`),Buffer.from(r.data,'base64')); }
async function nav(route) {await send('Page.navigate',{url:base+route});await until('document.readyState === "complete" && !!document.querySelector("#root")?.children.length');await sleep(600);}
async function size(width,height=844) { await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});await send('Emulation.setTouchEmulationEnabled',{enabled:width<768,maxTouchPoints:1}); }
async function scene(selector,name) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`);
  if(selector==='footer')await evaluate('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');
  await sleep(300);await shot(name);
  const visual=await evaluate(`(()=>{const frame=document.querySelector('.memory-object-position'),r=frame.getBoundingClientRect();const overlaps=[...document.querySelectorAll('main input,main .motion-button,main .motion-link,main .motion-category-object')].filter(el=>{const b=el.getBoundingClientRect();return b.width&&b.height&&b.top>=75&&b.bottom<innerHeight-55&&r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top;}).map(el=>el.textContent||el.id);return {scene:frame.dataset.scene,opacity:Number(frame.style.opacity),z:Number(frame.dataset.z),width:r.width,top:r.top,bottom:r.bottom,inViewport:r.bottom>75&&r.top<innerHeight-55&&r.right>0&&r.left<innerWidth,overlaps};})()`);
  const hidden=['giftFeeling','onePhotoChapter','products','moments','founder','footer'].includes(visual.scene)||visual.scene==='categories'&&visual.opacity===0;
  check(name+(hidden?' frame is completely hidden':' frame remains present'),hidden ? visual.opacity===0 : visual.opacity>=.15&&visual.inViewport,visual);
  if(name.startsWith('mobile-'))check(name+' controls outside frame',hidden||visual.overlaps.length===0,visual.overlaps);
  if(selector==='footer'){
    const visible=await evaluate(`(()=>{const el=document.querySelector('.footer-infinity-name');const r=el.getBoundingClientRect();return {top:r.top,font:getComputedStyle(el).fontSize,weight:getComputedStyle(el).fontWeight,text:el.textContent,visible:el.contains(document.elementFromPoint(r.left+60,r.top+r.height/2))};})()`);
    check(name+' bold wordmark visible',visible.visible&&visible.weight==='800'&&visible.text==='INFINITY',visible);
  }
}
(async()=>{
  let pages;for(let i=0;i<50;i++){try{pages=await fetch('http://127.0.0.1:9343/json/list').then(r=>r.json());if(pages.length)break;}catch{}await sleep(200);}
  ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});await size(1440,900);await nav('/');await evaluate('document.fonts.ready.then(()=>true)');
  const scenes=[['.film-hero','hero'],['#infinity-ai-concierge','ai'],['#collections-section','categories'],['.film-gift-feeling','giftFeeling'],['.film-one-photo','onePhotoChapter'],['#made-around-your-story','cameraRoll'],['#infinity-difference','infinityDifference'],['#how-it-works','howItWorks'],['#start-creating','finalMemory'],['footer','footer']];
  for(const [width,height] of [[1440,900],[390,844],[320,568],[360,800],[375,812],[393,852],[412,915],[430,932],[1280,720],[1366,768],[1728,1117],[1920,1080]]){
    await size(width,height);await sleep(150);
    for(const [selector,key] of scenes){
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`);if(key==='footer')await evaluate('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await sleep(150);
      const state=await evaluate(`(()=>{const s=document.querySelector(${JSON.stringify(selector)}),f=document.querySelector('.memory-object-position'),r=f.getBoundingClientRect(),h=s.querySelector('h2')?.getBoundingClientRect(),anchor=s.querySelector('[data-memory-anchor]')?.getBoundingClientRect();return {scene:f.dataset.scene,opacity:Number(f.style.opacity),visibility:f.style.visibility,center:r.left+r.width/2,top:r.top,bottom:r.bottom,width:r.width,headingCenter:h?h.left+h.width/2:null,anchorCenter:anchor?anchor.left+anchor.width/2:null,overflow:document.documentElement.scrollWidth>innerWidth,footerAnchor:!!document.querySelector('footer [data-memory-anchor]')};})()`);
      const hidden=['giftFeeling','onePhotoChapter','footer'].includes(key);
      check(`${width} ${key} visibility`,hidden?state.opacity===0&&state.visibility==='hidden':key==='categories'?state.opacity<=.35:state.opacity>0,state);
      if(key==='finalMemory')check(`${width} final exact center`,Math.abs(state.center-(width-(width>=768?15:0))/2)<10&&Math.abs(state.headingCenter-state.center)<5,state);
      if(key==='giftFeeling')check(`${width} editorial heading centered`,Math.abs(state.headingCenter-(width-(width>=768?15:0))/2)<5,state);
      check(`${width} ${key} no overflow`,!state.overflow,state);
      if([1440,390].includes(width)){
        await shot(`${width}-${key}`);
        await evaluate(`(()=>{const style=document.createElement('style');style.id='qa-director-grid';style.textContent='body:before{content:"";position:fixed;inset:0;z-index:99999;pointer-events:none;background:linear-gradient(90deg,transparent calc(50% - 1px),#ef444488 50%,transparent calc(50% + 1px))}main [data-memory-scene]{outline:1px solid #10b98199}.memory-object-position:after{content:"+";position:absolute;top:50%;left:50%;color:red;font-size:32px;transform:translate(-50%,-50%)}main:after{content:"";position:fixed;top:75px;bottom:60px;left:var(--page-inset);right:var(--page-inset);z-index:99998;pointer-events:none;border-inline:1px solid #38bdf8;background:repeating-linear-gradient(90deg,#38bdf810 0,#38bdf810 calc(100% / 12 - 1px),#38bdf855 calc(100% / 12 - 1px),#38bdf855 calc(100% / 12))}';document.head.append(style);return true})()`);
        await shot(`${width}-${key}-debug`);await evaluate('document.getElementById("qa-director-grid").remove();true');
      }
    }
    check(`${width} footer zero objects`,await evaluate('!document.querySelector("footer .memory-anchor,footer img,.footer-frame-stage")'));
    const scan=await evaluate(`(()=>{const footer=document.querySelector('footer').getBoundingClientRect().top+scrollY;return {end:document.documentElement.scrollHeight-innerHeight,footer};})()`);
    const samples=[];
    const positions=[];for(let top=0;top<=scan.end;top+=Math.max(80,height/5))positions.push(top);for(const top of [...positions,...positions.slice().reverse()]){
      await evaluate(`window.scrollTo({top:${top},behavior:'instant'})`);await sleep(18);
      const x=await evaluate(`(()=>{const f=document.querySelector('.memory-object-position'),r=f.getBoundingClientRect(),visible=Number(f.style.opacity)>.001;const overlaps=visible?[...document.querySelectorAll('main input,main button,main a,main p:not(.film-eyebrow):not(.motion-kicker), main .film-story-note > span')].filter(el=>{const b=el.getBoundingClientRect();return b.width&&b.height&&b.top>=75&&b.bottom<=innerHeight-55&&r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top;}).map(el=>el.className||el.textContent.slice(0,40)):[];return {scroll:scrollY,scene:f.dataset.scene,opacity:Number(f.style.opacity),overlaps,footerVisible:document.querySelector('footer').getBoundingClientRect().top<innerHeight};})()`);
      if(x.overlaps.length||x.footerVisible&&x.opacity!==0)samples.push(x);
    }
    check(`${width} down/up scroll path clear of body and controls`,samples.length===0,samples);
  }
  check('No runtime errors',report.errors.length===0,report.errors);
})().catch(error=>{report.errors.push(error.stack);console.error(error);process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));ws?.close();chrome.kill();});
