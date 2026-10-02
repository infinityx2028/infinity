const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

// Public, read-only deployment audit. No account, customer, or order requests.
(async () => {
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const html = fs.readFileSync('frontend/dist/index.html', 'utf8');
  const expected = [...html.matchAll(/(?:src|href)="(\/assets\/[^"\s]+)"/g)].map(m => m[1]);
  const response = await fetch(`https://api.github.com/repos/infinityx2028/infinity/commits/${sha}/status`);
  const github = await response.json();
  const domains = [];
  for (const domain of ['https://www.infinitycustomizations.com', 'https://i.infinitycustomizationz.com']) {
    const res = await fetch(`${domain}/?verification=${sha}`, { cache: 'no-store' });
    const content = await res.text();
    const assets = [...content.matchAll(/(?:src|href)="(\/assets\/[^"\s]+)"/g)].map(m => m[1]);
    domains.push({ domain, http: res.status, assets, matches: expected.every(asset => assets.includes(asset)) });
  }
  const report = {
    sha, expected,
    github: { http: response.status, state: github.state, statuses: github.statuses?.map(s => ({ context: s.context, state: s.state, description: s.description, url: s.target_url })) },
    domains,
  };
  fs.writeFileSync('qa/deployment-verification.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (github.state !== 'success' || domains.some(d => !d.matches)) process.exitCode = 1;
})().catch(error => { console.error(error.message); process.exitCode = 1; });
