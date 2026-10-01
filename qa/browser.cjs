const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = path.resolve('qa', base.includes('127.0.0.1') ? 'local' : 'live');
fs.mkdirSync(out, { recursive:true });
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new','--no-first-run','--remote-debugging-port=9341',`--user-data-dir=${path.resolve('qa/chrome-profile')}`,'about:blank'], { windowsHide:true, stdio:'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let ws, id=0;
const pending=new Map();
const report={base, checks:[], widths:[], errors:[]};
function send(method,params={}) { return new Promise((resolve,reject) => { const key=++id; const timer=setTimeout(() => reject(new Error(method)),25000); pending.set(key,{resolve:r=>{clearTimeout(timer);resolve(r);},reject}); ws.send(JSON.stringify({id:key,method,params})); }); }
async function evaluate(expression) { const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text); return r.result?.value; }
async function until(expression) { for(let i=0;i<100;i++){if(await evaluate(expression))return;await sleep(200);}throw new Error(`Condition failed: ${expression}`); }
function check(name,passed,details) { report.checks.push({name,passed:!!passed,details}); console.log(`${passed?'PASS':'FAIL'} ${name}`); }
async function shot(name) { await sleep(350);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,`${name}.png`),Buffer.from(r.data,'base64')); }
async function nav(route) {await send('Page.navigate',{url:base+route});await until('document.readyState === "complete" && !!document.querySelector("#root")?.children.length');await sleep(600);}
async function size(width,height=844) { await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768}); }
async function scene(selector,name) { await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`);await sleep(600);await shot(name); }
(async()=>{
  let pages;
  for(let i=0;i<50;i++){try{pages=await fetch('http://127.0.0.1:9341/json/list').then(r=>r.json());if(pages.length)break;}catch{}await sleep(200);}
  ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
  await send('Page.enable');await send('Runtime.enable');await size(1440,900);await nav('/');
  await until('document.querySelectorAll(".studio-product-card").length > 0');
  await until('document.querySelector(".memory-frame-face img")?.naturalWidth > 0');
  await evaluate('window.__memory=document.querySelector(".memory-object-position");true');await shot('desktop-hero');
  check('One persistent memory object',await evaluate('document.querySelectorAll(".memory-object-position").length===1'));
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1000,y:400});await sleep(100);
  check('Desktop pointer tilt',await evaluate('document.querySelector(".memory-frame-body").style.getPropertyValue("--pointer-x")!==""'));
  for(const width of [320,360,375,390,393,412,430,768,1024,1280,1366,1440,1728,1920,2560]){
    await size(width,width<768?844:900);await evaluate('window.scrollTo({top:0,behavior:"instant"})');await sleep(200);
    const d=await evaluate('({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,hero:document.querySelector(".film-hero").getBoundingClientRect().height})');
    report.widths.push({width,...d});check(`No horizontal overflow at ${width}`,d.scroll<=d.client);
    if(width===390){check('Mobile hero 470–560px',d.hero>=470&&d.hero<=560);await shot('mobile-hero');}
  }
  await size(1440,900);
  for(const [selector,name] of [['#infinity-ai-concierge','ai'],['#collections-section','categories'],['#made-for-you','products'],['#made-around-your-story','transformation'],['.film-moments','moments'],['#infinity-difference','difference'],['#how-it-works','process'],['.film-founder','founder'],['#start-creating','final'],['footer','footer']])await scene(selector,`desktop-${name}`);
  check('Memory object remains mounted',await evaluate('window.__memory===document.querySelector(".memory-object-position")'));
  await size(390);
  for(const [selector,name] of [['#infinity-ai-concierge','ai'],['#collections-section','categories'],['#made-for-you','products'],['#made-around-your-story','transformation'],['.film-moments','moments'],['#infinity-difference','difference'],['#how-it-works','process'],['.film-founder','founder'],['#start-creating','final'],['footer','footer']])await scene(selector,`mobile-${name}`);
  await scene('#infinity-ai-concierge','mobile-ai-before');
  await evaluate(`document.querySelector('.motion-ai-suggestions button').click()`);
  await until('document.querySelectorAll(".motion-recommendation").length>0');
  const prices=await evaluate('Array.from(document.querySelectorAll(".motion-recommendation>strong")).map(n=>Number(n.textContent.replace(/[^0-9.]/g,"")))');
  check('AI respects ₹800 budget',prices.every(p=>p<=800),prices);await shot('mobile-ai-results');
  await scene('#made-for-you','mobile-quickview-before');
  const beforeSaved=await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.getAttribute("aria-label")==="Save to Wishlist").getAttribute("aria-pressed")');
  await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.getAttribute("aria-label")==="Save to Wishlist").click()');await sleep(150);
  check('Guest saved gift functional',await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.getAttribute("aria-label")==="Save to Wishlist").getAttribute("aria-pressed")')!==beforeSaved);
  await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.textContent.includes("Quick View")).click()');await sleep(300);await shot('mobile-quickview');
  check('Quick view fits mobile',await evaluate('document.documentElement.scrollWidth<=390'));
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
  await evaluate('document.querySelector(".motion-menu-toggle").click()');await shot('mobile-menu');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
  for(const route of ['/login','/signup','/account','/shop/magazines','/shop/not-a-category']){await nav(route);await shot('mobile'+route.replaceAll('/','-'));check(`${route} no overflow`,await evaluate('document.documentElement.scrollWidth<=390'));}
  await size(1440,900);for(const route of ['/login','/signup','/account']){await nav(route);await shot('desktop'+route.replaceAll('/','-'));}
  // Authenticated account QA uses a browser-only fixture; no customer account or order is created.
  const fixture={name:'QA Customer',email:'qa@example.test',phoneNumber:'0000000000',loyaltyPoints:320,addresses:[],preferences:{}};
  const script=await send('Page.addScriptToEvaluateOnNewDocument',{source:`
    const fixture=${JSON.stringify(fixture)};
    localStorage.setItem('userToken','qa-browser-fixture');localStorage.setItem('user',JSON.stringify(fixture));
    const realFetch=window.fetch.bind(window);let saved=[];
    window.fetch=async (url,options={})=>{
      const route=String(url);
      if(route.includes('/api/auth/user/profile'))return new Response(JSON.stringify(fixture),{headers:{'Content-Type':'application/json'}});
      if(route.includes('/api/auth/user/wishlist')){if(route.endsWith('/toggle')){const id=JSON.parse(options.body).productId;saved=saved.includes(id)?saved.filter(v=>v!==id):[...saved,id];}return new Response(JSON.stringify({success:true,wishlist:saved}),{headers:{'Content-Type':'application/json'}});}
      if(route.includes('/api/')&&!route.includes('/products')&&!route.includes('/gift-assistant'))return new Response(JSON.stringify([]),{headers:{'Content-Type':'application/json'}});
      return realFetch(url,options);
    };`});
  await nav('/account');await until('!!document.querySelector(".film-account-overview")');await shot('desktop-account-fixture');
  await size(390);await shot('mobile-account-fixture');
  check('Authenticated overview and actual rewards field rendered (fixture)',await evaluate('document.querySelector(".film-account-overview").textContent.includes("320 points")'));
  await nav('/');await until('document.querySelectorAll(".studio-product-card").length>0');
  await scene('#made-for-you','account-saved-before');await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.getAttribute("aria-label")==="Save to Wishlist").click()');await sleep(250);
  check('Authenticated wishlist API functional (fixture)',await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.getAttribute("aria-label")==="Save to Wishlist").getAttribute("aria-pressed")==="true"'));
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:script.identifier});await evaluate('localStorage.removeItem("userToken");localStorage.removeItem("user");true');
  await nav('/');await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await scene('#made-around-your-story','reduced-motion');
  check('Reduced motion remains usable',await evaluate('getComputedStyle(document.querySelector(".film-transformation")).animationName === "none"'));
  check('No runtime errors',report.errors.length===0,report.errors);
})().catch(error=>{report.errors.push(error.stack);console.error(error);process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));ws?.close();chrome.kill();});
