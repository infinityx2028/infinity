// Vercel Serverless API Proxy
// Proxies all /api/* calls to Render with allowed origin headers to eliminate CORS issues
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const rawUrl = req.url || '';
    // Strip leading /api/ or /api
    const cleanSubPath = rawUrl.replace(/^\/api\/?/, '');
    const targetUrl = `https://infinity-customizations.onrender.com/api/${cleanSubPath}`;

    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      // Send the whitelisted origin so Render's CORS middleware allows all requests
      'Origin': 'https://infinitycustomizationss.vercel.app'
    };

    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }

    const fetchOptions = {
      method: req.method,
      headers
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const upstreamResponse = await fetch(targetUrl, fetchOptions);
    const contentType = upstreamResponse.headers.get('content-type') || 'application/json';
    const data = await upstreamResponse.text();

    res.status(upstreamResponse.status);
    res.setHeader('Content-Type', contentType);
    return res.send(data);
  } catch (err) {
    console.error('API Proxy error:', err);
    return res.status(502).json({ error: 'Proxy Gateway Error', message: err.message });
  }
}
