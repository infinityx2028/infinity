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
function check(name,passed,details) { report.checks.push({name,passed:!!passed,details}); console.log(`${passed?'PASS':'FAIL'} ${name}`); if(!passed)process.exitCode=1; }
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
  for (const [width,height] of [[390,844],[1440,900]]) {
    await size(width,height);await evaluate('window.scrollTo({top:0,behavior:"instant"})');await sleep(100);
    await evaluate(`window.__syncSamples=[];window.__syncListener=()=>window.__syncSamples.push({scroll:window.scrollY,frame:Number(document.querySelector('.memory-object-position').dataset.scrollSample)});window.addEventListener('scroll',window.__syncListener);true`);
    for(let step=1;step<=40;step++){await evaluate(`window.scrollTo({top:${step*10},behavior:'instant'})`);await sleep(20);}
    check(`Slow scroll synchronized at ${width}`,await evaluate('window.__syncSamples.length>10 && window.__syncSamples.every(s=>s.scroll===s.frame)'));
    for(const selector of ['#collections-section','#made-around-your-story','#start-creating','.film-hero']) {await evaluate(`document.querySelector('${selector}').scrollIntoView({behavior:'instant',block:'start'})`);await sleep(60);}
    check(`Fast scroll synchronized at ${width}`,await evaluate('window.__syncSamples.every(s=>s.scroll===s.frame)'));
    if(width===390){
      await send('Input.synthesizeScrollGesture',{x:300,y:650,yDistance:-250,speed:200,gestureSourceType:'touch'});
      await send('Input.synthesizeScrollGesture',{x:300,y:650,yDistance:-550,speed:1600,gestureSourceType:'touch'});
      await sleep(150);
      check('Native slow and fast touch gestures synchronized',await evaluate('window.__syncSamples.every(s=>s.scroll===s.frame)'));
    }
    const stopped=await evaluate('document.querySelector(".memory-object-position").style.transform');await sleep(400);
    check(`Frame stops with scroll at ${width}`,stopped===await evaluate('document.querySelector(".memory-object-position").style.transform'));
    check(`No independent frame drift at ${width}`,await evaluate('getComputedStyle(document.querySelector(".memory-frame-body")).animationName==="none"'));
    await evaluate('window.removeEventListener("scroll",window.__syncListener);true');await shot(`sync-${width}`);
  }
  for(const [width,height] of [[320,568],[360,800],[375,812],[390,844],[393,852],[412,915],[430,932],[768,900],[1024,900],[1280,900],[1366,900],[1440,900],[1728,900],[1920,900],[2560,900]]){
    await size(width,height);await evaluate('window.scrollTo({top:0,behavior:"instant"})');await sleep(200);
    const d=await evaluate('({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,hero:document.querySelector(".film-hero").getBoundingClientRect().height})');
    report.widths.push({width,...d});check(`No horizontal overflow at ${width}`,d.scroll<=d.client);
    if(width===390){check('Mobile hero 470–560px',d.hero>=470&&d.hero<=560);await shot('mobile-hero');}
  }
  await size(1440,900);
  for(const [selector,name] of [['#infinity-ai-concierge','ai'],['#collections-section','categories'],['#made-for-you','products'],['#made-around-your-story','story'],['.film-gift-feeling','gift-feeling'],['.film-one-photo','one-photo'],['.film-moments','moments'],['#infinity-difference','difference'],['#how-it-works','process'],['.film-founder','founder'],['#start-creating','final'],['footer','footer']])await scene(selector,`desktop-${name}`);
  check('Memory object remains mounted',await evaluate('window.__memory===document.querySelector(".memory-object-position")'));
  check('Desktop footer links expanded',await evaluate('Array.from(document.querySelectorAll(".film-footer-group")).every(group=>group.open)'));
  check('Desktop homepage preview limited to six',await evaluate('document.querySelectorAll(".studio-product-card").length<=6'));
  const desktopFinal=await evaluate('Number(document.querySelector(".memory-object-position").dataset.z)');
  await size(390);await sleep(150);
  check('Mobile homepage has no product grid',await evaluate('!document.querySelector(".studio-product-card")&&!document.querySelector("#made-for-you")'));
  check('Mobile category strip remains accessible',await evaluate('document.querySelectorAll(".motion-category-object").length>=4'));
  check('Mobile hero Shop CTA points to shop',await evaluate('document.querySelector(".film-hero .motion-button").getAttribute("href")==="/shop"'));
  for(const [selector,name] of [['#infinity-ai-concierge','ai'],['#collections-section','categories'],['#made-around-your-story','story'],['.film-gift-feeling','gift-feeling'],['.film-one-photo','one-photo'],['#infinity-difference','difference'],['#how-it-works','process'],['#start-creating','final'],['footer','footer']])await scene(selector,`mobile-${name}`);
  check('Dedicated mobile journey selected',await evaluate('document.querySelector(".memory-film").dataset.journey==="mobile"'));
  const ending=await evaluate('Number(document.querySelector(".memory-object-position").dataset.z)');
  check('Footer frame completely hidden',await evaluate('document.querySelector(".memory-object-position").style.opacity==="0"&&document.querySelector(".memory-object-position").style.visibility==="hidden"&&!document.querySelector("footer [data-memory-anchor]")'),{ending,desktopFinal});
  for(const [width,height] of [[320,568],[360,800],[375,812],[393,852],[412,915],[430,932]]) {
    await size(width,height);await sleep(100);
    const poses=[];
    for(const selector of ['.film-hero','#infinity-ai-concierge','#collections-section','#made-around-your-story','.film-one-photo','#how-it-works','#infinity-difference','#start-creating','footer']) {
      await evaluate(`document.querySelector('${selector}').scrollIntoView({behavior:'instant',block:'start'})`);await sleep(55);
      poses.push(await evaluate(`(()=>{const el=document.querySelector('.memory-object-position'),r=el.getBoundingClientRect();return {scene:el.dataset.scene,opacity:Number(el.style.opacity),left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width};})()`));
    }
    check(`Journey visibility map and safe bounds at ${width}x${height}`,poses.every(p=>['giftFeeling','onePhotoChapter','footer'].includes(p.scene)?p.opacity===0:p.scene==='categories'&&p.opacity<=.35||p.opacity>=.15&&p.left>=-2&&p.right<=width+2&&p.top>=60&&p.bottom<=height-50),poses);
  }
  await size(390,844);
  await scene('#infinity-ai-concierge','mobile-ai-before');
  await evaluate(`document.querySelector('.motion-ai-suggestions button').click()`);
  await until('document.querySelectorAll(".motion-recommendation").length>0');
  const prices=await evaluate('Array.from(document.querySelectorAll(".motion-recommendation>strong")).map(n=>Number(n.textContent.replace(/[^0-9.]/g,"")))');
  check('AI respects ₹800 budget',prices.every(p=>p<=800),prices);await shot('mobile-ai-results');
  await nav('/shop');await until('document.querySelectorAll(".studio-product-card").length>0');await shot('mobile-shop');
  const cards=await evaluate(`(()=>{const c=document.querySelector('.studio-product-card'),r=c.getBoundingClientRect();return {height:r.height,width:r.width,columns:getComputedStyle(c.parentElement).gridTemplateColumns,link:c.querySelector('.product-card-link').getAttribute('href'),customize:c.textContent.includes('CUSTOMIZE'),eye:getComputedStyle(c.querySelector('.product-card-quickview span')).display};})()`);
  check('Mobile shop cards compact and no large actions',cards.height>=220&&cards.height<=270&&!cards.customize&&cards.eye==='none',cards);
  check('Entire product card has a detail link',cards.link.startsWith('/product/')&&await evaluate('document.querySelector(".product-card-link").contains(document.querySelector(".product-card-price"))'));
  const productRoute=cards.link;
  const beforeSaved=await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.getAttribute("aria-label")==="Save to Wishlist").getAttribute("aria-pressed")');
  await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.getAttribute("aria-label")==="Save to Wishlist").click()');await sleep(150);
  check('Guest saved gift functional',await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.getAttribute("aria-label")==="Save to Wishlist").getAttribute("aria-pressed")')!==beforeSaved);
  await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.textContent.includes("Quick View")).click()');await sleep(300);await shot('mobile-quickview');
  check('Quick view fits mobile',await evaluate('document.documentElement.scrollWidth<=390'));
  for (const [width,height] of [[320,568],[360,800],[375,812],[390,844],[393,852],[412,915],[430,932]]) {
    await size(width,height);await sleep(150);
    const bounds=await evaluate(`(()=>{const panel=document.querySelector('.quickview-panel').getBoundingClientRect();const image=document.querySelector('.quickview-image').getBoundingClientRect();const button=document.querySelector('.quickview-actions button').getBoundingClientRect();return {width:panel.width,height:panel.height,image:image.height,left:panel.left,bottom:panel.bottom,cta:button.bottom,scroll:document.documentElement.scrollWidth};})()`);
    check(`Compact quick view at ${width}x${height}`,bounds.width<=Math.min(width-24,400)+1&&bounds.height<=Math.min(height*.80,720)+1&&bounds.image<=220&&bounds.cta<=height-11&&bounds.scroll<=width,bounds);
    await shot(`quickview-${width}x${height}`);
  }
  await size(390,844);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
  await evaluate('document.querySelector(".motion-menu-toggle").click()');await shot('mobile-menu');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
  await nav('/shop');await until('!!document.querySelector(".product-card-price")');
  await evaluate('document.querySelector(".product-card-price").scrollIntoView({block:"center",behavior:"instant"})');await sleep(100);
  const tap=await evaluate('(()=>{const r=document.querySelector(".product-card-price").getBoundingClientRect();return {x:r.left+30,y:r.top+r.height/2};})()');
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...tap});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...tap});await sleep(350);
  check('Tapping product price opens detail',await evaluate(`location.pathname===${JSON.stringify(productRoute)}`));
  check('Product page has no homepage frame',await evaluate('!document.querySelector(".memory-object-position")'));
  for(const route of ['/login','/signup','/account','/shop/magazines','/shop/not-a-category','/search?q=frame','/cart','/checkout',productRoute]){await nav(route);await shot('mobile'+route.replaceAll('/','-'));check(`${route} no overflow`,await evaluate('document.documentElement.scrollWidth<=390'));}
  await size(1440,900);for(const route of ['/login','/signup','/account','/shop','/cart','/checkout',productRoute]){await nav(route);await shot('desktop'+route.replaceAll('/','-'));}
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
  await nav('/shop');await until('document.querySelectorAll(".studio-product-card").length>0');
  await shot('account-saved-before');await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.getAttribute("aria-label")==="Save to Wishlist").click()');await sleep(250);
  check('Authenticated wishlist API functional (fixture)',await evaluate('Array.from(document.querySelectorAll(".studio-product-card button")).find(n=>n.getAttribute("aria-label")==="Save to Wishlist").getAttribute("aria-pressed")==="true"'));
  const liveProducts=await fetch('https://www.infinitycustomizations.com/api/products').then(r=>r.json());
  const cartItem={...liveProducts.find(p=>(p._id||p.id)===productRoute.split('/').at(-1)),quantity:1};
  await evaluate(`localStorage.setItem('cart',${JSON.stringify(JSON.stringify([cartItem]))});true`);
  await nav('/cart');await shot('mobile-cart-fixture');
  check('Cart with a selected gift fits mobile',await evaluate('document.documentElement.scrollWidth<=390&&!document.querySelector(".memory-object-position")'));
  await nav('/checkout');await shot('mobile-checkout-fixture');
  check('Authenticated checkout details visible (fixture)',await evaluate('document.querySelectorAll("input").length>=5&&!document.querySelector(".memory-object-position")'));
  await size(1440,900);await shot('desktop-checkout-fixture');
  await evaluate('localStorage.removeItem("cart");true');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:script.identifier});await evaluate('localStorage.removeItem("userToken");localStorage.removeItem("user");true');
  await nav('/');await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await scene('#made-around-your-story','reduced-motion');
  check('Reduced motion remains usable',await evaluate('getComputedStyle(document.querySelector(".film-transformation")).animationName === "none"'));
  check('No runtime errors',report.errors.length===0,report.errors);
})().catch(error=>{report.errors.push(error.stack);console.error(error);process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));ws?.close();chrome.kill();});
