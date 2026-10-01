const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve('frontend/dist');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.webp':'image/webp', '.avif':'image/avif', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon' };
http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url,'http://127.0.0.1');
    if (url.pathname.startsWith('/api/')) {
      // QA proxy permits public catalog reads and gift recommendations only.
      if (req.method !== 'GET' && url.pathname !== '/api/gift-assistant') { res.writeHead(403);res.end();return; }
      const chunks=[];for await(const chunk of req)chunks.push(chunk);
      const response=await fetch('https://www.infinitycustomizations.com'+url.pathname+url.search,{method:req.method,headers:{'Content-Type':'application/json'},body:req.method==='GET'?undefined:Buffer.concat(chunks)});
      res.writeHead(response.status,{'Content-Type':response.headers.get('content-type')||'application/json'});res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    if (file!==root&&!file.startsWith(root+path.sep)) {res.writeHead(403);res.end();return;}
    if (!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.join(root,'index.html');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
  } catch {res.writeHead(502);res.end('QA proxy unavailable');}
}).listen(4173,'127.0.0.1',()=>console.log('Production build QA: http://127.0.0.1:4173'));
