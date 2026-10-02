const {spawn}=require('node:child_process');const fs=require('node:fs');const path=require('node:path');
const base=process.argv[2]||'http://127.0.0.1:4173';const out=path.resolve('qa',base.includes('127.0.0.1')?'v4-local':'v4-live');fs.mkdirSync(out,{recursive:true});
const chrome=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--no-first-run','--remote-debugging-port=9361',`--user-data-dir=${path.resolve('qa/v4-chrome')}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let ws,id=0;const pending=new Map();const report={base,checks:[],errors:[],widths:[],motion:[]};
function send(method,params={}){return new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>reject(Error(method)),25000);pending.set(key,{resolve:r=>{clearTimeout(timer);resolve(r)},reject});ws.send(JSON.stringify({id:key,method,params}));});}
async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;}
function check(name,ok,details){report.checks.push({name,passed:!!ok,details});console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)process.exitCode=1;}
async function until(e){for(let i=0;i<160;i++){if(await ev(e))return;await sleep(200);}throw Error('Timed out '+e);}
async function size(width,height){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});await sleep(250);}
async function shot(name){await sleep(400);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));}
async function scene(key,p=0){await ev(`(()=>{const s=document.querySelector('[data-film-scene="${key}"]');window.scrollTo({top:s.getBoundingClientRect().top+scrollY-(innerWidth<768?74:86)+${p}*s.offsetHeight,behavior:'instant'});})()`);await sleep(120);}
const scenes=['hero','ai','categories','emotion','camera','magazine','universe','process','difference','studio','final'];
(async()=>{let pages;for(let i=0;i<60;i++){try{pages=await fetch('http://127.0.0.1:9361/json/list').then(r=>r.json());if(pages.length)break;}catch{}await sleep(200);}
ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};await send('Page.enable');await send('Runtime.enable');await size(1440,900);await send('Page.navigate',{url:base});await until('document.readyState==="complete"&&document.querySelector("#root")?.textContent.length>100');
if(!await ev('!!document.querySelector(".memory-world")')) {
  check('Production serves V4 homepage',false,{reason:'The live domain still serves the previous homepage'});
  for(const width of [390,1440]){await size(width,width===390?844:900);await ev('window.scrollTo({top:0,behavior:"instant"})');await shot(width+'-previous-live-hero');await ev('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await shot(width+'-previous-live-footer');}
  return;
}
await ev('document.fonts.ready.then(()=>true)');await sleep(1500);await until('document.querySelectorAll(".scene-category-object").length>0 || document.querySelector(".scene-status").textContent.includes("unavailable")');
check('Live catalog loaded',await ev('document.querySelectorAll(".scene-category-object").length>0'));check('One physical frame',await ev('document.querySelectorAll(".world-frame-shell").length===1'));
for(const [w,h] of [[320,568],[360,800],[375,812],[390,844],[393,852],[412,915],[430,932],[768,1024],[1024,768],[1280,800],[1366,768],[1440,900],[1728,1117],[1920,1080],[2560,1440]]){await size(w,h);const widths=[];for(const key of scenes){await scene(key);widths.push(await ev(`({scene:'${key}',overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,frame:getComputedStyle(document.querySelector('.world-stage')).visibility})`));}report.widths.push({width:w,height:h,scenes:widths});check('No overflow '+w,widths.every(r=>!r.overflow),widths.filter(r=>r.overflow));if(w===390||w===1440){for(const key of scenes){await scene(key);if(key==='magazine')await scene(key,.3);if(key==='universe')await scene(key,.25);await shot(w+'-'+key);}await ev('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await shot(w+'-footer');}}
await size(390,844);await scene('hero');const fold=await ev(`(()=>{const b=document.querySelector('.scene-hero-actions').getBoundingClientRect(),f=document.querySelector('[data-film-anchor="hero"]').getBoundingClientRect(),a=document.querySelector('.scene-ai').getBoundingClientRect();return {ctaBottom:b.bottom,frameTop:f.top,frameBottom:f.bottom,next:a.top}})()`);check('390 first fold',fold.ctaBottom<844&&fold.frameBottom<844&&fold.next<844,fold);check('Mobile has no full product grid',await ev('getComputedStyle(document.querySelector(".scene-favourites")).display==="none"'));
await scene('emotion');check('Emotional scene hides frame',await ev('getComputedStyle(document.querySelector(".world-stage")).visibility==="hidden"'));
await scene('categories');check('Category background frame visible',await ev('getComputedStyle(document.querySelector(".world-stage")).visibility==="visible"'));
await scene('process');check('Process background frame visible',await ev('getComputedStyle(document.querySelector(".world-stage")).visibility==="visible"'));
await scene('final');check('Final frame starts strong',await ev('Number(document.querySelector(".world-stage").style.opacity)>.95'));
await ev('window.scrollBy({top:160,behavior:"instant"})');await sleep(120);check('Final frame exits with scroll',await ev('Number(document.querySelector(".world-stage").style.opacity)<.8'));
await scene('final');check('Final frame reverses immediately',await ev('Number(document.querySelector(".world-stage").style.opacity)>.95'));
await ev('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await sleep(120);check('Footer has no frame',await ev('getComputedStyle(document.querySelector(".world-stage")).visibility==="hidden"'));
await size(1440,900);await scene('magazine',.45);check('Magazine resolves from memories',await ev('Number(document.querySelector(".world-stage").style.getPropertyValue("--book-alpha"))>.95'));await shot('1440-magazine-complete');
for(const p of [.2,.4,.6]){await scene('universe',p);await shot('1440-product-'+p);}
await scene('ai');const start=await ev('scrollY');await ev('window.scrollBy({top:130,behavior:"instant"})');await sleep(80);const a=await ev('({scroll:scrollY,directed:Number(document.querySelector(".world-stage").dataset.scroll),transform:document.querySelector(".world-stage").style.transform})');await sleep(350);const b=await ev('document.querySelector(".world-stage").style.transform');check('Scroll follows directly and stops immediately',Math.abs(a.scroll-a.directed)<2&&a.transform===b,{start,...a,after:b});
await size(390,844);await scene('ai');await ev('document.querySelector(".scene-suggestions button").click()');await until('!!document.querySelector(".scene-results")');check('AI hard budget filter',await ev('[...document.querySelectorAll(".scene-result-grid strong")].every(el=>Number(el.textContent.replace(/[^0-9.]/g,""))<=800)'));await ev('document.querySelector(".scene-results").scrollIntoView({behavior:"instant",block:"start"})');await shot('390-ai-results');const product=await ev('document.querySelector(".scene-result-grid a").getAttribute("href")');
await ev('document.querySelector(`[aria-label="Open navigation menu"]`).click()');check('Mobile menu',await ev('!!document.querySelector(".motion-menu-overlay")'));await shot('390-menu');await ev('document.querySelector(`[aria-label="Close menu"]`).click()');await ev('document.querySelector(`[aria-label="Search gifts"]`).click()');check('Search',await ev('!!document.querySelector(".motion-nav-overlay input")'));await shot('390-search');await ev('document.querySelector(`[aria-label="Close search"]`).click()');
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await scene('hero');check('Reduced motion static model',await ev('getComputedStyle(document.querySelector(".world-object")).transform==="none"'));await shot('390-reduced-motion');
for(const route of [product,'/shop/frames','/shop/magazines','/login','/signup','/account','/cart','/checkout']){await send('Page.navigate',{url:base+route});await until('document.readyState==="complete"&&document.querySelector("#root")?.textContent.length>100');await sleep(250);check('Route '+route,await ev('!document.querySelector("#runtime-error-banner")'));}

if(base.includes('127.0.0.1')) {
  // These tests write only to this disposable browser's cart, never orders or payments.
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  for(const [id,qty,price] of [['pol1',18,5],['pol2',12,8],['pol3',6,15]]) {
    await ev('localStorage.removeItem("cart")');await send('Page.navigate',{url:base+'/product/'+id});
    await until('!!document.querySelector(".lucide-plus")');
    await ev('document.querySelector(".lucide-plus").closest("button").click()');await sleep(100);
    await ev('[...document.querySelectorAll("button")].find(b=>/^ADD TO BAG/.test(b.textContent.trim())).click()');await sleep(150);
    const cart=await ev('JSON.parse(localStorage.getItem("cart"))');
    check('Polaroid '+id+' quantity and price',cart?.length===1&&cart[0].quantity===qty&&cart[0].price===price,{quantity:cart?.[0]?.quantity,unitPrice:cart?.[0]?.price,total:qty*price});
    await send('Page.navigate',{url:base+'/cart'});await until('document.readyState==="complete"&&document.querySelector("#root")?.textContent.length>100');await sleep(150);
    check('Cart persists '+id,await ev('JSON.parse(localStorage.getItem("cart"))[0].quantity==='+qty));
  }
  await ev('localStorage.removeItem("cart")');await send('Page.navigate',{url:base+'/product/collared-tshirt'});
  await until('!!document.querySelector("input[type=number]")');
  const tiers=[];
  for(const quantity of [1,5,10,20]) {
    await ev('(()=>{const input=document.querySelector("input[type=number]");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(input,'+quantity+');input.dispatchEvent(new Event("input",{bubbles:true}));})()');await sleep(100);
    tiers.push(await ev('(()=>{const text=[...document.querySelectorAll("span")].find(s=>s.textContent==="Unit Price:");return Number(text.nextElementSibling.textContent.replace(/[^0-9.]/g,""));})()'));
  }
  check('Apparel discount tiers preserved',tiers.every((p,i)=>p===tiers[0]-[0,20,40,80][i]),tiers);
  check('Apparel initializes color and size',await ev('!!document.querySelector("button[aria-label].ring-2")&&[...document.querySelectorAll("button")].some(b=>b.classList.contains("bg-indigo-100"))'));
}
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
await send('Page.navigate',{url:base});await until('!!document.querySelector(".world-stage")');await sleep(700);
for(const width of [390,1440]) {
  await size(width,width===390?844:900);await scene('hero');
  report.geometry=report.geometry||[];report.geometry.push(await ev('(()=>{const c=document.querySelector(".scene-container").getBoundingClientRect();return {width:innerWidth,containerLeft:c.left,padding:getComputedStyle(document.querySelector(".scene-container")).paddingLeft}})()'));
  await ev('(()=>{const d=document.createElement("div");d.id="qa-grid";d.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:1000;background:repeating-linear-gradient(90deg,transparent,transparent calc(100% / 12 - 1px),#123c6933 calc(100% / 12 - 1px),#123c6933 calc(100% / 12));border:1px solid #c5a46d";const line=document.createElement("i");line.style.cssText="position:absolute;left:50%;height:100%;border-left:1px solid red";d.append(line);document.body.append(d)})()');
  await shot(width+'-alignment');await ev('document.getElementById("qa-grid").remove()');
}
await size(1440,900);await scene('hero');
const perf=await ev('new Promise(resolve=>{const deltas=[];let first,prev;function frame(t){first??=t;if(prev)deltas.push(t-prev);prev=t;window.scrollTo({top:(document.querySelector(".memory-world").offsetHeight-innerHeight)*(t-first)/4000,behavior:"instant"});if(t-first<4000)requestAnimationFrame(frame);else{deltas.sort((a,b)=>a-b);resolve({frames:deltas.length,averageFps:1000/(deltas.reduce((a,b)=>a+b,0)/deltas.length),p95Ms:deltas[Math.floor(deltas.length*.95)],context:"Headless Chrome on this development machine; not a device benchmark"})}}requestAnimationFrame(frame)})');report.performance=perf;console.log('Scroll performance',JSON.stringify(perf));
check('No runtime exceptions',report.errors.length===0,report.errors);
})().catch(e=>{report.errors.push(e.stack);process.exitCode=1;console.error(e)}).finally(()=>{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));ws?.close();chrome.kill()});
