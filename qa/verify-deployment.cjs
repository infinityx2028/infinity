const fs = require('node:fs');
const html = fs.readFileSync('frontend/dist/index.html','utf8');
const expected = [...html.matchAll(/(?:src|href)="(\/assets\/index-[^"]+)"/g)].map(match=>match[1]);
const revision = process.argv[2] || 'main';
(async()=>{
  const response=await fetch(`https://api.github.com/repos/infinityx2028/infinity/commits/${revision}/status`,{headers:{'User-Agent':'Infinity-frontend-verification'}});
  const status=await response.json();
  const report={expected, github:{http:response.status,sha:status.sha,state:status.state,statuses:status.statuses?.map(item=>({context:item.context,state:item.state,description:item.description,url:item.target_url}))},domains:[]};
  for (const domain of ['https://www.infinitycustomizations.com','https://i.infinitycustomizationz.com']) {
    try {
      const live=await fetch(domain+'/?verify='+Date.now(),{headers:{'Cache-Control':'no-cache'}});
      const content=await live.text();
      const assets=[...content.matchAll(/(?:src|href)="(\/assets\/index-[^"]+)"/g)].map(match=>match[1]);
      const matches=expected.length>0&&expected.every(asset=>assets.includes(asset));
      report.domains.push({domain,http:live.status,assets,matches});
      console.log(`${matches?'PASS':'NOT DEPLOYED'} ${domain}: ${assets.join(', ')}`);
    } catch(error) {report.domains.push({domain,error:error.message,matches:false});}
  }
  fs.writeFileSync('qa/deployment-verification.json',JSON.stringify(report,null,2));
  console.log('GitHub deployment status:',report.github.state);
  if(report.domains.some(domain=>!domain.matches))process.exitCode=1;
})().catch(error=>{console.error(error.message);process.exitCode=1;});
