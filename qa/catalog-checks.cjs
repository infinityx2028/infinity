const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { buildSync } = require('../frontend/node_modules/esbuild');
const bundled = buildSync({ entryPoints:['frontend/src/services/giftAssistantService.js'], bundle:true, platform:'node', format:'cjs', write:false }).outputFiles[0].text;
const context = { module:{exports:{}}, exports:{}, fetch, AbortController, setTimeout, clearTimeout, console };
context.exports=context.module.exports;
vm.runInNewContext(bundled,context);
const { extractIntent, rankCatalogDeterministically } = context.module.exports;
async function main() {
const catalog = fs.existsSync('qa/catalog.json') ? JSON.parse(fs.readFileSync('qa/catalog.json')) : await fetch('https://www.infinitycustomizations.com/api/products').then(response => { if (!response.ok) throw new Error('Catalog unavailable'); return response.json(); });
const intent = extractIntent('birthday gift for girlfriend under ₹1000 who loves photos');
assert.equal(intent.budgetMax,1000);
assert.equal(intent.recipient,'girlfriend');
assert.ok(intent.interests.includes('photos'));
assert.equal(rankCatalogDeterministically([],intent).products.length,0,'Empty catalog must stay empty');
assert.equal(rankCatalogDeterministically(catalog,{...intent,budgetMax:1}).products.length,0,'Never loosen a budget');
const ranked=rankCatalogDeterministically(catalog,intent).products;
assert.ok(ranked.length>0);
assert.ok(ranked.every(product=>Number(product.price)<=1000));
assert.ok(ranked.every(product=>catalog.some(real=>(real._id||real.id)===(product._id||product.id))));
const samples=[{id:'inactive',price:100,isActive:false},{id:'unavailable',price:100,inStock:false},{id:'missing-price'},{id:'valid',price:150}];
assert.deepEqual(Array.from(rankCatalogDeterministically(samples,{interests:[]}).products,p=>p.id),['valid']);
const bounded=rankCatalogDeterministically(catalog,{interests:[],budgetMin:300,budgetMax:500}).products;
assert.ok(bounded.every(product=>product.price>=300&&product.price<=500));
console.log('PASS intent, real catalog identity, hard budget bounds, empty catalog, inactive and unavailable gifts');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
